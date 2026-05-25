/**
 * Bell24h Orchestration Engine — v3
 *
 * Event-driven orchestration for all B2B marketplace actions.
 *
 * SUPPLIER MATCHING ALGORITHM (scored, not random):
 *   +3 pts  rfqCategory in supplier preferences.categories (explicit self-declared)
 *   +3 pts  location match (supplier.location contains rfq.location city)
 *   +2 pts  rfqLocation city in supplier preferences.cities (explicit city coverage)
 *   +2 pts  category history (supplier has previously quoted in same category)
 *   +2 pts  trust score ≥ 70 (high-quality supplier)
 *   +1 pt   isVerified supplier
 *   +1 pt   has at least 1 accepted quote (proven supplier)
 *   → Sort desc by score → take top 15 → notify only those
 *   → Fallback: if < 5 scored matches, fill from any active suppliers
 *
 * RFQ STATUS LIFECYCLE:
 *   ACTIVE → (quote accepted) → ACCEPTED → (buyer confirms) → COMPLETED
 *   ACTIVE → CANCELLED  (buyer cancels)
 *   ACTIVE → EXPIRED    (auto-expiry)
 *   ACCEPTED → CLOSED_EXTERNAL  (manual override by admin)
 *
 * All side effects are fire-and-forget — they NEVER block the HTTP response.
 */

import { prisma } from '@/lib/prisma';
import { n8nMarketing } from '@/lib/n8n-trigger';
async function sendEmail(to: string, subject: string, html: string) {
  console.log('[EMAIL] Stub — to:', to, 'subject:', subject);
  return { success: true };
}
const resendService = {
  sendEmail: ({ to, subject, html }: { to: string; subject: string; html: string }) =>
    sendEmail(to, subject, html),
};

const MAX_SUPPLIERS_TO_NOTIFY = 15;
const MIN_SUPPLIERS_BEFORE_FALLBACK = 5;

// ─── Internal helpers ────────────────────────────────────────────────────────

type NotifType =
  | 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  | 'RFQ_CREATED' | 'QUOTE_RECEIVED' | 'QUOTE_ACCEPTED'
  | 'DEAL_CHECK' | 'DEAL_CONFIRMED'
  | 'TRANSACTION_UPDATE' | 'SYSTEM_ALERT';

async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotifType,
  data?: Record<string, unknown>
) {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type, data: data ?? {} },
    });
  } catch (err) {
    console.error('[Orchestration] createNotification failed:', err);
  }
}

function safeN8N(fn: () => Promise<unknown>) {
  fn().catch(err => console.warn('[Orchestration] n8n non-fatal:', err));
}

function safeEmail(email: string | null | undefined, fn: () => Promise<unknown>) {
  if (!email) return;
  fn().catch(err => console.warn('[Orchestration] email non-fatal:', err));
}

// ─── Smart Supplier Matcher ──────────────────────────────────────────────────

