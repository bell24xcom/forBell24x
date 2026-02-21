import { NextRequest, NextResponse } from 'next/server';
import { jwt } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await jwt.authenticate(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get supplier ID
    const supplierId = user.userId;

    // Run queries in parallel
    const [activeQuotes, wonQuotes, totalQuotes] = await Promise.all([
      prisma.quote.count({
        where: { supplierId, status: 'PENDING' },
      }),
      prisma.quote.count({
        where: { supplierId, status: 'ACCEPTED' },
      }),
      prisma.quote.count({
        where: { supplierId },
      }),
    ]);

    // Calculate total earned
    const totalEarned = await prisma.transaction.aggregate({
      where: { supplierId, status: 'COMPLETED' },
      _sum: { amount: true },
    });

    // Calculate response rate
    const responseRate = totalQuotes > 0 ? ((wonQuotes / totalQuotes) * 100).toFixed(1) + '%' : '0%';

    return NextResponse.json({
      success: true,
      stats: {
        activeQuotes,
        wonQuotes,
        totalEarned: totalEarned._sum.amount || 0,
        totalQuotes,
        responseRate,
      },
    });
  } catch (error) {
    console.error('Error fetching supplier stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}