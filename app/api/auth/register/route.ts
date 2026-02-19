/**
 * DISABLED — Mock registration (never saved to DB) removed.
 * Bell24h registration is done via OTP:
 *   POST /api/auth/otp/send  → sends OTP to phone
 *   POST /api/auth/otp/verify → creates user account + returns JWT
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: 'Standalone registration is disabled. Use OTP flow: POST /api/auth/otp/send → /api/auth/otp/verify',
    },
    { status: 410 }
  );
}

