import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { RedisService } from '../redis/redis.service';
import { isHardBlocked, BLOCKED, getCategoryInfoById } from './category.mapper';
import { CLOTHING_CATEGORIES } from './collections';

const WAREHOUSE_KEY_MEN = 'products:men';
const WAREHOUSE_KEY_WOMEN = 'products:women';
const WAREHOUSE_KEY_ALL = 'products:all';

const WAREHOUSE_NEXT_MEN = 'products:next:men';
const WAREHOUSE_NEXT_WOMEN = 'products:next:women';
const WAREHOUSE_NEXT_ALL = 'products:next:all';

const categoryKey = (gender: string, cat: string) =>
  `products:${gender.toLowerCase()}:${cat.toLowerCase().replace(/[\s_'&-]+/g, '')}`;
const categoryNextKey = (gender: string, cat: string) =>
  `products:next:${gender.toLowerCase()}:${cat.toLowerCase().replace(/[\s_'&-]+/g, '')}`;

const SYNC_METRICS_KEY = 'cj:sync:metrics';

const WAREHOUSE_TTL = 90 * 60;

const PRODUCT_COUNT_CACHE_KEY = 'cj:product_count';
const PRODUCT_COUNT_TTL = 60 * 60 * 24;

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];
const DEFAULT_COLORS = ['Black'];

const EXCLUDED_CATEGORY_IDS = new Set([
  '2607130752441623600', '2607130905271619800', '2075876029409300482',
  '2046802660565475329', '2502151121241601900', '2043934021520044033',
  '2043944570651648002', '2043945824983830529', '2043943887814762497',
  '2043294797236301825', '2606121220391623700', '2075130484984541185',
  '2607151126551616100', '2607130811071611500', '2607080934161603700',
  '2607150846361621600',
]);

const EXCLUDED_PRODUCT_PIDS = new Set([
  '2607130752441623600', '2607130905271619800', '2075876029409300482',
  '2046802660565475329', '2502151121241601900', '2043934021520044033',
  '2043944570651648002', '2043945824983830529', '2043943887814762497',
  '2043294797236301825', '2606121220391623700', '2075130484984541185',
  '2607151126551616100', '2607130811071611500', '2607080934161603700',
  '2607150846361621600',
]);

export interface SyncMetrics {
  lastSyncTime: string | null;
  lastSyncDurationMs: number | null;
  productCount: number;
  menCount: number;
  womenCount: number;
  status: 'success' | 'failed' | 'running' | 'never';
  error: string | null;
  apiCallsUsed: number;
  nextSyncIn: string;
}


@Injectable()
export class CjService {
  private readonly logger = new Logger(CjService.name);
  private readonly baseUrl =
    process.env.CJ_API_BASE_URL ?? 'https://developers.cjdropshipping.com/api2.0';
  private readonly accessTokenCacheKey = 'cj:access_token';
  private readonly accessTokenTtlSeconds = 60 * 60 * 23;
  private readonly requestDelayMs = 1500;
  private accessTokenCache: { token: string; expiresAt: number } | null = null;
  private requestQueue: Promise<void> = Promise.resolve();
  private apiCallsThisSync = 0;

  constructor(private readonly redisService: RedisService) { }

  async getAccessToken() {
    const apiKey = process.env.CJ_API_KEY;
    const email = process.env.CJ_EMAIL;

    if (!apiKey) throw new InternalServerErrorException('CJ_API_KEY is not configured');
    if (!email) throw new InternalServerErrorException('CJ_EMAIL is not configured');

    this.logger.log('[CJ] POST /v1/authentication/getAccessToken');
    return this.scheduleRequest('/v1/authentication/getAccessToken', {
      method: 'POST',
      data: { email, password: apiKey },
    });
  }

