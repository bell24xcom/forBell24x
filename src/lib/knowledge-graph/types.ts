/**
 * Business Knowledge Graph — unified node/edge model for AI-ready structured reasoning.
 */

export type KnowledgeNodeType =
  | 'company'
  | 'product'
  | 'industry'
  | 'cluster'
  | 'city'
  | 'state'
  | 'country'
  | 'market'
  | 'supplier'
  | 'buyer'
  | 'rfq'
  | 'event'
  | 'category'
  | 'material';

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: KnowledgeNodeType;
  color: string;
  size: number;
  summary?: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  meta: {
    rootId: string;
    rootType: KnowledgeNodeType;
    nodeCount: number;
    edgeCount: number;
    generatedAt: string;
  };
}

export interface KnowledgeGraphStats {
  products: number;
  industries: number;
  clusters: number;
  geographicNodes: number;
  totalNodes: number;
  totalEdges: number;
  avgProductCompleteness: number;
  avgIndustryCompleteness: number;
}

export type GraphQueryRoot =
  | { type: 'product'; slug: string }
  | { type: 'industry'; slug: string }
  | { type: 'cluster'; slug: string }
  | { type: 'company'; userId: string };
