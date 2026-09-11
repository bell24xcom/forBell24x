/**
 * H6-13 - Campaign orchestration service
 *
 * Owns the campaign lifecycle: create (always DRAFT) -> add recipients ->
 * dry-run (full simulation, zero external contact) -> promote to READY ->
 * promote to LIVE (explicit admin action, required) -> live send -> pause /
 * cancel. Every transition is validated against campaignStateMachine.ts;
 * every send is gated by canInvokeTransport().
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { canTransition, canInvokeTransport, type CampaignStatus } from './campaignStateMachine';
import { evaluateClaimOutreachEligibility, type EligibilityClassification } from './eligibility';
import { createClaimInvitation } from './claimInvitation';
import { signClaimToken, isClaimTokenConfigured } from './claimToken';
import { renderClaimTemplate, DEFAULT_CLAIM_TEMPLATE } from './messageTemplate';
import { dispatchClaimMessage } from './OutreachService';
import { SITE_URL } from '@/lib/site-url';
import { logDiscoveryEvent } from '@/src/lib/discovery/events';
import type { OutreachChannel } from '@prisma/client';

/** Recipient row state a given eligibility classification should be recorded as. */
const RECIPIENT_STATE_FOR_CLASSIFICATION: Record<EligibilityClassification, string> = {
  WOULD_SEND: 'DRY_RUN',
  SUPPRESSED: 'SUPPRESSED',
  INELIGIBLE: 'SKIPPED',
  ALREADY_CLAIMED: 'CLAIMED',
  INVALID_DESTINATION: 'SKIPPED',
};

export interface CreateCampaignInput {
  name: string;
  description?: string;
  channel: OutreachChannel;
  messageTemplate?: string;
  createdBy: string;
}

export async function createCampaign(input: CreateCampaignInput) {
  return prisma.outreachCampaign.create({
    data: {
      name: input.name,
      description: input.description,
      channel: input.channel,
      messageTemplate: input.messageTemplate || DEFAULT_CLAIM_TEMPLATE,
      createdBy: input.createdBy,
      // status defaults to DRAFT at the schema level - never set LIVE here.
    },
  });
}

/**
 * Server-side candidate lookup for the Admin UI's "select eligible
 * businesses" step (Phase 12). Returns unclaimed SUPPLIER profiles with a
 * usable phone number, highest trustScore first — the same base criteria
 * the existing bulk-wa outreach route uses (H6-12 audit), reused here
 * rather than re-derived. Does not check outreach-specific suppression;
 * that happens per-recipient at dry-run/live-send time via the
 * eligibility engine.
 */
export async function findCandidateCompanies(limit: number = 50) {
  return prisma.user.findMany({
    where: { role: 'SUPPLIER', isClaimed: false, phone: { not: null } },
    orderBy: { trustScore: 'desc' },
    take: Math.min(Math.max(1, limit), 200),
    select: { id: true, company: true, name: true, location: true, phone: true, trustScore: true },
  });
}

/** Admin explicitly selects which unclaimed businesses this campaign targets. Callable repeatedly while DRAFT. */
export async function addRecipients(campaignId: string, companyIds: string[]) {
  const campaign = await prisma.outreachCampaign.findUniqueOrThrow({ where: { id: campaignId } });
  if (campaign.status !== 'DRAFT') {
    throw new Error(`Cannot add recipients to a campaign in status ${campaign.status} - recipients may only be added while DRAFT`);
  }

  let added = 0;
  for (const companyId of companyIds) {
    await prisma.outreachRecipient.upsert({
      where: { campaignId_companyId: { campaignId, companyId } },
      update: {},
      create: { campaignId, companyId, channel: campaign.channel, state: 'PENDING' },
    });
    added++;
  }
  return { added };
}

export interface DryRunSummary {
  WOULD_SEND: number;
  SUPPRESSED: number;
  INELIGIBLE: number;
  ALREADY_CLAIMED: number;
  INVALID_DESTINATION: number;
  invitationsCreated: number;
}

/**
 * Full business-logic simulation. Evaluates eligibility for every
 * recipient, classifies each, and generates real claim invitations for
 * WOULD_SEND recipients (so the claim link genuinely works if someone were
 * to receive it - only the actual transport send is skipped). Never calls
 * OutreachService/dispatchClaimMessage.
 */
