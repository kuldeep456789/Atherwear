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

  async setJson<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (!(await this.ensureConnected())) {
      return;
    }

    await this.client.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  }

  async del(key: string): Promise<void> {
    if (!(await this.ensureConnected())) {
      return;
    }

    await this.client.del(key);
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
