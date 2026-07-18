/**
 * Builds force-directed graph data from Company DNA layers.
 * Inspired by knowledge-graph UIs (e.g. MiroFish GraphPanel) — original VyaparSethu implementation.
 */

import {
  DNA_LAYERS,
  type CompanyDnaLayers,
  type DnaGraphData,
  type DnaGraphEdge,
  type DnaGraphNode,
  type DnaLayerId,
} from './types';
import { listProductSlugs, getProductRecord } from '@/src/data/product-intelligence-catalog';

function entityNode(
  id: string,
  label: string,
  layerId: DnaLayerId,
  layerNum: number,
  color: string,
  summary?: string,
  attributes?: Record<string, string | number | boolean>,
): DnaGraphNode {
  return {
    id,
    label,
    type: 'entity',
    layerId,
    layer: layerNum,
    color,
    size: 6,
    summary,
    attributes,
  };
}

function addStringList(
  nodes: DnaGraphNode[],
  edges: DnaGraphEdge[],
  hubId: string,
  layerId: DnaLayerId,
  layerNum: number,
  color: string,
  prefix: string,
  items: string[] | undefined,
  edgeType: DnaGraphEdge['type'] = 'entity_link',
) {
  if (!items?.length) return;
  for (const item of items.slice(0, 12)) {
    const nid = `${prefix}-${item.replace(/\s+/g, '-').toLowerCase().slice(0, 40)}`;
    nodes.push(entityNode(nid, item, layerId, layerNum, color));
    edges.push({
      id: `e-${hubId}-${nid}`,
      source: hubId,
      target: nid,
      type: edgeType,
    });
  }
}

