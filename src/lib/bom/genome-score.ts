/**
 * Business Genome Score — BOM module completeness (not SEO score).
 */

import type { BomProjection } from './projections';

export interface GenomeModuleScore {
  id: string;
  label: string;
  score: number;
  color: string;
}

export interface BusinessGenome {
  overall: number;
  modules: GenomeModuleScore[];
  headline: string;
}

const GENOME_LABELS: Record<string, string> = {
  identity: 'Identity',
  business: 'Business',
  product: 'Products',
  procurement: 'Procurement',
  supplier: 'Suppliers',
  customer: 'Customers',
  trust: 'Trust',
  market: 'Market',
  risk: 'Risk',
  decision: 'Decisions',
  intent: 'Intent',
  timeline: 'Timeline',
  opportunity: 'Opportunities',
  communication: 'Communication',
  operational: 'Operations',
  predictive: 'Predictive',
  economic: 'Economic',
  knowledge: 'Knowledge',
};

export function computeBusinessGenome(projection: BomProjection): BusinessGenome {
  const modules: GenomeModuleScore[] = Object.entries(projection.moduleScores)
    .filter(([id]) => GENOME_LABELS[id])
    .map(([id, score]) => ({
      id,
      label: GENOME_LABELS[id] ?? id,
      score: Math.round(score),
      color: score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444',
    }))
    .sort((a, b) => b.score - a.score);

  const overall =
    modules.length > 0
      ? Math.round(modules.reduce((s, m) => s + m.score, 0) / modules.length)
      : 0;

  const headline =
    overall >= 70
      ? 'Strong business memory — recommendations will improve daily.'
      : overall >= 40
        ? 'Growing genome — add products, RFQs, and verification to unlock insights.'
        : 'Early stage — complete profile and record your first RFQs.';

  return { overall, modules, headline };
}
