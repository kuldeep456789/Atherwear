import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CjService } from '../cj/cj.service';
import { RedisService } from '../redis/redis.service';
import { UsersService } from '../users/users.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './schemas/review.schema';
import { Order } from '../orders/schemas/order.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

type ProductQuery = {
  categoryId?: string;
  collectionType?: string;
  subcategoryName?: string;
  gender?: string;
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  colors?: string;
  sizes?: string;
  minRating?: string;
  sort?: string;
  pid?: string;
  page?: string;
  limit?: string;
  pageNum?: string;
  pageSize?: string;
  keyword?: string;
  [key: string]: string | undefined;
};

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly productTtlSeconds = 60 * 60 * 6;
  private readonly inFlightRequests = new Map<string, Promise<any>>();

  constructor(
    private readonly cjService: CjService,
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) { }

  async getProducts(query: ProductQuery = {}) {
    const cacheKey = this.buildCacheKey(query);
    const cached = await this.redisService.getJson(cacheKey);

    if (cached) {
      this.logger.log(`[Products] Cache HIT ${cacheKey}`);
      return cached;
    }

    this.logger.log(`[Products] Cache MISS ${cacheKey}`);

    const result = await this.runSingleFlight(cacheKey, () => this.fetchFromWarehouse(query));

    // Cache the result (short TTL — warehouse updates every 60 min anyway)
    await this.redisService.setJson(cacheKey, result, this.productTtlSeconds);
    this.logger.log(`[Products] Cache WRITE ${cacheKey} → ${result?.products?.length ?? 0} products`);

    return result;
  }
  async getProduct(id: string) {
    const cacheKey = `product:${id}`;
    const cached = await this.redisService.getJson<Record<string, any>>(cacheKey);

    if (cached) {
      this.logger.log(`[Product] Cache HIT ${cacheKey}`);
      return this.withReviews(cached, id);
    }

    this.logger.log(`[Product] Cache MISS ${cacheKey} — fetching from CJ API`);

    // Single product detail may still call CJ (it's a targeted per-PID request, not a list call)
    const product = await this.runSingleFlight(cacheKey, async () => {
      return await this.cjService.getProductById(id);
    });

    await this.redisService.setJson(cacheKey, product, this.productTtlSeconds);
    this.logger.log(`[Product] Cache WRITE ${cacheKey}`);

    return this.withReviews(product, id);
  }

  // ─── Public: related products ──────────────────────────────────────────────

  async getRelatedProducts(id: string) {
    const cacheKey = `products:related:${id}`;
    const cached = await this.redisService.getJson<any[]>(cacheKey);

    if (cached) {
      this.logger.log(`[Products] Related cache HIT ${cacheKey}`);
      return { products: cached };
    }

    // Try to find related products from the warehouse (no live CJ call)
    try {
      const cjProduct = await this.cjService.getProductById(id);
      const gender = String(cjProduct?._gender ?? cjProduct?.gender ?? cjProduct?.collectionType ?? '').toLowerCase() as 'men' | 'women' | 'all';
      const subcategoryName = cjProduct?._category ?? cjProduct?.subcategoryName ?? '';

      if (gender && subcategoryName) {
        const warehouseResult = await this.cjService.getWarehouseProducts(gender, 1, 12, undefined, subcategoryName);
        if (warehouseResult && warehouseResult.products.length > 0) {
          const products = warehouseResult.products
            .filter((p: any) => (p.pid || p.id) !== id)
            .slice(0, 8);

          const withRatings = await Promise.all(products.map((p: any) => this.withReviews(p, p.pid || p._id)));
          await this.redisService.setJson(cacheKey, withRatings, 60 * 60);
          return { products: withRatings };
        }
      }
    } catch (err: any) {
      this.logger.warn(`[Products] Failed to fetch related for ${id}: ${err?.message ?? err}`);
    }

    return { products: [] };
  }


  async createReview(id: string, token: string, dto: CreateReviewDto) {
    if (!dto.comment?.trim()) throw new BadRequestException('comment is required');
    if (!dto.rating || dto.rating < 1 || dto.rating > 5) throw new BadRequestException('rating must be between 1 and 5');

    const user = await this.resolveUser(token);

    // Verify user has purchased and received the product
    const hasOrdered = await this.orderModel.exists({
      userId: new Types.ObjectId(user.id),
      'items.productId': id,
      status: 'delivered'
    });

    if (!hasOrdered) {
      throw new BadRequestException('You can only review products you have purchased and received.');
    }

    const review = await this.reviewModel.create({
      productId: id,
      rating: dto.rating,
      comment: dto.comment.trim(),
      userName: user.name || `${user.firstName} ${user.lastName}`.trim(),
    });

    return { review };
  }


  private async fetchFromWarehouse(query: ProductQuery) {
    const gender = (query.gender ?? '').toLowerCase() as 'men' | 'women' | 'all' | '';
    const pageNum = Number(query.pageNum || query.page || 1);
    const pageSize = Number(query.pageSize || query.limit || 80);

    // ── Search query: filter warehouse in-memory ───────────────────────────
    if (query.q) {
      const searchTerm = query.q.toLowerCase().trim();
      const warehouseResult = await this.cjService.getWarehouseProducts(gender || 'all', 1, 10000);

      if (!warehouseResult || warehouseResult.products.length === 0) {
        this.logger.warn(`[Products] Warehouse empty — cannot serve search "${query.q}"`);
        return { products: [], total: 0, source: 'warehouse_empty' };
      }

      const matched = warehouseResult.products.filter((p: any) => {
        const text = [p.name, p.title, p.productName, p._category, p.subcategoryName, p.categoryName, ...(p.tags ?? [])].filter(Boolean).join(' ').toLowerCase();
        return text.includes(searchTerm);
      });

      const total = matched.length;
      const start = (pageNum - 1) * pageSize;
      return {
        products: matched.slice(start, start + pageSize),
        total,
        source: 'warehouse:search',
      };
    }

    // ── Category / gender listing: read from warehouse ─────────────────────
    const warehouseResult = await this.cjService.getWarehouseProducts(
      gender || 'all', pageNum, pageSize, query.categoryId, query.subcategoryName,
    );

    if (warehouseResult && warehouseResult.products.length > 0) {
      this.logger.log(`[Products] Warehouse HIT gender=${gender} sub=${query.subcategoryName ?? '-'} page=${pageNum} → ${warehouseResult.products.length}/${warehouseResult.total}`);
      return {
        products: warehouseResult.products,
        total: warehouseResult.total,
        source: 'warehouse',
      };
    }

    // ── Warehouse empty — do NOT fall back to CJ ───────────────────────────
    this.logger.warn(`[Products] Warehouse MISS gender=${gender} sub=${query.subcategoryName ?? '-'} — returning empty (no CJ fallback)`);
    return {
      products: [],
      total: 0,
      source: 'warehouse_empty',
      message: 'Products are syncing — please try again in a few minutes',
    };
  }

  // ─── Private: helpers ─────────────────────────────────────────────────────

  private async withReviews(product: Record<string, any>, id: string) {
    const reviews = await this.reviewModel.find({ productId: id }).sort({ createdAt: -1 }).exec();
    const numReviews = reviews.length;
    const averageRating = numReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
      : product.averageRating ?? 0;

    return { ...product, reviews, numReviews, averageRating };
  }

  private async resolveUser(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('User no longer exists');
      return user;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private buildCacheKey(query: ProductQuery) {
    const IGNORE_PARAMS = new Set(['minPrice', 'maxPrice', 'minRating']);
    const normalized = Object.entries(query)
      .filter(([key, value]) => Boolean(value) && !IGNORE_PARAMS.has(key))
      .map(([key, value]) => `${key}:${String(value).trim().toLowerCase()}`)
      .sort();

    return normalized.length > 0 ? `api:products:${normalized.join(':')}` : 'api:products:all';
  }

  private runSingleFlight<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const existing = this.inFlightRequests.get(key);
    if (existing) return existing as Promise<T>;

    const request = factory().finally(() => { this.inFlightRequests.delete(key); });
    this.inFlightRequests.set(key, request);
    return request;
  }
}
