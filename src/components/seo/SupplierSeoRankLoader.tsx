'use client';

import { useEffect, useState } from 'react';
import SeoRankComparisonPanel from './SeoRankComparisonPanel';
import type { EntityKeywordRank } from '@/lib/seo-category-keywords';

interface SupplierRankLoaderProps {
  categories: string[];
  companyName?: string;
}

export function SupplierSeoRankLoader({ categories, companyName }: SupplierRankLoaderProps) {
  const [ranks, setRanks] = useState<EntityKeywordRank[]>([]);

  useEffect(() => {
    if (!categories.length && !companyName) return;
    const params = new URLSearchParams({
      type: 'supplier',
      categories: categories.join('|'),
    });
    if (companyName) params.set('company', companyName);
    fetch(`/api/seo/ranks?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.ranks) setRanks(d.ranks);
      })
      .catch(() => {});
  }, [categories, companyName]);

  if (!ranks.length) return null;

  return (
    <SeoRankComparisonPanel
      ranks={ranks}
      title="Category SEO vs competitors"
      compact
      adminLink
    />
  );
}
