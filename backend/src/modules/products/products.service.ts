import { BadRequestException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { CjService } from '../cj/cj.service';
import { RedisService } from '../redis/redis.service';
import { UsersService } from '../users/users.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Product } from './schemas/product.schema';
import { Review } from './schemas/review.schema';

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
  keyword?: string;
  [key: string]: string | undefined;
};

@Injectable()
export class ProductsService {
  private readonly productTtlSeconds = 60 * 60 * 6;
  private readonly inFlightRequests = new Map<string, Promise<any>>();

  constructor(
    private readonly cjService: CjService,
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
  ) { }

  async getProducts(query: ProductQuery = {}) {
    const cacheKey = this.buildCacheKey(query);
    const cached = await this.redisService.getJson(cacheKey);

    if (cached) {
      console.log(`[Products] Cache HIT ${cacheKey}`);
      return cached;
    }

    console.log(`[Products] Cache MISS ${cacheKey}`);

    const products = await this.runSingleFlight(cacheKey, () => this.getProductsFromMongoOrCj(query));

    const productCount = Array.isArray(products?.products)
      ? products.products.length
      : Array.isArray(products)
        ? products.length
        : 0;

    console.log(`[Products] CJ FETCH ${cacheKey} -> ${productCount} products`);

    await this.redisService.setJson(
      cacheKey,
      products,
      this.productTtlSeconds,
    );

    console.log(`[Products] Cache WRITE ${cacheKey} ttl=${this.productTtlSeconds}s`);

    return products;
  }

  async getProduct(id: string) {
    const cacheKey = `product:${id}`;
    const cached = await this.redisService.getJson<Record<string, any>>(cacheKey);

    let product: Record<string, any>;

    if (cached) {
      console.log(`[Product] Cache HIT ${cacheKey}`);
      product = cached;
    } else {
      console.log(`[Product] Cache MISS ${cacheKey}`);

      product = await this.runSingleFlight(cacheKey, async () => {
        console.log(`[Product] Fetching detail from CJ API ${id}`);
        const cjProduct = await this.cjService.getProductById(id);

        // Persist the enriched product back to MongoDB
        await this.productModel.updateOne(
          { pid: id },
          { $set: this.normalizeProductForStorage(cjProduct) },
          { upsert: true },
        );

        return cjProduct;
      });

      await this.redisService.setJson(cacheKey, product, this.productTtlSeconds);
      console.log(`[Product] Cache WRITE ${cacheKey} ttl=${this.productTtlSeconds}s`);
    }

    return this.withReviews(product, id);
  }

  async getRelatedProducts(id: string) {
    const cacheKey = `products:related:${id}`;
    const cached = await this.redisService.getJson<any[]>(cacheKey);

    if (cached) {
      console.log(`[Products] Cache HIT ${cacheKey}`);
      return { products: cached };
    }

    const currentProduct = await this.productModel.findOne({ pid: id }).lean().exec();

    if (!currentProduct) {
      // If the product isn't in DB, we can't find related based on category, 
      // just return some generic related items
      const generic = await this.productModel.find().limit(4).lean().exec();
      return { products: generic };
    }

    // Find products in same subcategory or category, excluding current product
    const related = await this.productModel.find({
      $and: [
        { pid: { $ne: id } },
        { 
          $or: [
            { subcategoryName: currentProduct.subcategoryName },
            { categoryId: currentProduct.categoryId },
          ]
        }
      ]
    }).limit(10).lean().exec();

    // Fetch ratings for related products
    const withRatings = await Promise.all(related.map(p => this.withReviews(p, p.pid)));
    
    // Sort by most reviewed/rated as a naive "best related" metric
    const sorted = withRatings.sort((a, b) => b.numReviews - a.numReviews).slice(0, 8);

    await this.redisService.setJson(cacheKey, sorted, 60 * 60); // 1 hr cache
    return { products: sorted };
  }

  /** Merge two image arrays, deduplicating and keeping CJ detail images first */
  private mergeImages(existing: string[], incoming: string[]): string[] {
    const all = [...incoming, ...existing].map((img) => {
      if (!img) return '';
      if (typeof img === 'string') return img;
      return (img as any).url || (img as any).src || '';
    }).filter(Boolean);
    return Array.from(new Set(all));
  }

