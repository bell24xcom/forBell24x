import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/src/lib/auth-helpers';
import { z } from 'zod';

const SelectDealSchema = z.object({
  quoteId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = getAuthenticatedUser(req);
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    // 2. Authorize role (Buyer or Admin)
    if (!hasRole(user, ['BUYER', 'ADMIN'])) {
      return NextResponse.json({ success: false, error: 'Forbidden: Only buyers can select deals' }, { status: 403 });
    }

    // 3. Validate request body
    const body = await req.json();
    const { quoteId } = SelectDealSchema.parse(body);

    // 4. Fetch Quote with RFQ to check ownership
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { rfq: true },
    });

    if (!quote || !quote.rfq) {
      return NextResponse.json({ success: false, error: 'Quote or RFQ not found' }, { status: 404 });
    }

    // 5. Security Check: Only the RFQ creator (or admin) can select the deal
    if (quote.rfq.createdBy !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden: You are not the owner of this RFQ' }, { status: 403 });
    }

    // 6. Create Deal and update statuses in a transaction
    const deal = await prisma.$transaction(async (tx) => {
      // Create the Deal record
      const newDeal = await tx.deal.create({
        data: {
          rfqId: quote.rfqId!,
          quoteId: quote.id,
          buyerId: quote.rfq!.createdBy!,
          supplierId: quote.supplierId!,
          price: quote.price,
          status: 'ACTIVE',
        },
      });

      // Update Quote status
      await tx.quote.update({
        where: { id: quoteId },
        data: { status: 'ACCEPTED', isAccepted: true },
      });

      // Update RFQ status
      await tx.rFQ.update({
        where: { id: quote.rfqId! },
        data: { status: 'ACCEPTED' },
      });

      return newDeal;
    });

    return NextResponse.json({ success: true, deal }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Deal Selection Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
