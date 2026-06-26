/** Snapshot SEO cockpit data — update after each Lighthouse run or GSC export. */

export const SITE_CANONICAL = 'https://www.vyaparsethu.com';

export interface LighthouseSnapshot {
  url: string;
  capturedAt: string;
  device: 'desktop' | 'mobile';
  lighthouseVersion: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    agenticBrowsing: string;
  };
  metrics: {
    fcp: string;
    lcp: string;
    tbt: string;
    cls: string;
    speedIndex: string;
  };
  insights: { label: string; detail: string; severity: 'info' | 'warn' | 'pass' }[];
  passedAudits: number;
  cruxRealUsers: string;
}

export interface GscQuery {
  query: string;
  impressions: number;
  clicks: number;
  position: number;
  likelyPages: string[];
}

export interface IndexingStatus {
  path: string;
  label: string;
  status: 'indexed' | 'requested' | 'pending' | 'video-only';
  lastCrawl: string | null;
  notes: string;
}

export interface SeoPageEntry {
  path: string;
  label: string;
  category: 'trust' | 'tool' | 'glossary' | 'blog' | 'core';
  inSitemap: boolean;
  hasMetadata: boolean;
  hasBreadcrumbs: boolean;
  headerLinked: boolean;
  footerLinked: boolean;
}

