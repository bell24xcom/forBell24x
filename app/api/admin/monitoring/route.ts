import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch system monitoring data in parallel
    const [
      totalUsers,
      activeUsers,
      totalRfqs,
      activeRfqs,
      totalTransactions,
      completedTransactions,
      systemErrors,
      recentActivity,
      performanceMetrics
    ] = await Promise.all([
      // User metrics
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      
      // RFQ metrics
      prisma.rfq.count(),
      prisma.rfq.count({ where: { status: 'ACTIVE' } }),
      
      // Transaction metrics
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'COMPLETED' } }),
      
      // System errors (mock data for now)
      Promise.resolve(0), // No error tracking table yet
      
      // Recent activity
      prisma.rfq.findMany({
        where: {
          createdAt: { gte: last24Hours }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          buyer: {
            select: {
              name: true
            }
          }
        }
      }),
      
      // Performance metrics (mock data)
      Promise.resolve({
        responseTime: 245, // ms
        uptime: 99.9, // percentage
        cpuUsage: 45.2, // percentage
        memoryUsage: 67.8, // percentage
        diskUsage: 23.4 // percentage
      })
    ]);

    // Calculate system health score
    const transactionSuccessRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 100;
    const userActivityRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 100;
    const systemHealth = Math.round(((transactionSuccessRate + userActivityRate + performanceMetrics.uptime) / 3) * 10) / 10;

    // Calculate growth metrics
    const userGrowth = await prisma.user.count({
      where: {
        createdAt: { gte: last7Days }
      }
    });

    const rfqGrowth = await prisma.rfq.count({
      where: {
        createdAt: { gte: last7Days }
      }
    });

    const monitoring = {
      systemHealth,
      metrics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          growth: userGrowth
        },
        rfqs: {
          total: totalRfqs,
          active: activeRfqs,
          growth: rfqGrowth
        },
        transactions: {
          total: totalTransactions,
          completed: completedTransactions,
          successRate: Math.round(transactionSuccessRate * 10) / 10
        },
        errors: {
          total: systemErrors,
          last24Hours: 0 // Mock data
        }
      },
      performance: performanceMetrics,
      recentActivity: recentActivity.map(activity => ({
        ...activity,
        type: 'rfq',
        description: `New RFQ: ${activity.title}`,
        user: activity.buyer.name,
        timeAgo: Math.round((now.getTime() - activity.createdAt.getTime()) / (1000 * 60)) // minutes ago
      })),
      alerts: [
        ...(systemHealth < 95 ? [{
          type: 'warning',
          message: 'System health is below optimal threshold',
          timestamp: now.toISOString()
        }] : []),
        ...(performanceMetrics.responseTime > 500 ? [{
          type: 'warning',
          message: 'Response time is higher than expected',
          timestamp: now.toISOString()
        }] : []),
        ...(performanceMetrics.memoryUsage > 80 ? [{
          type: 'critical',
          message: 'Memory usage is critically high',
          timestamp: now.toISOString()
        }] : [])
      ],
      lastUpdated: now.toISOString()
    };

    return NextResponse.json(monitoring);
    
  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch monitoring data' 
    }, { status: 500 });
  }
}
