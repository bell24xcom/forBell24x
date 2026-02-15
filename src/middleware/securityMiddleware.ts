import { Request, Response, NextFunction } from 'express';
import { SecurityService } from '../services/security/SecurityService';
import { securityConfig } from '../config/security';
import { logger } from '../utils/logger';

export class SecurityMiddleware {
  private securityService: SecurityService;

  constructor() {
    this.securityService = SecurityService.getInstance();
  }

  // API Key Authentication
  public apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey) {
        return res.status(401).json({ error: 'API key is required' });
      }

      const isValid = await this.securityService.validateApiKey(apiKey);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      next();
    } catch (error) {
      logger.error('API Key Authentication Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // JWT Authentication
  public jwtAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'JWT token is required' });
      }

      const decoded = this.securityService.verifyToken(token);
      req.user = decoded;
      
      next();
    } catch (error) {
      logger.error('JWT Authentication Error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Rate Limiting
  public rateLimit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip;
      const endpoint = req.path;

      const isAllowed = await this.securityService.checkRateLimit(ip, endpoint);
      
      if (!isAllowed) {
        return res.status(429).json({ error: 'Too many requests' });
      }

      next();
    } catch (error) {
      logger.error('Rate Limiting Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // CSRF Protection
  public csrfProtection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.method === 'GET') {
        return next();
      }

      const csrfToken = req.headers['x-csrf-token'] as string;
      const storedToken = req.session?.csrfToken;

      if (!csrfToken || !storedToken) {
        return res.status(403).json({ error: 'CSRF token missing' });
      }

      const isValid = this.securityService.verifyCsrfToken(csrfToken, storedToken);
      
      if (!isValid) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
      }

      next();
    } catch (error) {
      logger.error('CSRF Protection Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Input Sanitization
  public sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body) {
        Object.keys(req.body).forEach(key => {
          if (typeof req.body[key] === 'string') {
            req.body[key] = this.securityService.sanitizeInput(req.body[key]);
          }
        });
      }

      if (req.query) {
        Object.keys(req.query).forEach(key => {
          if (typeof req.query[key] === 'string') {
            req.query[key] = this.securityService.sanitizeInput(req.query[key] as string);
          }
        });
      }

      next();
    } catch (error) {
      logger.error('Input Sanitization Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Security Headers
  public securityHeaders = (req: Request, res: Response, next: NextFunction) => {
    try {
      Object.entries(securityConfig.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      next();
    } catch (error) {
      logger.error('Security Headers Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // IP Blocking
  public ipBlocking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip;
      const isBlocked = await this.securityService.isIPBlocked(ip);
      
      if (isBlocked) {
        return res.status(403).json({ error: 'IP address is blocked' });
      }

      next();
    } catch (error) {
      logger.error('IP Blocking Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Audit Logging
  public auditLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const originalSend = res.send;
      res.send = function (body) {
        res.send = originalSend;
        const result = res.send.call(this, body);
        
        const auditEvent = {
          action: req.method,
          userId: req.user?.id || 'anonymous',
          ip: req.ip,
          details: {
            path: req.path,
            query: req.query,
            body: req.body,
            statusCode: res.statusCode
          }
        };

        this.securityService.logAuditEvent(auditEvent);
        
        return result;
      };

      next();
    } catch (error) {
      logger.error('Audit Logging Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // File Upload Security
  public fileUploadSecurity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return next();
      }

      const isValid = this.securityService.validateFileUpload(req.file);
      
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid file upload' });
      }

      next();
    } catch (error) {
      logger.error('File Upload Security Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Error Handler
  public errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Security Middleware Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  };
}

export const securityMiddleware = new SecurityMiddleware(); 