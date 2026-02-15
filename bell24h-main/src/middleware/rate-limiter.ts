import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
  onLimitReached?: (req: NextRequest, res: NextResponse) => void;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for development (use Redis in production)
const memoryStore: RateLimitStore = {};

// Redis client for production
let redisClient: Redis | null = null;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
}

export class RateLimiter {
  private config: RateLimitConfig;
  private store: RateLimitStore;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: 15 * 60 * 1000, // 15 minutes default
      maxRequests: 100,
      keyGenerator: this.defaultKeyGenerator,
      ...config
    };
    this.store = memoryStore;
  }

  private defaultKeyGenerator(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    const endpoint = req.nextUrl.pathname;
    return `rate_limit:${ip}:${endpoint}`;
  }

  private async getStoreValue(key: string): Promise<{ count: number; resetTime: number } | null> {
    if (redisClient) {
      try {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('Redis error:', error);
        return null;
      }
    }
    
    return this.store[key] || null;
  }

  private async setStoreValue(key: string, value: { count: number; resetTime: number }): Promise<void> {
    if (redisClient) {
      try {
        await redisClient.setex(key, Math.ceil(this.config.windowMs / 1000), JSON.stringify(value));
      } catch (error) {
        console.error('Redis error:', error);
      }
    } else {
      this.store[key] = value;
    }
  }

  private async incrementStoreValue(key: string): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const resetTime = now + this.config.windowMs;
    
    if (redisClient) {
      try {
        const pipeline = redisClient.pipeline();
        const value = await redisClient.get(key);
        
        if (value) {
          const parsed = JSON.parse(value);
          const newValue = { count: parsed.count + 1, resetTime: parsed.resetTime };
          pipeline.setex(key, Math.ceil(this.config.windowMs / 1000), JSON.stringify(newValue));
          return newValue;
        } else {
          const newValue = { count: 1, resetTime };
          pipeline.setex(key, Math.ceil(this.config.windowMs / 1000), JSON.stringify(newValue));
          return newValue;
        }
      } catch (error) {
        console.error('Redis error:', error);
        return { count: 1, resetTime };
      }
    }
    
    const existing = this.store[key];
    if (existing && existing.resetTime > now) {
      existing.count++;
      return existing;
    }
    
    const newValue = { count: 1, resetTime };
    this.store[key] = newValue;
    return newValue;
  }

  async checkLimit(req: NextRequest): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const key = this.config.keyGenerator!(req);
    const now = Date.now();
    
    const storeValue = await this.getStoreValue(key);
    
    if (!storeValue || storeValue.resetTime <= now) {
      // Window expired or doesn't exist, create new
      const newValue = { count: 1, resetTime: now + this.config.windowMs };
      await this.setStoreValue(key, newValue);
      
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: newValue.resetTime
      };
    }
    
    if (storeValue.count >= this.config.maxRequests) {
      // Limit exceeded
      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime: storeValue.resetTime,
        retryAfter: Math.ceil((storeValue.resetTime - now) / 1000)
      };
    }
    
    // Increment counter
    const newValue = await this.incrementStoreValue(key);
    
    return {
      allowed: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - newValue.count,
      resetTime: newValue.resetTime
    };
  }

  middleware() {
    return async (req: NextRequest, res: NextResponse, next: Function) => {
      const result = await this.checkLimit(req);
      
      // Add rate limit headers
      res.headers.set('X-RateLimit-Limit', result.limit.toString());
      res.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      res.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      
      if (!result.allowed) {
        if (result.retryAfter) {
          res.headers.set('Retry-After', result.retryAfter.toString());
        }
        
        if (this.config.onLimitReached) {
          this.config.onLimitReached(req, res);
        }
        
        return NextResponse.json(
          {
            success: false,
            message: 'Too many requests. Please try again later.',
            error: 'RATE_LIMIT_EXCEEDED',
            retryAfter: result.retryAfter
          },
          { status: 429 }
        );
      }
      
      return next();
    };
  }
}

// Predefined rate limiters for different endpoints
export const paymentRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // 20 payment attempts per 15 minutes
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    return `payment_rate_limit:${ip}`;
  },
  onLimitReached: (req, res) => {
    console.log(`Payment rate limit exceeded for IP: ${req.headers.get('x-forwarded-for')}`);
  }
});

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 auth attempts per 15 minutes
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    return `auth_rate_limit:${ip}`;
  }
});

export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000, // 1000 API calls per 15 minutes
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    return `api_rate_limit:${ip}`;
  }
});

export const strictRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 requests per minute
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    return `strict_rate_limit:${ip}`;
  }
});

// Utility function to apply rate limiting to API routes
export function withRateLimit(
  handler: Function,
  rateLimiter: RateLimiter = apiRateLimiter
) {
  return async (req: NextRequest, context: any) => {
    const result = await rateLimiter.checkLimit(req);
    
    if (!result.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests. Please try again later.',
          error: 'RATE_LIMIT_EXCEEDED',
          retryAfter: result.retryAfter
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            'Retry-After': result.retryAfter?.toString() || '60'
          }
        }
      );
    }
    
    const response = await handler(req, context);
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
    
    return response;
  };
}

// Clean up expired entries from memory store (run periodically)
export function cleanupMemoryStore(): void {
  const now = Date.now();
  Object.keys(memoryStore).forEach(key => {
    if (memoryStore[key].resetTime <= now) {
      delete memoryStore[key];
    }
  });
}

// Run cleanup every 5 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(cleanupMemoryStore, 5 * 60 * 1000);
}
