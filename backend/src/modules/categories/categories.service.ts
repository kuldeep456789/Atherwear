import { Injectable } from '@nestjs/common';
import { CjService } from '../cj/cj.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CategoriesService {
  private readonly cacheKey = 'cj:categories';
  private readonly ttlSeconds = 60 * 60 * 24;

  constructor(
    private readonly cjService: CjService,
    private readonly redisService: RedisService,
  ) {}

  async getCategories() {
    const cached = await this.redisService.getJson(this.cacheKey);

    if (cached) {
      return cached;
    }

    const categories = await this.cjService.getCategories();
    await this.redisService.setJson(this.cacheKey, categories, this.ttlSeconds);

    return categories;
  }
}
