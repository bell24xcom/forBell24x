/**
 * GET /api/admin/discovery/intelligence — category, city, source, conversion metrics
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { computeDiscoveryIntelligence } from '@/src/lib/discovery/intelligence';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const intelligence = await computeDiscoveryIntelligence();
    return NextResponse.json({ success: true, intelligence });
  } catch (error) {
    console.error('[Discovery Intelligence GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to compute intelligence' }, { status: 500 });
  }
}
