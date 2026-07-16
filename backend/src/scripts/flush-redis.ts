import { config } from 'dotenv';
config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RedisService } from '../modules/redis/redis.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const redisService = app.get(RedisService);

  await redisService['client'].connect().catch(() => {});
  const keys = await redisService['client'].keys('products:*');
  for (const key of keys) {
    if (!key.includes('warehouse')) {
      await redisService['client'].del(key);
      console.log('Deleted cache key:', key);
    }
  }
  console.log('API cache flushed (kept warehouse data).');

  await app.close();
}

bootstrap();
