import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { fetchGscSearchAnalytics, isGscConfigured, getGscSiteUrl } from '@/lib/gsc-api';
import { GSC_PERFORMANCE } from '@/src/data/seo-dashboard';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const days = parseInt(request.nextUrl.searchParams.get('days') || '28', 10);

  if (!isGscConfigured()) {
    return NextResponse.json({
      success: true,
      source: 'snapshot',
      configured: false,
      siteUrl: getGscSiteUrl(),
      period: GSC_PERFORMANCE.period,
      lastUpdate: GSC_PERFORMANCE.lastUpdate,
      totals: GSC_PERFORMANCE.totals,
      queries: GSC_PERFORMANCE.queries.map(q => ({
        query: q.query,
        clicks: q.clicks,
        impressions: q.impressions,
        ctr: q.clicks / Math.max(q.impressions, 1),
        position: parseFloat(String(q.position)) || 0,
      })),
      setupHint:
        'Add GSC_SERVICE_ACCOUNT_JSON to Vercel. Grant the service account email Full access in Search Console → Settings → Users.',
    });
  }

  const live = await fetchGscSearchAnalytics(days);

  if (!live.success || live.queries.length === 0) {
    return NextResponse.json({
      success: true,
      source: 'snapshot',
      configured: true,
      liveError: live.error,
      siteUrl: live.siteUrl,
      period: GSC_PERFORMANCE.period,
      lastUpdate: GSC_PERFORMANCE.lastUpdate,
      totals: GSC_PERFORMANCE.totals,
      queries: GSC_PERFORMANCE.queries.map(q => ({
        query: q.query,
        clicks: q.clicks,
        impressions: q.impressions,
        ctr: q.clicks / Math.max(q.impressions, 1),
        position: parseFloat(String(q.position)) || 0,
      })),
    });
  }

  return NextResponse.json({
    success: true,
    source: 'live',
    configured: true,
    siteUrl: live.siteUrl,
    period: `${live.startDate} → ${live.endDate}`,
    lastUpdate: new Date().toISOString(),
    totals: live.totals,
    queries: live.queries,
  });
}
