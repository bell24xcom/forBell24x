/**
 * Public-web discovery via ScrapeGraphAI + Google search results.
 * Does not scrape IndiaMART, TradeIndia, Alibaba, or marketplace databases.
 */

import type { ScrapedDiscoveryRow } from './types';
import { isBlockedDiscoveryQuery, isBlockedDiscoveryUrl } from './policy';

export async function scrapePublicWeb(query: string): Promise<ScrapedDiscoveryRow[]> {
  if (isBlockedDiscoveryQuery(query)) {
    throw new Error('Query references a blocked marketplace source. Use public company websites only.');
  }

  const apiKey = process.env.SCRAPEGRAPH_API_KEY;
  if (!apiKey) {
    throw new Error('SCRAPEGRAPH_API_KEY not set — configure for public-web discovery');
  }

  const res = await fetch('https://api.scrapegraphai.com/v1/smartscraper', {
    method: 'POST',
    headers: { 'SGAI-APIKEY': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      website_url: `https://www.google.com/search?q=${encodeURIComponent(query + ' India supplier contact email')}`,
      user_prompt:
        'Extract B2B supplier details from public company websites only. ' +
        'Do NOT use IndiaMART, TradeIndia, or Alibaba. ' +
        'Return JSON array with: companyName, contactName, email, phone, gstin, location, sourceUrl.',
    }),
  });

  if (!res.ok) throw new Error(`ScrapeGraph API error: ${res.status}`);
  const data = await res.json();
  const rows = (data.result ?? []) as ScrapedDiscoveryRow[];

  return rows.filter((r) => r.companyName?.trim() && !isBlockedDiscoveryUrl(r.sourceUrl));
}