  async getCategories() {
    const cacheKey = 'categories';
    const cached = await this.redisService.getJson<any>(cacheKey);
    if (cached) return cached;

    this.logger.log('[CJ] GET /v1/product/getCategory');
    const response = await this.scheduleRequest('/v1/product/getCategory', {
      method: 'GET',
      headers: await this.authHeaders(),
    });

    const normalized = this.normalizeCategoryResponse(response);
    await this.redisService.setJson(cacheKey, normalized, 60 * 60 * 24 * 7);
    return normalized;
  }

  async getProductById(pid: string) {
    if (!pid) throw new BadRequestException('product id is required');

    const cacheKey = `product:${pid}`;
    const cached = await this.redisService.getJson<any>(cacheKey);
    if (cached) return cached;

    const url = `/v1/product/list?pid=${pid}`;
    this.logger.log(`[CJ] GET ${url}`);
    const response = await this.scheduleRequest(url, {
      method: 'GET',
      headers: await this.authHeaders(),
    });

    if (response?.result === false) {
      throw new NotFoundException(`CJ API Error: ${response?.message || 'Product not found'}`);
    }

    const normalized = this.normalizeProductResponse(response);
    const product = normalized?.products?.[0] ?? null;

    if (!product) throw new NotFoundException('Product not found');

    try {
      const enriched = await this.enrichWithVariants(product, pid);
      await this.redisService.setJson(cacheKey, enriched, 60 * 60 * 24);
      return enriched;
    } catch (err: any) {
      this.logger.warn(`[CJ] Variant enrichment failed for ${pid}: ${err?.message ?? err}`);
    }

    await this.redisService.setJson(cacheKey, product, 60 * 60 * 24);
    return product;
  }

  async getProducts(query: Record<string, string | undefined> = {}) {
    const cacheKey = `cj:products:list:${JSON.stringify(query)}`;
    const cached = await this.redisService.getJson<any>(cacheKey);
    if (cached) return cached;

    const url = `/v1/product/list${this.buildSearch(query)}`;
    this.logger.log(`[CJ] GET ${url}`);
    const response = await this.scheduleRequest(url, {
      method: 'GET',
      headers: await this.authHeaders(),
    });

    const normalized = this.normalizeProductResponse(response, query);
    await this.redisService.setJson(cacheKey, normalized, 60 * 60 * 24);
    return normalized;
  }

  async getProductsByCategory(categoryId: string, pid?: string, query: Record<string, string | undefined> = {}) {
    if (!categoryId) throw new BadRequestException('categoryId query parameter is required');

    const cacheKey = `cj:products:cat:${categoryId}:pid:${pid || 'none'}:q:${JSON.stringify(query)}`;
    const cached = await this.redisService.getJson<any>(cacheKey);
    if (cached) return cached;

    const cjQuery = this.filterCjParams(query);
    const url = `/v1/product/list${this.buildSearch({ ...cjQuery, categoryId, ...(pid ? { pid } : {}) })}`;
    this.logger.log(`[CJ] GET ${url}`);
    const response = await this.scheduleRequest(url, {
      method: 'GET',
      headers: await this.authHeaders(),
    });

    const normalized = this.normalizeProductResponse(response, query);
    await this.redisService.setJson(cacheKey, normalized, 60 * 60 * 6);
    return normalized;
  }

  async getAllProducts(categoryId?: string) {
    const categories = categoryId ? [categoryId] : (await this.getCategories())?.categories?.map((c: any) => c.id).filter(Boolean) ?? [];
    const allProducts: any[] = [];

    for (const catId of categories) {
      let pageNum = 1;
      while (true) {
        try {
          const pageSize = 20;
          const url = `/v1/product/list${this.buildSearch({ categoryId: catId, pageNum: String(pageNum), pageSize: String(pageSize) })}`;
          this.logger.log(`[CJ] GET ${url}`);
          const response = await this.scheduleRequest(url, { method: 'GET', headers: await this.authHeaders() });
          const products = this.extractList(response);
          const normalized = this.normalizeProductResponse(response);
          allProducts.push(...(normalized.products || []));
          if (products.length < pageSize) break;
          if (pageNum * pageSize >= 2000) break;
          pageNum++;
        } catch (e: any) {
          this.logger.warn(`[CJ] Failed to fetch category ${catId} page ${pageNum}: ${e.message}`);
          break;
        }
      }
      if (allProducts.length >= 25000) break;
    }

    await this.saveProductCount(allProducts.length);
    return allProducts;
  }

