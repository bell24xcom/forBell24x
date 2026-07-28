'use client';

import { useEffect, useState } from 'react';
import SeoRankComparisonPanel from './SeoRankComparisonPanel';
import type { EntityKeywordRank } from '@/src/lib/seo-category-keywords';

interface Props {
  categorySlug: string;
  title?: string;
  pagePath?: string;
}

/**
 * Client loader for the city×category SEO benchmark panel.
 * Fetches /api/seo/ranks, which is admin-gated — anonymous/non-admin callers
 * get an empty set, so this renders nothing for the public. This keeps the
 * city+category page statically generated while gating the internal SEO
 * tooling (competitor SERP data, GSC/GA4 links) to admins only.
 */
export function CityCategorySeoRankLoader({ categorySlug, title, pagePath }: Props) {
  const [ranks, setRanks] = useState<EntityKeywordRank[]>([]);

  useEffect(() => {
    if (!categorySlug) return;
    fetch(`/api/seo/ranks?type=city-category&slug=${encodeURIComponent(categorySlug)}`)
      .then(r => r.json())
      .then(d => {
        if (d.rank) setRanks([d.rank]);
        else if (Array.isArray(d.ranks)) setRanks(d.ranks);
      })
      .catch(() => {});
  }, [categorySlug]);

  if (!ranks.length) return null;

  return (
    <div className="mb-10">
      <SeoRankComparisonPanel ranks={ranks} title={title} pagePath={pagePath} adminLink />
    </div>
  );
}
