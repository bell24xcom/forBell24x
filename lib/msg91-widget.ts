/**
 * Server-side verification of an MSG91 OTP-widget access token.
 *
 * The widget runs in the browser and hands the page an access token once
 * the user enters a correct OTP -- but until this module existed, nothing
 * on the server presented that token back to MSG91. This is that missing
 * server-to-server call: it asks MSG91 which phone number the token
 * actually belongs to, and only that answer is trusted.
 *
 * MSG91 does not publish this endpoint's response body, and the shape
 * reported by third-party integrations varies -- and is now also confirmed
 * from a real logged response on this project. What's confirmed:
 *
 *   - Real rejection, logged on this deployment 2026-09-27T13:40:23Z:
 *     top-level keys `message`, `type`, `code`, no `data`.
 *   - Two independent third-party server-side implementations (one in
 *     Java, one in TypeScript, each with their own passing unit tests
 *     against fixture responses) agree that `type === 'success'`
 *     (case-insensitive) is the success indicator.
 *   - The TypeScript one's own doc comment: "some accounts get
 *     `{ type: 'success', message: '919840012345' }`, others a bare
 *     acknowledgement" -- i.e. on some MSG91 account configurations the
 *     verified phone is returned literally IN `message` on success, while
 *     on failure `message` carries a human-readable error sentence (which
 *     is exactly what the real logged rejection above has: a `message`
 *     key present, call rejected). This is why `message` is checked only
 *     as the LAST fallback for a phone-shaped value, never logged raw
 *     (see the type/code-only logging below), and never trusted as a
 *     success indicator by itself.
 *   - The Java implementation nests the identifier under `data.identifier`
 *     (no `data` key exists in our own logged rejection -- plausibly
 *     because failures omit it entirely). The TypeScript one checks
 *     `identifier`, `mobile`, `number`, `phone`, `msisdn` at the top
 *     level. Both are checked here, since the real account's exact shape
 *     is still not directly confirmed for a *success* case -- no
 *     successful call has been logged yet. The added type/code logging
 *     below is meant to capture one the next time a real login succeeds.
 *
 * Kept free of `@/` aliases and Next.js imports so it can be unit-tested
 * with plain `node --test` (see tests/security/msg91-widget-verify.test.ts).
 */

const MSG91_VERIFY_URL = 'https://control.msg91.com/api/v5/widget/verifyAccessToken';
const TIMEOUT_MS = 5000;

export type Msg91VerifyCode = 'verified' | 'invalid_token' | 'phone_unresolved' | 'service_unavailable';

export interface Msg91VerifyResult {
  ok: boolean;
  /** Normalized to exactly 10 digits. Only set when ok is true. */
  phone: string | null;
  code: Msg91VerifyCode;
  /** Top-level keys of MSG91's response -- safe to log; never the authkey or the raw token. */
  responseShape?: string[];
}

export interface Msg91VerifyDeps {
  fetchImpl?: typeof fetch;
  authKey?: string;
}

export function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;
  const cleaned = String(raw).replace(/[\s\-()]/g, '').replace(/^\+?91/, '');
  return /^\d{10}$/.test(cleaned) ? cleaned : null;
}

/** True when a client-supplied phone disagrees with the MSG91-verified one. A null/empty body phone is not a mismatch -- it's simply absent. */
export function phonesMismatch(bodyPhone: string | null, verifiedPhone: string): boolean {
  return !!bodyPhone && bodyPhone !== verifiedPhone;
}

function responseKeys(body: unknown): string[] | undefined {
  return body && typeof body === 'object' ? Object.keys(body as Record<string, unknown>) : undefined;
}

function textField(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function isSuccessShape(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  if (textField(b.type).toLowerCase() === 'success') return true;
  if (b.success === true) return true;
  if (textField(b.status).toLowerCase() === 'success') return true;
  return false;
}

/**
 * Tries the field names two independent real MSG91 server-side
 * integrations report, in order of specificity. `message` is checked
 * LAST and only as a phone-shaped fallback -- on some accounts it IS the
 * verified number on success, but on failure (confirmed from our own
 * logs) it's a human-readable error sentence, so it must never be the
 * thing that decides success and is never logged raw (see below).
 */
function extractPhoneFromResponse(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, any>;
  const candidates = [
    b.identifier,
    b.mobile,
    b.number,
    b.phone,
    b.msisdn,
    b.data?.identifier,
    b.data?.mobile,
    b.data?.phone,
    b.message,
  ];
  for (const c of candidates) {
    const p = normalizePhone(c);
    if (p) return p;
  }
  return null;
}

/**
 * Fallback only: decode the access token's own JWT-shaped payload.
 * Used ONLY after MSG91 has already confirmed the token is valid -- never
 * to establish validity by itself, since anyone can construct a
 * three-part, correctly-shaped token with an arbitrary payload.
 */
function extractPhoneFromTokenPayload(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    const candidates = [payload.identifier, payload.mobile, payload.number, payload.phone, payload.msisdn, payload.sub];
    for (const c of candidates) {
      const p = normalizePhone(c);
      if (p) return p;
    }
    return null;
  } catch {
    return null;
  }
}

export async function verifyMsg91AccessToken(
  accessToken: string,
  deps: Msg91VerifyDeps = {},
): Promise<Msg91VerifyResult> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const authKey = deps.authKey ?? process.env.MSG91_AUTH_KEY;

  if (!authKey) {
    console.error('[msg91-widget] MSG91_AUTH_KEY not configured -- widget verification unavailable');
    return { ok: false, phone: null, code: 'service_unavailable' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let body: unknown;
  try {
    const res = await fetchImpl(MSG91_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authkey: authKey, 'access-token': accessToken }),
      signal: controller.signal,
    });
    body = await res.json().catch(() => null);
    if (!res.ok) {
      console.warn('[msg91-widget] verify call returned non-OK status', { status: res.status, shape: responseKeys(body) });
      return { ok: false, phone: null, code: 'service_unavailable', responseShape: responseKeys(body) };
    }
  } catch (err: unknown) {
    const reason = (err as { name?: string })?.name === 'AbortError' ? 'timeout' : 'network_error';
    console.warn('[msg91-widget] verify call failed', { reason });
    return { ok: false, phone: null, code: 'service_unavailable' };
  } finally {
    clearTimeout(timeout);
  }

  const shape = responseKeys(body);

  // Logged on EVERY call, success or failure, so the next real login --
  // whichever it is -- produces a comparison point for the other. Only
  // `type` and `code` are logged: both are short, low-cardinality status
  // fields. `message` is deliberately never logged here -- on some MSG91
  // accounts it IS the verified phone number on success (see the file
  // header), which would put a real user's phone number in plaintext logs.
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    console.info('[msg91-widget] response received', {
      type: textField(b.type) || undefined,
      code: textField(b.code) || undefined,
      shape,
    });
  }

  if (!isSuccessShape(body)) {
    console.warn('[msg91-widget] verify call did not report success', { shape });
    return { ok: false, phone: null, code: 'invalid_token', responseShape: shape };
  }

  const phone = extractPhoneFromResponse(body) ?? extractPhoneFromTokenPayload(accessToken);

  if (!phone) {
    console.warn('[msg91-widget] token verified but no phone could be resolved', { shape });
    return { ok: false, phone: null, code: 'phone_unresolved', responseShape: shape };
  }

  return { ok: true, phone, code: 'verified', responseShape: shape };
}
