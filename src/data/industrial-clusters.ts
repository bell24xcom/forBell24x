/**
 * Industrial cluster definitions — public SEO slugs mapped to Location Memory area keys.
 * Countries are data attributes; architecture supports worldwide expansion.
 */

export interface IndustrialClusterRecord {
  slug: string;
  name: string;
  fullName: string;
  country: string;
  countryCode: string;
  state?: string;
  stateCode?: string;
  district?: string;
  city?: string;
  /** Links to CITIES key in city-category-seo.ts when available */
  areaKey?: string;
  description: string;
  clusterNote: string;
  primaryIndustries: string[];
  relatedIndustrySlugs: string[];
  relatedProductSlugs: string[];
  categories: string[];
  lat?: number;
  lng?: number;
}

export const INDUSTRIAL_CLUSTERS: Record<string, IndustrialClusterRecord> = {
  'bhiwandi-textile-cluster': {
    slug: 'bhiwandi-textile-cluster',
    name: 'Bhiwandi Textile Cluster',
    fullName: 'Bhiwandi Textile & Packaging Hub, Maharashtra',
    country: 'India',
    countryCode: 'IN',
    state: 'Maharashtra',
    stateCode: 'MH',
    district: 'Thane',
    city: 'Bhiwandi',
    areaKey: 'bhiwandi',
    description:
      'Maharashtra\'s largest corrugated packaging and textiles manufacturing cluster with India\'s highest warehousing density.',
    clusterNote: 'Primary corridor for fabric sampling, power looms, and export presentation formats.',
    primaryIndustries: ['fabric-sampling-industry', 'upholstery-furniture-industry'],
    relatedIndustrySlugs: ['fabric-sampling-industry'],
    relatedProductSlugs: ['fabric-sample-books', 'curtain-fabric-swatch-books', 'upholstery-fabric-swatch-books'],
    categories: ['textiles-garments', 'packaging-materials', 'paper-printing'],
  },
  'surat-gidc': {
    slug: 'surat-gidc',
    name: 'Surat Textile GIDC',
    fullName: 'Surat Textile Hub, Gujarat',
    country: 'India',
    countryCode: 'IN',
    state: 'Gujarat',
    stateCode: 'GJ',
    city: 'Surat',
    areaKey: 'surat',
    description: 'India\'s largest man-made fabric and embroidery cluster.',
    clusterNote: 'Dominant for synthetic fabrics, sample cards, and export swatch programmes.',
    primaryIndustries: ['fabric-sampling-industry'],
    relatedIndustrySlugs: ['fabric-sampling-industry'],
    relatedProductSlugs: ['fabric-sample-cards', 'fabric-sample-books'],
    categories: ['textiles-garments'],
  },
  'tiruppur-knitwear': {
    slug: 'tiruppur-knitwear',
    name: 'Tiruppur Knitwear Cluster',
    fullName: 'Tiruppur Knitwear Export Zone, Tamil Nadu',
    country: 'India',
    countryCode: 'IN',
    state: 'Tamil Nadu',
    stateCode: 'TN',
    city: 'Tiruppur',
    description: 'India\'s knitwear export capital — T-shirts, hosiery, and garment sampling.',
    clusterNote: 'High export orientation; strong demand for compact sampling formats.',
    primaryIndustries: ['fabric-sampling-industry'],
    relatedIndustrySlugs: ['fabric-sampling-industry'],
    relatedProductSlugs: ['fabric-sample-cards'],
    categories: ['textiles-garments', 'apparel-fashion'],
    lat: 11.1085,
    lng: 77.3411,
  },
  'morbi-ceramics': {
    slug: 'morbi-ceramics',
    name: 'Morbi Ceramics Cluster',
    fullName: 'Morbi Ceramic Tile Hub, Gujarat',
    country: 'India',
    countryCode: 'IN',
    state: 'Gujarat',
    stateCode: 'GJ',
    city: 'Morbi',
    description: 'World\'s second-largest ceramic tile manufacturing cluster.',
    clusterNote: 'Tile sample boards and export presentation — adjacent to sampling industry patterns.',
    primaryIndustries: [],
    relatedIndustrySlugs: [],
    relatedProductSlugs: [],
    categories: ['ceramics-refractories', 'construction-real-estate'],
    lat: 22.8173,
    lng: 70.8378,
  },
  'rajkot-engineering': {
    slug: 'rajkot-engineering',
    name: 'Rajkot Engineering Cluster',
    fullName: 'Rajkot Engineering & Fasteners Hub, Gujarat',
    country: 'India',
    countryCode: 'IN',
    state: 'Gujarat',
    stateCode: 'GJ',
    city: 'Rajkot',
    areaKey: 'rajkot',
    description: 'Precision engineering, die casting, and fastener manufacturing cluster.',
    clusterNote: 'Binding hardware and metal fasteners for sample book industry.',
    primaryIndustries: ['metal-hardware-industry'],
    relatedIndustrySlugs: ['metal-hardware-industry', 'fabric-sampling-industry'],
    relatedProductSlugs: ['sample-book-fasteners-binding-hardware'],
    categories: ['machinery-equipment', 'fasteners-bolts', 'tools-hardware'],
  },
  'kalamboli-metals-cluster': {
    slug: 'kalamboli-metals-cluster',
    name: 'Kalamboli Metals Cluster',
    fullName: 'Kalamboli Steel & Metals Hub, Navi Mumbai',
    country: 'India',
    countryCode: 'IN',
    state: 'Maharashtra',
    stateCode: 'MH',
    city: 'Kalamboli',
    areaKey: 'kalamboli',
    description: 'India\'s largest steel and metals distribution hub near JNPT.',
    clusterNote: 'Fasteners and metal inputs for industrial binding supply chains.',
    primaryIndustries: ['metal-hardware-industry'],
    relatedIndustrySlugs: ['metal-hardware-industry'],
    relatedProductSlugs: ['sample-book-fasteners-binding-hardware'],
    categories: ['metals-alloys', 'fasteners-bolts', 'pipes-fittings'],
  },
  'chakan-auto-cluster': {
    slug: 'chakan-auto-cluster',
    name: 'Chakan Auto Components Cluster',
    fullName: 'Chakan Auto Hub, Pune',
    country: 'India',
    countryCode: 'IN',
    state: 'Maharashtra',
    stateCode: 'MH',
    city: 'Chakan',
    areaKey: 'chakan',
    description: 'India\'s fastest-growing auto components cluster.',
    clusterNote: 'Automotive interior sampling and PVC swatch programmes.',
    primaryIndustries: ['automotive-interiors'],
    relatedIndustrySlugs: ['automotive-interiors'],
    relatedProductSlugs: ['pvc-sample-books'],
    categories: ['automotive-transport', 'plastics-rubber'],
  },
};

export function listClusterSlugs(): string[] {
  return Object.keys(INDUSTRIAL_CLUSTERS);
}

export function getClusterRecord(slug: string): IndustrialClusterRecord | null {
  return INDUSTRIAL_CLUSTERS[slug] ?? null;
}

export function resolveClusterPulseKey(slug: string): string | null {
  const c = INDUSTRIAL_CLUSTERS[slug];
  return c?.areaKey ?? null;
}
