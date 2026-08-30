import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/src/lib/auth-helpers';
import { sendEmail as _sendEmail } from '@/lib/email';
import { quoteAcceptedEmail } from '@/lib/emailTemplates';
import { z } from 'zod';

const resendService = { sendEmail: ({ to, subject, html }: { to: string; subject: string; html: string }) => _sendEmail(to, subject, html) };

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

    // Attempt wallet escrow lock — conditional on buyer having sufficient balance.
    // Non-blocking: if wallet not funded, deal proceeds as ACTIVE (payment via Razorpay checkout).
    try {
      const buyerWallet = await prisma.wallet.findUnique({ where: { userId: deal.buyerId } });
      if (buyerWallet && buyerWallet.balance >= deal.price) {
        await prisma.$transaction([
          prisma.wallet.update({
            where: { id: buyerWallet.id },
            data: { balance: { decrement: deal.price } },
          }),
          prisma.walletTransaction.create({
            data: {
              walletId: buyerWallet.id,
              type: 'ESCROW_LOCK',
              amount: deal.price,
              description: `Escrow locked for: ${quote.rfq?.title || 'RFQ'}`,
              reference: deal.id,
            },
          }),
          prisma.deal.update({
            where: { id: deal.id },
            data: { status: 'ESCROW_LOCKED' },
          }),
        ]);
      }
    } catch (e) {
      // Wallet lock failure never blocks the deal — buyer pays via Razorpay checkout
      console.error('[Deal Select] wallet lock failed (non-fatal):', e instanceof Error ? e.message : e);
    }

    // BOM activation: record quote_accepted for both buyer (selected) and
    // supplier (won the deal). Non-blocking — never fails the deal creation.
    try {
      const { recordLifeEventAsync } = await import('@/src/lib/bom/life-events');
      const sharedMeta = {
        dealId: deal.id,
        rfqId: quote.rfqId,
        quoteId: quote.id,
        price: quote.price,
      };
      recordLifeEventAsync({
        companyId: quote.rfq.createdBy!,
        eventType: 'quote_accepted',
        actorId: user.id,
        metadata: { ...sharedMeta, supplierId: quote.supplierId, role: 'buyer' },
        decision: 'accepted_quote',
        outcome: 'deal_created',
        source: 'deal',
        confidence: 1,
      });
      if (quote.supplierId) {
        recordLifeEventAsync({
          companyId: quote.supplierId,
          eventType: 'quote_accepted',
          actorId: user.id,
          metadata: { ...sharedMeta, role: 'supplier' },
          outcome: 'deal_won',
          source: 'deal',
          confidence: 1,
        });
      }
    } catch (e) {
      console.error('[Deal Select] life-event failed:', e instanceof Error ? e.message : e);
    }

    // Phase 2 — Supplier Win Notification
    // Fire-and-forget: notify the winning supplier via email.
    // Never blocks deal creation or the buyer response.
    if (quote.supplierId) {
      try {
        const [supplier, rfq] = await Promise.all([
          prisma.user.findUnique({ where: { id: quote.supplierId }, select: { email: true, name: true } }),
          prisma.rFQ.findUnique({ where: { id: quote.rfqId! }, select: { title: true, isSeeded: true } }),
        ]);
        if (supplier?.email && rfq && !rfq.isSeeded) {
          const template = quoteAcceptedEmail(
            supplier.name || 'Supplier',
            rfq.title,
            Number(deal.price),
          );
          resendService.sendEmail({ to: supplier.email, ...template }).catch(console.error);
        }
      } catch (e) {
        console.error('[Deal Select] supplier notification failed (non-fatal):', e instanceof Error ? e.message : e);
      }
    }

    return NextResponse.json({ success: true, deal }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Deal Selection Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
