/**
 * Supplier Drip Engine
 * ───────────────────────────────────────────────────────
 * Sends timed nudges (email + WhatsApp link) to suppliers based on when they
 * were first contacted (outreach_sent timestamp), NOT registration date.
 *
 * Drip schedule (days since outreach_sent):
 *   Day 3:  48–96h after outreach_sent, no profile_completed → complete profile
 *   Day 7:  6–8 days after outreach_sent, no quote_submitted → browse RFQs
 *   Day 14: 13–15 days after outreach_sent, no login in 14 days → re-engage
 *
 * Action types in InteractionMemory:
 *   drip_day3_sent / drip_day7_sent / drip_day14_sent
 *
 * Idempotent — skips if the drip was already sent.
 */

import { prisma } from '@/lib/prisma';
import { storeInteraction } from '@/lib/memory-engine';

export type DripType = 'day3' | 'day7' | 'day14';

export interface DripCandidate {
  supplierId: string;
  name: string;
  company: string | null;
  phone: string;
  email: string | null;
  category: string;
  dripType: DripType;
  message: string;
  waLink: string;
  emailSubject: string;
  emailHtml: string;
  firstContactedAt: Date;
}

// ─── Email drip templates ────────────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vyaparsethu.com';

const BASE_STYLE = 'font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;';
const HEADER_STYLE = 'background:linear-gradient(135deg,#EA580C,#F97316);padding:20px 24px;text-align:center;';
const BODY_STYLE = 'padding:28px 24px;background:#f8fafc;';
const FOOTER_STYLE = 'background:#f1f5f9;padding:16px 24px;text-align:center;color:#64748b;font-size:12px;';
const CTA_STYLE = 'display:inline-block;background:#F97316;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;';
const FOOTER_CONTENT = "VyaparSethu · India's B2B Trade Network<br>Formerly Bell24h | Digitex Studio";

function buildDripEmail(
  supplier: { name: string | null; company: string | null },
  category: string,
  type: DripType,
): { subject: string; html: string } {
  const name = supplier.name ?? supplier.company ?? 'there';
  const companyDisplay = supplier.company || name;
  const dashboardUrl = `${SITE_URL}/supplier/profile/edit`;
  const rfqUrl = `${SITE_URL}/supplier/browse-rfqs`;
  const loginUrl = `${SITE_URL}/dashboard`;

  if (type === 'day3') {
    return {
      subject: `Complete your VyaparSethu profile — buyers are searching for ${category}`,
      html: `
<div style="${BASE_STYLE}">
  <div style="${HEADER_STYLE}">
    <h1 style="color:white;margin:0;font-size:22px;">VyaparSethu</h1>
    <p style="color:#FED7AA;margin:4px 0 0;font-size:14px;">Your profile needs attention</p>
  </div>
  <div style="${BODY_STYLE}">
    <p style="font-size:16px;color:#1E293B;">Hi ${name},</p>
    <p style="color:#475569;line-height:1.6;">Your <strong>${companyDisplay}</strong> supplier profile on VyaparSethu is live but incomplete. Buyers searching for <strong>${category}</strong> can see your listing, but an incomplete profile gets 80% fewer quote requests.</p>
    <p style="color:#475569;line-height:1.6;">It takes under 2 minutes to complete.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${dashboardUrl}" style="${CTA_STYLE}">Complete My Profile →</a>
    </div>
    <p style="color:#94A3B8;font-size:13px;">Questions? Reply to this email — we're a small team and we read every message.</p>
  </div>
  <div style="${FOOTER_STYLE}">${FOOTER_CONTENT}</div>
</div>`,
    };
  }

  if (type === 'day7') {
    return {
      subject: `Buyers need ${category} quotes — your first quote opportunity`,
      html: `
<div style="${BASE_STYLE}">
  <div style="${HEADER_STYLE}">
    <h1 style="color:white;margin:0;font-size:22px;">VyaparSethu</h1>
    <p style="color:#FED7AA;margin:4px 0 0;font-size:14px;">New Quotation Requests</p>
  </div>
  <div style="${BODY_STYLE}">
    <p style="font-size:16px;color:#1E293B;">Hi ${name},</p>
    <p style="color:#475569;line-height:1.6;">Buyers posted new Quotation Requests in <strong>${category}</strong> this week. Your profile is listed but you haven't submitted any quotes yet.</p>
    <p style="color:#475569;line-height:1.6;">Suppliers who submit their first quote within 7 days close 3× more deals than those who wait.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${rfqUrl}" style="${CTA_STYLE}">Browse Quotation Requests →</a>
    </div>
    <p style="color:#94A3B8;font-size:13px;">Your Trade Account balance: ₹0. No payment needed to browse or quote.</p>
  </div>
  <div style="${FOOTER_STYLE}">${FOOTER_CONTENT}</div>
</div>`,
    };
  }

  // day14 — re-engagement
  return {
    subject: `We miss you — ${category} buyers are active on VyaparSethu`,
    html: `
<div style="${BASE_STYLE}">
  <div style="${HEADER_STYLE}">
    <h1 style="color:white;margin:0;font-size:22px;">VyaparSethu</h1>
    <p style="color:#FED7AA;margin:4px 0 0;font-size:14px;">Come back — opportunities waiting</p>
  </div>
  <div style="${BODY_STYLE}">
    <p style="font-size:16px;color:#1E293B;">Hi ${name},</p>
    <p style="color:#475569;line-height:1.6;">It's been two weeks since you joined VyaparSethu. Buyers in <strong>${category}</strong> are posting Quotation Requests every day.</p>
    <p style="color:#475569;line-height:1.6;">Log in to see what's available — no commitment, no payment required.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${loginUrl}" style="${CTA_STYLE}">See New Opportunities →</a>
    </div>
    <p style="color:#94A3B8;font-size:13px;">If you'd prefer not to receive these emails, simply reply "unsubscribe" and we'll remove you.</p>
  </div>
  <div style="${FOOTER_STYLE}">${FOOTER_CONTENT}</div>
</div>`,
  };
}

