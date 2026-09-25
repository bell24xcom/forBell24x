/**
 * Single business path for accepting a quote. Every route that can accept a
 * quote (deal/select, negotiation, rfq/quotes PUT, admin select-quote) calls
 * acceptQuote() so validation, Deal creation, RFQ status, competing-quote
 * rejection, notifications and the audit trail behave identically.
 *
 * RFQ status decision: an accepted RFQ is ACCEPTED (not CLOSED). ACCEPTED means
 * "a Deal exists, waiting for buyer completion" (see onQuoteAccepted and the
 * /rfq/[id]/complete flow, which moves ACCEPTED -> COMPLETED). CLOSED is a
 * buyer/admin "off market, no deal" state and must not be used for accepted RFQs.
 *
 * Kept free of `@/` static imports so it can be unit-tested with `node --test`;
 * production dependencies are loaded lazily when `deps` is not supplied.
 */

export type AcceptSource = 'deal-select' | 'negotiation' | 'rfq-quotes' | 'admin-select-quote';

export interface AcceptQuoteInput {
  quoteId: string;
  actor: { id: string; role: string };
  source: AcceptSource;
  /** Reject when the quote does not belong to this RFQ (admin route). */
  expectedRfqId?: string;
  /** Lock the deal amount from the buyer wallet in the same transaction (rfq/quotes PUT only). */
  lockEscrow?: boolean;
}

export interface AcceptedDeal {
  id: string;
  rfqId: string;
  quoteId: string;
  buyerId: string;
  supplierId: string;
  price: number;
  status: string;
  [key: string]: unknown;
}

export type AcceptQuoteResult =
  | {
      ok: true;
      deal: AcceptedDeal;
      quote: Record<string, unknown>;
      rejectedQuotes: number;
      escrowLocked: boolean;
      notified: boolean;
    }
  | { ok: false; status: 400 | 403 | 404 | 409; code: string; error: string };

export interface AcceptanceDb {
  quote: { findUnique: (args: any) => Promise<any> };
  user: { findUnique: (args: any) => Promise<any> };
  $transaction: <T>(fn: (tx: any) => Promise<T>) => Promise<T>;
}

export interface AcceptanceDeps {
  db: AcceptanceDb;
  onAccepted?: (
    quote: { id: string; price: number },
    rfq: { id: string; title: string },
    supplier: { id: string; name: string | null; email: string | null },
    buyer: { id: string; name: string | null },
  ) => Promise<unknown>;
  recordLifeEvent?: (input: Record<string, unknown>) => void;
}

/** RFQ states from which a quote may be accepted. Everything else is off-market or already decided. */
export const ACCEPTABLE_RFQ_STATUSES = ['OPEN', 'ACTIVE', 'QUOTED', 'IN_PROGRESS'] as const;

class AcceptanceError extends Error {
  status: 400 | 403 | 404 | 409;
  code: string;
  constructor(status: 400 | 403 | 404 | 409, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function fail(status: 400 | 403 | 404 | 409, code: string, error: string): AcceptQuoteResult {
  return { ok: false, status, code, error };
}

async function defaultDeps(): Promise<AcceptanceDeps> {
  const { prisma } = await import('@/lib/prisma');
  const { onQuoteAccepted } = await import('@/lib/orchestration');
  const { recordLifeEventAsync } = await import('@/src/lib/bom/life-events');
  return {
    db: prisma as unknown as AcceptanceDb,
    onAccepted: onQuoteAccepted,
    recordLifeEvent: recordLifeEventAsync as unknown as (input: Record<string, unknown>) => void,
  };
}

export async function acceptQuote(input: AcceptQuoteInput, deps?: AcceptanceDeps): Promise<AcceptQuoteResult> {
  const { db, onAccepted, recordLifeEvent } = deps ?? (await defaultDeps());
  const { quoteId, actor, source } = input;

  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    include: {
      rfq: { select: { id: true, title: true, status: true, createdBy: true } },
      supplier: { select: { id: true, name: true, email: true } },
    },
  });

  if (!quote || !quote.rfq) return fail(404, 'quote_not_found', 'Quote or RFQ not found');
  if (input.expectedRfqId && quote.rfqId !== input.expectedRfqId) {
    return fail(404, 'quote_not_found', 'Quote not found for this RFQ');
  }
  if (!quote.supplierId) return fail(400, 'quote_no_supplier', 'Quote has no supplier');

  const buyerId: string | null = quote.rfq.createdBy;
  if (!buyerId) return fail(400, 'rfq_no_buyer', 'RFQ has no buyer - cannot create deal');

  // A supplier can never accept their own quote, whatever else they are.
  if (quote.supplierId === actor.id) {
    return fail(403, 'self_accept_forbidden', 'Forbidden: a supplier cannot accept their own quote');
  }
  if (buyerId !== actor.id && actor.role !== 'ADMIN') {
    return fail(403, 'not_rfq_owner', 'Forbidden: You are not the owner of this RFQ');
  }

  if (quote.status !== 'PENDING') {
    return fail(409, 'quote_not_pending', `Quote is already ${String(quote.status).toLowerCase()} and cannot be accepted`);
  }
  if (!(ACCEPTABLE_RFQ_STATUSES as readonly string[]).includes(quote.rfq.status)) {
    return fail(409, 'rfq_not_open', `RFQ is ${String(quote.rfq.status).toLowerCase()} and no longer accepts a quote`);
  }