  async searchProducts(keyword: string, pageNum = 1, pageSize = 100, hint?: any) {
    const query: Record<string, string> = {
      pageNum: String(pageNum),
      pageSize: String(pageSize),
      keyword,
      ...hint,
    };
    return this.getProducts(query);
  }
  async getWarehouseProducts(
    gender: 'men' | 'women' | 'all' | '' = 'all',
    pageNum = 1,
    pageSize = 80,
    categoryId?: string,
    subcategoryName?: string,
  ): Promise<{ products: any[]; total: number; warehouseHit: true } | null> {
    if (subcategoryName && gender && gender !== 'all') {
      const catKey = categoryKey(gender, subcategoryName);
      const catData = await this.redisService.getJson<any[]>(catKey);

      if (catData && Array.isArray(catData) && catData.length > 0) {
        const total = catData.length;
        const start = (pageNum - 1) * pageSize;
        const products = catData.slice(start, start + pageSize);
        this.logger.log(`[CJ] Warehouse cat-key HIT ${catKey} → ${products.length}/${total}`);
        return { products, total, warehouseHit: true };
      }
    }
    const key =
      gender === 'men' ? WAREHOUSE_KEY_MEN
        : gender === 'women' ? WAREHOUSE_KEY_WOMEN
          : WAREHOUSE_KEY_ALL;

    const warehouse = await this.redisService.getJson<any[]>(key);
    if (!warehouse || !Array.isArray(warehouse) || warehouse.length === 0) {
      return null;
    }

    let pool = warehouse;

    if (categoryId) {
      pool = pool.filter(p => String(p.categoryId ?? p.category ?? '') === categoryId);
    }

    if (subcategoryName) {
      const norm = subcategoryName.trim().toLowerCase();
      pool = pool.filter(p =>
        String(p.subcategoryName ?? p._category ?? p.category ?? '').trim().toLowerCase() === norm,
      );
    }

    const total = pool.length;
    const start = (pageNum - 1) * pageSize;
    const products = pool.slice(start, start + pageSize);

    this.logger.log(`[CJ] Warehouse READ gender=${gender} page=${pageNum} size=${pageSize} → ${products.length}/${total}`);
    return { products, total, warehouseHit: true };
  }
  async runCatalogSync(): Promise<{ success: boolean; count: number }> {
    const lockKey = 'cj:sync:lock';
    const locked = await this.redisService.setnx(lockKey, '1', 3600);
    if (!locked) {
      this.logger.warn('[Cron] Sync is already running (locked). Skipping.');
      return { success: false, count: 0 };
    }

    try {
      const syncStart = Date.now();
      this.apiCallsThisSync = 0;

      await this.saveSyncMetrics({ status: 'running', error: null, lastSyncTime: null, productCount: 0, menCount: 0, womenCount: 0, lastSyncDurationMs: null, apiCallsUsed: 0, nextSyncIn: '60 minutes' });

      this.logger.log('[Cron] ✅ Sync Started');

      const RETRY_DELAYS = [0, 30_000, 120_000];
      let lastError = '';
      let allProducts: any[] | null = null;

      for (let attempt = 0; attempt < RETRY_DELAYS.length; attempt++) {
        if (RETRY_DELAYS[attempt] > 0) {
          this.logger.warn(`[Cron] ⏳ Retrying sync in ${RETRY_DELAYS[attempt] / 1000}s (attempt ${attempt + 1})...`);
          await this.delay(RETRY_DELAYS[attempt]);
        }

        try {
          allProducts = await this.fetchCatalog();
          break; // success — exit retry loop
        } catch (e: any) {
          lastError = e?.message ?? String(e);
          this.logger.error(`[Cron] ❌ Sync attempt ${attempt + 1} failed: ${lastError}`);
        }
      }

      // ── All retries failed — keep existing cache ────────────────────────────
      if (!allProducts) {
        this.logger.error('[Cron] ❌ All sync attempts failed. Existing warehouse cache preserved.');
        await this.saveSyncMetrics({
          status: 'failed',
          error: lastError,
          lastSyncTime: new Date().toISOString(),
          productCount: 0,
          menCount: 0,
          womenCount: 0,
          lastSyncDurationMs: Date.now() - syncStart,
          apiCallsUsed: this.apiCallsThisSync,
          nextSyncIn: '60 minutes',
        });
        return { success: false, count: 0 };
      }

      if (allProducts.length < 50) {
        this.logger.warn(`[Cron] ⚠️ Fetch returned only ${allProducts.length} products — too few to be valid. Keeping existing cache.`);
        await this.saveSyncMetrics({
          status: 'failed',
          error: `Only ${allProducts.length} products returned — refusing to overwrite warehouse`,
          lastSyncTime: new Date().toISOString(),
          productCount: 0,
          menCount: 0,
          womenCount: 0,
          lastSyncDurationMs: Date.now() - syncStart,
          apiCallsUsed: this.apiCallsThisSync,
          nextSyncIn: '60 minutes',
        });
        return { success: false, count: allProducts.length };
      }

      // ── Double-buffer: write to :next keys, then swap ───────────────────────
      const menProducts = allProducts.filter(p => String(p._gender ?? '').toLowerCase() === 'men');
      const womenProducts = allProducts.filter(p => String(p._gender ?? '').toLowerCase() === 'women');

      this.logger.log(`[Cron] ✅ Products Fetched — Men: ${menProducts.length}, Women: ${womenProducts.length}, Total: ${allProducts.length}`);

      // Write to :next buffer
      await Promise.all([
        this.redisService.setJson(WAREHOUSE_NEXT_ALL, allProducts, WAREHOUSE_TTL),
        this.redisService.setJson(WAREHOUSE_NEXT_MEN, menProducts, WAREHOUSE_TTL),
        this.redisService.setJson(WAREHOUSE_NEXT_WOMEN, womenProducts, WAREHOUSE_TTL),
      ]);

      // Write per-category keys to :next buffer
      const categoryGroups = this.groupByCategory(allProducts);
      const catWriteOps: Promise<void>[] = [];
      for (const [catKey, catProducts] of Object.entries(categoryGroups)) {
        catWriteOps.push(this.redisService.setJson(`products:next:${catKey}`, catProducts, WAREHOUSE_TTL));
      }
      await Promise.all(catWriteOps);

      // Atomic swap: :next → :current
      await Promise.all([
        this.redisService.rename(WAREHOUSE_NEXT_ALL, WAREHOUSE_KEY_ALL),
        this.redisService.rename(WAREHOUSE_NEXT_MEN, WAREHOUSE_KEY_MEN),
        this.redisService.rename(WAREHOUSE_NEXT_WOMEN, WAREHOUSE_KEY_WOMEN),
      ]);

      // Swap per-category keys
      const catSwapOps: Promise<void>[] = [];
      for (const catKey of Object.keys(categoryGroups)) {
        catSwapOps.push(this.redisService.rename(`products:next:${catKey}`, `products:${catKey}`));
      }
      await Promise.all(catSwapOps);

      const durationMs = Date.now() - syncStart;
      this.logger.log(`[Cron] ✅ Redis Updated`);
      this.logger.log(`[Cron] ✅ Execution Time: ${(durationMs / 1000).toFixed(1)}s`);
      this.logger.log(`[Cron] ✅ API Calls Used: ~${this.apiCallsThisSync}`);
      this.logger.log(`[Cron] ✅ Sync Completed Successfully`);

      await this.saveProductCount(allProducts.length);
      await this.saveSyncMetrics({
        status: 'success',
        error: null,
        lastSyncTime: new Date().toISOString(),
        productCount: allProducts.length,
        menCount: menProducts.length,
        womenCount: womenProducts.length,
        lastSyncDurationMs: durationMs,
        apiCallsUsed: this.apiCallsThisSync,
        nextSyncIn: '60 minutes',
      });

      return { success: true, count: allProducts.length };
    } finally {
      await this.redisService.del(lockKey);
    }
  }

