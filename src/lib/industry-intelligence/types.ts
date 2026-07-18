/**
 * Industry Intelligence — vertical knowledge for the Business Knowledge Graph.
 */

export interface IndustryTrends {
  importTrend?: string;
  exportTrend?: string;
  priceTrend?: string;
  procurementTrend?: string;
  hiringTrend?: string;
  demandTrend?: string;
}

export interface IndustryIntelligenceRecord {
  slug: string;
  name: string;
  description: string;
  manufacturers?: string[];
  suppliers?: string[];
  buyers?: string[];
  products?: string[];
  machines?: string[];
  rawMaterials?: string[];
  standards?: string[];
  tradeAssociations?: string[];
  tradeShows?: string[];
  governmentSchemes?: string[];
  certifications?: string[];
  relatedClusterSlugs?: string[];
  relatedProductSlugs?: string[];
  trends: IndustryTrends;
  updatedAt?: string;
}

export interface IndustryIntelligenceView extends IndustryIntelligenceRecord {
  completenessScore: number;
  pulseAreaKeys?: string[];
}
