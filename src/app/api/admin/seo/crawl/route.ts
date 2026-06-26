import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { crawlSite } from '@/lib/seo-crawler';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const sitemapUrl = body.sitemapUrl || 'https://www.vyaparsethu.com/sitemap.xml';
    const result = await crawlSite(sitemapUrl);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[SEO Crawl]', error);
    return NextResponse.json({ error: 'Crawl failed' }, { status: 500 });
  }
}
