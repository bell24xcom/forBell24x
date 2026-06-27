/**
 * Manual SEO opportunity & keyword tracking data.
 * Update from Google Search Console, manual SERP checks, or site audits.
 * No paid tool API — free sources only.
 */

export type OpportunityType = 'seo_issue' | 'new_content' | 'technical';
export type OpportunityPriority = 'high' | 'medium' | 'low';
export type KeywordRankStatus = 'not_ranked' | 'unstable' | 'pending' | 'tracking' | 'noise';

export interface SeoOpportunity {
  id: string;
  type: OpportunityType;
  priority: OpportunityPriority;
  title: string;
  description: string;
  suggestedAction: string;
  targetUrl?: string;
  contentBrief?: string;
}

export interface TrackedKeyword {
  id: string;
  keyword: string;
  volume: number;
  seoDifficulty: number;
  position: number | null;
  status: KeywordRankStatus;
  url: string | null;
  category: 'b2b_core' | 'local' | 'category' | 'brand' | 'feature' | 'noise';
  notes?: string;
}

export interface CompetitorBacklinkGap {
  domain: string;
  domainAuthority: number;
  linksTo: string[];
  notes?: string;
}

export interface OutreachTarget {
  name: string;
  url: string;
  use: string;
}

export const SEO_OPPORTUNITIES: SeoOpportunity[] = [
  {
    id: 'broken-links',
    type: 'seo_issue',
    priority: 'high',
    title: '7 pages with broken links',
    description: 'Internal or outbound links returning 404 — hurts crawl budget and UX.',
    suggestedAction: 'Run a free crawl (Screaming Frog free tier, or Google Search Console → Pages → Not found). Fix footer, blog, and category cross-links.',
    targetUrl: '/admin/seo/content',
  },
  {
    id: 'content-top5-b2b',
    type: 'new_content',
    priority: 'high',
    title: 'Rank for "top 5 b2b portal in india"',
    description: 'Comparison listicle — high intent, SD 8. IndiaMART/TradeIndia dominate; angle = verified suppliers + payment protection.',
    suggestedAction: 'Publish /blog/top-b2b-portals-india-2026 with comparison table (VyaparSethu vs IndiaMART vs TradeIndia).',
    contentBrief: 'H1: Top 5 B2B Portals in India (2026). Include verification, payment protection, lead quality. CTA to /how-it-works.',
  },
  {
    id: 'content-cosmetic-raw',
    type: 'new_content',
    priority: 'medium',
    title: 'Rank for "cosmetic raw material manufacturers in india"',
    description: 'Category long-tail — link to /categories/chemicals or new city+category page.',
    suggestedAction: 'Add /suppliers or /categories landing + blog post linking verified cosmetic chemical suppliers.',
    contentBrief: 'Buyer guide: how to source cosmetic raw materials with GST-verified suppliers on VyaparSethu.',
  },
  {
    id: 'content-construction-mumbai',
    type: 'new_content',
    priority: 'medium',
    title: 'Rank for "construction material suppliers in mumbai"',
    description: 'Local + category — vol 260, SD 21. You have city/category SEO infrastructure.',
    suggestedAction: 'Ensure /suppliers/mumbai or /categories/construction-real-estate is indexed; add Mumbai cluster copy.',
    targetUrl: '/suppliers/mumbai',
  },
  {
    id: 'content-b2b-portal',
    type: 'new_content',
    priority: 'high',
    title: 'Rank for "b2b portal in india"',
    description: 'Vol 720, SD 30 — core commercial keyword.',
    suggestedAction: 'Optimize homepage H1/meta + dedicated /blog or /learn page targeting "B2B portal India".',
  },
  {
    id: 'content-b2b-marketplace',
    type: 'new_content',
    priority: 'high',
    title: 'Rank for "b2b marketplace india"',
    description: 'Vol 1,000, SD 35 — highest volume B2B term in tracking set.',
    suggestedAction: 'Homepage already targets this — add backlinks (Crunchbase/G2) + internal links from glossary/tools.',
    targetUrl: '/',
  },
  {
    id: 'content-top-ten-portals',
    type: 'new_content',
    priority: 'medium',
    title: 'Rank for "top ten b2b portals in india"',
    description: 'Variant of comparison query — same article can target top 5/10/ten variants.',
    suggestedAction: 'Merge into single comparison article with FAQ schema for variant keywords.',
  },
  {
    id: 'content-top-10-portal',
    type: 'new_content',
    priority: 'medium',
    title: 'Rank for "top 10 b2b portal india"',
    description: 'SD 27, unstable SERP — comparison content + schema.',
    suggestedAction: 'Same hub article as top 5/ten — use H2 sections for each portal.',
  },
  {
    id: 'content-top-b2b-portal',
    type: 'new_content',
    priority: 'medium',
    title: 'Rank for "top b2b portal in india"',
    description: 'Vol 170 — mid-funnel comparison.',
    suggestedAction: 'Internal link from /how-it-works comparison table to blog post.',
    targetUrl: '/how-it-works',
  },
  {
    id: 'content-best-b2b-portal',
    type: 'new_content',
    priority: 'high',
    title: 'Rank for "best b2b portal in india"',
    description: 'Vol 880, SD 41 — competitive head term.',
    suggestedAction: 'Long-form guide + Founding Suppliers social proof + backlinks before expecting page 1.',
  },
  {
    id: 'content-upholstery-swatch-books',
    type: 'new_content',
    priority: 'medium',
    title: 'Rank for upholstery fabric swatch books',
    description: 'Textile buyer intent for export and interior design leads.',
    suggestedAction: 'Publish /categories/upholstery-fabric-swatch-books with MOQ, sample count, and RFQ CTA.',
    targetUrl: '/categories/upholstery-fabric-swatch-books',
    contentBrief: 'Explain upholstery swatch-book formats, fabric options, export packing, and turnaround time.',
  },
  {
    id: 'content-curtain-swatch-books',
    type: 'new_content',
    priority: 'medium',
    title: 'Rank for curtain fabric swatch books',
    description: 'Targets curtain buyers, interior showrooms, and hospitality procurement.',
    suggestedAction: 'Publish /categories/curtain-fabric-swatch-books with product examples and request-a-quote CTA.',
    targetUrl: '/categories/curtain-fabric-swatch-books',
    contentBrief: 'Cover curtain swatch-book formats, blackout/sheer ranges, and domestic plus export supply.',
  },
  {
    id: 'content-fabric-sample-cards',
    type: 'new_content',
    priority: 'medium',
    title: 'Rank for fabric sample cards',
    description: 'Short-tail lead term for sample-card buyers and textile showrooms.',
    suggestedAction: 'Publish /categories/fabric-sample-cards with sample-card benefits and order CTA.',
    targetUrl: '/categories/fabric-sample-cards',
    contentBrief: 'Focus on compact presentation, color accuracy, and retail/showroom use cases.',
  },
  {
    id: 'content-binding-hardware',
    type: 'new_content',
    priority: 'medium',
    title: 'Rank for sample book fasteners and binding hardware',
    description: 'Supports accessory buyers who make swatch books and sample books.',
    suggestedAction: 'Publish /categories/sample-book-fasteners-binding-hardware with hardware specs and RFQ CTA.',
    targetUrl: '/categories/sample-book-fasteners-binding-hardware',
    contentBrief: 'Explain binding strips, rings, corners, fasteners, rust-resistant finishes, and bulk supply.',
  },
];

