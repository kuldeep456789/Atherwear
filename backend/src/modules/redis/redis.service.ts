import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: RedisClientType;
  private connectPromise?: Promise<void>;
  private disabled = process.env.REDIS_ENABLED === 'false';

  constructor() {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379';

    this.client = createClient({ url });
    this.client.on('error', (error) => {
      this.disabled = true;
      this.logger.warn(`Redis unavailable: ${error.message}`);
    });
  }

  async getJson<T>(key: string): Promise<T | null> {
    if (!(await this.ensureConnected())) {
      return null;
    }

    const value = await this.client.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!(await this.ensureConnected())) {
      return;
    }

    const options: any = {};
    if (ttlSeconds !== undefined && ttlSeconds !== null) {
      options.EX = ttlSeconds;
    }

    await this.client.set(key, JSON.stringify(value), options);
  }

  async setnx(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    if (!(await this.ensureConnected())) {
      return false;
    }

    const result = await this.client.set(key, value, {
      NX: true,
      EX: ttlSeconds,
    });
    
    return result === 'OK';
  }

  async del(key: string): Promise<void> {
    if (!(await this.ensureConnected())) {
      return;
    }

    await this.client.del(key);
  }


  async delPattern(pattern: string): Promise<void> {
    if (!(await this.ensureConnected())) {
      return;
    }

    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }


  async keys(pattern: string): Promise<string[]> {
    if (!(await this.ensureConnected())) {
      return [];
    }

    return this.client.keys(pattern);
  }


  async rename(source: string, destination: string): Promise<void> {
    if (!(await this.ensureConnected())) {
      return;
    }

    try {
      await this.client.rename(source, destination);
    } catch {
      // Key doesn't exist — ignore
    }
  }


  async ttl(key: string): Promise<number> {
    if (!(await this.ensureConnected())) {
      return -2;
    }

    return this.client.ttl(key);
  }


  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (!(await this.ensureConnected())) {
      return;
    }

    await this.client.expire(key, ttlSeconds);
  }

  async onModuleDestroy() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  private async ensureConnected() {
    if (this.disabled) {
      return false;
    }

    if (this.client.isOpen) {
      return true;
    }

    this.connectPromise ??= this.client.connect().then(() => undefined);

    try {
      await this.connectPromise;
      return true;
    } catch {
      this.disabled = true;
      return false;
    }
  }
}
