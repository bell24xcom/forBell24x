/**
 * H6-13 - Centralized eligibility engine
 *
 * ONE function decides whether a company/recipient may receive claim
 * outreach. Every caller (dry-run, live send, invitation generation) must
 * go through this - eligibility rules must never be re-implemented in a
 * route handler or the Admin UI.
 */

import { prisma } from '@/lib/prisma';
import { checkSuppression } from './suppression';
import type { OutreachChannel } from '@prisma/client';

export type EligibilityClassification =
  | 'WOULD_SEND'
  | 'SUPPRESSED'
  | 'INELIGIBLE'
  | 'ALREADY_CLAIMED'
  | 'INVALID_DESTINATION';

export interface EligibilityResult {
  classification: EligibilityClassification;
  destination?: string;
  reason?: string;
}

function normalizeWhatsAppDestination(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '').slice(-10);
  return /^[6-9]\d{9}$/.test(digits) ? `91${digits}` : null;
}

/**
 * companyId must reference an existing users row. campaignId is required
 * so the channel-specific destination and suppression check are correct
 * for the campaign actually being evaluated.
 */
export async function evaluateClaimOutreachEligibility(
  companyId: string,
  campaignId: string
): Promise<EligibilityResult> {
  const [company, campaign] = await Promise.all([
    prisma.user.findUnique({
      where: { id: companyId },
      select: { id: true, isClaimed: true, phone: true, email: true, role: true },
    }),
    prisma.outreachCampaign.findUnique({ where: { id: campaignId }, select: { id: true, channel: true } }),
  ]);

  if (!company) {
    return { classification: 'INELIGIBLE', reason: 'Company not found' };
  }
  if (!campaign) {
    return { classification: 'INELIGIBLE', reason: 'Campaign not found' };
  }
  if (company.role !== 'SUPPLIER') {
    return { classification: 'INELIGIBLE', reason: 'Not a supplier profile' };
  }
  if (company.isClaimed) {
    return { classification: 'ALREADY_CLAIMED' };
  }

  const destination = resolveDestination(campaign.channel, company);
  if (!destination) {
    return { classification: 'INVALID_DESTINATION', reason: `No usable ${campaign.channel} destination on file` };
  }

  const suppression = await checkSuppression({ companyId: company.id, destination, channel: campaign.channel });
  if (suppression.suppressed) {
    return { classification: 'SUPPRESSED', destination, reason: suppression.reason };
  }

  return { classification: 'WOULD_SEND', destination };
}

function resolveDestination(
  channel: OutreachChannel,
  company: { phone: string | null; email: string | null }
): string | null {
  if (channel === 'WHATSAPP') return normalizeWhatsAppDestination(company.phone);
  if (channel === 'EMAIL') return company.email && /.+@.+\..+/.test(company.email) ? company.email : null;
  if (channel === 'SMS') return normalizeWhatsAppDestination(company.phone); // same 10-digit Indian mobile rule
  return null;
}