  /** Also expose the old name for backward compat (cj.controller.ts) */
  async crawlAllByKeywords() {
    const result = await this.runCatalogSync();
    return { length: result.count };
  }

  // ─── Public: sync metrics ─────────────────────────────────────────────────

  async getSyncMetrics(): Promise<SyncMetrics> {
    const metrics = await this.redisService.getJson<SyncMetrics>(SYNC_METRICS_KEY);
    return metrics ?? {
      status: 'never',
      error: null,
      lastSyncTime: null,
      productCount: 0,
      menCount: 0,
      womenCount: 0,
      lastSyncDurationMs: null,
      apiCallsUsed: 0,
      nextSyncIn: '60 minutes',
    };
  }

  async getProductCount(): Promise<number> {
    const cached = await this.redisService.getJson<number>(PRODUCT_COUNT_CACHE_KEY);
    return cached ?? 0;
  }

  // ─── Private: catalog fetch logic ─────────────────────────────────────────

  private async fetchCatalog(): Promise<any[]> {
    const allProducts: any[] = [];
    const seenPids = new Set<string>();

    this.logger.log(`[CJ] Fetching categories to discover category IDs...`);

    // 1 & 2. Map target categories directly from local CLOTHING_CATEGORIES
    const targetCategories: { categoryId: string; gender: string; categoryName: string }[] = [];

    for (const cat of CLOTHING_CATEGORIES.men) {
      targetCategories.push({ categoryId: cat.categoryId, gender: 'men', categoryName: cat.name });
    }

    for (const cat of CLOTHING_CATEGORIES.women) {
      targetCategories.push({ categoryId: cat.categoryId, gender: 'women', categoryName: cat.name });
    }

    const uniqueTargets = Array.from(new Map(targetCategories.map(item => [item.categoryId, item])).values());

    this.logger.log(`[CJ] Discovered ${uniqueTargets.length} target categories for sync.`);

    // 3. Fetch products for each targeted category
    for (const entry of uniqueTargets) {
      const { categoryId, gender, categoryName } = entry;
      let pageNum = 1;
      let consecutiveEmpty = 0;

      while (true) {
        const url = `/v1/product/list?categoryId=${categoryId}&pageNum=${pageNum}&pageSize=20`;
        let response;
        try {
          response = await this.scheduleRequest(url, { method: 'GET', headers: await this.authHeaders() });
          this.apiCallsThisSync++;
        } catch (err: any) {
          this.logger.warn(`[CJ] Failed to fetch products for category ${categoryId}: ${err?.message}`);
          break; // Skip this category if it fails completely
        }

        const normalized = this.normalizeProductResponse(response, { categoryId });
        const products: any[] = normalized?.products ?? [];

        if (products.length === 0) {
          consecutiveEmpty++;
          if (consecutiveEmpty >= 2 || pageNum > 5) break;
          pageNum++;
          continue;
        }

        consecutiveEmpty = 0;

        for (const product of products) {
          const pid = String(product?.pid || product?.id || '');
          if (!pid || seenPids.has(pid)) continue;
          seenPids.add(pid);
          if (isHardBlocked(product)) continue;

          allProducts.push({
            ...product,
            _gender: gender,
            _category: categoryName,
            _collectionType: gender,
          });
        }

        // Limit to 10 pages per category to avoid endless sync loops
        if (products.length < 100 || pageNum >= 10) break;
        pageNum++;
      }

      this.logger.log(`[CJ] Category ID ${categoryId} ("${categoryName}") → ${allProducts.length} products total so far`);
    }

    this.logger.log(`[CJ] Catalog fetch complete. Unique products: ${allProducts.length}`);
    return allProducts;
  }