export interface SeoChecklistItem {
  id: string;
  task: string;
  owner: 'code' | 'manual' | 'content';
  status: 'done' | 'pending' | 'optional';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export const LIGHTHOUSE_DESKTOP: LighthouseSnapshot = {
  url: `${SITE_CANONICAL}/`,
  capturedAt: '2026-06-26T14:20:00+05:30',
  device: 'desktop',
  lighthouseVersion: '13.4.0',
  scores: {
    performance: 100,
    accessibility: 100,
    bestPractices: 100,
    seo: 100,
    agenticBrowsing: '3/3',
  },
  metrics: {
    fcp: '0.3 s',
    lcp: '0.4 s',
    tbt: '0 ms',
    cls: '0',
    speedIndex: '0.5 s',
  },
  insights: [
    { label: 'Network dependency tree', detail: 'Critical path ~1.9s; CSS chunk on critical path.', severity: 'info' },
    { label: 'Render-blocking requests', detail: 'Main CSS bundle blocks first paint.', severity: 'info' },
    { label: 'Legacy JavaScript', detail: '~12 KiB polyfills (Array.at, flat, Object.hasOwn).', severity: 'info' },
    { label: 'Optimize DOM size', detail: '812 elements; category sidebar contributes most children.', severity: 'warn' },
    { label: 'LCP breakdown', detail: 'H1 hero text; element render delay noted on non-www tests.', severity: 'info' },
    { label: 'Reduce unused CSS', detail: '~14 KiB unused Tailwind rules.', severity: 'info' },
    { label: 'brand-video.mp4 payload', detail: '~1 MB — largest asset; autoplay loads on scroll.', severity: 'warn' },
    { label: 'Document redirect (non-www)', detail: 'vyaparsethu.com → www adds ~289ms; always test canonical URL.', severity: 'warn' },
  ],
  passedAudits: 20,
  cruxRealUsers: 'No Data',
};

export const LIGHTHOUSE_MOBILE_PRIOR: LighthouseSnapshot = {
  url: `${SITE_CANONICAL}/`,
  capturedAt: '2026-06-26T14:09:00+05:30',
  device: 'mobile',
  lighthouseVersion: '13.4.0',
  scores: {
    performance: 98,
    accessibility: 100,
    bestPractices: 100,
    seo: 100,
    agenticBrowsing: '3/3',
  },
  metrics: {
    fcp: '0.5 s',
    lcp: '0.6 s',
    tbt: '0 ms',
    cls: '0',
    speedIndex: '1.5 s',
  },
  insights: [
    { label: 'Had redirects', detail: '+289 ms from apex domain redirect.', severity: 'warn' },
    { label: 'brand-video.mp4', detail: '1,067 KiB network payload.', severity: 'warn' },
    { label: 'DOM size', detail: '812 total elements.', severity: 'info' },
  ],
  passedAudits: 20,
  cruxRealUsers: 'No Data',
};

export const GSC_PERFORMANCE = {
  period: 'Last 3 months',
  lastUpdate: '2026-06-26',
  totals: {
    clicks: 0,
    impressions: 8,
    ctr: '0%',
    avgPosition: 69.4,
  },
  queries: [
    { query: 'tax invoice under gst', impressions: 2, clicks: 0, position: 69, likelyPages: ['/glossary/gst-invoice', '/blog/gst-compliance-b2b-buyers'] },
    { query: 'supplier search', impressions: 1, clicks: 0, position: 69, likelyPages: ['/suppliers', '/marketplace'] },
    { query: 'what is invoice value in gst', impressions: 1, clicks: 0, position: 69, likelyPages: ['/tools/gst-calculator'] },
    { query: 'trade credit', impressions: 1, clicks: 0, position: 69, likelyPages: ['/glossary/trade-credit', '/blog/msme-trade-credit-india'] },
    { query: 'gst invoice', impressions: 1, clicks: 0, position: 69, likelyPages: ['/glossary/gst-invoice', '/tools/gst-calculator'] },
  ] satisfies GscQuery[],
};

export const INDEXING_STATUS: IndexingStatus[] = [
  { path: '/', label: 'Homepage', status: 'indexed', lastCrawl: '2026-06-23', notes: 'Video detected but not in video index (supplementary content — expected).' },
  { path: '/founding-suppliers', label: 'Founding Suppliers', status: 'indexed', lastCrawl: '2026-06-23', notes: 'On Google; discovered via sitemap + /how-it-works.' },
  { path: '/how-it-works', label: 'How It Works', status: 'indexed', lastCrawl: '2026-06-26', notes: 'BreadcrumbList valid (Home → How It Works).' },
  { path: '/how-payment-works', label: 'Payment Protection', status: 'requested', lastCrawl: null, notes: 'In sitemap; request indexing in GSC.' },
  { path: '/how-verification-works', label: 'Supplier Verification', status: 'requested', lastCrawl: null, notes: 'In sitemap; request indexing in GSC.' },
  { path: '/glossary', label: 'Glossary hub', status: 'indexed', lastCrawl: '2026-06-23', notes: 'Driving GST/trade credit impressions.' },
  { path: '/tools/gst-calculator', label: 'GST Calculator', status: 'pending', lastCrawl: null, notes: 'Missing dedicated metadata — optimize next.' },
];

export const TRUST_PAGES: SeoPageEntry[] = [
  { path: '/how-it-works', label: 'How It Works', category: 'trust', inSitemap: true, hasMetadata: true, hasBreadcrumbs: true, headerLinked: true, footerLinked: true },
  { path: '/how-payment-works', label: 'Payment Protection', category: 'trust', inSitemap: true, hasMetadata: true, hasBreadcrumbs: true, headerLinked: false, footerLinked: true },
  { path: '/how-verification-works', label: 'Supplier Verification', category: 'trust', inSitemap: true, hasMetadata: true, hasBreadcrumbs: true, headerLinked: false, footerLinked: true },
  { path: '/founding-suppliers', label: 'Founding Suppliers', category: 'trust', inSitemap: true, hasMetadata: true, hasBreadcrumbs: true, headerLinked: true, footerLinked: true },
];

export const TOOL_PAGES: SeoPageEntry[] = [
  { path: '/tools', label: 'Tools Hub', category: 'tool', inSitemap: true, hasMetadata: true, hasBreadcrumbs: false, headerLinked: false, footerLinked: false },
  { path: '/tools/gst-calculator', label: 'GST Calculator', category: 'tool', inSitemap: true, hasMetadata: false, hasBreadcrumbs: false, headerLinked: false, footerLinked: false },
  { path: '/tools/hsn-lookup', label: 'HSN Lookup', category: 'tool', inSitemap: true, hasMetadata: false, hasBreadcrumbs: false, headerLinked: false, footerLinked: false },
  { path: '/tools/packaging-calculator', label: 'Packaging Calculator', category: 'tool', inSitemap: true, hasMetadata: false, hasBreadcrumbs: false, headerLinked: false, footerLinked: false },
];

export const SEO_CHECKLIST: SeoChecklistItem[] = [
  { id: 'lh-100', task: 'Lighthouse 100/100/100/100 on www homepage', owner: 'code', status: 'done', priority: 'high' },
  { id: 'contrast', task: 'Comparison table contrast fix', owner: 'code', status: 'done', priority: 'high' },
  { id: 'nav-links', task: 'Header/footer benefit-page internal links', owner: 'code', status: 'done', priority: 'high' },
  { id: 'fb-meta', task: 'Facebook domain verification meta tag', owner: 'code', status: 'done', priority: 'medium' },
  { id: 'gsc-payment', task: 'GSC request indexing: /how-payment-works', owner: 'manual', status: 'pending', priority: 'high' },
  { id: 'gsc-verification', task: 'GSC request indexing: /how-verification-works', owner: 'manual', status: 'pending', priority: 'high' },
  { id: 'crunchbase', task: 'Crunchbase organization listing', owner: 'manual', status: 'pending', priority: 'high', notes: 'Copy at /admin/directories/submit' },
  { id: 'g2', task: 'G2 product profile', owner: 'manual', status: 'pending', priority: 'high' },
  { id: 'startup-india', task: 'Startup India DPIIT registration', owner: 'manual', status: 'pending', priority: 'high' },
  { id: 'gst-calc-seo', task: 'GST Calculator metadata + FAQ schema', owner: 'code', status: 'pending', priority: 'medium' },
  { id: 'glossary-xlink', task: 'Cross-link glossary ↔ tools ↔ trust pages', owner: 'code', status: 'pending', priority: 'medium' },
  { id: 'video-lazy', task: 'Lazy-load brand-video.mp4 on homepage', owner: 'code', status: 'optional', priority: 'low' },
  { id: 'gsc-api', task: 'Live GSC API integration in admin', owner: 'code', status: 'optional', priority: 'low', notes: 'Defer until >100 impressions/month' },
];

export const EXTERNAL_LINKS = {
  pagespeed: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(SITE_CANONICAL)}`,
  searchConsole: 'https://search.google.com/search-console?resource_id=sc-domain%3Avyaparsethu.com',
  richResults: `https://search.google.com/test/rich-results?url=${encodeURIComponent(SITE_CANONICAL)}`,
  sitemap: `${SITE_CANONICAL}/sitemap.xml`,
  robots: `${SITE_CANONICAL}/robots.txt`,
  llmsTxt: `${SITE_CANONICAL}/llms.txt`,
};
