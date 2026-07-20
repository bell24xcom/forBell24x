/**
 * Internal-linking recommendations. Rule-based against real page records
 * (category slugs, RFQ rows, supplier user IDs) — the caller supplies the
 * candidate pool; nothing here invents URLs or copy about pages that don't
 * exist.
 */

export type PageType = 'category' | 'requirement' | 'supplier' | 'landing';

export interface LinkablePage {
  url: string;
  title: string;
  type: PageType;
  category?: string;
  location?: string;
}

export interface LinkRecommendation {
  targetUrl: string;
  targetTitle: string;
  anchorText: string;
  reason: string;
  relevanceScore: number;
  placement: 'content' | 'footer' | 'sidebar' | 'cta';
}

function relevanceScore(source: LinkablePage, target: LinkablePage): number {
  if (source.url === target.url) return 0;
  let score = 0;
  if (source.category && target.category && source.category === target.category) score += 50;
  if (source.location && target.location && source.location === target.location) score += 20;
  if (source.type === target.type) score += 10;
  return score;
}

function anchorTextFor(target: LinkablePage, context: 'related' | 'cta'): string {
  if (context === 'cta') {
    if (target.type === 'requirement') return 'Post a similar Requirement';
    if (target.type === 'supplier') return `Get quotations from ${target.title}`;
    return `Explore ${target.title}`;
  }
  if (target.type === 'category') return `Browse ${target.title} suppliers`;
  if (target.type === 'requirement') return `View: ${target.title}`;
  if (target.type === 'supplier') return `View ${target.title}'s profile`;
  return target.title;
}

/** Recommends 5-8 internal links for `source`, ranked by relevance. */
export function recommendLinks(source: LinkablePage, candidates: LinkablePage[]): LinkRecommendation[] {
  const scored = candidates
    .filter((c) => c.url !== source.url)
    .map((target) => ({ target, score: relevanceScore(source, target) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const recommendations: LinkRecommendation[] = scored.slice(0, 7).map(({ target, score }) => ({
    targetUrl: target.url,
    targetTitle: target.title,
    anchorText: anchorTextFor(target, 'related'),
    reason:
      target.category === source.category
        ? `Same category (${target.category}).`
        : target.location === source.location
        ? `Same location (${target.location}).`
        : `Same page type (${target.type}).`,
    relevanceScore: score,
    placement: 'content',
  }));

  // Every source page type gets one CTA link, matching this codebase's
  // Word System — never "click here", always a Requirement/Quotation verb.
  if (source.type === 'category') {
    recommendations.push({
      targetUrl: '/rfq/create',
      targetTitle: 'Post a Requirement',
      anchorText: 'Post your requirement in this category',
      reason: 'Category pages should route buyers toward posting a requirement.',
      relevanceScore: 100,
      placement: 'cta',
    });
  }

  return recommendations;
}
