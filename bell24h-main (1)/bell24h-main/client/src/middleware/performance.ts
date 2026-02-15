// Performance middleware for API routes
import { NextRequest, NextResponse } from 'next/server';
import { CacheManager } from '@/lib/cache';

interface PerformanceConfig {
  cache?: {
    ttl: number;
    tags: string[];
  };
  rateLimit?: {
    max: number;
    windowMs: number;
  };
  compression?: boolean;
  timeout?: number;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function withPerformance<T = any>(
  handler: (req: NextRequest, ...args: any[]) => Promise<Response | NextResponse<T>>,
  config: PerformanceConfig = {}
) {
  return async (req: NextRequest, ...args: any[]): Promise<Response | NextResponse<T>> => {
    const startTime = performance.now();
    const cache = CacheManager.getInstance();
    
    try {
      // Rate limiting
      if (config.rateLimit) {
        const clientId = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
        const now = Date.now();
        const windowMs = config.rateLimit.windowMs;
        const max = config.rateLimit.max;
        
        const clientData = rateLimitMap.get(clientId);
        
        if (clientData) {
          if (now > clientData.resetTime) {
            clientData.count = 1;
            clientData.resetTime = now + windowMs;
          } else {
            clientData.count++;
            if (clientData.count > max) {
              return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429 }
              );
            }
          }
        } else {
          rateLimitMap.set(clientId, {
            count: 1,
            resetTime: now + windowMs,
          });
        }
      }

      // Cache check
      if (config.cache) {
        const cacheKey = `api:${req.url}:${req.headers.get('authorization') || 'anonymous'}`;
        const cached = await cache.get(cacheKey);
        
        if (cached) {
          return NextResponse.json(cached, {
            headers: {
              'X-Cache': 'HIT',
              'X-Response-Time': `${performance.now() - startTime}ms`,
            },
          });
        }
      }

      // Set timeout
      let timeoutId: NodeJS.Timeout | null = null;
      if (config.timeout) {
        timeoutId = setTimeout(() => {
          throw new Error('Request timeout');
        }, config.timeout);
      }

      // Execute handler
      const response = await handler(req, ...args);
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Cache response
      if (config.cache && response instanceof NextResponse) {
        const responseData = await response.clone().json();
        const cacheKey = `api:${req.url}:${req.headers.get('authorization') || 'anonymous'}`;
        await cache.set(cacheKey, responseData, {
          ttl: config.cache.ttl,
          tags: config.cache.tags,
        });
      }

      // Add performance headers
      const duration = performance.now() - startTime;
      const headers = new Headers(response.headers);
      headers.set('X-Response-Time', `${duration}ms`);
      headers.set('X-Cache', 'MISS');

      if (config.compression) {
        headers.set('Content-Encoding', 'gzip');
      }

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });

    } catch (error) {
      console.error('Performance middleware error:', error);
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { 
          status: 500,
          headers: {
            'X-Response-Time': `${performance.now() - startTime}ms`,
          },
        }
      );
    }
  };
}

// Database query optimization middleware
export function withQueryOptimization<T = any>(
  handler: (req: NextRequest, ...args: any[]) => Promise<Response | NextResponse<T>>,
  queryConfig: {
    maxRows?: number;
    timeout?: number;
    cache?: boolean;
  } = {}
) {
  return async (req: NextRequest, ...args: any[]): Promise<Response | NextResponse<T>> => {
    const startTime = performance.now();
    
    try {
      // Add query optimization headers
      const response = await handler(req, ...args);
      
      const duration = performance.now() - startTime;
      
      // Log slow queries
      if (duration > 1000) {
        console.warn(`Slow API response: ${duration}ms - ${req.url}`);
      }
      
      const headers = new Headers(response.headers);
      headers.set('X-Query-Time', `${duration}ms`);
      
      if (queryConfig.maxRows) {
        headers.set('X-Max-Rows', queryConfig.maxRows.toString());
      }
      
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
      
    } catch (error) {
      console.error('Query optimization middleware error:', error);
      
      return NextResponse.json(
        { error: 'Database query failed' },
        { 
          status: 500,
          headers: {
            'X-Query-Time': `${performance.now() - startTime}ms`,
          },
        }
      );
    }
  };
}

// Memory usage monitoring
export function withMemoryMonitoring<T = any>(
  handler: (req: NextRequest, ...args: any[]) => Promise<Response | NextResponse<T>>
) {
  return async (req: NextRequest, ...args: any[]): Promise<Response | NextResponse<T>> => {
    const startMemory = process.memoryUsage();
    const startTime = performance.now();
    
    try {
      const response = await handler(req, ...args);
      
      const endMemory = process.memoryUsage();
      const duration = performance.now() - startTime;
      
      const memoryDelta = {
        rss: endMemory.rss - startMemory.rss,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        external: endMemory.external - startMemory.external,
      };
      
      // Log high memory usage
      if (memoryDelta.heapUsed > 50 * 1024 * 1024) { // 50MB
        console.warn(`High memory usage detected: ${Math.round(memoryDelta.heapUsed / 1024 / 1024)}MB - ${req.url}`);
      }
      
      const headers = new Headers(response.headers);
      headers.set('X-Memory-Used', `${Math.round(memoryDelta.heapUsed / 1024)}KB`);
      headers.set('X-Response-Time', `${duration}ms`);
      
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
      
    } catch (error) {
      console.error('Memory monitoring middleware error:', error);
      
      return NextResponse.json(
        { error: 'Request processing failed' },
        { 
          status: 500,
          headers: {
            'X-Response-Time': `${performance.now() - startTime}ms`,
          },
        }
      );
    }
  };
}

// Cleanup rate limit map periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute
