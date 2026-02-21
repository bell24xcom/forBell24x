/**
 * DISABLED — Email/password login removed for security.
 * Bell24h uses OTP + JWT authentication only.
 * Real auth: POST /api/auth/otp/send → POST /api/auth/otp/verify
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Email/password login is disabled. Use OTP: POST /api/auth/otp/send' },
    { status: 410 }
  );
}

