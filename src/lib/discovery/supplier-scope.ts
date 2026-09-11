/**
 * Shared discovery supplier scope — reused across intelligence modules.
 */

import { DISCOVERY_IMPORTED_FROM_PREFIX } from './types';

export const DISCOVERY_SUPPLIER_WHERE = {
  role: 'SUPPLIER' as const,
  OR: [
    { importedFrom: { startsWith: DISCOVERY_IMPORTED_FROM_PREFIX } },
    { importedFrom: 'admin_import' },
  ],
};

export function categoryFromPreferences(prefs: unknown): string {
  if (!prefs || typeof prefs !== 'object') return 'Uncategorized';
  const cats = (prefs as { categories?: string[] }).categories;
  return Array.isArray(cats) && cats[0] ? cats[0] : 'Uncategorized';
}

export function cityFromLocation(location: string | null | undefined): string {
  if (!location?.trim()) return 'Unknown';
  const parts = location.split(',').map((s) => s.trim()).filter(Boolean);
  return parts[0] || 'Unknown';
}

/** Normalize importedFrom into a human-readable source label. */
export function sourceFromImportedFrom(importedFrom: string | null | undefined): string {
  if (!importedFrom) return 'unknown';
  if (importedFrom === 'admin_import') return 'admin_import';
  if (importedFrom.startsWith(DISCOVERY_IMPORTED_FROM_PREFIX)) {
    const rest = importedFrom.slice(DISCOVERY_IMPORTED_FROM_PREFIX.length);
    const segment = rest.split(':')[0];
    return segment || 'discovery';
  }
  return importedFrom;
}

export function claimRate(claimed: number, total: number): number {
  return total > 0 ? Math.round((claimed / total) * 100) : 0;
}
