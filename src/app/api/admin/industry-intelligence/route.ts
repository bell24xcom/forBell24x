import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { listIndustries, getIndustry, industryCatalogStats } from '@/src/lib/industry-intelligence';
import { buildIndustrySubgraph } from '@/src/lib/industry-intelligence/graph';
import { getClusterPulse } from '@/src/lib/bom/business-pulse';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const slug = request.nextUrl.searchParams.get('slug');
  const pageParam = request.nextUrl.searchParams.get('page');
  const pageSizeParam = request.nextUrl.searchParams.get('pageSize');

  if (slug) {
    const industry = await getIndustry(slug);
    if (!industry) return NextResponse.json({ error: 'Industry not found' }, { status: 404 });
    const graph = await buildIndustrySubgraph(slug);
    const clusterPulses = await Promise.all(
      (industry.relatedClusterSlugs ?? []).slice(0, 3).map(async (clSlug) => ({
        clusterSlug: clSlug,
        pulse: await getClusterPulse(clSlug),
      })),
    );
    return NextResponse.json({ success: true, industry, graph, clusterPulses });
  }

  const page = pageParam ? Number(pageParam) : NaN;
  const pageSize = pageSizeParam ? Number(pageSizeParam) : NaN;
  if (Number.isInteger(page) && page > 0 && Number.isInteger(pageSize) && pageSize > 0) {
    const paginated = await listIndustries({ page, pageSize });
    return NextResponse.json({ success: true, ...paginated, stats: await industryCatalogStats() });
  }

  return NextResponse.json({ success: true, industries: await listIndustries(), stats: await industryCatalogStats() });
}
