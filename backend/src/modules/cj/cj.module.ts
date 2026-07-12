import { Module } from '@nestjs/common';
import { CjController } from './cj.controller';
import { CjService } from './cj.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [CjController],
  providers: [CjService],
  exports: [CjService],
})
export class CjModule {}
