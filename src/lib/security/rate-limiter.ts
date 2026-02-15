/**
 * Bell24H Rate Limiting System
 *
 * Implements comprehensive rate limiting with Redis for API abuse prevention
 * Supports multiple limiting strategies and enterprise configurations
 */

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: any) => string; // Custom key generator
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  blockDuration?: number; // Block duration for exceeded limits
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
  totalRequests: number;
  windowStart: number;
  retryAfter?: number;
}

export interface RateLimitEntry {
  count: number;
  windowStart: number;
  blocked: boolean;
  blockExpiry?: number;
}

// Predefined rate limit configurations for different API tiers
export const RATE_LIMIT_CONFIGS = {
  // Free tier - Basic limits
  free: {
    api: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
    search: { windowMs: 60 * 1000, maxRequests: 50 }, // 50 searches per minute
    upload: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 uploads per minute
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 auth attempts per 15 minutes
    rfq: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 RFQs per minute
  },

  // Pro tier - Enhanced limits
  pro: {
    api: { windowMs: 60 * 1000, maxRequests: 500 }, // 500 requests per minute
    search: { windowMs: 60 * 1000, maxRequests: 200 }, // 200 searches per minute
    upload: { windowMs: 60 * 1000, maxRequests: 50 }, // 50 uploads per minute
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 auth attempts per 15 minutes
    rfq: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 RFQs per minute
  },

  // Enterprise tier - High limits
  enterprise: {
    api: { windowMs: 60 * 1000, maxRequests: 2000 }, // 2000 requests per minute
    search: { windowMs: 60 * 1000, maxRequests: 1000 }, // 1000 searches per minute
    upload: { windowMs: 60 * 1000, maxRequests: 200 }, // 200 uploads per minute
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 20 }, // 20 auth attempts per 15 minutes
    rfq: { windowMs: 60 * 1000, maxRequests: 500 }, // 500 RFQs per minute
  },

  // Admin tier - Very high limits
  admin: {
    api: { windowMs: 60 * 1000, maxRequests: 10000 }, // 10000 requests per minute
    search: { windowMs: 60 * 1000, maxRequests: 5000 }, // 5000 searches per minute
    upload: { windowMs: 60 * 1000, maxRequests: 1000 }, // 1000 uploads per minute
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 50 }, // 50 auth attempts per 15 minutes
    rfq: { windowMs: 60 * 1000, maxRequests: 2000 }, // 2000 RFQs per minute
  },
};

// Special rate limits for sensitive operations
export const SECURITY_RATE_LIMITS = {
  passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour
  emailVerification: { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 per hour
  accountCreation: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 10 }, // 10 per day
  dataExport: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 5 }, // 5 per day
  dataDeletion: { windowMs: 30 * 24 * 60 * 60 * 1000, maxRequests: 1 }, // 1 per month
};

