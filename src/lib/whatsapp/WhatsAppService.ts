/**
 * VyaparSethu — WhatsApp Service (business-facing boundary)
 *
 * VyaparSethu business logic (RFQ notifications, admin test-send, etc.)
 * should call this module — never MetaWhatsAppProvider or graph.facebook.com
 * directly. This indirection is what lets a future Bell24h-OS Communication
 * Hub swap the underlying provider without touching callers.
 *
 *   VyaparSethu Business Logic → WhatsAppService → MetaWhatsAppProvider → Meta Cloud API
 *
 * Server-side only.
 */

import { getSafeStatus, getSendReadiness, WhatsAppConfigError } from './config';
import { sendTextMessage as metaSendText, sendTemplateMessage as metaSendTemplate, MetaApiError } from './MetaWhatsAppProvider';
import { logger } from '@/lib/logger';

export type WhatsAppSendOutcome =
  | { status: 'SENT'; messageId?: string; httpStatus: number }
  | { status: 'NOT_CONFIGURED'; missing: string[] }
  | { status: 'META_ERROR'; httpStatus: number; errorCode?: string; errorMessage?: string };

function safeLogMeta(to: string) {
  // Log only a redacted recipient — never the message body, token, or app secret.
  return { toRedacted: to.length > 4 ? `***${to.slice(-4)}` : '***' };
}

export async function sendTextMessage(to: string, body: string): Promise<WhatsAppSendOutcome> {
  const readiness = getSendReadiness();
  if (!readiness.ready) {
    return { status: 'NOT_CONFIGURED', missing: readiness.missing };
  }

  try {
    const result = await metaSendText(to, body);
    if (!result.ok) {
      logger.warn('[WhatsAppService] send failed', { ...safeLogMeta(to), errorCode: result.errorCode });
      return { status: 'META_ERROR', httpStatus: result.httpStatus, errorCode: result.errorCode, errorMessage: result.errorMessage };
    }
    logger.info('[WhatsAppService] text message sent', safeLogMeta(to));
    return { status: 'SENT', messageId: result.messageId, httpStatus: result.httpStatus };
  } catch (err) {
    if (err instanceof WhatsAppConfigError) {
      return { status: 'NOT_CONFIGURED', missing: getSendReadiness().missing };
    }
    if (err instanceof MetaApiError) {
      return { status: 'META_ERROR', httpStatus: err.httpStatus, errorCode: err.metaErrorCode, errorMessage: err.message };
    }
    throw err;
  }
}

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = 'en',
  components: unknown[] = []
): Promise<WhatsAppSendOutcome> {
  const readiness = getSendReadiness();
  if (!readiness.ready) {
    return { status: 'NOT_CONFIGURED', missing: readiness.missing };
  }

  try {
    const result = await metaSendTemplate(to, templateName, languageCode, components);
    if (!result.ok) {
      logger.warn('[WhatsAppService] template send failed', { ...safeLogMeta(to), templateName, errorCode: result.errorCode });
      return { status: 'META_ERROR', httpStatus: result.httpStatus, errorCode: result.errorCode, errorMessage: result.errorMessage };
    }
    logger.info('[WhatsAppService] template message sent', { ...safeLogMeta(to), templateName });
    return { status: 'SENT', messageId: result.messageId, httpStatus: result.httpStatus };
  } catch (err) {
    if (err instanceof WhatsAppConfigError) {
      return { status: 'NOT_CONFIGURED', missing: getSendReadiness().missing };
    }
    if (err instanceof MetaApiError) {
      return { status: 'META_ERROR', httpStatus: err.httpStatus, errorCode: err.metaErrorCode, errorMessage: err.message };
    }
    throw err;
  }
}

/** Safe (non-secret) status snapshot for the Admin UI. */
export function getStatus() {
  return getSafeStatus();
}
