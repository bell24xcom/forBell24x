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

    const supplierId = payload.userId;

    const [activeQuotes, wonQuotes, totalQuotes, earned] = await Promise.all([
      prisma.quote.count({
        where: { supplierId, status: 'PENDING' },
      }),
      prisma.quote.count({
        where: { supplierId, status: 'ACCEPTED' },
      }),
      prisma.quote.count({
        where: { supplierId },
      }),
      prisma.transaction.aggregate({
        where: { supplierId, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    const responseRate = totalQuotes > 0 ? Math.round((wonQuotes / totalQuotes) * 100) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        activeQuotes,
        rfqsWon: wonQuotes,
        totalEarned: earned._sum.amount ?? 0,
        responseRate,
        totalQuotes,
      },
    });
  } catch (error) {
    console.error('Supplier stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load stats' }, { status: 500 });
  }
}
