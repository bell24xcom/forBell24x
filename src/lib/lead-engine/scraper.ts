/**
 * VyaparSethu Lead Engine — B2B supplier scraper
 * Uses ScrapeGraphAI (or fallback HTTP search) to find suppliers and
 * inserts them into the Prisma `leads` table with deduplication.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/lib/lead-engine/scraper.ts \
 *     --query "Steel Suppliers Kalamboli" --segment steel
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export interface ScrapedLead {
  companyName:  string;
  contactName?: string;
  email?:       string;
  phone?:       string;
  gstin?:       string;
  location?:    string;
  segment:      'steel' | 'textiles' | 'packaging' | 'chemicals' | 'other';
  sourceUrl?:   string;
}

// ── ScrapeGraphAI client ──────────────────────────────────────────────────────

async function scrapegraphSearch(query: string): Promise<ScrapedLead[]> {
  const apiKey = process.env.SCRAPEGRAPH_API_KEY;
  if (!apiKey) throw new Error('SCRAPEGRAPH_API_KEY not set');

  const res = await fetch('https://api.scrapegraphai.com/v1/smartscraper', {
    method: 'POST',
    headers: { 'SGAI-APIKEY': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      website_url: `https://www.google.com/search?q=${encodeURIComponent(query + ' India supplier contact email')}`,
      user_prompt: `Extract B2B supplier details: company name, owner/contact name, email address, WhatsApp/phone number, GSTIN if visible, and city/location. Return as JSON array with fields: companyName, contactName, email, phone, gstin, location.`,
    }),
  });

  if (!res.ok) throw new Error(`ScrapeGraph API error: ${res.status}`);
  const data = await res.json();
  return (data.result ?? []) as ScrapedLead[];
}

// ── Deduplication check ───────────────────────────────────────────────────────

async function isDuplicate(phone?: string, gstin?: string): Promise<boolean> {
  if (!phone && !gstin) return false;

  const existing = await (prisma as any).lead?.findFirst({
    where: {
      OR: [
        phone ? { phone } : undefined,
        gstin ? { gstin } : undefined,
      ].filter(Boolean),
    },
  });
  return !!existing;
}

// ── Generate a secure claim token ─────────────────────────────────────────────

function generateClaimToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}

// ── Main ingestion function ───────────────────────────────────────────────────

export async function ingestLeads(
  searchQuery: string,
  segment: ScrapedLead['segment'] = 'other',
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  console.log(`[LeadEngine] Scraping: "${searchQuery}" (segment: ${segment})`);

  let scraped: ScrapedLead[] = [];
  try {
    scraped = await scrapegraphSearch(searchQuery);
  } catch (err) {
    return { inserted: 0, skipped: 0, errors: [`Scrape failed: ${(err as Error).message}`] };
  }

  console.log(`[LeadEngine] Found ${scraped.length} raw results`);

  let inserted = 0;
  let skipped  = 0;
  const errors: string[] = [];

  for (const raw of scraped) {
    if (!raw.companyName?.trim()) { skipped++; continue; }

    try {
      const isDup = await isDuplicate(raw.phone?.trim(), raw.gstin?.trim());
      if (isDup) { skipped++; continue; }

      await (prisma as any).lead?.create({
        data: {
          companyName:       raw.companyName.trim(),
          contactName:       raw.contactName?.trim()  ?? null,
          email:             raw.email?.trim()         ?? null,
          phone:             raw.phone?.trim()         ?? null,
          gstin:             raw.gstin?.trim()         ?? null,
          location:          raw.location?.trim()      ?? null,
          segment,
          status:            'new',
          isClaimed:         false,
          dpdpConsentStatus: false,
          claimToken:        generateClaimToken(),
          sourceUrl:         raw.sourceUrl             ?? null,
          sourceQuery:       searchQuery,
        },
      });
      inserted++;
    } catch (err) {
      const msg = `Failed to insert "${raw.companyName}": ${(err as Error).message}`;
      errors.push(msg);
      console.error(`[LeadEngine] ${msg}`);
    }
  }

  console.log(`[LeadEngine] Done — inserted: ${inserted}, skipped: ${skipped}, errors: ${errors.length}`);
  return { inserted, skipped, errors };
}

// ── CLI entrypoint ─────────────────────────────────────────────────────────────

if (require.main === module) {
  const args   = process.argv.slice(2);
  const qIdx   = args.indexOf('--query');
  const segIdx = args.indexOf('--segment');
  const query   = qIdx   !== -1 ? args[qIdx + 1]   : 'Steel Suppliers Kalamboli India';
  const segment = segIdx !== -1 ? args[segIdx + 1] as ScrapedLead['segment'] : 'other';

  ingestLeads(query, segment)
    .then(r => { console.log(r); process.exit(0); })
    .catch(e => { console.error(e); process.exit(1); });
}
