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
}
