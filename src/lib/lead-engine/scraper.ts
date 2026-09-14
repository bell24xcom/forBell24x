/**
 * VyaparSethu Lead Engine — B2B supplier scraper (CLI)
 * Delegates to Discovery Engine ingestion (unclaimed User rows).
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/lib/lead-engine/scraper.ts \
 *     --query "Steel Suppliers Kalamboli" --segment steel
 */

import { importDiscoverySuppliers, mapScrapedToImport } from '@/src/lib/discovery/ingest';
import { scrapePublicWeb } from '@/src/lib/discovery/scrape';
import type { ScrapedDiscoveryRow } from '@/src/lib/discovery/types';

export type { ScrapedDiscoveryRow as ScrapedLead };

export async function ingestLeads(
  searchQuery: string,
  segment: ScrapedDiscoveryRow['segment'] = 'other',
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  console.log(`[LeadEngine] Scraping: "${searchQuery}" (segment: ${segment})`);

  let scraped: ScrapedDiscoveryRow[] = [];
  try {
    scraped = await scrapePublicWeb(searchQuery);
  } catch (err) {
    return { inserted: 0, skipped: 0, errors: [`Scrape failed: ${(err as Error).message}`] };
  }

  console.log(`[LeadEngine] Found ${scraped.length} raw results`);

  const suppliers = scraped
    .map((row) => mapScrapedToImport({ ...row, segment }, segment || 'General'))
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const result = await importDiscoverySuppliers(suppliers, {
    source: 'scrapegraph',
    sourceQuery: searchQuery,
  });

  console.log(
    `[LeadEngine] Done — inserted: ${result.imported}, skipped: ${result.skipped}, errors: ${result.errors.length}`,
  );

  return {
    inserted: result.imported,
    skipped: result.skipped,
    errors: result.errors,
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const qIdx = args.indexOf('--query');
  const segIdx = args.indexOf('--segment');
  const query = qIdx !== -1 ? args[qIdx + 1] : 'Steel Suppliers Kalamboli India';
  const segment = segIdx !== -1 ? (args[segIdx + 1] as ScrapedDiscoveryRow['segment']) : 'other';

  ingestLeads(query, segment)
    .then((r) => {
      console.log(r);
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
