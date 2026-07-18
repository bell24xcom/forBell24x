/**
 * Product Intelligence graph — nodes/edges for admin visualization.
 */

import { getProductRecord, getProductRecords } from '@/src/data/product-intelligence-catalog';
import { getIndustryRecords } from '@/src/data/industry-intelligence-catalog';
import { getClusterRecord } from '@/src/data/industrial-clusters';
import { scoreProductIntelligence } from './score';
import type { ProductGraphData, ProductGraphEdge, ProductGraphNode } from './types';

const COLORS = {
  product: '#D4AF37',
  category: '#6366f1',
  industry: '#10b981',
  cluster: '#06b6d4',
  market: '#f97316',
  material: '#a855f7',
  machine: '#64748b',
};

export async function buildProductGraph(slug: string): Promise<ProductGraphData | null> {
  const record = await getProductRecord(slug);
  if (!record) return null;

  const nodes: ProductGraphNode[] = [];
  const edges: ProductGraphEdge[] = [];
  const rootId = `product-${slug}`;

  nodes.push({
    id: rootId,
    label: record.name,
    type: 'product',
    color: COLORS.product,
    size: 16,
    summary: record.description.slice(0, 120),
  });

  const catId = `cat-${record.category.replace(/\s+/g, '-').toLowerCase()}`;
  nodes.push({ id: catId, label: record.category, type: 'category', color: COLORS.category, size: 10 });
  edges.push({ id: `e-${rootId}-${catId}`, source: rootId, target: catId, type: 'in_category' });

  const relatedIndustrySlugs = record.businessIntel.relatedIndustrySlugs ?? [];
  const relatedProductSlugs = (record.businessIntel.relatedProductSlugs ?? []).slice(0, 6);
  const [industries, relatedProducts] = await Promise.all([
    getIndustryRecords(relatedIndustrySlugs),
    getProductRecords(relatedProductSlugs),
  ]);

  for (const indSlug of relatedIndustrySlugs) {
    const ind = industries.get(indSlug);
    if (!ind) continue;
    const nid = `industry-${indSlug}`;
    nodes.push({ id: nid, label: ind.name, type: 'industry', color: COLORS.industry, size: 11 });
    edges.push({ id: `e-${rootId}-${nid}`, source: rootId, target: nid, type: 'serves_industry' });
  }

  for (const clSlug of record.businessIntel.relatedClusterSlugs ?? []) {
    const cl = getClusterRecord(clSlug);
    if (!cl) continue;
    const nid = `cluster-${clSlug}`;
    nodes.push({ id: nid, label: cl.name, type: 'cluster', color: COLORS.cluster, size: 11 });
    edges.push({ id: `e-${rootId}-${nid}`, source: rootId, target: nid, type: 'made_in_cluster' });
  }

  for (const m of (record.commercial.exportMarkets ?? []).slice(0, 8)) {
    const mid = `market-${m.replace(/\s+/g, '-').toLowerCase()}`;
    nodes.push({ id: mid, label: m, type: 'market', color: COLORS.market, size: 8 });
    edges.push({ id: `e-${rootId}-${mid}`, source: rootId, target: mid, type: 'exports_to' });
  }

  for (const mat of (record.manufacturing.rawMaterials ?? []).slice(0, 6)) {
    const mid = `mat-${mat.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`;
    nodes.push({ id: mid, label: mat, type: 'material', color: COLORS.material, size: 7 });
    edges.push({ id: `e-${rootId}-${mid}`, source: rootId, target: mid, type: 'uses_material' });
  }

  for (const rel of relatedProductSlugs) {
    const relRec = relatedProducts.get(rel);
    if (!relRec) continue;
    const rid = `product-${rel}`;
    nodes.push({ id: rid, label: relRec.name, type: 'product', color: COLORS.product, size: 9 });
    edges.push({ id: `e-${rootId}-${rid}`, source: rootId, target: rid, type: 'related_product' });
  }

  const { completenessScore } = scoreProductIntelligence(record);
  return {
    nodes,
    edges,
    meta: { productSlug: slug, productName: record.name, completeness: completenessScore },
  };
}
