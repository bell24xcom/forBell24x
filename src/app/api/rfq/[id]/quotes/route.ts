import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/src/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rfq = await prisma.rFQ.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdBy: true,
        quotes: {
          select: {
            id: true,
            price: true,
            quantity: true,
            description: true,
            status: true,
            deliveryDays: true,
            notes: true,
            terms: true,
            timeline: true,
            createdAt: true,
            supplierId: true,
            isAccepted: true,
            source: true,
            sourcingNote: true,
            supplier: {
              select: {
                id: true,
                name: true,
                company: true,
                city: true,
                trustScore: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // Only the buyer who owns the RFQ can see all quotes
    if (rfq.createdBy !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      rfqId: rfq.id,
      rfqTitle: rfq.title,
      rfqStatus: rfq.status,
      quotesCount: rfq.quotes.length,
      quotes: rfq.quotes,
    });
  } catch (error) {
    console.error('[Quotes] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}
