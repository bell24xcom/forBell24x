import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * This endpoint used to PATCH an InsForge "deal" to completed and log a
 * fabricated "escrow_released" transaction with zero authentication and
 * zero confirmation that any payment actually occurred (Task 39A-13C-A).
 * It had no caller anywhere in the repository. Retired rather than fixed —
 * there is no real workflow to authenticate here, since deal settlement
 * already has a real, authenticated home at /api/deal/[id]/complete.
 */
function retired() {
  return NextResponse.json(
    { error: 'This endpoint has been retired.' },
    { status: 410 },
  );
}

export const GET = retired;
export const POST = retired;
export const PUT = retired;
export const PATCH = retired;
export const DELETE = retired;
export const OPTIONS = retired;

export function HEAD() {
  return new NextResponse(null, { status: 410 });
}
