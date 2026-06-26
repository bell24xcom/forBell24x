/**
 * SEO platform gap analysis — features extracted from official HOME PAGES (Jun 2026).
 * Not live API crawls — marketing/feature names only. VyaparSethu Cockpit comparison.
 *
 * Sources fetched:
 * - semrush.com, semrush.com/features
 * - ahrefs.com
 * - similarweb.com
 * - neilpatel.com/ubersuggest
 * - moz.com
 * - majestic.com
 */

export type GapStatus = 'have' | 'partial' | 'missing' | 'free_alt' | 'not_needed';
export type PlatformId =
  | 'semrush'
  | 'ahrefs'
  | 'ubersuggest'
  | 'moz'
  | 'similarweb'
  | 'majestic'
  | 'seranking'
  | 'vyaparsethu';

export interface PlatformMeta {
  id: PlatformId;
  name: string;
  url: string;
  price: string;
  homepageFetched: string;
}

export interface PlatformTool {
  id: string;
  name: string;
  category: string;
  description: string;
  source: 'homepage' | 'features_page';
}

export interface GapRow {
  id: string;
  feature: string;
  category: string;
  /** Which paid platforms list this on their homepage/feature pages */
  platforms: Partial<Record<Exclude<PlatformId, 'vyaparsethu'>, boolean>>;
  vyaparsethu: GapStatus;
  vyaparsethuPage?: string;
  howToAdd: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  buildCost: 'free' | 'low' | 'medium' | 'high' | 'paid_api' | 'n/a';
}

export const COMPARED_PLATFORMS: PlatformMeta[] = [
  { id: 'semrush', name: 'Semrush', url: 'https://www.semrush.com', price: '~$130/mo', homepageFetched: '2026-06-26' },
  { id: 'ahrefs', name: 'Ahrefs', url: 'https://ahrefs.com', price: '~$129/mo', homepageFetched: '2026-06-26' },
  { id: 'similarweb', name: 'Similarweb', url: 'https://www.similarweb.com', price: 'Enterprise / trial', homepageFetched: '2026-06-26' },
  { id: 'ubersuggest', name: 'Ubersuggest', url: 'https://neilpatel.com/ubersuggest', price: '~$29/mo or lifetime', homepageFetched: '2026-06-26' },
  { id: 'moz', name: 'Moz', url: 'https://moz.com', price: '~$99/mo', homepageFetched: '2026-06-26' },
  { id: 'majestic', name: 'Majestic', url: 'https://majestic.com', price: '~$49/mo', homepageFetched: '2026-06-26' },
  { id: 'seranking', name: 'SE Ranking', url: 'https://seranking.com', price: '~$65/mo', homepageFetched: '2026-06-26' },
  { id: 'vyaparsethu', name: 'VyaparSethu SEO Cockpit', url: '/admin/seo', price: 'Free (built-in)', homepageFetched: '2026-06-26' },
];

/** semrush.com + semrush.com/features — Jun 2026 */
export const SEMRUSH_TOOLS: PlatformTool[] = [
  { id: 'semrush-one', name: 'Semrush One', category: 'Platform', description: 'Unified SEO + AI visibility dashboard', source: 'homepage' },
  { id: 'ai-seo', name: 'AI SEO', category: 'AI', description: 'Visibility in ChatGPT, Google AI Mode', source: 'features_page' },
  { id: 'ai-visibility', name: 'AI Visibility Toolkit', category: 'AI', description: 'LLM citations, 289M+ prompt database', source: 'homepage' },
  { id: 'keyword-research', name: 'Keyword Research', category: 'Keywords', description: '6 tools — Magic Tool, 28B keywords', source: 'features_page' },
  { id: 'rank-tracking', name: 'Rank Tracking', category: 'Rankings', description: '4 tools — positions, SERP features, AI Overviews', source: 'features_page' },
  { id: 'technical-seo', name: 'Technical SEO / Site Audit', category: 'Technical', description: '3 tools — 140+ checks, CWV', source: 'features_page' },
  { id: 'link-building', name: 'Link Building', category: 'Links', description: '6 tools — 43T backlink index', source: 'features_page' },
  { id: 'content-optimization', name: 'Content Optimization', category: 'Content', description: '3 tools — SEO writing assistant', source: 'features_page' },
  { id: 'content-marketing', name: 'Content Marketing', category: 'Content', description: '4 tools — topic research, AI content', source: 'features_page' },
  { id: 'competitor-seo', name: 'Competitor SEO Analysis', category: 'Competitive', description: '8 tools — keyword gap, domain comparison', source: 'features_page' },
  { id: 'market-traffic', name: 'Market Analysis & Traffic', category: 'Traffic', description: '808M domain profiles, audience insights', source: 'features_page' },
  { id: 'local-seo', name: 'Local SEO', category: 'Local', description: '6 tools — listings, map pack', source: 'features_page' },
  { id: 'advertising', name: 'Advertising / PPC', category: 'Paid', description: '3 tools — paid search intelligence', source: 'features_page' },
  { id: 'ai-pr', name: 'AI PR', category: 'PR', description: 'Earned press cited by AI', source: 'homepage' },
  { id: 'social-media', name: 'Social Media', category: 'Social', description: '4 tools — schedule, analytics', source: 'features_page' },
  { id: 'enterprise', name: 'Enterprise SEO', category: 'Enterprise', description: 'Multi-domain, API, SSO', source: 'features_page' },
  { id: 'semrush-mcp', name: 'Semrush MCP for AI', category: 'AI', description: 'Semrush data inside ChatGPT/AI assistants', source: 'homepage' },
  { id: 'brand-visibility', name: 'Brand Visibility (Adobe)', category: 'AI', description: 'GEO — generative engine optimization', source: 'homepage' },
];

