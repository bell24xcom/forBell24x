import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 500) {
      logger.error(message);
    } else if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  });

  next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error:', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
    ip: req.ip,
  });

  next(err);
};

export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    if (duration > 1000) { // Log if request takes more than 1 second
      logger.warn('Slow request:', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
      });
    }
  });

  next();
};

export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log potential security issues
  const securityChecks = {
    hasXssAttempt: /<script>|javascript:|on\w+=/i.test(req.originalUrl),
    hasSqlInjection: /(\%27)|(\')|(\-\-)|(\%23)|(#)/i.test(req.originalUrl),
    hasPathTraversal: /\.\.\//.test(req.originalUrl),
  };

  if (Object.values(securityChecks).some(check => check)) {
    logger.warn('Potential security issue detected:', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      checks: securityChecks,
    });
  }

  next();
};

export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log sensitive operations
  const sensitiveOperations = [
    '/auth/login',
    '/auth/register',
    '/auth/reset-password',
    '/users/update',
    '/company/update',
  ];

  if (sensitiveOperations.some(op => req.originalUrl.includes(op))) {
    logger.info('Sensitive operation:', {
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.userId,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log API usage
  if (req.originalUrl.startsWith('/api/')) {
    logger.info('API request:', {
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.userId,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    });
  }

  next();
}; 