/**
 * Supplier Drip Engine
 * ───────────────────────────────────────────────────────
 * Sends timed follow-up WhatsApp nudges to new suppliers.
 *
 * Drip schedule (days since User.createdAt):
 *   Day 3:  if profile incomplete (no company or GST) → complete your profile
 *   Day 7:  if no quote submitted yet → first RFQ is waiting
 *   Day 14: if no login in 14 days → re-engagement message
 *
 * Each drip is logged to InteractionMemory with action types:
 *   drip_day3_sent / drip_day7_sent / drip_day14_sent
 *
 * Skips if the drip was already sent (idempotent).
 * Only targets active, claimed suppliers with a phone number.
 */

import { prisma } from '@/lib/prisma';
import { storeInteraction } from '@/lib/memory-engine';

export type DripType = 'day3' | 'day7' | 'day14';

export interface DripCandidate {
  supplierId: string;
  name: string;
  company: string | null;
  phone: string;
  dripType: DripType;
  message: string;
  waLink: string;
  registeredAt: Date;
}

function buildDripMessage(
  supplier: { name: string | null; company: string | null },
  type: DripType
): string {
  const name = supplier.name ?? supplier.company ?? 'there';

  if (type === 'day3') {
    return `Hi ${name},

Welcome to Bell24h! 👋

Your supplier profile is almost ready. Complete it now to get matched with live buyer RFQs:

✅ Add company name + GST number
✅ Upload product categories
✅ Add your location

Complete your profile:
https://www.bell24h.com/supplier/profile/edit

Buyers search by company, category, and location — incomplete profiles miss 80% of matches.

— Bell24h Team`;
  }

  if (type === 'day7') {
    return `Hi ${name},

There are live buyer RFQs on Bell24h waiting for supplier quotes right now.

You registered 7 days ago — haven't submitted a quote yet.

Browse open RFQs and submit your first quote today:
https://www.bell24h.com/supplier/browse-rfqs

First quote = first deal.

— Bell24h Team`;
  }

  return `Hi ${name},

We've missed you on Bell24h.

New buyer RFQs are posted daily. Suppliers who respond within 24 hours win 3× more deals.

Log back in and see what's waiting for you:
https://www.bell24h.com/dashboard

— Bell24h Team`;
}

function buildWaLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const number = cleaned.startsWith('91') ? cleaned : '91' + cleaned;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export async function getDripsDue(): Promise<DripCandidate[]> {
  const now = Date.now();

  // Time windows (days since registration)
  const day3Start  = new Date(now - 4 * 86400000);
  const day3End    = new Date(now - 3 * 86400000);
  const day7Start  = new Date(now - 8 * 86400000);
  const day7End    = new Date(now - 7 * 86400000);
  const day14Start = new Date(now - 15 * 86400000);
  const day14End   = new Date(now - 14 * 86400000);

  // Fetch all suppliers registered in any of the 3 windows (single query)
  const suppliers = await prisma.user.findMany({
    where: {
      role: 'SUPPLIER',
      isActive: true,
      phone: { not: null },
      createdAt: {
        gte: day14Start,
        lte: day3End,
      },
    },
    select: {
      id: true,
      name: true,
      company: true,
      gstNumber: true,
      phone: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (suppliers.length === 0) return [];

  const supplierIds = suppliers.map(s => s.id);

  // Batch-fetch all drip history and quotes for these suppliers
  const [dripHistory, quotes] = await Promise.all([
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
  ]);

  const dripSentSet = new Set(dripHistory.map(d => `${d.userId}:${d.actionType}`));
  const hasQuotedSet = new Set(quotes.map(q => q.supplierId));

  const candidates: DripCandidate[] = [];

  for (const s of suppliers) {
    if (!s.phone) continue;
    const phone = s.phone;
    const createdMs = s.createdAt.getTime();

    const inDay3  = createdMs >= day3Start.getTime()  && createdMs <= day3End.getTime();
    const inDay7  = createdMs >= day7Start.getTime()  && createdMs <= day7End.getTime();
    const inDay14 = createdMs >= day14Start.getTime() && createdMs <= day14End.getTime();

    if (inDay3) {
      if (dripSentSet.has(`${s.id}:drip_day3_sent`)) continue;
      // Only send if profile is incomplete
      const profileComplete = !!s.company && !!s.gstNumber;
      if (profileComplete) continue;
      const message = buildDripMessage(s, 'day3');
      candidates.push({ supplierId: s.id, name: s.name ?? '', company: s.company, phone, dripType: 'day3', message, waLink: buildWaLink(phone, message), registeredAt: s.createdAt });
    } else if (inDay7) {
      if (dripSentSet.has(`${s.id}:drip_day7_sent`)) continue;
      // Only send if no quotes yet
      if (hasQuotedSet.has(s.id)) continue;
      const message = buildDripMessage(s, 'day7');
      candidates.push({ supplierId: s.id, name: s.name ?? '', company: s.company, phone, dripType: 'day7', message, waLink: buildWaLink(phone, message), registeredAt: s.createdAt });
    } else if (inDay14) {
      if (dripSentSet.has(`${s.id}:drip_day14_sent`)) continue;
      // Only send if inactive for 14+ days
      const lastLogin = s.lastLoginAt;
      const inactiveSince = !lastLogin || (now - lastLogin.getTime()) > 14 * 86400000;
      if (!inactiveSince) continue;
      const message = buildDripMessage(s, 'day14');
      candidates.push({ supplierId: s.id, name: s.name ?? '', company: s.company, phone, dripType: 'day14', message, waLink: buildWaLink(phone, message), registeredAt: s.createdAt });
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
