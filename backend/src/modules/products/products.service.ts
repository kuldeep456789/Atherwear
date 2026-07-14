import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CjService } from '../cj/cj.service';
import { RedisService } from '../redis/redis.service';
import { UsersService } from '../users/users.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './schemas/review.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SEARCH_KEYWORDS, BROAD_CATEGORY_KEYWORDS } from '../cj/keywords';

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

    const products = await this.runSingleFlight(cacheKey, () => this.fetchFromCj(query));

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

    if (cached) {
      console.log(`[Product] Cache HIT ${cacheKey}`);
      return this.withReviews(cached, id);
    }

    console.log(`[Product] Cache MISS ${cacheKey}`);

    const product = await this.runSingleFlight(cacheKey, async () => {
      console.log(`[Product] Fetching detail from CJ API ${id}`);
      return await this.cjService.getProductById(id);
    });

    await this.redisService.setJson(cacheKey, product, this.productTtlSeconds);
    console.log(`[Product] Cache WRITE ${cacheKey} ttl=${this.productTtlSeconds}s`);

    return this.withReviews(product, id);
  }

  async getRelatedProducts(id: string) {
    const cacheKey = `products:related:${id}`;
    const cached = await this.redisService.getJson<any[]>(cacheKey);

    if (cached) {
      console.log(`[Products] Cache HIT ${cacheKey}`);
      return { products: cached };
    }

    // Fetch from CJ API — get products in the same category
    try {
      const cjProduct = await this.cjService.getProductById(id);
      const categoryId = cjProduct?.categoryId;
      if (categoryId) {
        const related = await this.cjService.getProductsByCategory(categoryId, id);
        const products = Array.isArray(related?.products) ? related.products.slice(0, 8) : [];

        const withRatings = await Promise.all(products.map((p: any) => this.withReviews(p, p.pid || p._id)));

        await this.redisService.setJson(cacheKey, withRatings, 60 * 60);
        return { products: withRatings };
      }
    } catch (err: any) {
      console.warn(`[Products] Failed to fetch related for ${id}:`, err?.message ?? err);
    }

    return { products: [] };
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
    const IGNORE_PARAMS = new Set(['minPrice', 'maxPrice', 'minRating', 'pageNum', 'pageSize', 'page', 'limit']);
    const normalized = Object.entries(query)
      .filter(([key, value]) => Boolean(value) && !IGNORE_PARAMS.has(key))
      .map(([key, value]) => `${key}:${String(value).trim().toLowerCase()}`)
      .sort();

    return normalized.length > 0 ? `products:${normalized.join(':')}` : 'products:all';
  }

  private findBestKeyword(query: string): string | null {
    const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
    if (!normalized) return null;

    const allKeywords = [
      ...BROAD_CATEGORY_KEYWORDS,
      ...SEARCH_KEYWORDS.map(k => k.keyword),
    ];
    const uniqueKeywords = [...new Set(allKeywords)];

    const exact = uniqueKeywords.find(k => k.toLowerCase() === normalized);
    if (exact) return exact;

    const keywordContains = uniqueKeywords.find(k => k.toLowerCase().includes(normalized));
    if (keywordContains) return keywordContains;

    const queryContains = uniqueKeywords.find(k => normalized.includes(k.toLowerCase()));
    if (queryContains) return queryContains;

    const queryWords = normalized.split(' ');
    const wordMatch = uniqueKeywords.find(k => {
      const kwWords = k.toLowerCase().split(' ');
      return queryWords.some(qw => kwWords.some(kw => kw.includes(qw) || qw.includes(kw)));
    });
    if (wordMatch) return wordMatch;

    return null;
  }

  private async fetchFromCj(query: ProductQuery) {
    let cjProducts: any;
    let usedKeyword = false;

    try {
      if (query.q) {
        const normalizedQuery = query.q.toLowerCase().trim().replace(/\s+/g, ' ');
        const bestKeyword = this.findBestKeyword(normalizedQuery);
        if (bestKeyword) {
          const pageNum = Number(query.pageNum || query.page || 1);
          const pageSize = Math.min(Number(query.pageSize || query.limit || 100), 100);
          cjProducts = await this.cjService.searchProducts(bestKeyword, pageNum, pageSize);
          usedKeyword = true;
          console.log(`[Products] Keyword search: "${normalizedQuery}" -> matched keyword: "${bestKeyword}"`);
        } else {
          console.log(`[Products] No keyword match for "${normalizedQuery}", returning empty`);
          return { products: [], source: 'cj', query: normalizedQuery, noMatch: true };
        }
      } else if (query.categoryId) {
        cjProducts = await this.cjService.getProductsByCategory(query.categoryId, query.pid, query);
      } else {
        cjProducts = await this.cjService.getProducts(query);
      }
    } catch (err: any) {
      console.error('[Products] CJ API failed:', err?.message ?? err);
      return { products: [] };
    }

    if (!cjProducts) return { products: [] };

    const normalizedProducts = Array.isArray(cjProducts?.products) ? cjProducts.products : [];

    const afterCollectionFilter = query.collectionType
      ? normalizedProducts.filter((product: Record<string, any>) =>
        String(product.collectionType ?? '').trim().toLowerCase() ===
        query.collectionType!.trim().toLowerCase(),
      )
      : normalizedProducts;

    const afterGenderFilter = query.gender
      ? afterCollectionFilter.filter((product: Record<string, any>) =>
        String(product.collectionType ?? product.gender ?? '').trim().toLowerCase() ===
        query.gender!.trim().toLowerCase(),
      )
      : afterCollectionFilter;

    const afterSubcategoryFilter = query.subcategoryName
      ? afterGenderFilter.filter((product: Record<string, any>) =>
        this.matchesRequestedSubcategory(product, query.subcategoryName!),
      )
      : afterGenderFilter;

    const filteredProducts = query.q && !usedKeyword
      ? afterSubcategoryFilter.filter((product: Record<string, any>) => {
        const searchText = [
          product?.name,
          product?.title,
          product?.productName,
          product?.categoryName,
          product?.subcategoryName,
          product?.description,
          product?.collectionType,
          ...(Array.isArray(product?.tags) ? product.tags : []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        const searchTerms = String(query.q).toLowerCase().trim();
        return searchText.includes(searchTerms);
      })
      : afterSubcategoryFilter;

    return {
      ...cjProducts,
      products: filteredProducts,
      source: 'cj',
    };
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
