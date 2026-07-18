/**
 * Geographic Intelligence — worldwide hierarchy (data-driven, not India-bound).
 */

export interface GeoCountry {
  code: string;
  name: string;
  states?: GeoState[];
}

export interface GeoState {
  code: string;
  name: string;
  districts?: GeoDistrict[];
}

export interface GeoDistrict {
  name: string;
  cities?: GeoCity[];
}

export interface GeoCity {
  name: string;
  slug: string;
  lat?: number;
  lng?: number;
  clusters?: string[];
}

export interface GeoHierarchyPath {
  country: string;
  countryCode: string;
  state?: string;
  stateCode?: string;
  district?: string;
  city?: string;
  clusterSlug?: string;
  clusterName?: string;
}

import { INDUSTRIAL_CLUSTERS } from '@/src/data/industrial-clusters';
import { CITIES } from '@/src/data/city-category-seo';

/** Seed geographic tree — extend by adding countries as data, not code branches. */
export const GEO_COUNTRIES: GeoCountry[] = [
  {
    code: 'IN',
    name: 'India',
    states: [
      {
        code: 'MH',
        name: 'Maharashtra',
        districts: [
          {
            name: 'Thane',
            cities: [
              { name: 'Bhiwandi', slug: 'bhiwandi', clusters: ['bhiwandi-textile-cluster'] },
            ],
          },
          {
            name: 'Navi Mumbai',
            cities: [
              { name: 'Kalamboli', slug: 'kalamboli', clusters: ['kalamboli-metals-cluster'] },
              { name: 'Taloja', slug: 'taloja' },
            ],
          },
          {
            name: 'Pune',
            cities: [{ name: 'Chakan', slug: 'chakan', clusters: ['chakan-auto-cluster'] }],
          },
        ],
      },
      {
        code: 'GJ',
        name: 'Gujarat',
        districts: [
          { name: 'Surat', cities: [{ name: 'Surat', slug: 'surat', clusters: ['surat-gidc'] }] },
          { name: 'Rajkot', cities: [{ name: 'Rajkot', slug: 'rajkot', clusters: ['rajkot-engineering'] }] },
          { name: 'Morbi', cities: [{ name: 'Morbi', slug: 'morbi', clusters: ['morbi-ceramics'] }] },
        ],
      },
      {
        code: 'TN',
        name: 'Tamil Nadu',
        districts: [
          { name: 'Tiruppur', cities: [{ name: 'Tiruppur', slug: 'tiruppur', clusters: ['tiruppur-knitwear'] }] },
          { name: 'Coimbatore', cities: [{ name: 'Coimbatore', slug: 'coimbatore' }] },
        ],
      },
    ],
  },
  {
    code: 'US',
    name: 'United States',
    states: [{ code: 'CA', name: 'California' }, { code: 'NY', name: 'New York' }],
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    states: [{ code: 'DU', name: 'Dubai' }],
  },
];

export function listCountries(): { code: string; name: string }[] {
  return GEO_COUNTRIES.map(c => ({ code: c.code, name: c.name }));
}

export function getCountry(code: string): GeoCountry | null {
  return GEO_COUNTRIES.find(c => c.code === code) ?? null;
}

export function resolveGeoPath(clusterSlug: string): GeoHierarchyPath | null {
  const cluster = INDUSTRIAL_CLUSTERS[clusterSlug];
  if (!cluster) return null;
  return {
    country: cluster.country,
    countryCode: cluster.countryCode,
    state: cluster.state,
    stateCode: cluster.stateCode,
    district: cluster.district,
    city: cluster.city,
    clusterSlug: cluster.slug,
    clusterName: cluster.name,
  };
}

/** Merge Location Memory CITIES into geographic nodes for India clusters. */
export function enrichCityFromRegistry(slug: string): GeoCity | null {
  const city = CITIES[slug];
  if (!city) return null;
  const clusters = listClusterSlugsForAreaKey(slug);
  return {
    name: city.name,
    slug,
    lat: city.lat,
    lng: city.lng,
    clusters,
  };
}

function listClusterSlugsForAreaKey(areaKey: string): string[] {
  return Object.values(INDUSTRIAL_CLUSTERS)
    .filter(c => c.areaKey === areaKey)
    .map(c => c.slug);
}

export function countGeographicNodes(): number {
  let n = GEO_COUNTRIES.length;
  for (const c of GEO_COUNTRIES) {
    n += c.states?.length ?? 0;
    for (const s of c.states ?? []) {
      n += s.districts?.length ?? 0;
      for (const d of s.districts ?? []) {
        n += d.cities?.length ?? 0;
      }
    }
  }
  n += Object.keys(INDUSTRIAL_CLUSTERS).length;
  return n;
}
