/**
 * On-page SEO analysis — fetch URL and score title, meta, H1, canonical.
 */

const SITE = 'https://www.vyaparsethu.com';

export interface OnPageResult {
  url: string;
  analyzedAt: string;
  score: number;
  checks: {
    id: string;
    label: string;
    pass: boolean;
    value?: string;
    suggestion?: string;
  }[];
  raw: {
    title: string | null;
    metaDescription: string | null;
    h1: string | null;
    canonical: string | null;
    wordCount: number;
  };
}

function extractTag(html: string, pattern: RegExp): string | null {
  const m = html.match(pattern);
  return m ? m[1].trim().replace(/\s+/g, ' ') : null;
}

export async function analyzeOnPage(inputUrl: string, targetKeyword?: string): Promise<OnPageResult> {
  let url = inputUrl.trim();
  if (url.startsWith('/')) url = SITE + url;
  if (!url.startsWith('http')) url = SITE + '/' + url;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'VyaparSethu-SEO-Checker/1.0' },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }

  const html = await res.text();
  const title = extractTag(html, /<title[^>]*>([^<]*)<\/title>/i);
  const metaDescription = extractTag(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
    ?? extractTag(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const h1 = extractTag(html, /<h1[^>]*>([^<]*)<\/h1>/i);
  const canonical = extractTag(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
  const bodyText = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ');
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  const kw = (targetKeyword || '').toLowerCase();
  const checks: OnPageResult['checks'] = [];

  checks.push({
    id: 'title',
    label: 'Title tag',
    pass: !!title && title.length >= 30 && title.length <= 60,
    value: title ?? undefined,
    suggestion: !title ? 'Add a <title> tag' : title.length < 30 ? 'Title too short (aim 30–60 chars)' : title.length > 60 ? 'Title too long (aim 30–60 chars)' : undefined,
  });

  checks.push({
    id: 'meta',
    label: 'Meta description',
    pass: !!metaDescription && metaDescription.length >= 70 && metaDescription.length <= 160,
    value: metaDescription ?? undefined,
    suggestion: !metaDescription ? 'Add meta description' : metaDescription.length < 70 ? 'Description too short' : metaDescription.length > 160 ? 'Description too long' : undefined,
  });

  checks.push({
    id: 'h1',
    label: 'H1 heading',
    pass: !!h1 && h1.length > 0,
    value: h1 ?? undefined,
    suggestion: !h1 ? 'Add exactly one H1' : undefined,
  });

  checks.push({
    id: 'canonical',
    label: 'Canonical URL',
    pass: !!canonical && canonical.includes('vyaparsethu.com'),
    value: canonical ?? undefined,
    suggestion: !canonical ? 'Add rel=canonical pointing to www.vyaparsethu.com' : undefined,
  });

  if (kw) {
    const titleHasKw = title?.toLowerCase().includes(kw);
    const h1HasKw = h1?.toLowerCase().includes(kw);
    checks.push({
      id: 'keyword',
      label: `Target keyword "${targetKeyword}"`,
      pass: !!(titleHasKw || h1HasKw),
      suggestion: !titleHasKw && !h1HasKw ? 'Include keyword in title or H1' : undefined,
    });
  }

  checks.push({
    id: 'words',
    label: 'Content length',
    pass: wordCount >= 300,
    value: `${wordCount} words`,
    suggestion: wordCount < 300 ? 'Thin content — aim 300+ words for ranking pages' : undefined,
  });

  const passed = checks.filter(c => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    url,
    analyzedAt: new Date().toISOString(),
    score,
    checks,
    raw: { title, metaDescription, h1, canonical, wordCount },
  };
}