  async createReview(id: string, token: string, dto: CreateReviewDto) {
    if (!dto.comment?.trim()) {
      throw new BadRequestException('comment is required');
    }

    if (!dto.rating || dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('rating must be between 1 and 5');
    }

    const user = await this.resolveUser(token);

    const review = await this.reviewModel.create({
      productId: id,
      rating: dto.rating,
      comment: dto.comment.trim(),
      userName: user.name || `${user.firstName} ${user.lastName}`.trim(),
    });

    return { review };
  }

  private async withReviews(product: Record<string, any>, id: string) {
    const reviews = await this.reviewModel.find({ productId: id }).sort({ createdAt: -1 }).exec();
    const numReviews = reviews.length;
    const averageRating =
      numReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / numReviews
        : product.averageRating ?? 0;

    return {
      ...product,
      reviews,
      numReviews,
      averageRating,
    };
  }

  private async resolveUser(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      return user;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private buildCacheKey(query: ProductQuery) {
    // Strip client-side filters from cache key — price/rating are applied on the frontend
    const IGNORE_PARAMS = new Set(['minPrice', 'maxPrice', 'minRating', 'pageNum', 'pageSize', 'page', 'limit']);
    const normalized = Object.entries(query)
      .filter(([key, value]) => Boolean(value) && !IGNORE_PARAMS.has(key))
      .map(([key, value]) => `${key}:${String(value).trim().toLowerCase()}`)
      .sort();

    return normalized.length > 0 ? `products:${normalized.join(':')}` : 'products:all';
  }

  private async getProductsFromMongoOrCj(query: ProductQuery) {
    let cjProducts: any;
    let fromCache = false;

    try {
      cjProducts = query.categoryId
        ? await this.cjService.getProductsByCategory(query.categoryId, query.pid, query)
        : await this.cjService.getProducts(query);
    } catch (err: any) {
      console.warn('[Products] CJ API failed, falling back to MongoDB:', err?.message ?? err);
      cjProducts = { products: await this.productModel.find().lean().exec() };
      fromCache = true;
    }

    const normalizedProducts = Array.isArray(cjProducts?.products) ? cjProducts.products : [];

    // collectionType filter
    const afterCollectionFilter = query.collectionType
      ? normalizedProducts.filter((product: Record<string, any>) =>
        String(product.collectionType ?? '').trim().toLowerCase() ===
        query.collectionType!.trim().toLowerCase(),
      )
      : normalizedProducts;

    // gender filter (HomePage sends gender:'men'/'women' — match against collectionType)
    const afterGenderFilter = query.gender
      ? afterCollectionFilter.filter((product: Record<string, any>) =>
        String(product.collectionType ?? product.gender ?? '').trim().toLowerCase() ===
        query.gender!.trim().toLowerCase(),
      )
      : afterCollectionFilter;

    const filteredProducts = query.subcategoryName
      ? afterGenderFilter.filter((product: Record<string, any>) =>
        this.matchesRequestedSubcategory(product, query.subcategoryName!),
      )
      : afterGenderFilter;

    if (!fromCache && filteredProducts.length > 0) {
      const operations = filteredProducts
        .filter((p: Record<string, any>) => String(p.pid ?? '').trim())
        .map((product: Record<string, any>) => ({
          updateOne: {
            filter: { pid: String(product.pid) },
            update: { $set: this.normalizeProductForStorage(product) },
            upsert: true,
          },
        }));

      if (operations.length > 0) {
        try {
          await this.productModel.bulkWrite(operations, { ordered: false });
        } catch (err: any) {
          // Log the error but don't propagate — products are already in Redis
          console.error('[Products] bulkWrite error (non-fatal):', err?.message ?? err);
        }
      }
    }

    return {
      ...cjProducts,
      products: filteredProducts,
      source: fromCache ? 'mongodb' : 'cj',
    };
  }

  private normalizeProductForStorage(product: Record<string, any>) {
    // Only store fields that exist in the Product schema
    // Never spread unknown CJ fields — that's what caused sku_1 duplicate key errors
    const pid = String(product.pid ?? product._id ?? product.id ?? '').trim();
    return {
      pid,
      productName: String(product.productName ?? product.name ?? product.title ?? ''),
      collectionType: String(product.collectionType ?? '').trim(),
      categoryId: String(product.categoryId ?? '').trim(),
      categoryName: String(product.categoryName ?? '').trim(),
      subcategoryId: String(product.subcategoryId ?? '').trim(),
      subcategoryName: String(product.subcategoryName ?? '').trim(),
      gender: String(product.gender ?? '').trim(),
      price: Number(product.price ?? 0) || 0,
      discountPrice: Number(product.discountPrice ?? 0) || 0,
      images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
      colors: Array.isArray(product.colors) ? product.colors.filter(Boolean) : [],
      sizes: Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [],
      variants: Array.isArray(product.variants) ? product.variants : [],
      tags: Array.isArray(product.tags) ? product.tags : [],
      description: String(product.description ?? ''),
      name: String(product.name ?? product.productName ?? ''),
      title: String(product.title ?? product.productName ?? product.name ?? ''),
    };
  }

  async syncAllProducts(categoryId?: string) {
    console.log(`[Products] Starting full sync...`);
    const cjProducts = await this.cjService.getAllProducts(categoryId);
    
    if (cjProducts.length > 0) {
      const operations = cjProducts
        .filter((p: Record<string, any>) => String(p.pid ?? '').trim())
        .map((product: Record<string, any>) => ({
          updateOne: {
            filter: { pid: String(product.pid ?? product._id ?? product.id) },
            update: { $set: this.normalizeProductForStorage(product) },
            upsert: true,
          },
        }));

      if (operations.length > 0) {
        try {
          await this.productModel.bulkWrite(operations, { ordered: false });
          console.log(`[Products] Sync complete. Upserted ${operations.length} products.`);
        } catch (err: any) {
          console.error('[Products] Sync bulkWrite error:', err?.message ?? err);
        }
      }
    }
    
    // Invalidate the all-products cache
    await this.redisService.del('products:all');
    console.log(`[Products] Sync finished. Found ${cjProducts.length} items from CJ API.`);
    return { synced: cjProducts.length };
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private matchesRequestedSubcategory(product: Record<string, any>, requestedSubcategory: string) {
    const normalizedRequest = requestedSubcategory.trim().toLowerCase();
    const text = [
      product?.subcategoryName,
      product?.categoryName,
      product?.title,
      product?.name,
      product?.description,
      ...(Array.isArray(product?.tags) ? product.tags : []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (!text) {
      return false;
    }

    const rules: Record<string, string[]> = {
      sunglasses: ['sunglass', 'sunglasses', 'shade', 'eyewear', 'eyeglass'],
      caps: ['cap', 'caps', 'hat', 'beanie'],
      wallets: ['wallet'],
      belts: ['belt'],
      bags: ['bag', 'backpack', 'handbag', 'sling'],
      jackets: ['jacket', 'hoodie', 'outerwear'],
      hoodies: ['hoodie', 'sweatshirt'],
      shirts: ['shirt', 'tee', 'tshirt', 't-shirt'],
      jeans: ['jean', 'denim', 'pant'],
      cargo: ['cargo'],
      shorts: ['short'],
      dresses: ['dress', 'skirt'],
      tops: ['top', 'blouse', 'shirt'],
      'co-ords': ['coord', 'co-ord', 'set', 'matching set'],
      oversized: ['oversized', 'loose fit', 'relaxed fit'],
      polo: ['polo'],
    };

    const tokens = rules[normalizedRequest] ?? [normalizedRequest];
    return tokens.some((token) => text.includes(token));
  }

  private runSingleFlight<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const existing = this.inFlightRequests.get(key);

    if (existing) {
      return existing as Promise<T>;
    }

    const request = factory()
      .finally(() => {
        this.inFlightRequests.delete(key);
      });

    this.inFlightRequests.set(key, request);
    return request;
  }
}
