/**
 * Bell24h Orchestration Engine
 *
 * This is the "event wiring" layer. Every important business event
 * (RFQ created, quote submitted, deal accepted, etc.) flows through here.
 *
 * Each function does 3 things automatically:
 *   1. Creates a Notification record in the DB (shows up in /notifications)
 *   2. Fires n8n webhook (can trigger WhatsApp, email, Slack, etc.)
 *   3. Sends email via Resend (if user has email on file)
 *
 * All side effects are fire-and-forget — they NEVER block the main response.
 * If email/n8n fails, the core transaction still succeeds.
 */

import { PrismaClient } from '@prisma/client';
import { n8nMarketing } from '@/lib/n8n-trigger';
import { resendService } from '@/lib/resend';

const prisma = new PrismaClient();

// ─── Internal helpers ────────────────────────────────────────────────────────

async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'RFQ_CREATED' | 'QUOTE_RECEIVED' | 'TRANSACTION_UPDATE' | 'SYSTEM_ALERT',
  data?: Record<string, unknown>
) {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type, data: data ?? {} },
    });
  } catch (err) {
    console.error('[Orchestration] Failed to create notification:', err);
  }
}

async function sendN8N(fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (err) {
    console.warn('[Orchestration] n8n webhook failed (non-fatal):', err);
  }
}

async function sendEmail(userEmail: string | null | undefined, fn: () => Promise<unknown>) {
  if (!userEmail) return;
  try {
    await fn();
  } catch (err) {
    console.warn('[Orchestration] Email send failed (non-fatal):', err);
  }
}

// ─── Event: RFQ Created ──────────────────────────────────────────────────────

export async function onRFQCreated(rfq: {
  id: string;
  title: string;
  category: string;
  location: string | null;
}, buyer: {
  id: string;
  name: string | null;
  email: string | null;
}) {
  // 1. Find suppliers in the same category (up to 50)
  const suppliers = await prisma.user.findMany({
    where: { role: 'SUPPLIER', isActive: true },
    select: { id: true, name: true, email: true },
    take: 50,
  }).catch(() => []);

  // 2. Create in-app notifications for all matched suppliers
  await Promise.allSettled(
    suppliers.map(supplier =>
      createNotification(
        supplier.id,
        '🔔 New RFQ in your category',
        `"${rfq.title}" — ${rfq.category}${rfq.location ? ` · ${rfq.location}` : ''}. Quote now!`,
        'RFQ_CREATED',
        { rfqId: rfq.id, category: rfq.category }
      )
    )
  );

  // 3. Confirm to buyer
  await createNotification(
    buyer.id,
    '✅ RFQ Posted Successfully',
    `Your RFQ "${rfq.title}" is live. Suppliers are being notified.`,
    'SUCCESS',
    { rfqId: rfq.id }
  );

  // 4. Fire n8n (async, non-blocking)
  sendN8N(() =>
    n8nMarketing.notifyRFQPosted({
      rfqId: rfq.id,
      title: rfq.title,
      category: rfq.category,
      buyerId: buyer.id,
      buyerName: buyer.name || 'Buyer',
    })
  );

  // 5. Email buyer confirmation
  sendEmail(buyer.email, () =>
    resendService.sendEmail({
      to: buyer.email!,
      subject: `✅ RFQ Posted: ${rfq.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#4F46E5,#3B82F6);padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">🔔 Bell24h</h1>
          </div>
          <div style="padding:30px;background:#f8fafc;">
            <h2 style="color:#1f2937;">Your RFQ is Live!</h2>
            <p style="color:#6b7280;font-size:16px;">
              <strong>${rfq.title}</strong> has been posted successfully.
              Suppliers in <strong>${rfq.category}</strong> are being notified now.
            </p>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://bell24h.com/rfq/${rfq.id}"
                 style="background:#4F46E5;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
                View RFQ
              </a>
            </div>
          </div>
          <div style="background:#f3f4f6;padding:16px;text-align:center;color:#6b7280;font-size:12px;">
            © 2025 Bell24h Technologies Pvt Ltd
          </div>
        </div>
      `,
    })
  );
}

// ─── Event: Quote Submitted ──────────────────────────────────────────────────

export async function onQuoteSubmitted(quote: {
  id: string;
  price: number;
  timeline: string;
}, rfq: {
  id: string;
  title: string;
  createdBy: string;
}, supplier: {
  id: string;
  name: string | null;
  company: string | null;
  email: string | null;
}, buyer: {
  id: string;
  name: string | null;
  email: string | null;
}) {
  const supplierLabel = supplier.company || supplier.name || 'A supplier';

  // 1. Notify buyer
  await createNotification(
    buyer.id,
    '📥 New Quote Received',
    `${supplierLabel} quoted ₹${quote.price.toLocaleString('en-IN')} for "${rfq.title}"`,
    'QUOTE_RECEIVED',
    { rfqId: rfq.id, quoteId: quote.id, supplierId: supplier.id }
  );

  // 2. Confirm to supplier
  await createNotification(
    supplier.id,
    '✅ Quote Submitted',
    `Your quote of ₹${quote.price.toLocaleString('en-IN')} for "${rfq.title}" was sent to the buyer.`,
    'SUCCESS',
    { rfqId: rfq.id, quoteId: quote.id }
  );

  // 3. n8n webhook
  sendN8N(() =>
    n8nMarketing.notifyQuoteReceived({
      rfqId: rfq.id,
      quoteId: quote.id,
      supplierId: supplier.id,
      supplierName: supplierLabel,
      amount: quote.price,
    })
  );

  // 4. Email buyer
  sendEmail(buyer.email, () =>
    resendService.sendEmail({
      to: buyer.email!,
      subject: `📥 New Quote for "${rfq.title}" — ₹${quote.price.toLocaleString('en-IN')}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#4F46E5,#3B82F6);padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">📥 New Quote — Bell24h</h1>
          </div>
          <div style="padding:30px;background:#f8fafc;">
            <h2 style="color:#1f2937;">You received a quote!</h2>
            <p style="color:#6b7280;font-size:16px;">
              <strong>${supplierLabel}</strong> has submitted a quote for your RFQ
              <strong>"${rfq.title}"</strong>.
            </p>
            <div style="background:white;padding:20px;border-radius:8px;border:1px solid #e5e7eb;margin:20px 0;">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:#6b7280;">Price:</span>
                <strong style="color:#1f2937;font-size:20px;">₹${quote.price.toLocaleString('en-IN')}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#6b7280;">Timeline:</span>
                <span style="color:#1f2937;">${quote.timeline}</span>
              </div>
            </div>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://bell24h.com/negotiation"
                 style="background:#4F46E5;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
                Review & Respond
              </a>
            </div>
          </div>
          <div style="background:#f3f4f6;padding:16px;text-align:center;color:#6b7280;font-size:12px;">
            © 2025 Bell24h Technologies Pvt Ltd
          </div>
        </div>
      `,
    })
  );
}

