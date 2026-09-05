/**
 * VyaparSethu — Meta WhatsApp Cloud API provider (low-level HTTP boundary)
 *
 * This is the ONLY module in the codebase that should construct requests
 * to graph.facebook.com. VyaparSethu business logic must never call Meta
 * URLs directly — it goes through WhatsAppService, which goes through
 * this provider. This keeps a single swap point for a future Bell24h-OS
 * Communication Hub.
 *
 * Server-side only. Never import this from a client component.
 */

import { getConfigOrThrow } from './config';

const GRAPH_API_VERSION = 'v21.0';

export interface MetaSendResult {
  ok: boolean;
  httpStatus: number;
  messageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

/** Distinct from WhatsAppConfigError — this means Meta reached us and rejected the call. */
export class MetaApiError extends Error {
  readonly code = 'WHATSAPP_META_API_ERROR' as const;
  readonly httpStatus: number;
  readonly metaErrorCode?: string;

  constructor(message: string, httpStatus: number, metaErrorCode?: string) {
    super(message);
    this.httpStatus = httpStatus;
    this.metaErrorCode = metaErrorCode;
  }
}

function baseUrl(phoneNumberId: string): string {
  return `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;
}

async function postToMeta(body: Record<string, unknown>): Promise<MetaSendResult> {
  const { accessToken, phoneNumberId } = getConfigOrThrow();

  let res: Response;
  try {
    res = await fetch(baseUrl(phoneNumberId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', ...body }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    // Network-level failure — never include the token in the thrown error.
    throw new MetaApiError(
      `Network error calling Meta WhatsApp API: ${err instanceof Error ? err.message : 'unknown'}`,
      0
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const metaError = data?.error;
    return {
      ok: false,
      httpStatus: res.status,
      errorCode: metaError?.code ? String(metaError.code) : undefined,
      errorMessage: metaError?.message || `Meta API returned HTTP ${res.status}`,
    };
  }

  return {
    ok: true,
    httpStatus: res.status,
    messageId: data?.messages?.[0]?.id,
  };
}

/** Sends a free-form text message. Only deliverable inside Meta's 24h customer-service window. */
export async function sendTextMessage(to: string, body: string): Promise<MetaSendResult> {
  return postToMeta({
    to,
    type: 'text',
    text: { body },
  });
}

/** Sends a pre-approved Meta message template — required to initiate contact outside the 24h window. */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  components: unknown[] = []
): Promise<MetaSendResult> {
  return postToMeta({
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  });
}
