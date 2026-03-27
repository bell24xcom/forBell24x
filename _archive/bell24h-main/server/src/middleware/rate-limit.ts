import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Create Redis client
const redis = new Redis(process.env.REDIS_URL);

// Rate limit configuration
interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  store?: any;
}

// Default rate limit configuration
const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Create rate limiter
export const createRateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  // Use Redis store if available
  if (process.env.REDIS_URL) {
    finalConfig.store = new RedisStore({
      sendCommand: (...args: string[]) => redis.call(...args),
    });
  }

  return rateLimit(finalConfig);
};

// API rate limiter
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

// Auth rate limiter
export const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
});

// File upload rate limiter
export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per windowMs
  message: 'Too many file uploads, please try again later.',
});

// Dynamic rate limiter
export const dynamicRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  return createRateLimiter({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests, please try again later.',
  });
};

// IP-based rate limiter
export const ipRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  return createRateLimiter({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests from this IP, please try again later.',
  });
};

// User-based rate limiter
export const userRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests, please try again later.',
    keyGenerator: (req: Request) => {
      return req.user?.id || req.ip;
    },
  });
};

// Route-specific rate limiter
export const routeRateLimiter = (route: string, options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith(route)) {
      return createRateLimiter({
        windowMs: options.windowMs || 15 * 60 * 1000,
        max: options.max || 100,
        message: options.message || 'Too many requests to this route, please try again later.',
      })(req, res, next);
    }
    next();
  };
};

// Method-specific rate limiter
export const methodRateLimiter = (method: string, options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === method.toUpperCase()) {
      return createRateLimiter({
        windowMs: options.windowMs || 15 * 60 * 1000,
        max: options.max || 100,
        message: options.message || `Too many ${method} requests, please try again later.`,
      })(req, res, next);
    }
    next();
  };
}; 