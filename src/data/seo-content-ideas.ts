/**
 * Competitor content ideas — sourced from manual SERP research (e.g. Ubersuggest export).
 * Seed keyword: "b2b marketplace india" · English / India
 */

export interface ContentIdea {
  id: string;
  seedKeyword: string;
  title: string;
  url: string;
  estVisits: number;
  backlinks: number;
  facebookShares: number;
  pinterestShares: number;
  redditShares: number;
  vyaparsethuAngle?: string;
}

export const CONTENT_IDEA_SEEDS = [
  'b2b marketplace india',
  'best b2b portal in india',
  'top 5 b2b portal in india',
] as const;

export const CONTENT_IDEAS_B2B_MARKETPLACE: ContentIdea[] = [
  {
    id: 'ci-1',
    seedKeyword: 'b2b marketplace india',
    title: 'TIM All Business Categories for B2B Marketplace India',
    url: 'http://www.textileinfomedia.com/all-category',
    estVisits: 1140,
    backlinks: 54,
    facebookShares: 0,
    pinterestShares: 0,
    redditShares: 0,
    vyaparsethuAngle: 'Build /categories hub with all 50+ verticals — mirror category breadth, link to verified suppliers.',
  },
  {
    id: 'ci-2',
    seedKeyword: 'b2b marketplace india',
    title: 'Which is the Best B2B Marketplace India for Bulk Orders?',
    url: 'http://ekanshglobal.com/blog/which-is-the-best-b2b-marketplace-india-for-bulk-orders',
    estVisits: 0,
    backlinks: 0,
    facebookShares: 0,
    pinterestShares: 0,
    redditShares: 0,
    vyaparsethuAngle: 'Publish comparison blog — angle: GST verification + protected payments vs lead-only portals.',
  },
  {
    id: 'ci-3',
    seedKeyword: 'b2b marketplace india',
    title: 'About Toboc B2B Marketplace India Private Limited',
    url: 'http://www.indiamart.com/company/6896963/aboutus.html',
    estVisits: 0,
    backlinks: 0,
    facebookShares: 0,
    pinterestShares: 0,
    redditShares: 0,
    vyaparsethuAngle: 'Company profile pages rank — ensure /about + Crunchbase/G2 profiles are live.',
  },
  {
    id: 'ci-4',
    seedKeyword: 'b2b marketplace india',
    title: 'Tradeindia B2b Marketplace India Suppliers',
    url: 'http://www.instagram.com/popular/tradeindia-b2b-marketplace-india-suppliers/',
    estVisits: 0,
    backlinks: 0,
    facebookShares: 0,
    pinterestShares: 0,
    redditShares: 0,
    vyaparsethuAngle: 'Social proof on Instagram/Reels — supplier success stories with link in bio.',
  },
  {
    id: 'ci-5',
    seedKeyword: 'b2b marketplace india',
    title: 'Top 5 B2B online portals in India | B2B marketplace India',
    url: 'http://www.youtube.com/watch?v=wKcMDTy51L0',
    estVisits: 0,
    backlinks: 0,
    facebookShares: 0,
    pinterestShares: 0,
    redditShares: 0,
    vyaparsethuAngle: 'YouTube comparison video — include VyaparSethu in description + link to /how-it-works.',
  },
  {
    id: 'ci-6',
    seedKeyword: 'b2b marketplace india',
    title: 'B2B Marketplace India | Best B2B Portals in India',
    url: 'http://vyaaparone.com/blogs/b2b-marketplace-india-best-b2b-portals/',
    estVisits: 0,
    backlinks: 0,
    facebookShares: 0,
    pinterestShares: 0,
    redditShares: 0,
    vyaparsethuAngle: 'Direct competitor content — outrank with longer guide + FAQ schema + founding suppliers proof.',
  },
  {
    id: 'ci-7',
    seedKeyword: 'b2b marketplace india',
    title: 'What is a wholesale B2B marketplace India',
    url: 'http://www.storehippo.com/en/topic/wholesale-b2b-marketplace-india',
    estVisits: 0,
    backlinks: 0,
    facebookShares: 0,
    pinterestShares: 0,
    redditShares: 0,
    vyaparsethuAngle: 'Glossary/learn page: "What is a B2B marketplace?" — link from /downloads/b2b-glossary.',
  },
];
