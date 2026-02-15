import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics/AnalyticsService';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { logger } from '../utils/logger';

const analyticsService = new AnalyticsService(prisma, redis);

export const trackPageView = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user) {
      await analyticsService.trackUserBehavior(req.user.id, 'page_view', {
        path: req.path,
        method: req.method,
        userAgent: req.headers['user-agent'],
        referrer: req.headers.referer
      });
    }
    next();
  } catch (error) {
    logger.error('Error tracking page view:', error);
    next(); // Continue even if tracking fails
  }
};

export const trackApiUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();

  // Capture the original end method
  const originalEnd = res.end;

  // Override the end method
  res.end = function(chunk?: any, encoding?: any, callback?: any): Response {
    const responseTime = Date.now() - startTime;

    // Log API usage
    prisma.apiLog.create({
      data: {
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTime,
        userId: req.user?.id,
        userAgent: req.headers['user-agent'] as string,
        ipAddress: req.ip
      }
    }).catch(error => {
      logger.error('Error logging API usage:', error);
    });

    // Call the original end method
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

export const trackError = async (error: Error, req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user) {
      await analyticsService.trackUserBehavior(req.user.id, 'error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      });
    }

    // Log error in database
    await prisma.errorLog.create({
      data: {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        userAgent: req.headers['user-agent'] as string,
        ipAddress: req.ip
      }
    });
  } catch (logError) {
    logger.error('Error tracking error:', logError);
  }

  next(error);
};

export const trackPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const startTime = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

    // Log performance metrics
    prisma.performanceLog.create({
      data: {
        path: req.path,
        method: req.method,
        duration,
        statusCode: res.statusCode,
        userId: req.user?.id
      }
    }).catch(error => {
      logger.error('Error logging performance:', error);
    });
  });

  next();
}; 