/**
 * Product Intelligence seed catalog — Digitex Studio textile sampling vertical.
 * Static knowledge (no schema migration). Powers graph, SEO, and admin views.
 */

import type { ProductIntelligenceRecord } from '@/src/lib/product-intelligence/types';
import { withDbTimeout, DbTimeoutError } from '@/src/lib/db-timeout';

const BASE_FAQS = [
  {
    q: 'What is a fabric swatch book?',
    a: 'A fabric swatch book is a bound collection of fabric samples used by buyers, designers, and export teams to evaluate texture, colour, and construction before bulk orders.',
  },
  {
    q: 'What MOQ do swatch book manufacturers typically offer?',
    a: 'MOQs vary from 50 books for custom export collections to 500+ for standard catalogues. Digitex Studio supports flexible runs for interior and export buyers.',
  },
];

function textileProduct(
  partial: Omit<ProductIntelligenceRecord, 'manufacturing' | 'commercial' | 'knowledge' | 'businessIntel' | 'seo'> &
    Partial<Pick<ProductIntelligenceRecord, 'manufacturing' | 'commercial' | 'knowledge' | 'businessIntel' | 'seo'>>,
): ProductIntelligenceRecord {
  return {
    referenceCompany: 'Digitex Studio',
    updatedAt: '2026-06-27',
    ...partial,
    manufacturing: { ...partial.manufacturing },
    commercial: { ...partial.commercial },
    knowledge: { faqs: BASE_FAQS, ...partial.knowledge },
    businessIntel: { ...partial.businessIntel },
    seo: { ...partial.seo },
  };
}