/** ahrefs.com homepage — Jun 2026 */
export const AHREFS_TOOLS: PlatformTool[] = [
  { id: 'brand-radar', name: 'Brand Radar', category: 'AI', description: 'AI chatbot mentions, citations, sentiment', source: 'homepage' },
  { id: 'rank-tracker', name: 'Rank Tracker', category: 'Rankings', description: '217+ countries, share of voice', source: 'homepage' },
  { id: 'site-explorer', name: 'Site Explorer', category: 'Competitive', description: 'Traffic, keywords, backlinks, PPC', source: 'homepage' },
  { id: 'keywords-explorer', name: 'Keywords Explorer', category: 'Keywords', description: '110B discovered, 28.7B filtered keywords', source: 'homepage' },
  { id: 'content-explorer', name: 'Content Explorer', category: 'Content', description: 'Top content by niche', source: 'homepage' },
  { id: 'ai-content-helper', name: 'AI Content Helper', category: 'Content', description: 'AI drafts aligned to SERP', source: 'homepage' },
  { id: 'ai-content-grader', name: 'AI Content Grader', category: 'Content', description: 'Grade content vs competitors', source: 'homepage' },
  { id: 'site-audit', name: 'Site Audit', category: 'Technical', description: '24/7 site health monitoring', source: 'homepage' },
  { id: 'web-analytics', name: 'Web Analytics', category: 'Analytics', description: 'Real-time visitor tracking (free tier)', source: 'homepage' },
  { id: 'bot-analytics', name: 'Bot Analytics', category: 'AI', description: 'Which AI bots crawl your site', source: 'homepage' },
  { id: 'ai-tech-seo', name: 'AI Tech SEO', category: 'Technical', description: 'Deploy technical fixes without devs', source: 'homepage' },
  { id: 'gbp-monitor', name: 'GBP Monitor', category: 'Local', description: 'Google Business Profile optimization', source: 'homepage' },
  { id: 'social-media-manager', name: 'Social Media Manager', category: 'Social', description: 'Publish, schedule, brand mentions', source: 'homepage' },
  { id: 'dashboard', name: 'Dashboard', category: 'Reporting', description: 'High-level website overview', source: 'homepage' },
  { id: 'portfolios', name: 'Portfolios', category: 'Reporting', description: 'Multi-site grouping', source: 'homepage' },
  { id: 'report-builder', name: 'Report Builder', category: 'Reporting', description: 'Custom Ahrefs reports', source: 'homepage' },
  { id: 'agent-a', name: 'Agent A', category: 'AI', description: 'AI marketing agent with full Ahrefs data', source: 'homepage' },
  { id: 'ai-localization', name: 'AI Localization', category: 'Content', description: 'Global market content optimization', source: 'homepage' },
  { id: 'api', name: 'API (100+ endpoints)', category: 'Enterprise', description: 'Custom dashboards, automation', source: 'homepage' },
];

