import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { AdvancedAnalytics, UserEngagement, BusinessMetrics, PerformanceMetrics } from '../types';
import { logger } from '../../utils/logger';
import { redisService } from '../cache/RedisService';
import { db } from '../database';

interface AnalyticsData {
  timestamp: Date;
  category: string;
  action: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface AnalyticsQuery {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  action?: string;
  userId?: string;
  groupBy?: string;
  limit?: number;
  offset?: number;
}

interface AnalyticsResult {
  total: number;
  data: any[];
  aggregations?: Record<string, any>;
}

export class AnalyticsService extends EventEmitter {
  private prisma: PrismaClient;
  private redis: Redis;
  private cacheTTL: number = 300; // 5 minutes

  constructor(prisma: PrismaClient, redis: Redis) {
    super();
    this.prisma = prisma;
    this.redis = redis;
  }

  // User Engagement Analytics
  public async trackUserBehavior(userId: string, action: string, metadata: any): Promise<void> {
    try {
      const event = {
        userId,
        action,
        metadata,
        timestamp: new Date()
      };

      // Store in database
      await this.prisma.userEvent.create({
        data: event
      });

      // Update real-time metrics in Redis
      await this.updateRealtimeMetrics(userId, action);

      this.emit('user:event', event);
    } catch (error) {
      this.emit('error', { error, context: 'trackUserBehavior' });
      throw error;
    }
  }

  public async getUserEngagement(userId: string): Promise<UserEngagement> {
    const cacheKey = `user:engagement:${userId}`;
    
    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Calculate from database
    const [sessionDuration, pageViews, bounceRate, conversionRate] = await Promise.all([
      this.calculateSessionDuration(userId),
      this.getPageViews(userId),
      this.calculateBounceRate(userId),
      this.calculateConversionRate(userId)
    ]);

    const engagement: UserEngagement = {
      sessionDuration,
      pageViews,
      bounceRate,
      conversionRate
    };

    // Cache the result
    await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(engagement));

    return engagement;
  }

  // Business Metrics
  public async generateBusinessReports(): Promise<BusinessMetrics> {
    const cacheKey = 'business:metrics';
    
    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const [rfqCompletionRate, supplierResponseTime, averageOrderValue, customerLifetimeValue] = await Promise.all([
      this.calculateRFQCompletionRate(),
      this.calculateSupplierResponseTime(),
      this.calculateAverageOrderValue(),
      this.calculateCustomerLifetimeValue()
    ]);

    const metrics: BusinessMetrics = {
      rfqCompletionRate,
      supplierResponseTime,
      averageOrderValue,
      customerLifetimeValue
    };

    // Cache the result
    await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(metrics));

