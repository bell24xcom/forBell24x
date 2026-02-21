/**
 * DISABLED — Agent login with hardcoded credentials removed for security.
 * Admin auth: POST /api/admin/login (uses ADMIN_EMAIL + ADMIN_PASSWORD env vars)
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { success: false, message: 'Agent login is disabled. Use POST /api/admin/login' },
    { status: 410 }
  );
}
