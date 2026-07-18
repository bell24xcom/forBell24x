/**
 * One-time seed: migrates the static Product/Industry Intelligence catalogs
 * (src/data/product-intelligence-catalog.ts, industry-intelligence-catalog.ts)
 * into their new DB-backed tables. Idempotent — safe to re-run (upsert by slug).
 *
 * Run:  npx tsx scripts/seed-product-industry-intelligence.ts
 *
 * Requires migration 0005_product_industry_intelligence to be applied first
 * (npx prisma migrate deploy).
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { PrismaClient, Prisma } from '@prisma/client';
import { PRODUCT_INTELLIGENCE_CATALOG } from '../src/data/product-intelligence-catalog';
import { INDUSTRY_INTELLIGENCE_CATALOG } from '../src/data/industry-intelligence-catalog';

const prisma = new PrismaClient();

function toJson<T>(v: T | undefined): Prisma.InputJsonValue | undefined {
  return v === undefined ? undefined : (v as unknown as Prisma.InputJsonValue);
}

async function seedProducts() {
  const records = Object.values(PRODUCT_INTELLIGENCE_CATALOG);
  let count = 0;
  for (const r of records) {
    await prisma.productIntelligenceRecord.upsert({
      where: { slug: r.slug },
      create: {
        slug: r.slug,
        name: r.name,
        family: r.family,
        category: r.category,
        subcategory: r.subcategory,
        brand: r.brand,
        description: r.description,
        manufacturing: toJson(r.manufacturing),
        commercial: toJson(r.commercial),
        knowledge: toJson(r.knowledge),
        businessIntel: toJson(r.businessIntel),
        seo: toJson(r.seo),
        referenceCompany: r.referenceCompany,
      },
      update: {
        name: r.name,
        family: r.family,
        category: r.category,
        subcategory: r.subcategory,
        brand: r.brand,
        description: r.description,
        manufacturing: toJson(r.manufacturing),
        commercial: toJson(r.commercial),
        knowledge: toJson(r.knowledge),
        businessIntel: toJson(r.businessIntel),
        seo: toJson(r.seo),
        referenceCompany: r.referenceCompany,
      },
    });
    count++;
  }
  console.log(`Product Intelligence: upserted ${count} records`);
}

async function seedIndustries() {
  const records = Object.values(INDUSTRY_INTELLIGENCE_CATALOG);
  let count = 0;
  for (const r of records) {
    const data = {
      slug: r.slug,
      name: r.name,
      description: r.description,
      manufacturers: r.manufacturers ?? [],
      suppliers: r.suppliers ?? [],
      buyers: r.buyers ?? [],
      products: r.products ?? [],
      machines: r.machines ?? [],
      rawMaterials: r.rawMaterials ?? [],
      standards: r.standards ?? [],
      tradeAssociations: r.tradeAssociations ?? [],
      tradeShows: r.tradeShows ?? [],
      governmentSchemes: r.governmentSchemes ?? [],
      certifications: r.certifications ?? [],
      relatedClusterSlugs: r.relatedClusterSlugs ?? [],
      relatedProductSlugs: r.relatedProductSlugs ?? [],
      trends: toJson(r.trends) as Prisma.InputJsonValue,
    };
    await prisma.industryIntelligenceRecord.upsert({
      where: { slug: r.slug },
      create: data,
      update: data,
    });
    count++;
  }
  console.log(`Industry Intelligence: upserted ${count} records`);
}

async function main() {
  await seedProducts();
  await seedIndustries();
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
