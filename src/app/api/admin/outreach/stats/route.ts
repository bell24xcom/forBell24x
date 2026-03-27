import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [total, unclaimed, claimed, contactedToday] = await Promise.all([
      prisma.user.count({ where: { role: 'SUPPLIER' } }),
      prisma.user.count({ where: { role: 'SUPPLIER', isClaimed: false } }),
      prisma.user.count({ where: { role: 'SUPPLIER', isClaimed: true } }),
      prisma.user.count({
        where: {
          role: 'SUPPLIER',
          lastOutreachAt: { gte: todayStart },
        },
      }),
    ]);

    return NextResponse.json({ success: true, total, unclaimed, claimed, contactedToday });
  } catch (error) {
    console.error('Outreach stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch outreach stats' },
      { status: 500 }
    );
  }
}
