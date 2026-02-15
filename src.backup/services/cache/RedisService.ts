import Redis from 'ioredis';
import { promisify } from 'util';

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export class RedisService {
  private client: Redis;
  private subscriber: Redis;

  constructor(config: RedisConfig) {
    this.client = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.subscriber = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
    });

    this.client.on('error', (error) => {
      console.error('Redis Client Error:', error);
    });

    this.subscriber.on('error', (error) => {
      console.error('Redis Subscriber Error:', error);
    });
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await this.client.setex(key, ttl, serializedValue);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async increment(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async decrement(key: string): Promise<number> {
    return this.client.decr(key);
  }

  async setHash(key: string, field: string, value: any): Promise<void> {
    const serializedValue = JSON.stringify(value);
    await this.client.hset(key, field, serializedValue);
  }

  async getHash<T>(key: string, field: string): Promise<T | null> {
    const value = await this.client.hget(key, field);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async getAllHash<T>(key: string): Promise<Record<string, T>> {
    const hash = await this.client.hgetall(key);
    if (!hash) return {};

    return Object.entries(hash).reduce((acc, [field, value]) => {
      acc[field] = JSON.parse(value) as T;
      return acc;
    }, {} as Record<string, T>);
  }

  async deleteHash(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  async publish(channel: string, message: any): Promise<void> {
    const serializedMessage = JSON.stringify(message);
    await this.client.publish(channel, serializedMessage);
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        const parsedMessage = JSON.parse(message);
        callback(parsedMessage);
      }
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }

  async setList(key: string, values: any[]): Promise<void> {
    const serializedValues = values.map((value) => JSON.stringify(value));
    await this.client.rpush(key, ...serializedValues);
  }

  async getList<T>(key: string, start = 0, end = -1): Promise<T[]> {
    const values = await this.client.lrange(key, start, end);
    return values.map((value) => JSON.parse(value) as T);
  }

  async addToSet(key: string, value: any): Promise<void> {
    const serializedValue = JSON.stringify(value);
    await this.client.sadd(key, serializedValue);
  }

  async getSet<T>(key: string): Promise<T[]> {
    const values = await this.client.smembers(key);
    return values.map((value) => JSON.parse(value) as T);
  }

  async removeFromSet(key: string, value: any): Promise<void> {
    const serializedValue = JSON.stringify(value);
    await this.client.srem(key, serializedValue);
  }

  async addToSortedSet(key: string, score: number, value: any): Promise<void> {
    const serializedValue = JSON.stringify(value);
    await this.client.zadd(key, score, serializedValue);
  }

  async getSortedSet<T>(key: string, start = 0, end = -1): Promise<T[]> {
    const values = await this.client.zrange(key, start, end);
    return values.map((value) => JSON.parse(value) as T);
  }

  async getSortedSetWithScores<T>(key: string, start = 0, end = -1): Promise<Array<{ score: number; value: T }>> {
    const values = await this.client.zrange(key, start, end, 'WITHSCORES');
    const result: Array<{ score: number; value: T }> = [];

    for (let i = 0; i < values.length; i += 2) {
      result.push({
        score: Number(values[i + 1]),
        value: JSON.parse(values[i]) as T,
      });
    }

    return result;
  }

  async clear(): Promise<void> {
    await this.client.flushdb();
  }

  async quit(): Promise<void> {
    await this.client.quit();
    await this.subscriber.quit();
  }
}

export const redisService = new RedisService({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
}); 