// ─── WhatsApp message builder ─────────────────────────────────────────────────

function buildDripMessage(
  supplier: { name: string | null; company: string | null },
  category: string,
  type: DripType
): string {
  const name = supplier.name ?? supplier.company ?? 'there';

  if (type === 'day3') {
    return `Hi ${name}! Your VyaparSethu supplier profile is live but incomplete.
Buyers are searching for ${category} suppliers right now.
Complete your profile in 2 mins: ${SITE_URL}/supplier/profile/edit
- VyaparSethu Team`;
  }

  if (type === 'day7') {
    return `Hi ${name}, good news! A buyer just posted an RFQ in ${category}.
Your profile is matched but you haven't quoted yet.
Browse RFQs now: ${SITE_URL}/supplier/browse-rfqs
- VyaparSethu Team`;
  }

  return `Hi ${name}, we miss you on VyaparSethu!
${category} buyers are active this week.
Login to see new RFQs: ${SITE_URL}/dashboard
- VyaparSethu Team`;
}

function buildWaLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const number = cleaned.startsWith('91') ? cleaned : '91' + cleaned;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function getDripsDue(): Promise<DripCandidate[]> {
  const now = Date.now();

  // Time windows relative to outreach_sent timestamp
  const day3Start  = new Date(now - 96 * 3600000);   // 96h ago
  const day3End    = new Date(now - 48 * 3600000);   // 48h ago
  const day7Start  = new Date(now - 8  * 86400000);  // 8 days ago
  const day7End    = new Date(now - 6  * 86400000);  // 6 days ago
  const day14Start = new Date(now - 15 * 86400000);  // 15 days ago
  const day14End   = new Date(now - 13 * 86400000);  // 13 days ago

  // Fetch all initial outreach contacts within the combined window
  const initialContacts = await prisma.interactionMemory.findMany({
    where: {
      actionType: 'outreach_sent',
      createdAt: { gte: day14Start, lte: day3End },
      userId: { not: null },
    },
    select: { userId: true, rfqId: true, createdAt: true, metadata: true },
    orderBy: { createdAt: 'desc' },
  });

  if (initialContacts.length === 0) return [];

  // Deduplicate by userId — keep most recent outreach_sent per supplier
  const latestBySupplier = new Map<string, (typeof initialContacts)[0]>();
  for (const c of initialContacts) {
    if (!latestBySupplier.has(c.userId!)) {
      latestBySupplier.set(c.userId!, c);
    }
  }

  const supplierIds = [...latestBySupplier.keys()];

  // Batch fetch: drip history, quotes, supplier profiles
  const [dripHistory, quotes, suppliers] = await Promise.all([
    prisma.interactionMemory.findMany({
      where: {
        actionType: { in: ['drip_day3_sent', 'drip_day7_sent', 'drip_day14_sent'] },
        userId: { in: supplierIds },
      },
      select: { userId: true, actionType: true },
    }),
    prisma.quote.findMany({
      where: { supplierId: { in: supplierIds } },
      select: { supplierId: true },
      distinct: ['supplierId'],
    }),
    prisma.user.findMany({
      where: {
        id: { in: supplierIds },
        isActive: true,
        phone: { not: null },
      },
      select: { id: true, name: true, company: true, phone: true, email: true, lastLoginAt: true, preferences: true },
    }),
  ]);

  const dripSentSet = new Set(dripHistory.map(d => `${d.userId}:${d.actionType}`));
  const hasQuotedSet = new Set(quotes.map(q => q.supplierId));
  const supplierMap = new Map(suppliers.map(s => [s.id, s]));

  const candidates: DripCandidate[] = [];

  for (const [supplierId, contact] of latestBySupplier) {
    const supplier = supplierMap.get(supplierId);
    if (!supplier?.phone) continue;

    const contactMs = contact.createdAt.getTime();
    const isDay3  = contactMs >= day3Start.getTime()  && contactMs <= day3End.getTime();
    const isDay7  = contactMs >= day7Start.getTime()  && contactMs <= day7End.getTime();
    const isDay14 = contactMs >= day14Start.getTime() && contactMs <= day14End.getTime();

    // Extract category from outreach metadata or use generic fallback
    const meta = contact.metadata as Record<string, unknown> | null;
    const category = (meta?.category as string) || (meta?.rfqCategory as string) || 'your category';

    if (isDay3) {
      if (dripSentSet.has(`${supplierId}:drip_day3_sent`)) continue;
      // Skip if profile is already complete
      if (!!supplier.company) continue;
      const message = buildDripMessage(supplier, category, 'day3');
      const { subject, html } = buildDripEmail(supplier, category, 'day3');
      candidates.push({ supplierId, name: supplier.name ?? '', company: supplier.company, phone: supplier.phone, email: supplier.email ?? null, category, dripType: 'day3', message, waLink: buildWaLink(supplier.phone, message), emailSubject: subject, emailHtml: html, firstContactedAt: contact.createdAt });
    } else if (isDay7) {
      if (dripSentSet.has(`${supplierId}:drip_day7_sent`)) continue;
      if (hasQuotedSet.has(supplierId)) continue;
      const message = buildDripMessage(supplier, category, 'day7');
      const { subject, html } = buildDripEmail(supplier, category, 'day7');
      candidates.push({ supplierId, name: supplier.name ?? '', company: supplier.company, phone: supplier.phone, email: supplier.email ?? null, category, dripType: 'day7', message, waLink: buildWaLink(supplier.phone, message), emailSubject: subject, emailHtml: html, firstContactedAt: contact.createdAt });
    } else if (isDay14) {
      if (dripSentSet.has(`${supplierId}:drip_day14_sent`)) continue;
      const lastLogin = supplier.lastLoginAt;
      if (lastLogin && (now - lastLogin.getTime()) < 14 * 86400000) continue;
      const message = buildDripMessage(supplier, category, 'day14');
      const { subject, html } = buildDripEmail(supplier, category, 'day14');
      candidates.push({ supplierId, name: supplier.name ?? '', company: supplier.company, phone: supplier.phone, email: supplier.email ?? null, category, dripType: 'day14', message, waLink: buildWaLink(supplier.phone, message), emailSubject: subject, emailHtml: html, firstContactedAt: contact.createdAt });
    }
  }

  return candidates;
}

export async function logDripSent(supplierId: string, type: DripType): Promise<void> {
  const actionMap: Record<DripType, string> = {
    day3:  'drip_day3_sent',
    day7:  'drip_day7_sent',
    day14: 'drip_day14_sent',
  };
  await storeInteraction({
    userId: supplierId,
    actionType: actionMap[type],
    source: 'email',
    metadata: { dripType: type, sentAt: new Date().toISOString() },
  });
}
