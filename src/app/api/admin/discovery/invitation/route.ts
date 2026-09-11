/**
 * GET /api/admin/discovery/invitation — invitation engine dashboard metrics
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { computeInvitationEngineMetrics } from '@/src/lib/discovery/invitation-metrics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const metrics = await computeInvitationEngineMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    console.error('[Discovery Invitation GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to compute invitation metrics' }, { status: 500 });
  }
}
