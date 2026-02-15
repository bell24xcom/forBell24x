import redis from 'redis';
import { Request, Response, NextFunction } from 'express';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = redis.createClient({ url: redisUrl });
client.connect();

export function cacheMiddleware(keyPrefix: string, ttlSeconds = 300) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `${keyPrefix}:${req.originalUrl}`;
      const cached = await client.get(key);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        client.setEx(key, ttlSeconds, JSON.stringify(body));
        res.setHeader('X-Cache', 'MISS');
        return originalJson(body);
      };
      next();
    } catch (error) {
      console.error('Redis cache error:', error);
      next();
    }
  };
}