/** similarweb.com homepage — Jun 2026 */
export const SIMILARWEB_TOOLS: PlatformTool[] = [
  { id: 'web-intelligence', name: 'Web Intelligence', category: 'Market', description: '100M+ websites, market research, competitor analysis', source: 'homepage' },
  { id: 'ai-search-intelligence', name: 'AI Search Intelligence', category: 'AI', description: 'AI brand visibility, citations, sentiment, AI traffic', source: 'homepage' },
  { id: 'keyword-research', name: 'Keyword Research', category: 'Keywords', description: '5B search terms database', source: 'homepage' },
  { id: 'rank-tracking', name: 'Rank Tracking', category: 'Rankings', description: 'SEO rank monitoring', source: 'homepage' },
  { id: 'site-audit', name: 'Site Audit', category: 'Technical', description: 'Technical SEO audits', source: 'homepage' },
  { id: 'aeo', name: 'SEO & AEO', category: 'AI', description: 'Answer Engine Optimization suite', source: 'homepage' },
  { id: 'sales-intelligence', name: 'Sales Intelligence', category: 'Sales', description: 'Lead gen, contact data, CRM enrichment, AI sales assistant', source: 'homepage' },
  { id: 'app-intelligence', name: 'App Intelligence', category: 'Apps', description: 'App performance, ratings, audience', source: 'homepage' },
  { id: 'retail-intelligence', name: 'Retail Intelligence', category: 'Ecommerce', description: 'Amazon marketing, consumer demand, retail media', source: 'homepage' },
  { id: 'audience-analysis', name: 'Audience Analysis', category: 'Market', description: 'Audience loyalty and demographics', source: 'homepage' },
  { id: 'demand-analysis', name: 'Demand Analysis', category: 'Market', description: 'Market size and trend shifts', source: 'homepage' },
  { id: 'paid-search-intel', name: 'Paid Search Intelligence', category: 'Paid', description: 'Competitor ad spend across channels', source: 'homepage' },
  { id: 'display-ads', name: 'Display Ad Intelligence', category: 'Paid', description: '250M display ads tracked', source: 'homepage' },
  { id: 'data-api', name: 'Data-as-a-Service API', category: 'Enterprise', description: 'Digital insights at scale', source: 'homepage' },
  { id: 'visibility-traffic-efficiency', name: 'Visibility + Traffic + Efficiency', category: 'Platform', description: 'Holistic digital channel view', source: 'homepage' },
];

/** neilpatel.com/ubersuggest homepage — Jun 2026 */
export const UBERSUGGEST_TOOLS: PlatformTool[] = [
  { id: 'ai-keyword-research', name: 'AI Keyword Research', category: 'Keywords', description: '100M keywords, AI ideas, brands mentioned by AI', source: 'homepage' },
  { id: 'predictive-analytics', name: 'Predictive Analytics', category: 'Keywords', description: 'Keywords that will drive traffic before you rank', source: 'homepage' },
  { id: 'competitive-intelligence', name: 'Competitive Intelligence', category: 'Competitive', description: 'SERP analysis, traffic estimation, top content', source: 'homepage' },
  { id: 'competitor-analysis', name: 'Competitor Analysis', category: 'Competitive', description: 'Reverse-engineer competitor strategies', source: 'homepage' },
  { id: 'site-audit', name: 'Site Audit', category: 'Technical', description: 'SEO + code issues', source: 'homepage' },
  { id: 'content-gap', name: 'Content Gap Analysis', category: 'Content', description: 'What content to create next', source: 'homepage' },
  { id: 'rank-tracking', name: 'Ranking Tracking', category: 'Rankings', description: 'Daily rank monitoring', source: 'homepage' },
  { id: 'backlink-opportunities', name: 'Backlink Opportunities', category: 'Links', description: 'Link prospects from competitive intel', source: 'homepage' },
  { id: 'ai-visibility', name: 'AI Visibility / AI Writer', category: 'AI', description: 'Brand mentioned on Google and Gemini', source: 'homepage' },
  { id: 'ai-search-optimization', name: 'AI Search Optimization', category: 'AI', description: 'NP Digital AI citation audit', source: 'homepage' },
];

/** moz.com homepage — Jun 2026 */
export const MOZ_TOOLS: PlatformTool[] = [
  { id: 'keyword-research', name: 'Keyword Research', category: 'Keywords', description: 'Volume, difficulty, SERP analysis', source: 'homepage' },
  { id: 'competitive-research', name: 'Competitive Research Suite', category: 'Competitive', description: 'Keyword gaps, AI answer benchmarking', source: 'homepage' },
  { id: 'link-research', name: 'Link Research', category: 'Links', description: 'DA, anchor text, linking domains', source: 'homepage' },
  { id: 'rank-tracking', name: 'Rank Tracking', category: 'Rankings', description: '170+ search engines', source: 'homepage' },
  { id: 'domain-overview', name: 'Domain Overview', category: 'Competitive', description: 'Brand Authority + DA snapshot', source: 'homepage' },
  { id: 'site-crawl', name: 'Site Crawl', category: 'Technical', description: 'Technical SEO audit + recommendations', source: 'homepage' },
  { id: 'stat', name: 'STAT', category: 'Rankings', description: 'Large-scale daily SERP tracking (100 results)', source: 'homepage' },
  { id: 'moz-local', name: 'Moz Local', category: 'Local', description: 'GBP, reviews, listings management', source: 'homepage' },
  { id: 'moz-api', name: 'Moz API', category: 'Enterprise', description: 'DA, PA, Spam Score, Brand Authority', source: 'homepage' },
  { id: 'ai-tracking', name: 'AI Presence Tracking', category: 'AI', description: 'Google AI Mode, ChatGPT, Gemini in one dashboard', source: 'homepage' },
];