export async function runDryRun(campaignId: string): Promise<DryRunSummary> {
  const campaign = await prisma.outreachCampaign.findUniqueOrThrow({ where: { id: campaignId } });
  if (!canTransition(campaign.status as CampaignStatus, 'DRY_RUN') && campaign.status !== 'DRY_RUN') {
    throw new Error(`Cannot dry-run a campaign in status ${campaign.status}`);
  }

  const recipients = await prisma.outreachRecipient.findMany({ where: { campaignId } });
  const summary: DryRunSummary = {
    WOULD_SEND: 0, SUPPRESSED: 0, INELIGIBLE: 0, ALREADY_CLAIMED: 0, INVALID_DESTINATION: 0, invitationsCreated: 0,
  };

  for (const recipient of recipients) {
    const result = await evaluateClaimOutreachEligibility(recipient.companyId, campaignId);
    summary[result.classification]++;

    const patch: Record<string, unknown> = {
      state: RECIPIENT_STATE_FOR_CLASSIFICATION[result.classification],
      eligibilityReason: result.reason ?? null,
      destination: result.destination ?? null,
    };

    if (result.classification === 'WOULD_SEND' && !recipient.claimInvitationId) {
      try {
        const invitation = await createClaimInvitation(recipient.companyId, campaignId);
        patch.claimInvitationId = invitation.invitationId;
        summary.invitationsCreated++;
      } catch (err) {
        logger.warn('[runDryRun] failed to create claim invitation', { recipientId: recipient.id, error: err instanceof Error ? err.message : String(err) });
      }
    }

    await prisma.outreachRecipient.update({ where: { id: recipient.id }, data: patch });
  }

  await prisma.outreachCampaign.update({
    where: { id: campaignId },
    data: { status: 'DRY_RUN', lastDryRunAt: new Date(), dryRunSummary: summary as unknown as object },
  });

  return summary;
}

export async function promoteCampaign(campaignId: string, to: CampaignStatus, adminUserId: string) {
  const campaign = await prisma.outreachCampaign.findUniqueOrThrow({ where: { id: campaignId } });
  const from = campaign.status as CampaignStatus;
  if (!canTransition(from, to)) {
    throw new Error(`Cannot transition campaign from ${from} to ${to}`);
  }

  const data: Record<string, unknown> = { status: to };
  if (to === 'LIVE') {
    data.promotedToLiveAt = new Date();
    data.promotedToLiveBy = adminUserId;
  }
  if (to === 'PAUSED') data.pausedAt = new Date();
  if (to === 'CANCELLED') data.cancelledAt = new Date();

  const updated = await prisma.outreachCampaign.update({ where: { id: campaignId }, data });
  logger.info('[campaignService] campaign promoted', { campaignId, from, to, adminUserId });
  return updated;
}

export interface LiveSendSummary {
  attempted: number;
  sent: number;
  failed: number;
  notAvailable: number;
  suppressedAtSendTime: number;
}

/**
 * Sends to every WOULD_SEND-classified recipient. Re-checks eligibility
 * immediately before each send (never trusts a stale dry-run classification
 * - a recipient could have been claimed, suppressed, or opted out since the
 * dry-run ran). Refuses outright unless campaign.status === 'LIVE'.
 */
