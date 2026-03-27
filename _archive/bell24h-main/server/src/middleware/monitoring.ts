import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import os from 'os';

const prisma = new PrismaClient();

// Performance monitoring middleware
export const performanceMonitor = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();

    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

      // Log slow requests
      if (duration > 1000) {
        console.warn(`Slow request detected: ${req.method} ${req.url} (${duration.toFixed(2)}ms)`);
      }

      // Log request metrics
      console.log({
        type: 'request',
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: duration.toFixed(2),
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });
    });

    next();
  };
};

// Database monitoring middleware
export const databaseMonitor = () => {
  const originalQueryRaw = prisma.$queryRaw;

  prisma.$queryRaw = async (...args: any[]) => {
    const start = process.hrtime();
    const result = await originalQueryRaw.apply(prisma, args);
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    // Log slow queries
    if (duration > 100) {
      console.warn(`Slow query detected: ${args[0]} (${duration.toFixed(2)}ms)`);
    }

    // Log query metrics
    console.log({
      type: 'query',
      query: args[0],
      duration: duration.toFixed(2),
    });

    return result;
  };

  return (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      // Log database metrics
      console.log({
        type: 'database',
        method: req.method,
        url: req.url,
        status: res.statusCode,
      });
    });

    next();
  };
};

// Memory monitoring middleware
export const memoryMonitor = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startMemory = process.memoryUsage();

    res.on('finish', () => {
      const endMemory = process.memoryUsage();
      const memoryDiff = {
        rss: endMemory.rss - startMemory.rss,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        external: endMemory.external - startMemory.external,
      };

      // Log memory metrics
      console.log({
        type: 'memory',
        method: req.method,
        url: req.url,
        status: res.statusCode,
        memoryDiff,
      });
    });

    next();
  };
};

// Error monitoring middleware
export const errorMonitor = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body: any): Response {
      if (res.statusCode >= 400) {
        // Log error response
        console.error({
          type: 'error',
          method: req.method,
          url: req.url,
          status: res.statusCode,
          body,
        });
      }

      return originalSend.call(this, body);
    };

    next();
  };
};

// Health check middleware
export const healthCheck = () => {
  return async (req: Request, res: Response) => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      // Get system metrics
      const memoryUsage = process.memoryUsage();
      const cpuUsage = os.loadavg();
      const uptime = os.uptime();

      // Check memory usage
      const memoryWarning = memoryUsage.heapUsed > 1024 * 1024 * 1024; // 1GB
      const cpuWarning = cpuUsage[0] > 80; // 80% load average

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime,
        memory: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external,
          warning: memoryWarning,
        },
        cpu: {
          loadAverage: cpuUsage,
          warning: cpuWarning,
        },
        database: {
          status: 'connected',
        },
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  };
};

// Metrics collection middleware
export const metricsCollector = () => {
  const metrics = {
    totalRequests: 0,
    errors: 0,
    slowRequests: 0,
    databaseQueries: 0,
    slowQueries: 0,
  };

  return (req: Request, res: Response, next: NextFunction) => {
    metrics.totalRequests++;

    res.on('finish', () => {
      if (res.statusCode >= 400) {
        metrics.errors++;
      }
    });

    // Expose metrics endpoint
    if (req.path === '/metrics') {
      res.json(metrics);
      return;
    }

    next();
  };
}; 