/** B2B-relevant keywords only — "vyapar app" noise keywords excluded (wrong brand). */
export const TRACKED_KEYWORDS: TrackedKeyword[] = [
  { id: 'kw-1', keyword: 'b2b marketplace india', volume: 1000, seoDifficulty: 35, position: null, status: 'not_ranked', url: null, category: 'b2b_core' },
  { id: 'kw-2', keyword: 'best b2b portal in india', volume: 880, seoDifficulty: 41, position: null, status: 'unstable', url: null, category: 'b2b_core' },
  { id: 'kw-3', keyword: 'india b2b market', volume: 880, seoDifficulty: 39, position: null, status: 'not_ranked', url: null, category: 'b2b_core' },
  { id: 'kw-4', keyword: 'b2b portal in india', volume: 720, seoDifficulty: 30, position: null, status: 'not_ranked', url: null, category: 'b2b_core' },
  { id: 'kw-5', keyword: 'top 10 b2b portal in india', volume: 210, seoDifficulty: 20, position: null, status: 'unstable', url: null, category: 'b2b_core' },
  { id: 'kw-6', keyword: 'top b2b portal in india', volume: 170, seoDifficulty: 28, position: null, status: 'unstable', url: null, category: 'b2b_core' },
  { id: 'kw-7', keyword: 'top 10 b2b portal india', volume: 170, seoDifficulty: 27, position: null, status: 'unstable', url: null, category: 'b2b_core' },
  { id: 'kw-8', keyword: 'top ten b2b portals in india', volume: 170, seoDifficulty: 27, position: null, status: 'unstable', url: null, category: 'b2b_core' },
  { id: 'kw-9', keyword: 'india largest b2b portal', volume: 170, seoDifficulty: 44, position: null, status: 'unstable', url: null, category: 'b2b_core' },
  { id: 'kw-10', keyword: 'top 5 b2b portal in india', volume: 90, seoDifficulty: 8, position: null, status: 'unstable', url: null, category: 'b2b_core', notes: 'Low SD — priority content target' },
  { id: 'kw-11', keyword: 'best b2b marketplace in india', volume: 90, seoDifficulty: 34, position: null, status: 'not_ranked', url: null, category: 'b2b_core' },
  { id: 'kw-12', keyword: 'online b2b marketplace in india', volume: 110, seoDifficulty: 60, position: null, status: 'not_ranked', url: null, category: 'b2b_core' },
  { id: 'kw-13', keyword: 'b2b procurement platform', volume: 50, seoDifficulty: 35, position: null, status: 'unstable', url: null, category: 'b2b_core' },
  { id: 'kw-14', keyword: 'cosmetic raw material manufacturers in india', volume: 140, seoDifficulty: 16, position: null, status: 'not_ranked', url: null, category: 'category' },
  { id: 'kw-15', keyword: 'construction material suppliers in mumbai', volume: 260, seoDifficulty: 21, position: null, status: 'not_ranked', url: null, category: 'local' },
  { id: 'kw-16', keyword: 'voice rfq', volume: 0, seoDifficulty: 17, position: null, status: 'pending', url: '/voice-rfq', category: 'feature', notes: 'Brand feature — low volume, own the term' },
  { id: 'kw-17', keyword: 'video rfq', volume: 0, seoDifficulty: 14, position: null, status: 'pending', url: '/video-rfq', category: 'feature' },
  { id: 'kw-18', keyword: 'vyaparsethu.com', volume: 0, seoDifficulty: 1, position: null, status: 'pending', url: '/', category: 'brand', notes: 'Brand query — should rank #1 after awareness' },
  { id: 'kw-19', keyword: 'upholstery fabric swatch books india', volume: 20, seoDifficulty: 12, position: null, status: 'not_ranked', url: '/categories/upholstery-fabric-swatch-books', category: 'category', notes: 'Textile swatch-book landing page' },
  { id: 'kw-20', keyword: 'curtain fabric swatch books india', volume: 20, seoDifficulty: 12, position: null, status: 'not_ranked', url: '/categories/curtain-fabric-swatch-books', category: 'category', notes: 'Textile swatch-book landing page' },
  { id: 'kw-21', keyword: 'fabric sample cards india', volume: 20, seoDifficulty: 11, position: null, status: 'not_ranked', url: '/categories/fabric-sample-cards', category: 'category', notes: 'Textile sample-card landing page' },
  { id: 'kw-22', keyword: 'sample book fasteners and binding hardware india', volume: 10, seoDifficulty: 10, position: null, status: 'not_ranked', url: '/categories/sample-book-fasteners-binding-hardware', category: 'category', notes: 'Accessory landing page for sample-book makers' },
  { id: 'kw-23', keyword: 'upholstery swatch book supplier', volume: 10, seoDifficulty: 13, position: null, status: 'not_ranked', url: '/categories/upholstery-fabric-swatch-books', category: 'category' },
  { id: 'kw-24', keyword: 'curtain swatch book supplier', volume: 10, seoDifficulty: 13, position: null, status: 'not_ranked', url: '/categories/curtain-fabric-swatch-books', category: 'category' },
  { id: 'kw-25', keyword: 'fabric sample card supplier', volume: 10, seoDifficulty: 10, position: null, status: 'not_ranked', url: '/categories/fabric-sample-cards', category: 'category' },
  { id: 'kw-26', keyword: 'sample book binding hardware supplier', volume: 10, seoDifficulty: 10, position: null, status: 'not_ranked', url: '/categories/sample-book-fasteners-binding-hardware', category: 'category' },
];

