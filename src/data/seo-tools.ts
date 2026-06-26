/**
 * Free SEO & analytics tools — deep links from VyaparSethu admin.
 * GA4 events fire when NEXT_PUBLIC_GA_ID is set (see lib/seo-analytics.ts).
 */

export type SeoToolCategory = 'search' | 'analytics' | 'technical' | 'ai' | 'directories' | 'content';

export interface SeoTool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: SeoToolCategory;
  /** Pre-filled deep link for vyaparsethu.com where supported */
  siteDeepLink?: (path?: string) => string;
  gaEventName?: string;
  free: boolean;
}

const SITE = 'https://www.vyaparsethu.com';
const GSC_PROPERTY = 'sc-domain:vyaparsethu.com';

export const SEO_TOOLS: SeoTool[] = [
  {
    id: 'gsc',
    name: 'Google Search Console',
    description: 'Impressions, clicks, indexing, query data — primary rank source.',
    url: 'https://search.google.com/search-console',
    category: 'search',
    siteDeepLink: (path = '/') =>
      `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(GSC_PROPERTY)}&id=${encodeURIComponent(SITE + path)}`,
    gaEventName: 'seo_tool_gsc',
    free: true,
  },
  {
    id: 'ga4',
    name: 'Google Analytics 4',
    description: 'Traffic, conversions, landing pages — set NEXT_PUBLIC_GA_ID in Vercel.',
    url: 'https://analytics.google.com/',
    category: 'analytics',
    gaEventName: 'seo_tool_ga4',
    free: true,
  },
  {
    id: 'pagespeed',
    name: 'PageSpeed Insights',
    description: 'Lighthouse performance, SEO, accessibility scores.',
    url: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(SITE)}`,
    category: 'technical',
    gaEventName: 'seo_tool_pagespeed',
    free: true,
  },
  {
    id: 'rich-results',
    name: 'Rich Results Test',
    description: 'Validate FAQ, breadcrumb, and ItemList schema on live URLs.',
    url: `https://search.google.com/test/rich-results?url=${encodeURIComponent(SITE)}`,
    category: 'technical',
    siteDeepLink: (path = '/') =>
      `https://search.google.com/test/rich-results?url=${encodeURIComponent(SITE + path)}`,
    free: true,
  },
  {
    id: 'bing',
    name: 'Bing Webmaster Tools',
    description: 'Secondary index, keyword research, URL submission.',
    url: 'https://www.bing.com/webmasters',
    category: 'search',
    free: true,
  },
  {
    id: 'indexnow',
    name: 'IndexNow (Bing/Yandex)',
    description: 'Instant URL ping after publishing new category/supplier pages.',
    url: 'https://www.indexnow.org/',
    category: 'search',
    free: true,
  },
  {
    id: 'schema-validator',
    name: 'Schema Markup Validator',
    description: 'Check JSON-LD on supplier and category pages.',
    url: 'https://validator.schema.org/',
    category: 'technical',
    siteDeepLink: (path = '/') => `https://validator.schema.org/#url=${encodeURIComponent(SITE + path)}`,
    free: true,
  },
  {
    id: 'mobile-friendly',
    name: 'Mobile-Friendly Test',
    description: 'Google mobile usability check.',
    url: `https://search.google.com/test/mobile-friendly?url=${encodeURIComponent(SITE)}`,
    category: 'technical',
    free: true,
  },
  {
    id: 'crunchbase',
    name: 'Crunchbase',
    description: 'High-DA company profile backlink — use admin submit guide.',
    url: 'https://www.crunchbase.com/',
    category: 'directories',
    free: true,
  },
  {
    id: 'g2',
    name: 'G2',
    description: 'B2B software directory listing + reviews.',
    url: 'https://www.g2.com/',
    category: 'directories',
    free: true,
  },
  {
    id: 'startup-india',
    name: 'Startup India',
    description: 'DPIIT recognition and government directory.',
    url: 'https://www.startupindia.gov.in/',
    category: 'directories',
    free: true,
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT (manual AI visibility check)',
    description: 'Paste prompts from AI Visibility tab — check if VyaparSethu is cited.',
    url: 'https://chat.openai.com/',
    category: 'ai',
    free: true,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Same prompts — compare AI answers vs competitors.',
    url: 'https://gemini.google.com/',
    category: 'ai',
    free: true,
  },
  {
    id: 'screaming-frog',
    name: 'Screaming Frog (free 500 URLs)',
    description: 'Crawl for broken links — feeds Opportunities list.',
    url: 'https://www.screamingfrog.co.uk/seo-spider/',
    category: 'technical',
    free: true,
  },
  {
    id: 'looker-studio',
    name: 'Looker Studio (GSC connector)',
    description: 'Free dashboards — connect GSC + GA4 for weekly SEO reports.',
    url: 'https://lookerstudio.google.com/',
    category: 'analytics',
    free: true,
  },
];

export const SEO_TOOL_CATEGORIES: { id: SeoToolCategory; label: string }[] = [
  { id: 'search', label: 'Search & Indexing' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'technical', label: 'Technical SEO' },
  { id: 'ai', label: 'AI Visibility' },
  { id: 'directories', label: 'Directories & Backlinks' },
  { id: 'content', label: 'Content' },
];
