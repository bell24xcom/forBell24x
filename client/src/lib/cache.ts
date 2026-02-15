<<<<<<< HEAD
/**
 * Production-Grade Caching System
 * Handles 1000+ concurrent users with Redis and in-memory fallback
 */

import { NextRequest, NextResponse } from 'next/server'

// Cache configuration
const CACHE_CONFIG = {
  defaultTTL: 300, // 5 minutes
  maxMemorySize: 100 * 1024 * 1024, // 100MB
  cleanupInterval: 60 * 1000, // 1 minute
}

// In-memory cache (fallback when Redis is not available)
interface CacheEntry {
  value: any
  expires: number
  size: number
}

const memoryCache = new Map<string, CacheEntry>()
let totalMemoryUsage = 0

// Redis client (if available)
let redis: any = null

/**
 * Initialize Redis connection
 */
async function initRedis() {
  if (redis) return redis
  
  try {
    const Redis = require('ioredis')
    redis = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    })
    
    await redis.ping()
    console.log('✅ Redis connected for caching')
    return redis
  } catch (error) {
    console.warn('⚠️ Redis not available, using in-memory cache')
    return null
  }
}

/**
 * Generate cache key
 */
function generateCacheKey(prefix: string, key: string): string {
  return `${prefix}:${key}`.replace(/[^a-zA-Z0-9:_-]/g, '_')
}

/**
 * Get value from cache
 */
export async function get(key: string, prefix: string = 'default'): Promise<any> {
  const cacheKey = generateCacheKey(prefix, key)
  
  try {
    // Try Redis first
    await initRedis()
    if (redis) {
      const value = await redis.get(cacheKey)
      if (value) {
        return JSON.parse(value)
      }
    }
  } catch (error) {
    console.warn('Redis get error, falling back to memory:', error)
  }
  
  // Fallback to memory cache
  const entry = memoryCache.get(cacheKey)
  if (entry && entry.expires > Date.now()) {
    return entry.value
  }
  
  // Remove expired entry
  if (entry) {
    memoryCache.delete(cacheKey)
    totalMemoryUsage -= entry.size
  }
  
  return null
}

/**
 * Set value in cache
 */
export async function set(
  key: string, 
  value: any, 
  ttl: number = CACHE_CONFIG.defaultTTL,
  prefix: string = 'default'
): Promise<void> {
  const cacheKey = generateCacheKey(prefix, key)
  const serializedValue = JSON.stringify(value)
  const size = Buffer.byteLength(serializedValue, 'utf8')
  
  try {
    // Try Redis first
    await initRedis()
    if (redis) {
      await redis.setex(cacheKey, ttl, serializedValue)
      return
    }
  } catch (error) {
    console.warn('Redis set error, falling back to memory:', error)
  }
  
  // Fallback to memory cache
  const entry: CacheEntry = {
    value,
    expires: Date.now() + (ttl * 1000),
    size,
  }
  
  // Check memory limit
  if (totalMemoryUsage + size > CACHE_CONFIG.maxMemorySize) {
    cleanupMemoryCache()
  }
  
  memoryCache.set(cacheKey, entry)
  totalMemoryUsage += size
}

/**
 * Delete value from cache
 */
export async function del(key: string, prefix: string = 'default'): Promise<void> {
  const cacheKey = generateCacheKey(prefix, key)
  
  try {
    // Try Redis first
    await initRedis()
    if (redis) {
      await redis.del(cacheKey)
      return
    }
  } catch (error) {
    console.warn('Redis del error, falling back to memory:', error)
  }
  
  // Fallback to memory cache
  const entry = memoryCache.get(cacheKey)
  if (entry) {
    memoryCache.delete(cacheKey)
    totalMemoryUsage -= entry.size
  }
}

/**
 * Get or set pattern (cache-aside)
 */
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_CONFIG.defaultTTL,
  prefix: string = 'default'
): Promise<T> {
  const cached = await get(key, prefix)
  if (cached !== null) {
    return cached
  }
  
  const value = await fetcher()
  await set(key, value, ttl, prefix)
  return value
}

/**
 * Cache middleware for API routes
 */
export function withCache(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    ttl?: number
    prefix?: string
    keyGenerator?: (request: NextRequest) => string
  } = {}
) {
  const { ttl = CACHE_CONFIG.defaultTTL, prefix = 'api', keyGenerator } = options
  
  return async (request: NextRequest) => {
    // Generate cache key
    const key = keyGenerator ? keyGenerator(request) : `${request.method}:${request.nextUrl.pathname}`
    
    // Try to get from cache
    const cached = await get(key, prefix)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': `public, max-age=${ttl}`,
        },
      })
    }
    
    // Execute handler
    const response = await handler(request)
    
    // Cache successful responses
    if (response.status === 200) {
      const data = await response.json()
      await set(key, data, ttl, prefix)
    }
    
    return response
  }
}

/**
 * Cleanup expired entries from memory cache
 */
function cleanupMemoryCache() {
  const now = Date.now()
  const toDelete: string[] = []
  
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expires <= now) {
      toDelete.push(key)
      totalMemoryUsage -= entry.size
    }
  }
  
  toDelete.forEach(key => memoryCache.delete(key))
  
  // If still over limit, remove oldest entries
  if (totalMemoryUsage > CACHE_CONFIG.maxMemorySize) {
    const entries = Array.from(memoryCache.entries())
      .sort((a, b) => a[1].expires - b[1].expires)
    
    for (const [key, entry] of entries) {
      memoryCache.delete(key)
      totalMemoryUsage -= entry.size
      
      if (totalMemoryUsage <= CACHE_CONFIG.maxMemorySize * 0.8) {
        break
      }
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    memory: {
      entries: memoryCache.size,
      totalSize: totalMemoryUsage,
      maxSize: CACHE_CONFIG.maxMemorySize,
      usagePercent: (totalMemoryUsage / CACHE_CONFIG.maxMemorySize) * 100,
    },
    redis: {
      connected: !!redis,
    },
  }
}

// Cleanup memory cache every minute
setInterval(cleanupMemoryCache, CACHE_CONFIG.cleanupInterval)
=======
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
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
