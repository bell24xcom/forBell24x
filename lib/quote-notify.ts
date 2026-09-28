/**
 * Single business path for telling a buyer that a quote was submitted (MA-01, Phase 4 / RFQ_REMEDIATION_PLAN.md R1).
 *
 * Before this, `onQuoteSubmitted` (lib/orchestration.ts) had no caller: 0 QUOTE_RECEIVED notifications existed for 19
 * quotes. Every route that creates a quote now calls `notifyQuoteCreated` (lib/quote-notify-runtime.ts), which runs
 * this function. Same pattern as lib/quote-acceptance.ts: kept free of `@/` imports so it is unit-testable with
 * `node --test`; production dependencies are bound in the runtime file.
 *
 * Guarantees:
 *   - never throws (a notification problem must never fail or roll back a quote);
 *   - idempotent per quote (a retry or a double call yields exactly one buyer notification);
 *   - reports the truth: `notified` only after the notification row is verified to exist, otherwise `failed`;
 *   - staff-sourced (concierge) quotes are labelled as such and the supplier is NOT told they "submitted" one.
 */

export type QuoteRoute = 'marketing-quote' | 'quote' | 'supplier-quotes' | 'rfq-quotes' | 'admin-concierge';

export interface NotifyQuote {
  id: string;
  price: number;
  timeline: string | null;
  deliveryDays: number | null;
  source: string;
  rfqId: string | null;
  supplierId: string | null;
}
export interface NotifyRfq {
  id: string;
  title: string;
  createdBy: string | null;
  isSeeded: boolean;
}
export interface NotifyUser {
  id: string;
  name: string | null;
  company: string | null;
  email: string | null;
}

export interface QuoteNotifyDeps {
  loadQuote(id: string): Promise<NotifyQuote | null>;
  loadRfq(id: string): Promise<NotifyRfq | null>;
  loadUser(id: string): Promise<NotifyUser | null>;
  /** True when a QUOTE_RECEIVED notification for this quote already exists for the buyer. */
  buyerAlreadyNotified(quoteId: string, buyerId: string): Promise<boolean>;
  /** The orchestration event: buyer notification, supplier confirmation, n8n, email. */
  notify(
    quote: { id: string; price: number; timeline: string },
    rfq: { id: string; title: string; createdBy: string },
    supplier: NotifyUser,
    buyer: NotifyUser,
    opts: { staffSourced: boolean },
  ): Promise<void>;
}

export type SkipReason = 'quote_not_found' | 'no_rfq' | 'rfq_seeded' | 'no_buyer' | 'no_supplier' | 'buyer_is_supplier' | 'already_notified';

export type QuoteNotifyOutcome =
  | { status: 'notified'; quoteId: string; buyerId: string; staffSourced: boolean }
  | { status: 'skipped'; quoteId: string; reason: SkipReason }
  | { status: 'failed'; quoteId: string; error: string };

export const CONCIERGE_SOURCE = 'CONCIERGE_SOURCED';

export function timelineLabel(q: Pick<NotifyQuote, 'timeline' | 'deliveryDays'>): string {
  if (q.timeline && q.timeline.trim()) return q.timeline.trim();
  if (q.deliveryDays && q.deliveryDays > 0) return `${q.deliveryDays} days`;
  return 'Timeline not specified';
}

export async function notifyQuoteSubmitted(quoteId: string, deps: QuoteNotifyDeps): Promise<QuoteNotifyOutcome> {
  try {
    const quote = await deps.loadQuote(quoteId);
    if (!quote) return { status: 'skipped', quoteId, reason: 'quote_not_found' };
    if (!quote.rfqId) return { status: 'skipped', quoteId, reason: 'no_rfq' };
    if (!quote.supplierId) return { status: 'skipped', quoteId, reason: 'no_supplier' };

    const rfq = await deps.loadRfq(quote.rfqId);
    if (!rfq) return { status: 'skipped', quoteId, reason: 'no_rfq' };
    // Seeded/demo RFQs belong to fake buyers: never notify or email them (the supplier route already skipped these).
    if (rfq.isSeeded) return { status: 'skipped', quoteId, reason: 'rfq_seeded' };
    if (!rfq.createdBy) return { status: 'skipped', quoteId, reason: 'no_buyer' };
    if (rfq.createdBy === quote.supplierId) return { status: 'skipped', quoteId, reason: 'buyer_is_supplier' };

    const [buyer, supplier] = await Promise.all([deps.loadUser(rfq.createdBy), deps.loadUser(quote.supplierId)]);
    if (!buyer) return { status: 'skipped', quoteId, reason: 'no_buyer' };
    if (!supplier) return { status: 'skipped', quoteId, reason: 'no_supplier' };

    if (await deps.buyerAlreadyNotified(quote.id, buyer.id)) return { status: 'skipped', quoteId, reason: 'already_notified' };

    const staffSourced = quote.source === CONCIERGE_SOURCE;
    await deps.notify(
      { id: quote.id, price: quote.price, timeline: timelineLabel(quote) },
      { id: rfq.id, title: rfq.title, createdBy: rfq.createdBy },
      supplier,
      buyer,
      { staffSourced },
    );

    // The orchestration layer swallows its own errors, so "no exception" is not proof: verify the row.
    if (!(await deps.buyerAlreadyNotified(quote.id, buyer.id))) {
      return { status: 'failed', quoteId, error: 'buyer notification was not recorded' };
    }
    return { status: 'notified', quoteId, buyerId: buyer.id, staffSourced };
  } catch (err) {
    return { status: 'failed', quoteId, error: err instanceof Error ? err.message : String(err) };
  }
}
