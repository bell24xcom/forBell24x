import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/claim — DISABLED
 *
 * Previous implementation let any authenticated user mark an arbitrary
 * unclaimed profile as claimed without invitation token or OTP — a
 * production ownership bypass. Use the H6-13 claim path instead:
 *   /claim/[token] → POST /api/claim/verify → POST /api/claim/complete
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        'This claim endpoint is disabled. Use the invitation claim link (/claim/[token]) with OTP verification.',
      code: 'CLAIM_VIA_INVITATION_REQUIRED',
    },
    { status: 410 },
  );
}
