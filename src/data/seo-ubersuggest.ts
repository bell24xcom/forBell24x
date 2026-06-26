/** Ubersuggest snapshot — update after each export (Jun 22–26, 2026). */

export type OpportunityType = 'seo_issue' | 'new_content';
export type OpportunityStatus = 'open' | 'in_progress' | 'done' | 'skipped';
export type KeywordTier = 'b2b_target' | 'category_local' | 'brand' | 'product' | 'irrelevant';
export type RankStatus = 'not_ranked' | 'unstable' | 'pending' | 'ranked';

export interface SeoOpportunity {
  id: string;
  priority: number;
  type: OpportunityType;
  title: string;
  description: string;
  keyword?: string;
  suggestedPage?: string;
  volume?: number;
  difficulty?: number;
}

export interface TrackedKeyword {
  keyword: string;
  tier: KeywordTier;
  volume: number;
  difficulty: number;
  position: string;
  status: RankStatus;
  url: string | null;
  notes?: string;
}

export const UBERSUGGEST_META = {
  domain: 'vyaparsethu.com',
  projectStarted: '2026-06-22',
  lastUpdated: '2026-06-22',
  nextUpdate: '2026-06-29',
  trackedCount: 51,
  trackedLimit: 125,
  competitors: ['indiamart.com', 'exporterindia.com'],
  source: 'Ubersuggest',
};

export const RANK_SUMMARY = {
  movedUp: 0,
  movedDown: 0,
  unchanged: 51,
  top3: 0,
  top10: 0,
  top100: 0,
  notRanking: 51,
  avgPosition: null as number | null,
  dataNote: 'Project started Jun 22, 2026. Rankings still collecting — check back after Jun 29.',
};

export const SEO_OPPORTUNITIES: SeoOpportunity[] = [
  {
    id: 'broken-links',
    priority: 1,
    type: 'seo_issue',
    title: '7 pages with broken links',
    description: 'Fix internal or external broken links reported by Ubersuggest site audit.',
    suggestedPage: '/admin/seo/opportunities',
  },
  {
    id: 'content-top-5-b2b',
    priority: 2,
    type: 'new_content',
    title: 'Top 5 B2B portals in India',
    description: 'Comparison article: VyaparSethu vs IndiaMART, TradeIndia, ExportersIndia — honest feature table.',
    keyword: 'top 5 b2b portal in india',
    suggestedPage: '/blog/top-5-b2b-portals-india',
    volume: 90,
    difficulty: 8,
  },
  {
    id: 'content-cosmetic-raw',
    priority: 3,
    type: 'new_content',
    title: 'Cosmetic raw material manufacturers India',
    description: 'Category landing or supplier guide — link to /categories/chemicals or new city+category page.',
    keyword: 'cosmetic raw material manufacturers in india',
    suggestedPage: '/categories/chemicals',
    volume: 140,
    difficulty: 16,
  },
  {
    id: 'content-construction-mumbai',
    priority: 4,
    type: 'new_content',
    title: 'Construction material suppliers Mumbai',
    description: 'Local SEO page — Mumbai/Bhiwandi cluster suppliers + RFQ CTA.',
    keyword: 'construction material suppliers in mumbai',
    suggestedPage: '/suppliers/mumbai',
    volume: 260,
    difficulty: 21,
  },
  {
    id: 'content-b2b-portal',
    priority: 5,
    type: 'new_content',
    title: 'B2B portal in India',
    description: 'Pillar page explaining verified B2B portals — link to /how-it-works and comparison table.',
    keyword: 'b2b portal in india',
    suggestedPage: '/how-it-works',
    volume: 720,
    difficulty: 30,
  },
  {
    id: 'content-b2b-marketplace',
    priority: 6,
    type: 'new_content',
    title: 'B2B marketplace India',
    description: 'Homepage + blog reinforcement. Highest volume target keyword (1,000/mo).',
    keyword: 'b2b marketplace india',
    suggestedPage: '/',
    volume: 1000,
    difficulty: 35,
  },
  {
    id: 'content-top-ten-b2b',
    priority: 7,
    type: 'new_content',
    title: 'Top ten B2B portals in India',
    description: 'Variant of top-5 list for long-tail capture.',
    keyword: 'top ten b2b portals in india',
    suggestedPage: '/blog/top-5-b2b-portals-india',
    volume: 170,
    difficulty: 27,
  },
  {
    id: 'content-top-10-b2b',
    priority: 8,
    type: 'new_content',
    title: 'Top 10 B2B portal India',
    description: 'Same cluster — single canonical blog post with H2 variants.',
    keyword: 'top 10 b2b portal india',
    suggestedPage: '/blog/top-5-b2b-portals-india',
    volume: 170,
    difficulty: 27,
  },
  {
    id: 'content-top-b2b',
    priority: 9,
    type: 'new_content',
    title: 'Top B2B portal in India',
    description: 'Comparison + trust signals (GST verification, protected payments).',
    keyword: 'top b2b portal in india',
    suggestedPage: '/blog/top-5-b2b-portals-india',
    volume: 170,
    difficulty: 28,
  },
  {
    id: 'content-best-b2b',
    priority: 10,
    type: 'new_content',
    title: 'Best B2B portal in India',
    description: 'High volume (880/mo). Needs backlinks (Crunchbase/G2) before ranking.',
    keyword: 'best b2b portal in india',
    suggestedPage: '/blog/top-5-b2b-portals-india',
    volume: 880,
    difficulty: 41,
  },
];

