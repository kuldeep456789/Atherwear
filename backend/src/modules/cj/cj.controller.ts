import { Controller, Get, Post, Query } from '@nestjs/common';
import { CjService } from './cj.service';

@Controller('cj')
export class CjController {
  constructor(private readonly cjService: CjService) {}

  @Post('authentication')
  authenticate() {
    return this.cjService.getAccessToken();
  }

  @Get('products')
  getProducts() {
    return this.cjService.getProducts();
  }

  @Get('categories')
  getCategories() {
    return this.cjService.getCategories();
  }

  @Get('products/by-category')
  getProductsByCategory(
    @Query('categoryId') categoryId: string,
    @Query('pid') pid?: string,
  ) {
    return this.cjService.getProductsByCategory(categoryId, pid);
  }

  @Get('product-count')
  async productCount() {
    const count = await this.cjService.getProductCount();
    return { count };
  }

  @Post('sync-all')
  async syncAll(@Query('categoryId') categoryId?: string) {
    const products = await this.cjService.getAllProducts(categoryId);
    return { total: products.length, products };
  }

  @Post('crawl-keywords')
  crawlKeywords() {
    // Run asynchronously in the background so the request doesn't hang
    this.cjService.crawlAllByKeywords().catch(err => {
      console.error('[CJ] Background crawl failed:', err);
    });
    return { message: 'Keyword crawl started in the background. Check backend terminal for progress and Navbar for the live count.' };
  }
}
