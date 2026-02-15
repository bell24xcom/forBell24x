import Redis from 'ioredis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (error) => {
  logger.error('Redis error:', error);
});

redis.on('connect', () => {
  logger.info('Connected to Redis');
});

export const cache = {
  async get(key: string): Promise<string | null> {
    try {
      return await redis.get(key);
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await redis.setex(key, ttl, value);
      } else {
        await redis.set(key, value);
      }
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  },

  async flush(): Promise<void> {
    try {
      await redis.flushall();
    } catch (error) {
      logger.error('Cache flush error:', error);
    }
  },
}; 