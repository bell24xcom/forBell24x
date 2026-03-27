/**
 * Redis Configuration for Vercel
 * Uses Upstash Redis for production, in-memory fallback for development
 */

let redis: any = null;

export const getRedis = () => {
  if (redis) return redis;

  try {
    if (process.env.REDIS_URL && process.env.REDIS_TOKEN) {
      // Use Upstash Redis for production
      const { Redis } = require('@upstash/redis');
      redis = new Redis({
        url: process.env.REDIS_URL,
        token: process.env.REDIS_TOKEN,
      });
      console.log('✅ Connected to Upstash Redis');
    } else if (process.env.REDIS_URL) {
      // Use ioredis for other Redis providers
      const Redis = require('ioredis');
      redis = new Redis(process.env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxLoadingTimeout: 2000,
      });
      console.log('✅ Connected to Redis via ioredis');
    } else {
      // Fallback to in-memory cache for development
      console.log('⚠️  No Redis configured, using in-memory cache');
      redis = createInMemoryCache();
    }
  } catch (error) {
    console.warn('⚠️  Redis connection failed, using in-memory cache:', error);
    redis = createInMemoryCache();
  }

  return redis;
};

// Simple in-memory cache fallback
function createInMemoryCache() {
  const cache = new Map();
  
  return {
    async get(key: string) {
      return cache.get(key) || null;
    },
    async set(key: string, value: any, options?: { ex?: number }) {
      cache.set(key, value);
      if (options?.ex) {
        setTimeout(() => cache.delete(key), options.ex * 1000);
      }
    },
    async del(key: string) {
      return cache.delete(key) ? 1 : 0;
    },
    async exists(key: string) {
      return cache.has(key) ? 1 : 0;
    },
    async ping() {
      return 'PONG';
    },
    async disconnect() {
      cache.clear();
    }
  };
}

export default getRedis;
