import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const now = new Date();
    const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
    const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalUsers, buyers, suppliers, admins,
      newToday, newThisWeek, newThisMonth,
      totalRFQs, activeRFQs, completedRFQs, cancelledRFQs,
      totalQuotes, acceptedQuotes, pendingQuotes,
      totalTx, completedTx, pendingTx,
      highTrustSuppliers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'BUYER'    } }),
      prisma.user.count({ where: { role: 'SUPPLIER' } }),
      prisma.user.count({ where: { role: 'ADMIN'    } }),
      prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfWeek  } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.rFQ.count(),
      prisma.rFQ.count({ where: { status: 'ACTIVE'    } }),
      prisma.rFQ.count({ where: { status: 'COMPLETED' } }),
      prisma.rFQ.count({ where: { status: 'CANCELLED' } }),
      prisma.quote.count(),
      prisma.quote.count({ where: { status: 'ACCEPTED' } }),
      prisma.quote.count({ where: { status: 'PENDING'  } }),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'COMPLETED' } }),
      prisma.transaction.count({ where: { status: 'PENDING'   } }),
      prisma.user.count({ where: { role: 'SUPPLIER', trustScore: { gte: 70 } } }),
    ]);

    // Volume of completed transactions
    const volumeResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });
    const completedVolume = Number(volumeResult._sum.amount ?? 0);

    // Plan distribution
    const planDist = await prisma.user.groupBy({
      by: ['plan'],
      _count: { _all: true },
    });
    const plans = Object.fromEntries(planDist.map(p => [p.plan, p._count._all]));

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          buyers,
          suppliers,
          admins,
          newToday,
          newThisWeek,
          newThisMonth,
        },
        rfqs: {
          total:     totalRFQs,
          active:    activeRFQs,
          completed: completedRFQs,
          cancelled: cancelledRFQs,
        },
        quotes: {
          total:    totalQuotes,
          accepted: acceptedQuotes,
          pending:  pendingQuotes,
          rejected: totalQuotes - acceptedQuotes - pendingQuotes,
        },
        transactions: {
          total:           totalTx,
          completed:       completedTx,
          pending:         pendingTx,
          completedVolume, // INR
        },
        funnel: {
          rfqsCreated:    totalRFQs,
          quotesSubmitted: totalQuotes,
          quotesAccepted:  acceptedQuotes,
          dealsCompleted:  completedTx,
          conversionRate:  totalRFQs > 0 ? ((completedTx / totalRFQs) * 100).toFixed(1) : '0',
        },
        trust: {
          highTrustSuppliers, // trustScore >= 70
        },
        plans: {
          FREE:       plans['FREE']       ?? 0,
          PRO:        plans['PRO']        ?? 0,
          ENTERPRISE: plans['ENTERPRISE'] ?? 0,
        },
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