export const RANK_SUMMARY = {
  lastUpdated: '2026-06-22',
  trackingSince: '2026-06-22',
  totalKeywords: TRACKED_KEYWORDS.length,
  movedUp: 0,
  movedDown: 0,
  unchanged: TRACKED_KEYWORDS.length,
  top3: 0,
  top10: 0,
  top100: 0,
  notRanking: TRACKED_KEYWORDS.filter(k => k.position === null).length,
  note: 'New domain — rankings collected manually from GSC + SERP checks. Update positions in this file when you check Google.',
};

export const COMPETITORS = [
  { id: 'indiamart', domain: 'indiamart.com', label: 'IndiaMART' },
  { id: 'tradeindia', domain: 'tradeindia.com', label: 'TradeIndia' },
  { id: 'exporterindia', domain: 'exporterindia.com', label: 'ExportersIndia' },
];

/** High-DA domains that link to IndiaMART (sample) — outreach targets for VyaparSethu profiles/listings. */
export const COMPETITOR_BACKLINK_GAPS: CompetitorBacklinkGap[] = [
  { domain: 'youtube.com', domainAuthority: 100, linksTo: ['indiamart.com'], notes: 'Create @vyaparsethu channel + link in description' },
  { domain: 'linkedin.com', domainAuthority: 99, linksTo: ['indiamart.com'], notes: 'Company page — already have /company/vyaparsethu' },
  { domain: 'github.com', domainAuthority: 96, linksTo: ['indiamart.com'], notes: 'Open-source tools or llms.txt repo' },
  { domain: 'medium.com', domainAuthority: 95, linksTo: ['indiamart.com'], notes: 'Founder story articles with backlink' },
  { domain: 'pinterest.com', domainAuthority: 94, linksTo: ['indiamart.com'], notes: 'Category infographics' },
  { domain: 'scribd.com', domainAuthority: 94, linksTo: ['indiamart.com'], notes: 'B2B procurement guides PDF' },
  { domain: 'slideshare.net', domainAuthority: 94, linksTo: ['indiamart.com'], notes: 'Pitch deck / how-it-works deck' },
  { domain: 'forbes.com', domainAuthority: 94, linksTo: ['indiamart.com'], notes: 'PR long-term — not quick win' },
  { domain: 'crunchbase.com', domainAuthority: 90, linksTo: ['indiamart.com'], notes: 'Priority — use /admin/seo/backlinks' },
  { domain: 'g2.com', domainAuthority: 85, linksTo: ['indiamart.com'], notes: 'Priority — use /admin/seo/backlinks' },
  { domain: 'startupindia.gov.in', domainAuthority: 66, linksTo: ['indiamart.com'], notes: 'DPIIT recognition' },
  { domain: 'justdial.com', domainAuthority: 68, linksTo: ['indiamart.com'], notes: 'Local listing — in directories tracker' },
];