  // ─── Private: group products by category → Redis key segment ──────────────

  private groupByCategory(products: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {};

    for (const p of products) {
      const gender = String(p._gender ?? '').toLowerCase();
      const catName = String(p._category ?? p.subcategoryName ?? p.category ?? 'other');
      const key = `${gender}:${catName.toLowerCase().replace(/[\s_'&-]+/g, '')}`;

      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }

    return groups;
  }

  // ─── Private: metrics helpers ─────────────────────────────────────────────

  private async saveSyncMetrics(metrics: SyncMetrics): Promise<void> {
    await this.redisService.setJson(SYNC_METRICS_KEY, metrics, 60 * 60 * 25); // 25h TTL
  }

  private async saveProductCount(count: number): Promise<void> {
    await this.redisService.setJson(PRODUCT_COUNT_CACHE_KEY, count, PRODUCT_COUNT_TTL);
  }

  // ─── Private: HTTP helpers ────────────────────────────────────────────────

  private async authHeaders() {
    const configuredToken = process.env.CJ_ACCESS_TOKEN;
    const token = configuredToken ?? (await this.getCachedAccessToken());
    return { 'CJ-Access-Token': token };
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
    const tokenCache = { token, expiresAt: now + this.accessTokenTtlSeconds * 1000 };
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

    if (!token) throw new InternalServerErrorException('CJ access token was not returned by authentication API');
    return token;
  }

