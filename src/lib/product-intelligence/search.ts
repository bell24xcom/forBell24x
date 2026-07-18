/**
 * Product Intelligence search — lightweight in-memory filter (no external LLM).
 */

import { listProducts } from './engine';
import type { ProductIntelligenceView } from './types';

export async function searchProducts(query: string, limit = 20): Promise<ProductIntelligenceView[]> {
  const q = query.trim().toLowerCase();
  const all = await listProducts();
  if (!q) return all.slice(0, limit);

  return all
    .filter(p => {
      const hay = [
        p.name,
        p.family,
        p.category,
        p.subcategory,
        p.description,
        ...(p.commercial.hsCode ? [p.commercial.hsCode] : []),
        ...(p.seo.keywords ?? []),
        ...(p.manufacturing.rawMaterials ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q) || q.split(/\s+/).every(w => hay.includes(w));
    })
    .slice(0, limit);
}

export async function productsByCategory(category: string): Promise<ProductIntelligenceView[]> {
  const c = category.toLowerCase();
  const all = await listProducts();
  return all.filter(p => p.category.toLowerCase().includes(c));
}

export async function productsByCluster(clusterSlug: string): Promise<ProductIntelligenceView[]> {
  const all = await listProducts();
  return all.filter(p => p.businessIntel.relatedClusterSlugs?.includes(clusterSlug));
}
