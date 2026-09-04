/**
 * VyaparSethu — Meta WhatsApp webhook verification helpers
 *
 * Readiness-only as of H6-12: META_WHATSAPP_APP_SECRET and
 * META_WHATSAPP_WEBHOOK_VERIFY_TOKEN are not configured, so the route that
 * uses this module will reject both the GET verification handshake and any
 * inbound POST until they are set. It must never accept unverified traffic.
 */

import crypto from 'crypto';
import { getAppSecretOrUndefined, getWebhookVerifyTokenOrUndefined } from './config';

/**
 * Handles Meta's GET verification handshake:
 * GET /webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
 * Returns the challenge string to echo back, or null if verification fails
 * (including when no verify token is configured).
 */
export function verifyHandshake(mode: string | null, verifyToken: string | null, challenge: string | null): string | null {
  const expected = getWebhookVerifyTokenOrUndefined();
  if (!expected) return null; // not configured — never succeed
  if (mode !== 'subscribe') return null;
  if (!verifyToken || verifyToken !== expected) return null;
  return challenge;
}

/**
 * Verifies the X-Hub-Signature-256 header Meta sends on every POST.
 * Returns false (reject) whenever the app secret is not configured —
 * we never process unverified webhook bodies.
 */
export function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = getAppSecretOrUndefined();
  if (!appSecret) return false; // not configured — reject rather than trust blindly
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;

  const expected = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const provided = signatureHeader.slice('sha256='.length);

  // Constant-time compare, guarding against length mismatch throwing.
  const expectedBuf = Buffer.from(expected, 'hex');
  const providedBuf = Buffer.from(provided, 'hex');
  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

/** Normalized delivery-status shape extracted from a verified Meta webhook payload. */
export interface NormalizedDeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  recipientRedacted: string;
  timestamp: string;
}

/** Extracts delivery statuses from a Meta webhook payload. Never throws on malformed input. */
export function extractDeliveryStatuses(payload: unknown): NormalizedDeliveryStatus[] {
  const out: NormalizedDeliveryStatus[] = [];
  try {
    const entries = (payload as any)?.entry ?? [];
    for (const entry of entries) {
      const changes = entry?.changes ?? [];
      for (const change of changes) {
        const statuses = change?.value?.statuses ?? [];
        for (const s of statuses) {
          if (!s?.id || !s?.status) continue;
          const recipient = String(s.recipient_id ?? '');
          out.push({
            messageId: String(s.id),
            status: s.status,
            recipientRedacted: recipient.length > 4 ? `***${recipient.slice(-4)}` : '***',
            timestamp: s.timestamp ? new Date(Number(s.timestamp) * 1000).toISOString() : new Date().toISOString(),
          });
        }
      }
    }
  } catch {
    return [];
  }
  return out;
}
