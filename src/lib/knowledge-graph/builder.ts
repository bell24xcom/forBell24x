/**
 * Business Knowledge Graph builder — merges Product, Industry, Cluster, Geographic, Company DNA.
 * Structured data only — no external LLM calls.
 */

import { buildDnaGraph } from '@/src/lib/company-dna/graph-builder';
import { getCompanyDnaProfile } from '@/src/lib/company-dna/engine';
import type { CompanyDnaLayers } from '@/src/lib/company-dna/types';
import { getClusterRecord } from '@/src/data/industrial-clusters';
import { resolveGeoPath } from '@/src/lib/geographic-intelligence';
import { buildIndustrySubgraph } from '@/src/lib/industry-intelligence/graph';
import { buildProductGraph } from '@/src/lib/product-intelligence/graph';
import { getProductRecord, listProductSlugs } from '@/src/data/product-intelligence-catalog';
import type { GraphQueryRoot, KnowledgeGraphData, KnowledgeGraphEdge, KnowledgeGraphNode } from './types';

function mergeGraphs(
  parts: { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] }[],
  rootId: string,
  rootType: KnowledgeGraphData['meta']['rootType'],
): KnowledgeGraphData {
  const nodeMap = new Map<string, KnowledgeGraphNode>();
  const edgeMap = new Map<string, KnowledgeGraphEdge>();

  for (const part of parts) {
    for (const n of part.nodes) nodeMap.set(n.id, n);
    for (const e of part.edges) edgeMap.set(e.id, e);
  }

  const nodes = Array.from(nodeMap.values());
  const edges = Array.from(edgeMap.values());

  return {
    nodes,
    edges,
    meta: {
      rootId,
      rootType,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      generatedAt: new Date().toISOString(),
    },
  };
}

async function productToKg(slug: string): Promise<KnowledgeGraphData | null> {
  const pg = await buildProductGraph(slug);
  if (!pg) return null;

  const parts: { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] }[] = [
    {
      nodes: pg.nodes.map(n => ({ ...n, type: n.type as KnowledgeGraphNode['type'] })),
      edges: pg.edges,
    },
  ];

  const record = await getProductRecord(slug);
  for (const clSlug of record?.businessIntel.relatedClusterSlugs ?? []) {
    const geo = appendGeoChain(clSlug);
    if (geo) parts.push(geo);
    const cluster = getClusterRecord(clSlug);
    if (cluster) {
      for (const iSlug of cluster.relatedIndustrySlugs) {
        const sub = await buildIndustrySubgraph(iSlug);
        if (sub) parts.push(sub);
      }
    }
  }

  return mergeGraphs(parts, `product-${slug}`, 'product');
}

async function industryToKg(slug: string): Promise<KnowledgeGraphData | null> {
  const sub = await buildIndustrySubgraph(slug);
  if (!sub) return null;
  const parts = [sub];
  const ind = sub.nodes.find(n => n.id === `industry-${slug}`);
  if (ind) {
    for (const e of sub.edges) {
      if (e.target.startsWith('cluster-')) {
        const clSlug = e.target.replace('cluster-', '');
        const geo = appendGeoChain(clSlug);
        if (geo) parts.push(geo);
      }
    }
  }
  return mergeGraphs(parts, `industry-${slug}`, 'industry');
}

async function clusterToKg(slug: string): Promise<KnowledgeGraphData | null> {
  const cluster = getClusterRecord(slug);
  if (!cluster) return null;

  const nodes: KnowledgeGraphNode[] = [
    {
      id: `cluster-${slug}`,
      label: cluster.name,
      type: 'cluster',
      color: '#06b6d4',
      size: 14,
      summary: cluster.description,
      attributes: { country: cluster.country, state: cluster.state ?? '' },
    },
  ];
  const edges: KnowledgeGraphEdge[] = [];

  for (const pSlug of cluster.relatedProductSlugs) {
    const p = await getProductRecord(pSlug);
    if (!p) continue;
    const pid = `product-${pSlug}`;
    nodes.push({ id: pid, label: p.name, type: 'product', color: '#D4AF37', size: 10 });
    edges.push({ id: `e-cluster-${slug}-${pid}`, source: `cluster-${slug}`, target: pid, type: 'cluster_product' });
  }

  for (const iSlug of cluster.relatedIndustrySlugs) {
    const sub = await buildIndustrySubgraph(iSlug);
    if (sub) {
      nodes.push(...sub.nodes.filter(n => n.id !== `industry-${iSlug}`));
      edges.push(...sub.edges);
      const iid = `industry-${iSlug}`;
      if (!nodes.find(n => n.id === iid) && sub.nodes.find(n => n.id === iid)) {
        nodes.push(sub.nodes.find(n => n.id === iid)!);
      }
      edges.push({
        id: `e-cluster-${slug}-${iid}`,
        source: `cluster-${slug}`,
        target: iid,
        type: 'cluster_industry',
      });
    }
  }

  const geo = appendGeoChain(slug);
  const parts = [{ nodes, edges }];
  if (geo) parts.push(geo);

  return mergeGraphs(parts, `cluster-${slug}`, 'cluster');
}

