/**
 * H6-13 - OutreachService (business-facing channel dispatch)
 *
 * Mirrors the H6-12 boundary pattern: business logic calls OutreachService,
 * never a transport provider directly.
 *
 *   OutreachService
 *         |-- WHATSAPP -> WhatsAppService -> MetaWhatsAppProvider -> Meta Cloud API
 *         |-- EMAIL    -> (no outbound-send abstraction exists in this repo - documented gap)
 *         `-- SMS      -> (no generic outbound-SMS abstraction exists - MSG91 is wired for OTP only - documented gap)
 *
 * MetaWhatsAppProvider is not imported here and is not modified by H6-13.
 *
 * canInvokeTransport() is checked here too (not just by the caller) as a
 * second, independent gate - defense in depth against a caller forgetting
 * the check.
 */

import { sendTemplateMessage as whatsappSendTemplate } from '@/src/lib/whatsapp/WhatsAppService';
import { canInvokeTransport, type CampaignStatus } from './campaignStateMachine';
import type { OutreachChannel } from '@prisma/client';

export type DispatchOutcome =
  | { status: 'SENT'; providerMessageId?: string }
  | { status: 'FAILED'; errorMessage: string }
  | { status: 'NOT_AVAILABLE'; reason: string }
  | { status: 'BLOCKED_NOT_LIVE' };

export interface DispatchInput {
  campaignStatus: CampaignStatus;
  channel: OutreachChannel;
  destination: string;
  text: string;
  /** WhatsApp requires a pre-approved Meta template outside the 24h window - see H6-12. */
  whatsappTemplateName?: string;
}

export async function dispatchClaimMessage(input: DispatchInput): Promise<DispatchOutcome> {
  if (!canInvokeTransport(input.campaignStatus)) {
    // This must never happen if callers respect the state machine - treat
    // it as a hard stop rather than silently no-op-ing, so a caller bug is
    // loud rather than silently swallowing a send.
    return { status: 'BLOCKED_NOT_LIVE' };
  }

  if (input.channel === 'WHATSAPP') {
    if (!input.whatsappTemplateName) {
      return { status: 'FAILED', errorMessage: 'whatsappTemplateName is required to send outside the 24h session window' };
    }
    const outcome = await whatsappSendTemplate(input.destination, input.whatsappTemplateName, 'en', [
      { type: 'body', parameters: [{ type: 'text', text: input.text }] },
    ]);
    if (outcome.status === 'SENT') return { status: 'SENT', providerMessageId: outcome.messageId };
    if (outcome.status === 'NOT_CONFIGURED') {
      return { status: 'NOT_AVAILABLE', reason: `Meta WhatsApp Cloud API not configured - missing: ${outcome.missing.join(', ')}` };
    }
    return { status: 'FAILED', errorMessage: outcome.errorMessage || `Meta API error (HTTP ${outcome.httpStatus})` };
  }

  if (input.channel === 'EMAIL') {
    return { status: 'NOT_AVAILABLE', reason: 'No outbound email-send abstraction exists in this repository (H6-13 documented gap) - only an inbound Resend webhook receiver was found.' };
  }

  if (input.channel === 'SMS') {
    return { status: 'NOT_AVAILABLE', reason: 'MSG91 is wired for OTP only in this repository - no generic outbound transactional SMS send exists (H6-13 documented gap).' };
  }

  return { status: 'NOT_AVAILABLE', reason: `Unknown channel: ${input.channel}` };
}
