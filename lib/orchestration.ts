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
 *   → Marketplace Safety Framework (Option B): if < 5 scored matches, no
 *     one is notified automatically — routes to founder approval instead
 *     (see MatchApproval, createPendingMatchApproval, releaseApprovedNotifications)
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
import type { Prisma } from '@prisma/client';
import { n8nMarketing } from '@/lib/n8n-trigger';
import { sendEmail } from '@/lib/email';
import { SITE_URL } from '@/lib/site-url';
import { createQuoteToken } from '@/lib/quote-token';
import { sendTemplateMessage } from '@/src/lib/whatsapp/WhatsAppService';
const resendService = {
  sendEmail: ({ to, subject, html }: { to: string; subject: string; html: string }) =>
    sendEmail(to, subject, html),
};


/**
 * Meta requires E.164 digits with no leading '+' or zeros. Stored numbers vary
 * (spaces, +91, 0-prefixed). Assumes India when no country code is present,
 * matching where every supplier in the current dataset is located.
 */
function normalizeE164(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

/** Plain, deliverable HTML — no images, no tracking, one call to action. */
function supplierRfqEmail(
  name: string | null,
  rfq: { title: string; category: string; location: string | null },
  quoteLink: string
): string {
  const who = name ? name.split(' ')[0] : 'there';
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <p style="font-size:16px;color:#111;">Hi ${who},</p>
  <p style="font-size:16px;color:#111;line-height:1.6;">
    A buyer has posted a requirement matching your category on VyaparSethu.
  </p>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:15px;">
    <tr><td style="padding:6px 0;color:#666;">Requirement</td><td style="padding:6px 0;color:#111;"><strong>${rfq.title}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#666;">Category</td><td style="padding:6px 0;color:#111;">${rfq.category}</td></tr>
    ${rfq.location ? `<tr><td style="padding:6px 0;color:#666;">Location</td><td style="padding:6px 0;color:#111;">${rfq.location}</td></tr>` : ''}
  </table>
  <p style="margin:24px 0;">
    <a href="${quoteLink}" style="background:#1d4ed8;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Submit your quote</a>
  </p>
  <p style="font-size:13px;color:#666;line-height:1.6;">
    No account needed — the link opens a quote form directly. It expires in 30 days.
  </p>
  <p style="font-size:12px;color:#999;margin-top:32px;">
    ${SITE_URL.replace(/^https?:\/\//, '')} · Bell Orbit Technologies Pvt Ltd
  </p>
</div>`;
}

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

export interface ScoredSupplierCandidate {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  location: string | null;
  isVerified: boolean;
  trustScore: number;
  score: number;
}

interface MatchResult {
  /** Suppliers to notify right now. Empty when usedFallback is true. */
  selected: ScoredSupplierCandidate[];
  /** Every scored candidate — the founder-approval candidate pool. */
  allScored: ScoredSupplierCandidate[];
  /**
   * True when fewer than MIN_SUPPLIERS_BEFORE_FALLBACK candidates scored
   * above zero. Previously this fell back to notifying up to
   * MAX_SUPPLIERS_TO_NOTIFY suppliers regardless of relevance — Marketplace
   * Safety Framework (Option B) instead routes this case to founder
   * approval and notifies no one automatically.
   */
  usedFallback: boolean;
}

async function findMatchedSuppliers(rfqCategory: string, rfqLocation: string | null): Promise<MatchResult> {
  // Load all active suppliers with minimal fields + quote history
  const allSuppliers = await prisma.user.findMany({
    where: { role: 'SUPPLIER', isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
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
    // PR61 remediation: this query previously had no orderBy, so with
    // 1300+ active suppliers and only 200 read, Postgres's default row
    // order silently excluded every supplier created after a fixed point
    // in time (confirmed: only suppliers created before 2026-06-20 were
    // ever returned — all 9 suppliers created since then were invisible
    // to matching regardless of how well they'd score). Ordering by
    // createdAt desc guarantees newly onboarded suppliers are always
    // considered; it does not fully solve the underlying "only 200 of
    // 1300+ suppliers are ever sampled" limitation, which needs a
    // relevance-based pre-filter (by category/location) to fix properly —
    // out of scope here.
    orderBy: { createdAt: 'desc' },
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
    // Quote.rfqId is nullable (concierge-sourced quotes may have no linked
    // RFQ), so q.rfq can be null here — guard before dereferencing it.
    const hasCategory = s.quotes.some(
      q => q.rfq != null && q.rfq.category.toLowerCase() === rfqCategory.toLowerCase()
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

  const allScored: ScoredSupplierCandidate[] = scored.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    company: s.company,
    location: s.location,
    isVerified: s.isVerified,
    trustScore: s.trustScore ?? 0,
    score: s.score,
  }));

  const nonZero = allScored.filter(s => s.score > 0);

  // Marketplace Safety Framework (Option B): a thin/emerging category
  // no longer silently overflows into an unrelated pool of real suppliers.
  // It routes to founder approval instead — see createPendingMatchApproval.
  if (nonZero.length < MIN_SUPPLIERS_BEFORE_FALLBACK) {
    return { selected: [], allScored, usedFallback: true };
  }

  return {
    selected: nonZero.slice(0, MAX_SUPPLIERS_TO_NOTIFY),
    allScored,
    usedFallback: false,
  };
}

/** Last 4 digits only — never the full phone number. Matches WhatsAppService.ts's safeLogMeta. */
function maskPhone(phone: string): string {
  return phone.length > 4 ? `***${phone.slice(-4)}` : '***';
}

/**
 * Sends the in-app + email + WhatsApp notification set for one supplier
 * about one RFQ. Shared by the normal auto-notify path (onRFQCreated) and
 * the founder-approval release path (releaseApprovedNotifications) so both
 * routes exercise identical, single-source send logic.
 *
 * matchApprovalId is only set when called from the approval-release path —
 * it links the resulting WhatsAppSendLog row back to the founder decision
 * that authorized it, for certification/audit purposes (Part C/B).
 */
async function notifySupplierForRFQ(
  rfq: { id: string; title: string; category: string; location: string | null },
  s: { id: string; name: string | null; email: string | null; phone: string | null; score?: number },
  matchApprovalId?: string
) {
  await createNotification(
    s.id,
    '🔔 New RFQ — Matches Your Profile',
    `"${rfq.title}" · ${rfq.category}${rfq.location ? ` · ${rfq.location}` : ''}. Quote now!`,
    'RFQ_CREATED',
    { rfqId: rfq.id, category: rfq.category, matchScore: s.score }
  );

  const quoteLink = `${SITE_URL}/quote/${createQuoteToken(rfq.id, s.id)}`;

  if (s.email) {
    try {
      await sendEmail(
        s.email,
        `New RFQ: ${rfq.title} (${rfq.category})`,
        supplierRfqEmail(s.name, rfq, quoteLink)
      );
    } catch (err) {
      console.error('[Orchestration] supplier email failed', { supplierId: s.id, err });
    }
  }

  if (s.phone) {
    const template = process.env.META_WHATSAPP_RFQ_TEMPLATE || 'vyaparsethu_rfq_notification';
    try {
      const outcome = await sendTemplateMessage(
        normalizeE164(s.phone),
        template,
        process.env.META_WHATSAPP_RFQ_TEMPLATE_LANG || 'en',
        [{ type: 'body', parameters: [
          { type: 'text', text: s.name || 'Partner' },
          { type: 'text', text: rfq.title },
          { type: 'text', text: quoteLink },
        ] }]
      );
      if (outcome.status !== 'SENT') {
        console.warn('[Orchestration] supplier WhatsApp not sent', {
          supplierId: s.id, status: outcome.status,
        });
      }

      // WhatsApp Certification (Part C) — send-side tracking. Fire-and-forget,
      // never blocks the notify flow; the messageId captured here is what
      // lets the inbound webhook (src/app/api/webhooks/meta-whatsapp/route.ts)
      // later correlate a delivery/read/failed event back to this RFQ/supplier.
      prisma.whatsAppSendLog
        .create({
          data: {
            rfqId: rfq.id,
            supplierId: s.id,
            matchApprovalId: matchApprovalId ?? null,
            templateName: template,
            phoneRedacted: maskPhone(s.phone!),
            metaMessageId: outcome.status === 'SENT' ? outcome.messageId ?? null : null,
            status: outcome.status,
            errorCode: outcome.status === 'META_ERROR' ? outcome.errorCode ?? null : null,
            errorMessage: outcome.status === 'META_ERROR' ? outcome.errorMessage ?? null : null,
          },
        })
        .catch((err) => console.error('[Orchestration] WhatsAppSendLog write failed:', err));
    } catch (err) {
      console.error('[Orchestration] supplier WhatsApp threw', { supplierId: s.id, err });

      // PR61 remediation: an exception thrown by sendTemplateMessage (as
      // opposed to one of its typed outcomes) previously left NO
      // WhatsAppSendLog row at all — a real send attempt would vanish
      // without a trace. Recorded here as META_ERROR (no dedicated enum
      // value added, per this task's "do not change WhatsApp API
      // integration" scope) with errorCode UNCAUGHT_EXCEPTION so it stays
      // distinguishable from a typed Meta API rejection.
      prisma.whatsAppSendLog
        .create({
          data: {
            rfqId: rfq.id,
            supplierId: s.id,
            matchApprovalId: matchApprovalId ?? null,
            templateName: template,
            phoneRedacted: maskPhone(s.phone!),
            status: 'META_ERROR',
            errorCode: 'UNCAUGHT_EXCEPTION',
            errorMessage: err instanceof Error ? err.message : String(err),
          },
        })
        .catch((logErr) => console.error('[Orchestration] WhatsAppSendLog write failed (exception path):', logErr));
    }
  }
}

const MATCH_APPROVAL_TTL_HOURS = 48;

/**
 * Marketplace Safety Framework (Option B). Records the full candidate pool
 * for founder review and notifies NO ONE — the founder-approval API
 * (src/app/api/admin/match-approvals/route.ts) is the only caller of
 * releaseApprovedNotifications below, and only after an explicit,
 * atomically-guarded APPROVED transition.
 */
async function createPendingMatchApproval(
  rfq: { id: string; title: string; category: string; location: string | null },
  candidatePool: ScoredSupplierCandidate[]
): Promise<void> {
  try {
    const approval = await prisma.matchApproval.create({
      data: {
        rfqId: rfq.id,
        candidatePool: candidatePool as unknown as Prisma.InputJsonValue,
        expiresAt: new Date(Date.now() + MATCH_APPROVAL_TTL_HOURS * 60 * 60 * 1000),
      },
    });

    prisma.interactionMemory.create({
      data: {
        actionType: 'match_approval_requested',
        source: 'match_approval',
        metadata: { rfqId: rfq.id, matchApprovalId: approval.id, candidateCount: candidatePool.length },
      },
    }).catch(() => {});

    const adminEmail = process.env.ADMIN_ALERT_EMAIL;
    if (adminEmail) {
      sendEmail(
        adminEmail,
        `🟡 Founder approval needed — RFQ "${rfq.title}"`,
        `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#b45309">Supplier match needs your review</h2>
          <p style="color:#111">RFQ <strong>${rfq.title}</strong> (${rfq.category}${rfq.location ? `, ${rfq.location}` : ''}) found fewer than ${MIN_SUPPLIERS_BEFORE_FALLBACK} closely-matched suppliers.</p>
          <p style="color:#111">${candidatePool.length} candidate${candidatePool.length !== 1 ? 's' : ''} found — no supplier has been notified yet.</p>
          <p><a href="${SITE_URL}/admin/cockpit/match-approvals" style="color:#1d4ed8">Review in Founder Cockpit</a></p>
        </div>`
      ).catch(err => console.error('[Orchestration] founder alert email failed:', err));
    } else {
      console.warn('[Orchestration] ADMIN_ALERT_EMAIL not set — skipping founder approval alert email');
    }
  } catch (err) {
    console.error('[Orchestration] createPendingMatchApproval failed:', err);
  }
}

/**
 * Releases notifications for ONLY the founder-selected suppliers of an
 * approved MatchApproval. Callers MUST have already performed the atomic
 * PENDING_FOUNDER_APPROVAL → APPROVED transition (conditional updateMany,
 * count === 1) before calling this — it does not itself check or update
 * MatchApproval status. No other supplier may be contacted for this RFQ.
 */
export async function releaseApprovedNotifications(
  rfq: { id: string; title: string; category: string; location: string | null },
  selectedSuppliers: Array<{ id: string; name: string | null; email: string | null; phone: string | null; score?: number }>,
  matchApprovalId?: string
): Promise<void> {
  await Promise.allSettled(selectedSuppliers.map(s => notifySupplierForRFQ(rfq, s, matchApprovalId)));
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
  const match = await findMatchedSuppliers(rfq.category, rfq.location);

  // Marketplace Safety Framework (Option B): fewer than
  // MIN_SUPPLIERS_BEFORE_FALLBACK relevant matches routes to founder
  // approval. No supplier is notified automatically in this branch.
  if (match.usedFallback) {
    await createPendingMatchApproval(rfq, match.allScored);

    await createNotification(
      buyer.id,
      '🔍 RFQ Posted — Reviewing Supplier Matches',
      `"${rfq.title}" is live. We found fewer close supplier matches than usual, so a team member is reviewing candidates before anyone is contacted.`,
      'INFO',
      { rfqId: rfq.id, matchApprovalPending: true }
    );

    safeN8N(() =>
      n8nMarketing.notifyRFQPosted({
        rfqId: rfq.id,
        title: rfq.title,
        category: rfq.category,
        buyerId: buyer.id,
        buyerName: buyer.name || 'Buyer',
      })
    );

    safeEmail(buyer.email, () =>
      resendService.sendEmail({
        to: buyer.email!,
        subject: `🔍 RFQ Live: "${rfq.title}" — matching suppliers now`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#4F46E5,#3B82F6);padding:24px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:22px;">VyaparSethu</h1>
            </div>
            <div style="padding:30px;background:#f8fafc;">
              <h2 style="color:#1f2937;">Your RFQ is Live!</h2>
              <p style="color:#6b7280;font-size:16px;line-height:1.6;">
                <strong>"${rfq.title}"</strong> has been posted successfully.<br/>
                We're reviewing the best-matched suppliers in <strong>${rfq.category}</strong>${rfq.location ? ` near <strong>${rfq.location}</strong>` : ''} before reaching out — you'll hear from us shortly.
              </p>
              <div style="text-align:center;margin:24px 0;">
                <a href="${SITE_URL}/rfq/${rfq.id}"
                   style="background:#4F46E5;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
                  View Your RFQ
                </a>
              </div>
            </div>
            <div style="background:#f3f4f6;padding:16px;text-align:center;color:#6b7280;font-size:12px;">
              © 2026 Bell Orbit Technologies Pvt Ltd
            </div>
          </div>
        `,
      })
    );

    return;
  }

  const suppliers = match.selected;

  // Structured, one-time log (not per-supplier) so a missing template is
  // visible in observability instead of silently skipping every send.
  if (!process.env.META_WHATSAPP_RFQ_TEMPLATE) {
    console.warn('[Orchestration] META_WHATSAPP_RFQ_TEMPLATE not configured — supplier WhatsApp notifications skipped for this RFQ', {
      rfqId: rfq.id, suppliersMatched: suppliers.length,
    });
  }

  // 2. Notify matched suppliers only (not all suppliers)
  await Promise.allSettled(suppliers.map(s => notifySupplierForRFQ(rfq, s)));

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
            <h1 style="color:white;margin:0;font-size:22px;">VyaparSethu</h1>
          </div>
          <div style="padding:30px;background:#f8fafc;">
            <h2 style="color:#1f2937;">Your RFQ is Live!</h2>
            <p style="color:#6b7280;font-size:16px;line-height:1.6;">
              <strong>"${rfq.title}"</strong> has been posted successfully.<br/>
              <strong>${suppliers.length} relevant suppliers</strong> in
              <strong>${rfq.category}</strong>${rfq.location ? ` near <strong>${rfq.location}</strong>` : ''} have been notified.
            </p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${SITE_URL}/rfq/${rfq.id}"
                 style="background:#4F46E5;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
                View Your RFQ
              </a>
            </div>
          </div>
          <div style="background:#f3f4f6;padding:16px;text-align:center;color:#6b7280;font-size:12px;">
            © 2026 Bell Orbit Technologies Pvt Ltd
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
            © 2026 Bell Orbit Technologies Pvt Ltd
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
            © 2026 Bell Orbit Technologies Pvt Ltd
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
            © 2026 Bell Orbit Technologies Pvt Ltd
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