export const PRODUCT_INTELLIGENCE_CATALOG: Record<string, ProductIntelligenceRecord> = {
  'fabric-sample-books': textileProduct({
    slug: 'fabric-sample-books',
    name: 'Fabric Sample Books',
    family: 'Textile Sampling',
    category: 'Textiles, Yarn & Fabrics',
    subcategory: 'Sampling & Presentation',
    description:
      'Export-grade fabric sample books for upholstery, curtain, and apparel buyers. Custom binding, labelled swatches, and branded presentation.',
    manufacturing: {
      process: ['Swatch cutting', 'Labelling', 'Binding', 'Quality check', 'Export packing'],
      machinesUsed: ['Swatch cutting machine', 'Corner rounding machine', 'Binding press', 'Label printer'],
      rawMaterials: ['Fabric rolls', 'Binding board', 'Cover material', 'Adhesive', 'Labels'],
      accessories: ['Sample book fasteners', 'Corner protectors', 'Ring mechanisms'],
      compatibleProducts: ['fabric-sample-cards', 'sample-book-fasteners-binding-hardware'],
      alternativeProducts: ['Digital fabric catalogues', 'Hanger samples'],
    },
    commercial: {
      moq: '100 books',
      leadTime: '2–3 weeks',
      packaging: 'Export cartons with moisture barrier',
      hsCode: '6307.90',
      certifications: ['OEKO-TEX (fabric dependent)', 'ISO 9001 (process)'],
      priceRange: '₹800 – ₹2,500 per book',
      exportMarkets: ['USA', 'UK', 'UAE', 'Australia', 'Germany'],
      importMarkets: ['China (binding hardware)', 'Taiwan (specialty fabrics)'],
    },
    businessIntel: {
      relatedIndustrySlugs: ['fabric-sampling-industry'],
      relatedClusterSlugs: ['bhiwandi-textile-cluster', 'surat-gidc'],
      relatedProductSlugs: [
        'upholstery-fabric-swatch-books',
        'curtain-fabric-swatch-books',
        'fabric-sample-cards',
        'pvc-sample-books',
      ],
      procurementTrend: 'Rising demand from export interior buyers',
      demandTrend: 'Premium presentation formats growing post-pandemic',
      exportTrend: 'Strong outbound to Middle East and Europe',
    },
    knowledge: {
      faqs: [
        ...BASE_FAQS,
        {
          q: 'How many fabric options fit in one sample book?',
          a: 'Standard books hold 50–100 swatches; compact books 20–30. Custom layouts available for export collections.',
        },
      ],
      blogs: [{ title: 'How Export Buyers Evaluate Fabric Sample Books', slug: 'export-fabric-sample-books' }],
      images: ['/assets/textile/fabric-sample-book-cover.jpg'],
    },
    seo: {
      metaTitle: 'Fabric Sample Books — Export-Grade Swatch Books | VyaparSethu',
      metaDescription:
        'Source fabric sample books from verified Indian manufacturers. Custom binding, export finishing, and fast turnaround for interior and apparel buyers.',
      canonicalPath: '/product-intelligence/fabric-sample-books',
      keywords: ['fabric sample books', 'swatch books manufacturer', 'textile sampling India'],
    },
  }),

  'upholstery-fabric-swatch-books': textileProduct({
    slug: 'upholstery-fabric-swatch-books',
    name: 'Upholstery Fabric Swatch Books',
    family: 'Textile Sampling',
    category: 'Textiles, Yarn & Fabrics',
    subcategory: 'Upholstery Sampling',
    description:
      'Premium upholstery fabric swatch books for furniture manufacturers, interior designers, and export buyers worldwide.',
    manufacturing: {
      process: ['Upholstery fabric selection', 'Swatch mounting', 'Premium binding', 'Brand labelling'],
      machinesUsed: ['Heavy-duty binding press', 'Swatch cutter', 'Embossing machine'],
      rawMaterials: ['Upholstery fabrics', 'Leather-look samples', 'Binding board', 'Metal corners'],
      compatibleProducts: ['fabric-sample-books', 'sample-book-fasteners-binding-hardware'],
    },
    commercial: {
      moq: '50 books',
      leadTime: '2 weeks',
      hsCode: '6307.90',
      priceRange: '₹1,200 – ₹3,500 per book',
      exportMarkets: ['USA', 'UK', 'UAE', 'Saudi Arabia'],
    },
    businessIntel: {
      relatedIndustrySlugs: ['fabric-sampling-industry', 'upholstery-furniture-industry'],
      relatedClusterSlugs: ['bhiwandi-textile-cluster'],
      relatedProductSlugs: ['fabric-sample-books', 'curtain-fabric-swatch-books'],
      demandTrend: 'High from hospitality and furniture OEMs',
    },
    seo: {
      metaTitle: 'Upholstery Fabric Swatch Books — Verified Manufacturers | VyaparSethu',
      metaDescription:
        'Premium upholstery swatch books for furniture and interior buyers. Export-grade binding and fast quotes from verified suppliers.',
      canonicalPath: '/categories/upholstery-fabric-swatch-books',
      keywords: ['upholstery swatch books', 'furniture fabric samples', 'upholstery sampling'],
    },
  }),

  'curtain-fabric-swatch-books': textileProduct({
    slug: 'curtain-fabric-swatch-books',
    name: 'Curtain Fabric Swatch Books',
    family: 'Textile Sampling',
    category: 'Textiles, Yarn & Fabrics',
    subcategory: 'Curtain & Drapery Sampling',
    description:
      'Curtain and drapery fabric swatch books for dealers, architects, and pan-India interior showrooms.',
    manufacturing: {
      process: ['Drapery fabric curation', 'Swatch assembly', 'Ring or screw binding', 'Showroom packaging'],
      rawMaterials: ['Blackout fabrics', 'Sheer fabrics', 'Printed drapery', 'Binding rings'],
    },
    commercial: {
      moq: '100 books',
      leadTime: '2–3 weeks',
      hsCode: '6307.90',
      priceRange: '₹900 – ₹2,200 per book',
      exportMarkets: ['India (pan-India)', 'Middle East'],
    },
    businessIntel: {
      relatedIndustrySlugs: ['fabric-sampling-industry'],
      relatedClusterSlugs: ['bhiwandi-textile-cluster', 'surat-gidc'],
      relatedProductSlugs: ['fabric-sample-books', 'fabric-sample-cards'],
    },
    seo: {
      metaTitle: 'Curtain Fabric Swatch Books — Bhiwandi & Surat Manufacturers | VyaparSethu',
      metaDescription:
        'Curtain and drapery swatch books for dealers and interior buyers. Blackout, sheer, and premium drapery collections.',
      canonicalPath: '/categories/curtain-fabric-swatch-books',
      keywords: ['curtain swatch books', 'drapery sample books', 'curtain fabric sampling'],
    },
  }),

  'fabric-sample-cards': textileProduct({
    slug: 'fabric-sample-cards',
    name: 'Fabric Sample Cards',
    family: 'Textile Sampling',
    category: 'Textiles, Yarn & Fabrics',
    subcategory: 'Compact Sampling',
    description:
      'Compact fabric sample cards for retailers, specifiers, and export presentations — lightweight alternative to full swatch books.',
    manufacturing: {
      process: ['Card cutting', 'Fabric mounting', 'Hole punching', 'Header card printing'],
      rawMaterials: ['Chipboard cards', 'Fabric offcuts', 'Header cards', 'Eyelets'],
      compatibleProducts: ['fabric-sample-books', 'sample-book-fasteners-binding-hardware'],
      alternativeProducts: ['Hanger samples', 'Memo samples'],
    },
    commercial: {
      moq: '500 cards',
      leadTime: '1–2 weeks',
      hsCode: '6307.90',
      priceRange: '₹15 – ₹80 per card',
      exportMarkets: ['Worldwide'],
    },
    businessIntel: {
      relatedIndustrySlugs: ['fabric-sampling-industry'],
      relatedClusterSlugs: ['surat-gidc', 'bhiwandi-textile-cluster'],
      relatedProductSlugs: ['fabric-sample-books'],
    },
    seo: {
      metaTitle: 'Fabric Sample Cards — Compact Textile Sampling | VyaparSethu',
      metaDescription:
        'Compact fabric sample cards for showrooms and export buyers. Fast turnaround from verified textile manufacturers.',
      canonicalPath: '/categories/fabric-sample-cards',
      keywords: ['fabric sample cards', 'textile memo samples', 'compact fabric sampling'],
    },
  }),

  'sample-book-fasteners-binding-hardware': textileProduct({
    slug: 'sample-book-fasteners-binding-hardware',
    name: 'Sample Book Fasteners & Binding Hardware',
    family: 'Textile Sampling Accessories',
    category: 'Textiles, Yarn & Fabrics',
    subcategory: 'Binding Hardware',
    description:
      'Binding screws, corner protectors, ring mechanisms, and fasteners for fabric sample books and swatch sets.',
    manufacturing: {
      process: ['Metal stamping', 'Plating', 'Assembly', 'Quality inspection'],
      machinesUsed: ['Stamping press', 'Plating line', 'Assembly bench'],
      rawMaterials: ['Brass', 'Steel wire', 'Nickel plating', 'Plastic corners'],
      compatibleProducts: ['fabric-sample-books', 'pvc-sample-books'],
    },
    commercial: {
      moq: '1,000 sets',
      leadTime: '1 week',
      hsCode: '8308.20',
      priceRange: '₹5 – ₹45 per set',
      importMarkets: ['China', 'Taiwan'],
    },
    businessIntel: {
      relatedIndustrySlugs: ['fabric-sampling-industry', 'metal-hardware-industry'],
      relatedClusterSlugs: ['bhiwandi-textile-cluster', 'rajkot-engineering'],
      relatedProductSlugs: ['fabric-sample-books', 'pvc-sample-books'],
    },
    seo: {
      metaTitle: 'Sample Book Fasteners & Binding Hardware | VyaparSethu',
      metaDescription:
        'Binding screws, corners, and ring mechanisms for fabric sample books. Source from verified hardware suppliers.',
      canonicalPath: '/categories/sample-book-fasteners-binding-hardware',
      keywords: ['sample book fasteners', 'swatch book binding', 'textile binding hardware'],
    },
  }),

  'pvc-sample-books': textileProduct({
    slug: 'pvc-sample-books',
    name: 'PVC Sample Books',
    family: 'Textile Sampling',
    category: 'Textiles, Yarn & Fabrics',
    subcategory: 'PVC & Synthetic Sampling',
    description:
      'PVC and synthetic material sample books for upholstery, automotive, and industrial buyers requiring durable swatch presentation.',
    manufacturing: {
      process: ['PVC swatch cutting', 'Heat sealing', 'Spiral binding', 'Cover lamination'],
      rawMaterials: ['PVC sheets', 'Synthetic leather', 'Spiral coils', 'Laminated covers'],
      compatibleProducts: ['sample-book-fasteners-binding-hardware', 'fabric-sample-books'],
    },
    commercial: {
      moq: '75 books',
      leadTime: '2 weeks',
      hsCode: '3926.90',
      priceRange: '₹600 – ₹1,800 per book',
      exportMarkets: ['Automotive OEMs', 'Industrial buyers'],
    },
    businessIntel: {
      relatedIndustrySlugs: ['fabric-sampling-industry', 'automotive-interiors'],
      relatedClusterSlugs: ['bhiwandi-textile-cluster', 'chakan-auto-cluster'],
      relatedProductSlugs: ['fabric-sample-books', 'upholstery-fabric-swatch-books'],
    },
    seo: {
      metaTitle: 'PVC Sample Books — Synthetic Swatch Presentation | VyaparSethu',
      metaDescription:
        'PVC and synthetic sample books for automotive and industrial buyers. Durable binding from verified manufacturers.',
      canonicalPath: '/product-intelligence/pvc-sample-books',
      keywords: ['PVC sample books', 'synthetic swatch books', 'automotive fabric sampling'],
    },
  }),
};

