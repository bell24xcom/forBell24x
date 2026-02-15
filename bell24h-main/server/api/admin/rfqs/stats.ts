import { Request, Response } from 'express';
import { authenticate } from '../../../middleware/auth.js';
import { isAdmin } from '../../../middleware/auth.js';
import { prisma } from '../../../db/client.js';

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

    // Fetch RFQ statistics in parallel
    const [
      total,
      pending,
      approved,
      rejected,
      flagged,
      completed,
      urgent,
      featured,
      recentRFQs,
      categoryStats,
      statusTrends
    ] = await Promise.all([
      // Total RFQs
      prisma.rFQ.count(),
      
      // Status-based counts
      prisma.rFQ.count({ where: { status: 'pending' } }),
      prisma.rFQ.count({ where: { status: 'approved' } }),
      prisma.rFQ.count({ where: { status: 'rejected' } }),
      prisma.rFQ.count({ where: { status: 'flagged' } }),
      prisma.rFQ.count({ where: { status: 'completed' } }),
      
      // Special flags
      prisma.rFQ.count({ where: { isUrgent: true } }),
      prisma.rFQ.count({ where: { isFeatured: true } }),
      
      // Recent RFQs (last 30 days)
      prisma.rFQ.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      
      // Category distribution
      getCategoryStats(),
      
      // Status trends over time
      getStatusTrends(thirtyDaysAgo, now)
    ]);

    const stats = {
      total,
      pending,
      approved,
      rejected,
      flagged,
      completed,
      urgent,
      featured,
      recentRFQs,
      categoryStats,
      statusTrends,
      // Calculated metrics
      approvalRate: total > 0 ? ((approved + completed) / total * 100).toFixed(1) : '0',
      rejectionRate: total > 0 ? (rejected / total * 100).toFixed(1) : '0',
      completionRate: total > 0 ? (completed / total * 100).toFixed(1) : '0',
      growthRate: total > 0 ? ((recentRFQs / total) * 100).toFixed(1) : '0'
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching RFQ stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch RFQ statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function getCategoryStats() {
  const categories = await prisma.rFQ.groupBy({
    by: ['category'],
    _count: {
      category: true
    }
  });

  return categories.map(cat => ({
    name: cat.category,
    value: cat._count.category
  }));
}

async function getStatusTrends(startDate: Date, endDate: Date) {
  // Get RFQs grouped by status and date
  const rfqs = await prisma.rFQ.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      status: true,
      createdAt: true
    }
  });

  // Group by week and status
  const weeklyStats: { [key: string]: { [key: string]: number } } = {};
  
  rfqs.forEach(rfq => {
    const weekStart = getWeekStart(rfq.createdAt);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyStats[weekKey]) {
      weeklyStats[weekKey] = {
        pending: 0,
        approved: 0,
        rejected: 0,
        flagged: 0,
        completed: 0
      };
    }
    
    weeklyStats[weekKey][rfq.status] = (weeklyStats[weekKey][rfq.status] || 0) + 1;
  });

  // Convert to array format
  return Object.entries(weeklyStats).map(([week, stats]) => ({
    week,
    ...stats
  }));
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
} 