/**
 * Discovery Engine — shared types aligned with POST /api/admin/import-suppliers.
 */

/** Canonical import shape — must match import-suppliers route. */
export interface SupplierImportInput {
  company: string;
  category: string;
  city: string;
  state?: string;
  gstNumber?: string;
  phone?: string;
  email?: string;
  description?: string;
}

export type DiscoverySource = 'scrapegraph' | 'manual' | 'csv' | 'import';

export interface DiscoveryImportOptions {
  source: DiscoverySource;
  sourceQuery?: string;
  sourceUrl?: string;
  contactName?: string;
  dryRun?: boolean;
  adminUserId?: string;
}

export interface DiscoveryImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  importedIds: string[];
  dryRun: boolean;
}

export interface ScrapedDiscoveryRow {
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  gstin?: string;
  location?: string;
  sourceUrl?: string;
  segment?: 'steel' | 'textiles' | 'packaging' | 'chemicals' | 'other' | string;
}

export type ReadinessLevel = 'READY' | 'PARTIAL' | 'MISSING';

export interface ReadinessItem {
  id: string;
  label: string;
  status: ReadinessLevel;
  note: string;
}

export const DISCOVERY_IMPORTED_FROM_PREFIX = 'discovery:';

export function discoveryImportedFrom(source: DiscoverySource, detail?: string): string {
  const base = `${DISCOVERY_IMPORTED_FROM_PREFIX}${source}`;
  return detail ? `${base}:${detail.slice(0, 120)}` : base;
}
