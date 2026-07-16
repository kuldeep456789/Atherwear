import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CjService } from './cj.service';

@Injectable()
export class CjCronService {
  private readonly logger = new Logger(CjCronService.name);

  constructor(private readonly cjService: CjService) {}

  /**
   * Run every hour to sync the product catalog from CJ Dropshipping.
   *
   * Uses the new runCatalogSync() which:
   * - Fetches ~26 category-targeted keywords (≈130 API calls vs thousands before)
   * - Writes to :next Redis keys first (double-buffer)
   * - Atomically swaps :next → :current only after validation
   * - Retries up to 3 times (0s, 30s, 2m) before giving up
   * - Preserves existing cache if all retries fail
   * - Writes sync metrics to Redis for admin dashboard visibility
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleCatalogSync() {
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.log('[Cron] CJ Catalog Sync — Starting');
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      const result = await this.cjService.runCatalogSync();

      if (result.success) {
        this.logger.log(`[Cron] ✅ Sync SUCCESS — ${result.count} products in warehouse`);
      } else {
        this.logger.warn(`[Cron] ⚠️  Sync INCOMPLETE — only ${result.count} products. Existing cache preserved.`);
      }
    } catch (error: any) {
      this.logger.error('[Cron] ❌ Sync threw an unexpected error', error?.message || error);
    }

    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
}
