/**
 * GET /api/admin/discovery/command-center — founder discovery command center
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { computeDiscoveryCommandCenter } from '@/src/lib/discovery/command-center';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const commandCenter = await computeDiscoveryCommandCenter();
    return NextResponse.json({ success: true, commandCenter });
  } catch (error) {
    console.error('[Discovery Command Center GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to compute command center' }, { status: 500 });
  }
}
