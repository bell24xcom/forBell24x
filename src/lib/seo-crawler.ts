/**
 * Lightweight sitemap + link crawler for VyaparSethu SEO audits.
 * Free — no paid API. Caps URLs to stay within Vercel serverless limits.
 */

const SITE = 'https://www.vyaparsethu.com';
const MAX_URLS = 80;
const FETCH_TIMEOUT_MS = 8000;

export interface CrawlIssue {
  type: 'broken_internal' | 'broken_external' | 'redirect' | 'timeout' | 'missing_title' | 'missing_meta';
  url: string;
  target?: string;
  status?: number;
  message: string;
}

export interface CrawlResult {
  crawledAt: string;
  sitemapUrl: string;
  pagesChecked: number;
  linksChecked: number;
  issues: CrawlIssue[];
  urls: string[];
}

async function fetchWithTimeout(url: string): Promise<Response | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'VyaparSethu-SEO-Crawler/1.0' },
      redirect: 'manual',
    });
    clearTimeout(t);
    return res;
  } catch {
    return null;
  }
}

function extractLocs(xml: string): string[] {
  const locs: string[] = [];
  const re = /<loc>([^<]+)<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    locs.push(m[1].trim());
  }
  return locs;
}

function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const re = /href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const abs = new URL(m[1], baseUrl).href;
      if (abs.startsWith('http')) links.push(abs);
    } catch {
      /* skip invalid */
    }
  }
  return [...new Set(links)];
}

function isInternal(href: string): boolean {
  try {
    const u = new URL(href);
    return u.hostname === 'www.vyaparsethu.com' || u.hostname === 'vyaparsethu.com';
  } catch {
    return false;
  }
}

export async function crawlSite(sitemapUrl = `${SITE}/sitemap.xml`): Promise<CrawlResult> {
  const issues: CrawlIssue[] = [];
  const urls: string[] = [];

  const sitemapRes = await fetchWithTimeout(sitemapUrl);
  if (!sitemapRes?.ok) {
    return {
      crawledAt: new Date().toISOString(),
      sitemapUrl,
      pagesChecked: 0,
      linksChecked: 0,
      issues: [{ type: 'timeout', url: sitemapUrl, message: `Sitemap fetch failed (${sitemapRes?.status ?? 'timeout'})` }],
      urls: [],
    };
  }

  const xml = await sitemapRes.text();
  const allUrls = extractLocs(xml).filter(u => u.includes('vyaparsethu.com')).slice(0, MAX_URLS);
  urls.push(...allUrls);

  let linksChecked = 0;

  for (const pageUrl of allUrls) {
    const pageRes = await fetchWithTimeout(pageUrl);
    if (!pageRes) {
      issues.push({ type: 'timeout', url: pageUrl, message: 'Page fetch timeout' });
      continue;
    }
    if (pageRes.status >= 300 && pageRes.status < 400) {
      issues.push({ type: 'redirect', url: pageUrl, status: pageRes.status, message: `Redirect ${pageRes.status}` });
      continue;
    }
    if (pageRes.status >= 400) {
      issues.push({ type: 'broken_internal', url: pageUrl, status: pageRes.status, message: `HTTP ${pageRes.status}` });
      continue;
    }

    const html = await pageRes.text();
    if (!/<title[^>]*>[\s\S]*?<\/title>/i.test(html)) {
      issues.push({ type: 'missing_title', url: pageUrl, message: 'No <title> tag' });
    }
    if (!/<meta[^>]+name=["']description["']/i.test(html)) {
      issues.push({ type: 'missing_meta', url: pageUrl, message: 'No meta description' });
    }

    const links = extractLinks(html, pageUrl).slice(0, 30);
    for (const link of links) {
      linksChecked++;
      if (!isInternal(link)) continue;
      const linkRes = await fetchWithTimeout(link);
      if (!linkRes) {
        issues.push({ type: 'broken_internal', url: pageUrl, target: link, message: 'Internal link timeout' });
      } else if (linkRes.status >= 400) {
        issues.push({
          type: 'broken_internal',
          url: pageUrl,
          target: link,
          status: linkRes.status,
          message: `Broken internal link HTTP ${linkRes.status}`,
        });
      }
    }
  }

  return {
    crawledAt: new Date().toISOString(),
    sitemapUrl,
    pagesChecked: allUrls.length,
    linksChecked,
    issues: issues.slice(0, 100),
    urls,
  };
}
