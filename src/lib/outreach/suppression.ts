/**
 * H6-13 - Suppression (first-class, DB-backed)
 *
 * Integrates with the existing OutreachConsentLog table (opt-out tracking,
 * previously written but never read by any code path - confirmed via
 * repo-wide grep during this sprint's audit) rather than duplicating an
 * opt-out concept. OutreachSuppression is additive: it covers reason codes
 * OutreachConsentLog has no room for (BOUNCED, CLAIMED, INELIGIBLE).
 *
 * checkSuppression() is the single function every eligibility/send path
 * must call - it is the integration point between the two tables.
 */

import { prisma } from '@/lib/prisma';
import type { OutreachChannel, SuppressionReason } from '@prisma/client';

export interface SuppressionCheckInput {
  companyId?: string;
  destination?: string;
  channel: OutreachChannel;
}

export interface SuppressionCheckResult {
  suppressed: boolean;
  reason?: SuppressionReason | 'OPT_OUT';
  source?: string;
}

/**
 * Checks both suppression sources. Order: OutreachSuppression (reason-coded,
 * channel-aware) first, then OutreachConsentLog.optOutAt (legacy opt-out
 * signal, channel-agnostic - an opt-out recorded for any channel suppresses
 * all channels, since it predates per-channel granularity).
 */
export async function checkSuppression(input: SuppressionCheckInput): Promise<SuppressionCheckResult> {
  const { companyId, destination, channel } = input;

  const orClauses: Array<Record<string, unknown>> = [];
  if (companyId) orClauses.push({ companyId });
  if (destination) orClauses.push({ destination });
  if (orClauses.length === 0) {
    return { suppressed: false };
  }

  const row = await prisma.outreachSuppression.findFirst({
    where: {
      OR: orClauses,
      AND: [{ OR: [{ channel: null }, { channel }] }],
    },
    orderBy: { createdAt: 'desc' },
  });
  if (row) {
    return { suppressed: true, reason: row.reason, source: row.source };
  }

  if (destination) {
    const consentRow = await prisma.outreachConsentLog.findFirst({
      where: { contactId: destination, optOutAt: { not: null } },
      orderBy: { optOutAt: 'desc' },
    });
    if (consentRow) {
      return { suppressed: true, reason: 'OPT_OUT', source: 'outreach_consent_log' };
    }
  }

  return { suppressed: false };
}

export async function addSuppression(params: {
  companyId?: string;
  destination?: string;
  channel?: OutreachChannel; // omit to suppress across all channels
  reason: SuppressionReason;
  source: string;
  createdBy?: string;
}) {
  return prisma.outreachSuppression.create({
    data: {
      companyId: params.companyId,
      destination: params.destination,
      channel: params.channel,
      reason: params.reason,
      source: params.source,
      createdBy: params.createdBy,
    },
  });
}
