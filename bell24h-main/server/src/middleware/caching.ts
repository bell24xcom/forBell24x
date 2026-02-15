import { Request, Response, NextFunction } from 'express';
import { cache } from '../lib/cache';
import { logger } from '../lib/logger';

// Cache key generator
const generateCacheKey = (req: Request): string => {
  const { originalUrl, method, body, query, params } = req;
  return `${method}:${originalUrl}:${JSON.stringify(body)}:${JSON.stringify(query)}:${JSON.stringify(params)}`;
};

// Cache duration in seconds
const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

// Cache middleware
export const cacheMiddleware = (duration: number = CACHE_DURATIONS.MEDIUM) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateCacheKey(req);

    try {
      // Try to get cached response
      const cachedResponse = await cache.get(cacheKey);
      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }

      // If no cached response, modify res.json to cache the response
      const originalJson = res.json;
      res.json = function (body: any) {
        cache.set(cacheKey, JSON.stringify(body), duration)
          .catch(error => logger.error('Cache set error:', error));
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache invalidation middleware
export const invalidateCache = (patterns: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Wait for the response to be sent
      res.on('finish', async () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Invalidate cache for matching patterns
          for (const pattern of patterns) {
            const keys = await cache.keys(pattern);
            await Promise.all(keys.map(key => cache.del(key)));
          }
        }
      });

      next();
    } catch (error) {
      logger.error('Cache invalidation error:', error);
      next();
    }
  };
};

// Conditional caching middleware
export const conditionalCache = (condition: (req: Request) => boolean) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (condition(req)) {
      return cacheMiddleware()(req, res, next);
    }
    next();
  };
};

// Cache control headers middleware
export const cacheControl = (maxAge: number = CACHE_DURATIONS.MEDIUM) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', `public, max-age=${maxAge}`);
    next();
  };
};

// Cache warming middleware
export const warmCache = (urls: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Warm cache for specified URLs
      await Promise.all(
        urls.map(async (url) => {
          const response = await fetch(url);
          const data = await response.json();
          const cacheKey = `GET:${url}`;
          await cache.set(cacheKey, JSON.stringify(data), CACHE_DURATIONS.LONG);
        })
      );
    } catch (error) {
      logger.error('Cache warming error:', error);
    }
    next();
  };
};

// Cache statistics middleware
export const cacheStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = {
      hits: await cache.get('cache:hits') || 0,
      misses: await cache.get('cache:misses') || 0,
      keys: await cache.keys('*').then(keys => keys.length),
    };

    res.json(stats);
  } catch (error) {
    logger.error('Cache stats error:', error);
    res.status(500).json({ error: 'Failed to get cache statistics' });
  }
}; 