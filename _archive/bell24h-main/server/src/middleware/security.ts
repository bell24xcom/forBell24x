import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { logger } from '../lib/logger';

// Security configuration
export const SECURITY_CONFIG = {
  // Rate limiting
  rateLimit: {
  windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  },
  
  // Stricter rate limits for sensitive endpoints
  sensitiveRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Too many requests to sensitive endpoint, please try again later.',
  },
  
  // Authentication rate limiting
  authRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
  },
  
  // CORS configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'https://bell24h.com',
      'https://www.bell24h.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'X-API-Key'
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  },
  
  // Helmet configuration
  helmet: {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://checkout.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://api.stripe.com", "https://checkout.stripe.com", "https://js.stripe.com"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://checkout.stripe.com"],
      objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
      }
    },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
      preload: true
    }
  }
};

// Input validation schemas
export const validationSchemas = {
  // User authentication
  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
  
  // User registration
  register: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    company: z.string().optional(),
  }),
  
  // RFQ creation
  createRFQ: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    budget: z.number().positive('Budget must be positive'),
    deadline: z.string().datetime('Invalid deadline format'),
    category: z.string().min(1, 'Category is required'),
  }),
  
  // Bid submission
  submitBid: z.object({
    rfqId: z.string().uuid('Invalid RFQ ID'),
    amount: z.number().positive('Amount must be positive'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    deliveryTime: z.number().positive('Delivery time must be positive'),
  }),
  
  // Payment
  payment: z.object({
    amount: z.number().positive('Amount must be positive'),
    currency: z.enum(['INR', 'USD', 'EUR']),
    description: z.string().min(1, 'Description is required'),
    metadata: z.record(z.string()).optional(),
  }),
  
  // File upload validation
  fileUpload: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string().refine((type) => {
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'video/mp4', 'video/webm', 'video/ogg'
      ];
      return allowedTypes.includes(type);
    }, 'File type not allowed'),
    size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'), // 10MB
  }),
};

// Rate limiting middleware
export const rateLimitMiddleware = rateLimit(SECURITY_CONFIG.rateLimit);

// Sensitive endpoint rate limiting
export const sensitiveRateLimitMiddleware = rateLimit(SECURITY_CONFIG.sensitiveRateLimit);

// Authentication rate limiting
export const authRateLimitMiddleware = rateLimit(SECURITY_CONFIG.authRateLimit);

// CORS middleware
export const corsMiddleware = cors(SECURITY_CONFIG.cors);

// Helmet middleware for security headers
export const helmetMiddleware = helmet(SECURITY_CONFIG.helmet);

// Input validation middleware
export function validateInput(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(400).json({
        error: 'Invalid request body'
      });
    }
  };
}

// File upload security middleware
export function fileUploadSecurityMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: 'No files were uploaded' });
  }

  const files = Array.isArray(req.files) ? req.files : Object.values(req.files);
  
  for (const file of files) {
    try {
      validationSchemas.fileUpload.parse(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'File validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(400).json({ error: 'Invalid file' });
    }
  }
  
  next();
}

// API key authentication middleware
export function apiKeyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  
  next();
}

// JWT token validation middleware
export function jwtAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    // JWT validation logic here (using jsonwebtoken)
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Request logging middleware for security monitoring
export function securityLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  // Log request details
  console.log(`[SECURITY] ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')}`);
  
  // Log response details
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[SECURITY] ${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms`);
    
    // Log suspicious activity
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.warn(`[SECURITY WARNING] Unauthorized access attempt: ${req.method} ${req.path} from ${req.ip}`);
    }
    
    if (res.statusCode >= 500) {
      console.error(`[SECURITY ERROR] Server error: ${req.method} ${req.path} from ${req.ip}`);
    }
  });
  
  next();
}

// Comprehensive security middleware for all routes
export function comprehensiveSecurityMiddleware(req: Request, res: Response, next: NextFunction) {
  // Apply security logging
  securityLoggingMiddleware(req, res, next);
}

// Sensitive endpoint security middleware
export function sensitiveEndpointMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check for suspicious user agents
  const userAgent = req.get('User-Agent');
  if (!userAgent || userAgent.includes('bot') || userAgent.includes('crawler')) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Check for suspicious IP patterns (basic implementation)
  const ip = req.ip;
  if (ip && (ip.includes('0.0.0.0') || ip.includes('127.0.0.1'))) {
    console.warn(`[SECURITY WARNING] Suspicious IP access: ${ip} to ${req.path}`);
  }
  
  // Log sensitive endpoint access
  console.log(`[SENSITIVE] ${req.method} ${req.path} - IP: ${req.ip}`);
  
  next();
}

// Export all middleware for easy import
export const securityMiddleware = {
  rateLimit: rateLimitMiddleware,
  sensitiveRateLimit: sensitiveRateLimitMiddleware,
  authRateLimit: authRateLimitMiddleware,
  cors: corsMiddleware,
  helmet: helmetMiddleware,
  validateInput,
  fileUploadSecurity: fileUploadSecurityMiddleware,
  apiKeyAuth: apiKeyAuthMiddleware,
  jwtAuth: jwtAuthMiddleware,
  securityLogging: securityLoggingMiddleware,
  comprehensive: comprehensiveSecurityMiddleware,
  sensitive: sensitiveEndpointMiddleware,
  schemas: validationSchemas,
  config: SECURITY_CONFIG
};

// XSS protection middleware
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: string) => {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  const sanitizeObject = (obj: any) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeValue(value);
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }
    return sanitized;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);

  next();
};

// SQL injection protection middleware
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const sqlPattern = /(\%27)|(\')|(\-\-)|(\%23)|(#)/i;
  const hasSqlInjection = (value: string) => sqlPattern.test(value);

  const checkObject = (obj: any): boolean => {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    if (Array.isArray(obj)) {
      return obj.some(checkObject);
    }

    return Object.values(obj).some(value => {
      if (typeof value === 'string') {
        return hasSqlInjection(value);
      }
      return checkObject(value);
    });
  };

  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    logger.warn('Potential SQL injection attempt detected:', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
    return res.status(400).json({ error: 'Invalid input detected' });
  }

  next();
};

// Path traversal protection middleware
export const pathTraversalProtection = (req: Request, res: Response, next: NextFunction) => {
  const hasPathTraversal = (value: string) => /\.\.\//.test(value);

  const checkObject = (obj: any): boolean => {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    if (Array.isArray(obj)) {
      return obj.some(checkObject);
    }

    return Object.values(obj).some(value => {
      if (typeof value === 'string') {
        return hasPathTraversal(value);
      }
      return checkObject(value);
    });
  };

  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    logger.warn('Potential path traversal attempt detected:', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
    return res.status(400).json({ error: 'Invalid input detected' });
  }

  next();
};

// Request size limit middleware
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const maxSize = 1024 * 1024; // 1MB
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({ error: 'Request entity too large' });
  }
  next();
}; 