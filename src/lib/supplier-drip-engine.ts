import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site-url';

export type DripType = 'day3' | 'day7' | 'day14';

const DRIP_DAYS: Record<DripType, number> = { day3: 3, day7: 7, day14: 14 };

const DRIP_MESSAGES: Record<DripType, (company: string, link: string) => string> = {
  day3: (c, l) =>
    `Hi ${c} 👋 Reminder about your free verified supplier profile on VyaparSethu. Buyers in your cluster are actively posting Requirements. Claim it in 2 min: ${l}`,
  day7: (c, l) =>
    `Hi ${c} — It's been a week. Verified buyers are searching your category on VyaparSethu right now. Your profile slot is still reserved: ${l}`,
  day14: (c, l) =>
    `Hi ${c} — Last message. We're completing our verified supplier list for your category this week. Claim your free profile before it's offered to a competitor: ${l}`,
};

export interface DripDue {
  supplierId: string;
  name:       string | null;
  company:    string | null;
  phone:      string | null;
  dripType:   DripType;
  waLink:     string | null;
}

export async function getDripsDue(): Promise<DripDue[]> {
  const now     = Date.now();
  const results: DripDue[] = [];

  for (const [dripType, days] of Object.entries(DRIP_DAYS) as [DripType, number][]) {
    const cutoff     = new Date(now - days * 24 * 60 * 60 * 1000);
    const actionType = `drip_${dripType}`;

    const alreadyLogged = await prisma.interactionMemory
      .findMany({ where: { actionType }, select: { userId: true } })
      .then(rows => rows.map(r => r.userId).filter((id): id is string => id !== null));

    const suppliers = await prisma.user.findMany({
      where: {
        role:        'SUPPLIER',
        isClaimed:   false,
        claimSentAt: { lte: cutoff },
        ...(alreadyLogged.length > 0 ? { id: { notIn: alreadyLogged } } : {}),
      },
      select: { id: true, name: true, company: true, phone: true, claimToken: true },
    });

    for (const s of suppliers) {
      const claimLink   = s.claimToken ? `${SITE_URL}/claim/${s.claimToken}` : SITE_URL;
      const companyName = (s.company && s.company.trim()) ? s.company : 'your business';
      const rawPhone    = (s.phone || '').replace(/\D/g, '').slice(-10);
      const message     = DRIP_MESSAGES[dripType](companyName, claimLink);
      const waLink      = rawPhone.length === 10
        ? `https://wa.me/91${rawPhone}?text=${encodeURIComponent(message)}`
        : null;

      results.push({ supplierId: s.id, name: s.name, company: s.company, phone: s.phone, dripType, waLink });
    }
  }

  return results;
}

// Idempotent — safe to call multiple times; only logs once per supplier+dripType
export async function logDripSent(supplierId: string, dripType: DripType): Promise<void> {
  const actionType = `drip_${dripType}`;
  const existing   = await prisma.interactionMemory.findFirst({ where: { userId: supplierId, actionType } });
  if (existing) return;
  await prisma.interactionMemory.create({
    data: {
      userId:     supplierId,
      actionType,
      source:     'cron',
      metadata:   { dripState: dripType, sentAt: new Date().toISOString() },
    },
  });
}

export interface OutreachSummary {
  activeOutreachCount: number; // suppliers who received ≥1 outreach message
  claimedCount:        number; // suppliers who successfully claimed their profile
  conversionRate:      number; // percentage: claimedCount / activeOutreachCount × 100
}

// Read-only — never mutates. Returns aggregated Customer Discovery traction for admin views.
export async function getOutreachSummary(): Promise<OutreachSummary> {
  const [activeOutreachCount, claimedCount] = await Promise.all([
    prisma.user.count({ where: { role: 'SUPPLIER', outreachCount: { gt: 0 } } }),
    prisma.user.count({ where: { role: 'SUPPLIER', isClaimed: true } }),
  ]);

  const conversionRate = activeOutreachCount > 0
    ? parseFloat(((claimedCount / activeOutreachCount) * 100).toFixed(2))
    : 0;

  return { activeOutreachCount, claimedCount, conversionRate };
}
