import { Module } from '@nestjs/common';
import { CjController } from './cj.controller';
import { CjService } from './cj.service';
import { CjCronService } from './cj.cron.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [CjController],
  providers: [CjService, CjCronService],
  exports: [CjService],
})
export class CjModule {}
