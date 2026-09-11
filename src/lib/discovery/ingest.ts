/**
 * Discovery ingestion — maps all discovery sources to import-suppliers shape
 * and creates unclaimed SUPPLIER User rows.
 */

import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { logDiscoveryEvent } from './events';
import {
  type SupplierImportInput,
  type DiscoveryImportOptions,
  type DiscoveryImportResult,
  type ScrapedDiscoveryRow,
  discoveryImportedFrom,
} from './types';
import { isBlockedDiscoveryUrl } from './policy';

const SEGMENT_CATEGORY: Record<string, string> = {
  steel: 'Steel & Metals',
  textiles: 'Textiles & Fabrics',
  packaging: 'Packaging',
  chemicals: 'Chemicals',
  other: 'General',
};

/** Parse free-text location into city + optional state. */
export function parseDiscoveryLocation(location?: string | null): { city: string; state?: string } {
  if (!location?.trim()) return { city: 'India' };
  const parts = location.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { city: parts[0], state: parts[parts.length - 1] };
  }
  return { city: parts[0] || 'India' };
}

/** Map ScrapeGraph row → canonical import-suppliers input. */
export function mapScrapedToImport(
  row: ScrapedDiscoveryRow,
  fallbackCategory: string,
): SupplierImportInput | null {
  if (!row.companyName?.trim()) return null;
  if (isBlockedDiscoveryUrl(row.sourceUrl)) return null;

  const { city, state } = parseDiscoveryLocation(row.location);
  const category =
    fallbackCategory ||
    (row.segment ? SEGMENT_CATEGORY[row.segment] ?? row.segment : 'General');

  return {
    company: row.companyName.trim(),
    category,
    city,
    state,
    gstNumber: row.gstin?.trim() || undefined,
    phone: row.phone?.trim() || undefined,
    email: row.email?.trim() || undefined,
    description: row.contactName ? `Contact: ${row.contactName.trim()}` : undefined,
  };
}

async function isDuplicateSupplier(s: SupplierImportInput): Promise<boolean> {
  const byCompany = await prisma.user.findFirst({
    where: {
      company: s.company.trim(),
      location: { contains: s.city.trim() },
    },
    select: { id: true },
  });
  if (byCompany) return true;

  if (s.phone?.trim()) {
    const byPhone = await prisma.user.findFirst({
      where: { phone: s.phone.trim() },
      select: { id: true },
    });
    if (byPhone) return true;
  }

  if (s.gstNumber?.trim()) {
    const byGst = await prisma.user.findFirst({
      where: { gstNumber: s.gstNumber.trim() },
      select: { id: true },
    });
    if (byGst) return true;
  }

  return false;
}

/**
 * Import suppliers using the same rules as POST /api/admin/import-suppliers.
 * All rows are stored as unclaimed Users with discovery provenance.
 */
export async function importDiscoverySuppliers(
  suppliers: SupplierImportInput[],
  options: DiscoveryImportOptions,
): Promise<DiscoveryImportResult> {
  const dryRun = options.dryRun === true;
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];
  const importedIds: string[] = [];
  const importedFrom = discoveryImportedFrom(
    options.source,
    options.sourceQuery?.slice(0, 80),
  );

  for (const s of suppliers) {
    if (!s.company?.trim() || !s.category?.trim() || !s.city?.trim()) {
      skipped++;
      continue;
    }

    try {
      const dup = await isDuplicateSupplier(s);
      if (dup) {
        skipped++;
        logDiscoveryEvent('discovery_ingested', {
          metadata: {
            company: s.company,
            outcome: 'skipped_duplicate',
            source: options.source,
          },
        });
        continue;
      }

      if (dryRun) {
        imported++;
        continue;
      }

      const enrichmentMeta: Record<string, unknown> = {};
      if (options.sourceQuery) enrichmentMeta.sourceQuery = options.sourceQuery;
      if (options.sourceUrl) enrichmentMeta.sourceUrl = options.sourceUrl;
      if (options.contactName) enrichmentMeta.contactName = options.contactName;

      const user = await prisma.user.create({
        data: {
          name: s.company.trim(),
          company: s.company.trim(),
          role: 'SUPPLIER',
          location: s.state ? `${s.city.trim()}, ${s.state.trim()}` : s.city.trim(),
          gstNumber: s.gstNumber?.trim() || null,
          phone: s.phone?.trim() || null,
          email: s.email?.trim() || null,
          isActive: true,
          isVerified: false,
          isClaimed: false,
          trustScore: 0,
          claimToken: randomUUID(),
          importedFrom,
          preferences: {
            categories: [s.category.trim()],
            description: s.description || null,
            onboardingComplete: false,
            discovery: enrichmentMeta,
          },
        },
        select: { id: true },
      });

      imported++;
      importedIds.push(user.id);

      logDiscoveryEvent('discovery_ingested', {
        userId: user.id,
        metadata: {
          company: s.company,
          category: s.category,
          city: s.city,
          source: options.source,
          importedFrom,
        },
      });

      if (Object.keys(enrichmentMeta).length > 0) {
        logDiscoveryEvent('discovery_enriched', {
          userId: user.id,
          metadata: enrichmentMeta,
        });
      }
    } catch (e) {
      errors.push(`${s.company}: ${e instanceof Error ? e.message : 'unknown error'}`);
      skipped++;
    }
  }

  return { imported, skipped, errors: errors.slice(0, 20), importedIds, dryRun };
}