function appendGeoChain(clusterSlug: string): { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] } | null {
  const path = resolveGeoPath(clusterSlug);
  if (!path) return null;

  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeGraphEdge[] = [];
  const clusterId = `cluster-${clusterSlug}`;

  const countryId = `country-${path.countryCode}`;
  nodes.push({
    id: countryId,
    label: path.country,
    type: 'country',
    color: '#3b82f6',
    size: 12,
  });
  edges.push({ id: `e-${clusterId}-${countryId}`, source: clusterId, target: countryId, type: 'in_country' });

  if (path.state && path.stateCode) {
    const stateId = `state-${path.stateCode}`;
    nodes.push({ id: stateId, label: path.state, type: 'state', color: '#8b5cf6', size: 10 });
    edges.push({ id: `e-${stateId}-${countryId}`, source: stateId, target: countryId, type: 'in_state' });
    edges.push({ id: `e-${clusterId}-${stateId}`, source: clusterId, target: stateId, type: 'in_state' });
  }

  if (path.city) {
    const cityId = `city-${path.city.toLowerCase().replace(/\s+/g, '-')}`;
    nodes.push({ id: cityId, label: path.city, type: 'city', color: '#14b8a6', size: 9 });
    edges.push({ id: `e-${clusterId}-${cityId}`, source: clusterId, target: cityId, type: 'in_city' });
  }

  return { nodes, edges };
}

async function companyToKg(userId: string): Promise<KnowledgeGraphData | null> {
  const profile = await getCompanyDnaProfile(userId);
  if (!profile) return null;

  const dnaGraph = await buildDnaGraph(
    profile.companyName,
    profile.layers as CompanyDnaLayers,
    profile.completeness,
    profile.layerScores,
  );

  const nodes: KnowledgeGraphNode[] = dnaGraph.nodes.map(n => ({
    id: n.id,
    label: n.label,
    type: (n.type === 'company' ? 'company' : n.type === 'layer' ? 'category' : 'product') as KnowledgeGraphNode['type'],
    color: n.color,
    size: n.size,
    summary: n.summary,
    attributes: n.attributes as Record<string, string | number | boolean> | undefined,
  }));

  const edges: KnowledgeGraphEdge[] = dnaGraph.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type,
    label: e.label,
  }));

  const products = profile.layers.business?.products ?? [];
  for (const name of products.slice(0, 8)) {
    let slugMatch: string | undefined;
    for (const s of await listProductSlugs()) {
      const p = await getProductRecord(s);
      if (p && (name.toLowerCase().includes(p.name.toLowerCase().slice(0, 8)) || p.name.toLowerCase().includes(name.toLowerCase().slice(0, 8)))) {
        slugMatch = s;
        break;
      }
    }
    if (slugMatch) {
      const pg = await buildProductGraph(slugMatch);
      if (pg) {
        nodes.push(...pg.nodes.map(n => ({ ...n, type: n.type as KnowledgeGraphNode['type'] })));
        edges.push(...pg.edges.map(e => ({ ...e, id: `co-${e.id}` })));
        edges.push({
          id: `e-company-product-${slugMatch}`,
          source: 'company-core',
          target: `product-${slugMatch}`,
          type: 'company_product',
        });
      }
    }
  }

  return mergeGraphs([{ nodes, edges }], 'company-core', 'company');
}

export async function buildKnowledgeGraph(query: GraphQueryRoot): Promise<KnowledgeGraphData | null> {
  switch (query.type) {
    case 'product':
      return productToKg(query.slug);
    case 'industry':
      return industryToKg(query.slug);
    case 'cluster':
      return clusterToKg(query.slug);
    case 'company':
      return companyToKg(query.userId);
    default:
      return null;
  }
}
