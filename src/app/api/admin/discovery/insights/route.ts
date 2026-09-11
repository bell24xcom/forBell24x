/**
 * GET /api/admin/discovery/insights — CRM insights for discovery suppliers
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { computeDiscoveryCrmInsights } from '@/src/lib/discovery/crm-insights';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const insights = await computeDiscoveryCrmInsights();
    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error('[Discovery Insights GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to compute CRM insights' }, { status: 500 });
  }
}
