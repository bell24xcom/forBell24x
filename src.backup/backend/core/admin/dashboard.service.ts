import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { RealtimeService } from '../services/realtime.service';
import { CloudConfigService } from '../config/cloud.config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DashboardService {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly realtimeService: RealtimeService,
    private readonly cloudConfig: CloudConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getRFQStats(timeRange: { start: Date; end: Date }) {
    return this.analyticsService.getRFQAnalytics(timeRange);
  }

  async getEscrowStats(timeRange: { start: Date; end: Date }) {
    return this.analyticsService.getEscrowAnalytics(timeRange);
  }

  async getUserStats(timeRange: { start: Date; end: Date }) {
    return this.analyticsService.getUserAnalytics(timeRange);
  }

  async getPerformanceMetrics(timeRange: { start: Date; end: Date }) {
    return this.analyticsService.getPerformanceMetrics(timeRange);
  }

  async getSystemHealth() {
    try {
      const [mongodbHealth, redisHealth, elasticsearchHealth] = await Promise.all([
        this.checkMongoDBHealth(),
        this.checkRedisHealth(),
        this.checkElasticsearchHealth(),
      ]);

      return {
        status: 'healthy',
        services: {
          mongodb: mongodbHealth,
          redis: redisHealth,
          elasticsearch: elasticsearchHealth,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  private async checkMongoDBHealth() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.cloudConfig.mongodbConfig.dataApiUrl}/action/ping`,
          {
            headers: {
              'api-key': this.cloudConfig.mongodbConfig.apiKey,
            },
          },
        ),
      );
      return {
        status: 'healthy',
        responseTime: response.headers['x-response-time'],
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  private async checkRedisHealth() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.cloudConfig.redisConfig.url}/ping`),
      );
      return {
        status: 'healthy',
        responseTime: response.headers['x-response-time'],
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  private async checkElasticsearchHealth() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.cloudConfig.elasticsearchConfig.node}/_cluster/health`),
      );
      return {
        status: response.data.status,
        responseTime: response.headers['x-response-time'],
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  async getActiveUsers() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.cloudConfig.mongodbConfig.dataApiUrl}/action/aggregate`,
          {
            data: {
              collection: 'user_sessions',
              pipeline: [
                {
                  $match: {
                    lastActive: {
                      $gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
                    },
                  },
                },
                {
                  $group: {
                    _id: '$userId',
                    lastActive: { $max: '$lastActive' },
                  },
                },
              ],
            },
            headers: {
              'api-key': this.cloudConfig.mongodbConfig.apiKey,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getRecentActivities() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.cloudConfig.mongodbConfig.dataApiUrl}/action/find`,
          {
            data: {
              collection: 'activity_logs',
              filter: {},
              sort: { timestamp: -1 },
              limit: 50,
            },
            headers: {
              'api-key': this.cloudConfig.mongodbConfig.apiKey,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAlerts() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.cloudConfig.mongodbConfig.dataApiUrl}/action/find`,
          {
            data: {
              collection: 'alerts',
              filter: {
                status: 'active',
              },
              sort: { severity: -1, timestamp: -1 },
            },
            headers: {
              'api-key': this.cloudConfig.mongodbConfig.apiKey,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
} 