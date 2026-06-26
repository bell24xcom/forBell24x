'use client';

import { useEffect, useState } from 'react';
import SeoRankComparisonPanel from './SeoRankComparisonPanel';
import type { EntityKeywordRank } from '@/lib/seo-category-keywords';

interface ProductRankLoaderProps {
  products: { name: string; category?: string }[];
}

export function ProductSeoRankLoader({ products }: ProductRankLoaderProps) {
  const [ranks, setRanks] = useState<EntityKeywordRank[]>([]);

  useEffect(() => {
    if (!products.length) return;
    Promise.all(
      products.slice(0, 3).map(p => {
        const params = new URLSearchParams({ type: 'product', product: p.name });
        if (p.category) params.set('categoryName', p.category);
        return fetch(`/api/seo/ranks?${params}`).then(r => r.json());
      }),
    )
      .then(results => {
        const merged = results.flatMap(d => d.ranks ?? []);
        if (merged.length) setRanks(merged);
      })
      .catch(() => {});
  }, [products]);

  if (!ranks.length) return null;

  return (
    <SeoRankComparisonPanel ranks={ranks} title="Product SEO vs competitors" compact adminLink />
  );
}
