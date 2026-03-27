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

    // Get current timestamp for calculations
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all metrics in parallel
    const [
      totalUsers,
      totalSuppliers,
      totalBuyers,
      totalRFQs,
      totalTransactions,
      revenue,
      activeUsers,
      pendingApprovals,
      systemHealth,
      errorRate,
      responseTime
    ] = await Promise.all([
      // User metrics
      prisma.user.count(),
      prisma.user.count({ where: { role: 'supplier' } }),
      prisma.user.count({ where: { role: 'buyer' } }),
      
      // RFQ metrics
      prisma.rFQ.count(),
      
      // Transaction metrics (assuming you have a transactions table)
      prisma.transaction?.count() || Promise.resolve(0),
      
      // Revenue calculation (assuming you have a transactions table with amount field)
      prisma.transaction?.aggregate({
        _sum: { amount: true }
      }).then(result => result._sum.amount || 0) || Promise.resolve(0),
      
      // Active users (users who logged in within last 7 days)
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Pending approvals (RFQs pending admin approval)
      prisma.rFQ.count({
        where: { status: 'pending' }
      }),
      
      // System health (mock data for now - in production this would come from monitoring)
      Promise.resolve('healthy'),
      
      // Error rate (mock data - in production this would come from error tracking)
      Promise.resolve(2.5),
      
      // Response time (mock data - in production this would come from performance monitoring)
      Promise.resolve(150)
    ]);

    // Calculate additional metrics
    const recentRFQs = await prisma.rFQ.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Determine system health based on metrics
    let calculatedSystemHealth = 'healthy';
    if (errorRate > 10) {
      calculatedSystemHealth = 'critical';
    } else if (errorRate > 5 || responseTime > 500) {
      calculatedSystemHealth = 'degraded';
    }

    const metrics = {
      totalUsers,
      totalSuppliers,
      totalBuyers,
      totalRFQs,
      totalTransactions,
      revenue: Number(revenue),
      activeUsers,
      systemHealth: calculatedSystemHealth,
      pendingApprovals,
      errorRate,
      responseTime,
      recentRFQs,
      recentUsers,
      // Additional calculated metrics
      userGrowthRate: recentUsers > 0 ? ((recentUsers / totalUsers) * 100).toFixed(1) : '0',
      rfqGrowthRate: recentRFQs > 0 ? ((recentRFQs / totalRFQs) * 100).toFixed(1) : '0',
      averageOrderValue: totalTransactions > 0 ? (Number(revenue) / totalTransactions) : 0,
      conversionRate: totalRFQs > 0 ? ((totalTransactions / totalRFQs) * 100).toFixed(1) : '0'
    };

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching admin dashboard metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 