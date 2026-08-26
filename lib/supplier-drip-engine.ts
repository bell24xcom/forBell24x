/**
 * Supplier Drip Engine
 * ───────────────────────────────────────────────────────
 * Sends timed WhatsApp nudges to suppliers based on when they were
 * first contacted (outreach_sent timestamp), NOT registration date.
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
import { SITE_URL } from '@/lib/site-url';

export type DripType = 'day3' | 'day7' | 'day14';

export interface DripCandidate {
  supplierId: string;
  name: string;
  company: string | null;
  phone: string;
  category: string;
  dripType: DripType;
  message: string;
  waLink: string;
  firstContactedAt: Date;
}

const SIGN_OFF = 'Regards,\nVishal Pendharkar\nFounder, VyaparSethu';

// SPRINT-STDV-01: "Buyers are searching for X right now" / "A buyer just
// posted a Requirement in X" / "X buyers are active this week" were
// unverified activity claims — this function has no query confirming any of
// that at send time, only that the supplier hasn't completed their profile
// or hasn't quoted yet. Replaced with the founder-led framing SPRINT-STDV-01
// asked for in place of any activity claim we can't back with data.
const FOUNDER_LINE = "We're building this with Indian suppliers. Your feedback shapes the product.";

function buildDripMessage(
  supplier: { name: string | null; company: string | null },
  category: string,
  type: DripType
): string {
  const name = supplier.name ?? supplier.company ?? 'there';

  if (type === 'day3') {
    return `Hi ${name}! Your VyaparSethu supplier profile is live but incomplete.
${FOUNDER_LINE}
Complete your profile in 2 mins: ${SITE_URL}/supplier/profile/edit

${SIGN_OFF}`;
  }

  if (type === 'day7') {
    return `Hi ${name}, your ${category} profile on VyaparSethu is matched but incomplete — you're missing quotes.
${FOUNDER_LINE}
Browse Requirements now: ${SITE_URL}/supplier/browse-rfqs

${SIGN_OFF}`;
  }

  return `Hi ${name}, we miss you on VyaparSethu!
${FOUNDER_LINE}
Login to see new Requirements: ${SITE_URL}/dashboard

${SIGN_OFF}`;
}

function buildWaLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const number = cleaned.startsWith('91') ? cleaned : '91' + cleaned;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

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
      select: { id: true, name: true, company: true, phone: true, lastLoginAt: true, preferences: true },
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
      // Check if profile is complete (company + phone = claimed)
      const profileComplete = !!supplier.company;
      if (profileComplete) continue; // Skip if already complete
      const message = buildDripMessage(supplier, category, 'day3');
      candidates.push({ supplierId, name: supplier.name ?? '', company: supplier.company, phone: supplier.phone, category, dripType: 'day3', message, waLink: buildWaLink(supplier.phone, message), firstContactedAt: contact.createdAt });
    } else if (isDay7) {
      if (dripSentSet.has(`${supplierId}:drip_day7_sent`)) continue;
      if (hasQuotedSet.has(supplierId)) continue; // Already quoted, skip
      const message = buildDripMessage(supplier, category, 'day7');
      candidates.push({ supplierId, name: supplier.name ?? '', company: supplier.company, phone: supplier.phone, category, dripType: 'day7', message, waLink: buildWaLink(supplier.phone, message), firstContactedAt: contact.createdAt });
    } else if (isDay14) {
      if (dripSentSet.has(`${supplierId}:drip_day14_sent`)) continue;
      // Check if inactive for 14+ days
      const lastLogin = supplier.lastLoginAt;
      if (lastLogin && (now - lastLogin.getTime()) < 14 * 86400000) continue;
      const message = buildDripMessage(supplier, category, 'day14');
      candidates.push({ supplierId, name: supplier.name ?? '', company: supplier.company, phone: supplier.phone, category, dripType: 'day14', message, waLink: buildWaLink(supplier.phone, message), firstContactedAt: contact.createdAt });
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
    source: 'whatsapp',
    metadata: { dripType: type, sentAt: new Date().toISOString() },
  });
}
