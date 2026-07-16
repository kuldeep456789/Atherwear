import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CjService } from './cj.service';

@Injectable()
export class CjCronService {
  private readonly logger = new Logger(CjCronService.name);

  constructor(private readonly cjService: CjService) {}

  /**
   * Run every hour to sync products from CJ Dropshipping.
   * This ensures the warehouse cache (which has a 90 min TTL) is refreshed
   * successfully before it expires, ensuring zero downtime for users.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleDailyProductSync() {
    this.logger.log('Starting daily CJ Dropshipping product sync...');
    try {
      const allProducts = await this.cjService.crawlAllByKeywords();
      this.logger.log(`✅ Daily sync complete! Fetched ${allProducts?.length || 0} products.`);
    } catch (error: any) {
      this.logger.error('❌ Daily sync failed', error?.message || error);
    }
  }
}