/**
 * DB-backed reads (src/lib/product-intelligence/service.ts), falling back to this
 * static catalog if the DB table isn't reachable yet (e.g. before migration 0005 runs)
 * or a DB call is slow (see withDbTimeout — 1.5s guard, never blocks page render).
 */
export async function listProductSlugs(): Promise<string[]> {
  try {
    const slugs = await withDbTimeout(async () => {
      const { listProductSlugsFromDb } = await import('@/src/lib/product-intelligence/service');
      return listProductSlugsFromDb();
    });
    if (slugs.length > 0) return slugs;
  } catch (err) {
    if (err instanceof DbTimeoutError) console.warn('[product-intelligence] listProductSlugs: DB timeout, falling back to static catalog');
    /* DB table may not exist until migration 0005 runs, or DB call timed out */
  }
  return Object.keys(PRODUCT_INTELLIGENCE_CATALOG);
}

export async function getProductRecord(slug: string): Promise<ProductIntelligenceRecord | null> {
  try {
    const record = await withDbTimeout(async () => {
      const { getProductRecordBySlug } = await import('@/src/lib/product-intelligence/service');
      return getProductRecordBySlug(slug);
    });
    if (record) return record;
  } catch (err) {
    if (err instanceof DbTimeoutError) console.warn(`[product-intelligence] getProductRecord(${slug}): DB timeout, falling back to static catalog`);
    /* DB table may not exist until migration 0005 runs, or DB call timed out */
  }
  return PRODUCT_INTELLIGENCE_CATALOG[slug] ?? null;
}

/**
 * Batch fallback for the N+1 fix — callers should prefer this over mapping
 * `getProductRecord` across a slug array. One batched DB round trip (via
 * getProductRecordsBySlugs) instead of N, with the same per-slug static fallback.
 */
export async function getProductRecords(slugs: string[]): Promise<Map<string, ProductIntelligenceRecord | null>> {
  const result = new Map<string, ProductIntelligenceRecord | null>();
  if (slugs.length === 0) return result;
  try {
    const dbResult = await withDbTimeout(async () => {
      const { getProductRecordsBySlugs } = await import('@/src/lib/product-intelligence/service');
      return getProductRecordsBySlugs(slugs);
    });
    for (const s of slugs) result.set(s, dbResult.get(s) ?? PRODUCT_INTELLIGENCE_CATALOG[s] ?? null);
    return result;
  } catch (err) {
    if (err instanceof DbTimeoutError) console.warn(`[product-intelligence] getProductRecords: DB timeout, falling back to static catalog for ${slugs.length} slug(s)`);
    for (const s of slugs) result.set(s, PRODUCT_INTELLIGENCE_CATALOG[s] ?? null);
    return result;
  }
}