export async function executeLiveSend(campaignId: string): Promise<LiveSendSummary> {
  const campaign = await prisma.outreachCampaign.findUniqueOrThrow({ where: { id: campaignId } });
  if (!canInvokeTransport(campaign.status as CampaignStatus)) {
    throw new Error(`Refusing to send - campaign status is ${campaign.status}, not LIVE`);
  }

  const summary: LiveSendSummary = { attempted: 0, sent: 0, failed: 0, notAvailable: 0, suppressedAtSendTime: 0 };

  // Fail fast, before touching any recipient: every recipient would hit the
  // same missing-secret failure inside createClaimInvitation/signClaimToken
  // below, and letting that throw mid-loop would abort the whole batch with
  // no per-recipient summary - inconsistent with how every other
  // not-configured case in this codebase is handled (a typed NOT_AVAILABLE
  // result, not an exception).
  if (!isClaimTokenConfigured()) {
    const candidates = await prisma.outreachRecipient.findMany({
      where: { campaignId, state: { in: ['DRY_RUN', 'ELIGIBLE', 'QUEUED'] } },
      select: { id: true },
    });
    summary.attempted = candidates.length;
    summary.notAvailable = candidates.length;
    await prisma.outreachRecipient.updateMany({
      where: { id: { in: candidates.map(c => c.id) } },
      data: { state: 'FAILED', failureReason: 'CLAIM_INVITATION_SECRET is not configured' },
    });
    logger.warn('[campaignService] live send blocked - CLAIM_INVITATION_SECRET not configured', { campaignId });
    return summary;
  }

  const recipients = await prisma.outreachRecipient.findMany({
    where: { campaignId, state: { in: ['DRY_RUN', 'ELIGIBLE', 'QUEUED'] } },
    include: { claimInvitation: true },
  });

  for (const recipient of recipients) {
    // Atomically claim this recipient row before doing anything else, so a
    // concurrent executeLiveSend invocation (double-click past the client
    // busy-guard, a retry, a second tab) can never process - and never
    // send to - the same recipient twice. Whichever invocation's update
    // lands first wins; the loser sees count 0 and skips the row.
    const claim = await prisma.outreachRecipient.updateMany({
      where: { id: recipient.id, state: { in: ['DRY_RUN', 'ELIGIBLE', 'QUEUED'] } },
      data: { state: 'QUEUED', queuedAt: new Date() },
    });
    if (claim.count === 0) continue; // another concurrent invocation already claimed this recipient

    summary.attempted++;

    const fresh = await evaluateClaimOutreachEligibility(recipient.companyId, campaignId);
    if (fresh.classification !== 'WOULD_SEND') {
      summary.suppressedAtSendTime++;
      await prisma.outreachRecipient.update({
        where: { id: recipient.id },
        data: { state: fresh.classification === 'ALREADY_CLAIMED' ? 'CLAIMED' : 'SKIPPED', eligibilityReason: fresh.reason ?? null },
      });
      continue;
    }

    let invitation = recipient.claimInvitation;
    if (!invitation) {
      const created = await createClaimInvitation(recipient.companyId, campaignId);
      invitation = await prisma.claimInvitation.findUniqueOrThrow({ where: { id: created.invitationId } });
      await prisma.outreachRecipient.update({ where: { id: recipient.id }, data: { claimInvitationId: invitation.id } });
    }

    // The token is never persisted (by design - see claimToken.ts), so it is
    // re-signed here from the DB row's own ids each time a message is
    // actually sent. Re-signing is safe and idempotent: same payload in,
    // same claim resolved via resolveClaimInvitation() at redemption.
    const claimToken = signClaimToken({ companyId: recipient.companyId, campaignId, invitationId: invitation.id });
    const claimUrl = `${SITE_URL}/claim/${claimToken}`;

    const company = await prisma.user.findUniqueOrThrow({ where: { id: recipient.companyId }, select: { company: true, name: true, location: true } });
    const companyName = company.company || company.name || 'your business';
    const rendered = renderClaimTemplate(campaign.messageTemplate || DEFAULT_CLAIM_TEMPLATE, {
      company_name: companyName,
      city: company.location || undefined,
      claim_url: claimUrl,
    });

    if (!rendered.ok || !rendered.text) {
      summary.failed++;
      await prisma.outreachRecipient.update({ where: { id: recipient.id }, data: { state: 'FAILED', failureReason: rendered.errors.join('; ') } });
      continue;
    }

    const outcome = await dispatchClaimMessage({
      campaignStatus: campaign.status as CampaignStatus,
      channel: campaign.channel,
      destination: fresh.destination!,
      text: rendered.text,
      whatsappTemplateName: process.env.META_WHATSAPP_CLAIM_TEMPLATE || undefined,
    });

    if (outcome.status === 'SENT') {
      summary.sent++;
      await prisma.outreachRecipient.update({
        where: { id: recipient.id },
        data: { state: 'SENT', sentAt: new Date(), providerMessageId: outcome.providerMessageId },
      });
      logDiscoveryEvent('invitation_sent', {
        userId: recipient.companyId,
        metadata: {
          campaignId,
          invitationId: invitation.id,
          channel: campaign.channel,
          providerMessageId: outcome.providerMessageId ?? null,
        },
      });
    } else if (outcome.status === 'NOT_AVAILABLE') {
      summary.notAvailable++;
      await prisma.outreachRecipient.update({ where: { id: recipient.id }, data: { state: 'FAILED', failureReason: outcome.reason } });
    } else {
      summary.failed++;
      const failureReason = outcome.status === 'FAILED' ? outcome.errorMessage : 'Blocked: campaign not LIVE';
      await prisma.outreachRecipient.update({ where: { id: recipient.id }, data: { state: 'FAILED', failureReason } });
    }
  }

  if (summary.attempted > 0 && summary.attempted === summary.sent + summary.failed + summary.notAvailable + summary.suppressedAtSendTime) {
    await prisma.outreachCampaign.update({ where: { id: campaignId }, data: { status: 'COMPLETED' } });
  }

  logger.info('[campaignService] live send complete', { campaignId, ...summary });
  return summary;
}
