/**
 * Marketplace Certification (Part B).
 *
 * Certification status is DERIVED from existing records (RFQ, MatchApproval,
 * WhatsAppSendLog, Quote) rather than stored as its own mutable field. This
 * is a deliberate choice over adding a persisted state machine: a derived
 * status can never drift out of sync with the records that actually
 * happened, which is the same principle this session's earlier audits
 * relied on when certifying the WhatsApp ops dashboard's math against raw
 * webhook rows. "Draft" is intentionally absent — no RFQ-creation path in
 * this repo ever persists RFQStatus.DRAFT (confirmed by grep before writing
 * this file), so it is a pre-submission UI state only, never a server-side
 * certification stage.
 */
import { prisma } from '@/lib/prisma';

export type CertificationStage =
  | 'PENDING_APPROVAL'
  | 'REJECTED'
  | 'APPROVED'
  | 'NOTIFICATION_SENT'
  | 'QUOTE_RECEIVED'
  | 'CERTIFIED';

export interface CertificationRecord {
  rfqId: string;
  rfqTitle: string;
  category: string;
  location: string | null;
  videoUrl: string | null;
  stage: CertificationStage;
  matchApprovalId: string | null;
  matchApprovalStatus: string | null;
  isCertificationTest: boolean;
  sendCount: number;
  deliveredOrReadCount: number;
  failedCount: number;
  quoteCount: number;
  lastEventAt: Date;
}

/**
 * Computes the single furthest stage reached, from the evidence given.
 * REJECTED is terminal and reported even if later evidence somehow exists
 * (it shouldn't, since releaseApprovedNotifications only ever runs after
 * an APPROVED transition — surfacing REJECTED here would itself be a bug
 * worth seeing, not something to hide behind a "further" stage).
 */
export function computeCertificationStage(input: {
  matchApprovalStatus: string | null;
  sendCount: number;
  deliveredOrReadCount: number;
  quoteCount: number;
}): CertificationStage {
  if (input.matchApprovalStatus === 'REJECTED') return 'REJECTED';
  if (input.matchApprovalStatus === 'PENDING_FOUNDER_APPROVAL') return 'PENDING_APPROVAL';

  // Either explicitly APPROVED, or never needed approval (the normal,
  // >= minimum-relevant-matches auto-notify path) — both count as cleared.
  if (input.quoteCount > 0 && input.deliveredOrReadCount > 0) return 'CERTIFIED';
  if (input.quoteCount > 0) return 'QUOTE_RECEIVED';
  if (input.sendCount > 0) return 'NOTIFICATION_SENT';
  return 'APPROVED';
}

/**
 * Certification overview for the Founder Cockpit (Part E). Scoped to RFQs
 * that have entered the observable pipeline — i.e. have a MatchApproval
 * row and/or at least one WhatsAppSendLog row — rather than every RFQ ever
 * created, most of which (per this session's own production data) never
 * had a real supplier contact attempt recorded at all.
 */
export async function getCertificationOverview(limit = 50): Promise<CertificationRecord[]> {
  const [approvals, sendLogs] = await Promise.all([
    prisma.matchApproval.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { rfq: { select: { id: true, title: true, category: true, location: true, videoUrl: true } } },
    }),
    prisma.whatsAppSendLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: limit * 5,
    }),
  ]);

  const rfqIdsFromApprovals = new Set(approvals.map((a) => a.rfqId));
  const rfqIdsFromSends = new Set(sendLogs.map((s) => s.rfqId).filter((id): id is string => !!id));
  const allRfqIds = Array.from(
    new Set(Array.from(rfqIdsFromApprovals).concat(Array.from(rfqIdsFromSends)))
  ).slice(0, limit);

  const rfqsNeedingLookup = allRfqIds.filter((id) => !rfqIdsFromApprovals.has(id));
  const extraRfqs = rfqsNeedingLookup.length
    ? await prisma.rFQ.findMany({
        where: { id: { in: rfqsNeedingLookup } },
        select: { id: true, title: true, category: true, location: true, videoUrl: true },
      })
    : [];

  const rfqInfoById = new Map<string, { id: string; title: string; category: string; location: string | null; videoUrl: string | null }>();
  for (const a of approvals) rfqInfoById.set(a.rfqId, a.rfq);
  for (const r of extraRfqs) rfqInfoById.set(r.id, r);

  const approvalByRfqId = new Map(approvals.map((a) => [a.rfqId, a]));
  const quoteCounts = await prisma.quote.groupBy({
    by: ['rfqId'],
    where: { rfqId: { in: allRfqIds as string[] } },
    _count: { _all: true },
  });
  const quoteCountByRfqId = new Map(quoteCounts.map((q) => [q.rfqId, q._count._all]));

  const rawRecords = allRfqIds.map((rfqId): CertificationRecord | null => {
      const rfq = rfqInfoById.get(rfqId);
      if (!rfq) return null;
      const approval = approvalByRfqId.get(rfqId) ?? null;
      const sendsForRfq = sendLogs.filter((s) => s.rfqId === rfqId);
      const deliveredOrReadCount = sendsForRfq.filter((s) => s.deliveryStatus === 'delivered' || s.deliveryStatus === 'read').length;
      const failedCount = sendsForRfq.filter((s) => s.deliveryStatus === 'failed').length;
      const quoteCount = quoteCountByRfqId.get(rfqId) ?? 0;

      const stage = computeCertificationStage({
        matchApprovalStatus: approval?.status ?? null,
        sendCount: sendsForRfq.length,
        deliveredOrReadCount,
        quoteCount,
      });

      const lastEventAt = [approval?.createdAt, ...sendsForRfq.map((s) => s.sentAt)]
        .filter((d): d is Date => !!d)
        .sort((a, b) => b.getTime() - a.getTime())[0] ?? new Date(0);

      return {
        rfqId,
        rfqTitle: rfq.title,
        category: rfq.category,
        location: rfq.location,
        videoUrl: rfq.videoUrl,
        stage,
        matchApprovalId: approval?.id ?? null,
        matchApprovalStatus: approval?.status ?? null,
        isCertificationTest: approval?.isCertificationTest ?? false,
        sendCount: sendsForRfq.length,
        deliveredOrReadCount,
        failedCount,
        quoteCount,
        lastEventAt,
      };
  });

  const records: CertificationRecord[] = rawRecords
    .filter((r): r is CertificationRecord => r !== null)
    .sort((a, b) => b.lastEventAt.getTime() - a.lastEventAt.getTime());

  return records;
}
