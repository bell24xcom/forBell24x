/**
 * VyaparSethu — signed, expiring quote-link tokens.
 *
 * Replaces the previous `btoa(JSON.stringify({rfq_id, supplier_id}))` scheme
 * used by /quote/[token], which was unsigned, non-expiring and trivially
 * forgeable: anyone could hand-craft a token for any (rfq, supplier) pair and
 * submit a quote as that supplier.
 *
 * Uses HMAC-SHA256 over JWT_SECRET — the secret the app already requires — so
 * this introduces no new configuration.
 *
 * Server-side only. Never import from a client component.
 */
import { createHmac, timingSafeEqual } from 'crypto';

export interface QuoteTokenPayload {
  rfqId: string;
  supplierId: string;
  /** Unix seconds. */
  exp: number;
}

const DEFAULT_TTL_DAYS = 30;

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is required to sign quote tokens');
  return s;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function b64urlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

function sign(body: string): string {
  return b64url(createHmac('sha256', secret()).update(body).digest());
}

/** Mint a signed quote token. Format: <base64url(payload)>.<base64url(hmac)> */
export function createQuoteToken(
  rfqId: string,
  supplierId: string,
  ttlDays: number = DEFAULT_TTL_DAYS
): string {
  const payload: QuoteTokenPayload = {
    rfqId,
    supplierId,
    exp: Math.floor(Date.now() / 1000) + ttlDays * 24 * 60 * 60,
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

/**
 * Verify and decode. Returns null on any failure — bad shape, bad signature,
 * or expired. Callers MUST treat null as "reject", and MUST NOT trust
 * rfqId/supplierId from any other source (e.g. the request body).
 */
export function verifyQuoteToken(token: string | null | undefined): QuoteTokenPayload | null {
  if (!token || typeof token !== 'string') return null;

  const dot = token.indexOf('.');
  if (dot <= 0 || dot === token.length - 1) return null;

  const body = token.slice(0, dot);
  const provided = token.slice(dot + 1);

  let expectedBuf: Buffer;
  let providedBuf: Buffer;
  try {
    expectedBuf = Buffer.from(sign(body));
    providedBuf = Buffer.from(provided);
  } catch {
    return null;
  }
  // Length check first — timingSafeEqual throws on length mismatch.
  if (expectedBuf.length !== providedBuf.length) return null;
  if (!timingSafeEqual(expectedBuf, providedBuf)) return null;

  let payload: QuoteTokenPayload;
  try {
    payload = JSON.parse(b64urlDecode(body).toString('utf8'));
  } catch {
    return null;
  }

  if (
    !payload ||
    typeof payload.rfqId !== 'string' ||
    typeof payload.supplierId !== 'string' ||
    typeof payload.exp !== 'number'
  ) {
    return null;
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

export interface ResolvedQuoteIdentity {
  rfqId: string;
  supplierId: string;
}

/**
 * The ONLY sanctioned way for a quote-submission endpoint to learn which
 * (rfq, supplier) pair a request is for. Returns null on any missing,
 * malformed, tampered, or expired token — callers MUST treat null as
 * "reject the request" and MUST NOT fall back to a client-supplied
 * rfq_id/supplier_id. (Security fix, PR61 remediation: POST
 * /api/marketing/quote previously trusted client-supplied rfq_id/
 * supplier_id fields directly with no proof of possession of the signed
 * link, letting anyone submit a quote as any supplier for any RFQ.)
 */
export function resolveQuoteIdentityFromToken(token: unknown): ResolvedQuoteIdentity | null {
  if (typeof token !== 'string' || !token) return null;
  const payload = verifyQuoteToken(token);
  if (!payload) return null;
  return { rfqId: payload.rfqId, supplierId: payload.supplierId };
}