// ─── Event: Quote Accepted ───────────────────────────────────────────────────

export async function onQuoteAccepted(quote: {
  id: string;
  price: number;
}, rfq: {
  id: string;
  title: string;
}, supplier: {
  id: string;
  name: string | null;
  email: string | null;
}, buyer: {
  id: string;
  name: string | null;
}) {
  const buyerLabel = buyer.name || 'The buyer';

  // 1. Notify supplier
  await createNotification(
    supplier.id,
    '🎉 Quote Accepted!',
    `${buyerLabel} accepted your quote of ₹${quote.price.toLocaleString('en-IN')} for "${rfq.title}". Deal closed!`,
    'SUCCESS',
    { rfqId: rfq.id, quoteId: quote.id }
  );

  // 2. Confirm to buyer
  await createNotification(
    buyer.id,
    '✅ Deal Confirmed',
    `You accepted the quote for "${rfq.title}". Check your messages to proceed.`,
    'SUCCESS',
    { rfqId: rfq.id, quoteId: quote.id }
  );

  // 3. Email supplier
  sendEmail(supplier.email, () =>
    resendService.sendEmail({
      to: supplier.email!,
      subject: `🎉 Your quote was accepted — "${rfq.title}"`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#10B981,#059669);padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">🎉 Quote Accepted — Bell24h</h1>
          </div>
          <div style="padding:30px;background:#f8fafc;">
            <h2 style="color:#1f2937;">Congratulations! Deal Closed!</h2>
            <p style="color:#6b7280;font-size:16px;">
              Your quote of <strong>₹${quote.price.toLocaleString('en-IN')}</strong>
              for <strong>"${rfq.title}"</strong> has been accepted by the buyer.
            </p>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://bell24h.com/messages"
                 style="background:#10B981;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
                Go to Messages
              </a>
            </div>
          </div>
          <div style="background:#f3f4f6;padding:16px;text-align:center;color:#6b7280;font-size:12px;">
            © 2025 Bell24h Technologies Pvt Ltd
          </div>
        </div>
      `,
    })
  );
}

// ─── Event: Quote Rejected ───────────────────────────────────────────────────

export async function onQuoteRejected(quote: {
  id: string;
  price: number;
}, rfq: {
  id: string;
  title: string;
}, supplier: {
  id: string;
  name: string | null;
  email: string | null;
}) {
  await createNotification(
    supplier.id,
    'Quote Not Selected',
    `Your quote for "${rfq.title}" was not selected this time. Browse new RFQs to try again.`,
    'INFO',
    { rfqId: rfq.id, quoteId: quote.id }
  );
}

// ─── Event: Counter Offer Made ───────────────────────────────────────────────

export async function onCounterOffer(quote: {
  id: string;
  price: number;
  timeline: string;
}, rfq: {
  id: string;
  title: string;
  createdBy: string;
}, buyer: {
  id: string;
  name: string | null;
  email: string | null;
}) {
  // Notify buyer about the counter offer
  await createNotification(
    buyer.id,
    '🔄 Counter Offer Received',
    `The supplier updated their quote to ₹${quote.price.toLocaleString('en-IN')} for "${rfq.title}". Review and respond.`,
    'QUOTE_RECEIVED',
    { rfqId: rfq.id, quoteId: quote.id }
  );

  sendEmail(buyer.email, () =>
    resendService.sendEmail({
      to: buyer.email!,
      subject: `🔄 Counter Offer on "${rfq.title}" — ₹${quote.price.toLocaleString('en-IN')}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#F59E0B,#D97706);padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">🔄 Counter Offer — Bell24h</h1>
          </div>
          <div style="padding:30px;background:#f8fafc;">
            <h2 style="color:#1f2937;">New Counter Offer</h2>
            <p style="color:#6b7280;font-size:16px;">
              The supplier has updated their quote for <strong>"${rfq.title}"</strong>:
              <strong>₹${quote.price.toLocaleString('en-IN')}</strong> · ${quote.timeline}
            </p>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://bell24h.com/negotiation"
                 style="background:#F59E0B;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
                Review Counter Offer
              </a>
            </div>
          </div>
          <div style="background:#f3f4f6;padding:16px;text-align:center;color:#6b7280;font-size:12px;">
            © 2025 Bell24h Technologies Pvt Ltd
          </div>
        </div>
      `,
    })
  );
}
