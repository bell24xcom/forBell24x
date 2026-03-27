import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { authenticateToken } from '../../../middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = await authenticateToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = user.id;
    const userRole = user.role?.toLowerCase();
    const subscriptionPlan = user.subscription?.plan || 'free';

    // Get user-specific metrics based on role and subscription
    const metrics = await getUserDashboardMetrics(userId, userRole, subscriptionPlan);

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
}

async function getUserDashboardMetrics(userId: string, userRole: string, subscriptionPlan: string) {
  const baseMetrics = {
    totalRFQs: 0,
    activeBids: 0,
    completedTransactions: 0,
    revenue: 0,
    supplierRating: 0,
    buyerRating: 0,
    pendingApprovals: 0,
    recentActivity: [],
    subscriptionPlan,
    userRole
  };

  try {
    // Get user with company and preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
        rfqs: true,
        quotes: true,
        buyerTransactions: true,
        supplierTransactions: true,
        notifications: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return baseMetrics;
    }

    // Calculate metrics based on user role
    if (userRole === 'buyer' || userRole === 'business' || userRole === 'enterprise') {
      // Buyer metrics
      const buyerMetrics = await calculateBuyerMetrics(user);
      return {
        ...baseMetrics,
        ...buyerMetrics
      };
    } else if (userRole === 'supplier') {
      // Supplier metrics
      const supplierMetrics = await calculateSupplierMetrics(user);
      return {
        ...baseMetrics,
        ...supplierMetrics
      };
    } else {
      // Dual role or unknown role - calculate both
      const buyerMetrics = await calculateBuyerMetrics(user);
      const supplierMetrics = await calculateSupplierMetrics(user);
      return {
        ...baseMetrics,
        ...buyerMetrics,
        ...supplierMetrics,
        hasBothRoles: true
      };
    }
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return baseMetrics;
  }
}

async function calculateBuyerMetrics(user: any) {
  const totalRFQs = user.rfqs?.length || 0;
  
  // Get active bids for user's RFQs
  const activeBids = await prisma.quote.count({
    where: {
      rfqId: {
        in: user.rfqs?.map((rfq: any) => rfq.id) || []
      },
      status: 'PENDING'
    }
  });

  // Get completed transactions
  const completedTransactions = user.buyerTransactions?.filter((tx: any) => 
    tx.status === 'COMPLETED'
  ).length || 0;

  // Calculate total spent
  const revenue = user.buyerTransactions
    ?.filter((tx: any) => tx.status === 'COMPLETED')
    ?.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0;

  // Get buyer rating (average rating from suppliers)
  const buyerRating = await calculateBuyerRating(user.id);

  // Get recent activity
  const recentActivity = await getRecentActivity(user.id, 'buyer');

  return {
    totalRFQs,
    activeBids,
    completedTransactions,
    revenue,
    buyerRating,
    recentActivity
  };
}

async function calculateSupplierMetrics(user: any) {
  // Get active bids submitted by supplier
  const activeBids = user.quotes?.filter((quote: any) => 
    quote.status === 'PENDING'
  ).length || 0;

  // Get completed transactions
  const completedTransactions = user.supplierTransactions?.filter((tx: any) => 
    tx.status === 'COMPLETED'
  ).length || 0;

  // Calculate total earned
  const revenue = user.supplierTransactions
    ?.filter((tx: any) => tx.status === 'COMPLETED')
    ?.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0;

  // Get supplier rating
  const supplierRating = await calculateSupplierRating(user.id);

  // Get recent activity
  const recentActivity = await getRecentActivity(user.id, 'supplier');

  return {
    activeBids,
    completedTransactions,
    revenue,
    supplierRating,
    recentActivity
  };
}

async function calculateBuyerRating(userId: string): Promise<number> {
  try {
    const ratings = await prisma.transaction.findMany({
      where: {
        buyerId: userId,
        status: 'COMPLETED',
        buyerRating: {
          not: null
        }
      },
      select: {
        buyerRating: true
      }
    });

    if (ratings.length === 0) return 0;

    const averageRating = ratings.reduce((sum, rating) => 
      sum + (rating.buyerRating || 0), 0
    ) / ratings.length;

    return Math.round(averageRating * 10) / 10; // Round to 1 decimal place
  } catch (error) {
    console.error('Error calculating buyer rating:', error);
    return 0;
  }
}

async function calculateSupplierRating(userId: string): Promise<number> {
  try {
    const ratings = await prisma.transaction.findMany({
      where: {
        supplierId: userId,
        status: 'COMPLETED',
        supplierRating: {
          not: null
        }
      },
      select: {
        supplierRating: true
      }
    });

    if (ratings.length === 0) return 0;

    const averageRating = ratings.reduce((sum, rating) => 
      sum + (rating.supplierRating || 0), 0
    ) / ratings.length;

    return Math.round(averageRating * 10) / 10; // Round to 1 decimal place
  } catch (error) {
    console.error('Error calculating supplier rating:', error);
    return 0;
  }
}

async function getRecentActivity(userId: string, role: string) {
  try {
    const activities = [];

    // Get recent RFQs (for buyers)
    if (role === 'buyer') {
      const recentRFQs = await prisma.rFQ.findMany({
        where: { buyerId: userId },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true
        }
      });

      activities.push(...recentRFQs.map(rfq => ({
        type: 'rfq_created',
        title: `RFQ: ${rfq.title}`,
        status: rfq.status,
        date: rfq.createdAt
      })));
    }

    // Get recent bids (for suppliers)
    if (role === 'supplier') {
      const recentBids = await prisma.quote.findMany({
        where: { supplierId: userId },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          rfq: {
            select: {
              title: true
            }
          }
        }
      });

      activities.push(...recentBids.map(bid => ({
        type: 'bid_submitted',
        title: `Bid for: ${bid.rfq.title}`,
        amount: bid.amount,
        status: bid.status,
        date: bid.createdAt
      })));
    }

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { supplierId: userId }
        ]
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        status: true,
        type: true,
        createdAt: true
      }
    });

    activities.push(...recentTransactions.map(tx => ({
      type: 'transaction',
      title: `${tx.type} Transaction`,
      amount: tx.amount,
      status: tx.status,
      date: tx.createdAt
    })));

    // Sort by date and return top 5
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
} 