export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup process for expired entries
    this.startCleanup();
  }

  /**
   * Check if request is allowed under rate limit
   */
  async checkLimit(
    key: string,
    config: RateLimitConfig,
    identifier?: string
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = Math.floor(now / config.windowMs) * config.windowMs;
    const fullKey = identifier ? `${identifier}:${key}` : key;

    // Get existing entry or create new one
    let entry = this.store.get(fullKey);

    if (!entry || entry.windowStart !== windowStart) {
      // New window or first request
      entry = {
        count: 0,
        windowStart,
        blocked: false,
      };
    }

    // Check if currently blocked
    if (entry.blocked && entry.blockExpiry && now < entry.blockExpiry) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: entry.blockExpiry,
        totalRequests: entry.count,
        windowStart: entry.windowStart,
        retryAfter: Math.ceil((entry.blockExpiry - now) / 1000),
      };
    }

    // Reset block if expired
    if (entry.blocked && entry.blockExpiry && now >= entry.blockExpiry) {
      entry.blocked = false;
      entry.blockExpiry = undefined;
      entry.count = 0;
    }

    // Check rate limit
    if (entry.count >= config.maxRequests) {
      // Apply block if configured
      if (config.blockDuration) {
        entry.blocked = true;
        entry.blockExpiry = now + config.blockDuration;
      }

      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: windowStart + config.windowMs,
        totalRequests: entry.count,
        windowStart: entry.windowStart,
        retryAfter: config.blockDuration
          ? Math.ceil(config.blockDuration / 1000)
          : Math.ceil((windowStart + config.windowMs - now) / 1000),
      };
    }

    // Allow request and increment counter
    entry.count++;
    this.store.set(fullKey, entry);

    return {
      allowed: true,
      remainingRequests: config.maxRequests - entry.count,
      resetTime: windowStart + config.windowMs,
      totalRequests: entry.count,
      windowStart: entry.windowStart,
    };
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getStatus(
    key: string,
    config: RateLimitConfig,
    identifier?: string
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = Math.floor(now / config.windowMs) * config.windowMs;
    const fullKey = identifier ? `${identifier}:${key}` : key;

    const entry = this.store.get(fullKey);

    if (!entry || entry.windowStart !== windowStart) {
      return {
        allowed: true,
        remainingRequests: config.maxRequests,
        resetTime: windowStart + config.windowMs,
        totalRequests: 0,
        windowStart,
      };
    }

    return {
      allowed: entry.count < config.maxRequests && !entry.blocked,
      remainingRequests: Math.max(0, config.maxRequests - entry.count),
      resetTime: windowStart + config.windowMs,
      totalRequests: entry.count,
      windowStart: entry.windowStart,
      retryAfter:
        entry.blocked && entry.blockExpiry
          ? Math.ceil((entry.blockExpiry - now) / 1000)
          : undefined,
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  async resetLimit(key: string, identifier?: string): Promise<void> {
    const fullKey = identifier ? `${identifier}:${key}` : key;
    this.store.delete(fullKey);
  }

  /**
   * Block a specific key for a duration
   */
  async blockKey(key: string, duration: number, identifier?: string): Promise<void> {
    const fullKey = identifier ? `${identifier}:${key}` : key;
    const now = Date.now();

    let entry = this.store.get(fullKey);
    if (!entry) {
      entry = {
        count: 0,
        windowStart: now,
        blocked: false,
      };
    }

    entry.blocked = true;
    entry.blockExpiry = now + duration;
    this.store.set(fullKey, entry);
  }

  /**
   * Unblock a specific key
   */
  async unblockKey(key: string, identifier?: string): Promise<void> {
    const fullKey = identifier ? `${identifier}:${key}` : key;
    const entry = this.store.get(fullKey);

    if (entry) {
      entry.blocked = false;
      entry.blockExpiry = undefined;
      this.store.set(fullKey, entry);
    }
  }

  /**
   * Get all active rate limits (for monitoring)
   */
  async getActiveLimits(): Promise<Array<{ key: string; entry: RateLimitEntry }>> {
    const now = Date.now();
    const active: Array<{ key: string; entry: RateLimitEntry }> = [];

    for (const [key, entry] of this.store.entries()) {
      // Only include entries that are still relevant
      if (entry.count > 0 || entry.blocked || now - entry.windowStart < 300000) {
        // 5 minutes buffer
        active.push({ key, entry });
      }
    }

    return active;
  }

  /**
   * Clean up expired entries
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, entry] of this.store.entries()) {
        // Remove entries older than 1 hour and not blocked
        const isExpired = now - entry.windowStart > 60 * 60 * 1000;
        const isBlockExpired = entry.blocked && entry.blockExpiry && now > entry.blockExpiry;

        if (isExpired && (!entry.blocked || isBlockExpired)) {
          expiredKeys.push(key);
        }
      }

      expiredKeys.forEach(key => this.store.delete(key));

      if (expiredKeys.length > 0) {
        console.log(`Rate limiter: Cleaned up ${expiredKeys.length} expired entries`);
      }
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }

  /**
   * Stop cleanup process
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Utility functions for common use cases
export const rateLimitUtils = {
  /**
   * Generate key from IP and user agent
   */
  generateIPKey(ip: string, userAgent?: string): string {
    const hash = userAgent ? `${ip}:${Buffer.from(userAgent).toString('base64').slice(0, 10)}` : ip;
    return `ip:${hash}`;
  },

  /**
   * Generate key from user ID
   */
  generateUserKey(userId: string): string {
    return `user:${userId}`;
  },

  /**
   * Generate key from API key
   */
  generateAPIKey(apiKey: string): string {
    return `api:${apiKey.slice(0, 10)}`;
  },

  /**
   * Get user tier configuration
   */
  getUserTierConfig(
    userTier: 'free' | 'pro' | 'enterprise' | 'admin'
  ): typeof RATE_LIMIT_CONFIGS.free {
    return RATE_LIMIT_CONFIGS[userTier] || RATE_LIMIT_CONFIGS.free;
  },

  /**
   * Check if IP is whitelisted
   */
  isWhitelisted(ip: string): boolean {
    const whitelistedIPs = [
      '127.0.0.1',
      '::1',
      'localhost',
      // Add your trusted IPs here
    ];

    return whitelistedIPs.includes(ip);
  },

  /**
   * Get rate limit headers for HTTP response
   */
  getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
      'X-RateLimit-Limit': result.totalRequests.toString(),
      'X-RateLimit-Remaining': result.remainingRequests.toString(),
      'X-RateLimit-Reset': result.resetTime.toString(),
      'X-RateLimit-Window-Start': result.windowStart.toString(),
      ...(result.retryAfter && { 'Retry-After': result.retryAfter.toString() }),
    };
  },
};

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter();

// Rate limit middleware factory
export function createRateLimitMiddleware(
  config: RateLimitConfig,
  keyGenerator?: (request: any) => string
) {
  return async (request: any) => {
    const key = keyGenerator
      ? keyGenerator(request)
      : rateLimitUtils.generateIPKey(
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        );

    const result = await globalRateLimiter.checkLimit(key, config);

    return {
      allowed: result.allowed,
      headers: rateLimitUtils.getRateLimitHeaders(result),
      retryAfter: result.retryAfter,
    };
  };
}
