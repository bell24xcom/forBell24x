/**
 * POST /api/deal/[id]/complete
 *
 * ADMIN-ONLY. Records that a deal was settled OFF-PLATFORM (bank/UPI/cheque,
 * direct between buyer and supplier — VyaparSethu holds no funds) and marks
 * it complete. No Razorpay, no wallet, no payout here — this endpoint only
 * RECORDS that settlement happened.
 *
 * This is deliberately separate from the existing wallet-escrow completion
 * flow (POST /api/dashboard/deals, action "complete", which releases real
 * wallet funds) and MUST NEVER run on a deal that has touched that flow —
 * see the mutual-exclusion guard below, which is the exact inverse of that
 * flow's own guards:
 *   pay_wallet:       requires status ACTIVE|PAYMENT_PENDING, → ESCROW_LOCKED
 *                      + WalletTransaction{type:'ESCROW_LOCK', reference:dealId}
 *   mark_shipped:     requires status ESCROW_LOCKED|PAID,     → SHIPPING
 *   confirm_delivery: requires status SHIPPING,               → DELIVERED
 *   complete:         requires status DELIVERED,               → COMPLETED
 *                      + WalletTransaction{type:'ESCROW_RELEASE', reference:dealId}
 * So: any deal that ever entered the wallet path is no longer ACTIVE, and/or
 * has a WalletTransaction referencing it. This route refuses to run unless
 * BOTH: deal.status === 'ACTIVE' AND no WalletTransaction references it.
 *
 * Body: { settlementMethod?: string, reference?: string }
 * Idempotent: a second call for an already-recorded deal returns the
 * existing Transaction instead of creating a duplicate.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/src/lib/auth-helpers';
import { onDealCompleted } from '@/lib/orchestration';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in' }, { status: 401 });
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: off-platform settlement recording is admin-only' },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const settlementMethod: string | undefined = body.settlementMethod;
    const reference: string | undefined = body.reference;

    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        rfq: { select: { id: true, title: true } },
        buyer: { select: { id: true, name: true, email: true } },
        supplier: { select: { id: true, name: true, email: true } },
      },
    });

    if (!deal) {
      return NextResponse.json({ success: false, error: 'Deal not found' }, { status: 404 });
    }

    // Idempotency: Deal.quoteId is unique, so it already identifies "the
    // transaction for this deal" — no separate dealId column needed.
    const existingTxn = await prisma.transaction.findFirst({
      where: { quoteId: deal.quoteId },
    });
    if (existingTxn) {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        transaction: existingTxn,
        deal: { id: deal.id, status: deal.status },
      });
    }

    // Mutual-exclusion guard — exact inverse of the wallet-escrow flow's
    // own guards. Block if this deal ever touched that flow, by status OR
    // by wallet-transaction history (belt-and-suspenders: status alone
    // could theoretically be reset, the WalletTransaction record can't).
    if (deal.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: `This deal is in status "${deal.status}", which means it used (or is using) wallet escrow. Complete it via the existing flow instead, not this off-platform recorder.`,
        },
        { status: 409 },
      );
    }
    const walletTouch = await prisma.walletTransaction.findFirst({
      where: { reference: deal.id },
    });
    if (walletTouch) {
      return NextResponse.json(
        {
          success: false,
          error: 'This deal used wallet escrow at some point. Complete it via the existing flow instead, not this off-platform recorder.',
        },
        { status: 409 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          rfqId: deal.rfqId,
          quoteId: deal.quoteId,
          buyerId: deal.buyerId,
          supplierId: deal.supplierId,
          amount: deal.price,
          currency: 'INR',
          status: 'COMPLETED',
          // Clearly distinct from the wallet-escrow path (which never writes
          // to this table at all) so the ledger can tell the two apart later.
          paymentMethod: `OFF_PLATFORM${settlementMethod ? `: ${settlementMethod.trim()}` : ''}`,
          paymentId: reference?.trim() || null,
          metadata: {
            dealId: deal.id,
            settledBy: user.id,
            settledVia: 'ADMIN_CONCIERGE_OFF_PLATFORM',
            note: 'Settled off-platform (bank/UPI/cheque, direct between buyer and supplier) — VyaparSethu holds no funds; admin-recorded.',
          },
        },
      });

      const updatedDeal = await tx.deal.update({
        where: { id: deal.id },
        data: { status: 'COMPLETED' },
      });

      await tx.rFQ.update({
        where: { id: deal.rfqId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      return { transaction, deal: updatedDeal };
    });

    // Notifications — reuse existing orchestration, don't rebuild it.
    // onDealCompleted: sets RFQ.status=COMPLETED (harmless no-op — already
    // set above), bumps supplier trust +10, creates in-app Notification
    // rows for both parties, fires the n8n webhook.
    onDealCompleted(
      { id: deal.rfq.id, title: deal.rfq.title },
      deal.supplier,
      { id: deal.buyerId, name: deal.buyer.name },
    ).catch(err => console.error('[Deal Complete] onDealCompleted failed:', err));

    // onDealCompleted has no email step — send the real email directly,
    // same pattern already used in rfq/quotes/route.ts, not a new stub.
    const amountLabel = `₹${deal.price.toLocaleString('en-IN')}`;
    if (deal.buyer.email) {
      sendEmail(
        deal.buyer.email,
        `✅ Deal marked complete: "${deal.rfq.title}"`,
        `<p>Your deal for <strong>"${deal.rfq.title}"</strong> (${amountLabel}) has been recorded as paid and complete.</p>`,
      ).catch(err => console.error('[Deal Complete] buyer email failed:', err));
    }
    if (deal.supplier.email) {
      sendEmail(
        deal.supplier.email,
        `🎉 Deal complete: "${deal.rfq.title}" — ${amountLabel}`,
        `<p>Your deal for <strong>"${deal.rfq.title}"</strong> (${amountLabel}) has been recorded as paid and complete.</p>`,
      ).catch(err => console.error('[Deal Complete] supplier email failed:', err));
    }

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      deal: { id: result.deal.id, status: result.deal.status },
    });
  } catch (error) {
    console.error('[Deal Complete] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to mark deal complete' }, { status: 500 });
  }
}
