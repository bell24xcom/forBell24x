/**
 * H6-13 — Claim invitation token (cryptographically signed, HMAC-SHA256)
 *
 * Pure module: no `@/` aliases, no Prisma, no I/O beyond `jsonwebtoken`
 * (an existing dependency — see src/lib/jwt.ts for the precedent). This
 * lets it run under Node's built-in test runner with plain relative
 * imports (see claimToken.test.ts).
 *
 * The token is a signed carrier for non-sensitive identifiers only. A
 * valid signature proves the token was issued by this server and has not
 * been tampered with or expired — it does NOT by itself authorize a claim.
 * The database remains authoritative: callers must still load the
 * ClaimInvitation row and check revoked/consumed/expiry/eligibility state
 * before executing a claim (see claimInvitation.ts).
 */

import jwt from 'jsonwebtoken';

export interface ClaimTokenPayload {
  companyId: string;
  campaignId: string;
  invitationId: string;
}

export type ClaimTokenVerifyResult =
  | { ok: true; payload: ClaimTokenPayload }
  | { ok: false; reason: 'EXPIRED' | 'INVALID_SIGNATURE' | 'MALFORMED' | 'NOT_CONFIGURED' };

const DEFAULT_EXPIRY = '14d';

function getSecret(): string | undefined {
  // Dedicated secret per Phase 2's instruction — never falls back to
  // JWT_SECRET (a different token family with a different blast radius).
  return process.env.CLAIM_INVITATION_SECRET || undefined;
}

export function isClaimTokenConfigured(): boolean {
  return !!getSecret();
}

/** Throws if CLAIM_INVITATION_SECRET is unset — callers must check isClaimTokenConfigured() first if they want a soft failure. */
export function signClaimToken(payload: ClaimTokenPayload, expiresIn: string = DEFAULT_EXPIRY): string {
  const secret = getSecret();
  if (!secret) throw new Error('CLAIM_INVITATION_SECRET is not configured');
  // jsonwebtoken's SignOptions.expiresIn is a template-literal type
  // (e.g. `${number}d`) that a runtime-computed string can't narrow to
  // statically, even though every caller here passes a value matching that
  // exact shape (DEFAULT_EXPIRY or `${expiryDays}d`).
  return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn } as jwt.SignOptions);
}

/** Never throws — always returns a typed result. */
export function verifyClaimToken(token: string): ClaimTokenVerifyResult {
  const secret = getSecret();
  if (!secret) return { ok: false, reason: 'NOT_CONFIGURED' };

  try {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (typeof decoded === 'string' || !decoded.companyId || !decoded.campaignId || !decoded.invitationId) {
      return { ok: false, reason: 'MALFORMED' };
    }
    return {
      ok: true,
      payload: {
        companyId: String(decoded.companyId),
        campaignId: String(decoded.campaignId),
        invitationId: String(decoded.invitationId),
      },
    };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) return { ok: false, reason: 'EXPIRED' };
    if (err instanceof jwt.JsonWebTokenError) {
      // jsonwebtoken throws the same JsonWebTokenError class for both a
      // structurally malformed token (message "jwt malformed") and a
      // well-formed token whose signature doesn't match — distinguish by
      // message so the two failure modes (tampered vs garbage input)
      // aren't reported identically.
      return { ok: false, reason: err.message === 'jwt malformed' ? 'MALFORMED' : 'INVALID_SIGNATURE' };
    }
    return { ok: false, reason: 'MALFORMED' };
  }
}

/**
 * Best-effort heuristic to tell whether a `/claim/[token]` path segment is
 * likely our new JWT format (three dot-separated base64url segments) vs the
 * legacy bare-UUID `users.claim_token` format. Used only to decide which
 * lookup to try first — both paths are always attempted regardless.
 */
export function looksLikeClaimJwt(token: string): boolean {
  return token.split('.').length === 3;
}
