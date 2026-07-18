/**
 * Product Intelligence — structured product knowledge for the Business Knowledge Graph.
 * Extends supplier product listings into full intelligence records (no schema migration).
 */

export interface ProductCommercial {
  moq?: string;
  leadTime?: string;
  packaging?: string;
  hsCode?: string;
  certifications?: string[];
  priceRange?: string;
  exportMarkets?: string[];
  importMarkets?: string[];
}

export interface ProductManufacturing {
  process?: string[];
  machinesUsed?: string[];
  rawMaterials?: string[];
  accessories?: string[];
  consumables?: string[];
  compatibleProducts?: string[];
  alternativeProducts?: string[];
}

export interface ProductKnowledge {
  faqs?: { q: string; a: string }[];
  blogs?: { title: string; slug: string }[];
  videos?: { title: string; url: string }[];
  images?: string[];
  documents?: { title: string; url: string }[];
  caseStudies?: string[];
}

export interface ProductBusinessIntel {
  relatedIndustrySlugs?: string[];
  relatedClusterSlugs?: string[];
  relatedProductSlugs?: string[];
  procurementTrend?: string;
  demandTrend?: string;
  exportTrend?: string;
}

export interface ProductSeoFields {
  metaTitle?: string;
  metaDescription?: string;
  canonicalPath?: string;
  keywords?: string[];
}

export interface ProductIntelligenceRecord {
  slug: string;
  name: string;
  family?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  description: string;
  manufacturing: ProductManufacturing;
  commercial: ProductCommercial;
  knowledge: ProductKnowledge;
  businessIntel: ProductBusinessIntel;
  seo: ProductSeoFields;
  /** Reference company (Digitex Studio demo) */
  referenceCompany?: string;
  updatedAt?: string;
}

export interface ProductIntelligenceView extends ProductIntelligenceRecord {
  completenessScore: number;
  missingFields: string[];
}

export interface ProductGraphNode {
  id: string;
  label: string;
  type: 'product' | 'category' | 'industry' | 'cluster' | 'market' | 'material' | 'machine';
  color: string;
  size: number;
  summary?: string;
}

export interface ProductGraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
}

export interface ProductGraphData {
  nodes: ProductGraphNode[];
  edges: ProductGraphEdge[];
  meta: { productSlug: string; productName: string; completeness: number };
}
