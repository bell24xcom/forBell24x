import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';
import { logger } from '../lib/logger';

const router = Router();

// Cache key for stats
const STATS_CACHE_KEY = 'platform_stats';
const CACHE_TTL = 300; // 5 minutes

router.get('/', async (req, res) => {
  try {
    // Try to get cached stats
    const cachedStats = await cache.get(STATS_CACHE_KEY);
    if (cachedStats) {
      return res.json(JSON.parse(cachedStats));
    }

    // Fetch real-time stats from database
    const [
      activeSuppliers,
      activeRFQs,
      completedTransactions,
      totalUsers,
      totalQuotes,
      averageResponseTime,
      successRate,
    ] = await Promise.all([
      // Active suppliers (verified and active)
      prisma.user.count({
        where: {
          role: 'SUPPLIER',
          status: 'ACTIVE',
          company: {
            verificationStatus: 'VERIFIED',
          },
        },
      }),
      // Active RFQs
      prisma.rfq.count({
        where: {
          status: 'OPEN',
        },
      }),
      // Completed transactions
      prisma.transaction.count({
        where: {
          status: 'COMPLETED',
        },
      }),
      // Total users
      prisma.user.count(),
      // Total quotes
      prisma.quote.count(),
      // Average response time (in hours)
      prisma.quote.aggregate({
        _avg: {
          responseTime: true,
        },
      }),
      // Success rate (completed transactions / total transactions)
      prisma.transaction.aggregate({
        _count: {
          id: true,
        },
        where: {
          status: 'COMPLETED',
        },
      }).then(completed => {
        return prisma.transaction.count().then(total => {
          return total > 0 ? (completed._count.id / total) * 100 : 0;
        });
      }),
    ]);

    const stats = {
      activeSuppliers,
      activeRFQs,
      completedTransactions,
      totalUsers,
      totalQuotes,
      averageResponseTime: averageResponseTime._avg.responseTime || 0,
      successRate,
    };

    // Cache the stats
    await cache.set(STATS_CACHE_KEY, JSON.stringify(stats), CACHE_TTL);

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router; 