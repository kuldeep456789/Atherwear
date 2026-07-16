import { config } from 'dotenv';
config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RedisService } from '../modules/redis/redis.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const redisService = app.get(RedisService);

  // await redisService.delPattern('*');
  console.log('Redis cache flushed.');

  await app.close();
}

bootstrap();
