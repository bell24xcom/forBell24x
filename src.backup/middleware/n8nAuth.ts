import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { redisService } from '../services/cache/RedisService';

interface N8nAuthConfig {
  apiKey: string;
  jwtSecret: string;
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export class N8nAuthMiddleware {
  private config: N8nAuthConfig;

  constructor(config: N8nAuthConfig) {
    this.config = config;
  }

  // Verify API key
  public verifyApiKey = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-n8n-api-key'];

    if (!apiKey || apiKey !== this.config.apiKey) {
      logger.warn('Invalid API key attempt', {
        ip: req.ip,
        path: req.path
      });
      return res.status(401).json({ error: 'Invalid API key' });
    }

    next();
  };

  // Verify JWT token
  public verifyJwt = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = verify(token, this.config.jwtSecret);
      req.user = decoded;
      next();
    } catch (error) {
      logger.error('JWT verification failed', { error });
      return res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Rate limiting
  public rateLimit = async (req: Request, res: Response, next: NextFunction) => {
    const key = `n8n:ratelimit:${req.ip}`;
    
    try {
      const current = await redisService.increment(key);
      
      if (current === 1) {
        await redisService.expire(key, this.config.rateLimit.windowMs / 1000);
      }

      if (current > this.config.rateLimit.max) {
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path
        });
        return res.status(429).json({ error: 'Too many requests' });
      }

      next();
    } catch (error) {
      logger.error('Rate limit error', { error });
      next();
    }
  };

  // Webhook signature verification
  public verifyWebhookSignature = async (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['x-n8n-signature'];

    if (!signature) {
      return res.status(401).json({ error: 'No signature provided' });
    }

    try {
      const isValid = this.verifySignature(req.body, signature);
      
      if (!isValid) {
        logger.warn('Invalid webhook signature', {
          ip: req.ip,
          path: req.path
        });
        return res.status(401).json({ error: 'Invalid signature' });
      }

      next();
    } catch (error) {
      logger.error('Signature verification error', { error });
      return res.status(401).json({ error: 'Signature verification failed' });
    }
  };

  // Verify webhook signature
  private verifySignature(payload: any, signature: string): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', this.config.jwtSecret);
    const calculatedSignature = hmac
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  }

  // Audit logging
  public auditLog = async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      logger.info('N8n API request', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
    });

    next();
  };

  // CORS configuration
  public corsConfig = (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-N8N-API-KEY');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    next();
  };

  // Security headers
  public securityHeaders = (req: Request, res: Response, next: NextFunction) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.header('Content-Security-Policy', "default-src 'self'");
    
    next();
  };

  // Request validation
  public validateRequest = (schema: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.validateAsync(req.body);
        next();
      } catch (error) {
        logger.warn('Request validation failed', { error });
        return res.status(400).json({ error: 'Invalid request data' });
      }
    };
  };

  // Error handling
  public errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('N8n API error', {
      error: err.message,
      stack: err.stack,
      path: req.path
    });

    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  };
} 