/** majestic.com homepage — Jun 2026 */
export const MAJESTIC_TOOLS: PlatformTool[] = [
  { id: 'trust-flow', name: 'Trust Flow', category: 'Links', description: 'Link quality metric', source: 'homepage' },
  { id: 'citation-flow', name: 'Citation Flow', category: 'Links', description: 'Link quantity metric', source: 'homepage' },
  { id: 'topical-trust-flow', name: 'Topical Trust Flow', category: 'Links', description: '800+ category topical relevance', source: 'homepage' },
  { id: 'visibility-flow', name: 'Visibility Flow', category: 'Links', description: 'Editorial vs directory link quality', source: 'homepage' },
  { id: 'backlink-checker', name: 'Backlink Checker', category: 'Links', description: 'Ref domains, backlinks, anchor text', source: 'homepage' },
  { id: 'link-context', name: 'Link Context', category: 'Links', description: 'Surrounding content of links', source: 'homepage' },
  { id: 'clique-hunter', name: 'Clique Hunter', category: 'Links', description: 'Find sites linking to competitors not you', source: 'homepage' },
  { id: 'author-explorer', name: 'Author Explorer', category: 'Links', description: 'Author-level link attribution (beta)', source: 'homepage' },
  { id: 'backlink-history', name: 'Backlink History', category: 'Links', description: 'New/lost links over time', source: 'homepage' },
];

/** seranking.com — feature categories from site positioning */
export const SERANKING_TOOLS: PlatformTool[] = [
  { id: 'keyword-research', name: 'Keyword Research', category: 'Keywords', description: 'Keyword suggestions and grouping', source: 'homepage' },
  { id: 'rank-tracker', name: 'Rank Tracker', category: 'Rankings', description: 'Keyword position monitoring', source: 'homepage' },
  { id: 'backlink-checker', name: 'Backlink Checker', category: 'Links', description: 'Backlink monitoring and analysis', source: 'homepage' },
  { id: 'website-audit', name: 'Website Audit', category: 'Technical', description: 'On-page and technical SEO audit', source: 'homepage' },
  { id: 'competitor-research', name: 'Competitor Research', category: 'Competitive', description: 'Competitor keyword and traffic analysis', source: 'homepage' },
  { id: 'ai-visibility', name: 'AI Visibility', category: 'AI', description: 'AI SEO positioning (2026 site messaging)', source: 'homepage' },
];

const P = {
  semrush: 'semrush' as const,
  ahrefs: 'ahrefs' as const,
  ubersuggest: 'ubersuggest' as const,
  moz: 'moz' as const,
  similarweb: 'similarweb' as const,
  majestic: 'majestic' as const,
  seranking: 'seranking' as const,
};

