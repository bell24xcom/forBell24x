// Redis-based caching layer for performance optimization
interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Enable compression
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
}

export class CacheManager {
  private static instance: CacheManager;
  private redis: any = null;
  private memoryCache = new Map<string, CacheItem<any>>();
  private isRedisAvailable = false;

  private constructor() {
    this.initializeRedis();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private async initializeRedis() {
    try {
      // Dynamic import to avoid build issues
      const Redis = (await import('ioredis')).default;
      
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
          maxRetriesPerRequest: 3,
      lazyConnect: true,
        });

        this.redis.on('connect', () => {
          this.isRedisAvailable = true;
          console.log('Redis connected successfully');
        });

        this.redis.on('error', (err: Error) => {
          console.warn('Redis connection error:', err.message);
          this.isRedisAvailable = false;
        });
      }
  } catch (error) {
      console.warn('Redis not available, using memory cache:', error);
      this.isRedisAvailable = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
  try {
    // Try Redis first
      if (this.isRedisAvailable && this.redis) {
        const cached = await this.redis.get(key);
        if (cached) {
          const item: CacheItem<T> = JSON.parse(cached);
          if (this.isExpired(item)) {
            await this.redis.del(key);
            return null;
          }
          return item.data;
        }
  }
  
  // Fallback to memory cache
      const item = this.memoryCache.get(key);
      if (item && !this.isExpired(item)) {
        return item.data;
      }

      if (item) {
        this.memoryCache.delete(key);
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: options.ttl || 3600, // Default 1 hour
        tags: options.tags || [],
      };

      // Store in Redis
      if (this.isRedisAvailable && this.redis) {
        await this.redis.setex(key, item.ttl, JSON.stringify(item));
      }

      // Store in memory cache as backup
      this.memoryCache.set(key, item);

      // Clean up expired items from memory cache
      this.cleanupMemoryCache();
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.del(key);
      }
      this.memoryCache.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redis) {
        // Get all keys with the tag
        const keys = await this.redis.keys(`*:${tag}:*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }

      // Clean memory cache
      for (const [key, item] of this.memoryCache.entries()) {
        if (item.tags.includes(tag)) {
          this.memoryCache.delete(key);
        }
    }
  } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  async flush(): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.flushdb();
      }
      this.memoryCache.clear();
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl * 1000;
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > item.ttl * 1000) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Cache statistics
  getStats() {
    return {
      memoryCacheSize: this.memoryCache.size,
      isRedisAvailable: this.isRedisAvailable,
      memoryCacheKeys: Array.from(this.memoryCache.keys()),
    };
  }

  // Cache warming utilities
  async warmCache<T>(
    key: string,
    dataFetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) {
      return cached;
    }

    const data = await dataFetcher();
    await this.set(key, data, options);
    return data;
  }

  // Batch operations
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const results: (T | null)[] = [];
    
    for (const key of keys) {
      const value = await this.get<T>(key);
      results.push(value);
    }
    
    return results;
  }

  async mset<T>(items: Array<{ key: string; data: T; options?: CacheOptions }>): Promise<void> {
    const promises = items.map(({ key, data, options }) => 
      this.set(key, data, options)
    );
    
    await Promise.all(promises);
  }
}

// Cache decorator for functions
export function cached(ttl: number = 3600, tags: string[] = []) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cache = CacheManager.getInstance();

    descriptor.value = async function (...args: any[]) {
      const key = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      const cached = await cache.get(key);
      if (cached) {
        return cached;
      }

      const result = await method.apply(this, args);
      await cache.set(key, result, { ttl, tags });
      
      return result;
    };
  };
}

// Cache utilities
export const cacheUtils = {
  // Generate cache key
  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  },

  // Cache with automatic invalidation
  async cacheWithInvalidation<T>(
    key: string,
    dataFetcher: () => Promise<T>,
    options: CacheOptions & { invalidateAfter?: number } = {}
  ): Promise<T> {
    const cache = CacheManager.getInstance();
    
    const cached = await cache.get<T>(key);
    if (cached) {
      return cached;
    }

    const data = await dataFetcher();
    await cache.set(key, data, options);

    // Set up automatic invalidation
    if (options.invalidateAfter) {
      setTimeout(() => {
        cache.del(key);
      }, options.invalidateAfter * 1000);
    }

    return data;
  },
};