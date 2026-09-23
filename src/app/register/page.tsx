import { permanentRedirect } from 'next/navigation';

/**
 * /register used to be a standalone form posting to /api/auth/register, which
 * has been disabled (returns 410) since registration and login are the same
 * OTP flow — POST /api/auth/otp/verify creates the account on first verify.
 * Redirect to the real, working flow instead of showing a form that can never submit.
 *
 * SEO fix: this page has no dynamic API usage (no cookies/headers/params), so
 * Next.js was statically prerendering it — which bakes permanentRedirect()'s
 * special NEXT_REDIRECT signal into the static output instead of emitting a
 * real per-request Location header. Live symptom: GET /register returned 308
 * with no Location header and the internal __next_error__ shell instead of a
 * working redirect. Forcing dynamic rendering makes the redirect execute in
 * the request-scoped renderer, which sets Location correctly.
 */
export const dynamic = 'force-dynamic';

export default function RegisterRedirect() {
  permanentRedirect('/login');
}