/** Unified gap matrix — each row = one capability type across all platforms */
export const SEO_GAP_MATRIX: GapRow[] = [
  // ── Keywords & rankings ──
  {
    id: 'kw-database',
    feature: 'Keyword database (volume, difficulty, intent)',
    category: 'Keywords',
    platforms: { [P.semrush]: true, [P.ahrefs]: true, [P.ubersuggest]: true, [P.moz]: true, [P.similarweb]: true, [P.seranking]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/rankings',
    howToAdd: 'GSC Performance CSV → /admin/seo/analyze. Manual updates in seo-opportunities.ts. Free: Google Keyword Planner.',
    priority: 'high', buildCost: 'paid_api',
  },
  {
    id: 'rank-tracker',
    feature: 'Rank tracking (positions over time)',
    category: 'Rankings',
    platforms: { [P.semrush]: true, [P.ahrefs]: true, [P.ubersuggest]: true, [P.moz]: true, [P.similarweb]: true, [P.seranking]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/rankings',
    howToAdd: 'GSC API cron or SerpApi ($50/mo) → Neon keyword_ranks table.',
    priority: 'high', buildCost: 'paid_api',
  },
  {
    id: 'category-ranks',
    feature: 'Per-category / supplier / product rank comparison',
    category: 'Rankings',
    platforms: {},
    vyaparsethu: 'have',
    vyaparsethuPage: '/admin/seo/category-ranks',
    howToAdd: 'Built — 400+ rows. Unique to VyaparSethu; none of the paid tools offer B2B category panels.',
    priority: 'medium', buildCost: 'free',
  },
  {
    id: 'predictive-kw',
    feature: 'Predictive keyword analytics',
    category: 'Keywords',
    platforms: { [P.ubersuggest]: true, [P.semrush]: true },
    vyaparsethu: 'missing',
    howToAdd: 'NVIDIA LLM on GSC trend data — flag rising queries before competitors.',
    priority: 'low', buildCost: 'low',
  },
  // ── Technical SEO ──
  {
    id: 'site-audit',
    feature: 'Site audit / technical crawl',
    category: 'Technical',
    platforms: { [P.semrush]: true, [P.ahrefs]: true, [P.ubersuggest]: true, [P.moz]: true, [P.similarweb]: true, [P.seranking]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/lighthouse',
    howToAdd: 'Build /api/admin/seo/crawl — sitemap.xml + cheerio. Screaming Frog CSV → analyze.',
    priority: 'critical', buildCost: 'low',
  },
  {
    id: 'core-web-vitals',
    feature: 'Core Web Vitals / performance',
    category: 'Technical',
    platforms: { [P.semrush]: true, [P.ahrefs]: true, [P.ubersuggest]: true },
    vyaparsethu: 'have',
    vyaparsethuPage: '/admin/seo/lighthouse',
    howToAdd: 'Done. Add weekly PageSpeed Insights API cron.',
    priority: 'medium', buildCost: 'free',
  },
  {
    id: 'ai-tech-seo',
    feature: 'AI crawler / bot analytics (GPTBot, ClaudeBot)',
    category: 'Technical',
    platforms: { [P.ahrefs]: true, [P.semrush]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/tools',
    howToAdd: 'Validate robots.txt allows AI bots. Check /llms.txt. New /admin/seo/ai-crawlers page.',
    priority: 'medium', buildCost: 'low',
  },
  {
    id: 'on-page-checker',
    feature: 'On-page SEO checker per URL',
    category: 'Technical',
    platforms: { [P.semrush]: true, [P.ahrefs]: true, [P.ubersuggest]: true, [P.moz]: true, [P.seranking]: true },
    vyaparsethu: 'missing',
    howToAdd: 'New /admin/seo/on-page — fetch URL, score title/H1/meta with Groq.',
    priority: 'high', buildCost: 'low',
  },
  // ── Links & authority ──
  {
    id: 'backlink-index',
    feature: 'Live backlink index (billions/trillions)',
    category: 'Links',
    platforms: { [P.semrush]: true, [P.ahrefs]: true, [P.ubersuggest]: true, [P.moz]: true, [P.majestic]: true, [P.seranking]: true },
    vyaparsethu: 'missing',
    howToAdd: 'Cannot replicate. GSC Links export + ref-domain CSV. Majestic free plan for limited checks.',
    priority: 'high', buildCost: 'paid_api',
  },
  {
    id: 'trust-flow',
    feature: 'Link quality metrics (Trust Flow / DA / AS)',
    category: 'Links',
    platforms: { [P.majestic]: true, [P.moz]: true, [P.semrush]: true, [P.ahrefs]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/competitors',
    howToAdd: 'Manual DA from CSV. Show static DA in competitor table — not live Moz API.',
    priority: 'medium', buildCost: 'paid_api',
  },
  {
    id: 'clique-hunter',
    feature: 'Link gap — sites linking to competitors not you',
    category: 'Links',
    platforms: { [P.majestic]: true, [P.ahrefs]: true, [P.semrush]: true, [P.ubersuggest]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/backlinks',
    howToAdd: 'Your refDomains CSV (500 rows) is this. Expand via analyze upload + directory workflow.',
    priority: 'high', buildCost: 'free',
  },
  {
    id: 'toxic-links',
    feature: 'Toxic / spam backlink audit',
    category: 'Links',
    platforms: { [P.semrush]: true, [P.moz]: true },
    vyaparsethu: 'missing',
    howToAdd: 'Low priority for new domain. Moz Spam Score free check if needed.',
    priority: 'low', buildCost: 'paid_api',
  },
  // ── Content & competitive ──
  {
    id: 'content-ideas',
    feature: 'Content ideas (top pages for keyword)',
    category: 'Content',
    platforms: { [P.ubersuggest]: true, [P.ahrefs]: true, [P.semrush]: true },
    vyaparsethu: 'have',
    vyaparsethuPage: '/admin/seo/content-ideas',
    howToAdd: 'Done — 7 pages from your CSV. Add seeds in seo-content-ideas.ts.',
    priority: 'medium', buildCost: 'free',
  },
  {
    id: 'content-gap',
    feature: 'Content gap analysis',
    category: 'Content',
    platforms: { [P.ubersuggest]: true, [P.ahrefs]: true, [P.semrush]: true, [P.moz]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/opportunities',
    howToAdd: 'Diff competitor sitemaps vs yours → NVIDIA LLM → opportunities list.',
    priority: 'high', buildCost: 'low',
  },
  {
    id: 'ai-content-writer',
    feature: 'AI content helper / grader / writer',
    category: 'Content',
    platforms: { [P.ahrefs]: true, [P.semrush]: true, [P.ubersuggest]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/api/ai/sparkle',
    howToAdd: 'Sparkle API exists for product copy. Extend to SEO blog briefs in /admin/seo/analyze.',
    priority: 'medium', buildCost: 'free',
  },
  {
    id: 'serp-analyzer',
    feature: 'SERP analyzer (top 10 breakdown)',
    category: 'Competitive',
    platforms: { [P.ubersuggest]: true, [P.ahrefs]: true, [P.semrush]: true, [P.moz]: true },
    vyaparsethu: 'missing',
    howToAdd: 'SerpApi or manual SERP paste → /admin/seo/serp page.',
    priority: 'medium', buildCost: 'paid_api',
  },
  {
    id: 'competitor-traffic',
    feature: 'Competitor traffic estimation',
    category: 'Traffic',
    platforms: { [P.similarweb]: true, [P.semrush]: true, [P.ahrefs]: true, [P.ubersuggest]: true },
    vyaparsethu: 'missing',
    howToAdd: 'Similarweb/Semrush paid only. Use GSC for YOUR traffic; ignore competitor estimates.',
    priority: 'low', buildCost: 'paid_api',
  },
  {
    id: 'domain-overview',
    feature: 'Domain overview dashboard',
    category: 'Competitive',
    platforms: { [P.semrush]: true, [P.ahrefs]: true, [P.moz]: true, [P.similarweb]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo',
    howToAdd: 'GSC totals on overview. Competitor domain stats need paid API.',
    priority: 'medium', buildCost: 'paid_api',
  },
  // ── AI visibility (AEO/GEO) ──
  {
    id: 'ai-visibility',
    feature: 'AI search visibility (ChatGPT/Gemini brand mentions)',
    category: 'AI',
    platforms: { [P.semrush]: true, [P.ahrefs]: true, [P.ubersuggest]: true, [P.moz]: true, [P.similarweb]: true, [P.seranking]: true },
    vyaparsethu: 'have',
    vyaparsethuPage: '/admin/seo/ai-visibility',
    howToAdd: 'Done — 9 prompts, 0% visibility. Automate quarterly cron with Groq/Gemini API.',
    priority: 'high', buildCost: 'low',
  },
  {
    id: 'ai-citations',
    feature: 'AI citation analysis',
    category: 'AI',
    platforms: { [P.similarweb]: true, [P.ubersuggest]: true, [P.semrush]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/ai-visibility',
    howToAdd: 'Track which pages get cited — manual prompt checks. Add citation log table.',
    priority: 'medium', buildCost: 'low',
  },
  {
    id: 'ai-prompt-research',
    feature: 'AI prompt research database',
    category: 'AI',
    platforms: { [P.semrush]: true, [P.ubersuggest]: true, [P.similarweb]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/ai-visibility',
    howToAdd: 'Expand AI_VISIBILITY_PROMPTS. AlsoAsked.com free tier for question keywords.',
    priority: 'medium', buildCost: 'free',
  },
  {
    id: 'aeo',
    feature: 'AEO / Answer Engine Optimization suite',
    category: 'AI',
    platforms: { [P.similarweb]: true, [P.semrush]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/ai-visibility',
    howToAdd: 'FAQ schema on /how-payment-works, /how-verification-works. llms.txt on site.',
    priority: 'high', buildCost: 'free',
  },
  // ── Market & traffic (Similarweb-specific) ──
  {
    id: 'market-research',
    feature: 'Market research / audience analysis',
    category: 'Market',
    platforms: { [P.similarweb]: true, [P.semrush]: true },
    vyaparsethu: 'missing',
    howToAdd: 'Not core for B2B marketplace SEO. Skip unless investor deck needs TAM data.',
    priority: 'low', buildCost: 'paid_api',
  },
  {
    id: 'paid-ad-intel',
    feature: 'Paid search / display ad intelligence',
    category: 'Paid',
    platforms: { [P.similarweb]: true, [P.semrush]: true, [P.ahrefs]: true },
    vyaparsethu: 'not_needed',
    howToAdd: 'Out of scope — organic SEO focus. Link to Google Ads if needed.',
    priority: 'low', buildCost: 'n/a',
  },
  {
    id: 'app-intelligence',
    feature: 'App intelligence',
    category: 'Apps',
    platforms: { [P.similarweb]: true },
    vyaparsethu: 'not_needed',
    howToAdd: 'N/A — web marketplace only.',
    priority: 'low', buildCost: 'n/a',
  },
  {
    id: 'retail-intelligence',
    feature: 'Retail / Amazon intelligence',
    category: 'Ecommerce',
    platforms: { [P.similarweb]: true },
    vyaparsethu: 'not_needed',
    howToAdd: 'N/A unless you add Amazon Business integration.',
    priority: 'low', buildCost: 'n/a',
  },
  {
    id: 'sales-intelligence',
    feature: 'Sales intelligence / lead gen',
    category: 'Sales',
    platforms: { [P.similarweb]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/outreach',
    howToAdd: 'WhatsApp outreach dialer exists — not SEO. Keep separate from SEO Cockpit.',
    priority: 'low', buildCost: 'free',
  },
  // ── Local & social ──
  {
    id: 'local-seo',
    feature: 'Local SEO / GBP management',
    category: 'Local',
    platforms: { [P.semrush]: true, [P.ahrefs]: true, [P.moz]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/suppliers',
    howToAdd: 'City+category pages exist. Add GBP links on supplier profiles.',
    priority: 'medium', buildCost: 'free',
  },
  {
    id: 'social-media',
    feature: 'Social media management',
    category: 'Social',
    platforms: { [P.semrush]: true, [P.ahrefs]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/social',
    howToAdd: 'Social calendar exists in admin — separate from SEO Cockpit.',
    priority: 'low', buildCost: 'free',
  },
  // ── Analytics & reporting ──
  {
    id: 'gsc',
    feature: 'Google Search Console integration',
    category: 'Analytics',
    platforms: { [P.semrush]: true, [P.ahrefs]: true, [P.ubersuggest]: true, [P.moz]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/search-console',
    howToAdd: 'GSC API OAuth — live query sync. CSV upload works today.',
    priority: 'critical', buildCost: 'medium',
  },
  {
    id: 'ga4',
    feature: 'Google Analytics 4',
    category: 'Analytics',
    platforms: { [P.ahrefs]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/tools',
    howToAdd: 'NEXT_PUBLIC_GA_ID + GA4 Data API for landing page report.',
    priority: 'high', buildCost: 'medium',
  },
  {
    id: 'web-analytics',
    feature: 'First-party web analytics',
    category: 'Analytics',
    platforms: { [P.ahrefs]: true, [P.similarweb]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/analytics',
    howToAdd: 'GA4 covers this. Ahrefs Web Analytics is their own product.',
    priority: 'medium', buildCost: 'free',
  },
  {
    id: 'report-builder',
    feature: 'Custom report builder / PDF export',
    category: 'Reporting',
    platforms: { [P.ahrefs]: true, [P.semrush]: true, [P.moz]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/admin/seo/gap-report',
    howToAdd: 'CSV export on gap report + category ranks. Add weekly email via MSG91.',
    priority: 'low', buildCost: 'low',
  },
  {
    id: 'api-access',
    feature: 'SEO data API',
    category: 'Enterprise',
    platforms: { [P.ahrefs]: true, [P.semrush]: true, [P.moz]: true, [P.similarweb]: true },
    vyaparsethu: 'partial',
    vyaparsethuPage: '/api/seo/ranks',
    howToAdd: '/api/seo/ranks exists for internal panels. Document for admin use only.',
    priority: 'low', buildCost: 'free',
  },
  // ── VyaparSethu-only ──
  {
    id: 'csv-ai-analyze',
    feature: 'CSV import + AI extraction (Groq/NVIDIA)',
    category: 'Automation',
    platforms: {},
    vyaparsethu: 'have',
    vyaparsethuPage: '/admin/seo/analyze',
    howToAdd: 'Unique feature — no paid tool equivalent in one admin.',
    priority: 'medium', buildCost: 'free',
  },
  {
    id: 'directory-workflow',
    feature: 'Directory submission workflow (Crunchbase/G2)',
    category: 'Links',
    platforms: {},
    vyaparsethu: 'have',
    vyaparsethuPage: '/admin/seo/backlinks',
    howToAdd: 'Done — manual guides with localStorage tracking.',
    priority: 'high', buildCost: 'free',
  },
  {
    id: 'seo-opportunities',
    feature: 'SEO opportunities list',
    category: 'Audit',
    platforms: { [P.ubersuggest]: true, [P.semrush]: true },
    vyaparsethu: 'have',
    vyaparsethuPage: '/admin/seo/opportunities',
    howToAdd: 'Done — 10 tasks from your Ubersuggest export.',
    priority: 'medium', buildCost: 'free',
  },
  {
    id: 'free-tools-hub',
    feature: 'Free SEO tools hub (GSC, GA4, PageSpeed deep links)',
    category: 'Tools',
    platforms: {},
    vyaparsethu: 'have',
    vyaparsethuPage: '/admin/seo/tools',
    howToAdd: 'Done — 15 free tools with GA4 events.',
    priority: 'medium', buildCost: 'free',
  },
  {
    id: 'ai-agent',
    feature: 'AI marketing agent with SEO data',
    category: 'AI',
    platforms: { [P.ahrefs]: true, [P.semrush]: true },
    vyaparsethu: 'missing',
    howToAdd: 'Future: MCP server exposing /api/seo/ranks + GSC to Cursor/ChatGPT. Semrush MCP model.',
    priority: 'low', buildCost: 'high',
  },
  {
    id: 'semrush-mcp',
    feature: 'MCP / ChatGPT plugin for SEO data',
    category: 'AI',
    platforms: { [P.semrush]: true },
    vyaparsethu: 'missing',
    howToAdd: 'Build vyaparsethu-seo-mcp exposing ranks + opportunities to AI assistants.',
    priority: 'low', buildCost: 'medium',
  },
];

export const PLATFORM_TOOL_COUNTS: Record<Exclude<PlatformId, 'vyaparsethu'>, number> = {
  semrush: SEMRUSH_TOOLS.length,
  ahrefs: AHREFS_TOOLS.length,
  similarweb: SIMILARWEB_TOOLS.length,
  ubersuggest: UBERSUGGEST_TOOLS.length,
  moz: MOZ_TOOLS.length,
  majestic: MAJESTIC_TOOLS.length,
  seranking: SERANKING_TOOLS.length,
};

export const ALL_PLATFORM_TOOLS: Record<Exclude<PlatformId, 'vyaparsethu'>, PlatformTool[]> = {
  semrush: SEMRUSH_TOOLS,
  ahrefs: AHREFS_TOOLS,
  similarweb: SIMILARWEB_TOOLS,
  ubersuggest: UBERSUGGEST_TOOLS,
  moz: MOZ_TOOLS,
  majestic: MAJESTIC_TOOLS,
  seranking: SERANKING_TOOLS,
};

export function getGapSummary() {
  const rows = SEO_GAP_MATRIX.filter(r => r.vyaparsethu !== 'not_needed');
  const total = rows.length;
  const have = rows.filter(r => r.vyaparsethu === 'have').length;
  const partial = rows.filter(r => r.vyaparsethu === 'partial').length;
  const missing = rows.filter(r => r.vyaparsethu === 'missing').length;
  const freeAlt = rows.filter(r => r.vyaparsethu === 'free_alt').length;
  const criticalMissing = rows.filter(r => r.vyaparsethu === 'missing' && r.priority === 'critical').length;
  const paidToolFeatures = new Set<string>();
  for (const row of SEO_GAP_MATRIX) {
    if (Object.values(row.platforms).some(Boolean)) paidToolFeatures.add(row.id);
  }
  const coveragePct = Math.round(((have + partial * 0.5 + freeAlt * 0.75) / total) * 100);
  const uniqueToUs = rows.filter(r => r.vyaparsethu === 'have' && !Object.values(r.platforms).some(Boolean)).length;
  return { total, have, partial, missing, freeAlt, criticalMissing, coveragePct, uniqueToUs, paidPlatformsCompared: 7 };
}

export const BUILD_ROADMAP = [
  {
    phase: 'Week 1–2 (free)',
    items: [
      'GSC API OAuth → live queries in Search Console tab',
      'Sitemap crawler → broken links (fixes your 7-page audit)',
      'On-page checker (/admin/seo/on-page)',
      'AI crawler robots.txt validator',
    ],
  },
  {
    phase: 'Week 3–4 (low cost)',
    items: [
      'SerpApi for 20 B2B head keywords',
      'Content gap from IndiaMART/TradeIndia sitemaps',
      'AI visibility weekly cron (9 prompts)',
      'GA4 Data API landing pages',
    ],
  },
  {
    phase: 'Month 2+ (optional)',
    items: [
      'DataForSEO for 450 category keywords',
      'Similarweb-style traffic charts (GSC only — real data)',
      'vyaparsethu-seo-mcp for ChatGPT integration',
      'Weekly SEO email report',
    ],
  },
];

/** Features on paid homepages that VyaparSethu is completely missing */
export const MISSING_FEATURES_REPORT = SEO_GAP_MATRIX.filter(
  r => r.vyaparsethu === 'missing' && r.priority !== 'low',
).map(r => ({
  feature: r.feature,
  category: r.category,
  offeredBy: Object.entries(r.platforms)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(', '),
  howToAdd: r.howToAdd,
  priority: r.priority,
  buildCost: r.buildCost,
}));

/** Features VyaparSethu has that paid tools don't bundle */
export const UNIQUE_VYAPARSETHU_FEATURES = SEO_GAP_MATRIX.filter(
  r => r.vyaparsethu === 'have' && !Object.values(r.platforms).some(Boolean),
).map(r => ({ feature: r.feature, page: r.vyaparsethuPage }));
