import { permanentRedirect } from 'next/navigation';

/**
 * /register used to be a standalone form posting to /api/auth/register, which
 * has been disabled (returns 410) since registration and login are the same
 * OTP flow — POST /api/auth/otp/verify creates the account on first verify.
 * Redirect to the real, working flow instead of showing a form that can never submit.
 */
export default function RegisterRedirect() {
  permanentRedirect('/login');
}
