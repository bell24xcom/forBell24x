export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withPerformance } from '@/middleware/performance';
import { CacheManager } from '@/lib/cache';
import { DatabaseOptimizer } from '@/lib/database-optimization';

// Mock performance data - in production, this would come from real monitoring
const getMockPerformanceMetrics = () => {
  return {
    coreWebVitals: {
      LCP: Math.random() * 2000 + 1000, // 1000-3000ms
      FID: Math.random() * 200 + 50,   // 50-250ms
      CLS: Math.random() * 0.2 + 0.05, // 0.05-0.25
      FCP: Math.random() * 1500 + 800, // 800-2300ms
      TTFB: Math.random() * 500 + 200, // 200-700ms
    },
    memory: {
      used: Math.random() * 1000 + 500, // 500-1500MB
      total: 2048, // 2GB
      percentage: Math.random() * 50 + 25, // 25-75%
    },
    database: {
      connections: Math.floor(Math.random() * 15 + 5), // 5-20
      maxConnections: 20,
      queryTime: Math.random() * 100 + 20, // 20-120ms
      slowQueries: Math.floor(Math.random() * 5), // 0-5
    },
    cache: {
      hitRate: Math.random() * 20 + 80, // 80-100%
      size: Math.random() * 50000 + 10000, // 10-60KB
      keys: Math.floor(Math.random() * 1000 + 100), // 100-1100
    },
    api: {
      responseTime: Math.random() * 200 + 50, // 50-250ms
      requestsPerMinute: Math.floor(Math.random() * 100 + 50), // 50-150
      errorRate: Math.random() * 2, // 0-2%
    },
  };
};

const performanceHandler = async (req: NextRequest) => {
  try {
    // Get real metrics from monitoring systems
    const cache = CacheManager.getInstance();
    const dbOptimizer = DatabaseOptimizer.getInstance();
    
    // Try to get cached metrics first
    const cacheKey = 'performance:metrics';
    let metrics = await cache.get(cacheKey);
    
    if (!metrics) {
      // Generate fresh metrics
      metrics = getMockPerformanceMetrics();
      
      // In production, you would:
      // 1. Get real Core Web Vitals from analytics
      // 2. Get memory usage from process.memoryUsage()
      // 3. Get database stats from connection pool
      // 4. Get cache stats from Redis
      // 5. Get API metrics from monitoring service
      
      // Cache for 30 seconds
      await cache.set(cacheKey, metrics, { ttl: 30 });
    }
    
    // Add real-time data
    const realTimeData = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    };
    
    const response = {
      ...(metrics ?? {}),
      realTime: realTimeData,
      cache: cache.getStats(),
      database: dbOptimizer.getPoolStats(),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Performance metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
};

// Apply performance middleware
export const GET = withPerformance(performanceHandler, {
  cache: {
    ttl: 30, // 30 seconds
    tags: ['performance', 'metrics'],
  },
  rateLimit: {
    max: 60, // 60 requests per minute
    windowMs: 60000,
  },
});