export const TEXTILE_BACKLINK_TARGETS: OutreachTarget[] = [
  {
    name: 'LinkedIn company page',
    url: 'https://www.linkedin.com/',
    use: 'Post textile swatch-book case studies and link back to the category pages.',
  },
  {
    name: 'Pinterest boards',
    url: 'https://www.pinterest.com/',
    use: 'Visual boards for upholstery, curtain, and sample-card collections.',
  },
  {
    name: 'Houzz',
    url: 'https://www.houzz.com/',
    use: 'Interior-design audience for curtain and upholstery sampling content.',
  },
  {
    name: 'Archiproducts',
    url: 'https://www.archiproducts.com/',
    use: 'Architect and specifier discovery for premium fabric sample books.',
  },
  {
    name: 'Medium',
    url: 'https://medium.com/',
    use: 'Founder stories, sourcing guides, and textile procurement explainers.',
  },
  {
    name: 'Scribd',
    url: 'https://www.scribd.com/',
    use: 'Upload fabric line sheets and swatch-book PDFs as reference assets.',
  },
  {
    name: 'Slideshare',
    url: 'https://www.slideshare.net/',
    use: 'Publish procurement decks and exporter pitch materials.',
  },
];

export const FREE_SEO_TOOLS = [
  { name: 'Google Search Console', url: 'https://search.google.com/search-console', use: 'Impressions, indexing, queries' },
  { name: 'PageSpeed Insights', url: 'https://pagespeed.web.dev/', use: 'Lighthouse scores' },
  { name: 'Rich Results Test', url: 'https://search.google.com/test/rich-results', use: 'Schema validation' },
  { name: 'Bing Webmaster', url: 'https://www.bing.com/webmasters', use: 'Secondary index + keywords' },
];