async function findMatchedSuppliers(rfqCategory: string, rfqLocation: string | null) {
  // Load all active suppliers with minimal fields + quote history
  const allSuppliers = await prisma.user.findMany({
    where: { role: 'SUPPLIER', isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      location: true,
      isVerified: true,
      trustScore: true,
      preferences: true,
      quotes: {
        select: {
          status: true,
          rfq: { select: { category: true } },
        },
        take: 30, // enough to infer category history
      },
    },
    take: 200, // read more so we can score and pick best 15
  }).catch(() => []);

  type SupplierRow = typeof allSuppliers[number];

  // Scoring function
  function scoreSupplier(s: SupplierRow): number {
    let score = 0;

    // Parse preferences safely
    const prefs = (s.preferences as { categories?: string[]; cities?: string[] } | null) ?? {};
    const prefCategories = (prefs.categories ?? []).map((c: string) => c.toLowerCase());
    const prefCities = (prefs.cities ?? []).map((c: string) => c.toLowerCase());

    // +3: supplier explicitly selected this category in their profile
    if (prefCategories.some(cat => cat.includes(rfqCategory.toLowerCase()) || rfqCategory.toLowerCase().includes(cat))) {
      score += 3;
    }

    // +3: location field match
    if (rfqLocation && s.location) {
      const rfqCity = rfqLocation.toLowerCase().trim();
      const supCity = s.location.toLowerCase().trim();
      if (supCity.includes(rfqCity) || rfqCity.includes(supCity)) score += 3;
    }

    // +2: supplier explicitly covers this city in preferences
    if (rfqLocation && prefCities.length > 0) {
      const rfqCity = rfqLocation.toLowerCase().trim();
      if (prefCities.some(city => city.includes(rfqCity) || rfqCity.includes(city))) {
        score += 2;
      }
    }

    // +2: has previously quoted in the same category
    const hasCategory = s.quotes.some(
      q => q.rfq.category.toLowerCase() === rfqCategory.toLowerCase()
    );
    if (hasCategory) score += 2;

    // +2: high trust score (≥ 70) — proven quality supplier
    if ((s.trustScore ?? 0) >= 70) score += 2;

    // +1: verified
    if (s.isVerified) score += 1;

    // +1: has at least one accepted quote (proven)
    if (s.quotes.some(q => q.status === 'ACCEPTED')) score += 1;

    return score;
  }

  const scored = allSuppliers
    .map(s => ({ ...s, score: scoreSupplier(s) }))
    .sort((a, b) => b.score - a.score);

  let selected = scored.slice(0, MAX_SUPPLIERS_TO_NOTIFY);

  // Fallback: if fewer than MIN matched with any score, fill from pool
  const nonZero = scored.filter(s => s.score > 0);
  if (nonZero.length < MIN_SUPPLIERS_BEFORE_FALLBACK) {
    selected = scored.slice(0, MAX_SUPPLIERS_TO_NOTIFY);
  } else {
    selected = nonZero.slice(0, MAX_SUPPLIERS_TO_NOTIFY);
  }

  return selected;
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
  // 1. Smart supplier matching — category + city + score
  const suppliers = await findMatchedSuppliers(rfq.category, rfq.location);

  // 2. In-app notifications for matched suppliers only (not all suppliers)
  await Promise.allSettled(
    suppliers.map(s =>
      createNotification(
        s.id,
        '🔔 New RFQ — Matches Your Profile',
        `"${rfq.title}" · ${rfq.category}${rfq.location ? ` · ${rfq.location}` : ''}. Quote now!`,
        'RFQ_CREATED',
        { rfqId: rfq.id, category: rfq.category, matchScore: s.score }
      )
    )
  );

  // 3. Confirm to buyer
  await createNotification(
    buyer.id,
    '✅ RFQ Posted — Suppliers Notified',
    `"${rfq.title}" is live. ${suppliers.length} relevant supplier${suppliers.length !== 1 ? 's' : ''} notified.`,
    'SUCCESS',
    { rfqId: rfq.id, suppliersNotified: suppliers.length }
  );

  // 4. n8n webhook (async)
  safeN8N(() =>
    n8nMarketing.notifyRFQPosted({
      rfqId: rfq.id,
      title: rfq.title,
      category: rfq.category,
      buyerId: buyer.id,
      buyerName: buyer.name || 'Buyer',
    })
  );

  // 5. Email buyer confirmation
  safeEmail(buyer.email, () =>
    resendService.sendEmail({
      to: buyer.email!,
      subject: `✅ RFQ Live: "${rfq.title}" — ${suppliers.length} suppliers notified`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#4F46E5,#3B82F6);padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">🔔 Bell24h</h1>
          </div>
          <div style="padding:30px;background:#f8fafc;">
            <h2 style="color:#1f2937;">Your RFQ is Live!</h2>
            <p style="color:#6b7280;font-size:16px;line-height:1.6;">
              <strong>"${rfq.title}"</strong> has been posted successfully.<br/>
              <strong>${suppliers.length} relevant suppliers</strong> in
              <strong>${rfq.category}</strong>${rfq.location ? ` near <strong>${rfq.location}</strong>` : ''} have been notified.
            </p>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://bell24h.com/rfq/${rfq.id}"
                 style="background:#4F46E5;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
                View Your RFQ
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
    `${supplierLabel} quoted ₹${quote.price.toLocaleString('en-IN')} for "${rfq.title}". Review now.`,
    'QUOTE_RECEIVED',
    { rfqId: rfq.id, quoteId: quote.id, supplierId: supplier.id }
  );

  // 2. Confirm to supplier
  await createNotification(
    supplier.id,
    '✅ Quote Sent to Buyer',
    `Your quote of ₹${quote.price.toLocaleString('en-IN')} · ${quote.timeline} for "${rfq.title}" is under review.`,
    'SUCCESS',
    { rfqId: rfq.id, quoteId: quote.id }
  );

  // 3. n8n
  safeN8N(() =>
    n8nMarketing.notifyQuoteReceived({
      rfqId: rfq.id,
      quoteId: quote.id,
      supplierId: supplier.id,
      supplierName: supplierLabel,
      amount: quote.price,
    })
  );

  // 4. Email buyer
  safeEmail(buyer.email, () =>
    resendService.sendEmail({
      to: buyer.email!,
      subject: `📥 Quote: ₹${quote.price.toLocaleString('en-IN')} for "${rfq.title}"`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#4F46E5,#3B82F6);padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">📥 New Quote — Bell24h</h1>
          </div>
          <div style="padding:30px;background:#f8fafc;">
            <h2 style="color:#1f2937;">You received a quote!</h2>
            <p style="color:#6b7280;font-size:16px;">
              <strong>${supplierLabel}</strong> quoted for
              <strong>"${rfq.title}"</strong>
            </p>
            <div style="background:white;padding:20px;border-radius:8px;border:1px solid #e5e7eb;margin:20px 0;">
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                <span style="color:#6b7280;">Price</span>
                <strong style="color:#1f2937;font-size:20px;">₹${quote.price.toLocaleString('en-IN')}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#6b7280;">Timeline</span>
                <span style="color:#1f2937;">${quote.timeline}</span>
              </div>
            </div>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://bell24h.com/negotiation"
                 style="background:#4F46E5;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
                Accept / Counter / Reject
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

// ─── Event: Quote Accepted — deal lock, ACCEPTED status, deal confirmation ────

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
  const now = new Date();
  const confirmBy = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  // 1. Lock the RFQ — mark as ACCEPTED (not COMPLETED — buyer must confirm later)
  //    Also reject all remaining PENDING quotes on this RFQ
  await Promise.allSettled([
    prisma.rFQ.update({
      where: { id: rfq.id },
      data: { status: 'ACCEPTED', acceptedAt: now },
    }),
    prisma.quote.updateMany({
      where: { rfqId: rfq.id, id: { not: quote.id }, status: 'PENDING' },
      data: { status: 'REJECTED' },
    }),
  ]).catch(err => console.error('[Orchestration] RFQ lock failed:', err));

  // 2. Bump supplier trust score (+5 for winning a deal)
  prisma.user.update({
    where: { id: supplier.id },
    data: { trustScore: { increment: 5 } },
  }).catch(err => console.warn('[Orchestration] Trust score update failed:', err));

  // 3. Auto-create opening message thread
  prisma.message.create({
    data: {
      fromId: buyer.id,
      toId: supplier.id,
      rfqId: rfq.id,
      content: `Hi! I accepted your quote of ₹${quote.price.toLocaleString('en-IN')} for "${rfq.title}". Let's discuss next steps.`,
      isRead: false,
    },
  }).catch(err => console.error('[Orchestration] Auto-message failed:', err));

  // 4. Notify supplier
  await createNotification(
    supplier.id,
    '🎉 Your Quote Was Accepted!',
    `${buyerLabel} accepted your quote of ₹${quote.price.toLocaleString('en-IN')} for "${rfq.title}". Deal locked — coordinate delivery via messages.`,
    'QUOTE_ACCEPTED',
    { rfqId: rfq.id, quoteId: quote.id }
  );

  // 5. Confirm to buyer + schedule 7-day deal-check notification
  await createNotification(
    buyer.id,
    '✅ Deal Locked — Quote Accepted',
    `You accepted the quote for "${rfq.title}". A message thread has been opened. Please confirm completion within 7 days.`,
    'QUOTE_ACCEPTED',
    { rfqId: rfq.id, quoteId: quote.id, confirmBy: confirmBy.toISOString() }
  );

  // 6. Schedule deal-check reminder (creates the notification now; n8n will deliver it at 7 days)
  await createNotification(
    buyer.id,
    '❓ Was the Deal Completed?',
    `7 days ago you accepted a quote for "${rfq.title}". Was the deal completed? Please confirm at bell24h.com/rfq/${rfq.id}/complete`,
    'DEAL_CHECK',
    { rfqId: rfq.id, quoteId: quote.id, scheduledFor: confirmBy.toISOString() }
  );

  // 7. n8n webhook — fires WhatsApp/email follow-ups via automation
  safeN8N(() =>
    n8nMarketing.notifyQuoteAccepted({
      rfqId: rfq.id,
      quoteId: quote.id,
      rfqTitle: rfq.title,
      supplierId: supplier.id,
      supplierName: supplier.name || 'Supplier',
      buyerId: buyer.id,
      buyerName: buyer.name || 'Buyer',
      amount: quote.price,
      confirmBy: confirmBy.toISOString(),
    })
  );

  // 8. Email supplier
  safeEmail(supplier.email, () =>
    resendService.sendEmail({
      to: supplier.email!,
      subject: `🎉 Deal Won: "${rfq.title}" — ₹${quote.price.toLocaleString('en-IN')}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#10B981,#059669);padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">🎉 Deal Won — Bell24h</h1>
          </div>
          <div style="padding:30px;background:#f8fafc;">
            <h2 style="color:#1f2937;">Congratulations!</h2>
            <p style="color:#6b7280;font-size:16px;line-height:1.6;">
              Your quote of <strong>₹${quote.price.toLocaleString('en-IN')}</strong>
              for <strong>"${rfq.title}"</strong> was accepted.<br/>
              The buyer has opened a message thread to discuss delivery.
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

// ─── Event: Deal Completed — buyer confirms ───────────────────────────────────

export async function onDealCompleted(rfq: {
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
  // 1. Mark RFQ as COMPLETED + set completedAt
  await prisma.rFQ.update({
    where: { id: rfq.id },
    data: { status: 'COMPLETED', completedAt: new Date() },
  }).catch(err => console.error('[Orchestration] Deal complete update failed:', err));

  // 2. Boost supplier trust score further (+10 for completed deal)
  prisma.user.update({
    where: { id: supplier.id },
    data: { trustScore: { increment: 10 } },
  }).catch(err => console.warn('[Orchestration] Trust score complete update failed:', err));

  // 3. Notify both parties
  await Promise.allSettled([
    createNotification(
      supplier.id,
      '🏆 Deal Confirmed Complete!',
      `${buyer.name || 'The buyer'} confirmed that the deal for "${rfq.title}" is complete. Your trust score has been updated.`,
      'DEAL_CONFIRMED',
      { rfqId: rfq.id }
    ),
    createNotification(
      buyer.id,
      '✅ Deal Marked as Complete',
      `Thank you for confirming. "${rfq.title}" is now marked complete.`,
      'DEAL_CONFIRMED',
      { rfqId: rfq.id }
    ),
  ]);

  // 4. n8n webhook for deal completion
  safeN8N(() =>
    n8nMarketing.notifyDealCompleted({
      rfqId: rfq.id,
      rfqTitle: rfq.title,
      supplierId: supplier.id,
      supplierName: supplier.name || 'Supplier',
      buyerId: buyer.id,
      buyerName: buyer.name || 'Buyer',
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
    'Quote Not Selected This Time',
    `Your quote for "${rfq.title}" was not selected. Don't give up — browse new RFQs!`,
    'INFO',
    { rfqId: rfq.id, quoteId: quote.id }
  );
}

// ─── Event: Counter Offer ────────────────────────────────────────────────────

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
  await createNotification(
    buyer.id,
    '🔄 Counter Offer Received',
    `New offer: ₹${quote.price.toLocaleString('en-IN')} · ${quote.timeline} for "${rfq.title}". Review now.`,
    'QUOTE_RECEIVED',
    { rfqId: rfq.id, quoteId: quote.id }
  );

  safeEmail(buyer.email, () =>
    resendService.sendEmail({
      to: buyer.email!,
      subject: `🔄 Counter Offer: ₹${quote.price.toLocaleString('en-IN')} on "${rfq.title}"`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#F59E0B,#D97706);padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">🔄 Counter Offer — Bell24h</h1>
          </div>
          <div style="padding:30px;background:#f8fafc;">
            <h2 style="color:#1f2937;">New Counter Offer</h2>
            <p style="color:#6b7280;font-size:16px;">
              Updated quote on <strong>"${rfq.title}"</strong>:
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

// ─── Rate Limiting Helper ─────────────────────────────────────────────────────

/**
 * Check if a user has exceeded their daily action limit.
 * Returns { allowed: true } or { allowed: false, count, limit }
 *
 * Usage in API routes:
 *   const check = await checkDailyLimit(userId, 'rfq', 5);
 *   if (!check.allowed) return NextResponse.json({ error: 'Daily RFQ limit reached' }, { status: 429 });
 */
export async function checkDailyLimit(
  userId: string,
  action: 'rfq' | 'quote',
  limit: number
): Promise<{ allowed: boolean; count: number; limit: number }> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  let count = 0;
  try {
    if (action === 'rfq') {
      count = await prisma.rFQ.count({
        where: { createdBy: userId, createdAt: { gte: startOfDay } },
      });
    } else if (action === 'quote') {
      count = await prisma.quote.count({
        where: { supplierId: userId, createdAt: { gte: startOfDay } },
      });
    }
  } catch {
    return { allowed: true, count: 0, limit }; // fail open
  }

  return { allowed: count < limit, count, limit };
}