  private async scheduleRequest(path: string, init: AxiosRequestConfig) {
    const run = async () => {
      await this.delay(this.requestDelayMs);
      return this.request(path, init);
    };

    const next = this.requestQueue.then(run, run);
    this.requestQueue = next.then(() => undefined, () => undefined);
    return next;
  }

  private async request(path: string, init: AxiosRequestConfig, attempt = 0): Promise<any> {
    try {
      this.logger.log(`[CJ] AXIOS ${String(init.method || 'GET').toUpperCase()} ${this.baseUrl}${path}`);
      const response = await axios.request({
        baseURL: this.baseUrl,
        url: path,
        ...init,
        headers: { 'Content-Type': 'application/json', ...init.headers },
      });
      const data = response.data;
      if (data && data.result === false) {
        throw new InternalServerErrorException(data.message || 'CJ Dropshipping API returned result: false');
      }
      return data;
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 429 && attempt < 5) {
        const baseDelay = 2000 * Math.pow(2, attempt);
        const jitter = Math.floor(Math.random() * 1000);
        const retryDelay = baseDelay + jitter;
        this.logger.warn(`[CJ] Rate limited — retrying in ${retryDelay}ms (attempt ${attempt + 1})`);
        await this.delay(retryDelay);
        return this.request(path, init, attempt + 1);
      }

      this.logger.error(`[CJ] AXIOS ERROR ${this.baseUrl}${path} → HTTP ${status}`);
      throw new InternalServerErrorException({
        message: 'CJ Dropshipping API request failed',
        status,
        response: error?.response?.data ?? null,
      });
    }
  }

  // ─── Private: normalisation helpers ──────────────────────────────────────

  private normalizeProductResponse(response: any, query?: Record<string, any>) {
    const products = this.extractList(response)
      .map((p: any) => this.normalizeProduct(p, query))
      .filter(Boolean);
    return { ...response, products };
  }

  private normalizeCategoryResponse(response: any) {
    const raw = this.extractList(response);
    const categories = this.flattenCategories(raw);
    return { ...response, categories };
  }

  private isBlocked(catName: string): boolean {
    const name = catName.toLowerCase().replace(/[\s_'&-]+/g, '');
    return BLOCKED.some(word => name.includes(word));
  }

  private flattenCategories(items: any[]): any[] {
    const results: any[] = [];

    const visit = (item: any, group: string, depth: number) => {
      if (!item || typeof item !== 'object') return;

      const catName = String(
        item.categoryName || item.categoryThirdName || item.categorySecondName || item.categoryFirstName || '',
      ).toLowerCase();

      if (catName && this.isBlocked(catName)) return;

      const childArrayKey = Object.keys(item).find(
        key => Array.isArray(item[key]) && item[key].length > 0 && typeof item[key][0] === 'object',
      );

      if (childArrayKey) {
        const branchId = item?.categorySecondId ?? item?.categoryFirstId;
        const branchName = item?.categorySecondName ?? item?.categoryFirstName;
        const nextGroup = group || item?.categoryFirstName || '';

        if (branchId && branchName) {
          results.push(this.normalizeCategory({ categoryId: branchId, categoryName: branchName }, nextGroup));
        }

        for (const child of item[childArrayKey]) visit(child, nextGroup, depth + 1);
        return;
      }

      if (catName) {
        results.push(this.normalizeCategory(item, group));
      }
    };

    for (const item of items) visit(item, '', 0);
    return results;
  }

  private normalizeCategory(category: any, group = '') {
    const id = category?.categoryId ?? category?.categoryThirdId ?? category?.categorySecondId ?? category?.categoryFirstId ?? category?._id ?? category?.id ?? '';
    const name = category?.categoryName ?? category?.categoryThirdName ?? category?.categorySecondName ?? category?.categoryFirstName ?? category?.name ?? '';
    return { ...category, _id: id, id, name, group };
  }

  private extractList(response: any) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
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

  private normalizeProduct(product: any, query?: Record<string, any>) {
    const categoryId = String(product?.categoryId ?? product?.category ?? '');
    if (EXCLUDED_CATEGORY_IDS.has(categoryId)) return null;

    const pid = String(
      product?.pid ?? product?.id ?? product?.productId ?? product?.productPid ?? product?.product_id ?? product?.productCode ?? '',
    );
    if (EXCLUDED_PRODUCT_PIDS.has(pid)) return null;

    let gender = product._gender || query?._gender;
    let subcategoryName = product._category || query?._category;
    let collectionType = product._collectionType || query?._collectionType;

    if (!gender || !subcategoryName) {
      const info = getCategoryInfoById(categoryId);
      if (!info) return null; // If category ID is totally unknown, reject the product
      gender = info.gender;
      subcategoryName = info.subcategoryName;
      collectionType = info.collectionType;
    }

    const images = [
      product?.productImage, product?.image, product?.img, product?.primaryImage,
      product?.mainImageUrl, product?.mainImage, product?.coverImage, product?.bigImage,
      product?.thumbnail, product?.thumbnailUrl, product?.imageUrl,
      ...(Array.isArray(product?.productImages) ? product.productImages : []),
      ...(Array.isArray(product?.images) ? product.images : []),
      ...(Array.isArray(product?.imageList) ? product.imageList : []),
      ...(Array.isArray(product?.imgList) ? product.imgList : []),
      ...(Array.isArray(product?.variantImages) ? product.variantImages : []),
      ...(Array.isArray(product?.productImageSet) ? product.productImageSet : []),
      ...(Array.isArray(product?.extraImages) ? product.extraImages : []),
    ].map(item => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      return item.url || item.image || item.src || '';
    }).filter(Boolean);

    const uniqueImages = Array.from(new Set(images));
    const name = product?.productNameEn ?? product?.productName ?? product?.nameEn ?? product?.name ?? '';
    const price = Number(product?.sellPrice ?? product?.price ?? 0) || 0;
    const sizes = Array.isArray(product?.sizes) && product.sizes.length ? product.sizes : DEFAULT_SIZES;
    const colors = Array.isArray(product?.colors) && product.colors.length ? product.colors : DEFAULT_COLORS;
    const variants = Array.isArray(product?.variants) && product.variants.length
      ? product.variants
      : colors.flatMap((color: string) => sizes.map((size: string) => ({ color, size, stock: 999 })));

    const categoryName = product?.categoryName ?? product?.categoryThirdName ?? product?.categorySecondName ?? product?.categoryFirstName ?? '';

    return {
      ...product,
      pid,
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
      collectionType: product?.collectionType ?? collectionType,
      tags: Array.isArray(product?.tags) ? product.tags : [],
      sizes,
      colors,
      variants,
      numReviews: 0,
      averageRating: 0,
      reviews: [],
    };
  }

  private async enrichWithVariants(product: any, pid: string): Promise<any> {
    const variantUrl = `/v1/product/variant/query?pid=${pid}`;
    this.logger.log(`[CJ] GET ${variantUrl}`);
    const variantResponse = await this.scheduleRequest(variantUrl, {
      method: 'GET',
      headers: await this.authHeaders(),
    });

    const rawVariants = Array.isArray(variantResponse?.data)
      ? variantResponse.data
      : Array.isArray(variantResponse) ? variantResponse : [];

    if (rawVariants.length === 0) return product;

    const colorSet = new Set<string>();
    const sizeSet = new Set<string>();
    const variantImages: string[] = [];
    const enrichedVariants: any[] = [];

    for (const v of rawVariants) {
      const parsed = this.parseVariantKey(v.variantKey || '');
      const color = parsed.color || v.variantNameEn || 'Default';
      const size = parsed.size || 'One Size';

      colorSet.add(color);
      sizeSet.add(size);
      if (v.variantImage) variantImages.push(v.variantImage);

      enrichedVariants.push({
        color, size,
        stock: v.inventories?.[0]?.totalInventory ?? (v as any).stock ?? 999,
        variantImage: v.variantImage || '',
        image: v.variantImage || '',
        price: v.variantSellPrice || product.price,
        vid: v.vid || '',
        variantKey: v.variantKey || '',
      });
    }

    const colors = Array.from(colorSet).filter(Boolean);
    const sizes = Array.from(sizeSet).filter(Boolean);
    const mergedImages = [...new Set([...variantImages, ...(product.images || [])])];

    return {
      ...product,
      colors: colors.length > 0 ? colors : product.colors,
      sizes: sizes.length > 0 ? sizes : product.sizes,
      variants: enrichedVariants.length > 0 ? enrichedVariants : product.variants,
      images: mergedImages,
    };
  }

  private readonly CJ_IGNORE_PARAMS = new Set([
    'minPrice', 'maxPrice', 'minRating', 'sort', 'colors', 'sizes',
    'q', 'collectionType', 'gender', 'subcategoryName',
  ]);

  private filterCjParams(query: Record<string, string | undefined>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
      if (value && !this.CJ_IGNORE_PARAMS.has(key)) result[key] = value;
    }
    return result;
  }

  private buildSearch(query: Record<string, string | undefined>) {
    const cjParams = this.filterCjParams(query);
    const search = new URLSearchParams(cjParams).toString();
    return search ? `?${search}` : '';
  }

  private parseVariantKey(variantKey: string): { color: string; size: string } {
    if (!variantKey) return { color: '', size: '' };
    const parts = variantKey.split('-');
    const sizePattern = /^(xs|s|m|l|xl|xxl|xxxl|\d{2,3})$/i;
    if (parts.length >= 2 && sizePattern.test(parts[parts.length - 1])) {
      const size = parts.pop()!;
      return { color: parts.join('-'), size: size.toUpperCase() };
    }
    if (parts.length === 2) return { color: parts[0], size: parts[1].toUpperCase() };
    return { color: variantKey, size: '' };
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