    return metrics;
  }

  // Performance Metrics
  public async monitorSystemHealth(): Promise<PerformanceMetrics> {
    const cacheKey = 'system:health';
    
    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const [apiResponseTime, errorRate, uptime, throughput] = await Promise.all([
      this.calculateAverageResponseTime(),
      this.calculateErrorRate(),
      this.calculateUptime(),
      this.calculateThroughput()
    ]);

    const metrics: PerformanceMetrics = {
      apiResponseTime,
      errorRate,
      uptime,
      throughput
    };

    // Cache the result
    await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(metrics));

    return metrics;
  }

  // Private helper methods
  private async calculateSessionDuration(userId: string): Promise<number> {
    const sessions = await this.prisma.userSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: 100
    });

    return sessions.reduce((acc, session) => {
      const duration = session.endTime.getTime() - session.startTime.getTime();
      return acc + duration;
    }, 0) / sessions.length;
  }

  private async getPageViews(userId: string): Promise<number> {
    return this.prisma.pageView.count({
      where: { userId }
    });
  }

  private async calculateBounceRate(userId: string): Promise<number> {
    const totalSessions = await this.prisma.userSession.count({
      where: { userId }
    });

    const bouncedSessions = await this.prisma.userSession.count({
      where: {
        userId,
        pageViews: { equals: 1 }
      }
    });

    return (bouncedSessions / totalSessions) * 100;
  }

  private async calculateConversionRate(userId: string): Promise<number> {
    const totalRFQs = await this.prisma.rfq.count({
      where: { userId }
    });

    const completedRFQs = await this.prisma.rfq.count({
      where: {
        userId,
        status: 'COMPLETED'
      }
    });

    return (completedRFQs / totalRFQs) * 100;
  }

  private async calculateRFQCompletionRate(): Promise<number> {
    const totalRFQs = await this.prisma.rfq.count();
    const completedRFQs = await this.prisma.rfq.count({
      where: { status: 'COMPLETED' }
    });

    return (completedRFQs / totalRFQs) * 100;
  }

  private async calculateSupplierResponseTime(): Promise<number> {
    const responses = await this.prisma.rfqResponse.findMany({
      select: {
        createdAt: true,
        rfq: {
          select: {
            createdAt: true
          }
        }
      }
    });

    return responses.reduce((acc, response) => {
      const responseTime = response.createdAt.getTime() - response.rfq.createdAt.getTime();
      return acc + responseTime;
    }, 0) / responses.length;
  }

  private async calculateAverageOrderValue(): Promise<number> {
    const orders = await this.prisma.order.findMany({
      select: { totalAmount: true }
    });

    return orders.reduce((acc, order) => acc + order.totalAmount, 0) / orders.length;
  }

  private async calculateCustomerLifetimeValue(): Promise<number> {
    const customers = await this.prisma.user.findMany({
      where: { role: 'BUYER' },
      include: {
        orders: {
          select: { totalAmount: true }
        }
      }
    });

    return customers.reduce((acc, customer) => {
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      return acc + totalSpent;
    }, 0) / customers.length;
  }

  private async calculateAverageResponseTime(): Promise<number> {
    const responseTimes = await this.prisma.apiLog.findMany({
      select: { responseTime: true },
      orderBy: { timestamp: 'desc' },
      take: 1000
    });

    return responseTimes.reduce((acc, log) => acc + log.responseTime, 0) / responseTimes.length;
  }

  private async calculateErrorRate(): Promise<number> {
    const totalRequests = await this.prisma.apiLog.count();
    const errorRequests = await this.prisma.apiLog.count({
      where: {
        statusCode: {
          gte: 400
        }
      }
    });

    return (errorRequests / totalRequests) * 100;
  }

  private async calculateUptime(): Promise<number> {
    const totalChecks = await this.prisma.healthCheck.count();
    const successfulChecks = await this.prisma.healthCheck.count({
      where: { status: 'HEALTHY' }
    });

    return (successfulChecks / totalChecks) * 100;
  }

  private async calculateThroughput(): Promise<number> {
    const recentLogs = await this.prisma.apiLog.findMany({
      select: { timestamp: true },
      orderBy: { timestamp: 'desc' },
      take: 1000
    });

    if (recentLogs.length < 2) return 0;

    const timeSpan = recentLogs[0].timestamp.getTime() - recentLogs[recentLogs.length - 1].timestamp.getTime();
    return (recentLogs.length / timeSpan) * 1000; // requests per second
  }

  private async updateRealtimeMetrics(userId: string, action: string): Promise<void> {
    const pipeline = this.redis.pipeline();

    // Update user-specific metrics
    pipeline.hincrby(`user:${userId}:metrics`, 'totalActions', 1);
    pipeline.hincrby(`user:${userId}:metrics`, `action:${action}`, 1);

    // Update global metrics
    pipeline.hincrby('global:metrics', 'totalActions', 1);
    pipeline.hincrby('global:metrics', `action:${action}`, 1);

    await pipeline.exec();
  }

  // Export functionality
  public async exportAnalytics(format: 'json' | 'csv' | 'pdf'): Promise<Buffer> {
    const [userEngagement, businessMetrics, performanceMetrics] = await Promise.all([
      this.getUserEngagement('all'),
      this.generateBusinessReports(),
      this.monitorSystemHealth()
    ]);

    const data = {
      userEngagement,
      businessMetrics,
      performanceMetrics,
      timestamp: new Date()
    };

    switch (format) {
      case 'json':
        return Buffer.from(JSON.stringify(data, null, 2));
      case 'csv':
        return this.convertToCSV(data);
      case 'pdf':
        return this.generatePDF(data);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private async convertToCSV(data: any): Promise<Buffer> {
    // Implement CSV conversion logic
    return Buffer.from(''); // Placeholder
  }

  private async generatePDF(data: any): Promise<Buffer> {
    // Implement PDF generation logic
    return Buffer.from(''); // Placeholder
  }

  // Track analytics event
  public async trackEvent(data: AnalyticsData): Promise<void> {
    try {
      // Store in database
      await db.collection('analytics').insertOne({
        ...data,
        timestamp: new Date()
      });

      // Update real-time metrics in Redis
      const key = `analytics:${data.category}:${data.action}`;
      await redisService.increment(key);
      await redisService.expire(key, this.CACHE_TTL);

      // Log event
      logger.info('Analytics event tracked', { data });
    } catch (error) {
      logger.error('Error tracking analytics event', { error, data });
      throw error;
    }
  }

  // Get analytics data
  public async getAnalytics(query: AnalyticsQuery): Promise<AnalyticsResult> {
    try {
      const { startDate, endDate, category, action, userId, groupBy, limit = 100, offset = 0 } = query;

      // Build query
      const filter: any = {};
      if (startDate) filter.timestamp = { $gte: startDate };
      if (endDate) filter.timestamp = { ...filter.timestamp, $lte: endDate };
      if (category) filter.category = category;
      if (action) filter.action = action;
      if (userId) filter.userId = userId;

      // Get total count
      const total = await db.collection('analytics').countDocuments(filter);

      // Build aggregation pipeline
      const pipeline: any[] = [
        { $match: filter },
        { $sort: { timestamp: -1 } },
        { $skip: offset },
        { $limit: limit }
      ];

      // Add grouping if specified
      if (groupBy) {
        pipeline.push({
          $group: {
            _id: `$${groupBy}`,
            count: { $sum: 1 },
            data: { $push: '$$ROOT' }
          }
        });
      }

      // Execute query
      const data = await db.collection('analytics').aggregate(pipeline).toArray();

      // Get aggregations
      const aggregations = await this.getAggregations(filter);

      return {
        total,
        data,
        aggregations
      };
    } catch (error) {
      logger.error('Error getting analytics data', { error, query });
      throw error;
    }
  }

  // Get aggregations
  private async getAggregations(filter: any): Promise<Record<string, any>> {
    try {
      const pipeline = [
        { $match: filter },
        {
          $facet: {
            byCategory: [
              { $group: { _id: '$category', count: { $sum: 1 } } }
            ],
            byAction: [
              { $group: { _id: '$action', count: { $sum: 1 } } }
            ],
            byUser: [
              { $group: { _id: '$userId', count: { $sum: 1 } } }
            ],
            byTime: [
              {
                $group: {
                  _id: {
                    year: { $year: '$timestamp' },
                    month: { $month: '$timestamp' },
                    day: { $dayOfMonth: '$timestamp' }
                  },
                  count: { $sum: 1 }
                }
              }
            ]
          }
        }
      ];

      const [result] = await db.collection('analytics').aggregate(pipeline).toArray();
      return result;
    } catch (error) {
      logger.error('Error getting aggregations', { error });
      throw error;
    }
  }

  // Get real-time metrics
  public async getRealTimeMetrics(): Promise<Record<string, number>> {
    try {
      const keys = await redisService.keys('analytics:*');
      const metrics: Record<string, number> = {};

      for (const key of keys) {
        const value = await redisService.get<number>(key);
        if (value !== null) {
          metrics[key] = value;
        }
      }

      return metrics;
    } catch (error) {
      logger.error('Error getting real-time metrics', { error });
      throw error;
    }
  }

  // Generate report
  public async generateReport(query: AnalyticsQuery): Promise<any> {
    try {
      const data = await this.getAnalytics(query);
      const metrics = await this.getRealTimeMetrics();

      return {
        timestamp: new Date(),
        query,
        data: data.data,
        total: data.total,
        aggregations: data.aggregations,
        realTimeMetrics: metrics
      };
    } catch (error) {
      logger.error('Error generating report', { error });
      throw error;
    }
  }

  // Export analytics data
  public async exportData(query: AnalyticsQuery, format: 'csv' | 'json' | 'excel'): Promise<string> {
    try {
      const data = await this.getAnalytics(query);
      let exportData: string;

      switch (format) {
        case 'csv':
          exportData = this.convertToCSV(data.data);
          break;
        case 'json':
          exportData = JSON.stringify(data.data, null, 2);
          break;
        case 'excel':
          exportData = this.convertToExcel(data.data);
          break;
        default:
          throw new Error('Unsupported export format');
      }

      return exportData;
    } catch (error) {
      logger.error('Error exporting analytics data', { error });
      throw error;
    }
  }

  // Convert data to CSV
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(item => headers.map(header => item[header]).join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  // Convert data to Excel
  private convertToExcel(data: any[]): string {
    // Implementation would depend on the Excel library being used
    // This is a placeholder
    return JSON.stringify(data);
  }
} 