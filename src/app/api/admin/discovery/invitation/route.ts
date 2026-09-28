/**
 * GET /api/admin/discovery/invitation — invitation engine dashboard metrics
 *
 * MA-01: `?include=pipeline` also returns the nine-stage supplier pipeline over ALL supplier accounts (the legacy
 * `metrics` block still counts only discovery-sourced suppliers). `&includeSeed=1` counts seed accounts; by default
 * they are excluded and the exclusion is reported in the response.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { computeInvitationEngineMetrics } from '@/src/lib/discovery/invitation-metrics';
import { computeSupplierPipeline } from '@/src/lib/discovery/pipeline';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const wantsPipeline = (req.nextUrl.searchParams.get('include') ?? '').split(',').includes('pipeline');
    const includeSeed = req.nextUrl.searchParams.get('includeSeed') === '1';
    const [metrics, pipeline] = await Promise.all([
      computeInvitationEngineMetrics(),
      wantsPipeline ? computeSupplierPipeline({ includeSeed }) : Promise.resolve(undefined),
    ]);
    return NextResponse.json({ success: true, metrics, ...(pipeline ? { pipeline } : {}) });
  } catch (error) {
    console.error('[Discovery Invitation GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to compute invitation metrics' }, { status: 500 });
  }
}
