import { Controller, Get, Post, Query } from '@nestjs/common';
import { CjService } from './cj.service';

@Controller('cj')
export class CjController {
  constructor(private readonly cjService: CjService) {}

  @Post('authentication')
  authenticate() {
    return this.cjService.getAccessToken();
  }

  @Get('categories')
  getCategories() {
    return this.cjService.getCategories();
  }

  @Get('product-count')
  async productCount() {
    const count = await this.cjService.getProductCount();
    return { count };
  }

  /**
   * Returns the latest sync metrics: last sync time, product counts,
   * status, errors, and API calls used.
   * This powers the admin dashboard sync health widget.
   */
  @Get('sync-status')
  async syncStatus() {
    return this.cjService.getSyncMetrics();
  }

  /**
   * Trigger a manual sync from the admin dashboard.
   * Runs asynchronously in the background — returns immediately.
   */
  @Post('sync-now')
  triggerSync() {
    this.cjService.runCatalogSync().catch(err => {
      console.error('[CJ] Manual sync failed:', err);
    });
    return { message: 'Catalog sync started in the background. Check /cj/sync-status for progress.' };
  }

  /**
   * Backwards-compatible crawl endpoint.
   * @deprecated Use POST /cj/sync-now instead.
   */
  @Post('crawl-keywords')
  crawlKeywords() {
    this.cjService.runCatalogSync().catch(err => {
      console.error('[CJ] Background crawl failed:', err);
    });
    return { message: 'Catalog sync started. Check /cj/sync-status for live progress.' };
  }

  // ── Legacy endpoints kept for admin panel compatibility ──────────────────

  @Get('products')
  getProducts() {
    return this.cjService.getProducts();
  }

  @Get('products/by-category')
  getProductsByCategory(
    @Query('categoryId') categoryId: string,
    @Query('pid') pid?: string,
  ) {
    return this.cjService.getProductsByCategory(categoryId, pid);
  }

  @Post('sync-all')
  async syncAll(@Query('categoryId') categoryId?: string) {
    const products = await this.cjService.getAllProducts(categoryId);
    return { total: products.length };
  }
}
