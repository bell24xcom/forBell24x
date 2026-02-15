import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics/AnalyticsService';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { logger } from '../utils/logger';

const analyticsService = new AnalyticsService(prisma, redis);

export class AnalyticsController {
  // Get user engagement metrics
  public async getUserEngagement(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const engagement = await analyticsService.getUserEngagement(userId);
      res.json(engagement);
    } catch (error) {
      logger.error('Error getting user engagement:', error);
      res.status(500).json({ error: 'Failed to get user engagement metrics' });
    }
  }

  // Get business metrics
  public async getBusinessMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await analyticsService.generateBusinessReports();
      res.json(metrics);
    } catch (error) {
      logger.error('Error getting business metrics:', error);
      res.status(500).json({ error: 'Failed to get business metrics' });
    }
  }

  // Get system health metrics
  public async getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await analyticsService.monitorSystemHealth();
      res.json(health);
    } catch (error) {
      logger.error('Error getting system health:', error);
      res.status(500).json({ error: 'Failed to get system health metrics' });
    }
  }

  // Track user behavior
  public async trackUserBehavior(req: Request, res: Response): Promise<void> {
    try {
      const { userId, action, metadata } = req.body;
      await analyticsService.trackUserBehavior(userId, action, metadata);
      res.status(200).json({ message: 'User behavior tracked successfully' });
    } catch (error) {
      logger.error('Error tracking user behavior:', error);
      res.status(500).json({ error: 'Failed to track user behavior' });
    }
  }

  // Export analytics data
  public async exportAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const format = req.query.format as 'json' | 'csv' | 'pdf';
      if (!format || !['json', 'csv', 'pdf'].includes(format)) {
        res.status(400).json({ error: 'Invalid export format' });
        return;
      }

      const data = await analyticsService.exportAnalytics(format);
      
      // Set appropriate headers based on format
      switch (format) {
        case 'json':
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', 'attachment; filename=analytics.json');
          break;
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
          break;
        case 'pdf':
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename=analytics.pdf');
          break;
      }

      res.send(data);
    } catch (error) {
      logger.error('Error exporting analytics:', error);
      res.status(500).json({ error: 'Failed to export analytics data' });
    }
  }
} 