import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site-url';

export type DripType = 'day3' | 'day7' | 'day14';

const DRIP_DAYS: Record<DripType, number> = { day3: 3, day7: 7, day14: 14 };

// owner = owner first name (e.g. "Ishwar"), company = company display name
const DRIP_MESSAGES: Record<DripType, (owner: string, company: string, link: string) => string> = {
  day3: (owner, company, l) =>
    `${owner} ji 👋\n\nJust checking in — ${company}'s profile on VyaparSethu is still unclaimed.\n\nBuyers in your area are posting Requirements this week. Your slot is reserved.\n\nClaim free (2 min): ${l}\n\nReply STOP anytime.`,
  day7: (owner, _company, l) =>
    `${owner} ji — it's been a week.\n\nVerified buyers are searching your category on VyaparSethu right now. Your profile is still available for free.\n\n${l}\n\nReply STOP to opt out permanently.`,
  day14: (owner, company, l) =>
    `${owner} ji, this is our last message.\n\n${company}'s profile will be offered to another supplier in your category if unclaimed this week.\n\nVyaparSethu's Protected Payment removes bad debt risk for suppliers.\n\nClaim free: ${l}\n\nReply STOP to never hear from us again.`,
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
      const companyName = (s.company && s.company.trim()) ? s.company.trim() : 'your business';
      // Use owner first name for personalized greeting; fall back to company name
      const ownerFirst  = (s.name || '').split(' ')[0].trim() || companyName;
      const rawPhone    = (s.phone || '').replace(/\D/g, '').slice(-10);
      const message     = DRIP_MESSAGES[dripType](ownerFirst, companyName, claimLink);
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
