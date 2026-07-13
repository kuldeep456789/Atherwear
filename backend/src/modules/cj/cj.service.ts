import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { RedisService } from '../redis/redis.service';
import { isProductAllowed, isCategoryAllowed, BLOCKED } from './category.mapper';

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];
const DEFAULT_COLORS = ['Black'];

@Injectable()
export class CjService {
  private readonly baseUrl =
    process.env.CJ_API_BASE_URL ??
    'https://developers.cjdropshipping.com/api2.0';
  private readonly accessTokenCacheKey = 'cj:access_token';
  private readonly accessTokenTtlSeconds = 60 * 60 * 23;
  private readonly requestDelayMs = 250;
  private accessTokenCache: { token: string; expiresAt: number } | null = null;
  private requestQueue: Promise<void> = Promise.resolve();

  constructor(private readonly redisService: RedisService) { }

  async getAccessToken() {
    const apiKey = process.env.CJ_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('CJ_API_KEY is not configured');
    }
    console.log('[CJ] POST /v1/authentication/getAccessToken');
    return this.scheduleRequest('/v1/authentication/getAccessToken', {
      method: 'POST',
      data: { apiKey },
    });
  }

  async getProducts(query: Record<string, string | undefined> = {}) {
    const url = `/v1/product/list${this.buildSearch(query)}`;
    console.log(`[CJ] GET ${url}`);
    const response = await this.scheduleRequest(url, {
      method: 'GET',
      headers: await this.authHeaders(),
    });

    return this.normalizeProductResponse(response);
  }

  async getAllProducts(categoryId?: string) {
    let targetCategoryIds: string[] = [];
    const allProducts: any[] = [];

    if (categoryId) {
      targetCategoryIds = [categoryId];
    } else {
      console.log(`[CJ] Fetching allowed categories to sync...`);
      const catsResponse = await this.getCategories();
      const leaves = catsResponse?.categories || [];
      // We already filtered leaves in flattenCategories, so these are only allowed ones.
      targetCategoryIds = leaves.map((c: any) => c.categoryId).filter(Boolean);
    }

    console.log(`[CJ] Fetching products for ${targetCategoryIds.length} allowed categories...`);

    for (const catId of targetCategoryIds) {
      let pageNum = 1;
      const pageSize = 50;

      while (true) {
        const query: Record<string, string> = {
          pageNum: String(pageNum),
          pageSize: String(pageSize),
          categoryId: catId,
        };

        try {
          const response = await this.getProducts(query);
          const products = response?.products || [];

          if (products.length === 0) break;

          allProducts.push(...products);
          console.log(`[CJ] Fetched page ${pageNum} for category ${catId} (${products.length} items). Total so far: ${allProducts.length}`);

          if (products.length < pageSize) break;

          // Safety break per category
          if (pageNum * pageSize >= 1000) { // Limit to 1000 items per category
            break;
          }

          pageNum++;
        } catch (e: any) {
          console.warn(`[CJ] Failed to fetch category ${catId} page ${pageNum}:`, e.message);
          break;
        }
      }

      // Stop overall fetching if we reach a reasonable limit
      if (allProducts.length >= 10000) {
        console.warn(`[CJ] Hit 10000 products safety limit for getAllProducts`);
        break;
      }
    }

    console.log(`[CJ] Finished fetching products. Total: ${allProducts.length}`);
    return allProducts;
  }

  async getCategories() {
    console.log('[CJ] GET /v1/product/getCategory');
    const response = await this.scheduleRequest('/v1/product/getCategory', {
      method: 'GET',
      headers: await this.authHeaders(),
    });

    return this.normalizeCategoryResponse(response);
  }

  async getProductsByCategory(categoryId: string, pid?: string, query: Record<string, string | undefined> = {}) {
    if (!categoryId) {
      throw new BadRequestException('categoryId query parameter is required');
    }

    // Only forward CJ-relevant params (same filtering as buildSearch)
    const cjQuery = this.filterCjParams(query);
    const searchParams = new URLSearchParams({ categoryId, ...cjQuery });

    if (pid) {
      searchParams.set('pid', pid);
    }

    const url = `/v1/product/list?${searchParams.toString()}`;
    console.log(`[CJ] GET ${url}`);
    const response = await this.scheduleRequest(url, {
      method: 'GET',
      headers: await this.authHeaders(),
    });

    return this.normalizeProductResponse(response);
  }

  async getProductById(pid: string) {
    if (!pid) {
      throw new BadRequestException('product id is required');
    }

    const url = `/v1/product/list?pid=${pid}`;
    console.log(`[CJ] GET ${url}`);
    const response = await this.scheduleRequest(url, {
      method: 'GET',
      headers: await this.authHeaders(),
    });

    if (response?.result === false || (response?.code && response.code !== 200 && response.code !== '200')) {
      throw new NotFoundException(`CJ API Error: ${response?.message || 'Product not found'}`);
    }

    const normalized = this.normalizeProductResponse(response);
    const product = normalized?.products?.[0] ?? null;

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private readonly CJ_IGNORE_PARAMS = new Set(['minPrice', 'maxPrice', 'minRating', 'sort', 'colors', 'sizes', 'q', 'keyword', 'collectionType', 'gender', 'subcategoryName']);
  private readonly CJ_PARAM_MAP: Record<string, string> = {};

  private filterCjParams(query: Record<string, string | undefined>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
      if (value && !this.CJ_IGNORE_PARAMS.has(key)) {
        const cjKey = this.CJ_PARAM_MAP[key] ?? key;
        result[cjKey] = value;
      }
    }
    return result;
  }

  private buildSearch(query: Record<string, string | undefined>) {
    const cjParams = this.filterCjParams(query);
    const searchParams = new URLSearchParams(cjParams);
    const search = searchParams.toString();
    return search ? `?${search}` : '';
  }

  private async authHeaders() {
    const configuredToken = process.env.CJ_ACCESS_TOKEN;
    const token =
      configuredToken ??
      (await this.getCachedAccessToken());

    return {
      'CJ-Access-Token': token,
    };
  }

  private async getCachedAccessToken() {
    const now = Date.now();

    if (this.accessTokenCache && this.accessTokenCache.expiresAt > now) {
      return this.accessTokenCache.token;
    }

    const cached = await this.redisService.getJson<{ token: string; expiresAt: number }>(
      this.accessTokenCacheKey,
    );

    if (cached && cached.token && cached.expiresAt > now) {
      this.accessTokenCache = cached;
      return cached.token;
    }

    const token = await this.resolveAccessToken();
    const tokenCache = {
      token,
      // CJ token TTL is not exposed here, so keep a conservative shared cache.
      expiresAt: now + this.accessTokenTtlSeconds * 1000,
    };

    this.accessTokenCache = tokenCache;
    await this.redisService.setJson(this.accessTokenCacheKey, tokenCache, this.accessTokenTtlSeconds);

    return token;
  }

  private async resolveAccessToken() {
    const response = await this.getAccessToken();
    const token =
      response?.data?.accessToken ??
      response?.data?.access_token ??
      response?.accessToken ??
      response?.access_token;

    if (!token) {
      throw new InternalServerErrorException(
        'CJ access token was not returned by authentication API',
      );
    }

    return token;
  }

  private async scheduleRequest(path: string, init: AxiosRequestConfig) {
    const run = async () => {
      await this.delay(this.requestDelayMs);
      return this.request(path, init);
    };

    const next = this.requestQueue.then(run, run);
    this.requestQueue = next.then(
      () => undefined,
      () => undefined,
    );

    return next;
  }

  private async request(path: string, init: AxiosRequestConfig, attempt = 0) {
    try {
      console.log(`[CJ] AXIOS ${String(init.method || 'GET').toUpperCase()} ${this.baseUrl}${path}`);
      const response = await axios.request({
        baseURL: this.baseUrl,
        url: path,
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init.headers,
        },
      });

      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 429 && attempt < 3) {
        const retryDelay = 1000 * Math.pow(2, attempt);
        console.warn('[CJ] RATE LIMITED, retrying', {
          url: `${this.baseUrl}${path}`,
          attempt: attempt + 1,
          retryDelay,
        });

        await this.delay(retryDelay);
        return this.request(path, init, attempt + 1);
      }

      console.error('[CJ] AXIOS ERROR', {
        url: `${this.baseUrl}${path}`,
        status,
      });
      throw new InternalServerErrorException({
        message: 'CJ Dropshipping API request failed',
        status,
        response: error?.response?.data ?? null,
      });
    }
  }

  private normalizeProductResponse(response: any) {
    const products = this.extractList(response)
      .map((product: any) => this.normalizeProduct(product))
      .filter(Boolean);

    return {
      ...response,
      products,
    };
  }

  private normalizeCategoryResponse(response: any) {
    const raw = this.extractList(response);
    const categories = this.flattenCategories(raw);

    return {
      ...response,
      categories,
    };
  }

  // CJ's category API returns
  private isBlocked(catName: string): boolean {
    const name = catName.toLowerCase().replace(/[\s_'&-]+/g, '');
    return BLOCKED.some(word => name.includes(word));
  }

  private flattenCategories(items: any[]): any[] {
    const results: any[] = [];

    const visit = (item: any, group: string, depth: number) => {
      if (!item || typeof item !== 'object') {
        return;
      }

      const catName = String(
        item.categoryName ||
        item.categoryThirdName ||
        item.categorySecondName ||
        item.categoryFirstName ||
        ''
      ).toLowerCase();

      // Always prune blocked branches (e.g. Pet Supplies, Jewelry) at any depth
      if (catName && this.isBlocked(catName)) {
        return;
      }

      // At top level only, also prune non-allowed categories (e.g. Consumer Electronics)
      if (depth === 0 && catName && !isCategoryAllowed(catName)) {
        return;
      }

      const childArrayKey = Object.keys(item).find(
        (key) => Array.isArray(item[key]) && item[key].length > 0 && typeof item[key][0] === 'object',
      );

      if (childArrayKey) {
        const branchId = item?.categorySecondId ?? item?.categoryFirstId;
        const branchName = item?.categorySecondName ?? item?.categoryFirstName;
        const nextGroup = group || item?.categoryFirstName || '';

        // Register second-level (and top-level, when it has no second-level id)
        // categories as their own selectable entries alongside their leaves.
        if (branchId && branchName && isCategoryAllowed(branchName)) {
          results.push(
            this.normalizeCategory({ categoryId: branchId, categoryName: branchName }, nextGroup),
          );
        }

        for (const child of item[childArrayKey]) {
          visit(child, nextGroup, depth + 1);
        }
        return;
      }

      // Leaf category — include only if it matches the allow list
      if (catName && isCategoryAllowed(catName)) {
        results.push(this.normalizeCategory(item, group));
      }
    };

    for (const item of items) {
      visit(item, '', 0);
    }

    return results;
  }

  private normalizeCategory(category: any, group = '') {
    const id =
      category?.categoryId ??
      category?.categoryThirdId ??
      category?.categorySecondId ??
      category?.categoryFirstId ??
      category?._id ??
      category?.id ??
      '';
    const name =
      category?.categoryName ??
      category?.categoryThirdName ??
      category?.categorySecondName ??
      category?.categoryFirstName ??
      category?.name ??
      '';

    return {
      ...category,
      _id: id,
      id,
      name,
      group,
    };
  }

  private extractList(response: any) {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return (
      response?.data?.list ??
      response?.data?.products ??
      response?.data?.records ??
      response?.data?.result ??
      response?.data?.data ??
      response?.products ??
      response?.records ??
      response?.list ??
      []
    );
  }

  private normalizeProduct(product: any) {
    const check = isProductAllowed(product);
    if (!check.allowed) {
      return null;
    }
    const { gender, subcategoryName, collectionType } = check;

    const images = [
      product?.productImage,
      product?.image,
      product?.img,
      product?.primaryImage,
      product?.mainImageUrl,
      product?.mainImage,
      product?.coverImage,
      product?.bigImage,
      product?.thumbnail,
      product?.thumbnailUrl,
      product?.imageUrl,
      ...(Array.isArray(product?.productImages) ? product.productImages : []),
      ...(Array.isArray(product?.images) ? product.images : []),
      ...(Array.isArray(product?.imageList) ? product.imageList : []),
      ...(Array.isArray(product?.imgList) ? product.imgList : []),
      ...(Array.isArray(product?.variantImages) ? product.variantImages : []),
      ...(Array.isArray(product?.extraImages) ? product.extraImages : [])
    ]
      .map((item) => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        return item.url || item.image || item.src || '';
      })
      .filter(Boolean);

    const uniqueImages = Array.from(new Set(images));
    const pid = String(
      product?.pid ??
      product?.id ??
      product?.productId ??
      product?.productPid ??
      product?.product_id ??
      product?.productCode ??
      ''
    );
    const name =
      product?.productNameEn ??
      product?.productName ??
      product?.nameEn ??
      product?.name ??
      '';
    const price = Number(product?.sellPrice ?? product?.price ?? 0) || 0;

    // CJ's list/search response has no size/color/variant breakdown, so we
    // synthesize a default variant set the storefront's size/color pickers can use.
    const sizes = Array.isArray(product?.sizes) && product.sizes.length ? product.sizes : DEFAULT_SIZES;
    const colors = Array.isArray(product?.colors) && product.colors.length ? product.colors : DEFAULT_COLORS;
    const variants =
      Array.isArray(product?.variants) && product.variants.length
        ? product.variants
        : colors.flatMap((color: string) => sizes.map((size: string) => ({ color, size, stock: 999 })));
    const categoryId = product?.categoryId ?? product?.category ?? '';
    const categoryName =
      product?.categoryName ??
      product?.categoryThirdName ??
      product?.categorySecondName ??
      product?.categoryFirstName ??
      '';

    return {
      ...product,

      // Store CJ product id separately
      pid,

      // Do NOT overwrite MongoDB's _id
      name,
      title: name,

      productName: name,

      price,

      images: uniqueImages,

      categoryId,

      categoryName,

      subcategoryName,

      gender,

      category: categoryName || categoryId,

      collectionType:
        product?.collectionType ??
        collectionType,

      tags: Array.isArray(product?.tags)
        ? product.tags
        : [],

      sizes,

      colors,

      variants,

      numReviews: 0,

      averageRating: 0,

      reviews: [],
    };
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
