import { Request, Response, NextFunction } from 'express';
import { monitoring } from '../utils/monitoring';
import { Logger } from '../utils/logger';

/**
 * Middleware to add APM monitoring to Express requests
 * - Creates a transaction for each request
 * - Records response time
 * - Captures errors
 * - Adds custom attributes (user ID, route, etc.)
 */
export function monitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip monitoring if not initialized or in test environment
  if (!monitoring.isInitialized || process.env.NODE_ENV === 'test') {
    return next();
  }
  
  const startTime = Date.now();
  const path = req.path || req.originalUrl || req.url || 'unknown';
  const method = req.method || 'unknown';
  const transactionName = `${method} ${path}`;
  
  // Start transaction
  const transaction = monitoring.startTransaction(transactionName, 'web');
  
  // Add useful custom attributes
  monitoring.addCustomAttribute('request.method', method);
  monitoring.addCustomAttribute('request.path', path);
  monitoring.addCustomAttribute('request.query', JSON.stringify(req.query));
  
  // Add user ID if authenticated
  if (req.user && (req.user as any).id) {
    monitoring.addCustomAttribute('user.id', (req.user as any).id);
  }
  
  // Add custom response handlers
  const originalEnd = res.end;
  const originalJson = res.json;
  const originalSend = res.send;
  
  // Override response.end
  (res as any).end = function(...args: any[]) {
    finalizeTransaction(res, startTime);
    return originalEnd.apply(res, args);
  };
  
  // Override response.json
  res.json = function(...args: any[]) {
    finalizeTransaction(res, startTime);
    return originalJson.apply(res, args);
  };
  
  // Override response.send
  res.send = function(...args: any[]) {
    finalizeTransaction(res, startTime);
    return originalSend.apply(res, args);
  };
  
  // Add error handler
  res.on('error', (error: Error) => {
    monitoring.captureError(error);
    Logger.error('Response error:', error);
  });
  
  // Continue to next middleware
  next();
  
  // Helper to finalize the transaction
  function finalizeTransaction(res: Response, startTime: number) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    monitoring.addCustomAttribute('response.status', statusCode);
    monitoring.addCustomAttribute('response.time', duration);
    
    // Record response time metric
    monitoring.recordResponseTime(transactionName, duration);
    
    // Increment status code metrics
    monitoring.incrementMetric(`status_code.${statusCode}`);
    
    // Record 4xx and 5xx errors
    if (statusCode >= 400) {
      monitoring.incrementMetric(`errors.${Math.floor(statusCode / 100)}xx`);
    }
    
    // End transaction
    if (transaction && typeof transaction.end === 'function') {
      transaction.end();
    }
  }
}
