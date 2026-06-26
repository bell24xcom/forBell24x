import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { rfqId, quoteId } = await req.json();
    if (!rfqId || !quoteId) {
      return NextResponse.json({ error: 'rfqId and quoteId required' }, { status: 400 });
    }

    const quote = await prisma.quote.findFirst({
      where: { id: quoteId, rfqId },
      include: { rfq: true },
    });

    if (!quote?.rfq) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    if (!quote.supplierId) {
      return NextResponse.json({ error: 'Quote has no supplier' }, { status: 400 });
    }

    const buyerId = quote.rfq.createdBy;
    if (!buyerId) {
      return NextResponse.json({ error: 'RFQ has no buyer — cannot create deal' }, { status: 400 });
    }

    const deal = await prisma.$transaction(async tx => {
      const newDeal = await tx.deal.create({
        data: {
          rfqId,
          quoteId,
          buyerId,
          supplierId: quote.supplierId!,
          price: quote.price,
          status: 'ACTIVE',
        },
      });

      await tx.quote.update({
        where: { id: quoteId },
        data: { status: 'ACCEPTED', isAccepted: true },
      });

      await tx.rFQ.update({
        where: { id: rfqId },
        data: { status: 'CLOSED' },
      });

      return newDeal;
    });

    return NextResponse.json({ success: true, dealId: deal.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Selection failed';
    console.error('[Admin Marketing select-quote]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
