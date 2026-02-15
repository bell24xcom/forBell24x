import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export const getCommunityInsights = async (req: Request, res: Response) => {
  try {
    const prisma = new PrismaClient();

    // Get top suppliers based on reviews
    const topSuppliers = await prisma.company.findMany({
      where: {
        reviews: {
          some: {}
        }
      },
      take: 5,
      orderBy: {
        rating: 'desc',
      },
      select: {
        id: true,
        name: true,
        rating: true,
        reviews: {
          select: {
            id: true,
          },
        },
        _count: {
          select: { 
            reviews: true,
          },
        },
      },
    });

    // Format the suppliers data
    const formattedSuppliers = topSuppliers.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      rating: supplier.rating || 0,
      _count: {
        reviews: supplier._count.reviews,
      },
    }));

    // Get trending RFQs (most viewed in the last 7 days)
    const trendingRfqs = await prisma.rFQ.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      take: 5,
      orderBy: [
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        viewCount: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });


    // Get recent activities
    const recentActivities = await prisma.activityLog.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        action: true,
        description: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get counts for stats
    const [totalSuppliers, totalRfqs, activeUsers] = await Promise.all([
      prisma.company.count({
        where: { 
          reviews: { some: {} },
        },
      }),
      prisma.rFQ.count({
        where: {
          status: 'OPEN',
        },
      }),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    res.json({
      topSuppliers: formattedSuppliers,
      trendingRfqs: trendingRfqs.map(rfq => ({
        id: rfq.id,
        title: rfq.title,
        viewCount: rfq.viewCount || 0,
        user: {
          name: rfq.user?.name || 'Unknown',
          company: rfq.user?.company?.name || 'Unknown',
        },
      })),
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        action: activity.action,
        description: activity.description,
        createdAt: activity.createdAt,
        user: {
          name: activity.user?.name || 'Unknown',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user?.name || 'U')}&background=random`,
        },
      })),
      stats: {
        totalSuppliers,
        totalRfqs,
        activeUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching community insights:', error);
    res.status(500).json({ error: 'Failed to fetch community insights' });
  }
};

export const logActivity = async (userId: string, action: string, description: string, metadata?: any) => {
  try {
    const prisma = new PrismaClient();
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        description,
        metadata,
      },
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
