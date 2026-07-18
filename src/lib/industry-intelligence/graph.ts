import { getIndustryRecord } from '@/src/data/industry-intelligence-catalog';
import { getClusterRecord } from '@/src/data/industrial-clusters';
import { getProductRecords } from '@/src/data/product-intelligence-catalog';
import type { KnowledgeGraphEdge, KnowledgeGraphNode } from '@/src/lib/knowledge-graph/types';

export async function buildIndustrySubgraph(slug: string): Promise<{
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
} | null> {
  const ind = await getIndustryRecord(slug);
  if (!ind) return null;

  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeGraphEdge[] = [];
  const rootId = `industry-${slug}`;

  nodes.push({
    id: rootId,
    label: ind.name,
    type: 'industry',
    color: '#10b981',
    size: 14,
    summary: ind.description.slice(0, 120),
  });

  const productSlugs = ind.products ?? [];
  const products = await getProductRecords(productSlugs);
  for (const pSlug of productSlugs) {
    const p = products.get(pSlug);
    if (!p) continue;
    const pid = `product-${pSlug}`;
    nodes.push({ id: pid, label: p.name, type: 'product', color: '#D4AF37', size: 10 });
    edges.push({ id: `e-${rootId}-${pid}`, source: rootId, target: pid, type: 'industry_product' });
  }

  for (const cSlug of ind.relatedClusterSlugs ?? []) {
    const c = getClusterRecord(cSlug);
    if (!c) continue;
    const cid = `cluster-${cSlug}`;
    nodes.push({ id: cid, label: c.name, type: 'cluster', color: '#06b6d4', size: 11 });
    edges.push({ id: `e-${rootId}-${cid}`, source: rootId, target: cid, type: 'industry_cluster' });
  }

  return { nodes, edges };
}
