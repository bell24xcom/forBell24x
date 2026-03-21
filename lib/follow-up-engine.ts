/**
 * Follow-up Engine
 * ─────────────────────────────────────────────────
 * Identifies suppliers due for Day 2 and Day 5 follow-ups.
 *
 * Uses InteractionMemory action types:
 *   outreach_sent     → initial contact (Day 0)
 *   follow_up_1_sent  → Day 2 follow-up
 *   follow_up_2_sent  → Day 5 final follow-up
 *
 * Skips suppliers who have since quoted (replied) for the RFQ.
 * Skips if the follow-up was already sent.
 * Day 5 is only triggered if Day 2 was already done.
 */

import { prisma } from '@/lib/prisma';
import { storeInteraction } from '@/lib/memory-engine';

export type FollowUpType = 'day2' | 'day5';

export interface FollowUpCandidate {
  supplierId: string;
  rfqId: string;
  followUpType: FollowUpType;
  name: string;
  company: string;
  phone: string | null;
  trustScore: number;
  rfqTitle: string;
  rfqCategory: string;
  message: string;
  waLink: string | null;
  firstContactedAt: Date;
}

function buildFollowUpMessage(
  rfq: { id: string; title: string; category: string },
  supplier: { name: string | null; company: string | null },
  type: FollowUpType
): string {
  const name = supplier.name ?? supplier.company ?? 'there';
  const link = `https://www.bell24h.com/rfq/${rfq.id}`;

  if (type === 'day2') {
    return `Hi ${name},

Following up on the buyer requirement we shared 2 days ago:

📦 ${rfq.title}
📍 ${rfq.category}

Buyer is still waiting. First supplier to reply gets priority.

Submit your quote here:
${link}

— Bell24h Team`;
  }

  return `Hi ${name},

Last reminder — this RFQ closes soon:

📦 ${rfq.title}
📍 ${rfq.category}

Don't miss this buyer. Quote before it expires:
${link}

— Bell24h`;
}

export async function getFollowUpsDue(): Promise<FollowUpCandidate[]> {
  const now = Date.now();

  // Day 2 window: 48–72h since outreach_sent
  const day2Start = new Date(now - 72 * 60 * 60 * 1000);
  const day2End   = new Date(now - 48 * 60 * 60 * 1000);

  // Day 5 window: 5–6 days since outreach_sent
  const day5Start = new Date(now - 6 * 24 * 60 * 60 * 1000);
  const day5End   = new Date(now - 5 * 24 * 60 * 60 * 1000);

  // Fetch initial contacts in both windows (single wide query)
  const initialContacts = await prisma.interactionMemory.findMany({
    where: {
      actionType: 'outreach_sent',
      createdAt: { gte: day5Start, lte: day2End },
      rfqId: { not: null },
      userId: { not: null },
    },
    select: { userId: true, rfqId: true, createdAt: true },
  });

  if (initialContacts.length === 0) return [];

  const userIds   = [...new Set(initialContacts.map(c => c.userId!))];
  const rfqIds    = [...new Set(initialContacts.map(c => c.rfqId!))];

  // Batch-fetch follow-up history, quotes, suppliers, and RFQs
  const [followUpsSent, quotes, suppliers, rfqs] = await Promise.all([
    prisma.interactionMemory.findMany({
      where: {
        actionType: { in: ['follow_up_1_sent', 'follow_up_2_sent'] },
        userId: { in: userIds },
        rfqId: { in: rfqIds },
      },
      select: { userId: true, rfqId: true, actionType: true },
    }),
    prisma.quote.findMany({
      where: { supplierId: { in: userIds }, rfqId: { in: rfqIds } },
      select: { supplierId: true, rfqId: true },
    }),
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, company: true, phone: true, trustScore: true },
    }),
    prisma.rFQ.findMany({
      where: { id: { in: rfqIds } },
      select: { id: true, title: true, category: true, status: true },
    }),
  ]);

  // Build fast lookup sets
  const followUpSet = new Set(followUpsSent.map(f => `${f.userId}:${f.rfqId}:${f.actionType}`));
  const quotedSet   = new Set(quotes.map(q => `${q.supplierId}:${q.rfqId}`));
  const supplierMap = new Map(suppliers.map(s => [s.id, s]));
  const rfqMap      = new Map(rfqs.map(r => [r.id, r]));

  const candidates: FollowUpCandidate[] = [];

  for (const c of initialContacts) {
    const userId = c.userId!;
    const rfqId  = c.rfqId!;

    // Skip if supplier already quoted
    if (quotedSet.has(`${userId}:${rfqId}`)) continue;

    const supplier = supplierMap.get(userId);
    const rfq      = rfqMap.get(rfqId);
    if (!supplier || !rfq) continue;
    if (rfq.status === 'CLOSED' || rfq.status === 'EXPIRED') continue;

    const contactedAt = c.createdAt.getTime();
    const isDay2Window = contactedAt >= day2Start.getTime() && contactedAt <= day2End.getTime();
    const isDay5Window = contactedAt >= day5Start.getTime() && contactedAt <= day5End.getTime();

    if (isDay2Window) {
      // Skip if Day 2 already sent
      if (followUpSet.has(`${userId}:${rfqId}:follow_up_1_sent`)) continue;
      candidates.push(buildCandidate(supplier, rfq, c.createdAt, 'day2'));
    } else if (isDay5Window) {
      // Day 5 only if Day 2 was already done
      if (!followUpSet.has(`${userId}:${rfqId}:follow_up_1_sent`)) continue;
      // Skip if Day 5 already sent
      if (followUpSet.has(`${userId}:${rfqId}:follow_up_2_sent`)) continue;
      candidates.push(buildCandidate(supplier, rfq, c.createdAt, 'day5'));
    }
  }

  return candidates;
}

function buildCandidate(
  supplier: { id: string; name: string | null; company: string | null; phone: string | null; trustScore: number },
  rfq: { id: string; title: string; category: string },
  firstContactedAt: Date,
  type: FollowUpType
): FollowUpCandidate {
  const message = buildFollowUpMessage(rfq, supplier, type);
  const phone   = supplier.phone?.replace(/\D/g, '');
  const waLink  = phone
    ? `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(message)}`
    : null;

  return {
    supplierId: supplier.id,
    rfqId: rfq.id,
    followUpType: type,
    name: supplier.name ?? supplier.company ?? 'Supplier',
    company: supplier.company ?? 'Unknown',
    phone: supplier.phone,
    trustScore: supplier.trustScore,
    rfqTitle: rfq.title,
    rfqCategory: rfq.category,
    message,
    waLink,
    firstContactedAt,
  };
}

export async function logFollowUpSent(
  supplierId: string,
  rfqId: string,
  type: FollowUpType
): Promise<void> {
  const actionType = type === 'day2' ? 'follow_up_1_sent' : 'follow_up_2_sent';
  await storeInteraction({
    rfqId,
    userId: supplierId,
    actionType,
    source: 'whatsapp',
    metadata: { followUpType: type, sentAt: new Date().toISOString() },
  });
}