  const now = new Date();
  let outcome: { deal: AcceptedDeal; rejectedQuotes: number; escrowLocked: boolean };

  try {
    outcome = await db.$transaction(async (tx: any) => {
      // Compare-and-set on the RFQ row is the lock: two concurrent accepts of
      // different quotes serialise here and only one sees an acceptable status.
      const rfqLock = await tx.rFQ.updateMany({
        where: { id: quote.rfq.id, status: { in: [...ACCEPTABLE_RFQ_STATUSES] } },
        data: { status: 'ACCEPTED', acceptedAt: now },
      });
      if (rfqLock.count !== 1) {
        throw new AcceptanceError(409, 'rfq_not_open', 'RFQ is no longer open for acceptance');
      }

      const quoteLock = await tx.quote.updateMany({
        where: { id: quote.id, status: 'PENDING' },
        data: { status: 'ACCEPTED', isAccepted: true },
      });
      if (quoteLock.count !== 1) {
        throw new AcceptanceError(409, 'quote_not_pending', 'Quote is no longer pending');
      }

      const existingDeal = await tx.deal.findFirst({ where: { rfqId: quote.rfq.id }, select: { id: true } });
      if (existingDeal) {
        throw new AcceptanceError(409, 'deal_exists', 'This RFQ already has a deal');
      }

      let deal: AcceptedDeal = await tx.deal.create({
        data: {
          rfqId: quote.rfq.id,
          quoteId: quote.id,
          buyerId,
          supplierId: quote.supplierId,
          price: quote.price,
          status: 'ACTIVE',
        },
      });

      const rejected = await tx.quote.updateMany({
        where: { rfqId: quote.rfq.id, id: { not: quote.id }, status: 'PENDING' },
        data: { status: 'REJECTED' },
      });

      let escrowLocked = false;
      if (input.lockEscrow) {
        const wallet = await tx.wallet.findUnique({ where: { userId: buyerId } });
        if (wallet && wallet.balance >= quote.price) {
          await tx.wallet.update({ where: { userId: buyerId }, data: { balance: { decrement: quote.price } } });
          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'ESCROW_LOCK',
              amount: quote.price,
              description: `Escrow locked for: ${quote.rfq.title || 'RFQ'}`,
              reference: deal.id,
            },
          });
          deal = await tx.deal.update({ where: { id: deal.id }, data: { status: 'ESCROW_LOCKED' } });
          escrowLocked = true;
        }
      }

      return { deal, rejectedQuotes: rejected.count as number, escrowLocked };
    });
  } catch (err: any) {
    if (err instanceof AcceptanceError) return fail(err.status, err.code, err.message);
    // Deal.quoteId is unique: a lost race on the same quote surfaces as P2002.
    if (err?.code === 'P2002') return fail(409, 'deal_exists', 'This quote already has a deal');
    throw err;
  }

  // Audit trail + notifications run after commit and never fail the acceptance.
  let notified = false;
  try {
    const sharedMeta = { dealId: outcome.deal.id, rfqId: quote.rfq.id, quoteId: quote.id, price: quote.price, source };
    recordLifeEvent?.({
      companyId: buyerId,
      eventType: 'quote_accepted',
      actorId: actor.id,
      metadata: { ...sharedMeta, supplierId: quote.supplierId, role: 'buyer' },
      decision: 'accepted_quote',
      outcome: 'deal_created',
      source: 'deal',
      confidence: 1,
    });
    recordLifeEvent?.({
      companyId: quote.supplierId,
      eventType: 'quote_accepted',
      actorId: actor.id,
      metadata: { ...sharedMeta, role: 'supplier' },
      outcome: 'deal_won',
      source: 'deal',
      confidence: 1,
    });
  } catch (e) {
    console.error('[quote-acceptance] life-event failed:', e instanceof Error ? e.message : e);
  }

  if (onAccepted && quote.supplier) {
    try {
      const buyer = await db.user.findUnique({ where: { id: buyerId }, select: { name: true } });
      await onAccepted(
        { id: quote.id, price: quote.price },
        { id: quote.rfq.id, title: quote.rfq.title },
        { id: quote.supplier.id, name: quote.supplier.name ?? null, email: quote.supplier.email ?? null },
        { id: buyerId, name: buyer?.name ?? null },
      );
      notified = true;
    } catch (e) {
      console.error('[quote-acceptance] onQuoteAccepted failed:', e instanceof Error ? e.message : e);
    }
  }

  return {
    ok: true,
    deal: outcome.deal,
    quote: {
      id: quote.id,
      rfqId: quote.rfqId,
      supplierId: quote.supplierId,
      price: quote.price,
      quantity: quote.quantity,
      timeline: quote.timeline,
      description: quote.description,
      terms: quote.terms,
      status: 'ACCEPTED',
      isAccepted: true,
      createdAt: quote.createdAt,
    },
    rejectedQuotes: outcome.rejectedQuotes,
    escrowLocked: outcome.escrowLocked,
    notified,
  };
}
