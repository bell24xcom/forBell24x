import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CloudConfigService } from '../config/cloud.config';
import { Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly cloudConfig: CloudConfigService,
  ) {}

  async logEvent(collection: string, event: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.cloudConfig.mongodbConfig.dataApiUrl}/action/insertOne`,
          {
            collection,
            document: {
              ...event,
              timestamp: new Date(),
            },
          },
          {
            headers: {
              'api-key': this.cloudConfig.mongodbConfig.apiKey,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error logging event: ${error.message}`);
      throw error;
    }
  }

  async getAnalytics(collection: string, pipeline: any[]) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.cloudConfig.mongodbConfig.dataApiUrl}/action/aggregate`,
          {
            collection,
            pipeline,
          },
          {
            headers: {
              'api-key': this.cloudConfig.mongodbConfig.apiKey,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error getting analytics: ${error.message}`);
      throw error;
    }
  }

  async searchDocuments(index: string, query: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.cloudConfig.elasticsearchConfig.node}/${index}/_search`,
          query,
          {
            headers: {
              Authorization: `Basic ${Buffer.from(
                `${this.cloudConfig.elasticsearchConfig.username}:${this.cloudConfig.elasticsearchConfig.password}`,
              ).toString('base64')}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error searching documents: ${error.message}`);
      throw error;
    }
  }

  async getRFQAnalytics(timeRange: { start: Date; end: Date }) {
    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: timeRange.start,
            $lte: timeRange.end,
          },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
        },
      },
    ];

    return this.getAnalytics('rfq_events', pipeline);
  }

  async getEscrowAnalytics(timeRange: { start: Date; end: Date }) {
    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: timeRange.start,
            $lte: timeRange.end,
          },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ];

    return this.getAnalytics('escrow_events', pipeline);
  }

  async getUserAnalytics(timeRange: { start: Date; end: Date }) {
    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: timeRange.start,
            $lte: timeRange.end,
          },
        },
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
    ];

    return this.getAnalytics('user_events', pipeline);
  }

  async getPerformanceMetrics(timeRange: { start: Date; end: Date }) {
    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: timeRange.start,
            $lte: timeRange.end,
          },
        },
      },
      {
        $group: {
          _id: '$metric',
          avgValue: { $avg: '$value' },
          minValue: { $min: '$value' },
          maxValue: { $max: '$value' },
        },
      },
    ];

    return this.getAnalytics('performance_metrics', pipeline);
  }
} 