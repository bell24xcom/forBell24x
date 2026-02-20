import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const rfq = await prisma.rFQ.findFirst({
      where: { id, isPublic: true },
      include: {
        user: {
          select: { id: true, name: true, company: true, location: true, isVerified: true },
        },
        quotes: {
          select: { id: true },
        },
      },
    });

    if (!rfq) {
      return NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 });
    }

    // Increment view count (fire-and-forget)
    prisma.rFQ.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

    return NextResponse.json({
      success: true,
      rfq: {
        ...rfq,
        totalQuotes: rfq.quotes.length,
        quotes: undefined,
      },
    });
  } catch (error) {
    console.error('RFQ detail GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load RFQ' }, { status: 500 });
  }
}
