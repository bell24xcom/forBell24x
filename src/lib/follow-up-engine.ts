import { prisma } from '@/lib/prisma';

export type FollowUpType = 'day2' | 'day5';

const FOLLOWUP_DAYS: Record<FollowUpType, number> = { day2: 2, day5: 5 };

export interface FollowUpDue {
  rfqId:        string;
  title:        string;
  userId:       string | null;
  category:     string;
  followUpType: FollowUpType;
  quoteCount:   number;
}

export async function getFollowUpsDue(): Promise<FollowUpDue[]> {
  const now     = Date.now();
  const results: FollowUpDue[] = [];

  for (const [followUpType, days] of Object.entries(FOLLOWUP_DAYS) as [FollowUpType, number][]) {
    const cutoff     = new Date(now - days * 24 * 60 * 60 * 1000);
    const actionType = `rfq_followup_${followUpType}`;

    const alreadyLogged = await prisma.interactionMemory
      .findMany({ where: { actionType }, select: { rfqId: true } })
      .then(rows => rows.map(r => r.rfqId).filter((id): id is string => id !== null));

    const rfqs = await prisma.rFQ.findMany({
      where: {
        status:    { in: ['ACTIVE', 'OPEN'] },
        createdAt: { lte: cutoff },
        isSeeded:  false,
        ...(alreadyLogged.length > 0 ? { id: { notIn: alreadyLogged } } : {}),
      },
      select: {
        id: true, title: true, createdBy: true, category: true,
        _count: { select: { quotes: true } },
      },
    });

    for (const rfq of rfqs) {
      results.push({
        rfqId:        rfq.id,
        title:        rfq.title,
        userId:       rfq.createdBy,
        category:     rfq.category,
        followUpType,
        quoteCount:   rfq._count.quotes,
      });
    }
  }

  return results;
}
