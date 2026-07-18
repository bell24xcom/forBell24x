/**
 * Knowledge Graph statistics — catalog-level metrics for admin dashboard.
 */

import { averageProductCompleteness } from '@/src/lib/product-intelligence/score';
import { listProductSlugs } from '@/src/data/product-intelligence-catalog';
import { listProductRecords } from '@/src/lib/product-intelligence/service';
import { averageIndustryCompleteness } from '@/src/lib/industry-intelligence/engine';
import { listIndustrySlugs } from '@/src/data/industry-intelligence-catalog';
import { listClusterSlugs } from '@/src/data/industrial-clusters';
import { countGeographicNodes } from '@/src/lib/geographic-intelligence';
import type { ProductIntelligenceRecord } from '@/src/lib/product-intelligence/types';
import type { KnowledgeGraphStats } from './types';

export async function getKnowledgeGraphStats(): Promise<KnowledgeGraphStats> {
  const productSlugs = await listProductSlugs();
  const products = productSlugs.length;
  const industries = (await listIndustrySlugs()).length;
  const clusters = listClusterSlugs().length;
  const geographicNodes = countGeographicNodes();

  const productRecords: ProductIntelligenceRecord[] = await listProductRecords().catch(() => []);

  return {
    products,
    industries,
    clusters,
    geographicNodes,
    totalNodes: products + industries + clusters + geographicNodes,
    totalEdges: products * 4 + industries * 3,
    avgProductCompleteness: averageProductCompleteness(productRecords),
    avgIndustryCompleteness: await averageIndustryCompleteness(),
  };
}
