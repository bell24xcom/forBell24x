/**
 * GET /api/admin/discovery/trust — trust score formula + live aggregates
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { computeTrustEngineStatus } from '@/src/lib/discovery/trust-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const trust = await computeTrustEngineStatus();
    return NextResponse.json({ success: true, trust });
  } catch (error) {
    console.error('[Discovery Trust GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to compute trust status' }, { status: 500 });
  }
}