/** B2B + product keywords — full Ubersuggest export subset (51 total includes vyapar-app noise). */
export const TRACKED_KEYWORDS: TrackedKeyword[] = [
  // ── B2B targets (priority) ──
  { keyword: 'b2b marketplace india', tier: 'b2b_target', volume: 1000, difficulty: 35, position: '—', status: 'not_ranked', url: null },
  { keyword: 'best b2b portal in india', tier: 'b2b_target', volume: 880, difficulty: 41, position: '—', status: 'unstable', url: null },
  { keyword: 'india b2b market', tier: 'b2b_target', volume: 880, difficulty: 39, position: '—', status: 'not_ranked', url: null },
  { keyword: 'b2b portal in india', tier: 'b2b_target', volume: 720, difficulty: 30, position: '—', status: 'not_ranked', url: null },
  { keyword: 'top 10 b2b portal in india', tier: 'b2b_target', volume: 210, difficulty: 20, position: '—', status: 'unstable', url: null },
  { keyword: 'top b2b portal in india', tier: 'b2b_target', volume: 170, difficulty: 28, position: '—', status: 'unstable', url: null },
  { keyword: 'top 10 b2b portal india', tier: 'b2b_target', volume: 170, difficulty: 27, position: '—', status: 'unstable', url: null },
  { keyword: 'india largest b2b portal', tier: 'b2b_target', volume: 170, difficulty: 44, position: '—', status: 'unstable', url: null },
  { keyword: 'top ten b2b portals in india', tier: 'b2b_target', volume: 170, difficulty: 27, position: '—', status: 'unstable', url: null },
  { keyword: 'top 5 b2b portal in india', tier: 'b2b_target', volume: 90, difficulty: 8, position: '—', status: 'unstable', url: null, notes: 'Low difficulty — write comparison post first' },
  { keyword: 'best b2b marketplace in india', tier: 'b2b_target', volume: 90, difficulty: 34, position: '—', status: 'not_ranked', url: null },
  { keyword: 'online b2b marketplace in india', tier: 'b2b_target', volume: 110, difficulty: 60, position: '—', status: 'not_ranked', url: null },
  { keyword: 'b2b procurement platform', tier: 'b2b_target', volume: 50, difficulty: 35, position: '—', status: 'unstable', url: null },
  // ── Category / local ──
  { keyword: 'construction material suppliers in mumbai', tier: 'category_local', volume: 260, difficulty: 21, position: '—', status: 'not_ranked', url: null, notes: 'Build /suppliers/mumbai or category page' },
  { keyword: 'cosmetic raw material manufacturers in india', tier: 'category_local', volume: 140, difficulty: 16, position: '—', status: 'not_ranked', url: null },
  // ── Brand + product ──
  { keyword: 'vyaparsethu.com', tier: 'brand', volume: 0, difficulty: 1, position: '—', status: 'pending', url: null, notes: 'Brand term — should rank #1 after backlinks' },
  { keyword: 'voice rfq', tier: 'product', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null, notes: 'Link /voice-rfq' },
  { keyword: 'video rfq', tier: 'product', volume: 0, difficulty: 14, position: '—', status: 'pending', url: null, notes: 'Link /video-rfq' },
  // ── Irrelevant (Vyapar accounting app — consider removing from tracker) ──
  { keyword: 'vyapar server', tier: 'irrelevant', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null, notes: 'Vyapar accounting app — not VyaparSethu' },
  { keyword: 'vyapar 7.2 2 download', tier: 'irrelevant', volume: 0, difficulty: 4, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 8.6 2 download', tier: 'irrelevant', volume: 10, difficulty: 5, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar reseller login', tier: 'irrelevant', volume: 0, difficulty: 12, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar quotation', tier: 'irrelevant', volume: 110, difficulty: 27, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar quotation maker', tier: 'irrelevant', volume: 30, difficulty: 22, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar hub', tier: 'irrelevant', volume: 40, difficulty: 21, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 2022', tier: 'irrelevant', volume: 10, difficulty: 18, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 2.0', tier: 'irrelevant', volume: 10, difficulty: 18, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 2023', tier: 'irrelevant', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar setup', tier: 'irrelevant', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 7.3 2 download', tier: 'irrelevant', volume: 10, difficulty: 5, position: '—', status: 'pending', url: null },
  { keyword: 'vyaparsathi', tier: 'irrelevant', volume: 50, difficulty: 31, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar quotation online', tier: 'irrelevant', volume: 0, difficulty: 12, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 9.5 2', tier: 'irrelevant', volume: 0, difficulty: 12, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar seekho', tier: 'irrelevant', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar seva kendra com', tier: 'irrelevant', volume: 0, difficulty: 4, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 9', tier: 'irrelevant', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null },
  { keyword: 'vyaparotsav', tier: 'irrelevant', volume: 0, difficulty: 30, position: '—', status: 'pending', url: null },
  { keyword: 'vyaparotsav 2023', tier: 'irrelevant', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar reseller', tier: 'irrelevant', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 4.7', tier: 'irrelevant', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 7.3 2 download free', tier: 'irrelevant', volume: 0, difficulty: 4, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 7.3 1 download', tier: 'irrelevant', volume: 10, difficulty: 14, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 16', tier: 'irrelevant', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null },
  { keyword: 'vyaparyug com', tier: 'irrelevant', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 360', tier: 'irrelevant', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 168', tier: 'irrelevant', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 169', tier: 'irrelevant', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 167', tier: 'irrelevant', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 365', tier: 'irrelevant', volume: 0, difficulty: 17, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar 9.9 24', tier: 'irrelevant', volume: 0, difficulty: 12, position: '—', status: 'pending', url: null },
  { keyword: 'vyapar free quotation', tier: 'irrelevant', volume: 0, difficulty: 12, position: '—', status: 'pending', url: null },
];

export const COMPETITOR_BACKLINKS = [
  { domain: 'youtube.com', da: 100, competitors: ['indiamart.com'] },
  { domain: 'apple.com', da: 99, competitors: ['indiamart.com'] },
  { domain: 'microsoft.com', da: 98, competitors: ['indiamart.com'] },
  { domain: 'docs.google.com', da: 98, competitors: ['indiamart.com'] },
  { domain: 'en.wikipedia.org', da: 97, competitors: ['indiamart.com'] },
  { domain: 'github.com', da: 96, competitors: ['indiamart.com'] },
  { domain: 'shopify.com', da: 95, competitors: ['indiamart.com'] },
  { domain: 'medium.com', da: 95, competitors: ['indiamart.com'] },
  { domain: 'forbes.com', da: 94, competitors: ['indiamart.com'] },
  { domain: 'linkedin.com', da: 98, competitors: ['indiamart.com', 'exporterindia.com'] },
  { domain: 'crunchbase.com', da: 90, competitors: ['indiamart.com'] },
  { domain: 'g2.com', da: 85, competitors: ['indiamart.com'] },
];

export const TIER_LABELS: Record<KeywordTier, string> = {
  b2b_target: 'B2B target',
  category_local: 'Category / local',
  brand: 'Brand',
  product: 'Product feature',
  irrelevant: 'Irrelevant (Vyapar app)',
};
