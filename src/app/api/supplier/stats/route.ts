import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supplierId = user.userId;

    const [activeQuotes, wonQuotes, totalQuotes, dealsCompleted, userRecord] = await Promise.all([
      prisma.quote.count({ where: { supplierId, status: 'PENDING' } }),
      prisma.quote.count({ where: { supplierId, status: 'ACCEPTED' } }),
      prisma.quote.count({ where: { supplierId } }),
      prisma.deal.count({ where: { supplierId, status: 'COMPLETED' } }),
      prisma.user.findUnique({ where: { id: supplierId }, select: { name: true, company: true, gstNumber: true, location: true, phone: true } }),
    ]);

    const totalEarned = await prisma.transaction.aggregate({
      where: { supplierId, status: 'COMPLETED' },
      _sum: { amount: true },
    });

    // Profile completeness (20 pts each)
    let profileComplete = 0;
    if (userRecord?.name) profileComplete += 20;
    if (userRecord?.company) profileComplete += 20;
    if (userRecord?.gstNumber) profileComplete += 20;
    if (userRecord?.location) profileComplete += 20;
    if (userRecord?.phone) profileComplete += 20;

    const gstVerified = !!userRecord?.gstNumber;
    const responseRate = totalQuotes > 0 ? Math.round((wonQuotes / totalQuotes) * 100) : 0;

    // Trust score calculation
    let trustScore = 0;
    trustScore += gstVerified ? 30 : 0;
    trustScore += Math.round(profileComplete * 0.25);
    trustScore += totalQuotes > 0 ? Math.min(Math.round((wonQuotes / totalQuotes) * 25), 25) : 0;
    trustScore += Math.min(dealsCompleted * 4, 20);

    return NextResponse.json({
      success: true,
      stats: {
        activeQuotes,
        wonQuotes,
        totalEarned: totalEarned._sum.amount || 0,
        totalQuotes,
        responseRate: responseRate + '%',
        dealsCompleted,
        trustScore,
        gstVerified,
        profileComplete,
        responseRateNum: responseRate,
      },
    });
  } catch (error) {
    console.error('Error fetching supplier stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
