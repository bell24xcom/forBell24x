import { Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin } from '../../middleware/auth.js';
import { prisma } from '../../db/client.js';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply authentication and admin authorization
    await authenticate(req, res, () => {});
    isAdmin(req, res, () => {});

    const { timeRange = '30d' } = req.query;
    
    // Calculate date range based on timeRange parameter
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch analytics data in parallel
    const [
      userEngagement,
      businessMetrics,
      performanceMetrics,
      timeSeriesData,
      categoryDistribution,
      geographicData
    ] = await Promise.all([
      // User Engagement Metrics
      getUserEngagement(startDate, now),
      
      // Business Metrics
      getBusinessMetrics(startDate, now),
      
      // Performance Metrics
      getPerformanceMetrics(),
      
      // Time Series Data
      getTimeSeriesData(startDate, now),
      
      // Category Distribution
      getCategoryDistribution(startDate, now),
      
      // Geographic Data
      getGeographicData(startDate, now)
    ]);

    const analyticsData = {
      userEngagement,
      businessMetrics,
      performanceMetrics,
      timeSeriesData,
      categoryDistribution,
      geographicData
    };

    res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function getUserEngagement(startDate: Date, endDate: Date) {
  const totalUsers = await prisma.user.count();
  const activeUsers = await prisma.user.count({
    where: {
      lastLoginAt: {
        gte: new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  });
  
  const newUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Mock data for engagement metrics (in production, these would come from analytics tracking)
  return {
    totalUsers,
    activeUsers,
    newUsers,
    retentionRate: 85.5,
    sessionDuration: 12.5, // minutes
    pageViews: 45.2,
    bounceRate: 32.1,
    conversionRate: 8.7
  };
}

async function getBusinessMetrics(startDate: Date, endDate: Date) {
  const totalRevenue = await prisma.transaction?.aggregate({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: { amount: true }
  }).then(result => result._sum.amount || 0) || 0;

  const totalRFQs = await prisma.rFQ.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const completedRFQs = await prisma.rFQ.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      status: 'completed'
    }
  });

  const totalTransactions = await prisma.transaction?.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  }) || 0;

  return {
    totalRevenue: Number(totalRevenue),
    revenueGrowth: 15.2, // percentage
    totalRFQs,
    rfqCompletionRate: totalRFQs > 0 ? (completedRFQs / totalRFQs) * 100 : 0,
    averageOrderValue: totalTransactions > 0 ? Number(totalRevenue) / totalTransactions : 0,
    customerLifetimeValue: 25000, // mock data
    supplierResponseTime: 2.4 // days
  };
}

async function getPerformanceMetrics() {
  // Mock performance metrics (in production, these would come from monitoring systems)
  return {
    apiResponseTime: 150, // ms
    errorRate: 2.5, // percentage
    uptime: 99.9, // percentage
    throughput: 1250, // requests per second
    serverLoad: 45.2, // percentage
    memoryUsage: 67.8, // percentage
    diskUsage: 34.1 // percentage
  };
}

async function getTimeSeriesData(startDate: Date, endDate: Date) {
  // Generate time series data for the specified range
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const users: Array<{ date: string; count: number }> = [];
  const revenue: Array<{ date: string; amount: number }> = [];
  const rfqs: Array<{ date: string; count: number }> = [];
  const transactions: Array<{ date: string; count: number }> = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    // Mock data with some realistic variation
    const baseUsers = 100 + Math.random() * 50;
    const baseRevenue = 50000 + Math.random() * 25000;
    const baseRFQs = 10 + Math.random() * 15;
    const baseTransactions = 5 + Math.random() * 10;

    users.push({
      date: dateStr,
      count: Math.floor(baseUsers)
    });

    revenue.push({
      date: dateStr,
      amount: Math.floor(baseRevenue)
    });

    rfqs.push({
      date: dateStr,
      count: Math.floor(baseRFQs)
    });

    transactions.push({
      date: dateStr,
      count: Math.floor(baseTransactions)
    });
  }

  return {
    users,
    revenue,
    rfqs,
    transactions
  };
}

async function getCategoryDistribution(startDate: Date, endDate: Date) {
  // Mock category distribution data
  return [
    { name: 'Electronics', value: 35 },
    { name: 'Machinery', value: 25 },
    { name: 'Textiles', value: 20 },
    { name: 'Chemicals', value: 15 },
    { name: 'Services', value: 5 }
  ];
}

async function getGeographicData(startDate: Date, endDate: Date) {
  // Mock geographic data
  return [
    { region: 'North India', users: 1250, revenue: 2500000 },
    { region: 'South India', users: 980, revenue: 1800000 },
    { region: 'East India', users: 750, revenue: 1200000 },
    { region: 'West India', users: 1100, revenue: 2200000 },
    { region: 'Central India', users: 450, revenue: 800000 }
  ];
} 