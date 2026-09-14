/**
 * Discovery Engine health metrics API
 * GET /api/admin/discovery/health
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { computeDiscoveryHealth } from '@/src/lib/discovery/health';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const metrics = await computeDiscoveryHealth();
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    console.error('[Discovery Health GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to compute health metrics' }, { status: 500 });
  }
}
