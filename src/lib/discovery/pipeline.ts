/**
 * Supplier pipeline + marketplace activation — database reader (MA-01).
 *
 * READ-ONLY. It loads the rows the pure rules in `pipeline-core.ts` need and returns their result. It never writes,
 * never sends anything, and adds no schema: the stages are derived. Load size is one row per supplier account
 * (about 1.4k today); if that grows past tens of thousands, move the aggregation into SQL or a materialised view.
 */

import { prisma } from '@/lib/prisma';
import {
  SEED_IMPORTED_FROM,
  computeActivation,
  computePipeline,
  type ActivationResult,
  type PipelineFacts,
  type PipelineOptions,
  type PipelineResult,
  type PipelineSupplierRow,
  type RfqFacts,
} from './pipeline-core';

export interface PipelineLoad {
  suppliers: PipelineSupplierRow[];
  facts: PipelineFacts;
  quoteCountBySupplier: Map<string, number>;
}

export async function loadPipelineInputs(): Promise<PipelineLoad> {
  const [suppliers, suppressions, sent, invitations, openEvents, quoteGroups] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'SUPPLIER' },
      select: {
        id: true, isActive: true, company: true, name: true, email: true, phone: true, importedFrom: true, gstNumber: true,
        preferences: true, isClaimed: true, claimedAt: true, claimSentAt: true, outreachCount: true, createdAt: true,
      },
    }),
    prisma.outreachSuppression.findMany({ select: { companyId: true, destination: true } }),
    prisma.outreachRecipient.findMany({ where: { state: { in: ['SENT', 'DELIVERED', 'CLAIMED'] } }, select: { companyId: true } }),
    prisma.claimInvitation.findMany({
      where: { OR: [{ viewedAt: { not: null } }, { status: { in: ['VIEWED', 'CLAIMED'] } }] },
      select: { companyId: true },
    }),
    prisma.interactionMemory.findMany({ where: { actionType: 'claim_link_opened', userId: { not: null } }, select: { userId: true }, distinct: ['userId'] }),
    prisma.quote.groupBy({ by: ['supplierId'], _count: { _all: true } }),
  ]);

  const quoteCountBySupplier = new Map<string, number>();
  for (const g of quoteGroups) if (g.supplierId) quoteCountBySupplier.set(g.supplierId, g._count._all);

  const digits = (d: string | null) => {
    const x = (d ?? '').replace(/\D/g, '');
    return x.length >= 10 ? x.slice(-10) : '';
  };

  return {
    suppliers: suppliers as PipelineSupplierRow[],
    quoteCountBySupplier,
    facts: {
      suppressedIds: new Set(suppressions.map((s) => s.companyId).filter((x): x is string => !!x)),
      suppressedPhones: new Set(suppressions.map((s) => digits(s.destination)).filter(Boolean)),
      campaignSentIds: new Set(sent.map((r) => r.companyId)),
      openedIds: new Set([...invitations.map((i) => i.companyId), ...openEvents.map((e) => e.userId).filter((x): x is string => !!x)]),
      quotedIds: new Set(Array.from(quoteCountBySupplier.keys())),
    },
  };
}

export async function computeSupplierPipeline(opts: PipelineOptions = {}): Promise<PipelineResult> {
  const { suppliers, facts } = await loadPipelineInputs();
  return computePipeline(suppliers, facts, opts);
}

export async function computeActivationDashboard(opts: PipelineOptions = {}): Promise<{ pipeline: PipelineResult; activation: ActivationResult }> {
  const { suppliers, facts, quoteCountBySupplier } = await loadPipelineInputs();
  const pipeline = computePipeline(suppliers, facts, opts);

  const consideredIds = new Set(suppliers.filter((s) => opts.includeSeed || s.importedFrom !== SEED_IMPORTED_FROM).map((s) => s.id));
  let quotesBySuppliers = 0;
  let rfqParticipants = 0;
  quoteCountBySupplier.forEach((n, id) => {
    if (consideredIds.has(id)) {
      quotesBySuppliers += n;
      rfqParticipants++;
    }
  });

  const [rfqTotal, rfqGroups, quotesTotal, buyerQuoteAlerts, dealsTotal, recipientGroups, last50] = await Promise.all([
    prisma.rFQ.count(),
    prisma.rFQ.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.quote.count(),
    prisma.notification.count({ where: { type: 'QUOTE_RECEIVED' } }),
    prisma.deal.count(),
    prisma.outreachRecipient.groupBy({ by: ['state'], _count: { _all: true } }),
    prisma.outreachRecipient.findMany({
      where: { state: { in: ['SENT', 'DELIVERED', 'CLAIMED', 'FAILED'] } },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: { state: true },
    }),
  ]);

  const rc = (s: string) => recipientGroups.find((g) => g.state === s)?._count._all ?? 0;
  const facts2: RfqFacts = {
    rfqTotal,
    rfqByStatus: Object.fromEntries(rfqGroups.map((g) => [String(g.status), g._count._all])),
    quotesBySuppliers,
    quotesTotal,
    rfqParticipants,
    buyerQuoteAlerts,
    dealsTotal,
    campaign: {
      sent: rc('SENT') + rc('CLAIMED'),
      delivered: rc('DELIVERED'),
      failed: rc('FAILED'),
      last50Sent: last50.filter((r) => r.state !== 'FAILED').length,
      last50Failed: last50.filter((r) => r.state === 'FAILED').length,
    },
  };
  return { pipeline, activation: computeActivation(pipeline, facts2) };
}
