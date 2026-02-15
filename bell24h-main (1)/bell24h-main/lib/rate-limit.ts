// Rate limiting middleware for Bell24h API
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';

// Redis client for rate limiting
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});

// Rate limit configuration
export const RATE_LIMITS = {
  // General API limits
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests from this IP, please try again later.'
  },
  
  // Authentication endpoints
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many authentication attempts, please try again later.'
  },
  
  // OTP sending
  OTP: {
    windowMs: 60 * 1000, // 1 minute
    max: 3, // 3 OTP requests per minute
    message: 'Too many OTP requests, please wait before trying again.'
  },
  
  // File upload
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: 'Upload limit exceeded, please try again later.'
  },
  
  // Search endpoints
  SEARCH: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 searches per minute
    message: 'Too many search requests, please slow down.'
  },
  
  // Admin endpoints
  ADMIN: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 admin requests per minute
    message: 'Admin rate limit exceeded.'
  }
};

// Rate limiter class
export class RateLimiter {
  private redis: Redis;
  
  constructor() {
    this.redis = redis;
  }

  // Get client identifier (IP + User Agent)
  private getClientId(request: NextRequest): string {
    const ip = request.ip || 
               request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    return `${ip}:${userAgent}`;
  }

  // Check rate limit
  async checkLimit(
    clientId: string, 
    limitType: keyof typeof RATE_LIMITS,
    customKey?: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number; message?: string }> {
    const config = RATE_LIMITS[limitType];
    const key = customKey || `rate_limit:${limitType}:${clientId}`;
    
    try {
      const current = await this.redis.incr(key);
      
      if (current === 1) {
        // First request in window, set expiration
        await this.redis.expire(key, Math.ceil(config.windowMs / 1000));
      }
      
      const remaining = Math.max(0, config.max - current);
      const ttl = await this.redis.ttl(key);
      const resetTime = Date.now() + (ttl * 1000);
      
      if (current > config.max) {
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          message: config.message
        };
      }
      
      return {
        allowed: true,
        remaining,
        resetTime
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: config.max,
        resetTime: Date.now() + config.windowMs
      };
    }
  }

  // Reset rate limit for a client
  async resetLimit(clientId: string, limitType: keyof typeof RATE_LIMITS): Promise<void> {
    const key = `rate_limit:${limitType}:${clientId}`;
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Rate limit reset error:', error);
    }
  }

  // Get rate limit status
  async getStatus(clientId: string, limitType: keyof typeof RATE_LIMITS): Promise<any> {
    const key = `rate_limit:${limitType}:${clientId}`;
    try {
      const current = await this.redis.get(key) || '0';
      const ttl = await this.redis.ttl(key);
      const config = RATE_LIMITS[limitType];
      
      return {
        current: parseInt(current),
        limit: config.max,
        remaining: Math.max(0, config.max - parseInt(current)),
        resetTime: ttl > 0 ? Date.now() + (ttl * 1000) : null,
        windowMs: config.windowMs
      };
    } catch (error) {
      console.error('Rate limit status error:', error);
      return null;
    }
  }
}

// Rate limiting middleware factory
export function createRateLimit(limitType: keyof typeof RATE_LIMITS) {
  const rateLimiter = new RateLimiter();
  
  return async function rateLimitMiddleware(request: NextRequest) {
    const clientId = rateLimiter.getClientId(request);
    const result = await rateLimiter.checkLimit(clientId, limitType);
    
    if (!result.allowed) {
      return NextResponse.json(
        { 
          error: result.message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMITS[limitType].max.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString()
          }
        }
      );
    }
    
    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', RATE_LIMITS[limitType].max.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
    
    return response;
  };
}

// Specific rate limiters
export const rateLimiters = {
  api: createRateLimit('API'),
  auth: createRateLimit('AUTH'),
  otp: createRateLimit('OTP'),
  upload: createRateLimit('UPLOAD'),
  search: createRateLimit('SEARCH'),
  admin: createRateLimit('ADMIN')
};

// Rate limit status endpoint
export async function getRateLimitStatus(request: NextRequest) {
  const rateLimiter = new RateLimiter();
  const clientId = rateLimiter.getClientId(request);
  
  const status = {
    clientId,
    limits: {} as any
  };
  
  for (const limitType of Object.keys(RATE_LIMITS) as Array<keyof typeof RATE_LIMITS>) {
    status.limits[limitType] = await rateLimiter.getStatus(clientId, limitType);
  }
  
  return status;
}

export default RateLimiter;
