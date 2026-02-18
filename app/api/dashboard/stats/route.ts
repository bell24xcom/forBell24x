import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const userId = payload.userId;

    // Run all queries in parallel
    const [
      totalRFQs,
      activeRFQs,
      totalQuotesReceived,
      buyerTransactions,
      supplierTransactions,
      recentRFQs,
      recentQuotes,
    ] = await Promise.all([
      prisma.rFQ.count({ where: { createdBy: userId } }),
      prisma.rFQ.count({ where: { createdBy: userId, status: 'ACTIVE' } }),
      prisma.quote.count({ where: { rfq: { createdBy: userId } } }),
      prisma.transaction.aggregate({
        where: { buyerId: userId, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { supplierId: userId, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.rFQ.findMany({
        where: { createdBy: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, status: true, createdAt: true, category: true },
      }),
      prisma.quote.findMany({
        where: { rfq: { createdBy: userId } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          price: true,
          status: true,
          createdAt: true,
          rfq: { select: { title: true } },
        },
      }),
    ]);

    const totalSpent = buyerTransactions._sum.amount ?? 0;
    const totalEarned = supplierTransactions._sum.amount ?? 0;

    // Build recent activity feed from real data
    const activity = [
      ...recentRFQs.map(r => ({
        id: r.id,
        type: 'rfq_created',
        description: `RFQ created: ${r.title}`,
        timestamp: r.createdAt.toISOString(),
        status: 'success' as const,
      })),
      ...recentQuotes.map(q => ({
        id: q.id,
        type: 'quote_received',
        description: `Quote received for: ${q.rfq.title} (₹${q.price.toLocaleString()})`,
        timestamp: q.createdAt.toISOString(),
        status: q.status === 'ACCEPTED' ? 'success' as const : 'pending' as const,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);

    return NextResponse.json({
      success: true,
      stats: {
        totalRFQs,
        activeRFQs,
        totalQuotesReceived,
        totalSpent,
        totalEarned,
        successRate: totalRFQs > 0 ? Math.round((totalQuotesReceived / totalRFQs) * 100) : 0,
      },
      recentActivity: activity,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load stats' }, { status: 500 });
  }
}