export async function buildDnaGraph(companyName: string, layers: CompanyDnaLayers, completeness: number, layerScores: Record<string, number>): Promise<DnaGraphData> {
  const nodes: DnaGraphNode[] = [];
  const edges: DnaGraphEdge[] = [];

  const centerId = 'company-core';
  nodes.push({
    id: centerId,
    label: companyName,
    type: 'company',
    color: '#D4AF37',
    size: 18,
    summary: 'Company DNA nucleus — all layers connect here',
    attributes: { completeness: Math.round(completeness) },
  });

  for (const layer of DNA_LAYERS) {
    const hubId = `layer-${layer.id}`;
    nodes.push({
      id: hubId,
      label: layer.label,
      type: 'layer',
      layerId: layer.id,
      layer: layer.layer,
      color: layer.color,
      size: 12,
      summary: `Layer ${layer.layer} — ${Math.round(layerScores[layer.id] ?? 0)}% complete`,
    });
    edges.push({
      id: `e-core-${hubId}`,
      source: centerId,
      target: hubId,
      label: `L${layer.layer}`,
      type: 'layer_link',
    });
  }

  const L = (id: DnaLayerId) => DNA_LAYERS.find(x => x.id === id)!;

  // Layer 1 — Identity
  const idHub = 'layer-identity';
  const id = layers.identity;
  if (id?.gst) {
    const n = 'entity-gst';
    nodes.push(entityNode(n, `GST ${id.gst}`, 'identity', 1, L('identity').color, 'Tax identity'));
    edges.push({ id: 'e-id-gst', source: idHub, target: n, type: 'entity_link' });
  }
  if (id?.udyam) {
    const n = 'entity-udyam';
    nodes.push(entityNode(n, `Udyam ${id.udyam}`, 'identity', 1, L('identity').color));
    edges.push({ id: 'e-id-udyam', source: idHub, target: n, type: 'entity_link' });
  }
  addStringList(nodes, edges, idHub, 'identity', 1, L('identity').color, 'loc', id?.locations);
  addStringList(nodes, edges, idHub, 'identity', 1, L('identity').color, 'factory', id?.factoryLocations);

  // Layer 2 — Business
  const biz = layers.business;
  if (biz?.industry) {
    const n = 'entity-industry';
    nodes.push(entityNode(n, biz.industry, 'business', 2, L('business').color, biz.subIndustry));
    edges.push({ id: 'e-biz-ind', source: 'layer-business', target: n, type: 'entity_link' });
  }
  addStringList(nodes, edges, 'layer-business', 'business', 2, L('business').color, 'prod', biz?.products);

  // Product nodes (SEO product pages → Business DNA)
  for (const prod of (biz?.products ?? []).slice(0, 10)) {
    const nid = `product-${prod.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`;
    nodes.push(entityNode(nid, prod, 'business', 2, '#818cf8', 'Supplier product page'));
    edges.push({ id: `e-prod-${nid}`, source: 'layer-business', target: nid, type: 'entity_link', label: 'product' });

    let matchSlug: string | undefined;
    for (const s of await listProductSlugs()) {
      const rec = await getProductRecord(s);
      if (rec && (prod.toLowerCase().includes(rec.name.toLowerCase().slice(0, 8)) || rec.name.toLowerCase().includes(prod.toLowerCase().slice(0, 8)))) {
        matchSlug = s;
        break;
      }
    }
    if (matchSlug) {
      const rec = await getProductRecord(matchSlug);
      if (rec) {
        const intelId = `intel-${matchSlug}`;
        nodes.push(entityNode(intelId, rec.name, 'market', 7, '#D4AF37', 'Product Intelligence'));
        edges.push({ id: `e-prod-intel-${matchSlug}`, source: nid, target: intelId, type: 'knowledge_link', label: 'intel' });
      }
    }
  }

  addStringList(nodes, edges, 'layer-business', 'business', 2, L('business').color, 'machine', biz?.installedMachinery);
  if (biz?.monthlyProduction) {
    const n = 'entity-capacity';
    nodes.push(entityNode(n, biz.monthlyProduction, 'business', 2, L('business').color, 'Monthly capacity'));
    edges.push({ id: 'e-biz-cap', source: 'layer-business', target: n, type: 'entity_link' });
  }

  // Layer 3 — Procurement inputs
  addStringList(nodes, edges, 'layer-procurement', 'procurement', 3, L('procurement').color, 'raw', layers.procurement?.rawMaterials);
  addStringList(nodes, edges, 'layer-procurement', 'procurement', 3, L('procurement').color, 'cons', layers.procurement?.consumables);

  // Layer 4 — Suppliers
  for (const sup of (layers.suppliers ?? []).slice(0, 8)) {
    const nid = `sup-${sup.name.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`;
    nodes.push(
      entityNode(nid, sup.name, 'suppliers', 4, L('suppliers').color, sup.role, {
        quality: sup.qualityRating ?? 0,
        delivery: sup.avgDeliveryDays ?? 0,
      }),
    );
    edges.push({
      id: `e-sup-${nid}`,
      source: 'layer-suppliers',
      target: nid,
      label: sup.role,
      type: 'relationship',
    });
  }

  // Layer 5 — Customers
  addStringList(nodes, edges, 'layer-customers', 'customers', 5, L('customers').color, 'cust', layers.customers?.topCustomers);
  addStringList(nodes, edges, 'layer-customers', 'customers', 5, L('customers').color, 'export', layers.customers?.exportMarkets);

  // Layer 7 — Market
  addStringList(nodes, edges, 'layer-market', 'market', 7, L('market').color, 'sold', layers.market?.productsSold);
  addStringList(nodes, edges, 'layer-market', 'market', 7, L('market').color, 'season', layers.market?.seasonality);

  // Layer 8 — Risk
  const risk = layers.risk;
  if (risk?.riskLevel) {
    const n = 'entity-risk-level';
    nodes.push(
      entityNode(n, `Risk: ${risk.riskLevel.toUpperCase()}`, 'risk', 8, '#ef4444', risk.notes?.join('; ')),
    );
    edges.push({ id: 'e-risk-level', source: 'layer-risk', target: n, type: 'risk' });
  }
  if (risk?.supplierDependencyPct != null) {
    const n = 'entity-sup-dep';
    nodes.push(
      entityNode(n, `${risk.supplierDependencyPct}% supplier dependency`, 'risk', 8, '#f97316'),
    );
    edges.push({ id: 'e-risk-sup', source: 'layer-risk', target: n, type: 'risk' });
  }

  // Layer 9 — Trust
  const trust = layers.trust;
  if (trust?.trustScore != null) {
    const n = 'entity-trust-score';
    nodes.push(entityNode(n, `Trust ${trust.trustScore}`, 'trust', 9, L('trust').color));
    edges.push({ id: 'e-trust-score', source: 'layer-trust', target: n, type: 'entity_link' });
  }
  if (trust?.gstVerified) {
    const n = 'entity-gst-verified';
    nodes.push(entityNode(n, 'GST Verified', 'trust', 9, '#22c55e'));
    edges.push({ id: 'e-trust-gst', source: 'layer-trust', target: n, type: 'entity_link' });
  }

  // Layer 10 — Relationships
  addStringList(nodes, edges, 'layer-relationships', 'relationships', 10, L('relationships').color, 'assoc', layers.relationships?.associations);

  // Layer 11 — Procurement memory (links to Elephant Memory)
  const pm = layers.procurementMemory;
  if (pm?.rfqCount != null) {
    const n = 'entity-rfq-count';
    nodes.push(entityNode(n, `${pm.rfqCount} RFQs`, 'procurementMemory', 11, L('procurementMemory').color, 'Elephant Memory episodic'));
    edges.push({ id: 'e-pm-rfq', source: 'layer-procurementMemory', target: n, type: 'memory' });
  }
  for (const rfq of (pm?.recentRfqs ?? []).slice(0, 5)) {
    const nid = `rfq-${rfq.id}`;
    nodes.push(entityNode(nid, rfq.title.slice(0, 40), 'procurementMemory', 11, L('procurementMemory').color, rfq.category));
    edges.push({ id: `e-pm-${nid}`, source: 'layer-procurementMemory', target: nid, type: 'memory' });
  }

  // Layer 12 — Decisions
  for (const d of (layers.decisions ?? []).slice(0, 6)) {
    const nid = `dec-${d.decision.slice(0, 20).replace(/\s+/g, '-')}`;
    nodes.push(entityNode(nid, d.decision.slice(0, 35), 'decisions', 12, L('decisions').color, d.outcome));
    edges.push({ id: `e-dec-${nid}`, source: 'layer-decisions', target: nid, type: 'memory', label: d.outcome });
  }

  // Layer 13 — Opportunities
  addStringList(nodes, edges, 'layer-opportunities', 'opportunities', 13, L('opportunities').color, 'opp', layers.opportunities?.crossSell);

  // Layer 15 — AI memory hub
  const ai = layers.aiMemory;
  if (ai?.summary) {
    const n = 'entity-ai-summary';
    nodes.push(entityNode(n, 'AI Insight', 'aiMemory', 15, L('aiMemory').color, ai.summary));
    edges.push({ id: 'e-ai-sum', source: 'layer-aiMemory', target: n, type: 'memory' });
  }

  return {
    nodes,
    edges,
    meta: {
      companyName,
      completeness,
      layerScores,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      generatedAt: new Date().toISOString(),
    },
  };
}
