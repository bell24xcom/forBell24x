/**
 * Production binding for lib/quote-notify.ts. Routes call `notifyQuoteCreated(quote.id, '<route>')` right after the
 * quote row is created. Fire-and-forget: it returns immediately, never throws, and logs one structured line with the
 * outcome so a missing buyer alert is visible in the logs (previously it was silent).
 */
import { prisma } from '@/lib/prisma';
import { notifyQuoteSubmitted, type QuoteNotifyDeps, type QuoteNotifyOutcome, type QuoteRoute } from './quote-notify';

export function quoteNotifyDeps(): QuoteNotifyDeps {
  return {
    loadQuote: async (id) => {
      const q = await prisma.quote.findUnique({
        where: { id },
        select: { id: true, price: true, timeline: true, deliveryDays: true, source: true, rfqId: true, supplierId: true },
      });
      return q ? { ...q, source: String(q.source) } : null;
    },
    loadRfq: (id) => prisma.rFQ.findUnique({ where: { id }, select: { id: true, title: true, createdBy: true, isSeeded: true } }),
    loadUser: (id) => prisma.user.findUnique({ where: { id }, select: { id: true, name: true, company: true, email: true } }),
    buyerAlreadyNotified: async (quoteId, buyerId) =>
      (await prisma.notification.count({ where: { userId: buyerId, type: 'QUOTE_RECEIVED', data: { path: ['quoteId'], equals: quoteId } } })) > 0,
    notify: async (quote, rfq, supplier, buyer, opts) => {
      const { onQuoteSubmitted } = await import('./orchestration');
      await onQuoteSubmitted(quote, rfq, supplier, buyer, opts);
    },
  };
}

export async function runQuoteNotification(quoteId: string, via: QuoteRoute): Promise<QuoteNotifyOutcome> {
  const outcome = await notifyQuoteSubmitted(quoteId, quoteNotifyDeps());
  const line = JSON.stringify({ event: 'quote_notification', via, ...outcome });
  if (outcome.status === 'failed') console.error(`[QuoteNotify] ${line}`);
  else console.info(`[QuoteNotify] ${line}`);
  return outcome;
}

/** Fire-and-forget entry point for route handlers. */
export function notifyQuoteCreated(quoteId: string, via: QuoteRoute): void {
  runQuoteNotification(quoteId, via).catch((err) => console.error('[QuoteNotify] unexpected', err));
}
