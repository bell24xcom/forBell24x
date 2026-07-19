import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCronSecret } from '@/lib/cronAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await prisma.rFQ.updateMany({
      where: { status: { in: ['ACTIVE', 'OPEN'] }, expiresAt: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    });

    return NextResponse.json({ success: true, expired: result.count });
  } catch (error) {
    console.error('Expire RFQs cron error:', error);
    return NextResponse.json({ success: false, error: 'Cron failed' }, { status: 500 });
  }
}
