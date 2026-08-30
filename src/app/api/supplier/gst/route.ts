import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// DEPRECATED — this stub has been superseded by POST /api/supplier/onboarding
// which handles GST/Udyam submission and advances verificationStatus to GST_PENDING.
// Returning 410 Gone so clients can detect the deprecation.

const deprecated = NextResponse.json(
  {
    success: false,
    message: 'Deprecated. Use POST /api/supplier/onboarding to submit GST or Udyam details.',
    migratedTo: '/api/supplier/onboarding',
  },
  { status: 410 },
);

export async function POST(_request: NextRequest) {
  return deprecated;
}

export async function GET(_request: NextRequest) {
  return deprecated;
}
