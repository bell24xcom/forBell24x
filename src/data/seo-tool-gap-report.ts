/**
 * SEO platform feature gap analysis — VyaparSethu Cockpit vs paid tools.
 * Sources: Semrush KB, Ahrefs FAQ, Ubersuggest Zendesk, Moz Pro docs (2025–2026).
 * Last reviewed: 2026-06-26
 */

export type GapStatus = 'have' | 'partial' | 'missing' | 'free_alt' | 'not_needed';

export interface PlatformTool {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface GapRow {
  id: string;
  feature: string;
  category: string;
  semrush: boolean;
  ahrefs: boolean;
  ubersuggest: boolean;
  moz: boolean;
  vyaparsethu: GapStatus;
  vyaparsethuPage?: string;
  howToAdd: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  buildCost: 'free' | 'low' | 'medium' | 'high' | 'paid_api';
}

export const COMPARED_PLATFORMS = [
  { id: 'semrush', name: 'Semrush', url: 'https://www.semrush.com', price: '~$130/mo' },
  { id: 'ahrefs', name: 'Ahrefs', url: 'https://ahrefs.com', price: '~$129/mo' },
  { id: 'ubersuggest', name: 'Ubersuggest', url: 'https://neilpatel.com/ubersuggest', price: '~$29/mo or lifetime' },
  { id: 'moz', name: 'Moz Pro', url: 'https://moz.com/products/pro', price: '~$99/mo' },
  { id: 'vyaparsethu', name: 'VyaparSethu SEO Cockpit', url: '/admin/seo', price: 'Free (built-in)' },
] as const;

export const SEMRUSH_TOOLS: PlatformTool[] = [
  { id: 'kw-magic', name: 'Keyword Magic Tool', category: 'Keywords', description: '25B+ keyword database, intent, difficulty, SERP features' },
  { id: 'position-tracking', name: 'Position Tracking', category: 'Rankings', description: 'Daily rank tracking, SERP features, AI Overview tracking' },
  { id: 'site-audit', name: 'Site Audit', category: 'Technical', description: '140+ checks, Core Web Vitals, crawl up to 100k pages' },
  { id: 'backlink-analytics', name: 'Backlink Analytics', category: 'Links', description: '43T link index, toxic link audit' },
  { id: 'link-building', name: 'Link Building Tool', category: 'Links', description: 'Outreach workflow + prospect lists' },
  { id: 'on-page-seo', name: 'On-Page SEO Checker', category: 'Content', description: 'Page-level optimization vs competitors' },
  { id: 'content-marketing', name: 'Content Marketing Toolkit', category: 'Content', description: 'Topic research, SEO writing assistant' },
  { id: 'ai-visibility', name: 'AI Visibility Toolkit', category: 'AI', description: 'Brand mentions in ChatGPT/Gemini, prompt research' },
  { id: 'domain-overview', name: 'Domain Overview', category: 'Competitive', description: 'Traffic, keywords, backlinks snapshot' },
  { id: 'keyword-gap', name: 'Keyword Gap', category: 'Competitive', description: 'Keywords competitors rank for, you don\'t' },
  { id: 'local-seo', name: 'Listing Management', category: 'Local', description: 'GBP, citations, NAP consistency' },
  { id: 'brand-monitoring', name: 'Brand Monitoring', category: 'PR', description: 'Mentions, press, web alerts' },
];

export const AHREFS_TOOLS: PlatformTool[] = [
  { id: 'site-explorer', name: 'Site Explorer', category: 'Competitive', description: 'Competitor traffic, top pages, keywords, backlinks' },
  { id: 'keywords-explorer', name: 'Keywords Explorer', category: 'Keywords', description: '20B+ keywords, KD, traffic potential, AI clustering' },
  { id: 'site-audit', name: 'Site Audit', category: 'Technical', description: 'Crawl technical issues, health score' },
  { id: 'rank-tracker', name: 'Rank Tracker', category: 'Rankings', description: '190+ countries, desktop/mobile, share of voice' },
  { id: 'content-explorer', name: 'Content Explorer', category: 'Content', description: 'Top-performing content by niche' },
  { id: 'content-gap', name: 'Content Gap', category: 'Competitive', description: 'Topics competitors cover, you don\'t' },
  { id: 'brand-radar', name: 'Brand Radar', category: 'AI', description: 'AI chatbot mentions and citations' },
  { id: 'ai-content-helper', name: 'AI Content Helper', category: 'Content', description: 'Draft briefs, grade content vs SERP' },
  { id: 'broken-backlinks', name: 'Broken Backlinks', category: 'Links', description: 'Find broken links for outreach' },
  { id: 'batch-analysis', name: 'Batch Analysis', category: 'Competitive', description: 'Compare many domains at once' },
];

export const UBERSUGGEST_TOOLS: PlatformTool[] = [
  { id: 'keyword-research', name: 'Keyword Overview / Ideas', category: 'Keywords', description: 'Volume, SD, CPC, related/questions/comparisons' },
  { id: 'content-ideas', name: 'Content Ideas', category: 'Content', description: 'Top pages for keyword + social shares' },
  { id: 'site-audit', name: 'Site Audit', category: 'Technical', description: 'On-page score, 100-page sample audit' },
  { id: 'rank-tracking', name: 'Rank Tracking', category: 'Rankings', description: 'Position history, visibility distribution' },
  { id: 'backlinks', name: 'Backlinks Report', category: 'Links', description: 'DA, referring domains, anchor text' },
  { id: 'traffic-analyzer', name: 'Traffic Analyzer', category: 'Competitive', description: 'Est. organic traffic + top keywords' },
  { id: 'ai-visibility', name: 'AI Search Visibility', category: 'AI', description: 'Prompts, brands, sentiment in LLMs' },
  { id: 'ai-prompt-ideas', name: 'AI Prompt Ideas', category: 'AI', description: 'AI-powered content angles per keyword' },
  { id: 'competitor-analysis', name: 'Competitor Analysis', category: 'Competitive', description: 'Side-by-side traffic/keyword/backlink' },
  { id: 'seo-opportunities', name: 'SEO Opportunities', category: 'Audit', description: 'Automated issue + content suggestions' },
];

export const MOZ_TOOLS: PlatformTool[] = [
  { id: 'keyword-explorer', name: 'Keyword Explorer', category: 'Keywords', description: 'Priority score, intent groups, SERP analysis' },
  { id: 'link-explorer', name: 'Link Explorer', category: 'Links', description: 'DA, PA, spam score, link gap' },
  { id: 'site-crawl', name: 'Site Crawl', category: 'Technical', description: '~50 checks, weekly scheduled crawls' },
  { id: 'rank-tracker', name: 'Rank Tracker', category: 'Rankings', description: 'Google/Bing, local by city' },
  { id: 'domain-overview', name: 'Domain Overview', category: 'Competitive', description: 'Search visibility score snapshot' },
  { id: 'on-page-grader', name: 'On-Page Grader', category: 'Content', description: 'Single-page optimization score' },
  { id: 'mozbar', name: 'MozBar (extension)', category: 'Browser', description: 'DA/PA in SERP while browsing' },
  { id: 'brand-authority', name: 'Brand Authority', category: 'Brand', description: 'Brand-level authority metric' },
];

/** Master gap matrix — VyaparSethu vs industry standard tools */
export const SEO_GAP_MATRIX: GapRow[] = [
  // Keywords & rankings
  {
    id: 'kw-database',
    feature: 'Keyword database (billions of keywords + volume/SD)',
    category: 'Keywords',
    semrush: true, ahrefs: true, ubersuggest: true, moz: true,
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/rankings',
    howToAdd: 'Cannot replicate free at scale. Use GSC exports + manual CSV → /admin/seo/analyze. Optional: Google Keyword Planner API (limited) or Ahrefs free webmaster tools for your domain only.',
    priority: 'high', buildCost: 'paid_api',
  },
  {
    id: 'rank-tracker-daily',
    feature: 'Automated daily rank tracking (SERP API)',
    category: 'Rankings',
    semrush: true, ahrefs: true, ubersuggest: true, moz: true,
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/rankings',
    howToAdd: 'Phase 1: weekly GSC CSV import cron. Phase 2: SerpApi/DataForSEO (~$50/mo) for 50 keywords. Wire to Neon table `keyword_ranks`.',
    priority: 'high', buildCost: 'paid_api',
  },
  {
    id: 'keyword-gap',
    feature: 'Keyword gap vs competitors',
    category: 'Competitive',
    semrush: true, ahrefs: true, ubersuggest: false, moz: true,
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/category-ranks',
    howToAdd: 'Export IndiaMART GSC queries (if available) or manual SERP checks. Build `/admin/seo/keyword-gap` comparing TRACKED_KEYWORDS vs competitor sitemap keywords via NVIDIA LLM clustering.',
    priority: 'high', buildCost: 'low',
  },
  {
    id: 'category-ranks',
    feature: 'Per-category / per-supplier keyword ranks',
    category: 'Rankings',
    semrush: false, ahrefs: false, ubersuggest: false, moz: false,
    vyaparsethu: 'have',
    vyaparsethuPage: '/admin/seo/category-ranks',
    howToAdd: 'Already built — 400+ rows. Update positions from GSC; add SerpApi for automation.',
    priority: 'medium', buildCost: 'free',
  },
  // Technical SEO
  {
    id: 'site-audit-crawl',
    feature: 'Full site crawl audit (broken links, meta, redirects)',
    category: 'Technical',
    semrush: true, ahrefs: true, ubersuggest: true, moz: true,
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/lighthouse',
    howToAdd: 'Add `/api/admin/seo/crawl` using `cheerio` + sitemap.xml parser on Vercel cron (free, 500 URLs). Or Screaming Frog export → analyze page. Lighthouse covers perf not crawl.',
    priority: 'critical', buildCost: 'low',
  },
  {
    id: 'core-web-vitals',
    feature: 'Core Web Vitals monitoring',
    category: 'Technical',
    semrush: true, ahrefs: true, ubersuggest: true, moz: true,
    vyaparsethu: 'have',
    vyaparsethuPage: '/admin/seo/lighthouse',
    howToAdd: 'Already in Lighthouse tab. Add weekly cron calling PageSpeed Insights API (free quota).',
    priority: 'medium', buildCost: 'free',
  },
  {
    id: 'schema-validation',
    feature: 'Schema / rich results validation',
    category: 'Technical',
    semrush: true, ahrefs: false, ubersuggest: false, moz: false,
    vyaparsethu: 'free_alt',
    vyaparsethuPage: '/admin/seo/tools',
    howToAdd: 'Deep links to Rich Results Test already in Tools hub. Build automated check: fetch key URLs, validate JSON-LD with schema-dts.',
    priority: 'medium', buildCost: 'low',
  },
  // Backlinks
  {
    id: 'backlink-index',
    feature: 'Live backlink index (trillions of links)',
    category: 'Links',
    semrush: true, ahrefs: true, ubersuggest: true, moz: true,
    vyaparsethu: 'missing',
    howToAdd: 'Cannot build free. Use GSC Links report + manual ref domain CSV (you have 500 rows). Ahrefs free tier for your verified domain only.',
    priority: 'high', buildCost: 'paid_api',
  },
  {
    id: 'backlink-gap',
    feature: 'Competitor backlink gap / outreach targets',
    category: 'Links',
    semrush: true, ahrefs: true, ubersuggest: true, moz: true,
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/competitors',
    howToAdd: 'Expand COMPETITOR_BACKLINK_GAPS from CSV uploads. Add status tracking in `/admin/seo/backlinks` (Crunchbase/G2 workflow exists).',
    priority: 'high', buildCost: 'free',
  },
  {
    id: 'toxic-links',
    feature: 'Toxic / spam backlink audit',
    category: 'Links',
    semrush: true, ahrefs: false, ubersuggest: false, moz: true,
    vyaparsethu: 'missing',
    howToAdd: 'Low priority for new domain. Use Moz Spam Score free check or GSC disavow only if manual spam appears.',
    priority: 'low', buildCost: 'paid_api',
  },
  // Content & competitive
  {
    id: 'content-ideas',
    feature: 'Competitor content ideas for seed keyword',
    category: 'Content',
    semrush: true, ahrefs: true, ubersuggest: true, moz: false,
    vyaparsethu: 'have',
    vyaparsethuPage: '/admin/seo/content-ideas',
    howToAdd: 'Already built from your CSV. Add more seeds in seo-content-ideas.ts or upload via analyze.',
    priority: 'medium', buildCost: 'free',
  },
  {
    id: 'content-gap',
    feature: 'Content gap analysis (topics competitors have)',
    category: 'Content',
    semrush: true, ahrefs: true, ubersuggest: false, moz: false,
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/opportunities',
    howToAdd: 'Crawl competitor sitemaps (indiamart.com/blog) + diff against your sitemap. NVIDIA LLM summarizes gaps → opportunities list.',
    priority: 'high', buildCost: 'low',
  },
  {
    id: 'on-page-optimizer',
    feature: 'On-page SEO checker per URL',
    category: 'Content',
    semrush: true, ahrefs: true, ubersuggest: true, moz: true,
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/content',
    howToAdd: 'Build `/admin/seo/on-page` — input URL, extract title/meta/H1/word count, score vs target keyword using Groq.',
    priority: 'medium', buildCost: 'low',
  },
  {
    id: 'serp-analyzer',
    feature: 'SERP analyzer (top 10 breakdown per keyword)',
    category: 'Competitive',
    semrush: true, ahrefs: true, ubersuggest: true, moz: true,
    vyaparsethu: 'missing',
    howToAdd: 'SerpApi Google Search API (~$0.01/search) or manual paste SERP HTML → NVIDIA extract. Page: `/admin/seo/serp`.',
    priority: 'medium', buildCost: 'paid_api',
  },
  // AI visibility
  {
    id: 'ai-visibility',
    feature: 'AI search visibility (ChatGPT/Gemini brand mentions)',
    category: 'AI',
    semrush: true, ahrefs: true, ubersuggest: true, moz: false,
    vyaparsethu: 'have',
    vyaparsethuPage: '/admin/seo/ai-visibility',
    howToAdd: 'Manual quarterly refresh. Automate: weekly cron calls OpenAI/Gemini with your 9 prompts, parse brand mentions → update seo-ai-visibility.ts.',
    priority: 'high', buildCost: 'low',
  },
  {
    id: 'ai-prompt-research',
    feature: 'AI prompt research database',
    category: 'AI',
    semrush: true, ahrefs: false, ubersuggest: true, moz: false,
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/ai-visibility',
    howToAdd: 'Expand AI_VISIBILITY_PROMPTS from customer interviews + AlsoAsked free tier. Store in Neon, display in AI tab.',
    priority: 'medium', buildCost: 'free',
  },
  {
    id: 'ai-readiness-audit',
    feature: 'AI crawler readiness (robots.txt, llms.txt)',
    category: 'AI',
    semrush: true, ahrefs: false, ubersuggest: false, moz: false,
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/tools',
    howToAdd: 'Check robots.txt allows GPTBot, ClaudeBot, PerplexityBot. You have /llms.txt — add checker page validating blocks.',
    priority: 'medium', buildCost: 'low',
  },
  // Analytics & reporting
  {
    id: 'gsc-integration',
    feature: 'Google Search Console data',
    category: 'Analytics',
    semrush: true, ahrefs: true, ubersuggest: true, moz: true,
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/search-console',
    howToAdd: 'Phase 2: GSC API OAuth → live queries in cockpit. Phase 1: CSV upload (current).',
    priority: 'critical', buildCost: 'medium',
  },
  {
    id: 'ga4-integration',
    feature: 'Google Analytics 4 dashboards',
    category: 'Analytics',
    semrush: false, ahrefs: false, ubersuggest: false, moz: false,
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/tools',
    howToAdd: 'Set NEXT_PUBLIC_GA_ID. Add GA4 Data API read for landing pages + conversions in `/admin/seo/analytics`.',
    priority: 'high', buildCost: 'medium',
  },
  {
    id: 'domain-overview',
    feature: 'Domain overview (traffic est., top keywords)',
    category: 'Competitive',
    semrush: true, ahrefs: true, ubersuggest: true, moz: true,
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo',
    howToAdd: 'GSC gives real traffic (not estimates). Competitor traffic needs Ahrefs/Semrush paid. Show GSC totals on overview (already partial).',
    priority: 'medium', buildCost: 'paid_api',
  },
  // Local & directories
  {
    id: 'local-seo',
    feature: 'Local SEO / GBP management',
    category: 'Local',
    semrush: true, ahrefs: false, ubersuggest: false, moz: true,
    vyaparsethu: 'partial',
    vyaparsethuPage: '/suppliers',
    howToAdd: 'City+category pages exist. Add Google Business Profile link + NAP schema on supplier pages. Moz Local is paid — use manual GBP.',
    priority: 'medium', buildCost: 'free',
  },
  {
    id: 'directory-submissions',
    feature: 'Directory / listing submission workflow',
    category: 'Links',
    semrush: false, ahrefs: false, ubersuggest: false, moz: false,
    vyaparsethu: 'have',
    vyaparsethuPage: '/admin/directories/submit',
    howToAdd: 'Already built (Crunchbase/G2/Startup India). Add more directories from ref domain CSV.',
    priority: 'high', buildCost: 'free',
  },
  // Automation
  {
    id: 'csv-ai-analyze',
    feature: 'CSV import + AI opportunity extraction',
    category: 'Automation',
    semrush: false, ahrefs: false, ubersuggest: false, moz: false,
    vyaparsethu: 'have',
    vyaparsethuPage: '/admin/seo/analyze',
    howToAdd: 'Already built (Groq/NVIDIA). Add save-to-DB button to persist analysis results.',
    priority: 'medium', buildCost: 'free',
  },
  {
    id: 'scheduled-reports',
    feature: 'Scheduled email/PDF SEO reports',
    category: 'Reporting',
    semrush: true, ahrefs: true, ubersuggest: false, moz: true,
    vyaparsethu: 'missing',
    howToAdd: 'Vercel cron weekly → generate JSON summary → MSG91 email or Resend. Use seo-dashboard.ts snapshot.',
    priority: 'low', buildCost: 'low',
  },
  {
    id: 'browser-extension',
    feature: 'Browser extension (DA/keywords in SERP)',
    category: 'Browser',
    semrush: true, ahrefs: true, ubersuggest: true, moz: true,
    vyaparsethu: 'missing',
    howToAdd: 'Not needed — use MozBar/Ahrefs extension free while browsing. Building Chrome ext is high effort.',
    priority: 'low', buildCost: 'high',
  },
];

export function getGapSummary() {
  const total = SEO_GAP_MATRIX.length;
  const have = SEO_GAP_MATRIX.filter(r => r.vyaparsethu === 'have').length;
  const partial = SEO_GAP_MATRIX.filter(r => r.vyaparsethu === 'partial').length;
  const missing = SEO_GAP_MATRIX.filter(r => r.vyaparsethu === 'missing').length;
  const freeAlt = SEO_GAP_MATRIX.filter(r => r.vyaparsethu === 'free_alt').length;
  const criticalMissing = SEO_GAP_MATRIX.filter(r => r.vyaparsethu === 'missing' && r.priority === 'critical').length;
  const coveragePct = Math.round(((have + partial * 0.5 + freeAlt * 0.75) / total) * 100);
  return { total, have, partial, missing, freeAlt, criticalMissing, coveragePct };
}

export const BUILD_ROADMAP = [
  { phase: 'Week 1–2 (free)', items: ['GSC API OAuth live queries', 'Sitemap crawler → broken links', 'On-page checker page', 'AI visibility cron (9 prompts)'] },
  { phase: 'Week 3–4 (low cost)', items: ['SerpApi for 20 head keywords', 'Content gap from competitor sitemaps', 'Weekly Lighthouse cron', 'GA4 Data API landing pages'] },
  { phase: 'Month 2+ (optional paid)', items: ['DataForSEO for 450 category keywords', 'Ahrefs API for backlink gap', 'Looker Studio auto-dashboard'] },
];
