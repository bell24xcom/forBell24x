import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

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

    const [user, activeQuotes, wonQuotes, totalQuotes, earned] = await Promise.all([
      prisma.user.findUnique({
        where: { id: supplierId },
        select: {
          trustScore:  true,
          isVerified:  true,
          gstNumber:   true,
          udyamNumber: true,
          company:     true,
          location:    true,
          name:        true,
          plan:        true,
        },
      }),
      prisma.quote.count({ where: { supplierId, status: 'PENDING'  } }),
      prisma.quote.count({ where: { supplierId, status: 'ACCEPTED' } }),
      prisma.quote.count({ where: { supplierId } }),
      prisma.transaction.aggregate({
        where: { supplierId, status: 'COMPLETED' },
        _sum:  { amount: true },
      }),
    ]);

    const responseRate = totalQuotes > 0 ? Math.round((wonQuotes / totalQuotes) * 100) : 0;

    // What can they do to improve their trust score?
    const improvements: Array<{ label: string; points: number }> = [];
    if (!user?.gstNumber)   improvements.push({ label: 'Add GST number',        points: 25 });
    if (!user?.udyamNumber) improvements.push({ label: 'Add Udyam number',      points: 20 });
    if (!user?.company)     improvements.push({ label: 'Add company name',      points: 10 });
    if (!user?.location)    improvements.push({ label: 'Add city / location',   points: 5  });
    if (user?.name?.startsWith('User ') || !user?.name) {
      improvements.push({ label: 'Update your name', points: 5 });
    }

    return NextResponse.json({
      success: true,
      stats: {
        activeQuotes,
        rfqsWon:     wonQuotes,
        totalEarned: earned._sum.amount ?? 0,
        responseRate,
        totalQuotes,
      },
      trust: {
        score:        user?.trustScore ?? 0,
        isVerified:   user?.isVerified ?? false,
        hasGST:       !!user?.gstNumber,
        hasUdyam:     !!user?.udyamNumber,
        improvements,   // items to show "Improve your visibility"
      },
      plan: user?.plan ?? 'FREE',
    });
  } catch (error) {
    console.error('Supplier stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load stats' }, { status: 500 });
  }
}
