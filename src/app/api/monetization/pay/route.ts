import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import type { Prisma } from '@prisma/client';
import { authenticate } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { authorizePaymentInitiation, resolveExistingPaymentTransaction } from '@/lib/payment-authorization';

export const dynamic = 'force-dynamic';

interface LockedDealRow {
  id: string;
  rfqId: string;
  quoteId: string;
  buyerId: string;
  supplierId: string;
  price: number;
  status: string;
}

// Constructed lazily, inside the handler — NOT at module scope. Next.js
// evaluates route modules during `next build`'s page-data-collection step;
// a top-level `new Razorpay(...)` with a missing key throws at build time,
// not just at request time, and fails the whole build (confirmed: this is
// exactly what broke the fix/admin-audit-phase1-4 Vercel build — "Error:
// `key_id` or `oauthToken` is mandatory" during "Collecting page data").
// Every other Razorpay call site in this codebase already does it this way
// (see src/app/api/payment/create-order/route.ts, .../subscribe/route.ts).
function getRazorpay(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication — required before anything else runs. Uses the same
    // JWT mechanism as every other live route in this codebase (@/lib/jwt).
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    const dealId = body?.dealId;
    if (!dealId || typeof dealId !== 'string') {
      return NextResponse.json({ error: 'dealId is required' }, { status: 400 });
    }

    // 2-5. Authorize, check idempotency, and RESERVE the payment intent, all
    // inside one DB transaction that holds a row lock on this specific deal
    // (`SELECT ... FOR UPDATE`). This is the fix for the concurrent-duplicate-
    // order race: without the lock, two simultaneous requests for the same
    // deal can both run the "any existing transaction?" check before either
    // has written its own row, and both go on to create a Razorpay order. A
    // `prisma.$transaction` wrapping a plain `findFirst`+`create` does NOT
    // prevent this on its own (Postgres's default Read Committed isolation
    // lets both transactions see the same "nothing exists yet" snapshot) —
    // the explicit row lock is what actually serializes the two requests.
    // No schema migration needed: this locks the existing `deals.id` primary
    // key, not a new column or constraint.
    const phase1 = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const rows = await tx.$queryRaw<LockedDealRow[]>`
        SELECT id, rfq_id AS "rfqId", quote_id AS "quoteId", buyer_id AS "buyerId",
               supplier_id AS "supplierId", price, status
        FROM deals WHERE id = ${dealId} FOR UPDATE
      `;
      const deal = rows[0] ?? null;
      if (!deal) {
        return { kind: 'not_found' as const };
      }

      // Authorization and deal-state gate — see lib/payment-authorization.ts
      // (buyer-only; must be ACTIVE, i.e. not already paid via the
      // wallet/escrow-lock path in src/app/api/rfq/quotes/route.ts).
      const authResult = authorizePaymentInitiation(deal, user.userId);
      if (!authResult.allowed) {
        return { kind: 'unauthorized' as const, authResult };
      }

      // Idempotency — reuse an in-flight order for this deal's quote instead
      // of creating a duplicate. Uses the existing, real Transaction model
      // rather than inventing a new table. Decision logic in
      // lib/payment-authorization.ts.
      const existingTransaction = await tx.transaction.findFirst({
        where: { quoteId: deal.quoteId, status: { in: ['PENDING', 'PROCESSING'] } },
        orderBy: { createdAt: 'desc' },
      });

      const idempotency = resolveExistingPaymentTransaction(existingTransaction);
      if (idempotency.reuseExisting) {
        return { kind: 'reuse' as const, deal, idempotency };
      }
      if (idempotency.conflict) {
        return { kind: 'conflict' as const };
      }

      // Reserve the intent row now, while still holding the deal's row lock
      // — so a concurrent request's own `findFirst` above sees this row the
      // instant this transaction commits, instead of racing past it. No
      // order id yet; that's recorded only after Razorpay actually returns
      // one, outside this transaction (never call Razorpay while holding a
      // DB lock).
      const reserved = await tx.transaction.create({
        data: {
          rfqId: deal.rfqId,
          quoteId: deal.quoteId,
          buyerId: deal.buyerId,
          supplierId: deal.supplierId,
          amount: deal.price,
          currency: 'INR',
          status: 'PENDING',
          paymentMethod: 'razorpay',
          metadata: {},
        },
      });

      return { kind: 'reserved' as const, deal, reserved };
    });

    if (phase1.kind === 'not_found') {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }
    if (phase1.kind === 'unauthorized') {
      return NextResponse.json({ error: phase1.authResult.error }, { status: phase1.authResult.status });
    }
    if (phase1.kind === 'conflict') {
      return NextResponse.json(
        { error: 'A payment is already in progress for this deal' },
        { status: 409 }
      );
    }
    if (phase1.kind === 'reuse') {
      return NextResponse.json({
        orderId: phase1.idempotency.orderId,
        amount: Math.round(phase1.deal.price * 100),
        currency: phase1.idempotency.currency,
      });
    }

    // phase1.kind === 'reserved'. The row lock is released (transaction
    // committed) — safe to make the slow external call now.
    const { deal, reserved } = phase1;
    const options = {
      amount: Math.round(deal.price * 100), // Amount in paise
      currency: 'INR',
      receipt: `receipt_${dealId.substring(0, 8)}`,
      notes: {
        deal_id: dealId,
        rfq_id: deal.rfqId,
        buyer_id: user.userId,
      },
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (razorpayError: any) {
      // Only mark FAILED (freeing the deal for a fresh retry) when Razorpay
      // genuinely rejected the request BEFORE creating anything. The SDK
      // (node_modules/razorpay/dist/api.js, `normalizeError`) rethrows
      // `{ statusCode: err.response.status, error: err.response.data.error }`
      // -- which only exists when axios actually received an HTTP response
      // (`err.response` is set only then; verified locally against this
      // installed SDK version, not assumed). For a network-level failure
      // (timeout, connection reset -- `err.response` undefined), that same
      // line throws a TypeError instead, which is exactly how we detect the
      // ambiguous case here: no normalized `statusCode`.
      //
      // A definite rejection (has `statusCode`) means Razorpay's server
      // responded with an error and never created an order -- safe to mark
      // FAILED. An ambiguous failure (no `statusCode` -- the response was
      // lost or never arrived) means we genuinely don't know whether an
      // order exists. We deliberately do NOT mark FAILED in that case: the
      // reservation stays PENDING with no order id, so the next retry hits
      // the existing idempotency check and fails safe as a 409 conflict
      // (lib/payment-authorization.ts) instead of risking a second, real,
      // payable order. That leaves the deal stuck rather than double-billed
      // -- a known, documented gap (see the Task 29 report's Phase 3
      // receipt-reconciliation design, which would recover it safely but
      // depends on an unverified Razorpay API contract and is intentionally
      // not implemented here pending authorization).
      const isDefiniteProviderRejection = typeof razorpayError?.statusCode === 'number';
      if (isDefiniteProviderRejection) {
        await prisma.transaction
          .update({ where: { id: reserved.id }, data: { status: 'FAILED' } })
          .catch(() => {});
      }
      throw razorpayError;
    }

    // The order now genuinely exists at Razorpay -- persisting its id
    // locally is bookkeeping for OUR OWN future idempotency checks, not a
    // precondition for the order being valid or payable. If this write
    // fails (a transient DB error), the buyer must still get a working
    // order: returning 500 here would send them into a retry that hits
    // this same deal's now-stuck PENDING reservation (409), for a failure
    // that has nothing to do with whether their payment can proceed. Retry
    // the write a few times; if it still fails, log loudly (the Transaction
    // row will be left PENDING with no recorded order id -- a known,
    // separate gap; see the Task 29 report) but still return the real order.
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await prisma.transaction.update({
          where: { id: reserved.id },
          data: { metadata: { razorpayOrderId: order.id } },
        });
        break;
      } catch (persistError: any) {
        if (attempt === 3) {
          console.error(
            '[Payment-API] Failed to persist Razorpay order id after 3 attempts -- order exists but local bookkeeping is stale:',
            persistError?.message || 'Unknown error',
          );
        } else {
          await new Promise((resolve) => setTimeout(resolve, 50 * attempt));
        }
      }
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (error: any) {
    // Never log the full error object (it may embed request/provider
    // details) — only a safe message, matching this codebase's established
    // convention elsewhere (e.g. src/app/api/ai/smart-matching/route.ts).
    console.error('[Payment-API] Error:', error?.message || 'Unknown error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
