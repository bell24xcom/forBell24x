// Redis-based caching for Bell24h
import { Redis } from 'ioredis';

// Redis client configuration
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});

// Cache configuration
const CACHE_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400 // 24 hours
};

// Cache key generators
export const CacheKeys = {
  // User-related
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:profile:${id}`,
  
  // RFQ-related
  rfq: (id: string) => `rfq:${id}`,
  rfqList: (filters: string) => `rfq:list:${filters}`,
  rfqCategories: () => 'rfq:categories',
  
  // Supplier-related
  suppliers: (filters: string) => `suppliers:${filters}`,
  supplierProfile: (id: string) => `supplier:${id}`,
  
  // Analytics
  analytics: (timeRange: string) => `analytics:${timeRange}`,
  dashboardMetrics: () => 'dashboard:metrics',
  
  // Marketplace
  marketplaceCategories: () => 'marketplace:categories',
  marketplaceSuppliers: (filters: string) => `marketplace:suppliers:${filters}`,
  
  // API responses
  apiResponse: (endpoint: string, params: string) => `api:${endpoint}:${params}`,
};

// Cache utility functions
export class CacheService {
  // Get value from cache
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Set value in cache
  static async set(key: string, value: any, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Delete value from cache
  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Delete multiple keys
  static async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  // Get or set pattern
  static async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T> {
    try {
      // Try to get from cache
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Fetch fresh data
      const data = await fetchFn();
      
      // Store in cache
      await this.set(key, data, ttl);
      
      return data;
    } catch (error) {
      console.error('Cache getOrSet error:', error);
      // Fallback to direct fetch
      return await fetchFn();
    }
  }

  // Invalidate user-related cache
  static async invalidateUser(userId: string): Promise<void> {
    await Promise.all([
      this.del(CacheKeys.user(userId)),
      this.del(CacheKeys.userProfile(userId)),
      this.delPattern(`rfq:list:*`), // Invalidate RFQ lists
      this.delPattern(`suppliers:*`), // Invalidate supplier lists
    ]);
  }

  // Invalidate RFQ-related cache
  static async invalidateRFQ(rfqId?: string): Promise<void> {
    if (rfqId) {
      await this.del(CacheKeys.rfq(rfqId));
    }
    await this.delPattern(`rfq:list:*`);
    await this.delPattern(`marketplace:*`);
  }

  // Invalidate analytics cache
  static async invalidateAnalytics(): Promise<void> {
    await this.delPattern(`analytics:*`);
    await this.del(CacheKeys.dashboardMetrics());
  }

  // Clear all cache
  static async clearAll(): Promise<void> {
    try {
      await redis.flushall();
    } catch (error) {
      console.error('Cache clear all error:', error);
    }
  }

  // Get cache statistics
  static async getStats(): Promise<any> {
    try {
      const info = await redis.info('memory');
      const keyspace = await redis.info('keyspace');
      
      return {
        memory: info,
        keyspace: keyspace,
        connected: redis.status === 'ready'
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { error: error.message };
    }
  }
}

// Cache middleware for API routes
export function withCache(ttl: number = CACHE_TTL.MEDIUM) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      return await CacheService.getOrSet(
        cacheKey,
        () => method.apply(this, args),
        ttl
      );
    };
  };
}

// Cache decorator for class methods
export function Cache(ttl: number = CACHE_TTL.MEDIUM) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      return await CacheService.getOrSet(
        cacheKey,
        () => originalMethod.apply(this, args),
        ttl
      );
    };
  };
}

export default CacheService;
