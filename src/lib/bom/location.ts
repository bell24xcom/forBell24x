/**
 * Location Memory — a BOM module.
 *
 * Design rule: the BACKEND thinks like a computer (lat/lng, radius, geofence),
 * the FRONTEND thinks like a human ("Kalamboli", "Bhiwandi Textile Hub").
 * Never surface raw distances to users — surface place + cluster names.
 *
 * Storage: no schema change. Location lives in `User.location` (string) +
 * `User.preferences.location` (JSON) and is mirrored as a `location_set`
 * BusinessLifeEvent so it flows through the same event stream as everything else.
 */

import { CITIES, type CityData } from '@/src/data/city-category-seo';
import { recordLifeEventAsync } from './life-events';

export interface CompanyLocation {
  /** Canonical cluster key (matches CITIES + /suppliers/[city] + /location/[area]) */
  areaKey: string | null;
  /** Human-readable area, e.g. "Kalamboli" */
  area: string | null;
  /** Full label, e.g. "Kalamboli, Navi Mumbai" */
  fullName: string | null;
  city: string | null;
  state: string | null;
  country: string;
  lat: number | null;
  lng: number | null;
  /** Optional structured sites */
  office?: string | null;
  factory?: string | null;
  warehouse?: string | null;
  branches?: string[];
  deliveryRadiusKm?: number | null;
}

export interface IndustrialArea {
  key: string;
  name: string;
  fullName: string;
  state: string;
  description: string;
  clusterNote: string;
  categories: string[];
  lat: number | null;
  lng: number | null;
}

/** Normalise free text to a canonical CITIES key, if recognisable. */
export function resolveAreaKey(input: string | null | undefined): string | null {
  if (!input) return null;
  const raw = input.trim().toLowerCase();
  if (!raw) return null;
  if (CITIES[raw]) return raw;
  const slug = raw.replace(/[\s,]+/g, '-');
  if (CITIES[slug]) return slug;
  // Match by display name / fullName substring (handles "Kalamboli, Navi Mumbai")
  for (const [key, c] of Object.entries(CITIES)) {
    if (raw.includes(c.name.toLowerCase()) || c.fullName.toLowerCase().includes(raw)) {
      return key;
    }
  }
  return null;
}

export function getArea(areaKey: string | null | undefined): IndustrialArea | null {
  if (!areaKey) return null;
  const c: CityData | undefined = CITIES[areaKey];
  if (!c) return null;
  return {
    key: areaKey,
    name: c.name,
    fullName: c.fullName,
    state: c.state,
    description: c.description,
    clusterNote: c.clusterNote,
    categories: c.categories,
    lat: c.lat ?? null,
    lng: c.lng ?? null,
  };
}

export function listAreas(): IndustrialArea[] {
  return Object.keys(CITIES)
    .map((k) => getArea(k))
    .filter((a): a is IndustrialArea => a !== null);
}

/** Haversine distance in km — backend-only geofencing primitive. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Resolve which industrial cluster a coordinate belongs to (geofence).
 * Returns the nearest area within `radiusKm`, or null. Frontend never sees
 * the radius — it only receives the resolved area name.
 */
export function geofenceArea(
  point: { lat: number; lng: number },
  radiusKm = 25,
): IndustrialArea | null {
  let best: { area: IndustrialArea; dist: number } | null = null;
  for (const area of listAreas()) {
    if (area.lat == null || area.lng == null) continue;
    const dist = distanceKm(point, { lat: area.lat, lng: area.lng });
    if (dist <= radiusKm && (!best || dist < best.dist)) {
      best = { area, dist };
    }
  }
  return best?.area ?? null;
}

/** Areas near a given area (shares-a-corridor neighbours), human-named only. */
export function nearbyAreas(areaKey: string, withinKm = 30, limit = 6): IndustrialArea[] {
  const origin = getArea(areaKey);
  if (!origin || origin.lat == null || origin.lng == null) return [];
  return listAreas()
    .filter((a) => a.key !== areaKey && a.lat != null && a.lng != null)
    .map((a) => ({ a, dist: distanceKm({ lat: origin.lat!, lng: origin.lng! }, { lat: a.lat!, lng: a.lng! }) }))
    .filter((x) => x.dist <= withinKm)
    .sort((x, y) => x.dist - y.dist)
    .slice(0, limit)
    .map((x) => x.a);
}

/**
 * Record a company's location into the BOM event stream. Non-blocking.
 * Persisting to User.location/preferences is the caller's responsibility
 * (kept separate so this module never imports prisma directly).
 */
/** Build a CompanyLocation from profile fields (no prisma). */
export function companyLocationFromProfile(
  city: string | null | undefined,
  state?: string | null,
): CompanyLocation | null {
  if (!city?.trim()) return null;
  const trimmed = city.trim();
  const areaKey = resolveAreaKey(trimmed);
  const area = getArea(areaKey);
  return {
    areaKey,
    area: area?.name ?? trimmed,
    fullName: area?.fullName ?? (state ? `${trimmed}, ${state}` : trimmed),
    city: trimmed,
    state: state ?? area?.state ?? null,
    country: 'India',
    lat: area?.lat ?? null,
    lng: area?.lng ?? null,
  };
}

export function recordLocationEvent(companyId: string, loc: CompanyLocation): void {
  recordLifeEventAsync({
    companyId,
    eventType: 'location_set',
    actorId: companyId,
    metadata: {
      areaKey: loc.areaKey,
      area: loc.area,
      city: loc.city,
      state: loc.state,
      country: loc.country,
      lat: loc.lat,
      lng: loc.lng,
      office: loc.office,
      factory: loc.factory,
      warehouse: loc.warehouse,
      branches: loc.branches,
      deliveryRadiusKm: loc.deliveryRadiusKm,
    },
    source: 'location',
    confidence: 1,
  });
}
