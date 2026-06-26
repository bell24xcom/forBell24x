/**
 * Company DNA — 15-layer Business Operating Memory model.
 * Extends Elephant Memory from RFQ intelligence → full MSME DNA graph.
 */

export const DNA_LAYERS = [
  { id: 'identity', label: 'Identity DNA', layer: 1, color: '#6366f1' },
  { id: 'business', label: 'Business DNA', layer: 2, color: '#8b5cf6' },
  { id: 'procurement', label: 'Procurement DNA', layer: 3, color: '#a855f7' },
  { id: 'suppliers', label: 'Supplier DNA', layer: 4, color: '#d946ef' },
  { id: 'customers', label: 'Customer DNA', layer: 5, color: '#ec4899' },
  { id: 'financial', label: 'Financial DNA', layer: 6, color: '#f43f5e' },
  { id: 'market', label: 'Market DNA', layer: 7, color: '#f97316' },
  { id: 'risk', label: 'Risk DNA', layer: 8, color: '#eab308' },
  { id: 'trust', label: 'Trust DNA', layer: 9, color: '#22c55e' },
  { id: 'relationships', label: 'Relationship DNA', layer: 10, color: '#14b8a6' },
  { id: 'procurementMemory', label: 'Procurement Memory', layer: 11, color: '#06b6d4' },
  { id: 'decisions', label: 'Decision DNA', layer: 12, color: '#3b82f6' },
  { id: 'opportunities', label: 'Opportunity DNA', layer: 13, color: '#6366f1' },
  { id: 'timeline', label: 'Business Timeline', layer: 14, color: '#64748b' },
  { id: 'aiMemory', label: 'AI Business Memory', layer: 15, color: '#D4AF37' },
] as const;

export type DnaLayerId = (typeof DNA_LAYERS)[number]['id'];

export interface IdentityDna {
  companyName?: string;
  gst?: string;
  pan?: string;
  udyam?: string;
  iec?: string;
  incorporationDate?: string;
  promoters?: string[];
  directors?: string[];
  locations?: string[];
  branches?: string[];
  factoryLocations?: string[];
}

export interface BusinessDna {
  industry?: string;
  subIndustry?: string;
  products?: string[];
  brands?: string[];
  services?: string[];
  manufacturingCapacity?: string;
  monthlyProduction?: string;
  installedMachinery?: string[];
  factoryArea?: string;
  warehouseArea?: string;
}

export interface ProcurementDna {
  rawMaterials?: string[];
  consumables?: string[];
  packaging?: string[];
  machineryParts?: string[];
  utilities?: string[];
  monthlyConsumption?: Record<string, string>;
}

export interface SupplierDnaEntry {
  name: string;
  role?: 'primary' | 'backup';
  yearsTogether?: number;
  paymentTerms?: string;
  avgDeliveryDays?: number;
  qualityRating?: number;
  priceRating?: number;
  disputeCount?: number;
}

export interface CustomerDna {
  topCustomers?: string[];
  customerCategories?: string[];
  repeatCustomerRate?: string;
  revenueMix?: Record<string, number>;
  geography?: string[];
  exportMarkets?: string[];
}

export interface FinancialDna {
  enterpriseSize?: 'micro' | 'small' | 'medium' | 'large';
  creditBehavior?: string;
  growthTrend?: 'rising' | 'stable' | 'declining';
  procurementSpendTrend?: string;
  salesTrend?: string;
  workingCapitalPattern?: string;
}

export interface MarketDna {
  productsPurchased?: string[];
  productsSold?: string[];
  categoryDemand?: Record<string, string>;
  seasonality?: string[];
  marketPrices?: Record<string, string>;
  regionalTrends?: string[];
  industryTrends?: string[];
}

export interface RiskDna {
  supplierDependencyPct?: number;
  customerDependencyPct?: number;
  industryRisk?: 'low' | 'medium' | 'high';
  paymentDelayRisk?: string;
  gstComplianceRisk?: string;
  operationalRisk?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  notes?: string[];
}

export interface TrustDna {
  gstVerified?: boolean;
  udyamVerified?: boolean;
  siteVerified?: boolean;
  bankVerified?: boolean;
  yearsActive?: number;
  transactionCount?: number;
  escrowCount?: number;
  disputeResolutionCount?: number;
  trustScore?: number;
}

export interface RelationshipDna {
  buysFrom?: string[];
  suppliesTo?: string[];
  industryNetwork?: string[];
  associations?: string[];
  tradeRelationships?: string[];
}

export interface ProcurementMemoryDna {
  rfqCount?: number;
  purchaseCount?: number;
  supplierChanges?: number;
  priceChanges?: number;
  quotationCount?: number;
  recentRfqs?: { id: string; title: string; category: string }[];
}

export interface DecisionDnaEntry {
  decision: string;
  outcome?: string;
  impactPct?: number;
  date?: string;
}

export interface OpportunityDna {
  crossSell?: string[];
  exportOpportunities?: string[];
  alternativeSuppliers?: string[];
  costSavings?: string[];
  newMarkets?: string[];
}

export interface AiBusinessMemory {
  summary?: string;
  whatHappened?: string[];
  why?: string[];
  whatChanged?: string[];
  likelyNext?: string[];
  recommendedActions?: string[];
}

export interface CompanyDnaLayers {
  identity?: IdentityDna;
  business?: BusinessDna;
  procurement?: ProcurementDna;
  suppliers?: SupplierDnaEntry[];
  customers?: CustomerDna;
  financial?: FinancialDna;
  market?: MarketDna;
  risk?: RiskDna;
  trust?: TrustDna;
  relationships?: RelationshipDna;
  procurementMemory?: ProcurementMemoryDna;
  decisions?: DecisionDnaEntry[];
  opportunities?: OpportunityDna;
  aiMemory?: AiBusinessMemory;
}

export interface DnaGraphNode {
  id: string;
  label: string;
  type: 'company' | 'layer' | 'entity' | 'event' | 'timeline';
  layerId?: DnaLayerId;
  layer?: number;
  color: string;
  size: number;
  summary?: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface DnaGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: 'layer_link' | 'entity_link' | 'relationship' | 'risk' | 'memory';
}

export interface DnaGraphData {
  nodes: DnaGraphNode[];
  edges: DnaGraphEdge[];
  meta: {
    companyName: string;
    completeness: number;
    layerScores: Record<string, number>;
    nodeCount: number;
    edgeCount: number;
    generatedAt: string;
  };
}

export interface CompanyDnaProfileView {
  id: string;
  userId: string;
  companyName: string;
  completeness: number;
  layerScores: Record<string, number>;
  layers: CompanyDnaLayers;
  timeline: { year: number; label: string; eventType: string }[];
  memoryEventCount: number;
  lastSyncedAt: string;
}
