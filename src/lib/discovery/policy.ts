/**
 * Discovery policy — public web only. Blocks known B2B marketplace domains.
 */

const MARKETPLACE_DOMAIN_DENYLIST = [
  'indiamart.com',
  'tradeindia.com',
  'alibaba.com',
  'aliexpress.com',
  'exportersindia.com',
  'dir.indiamart.com',
  'www.indiamart.com',
  'www.tradeindia.com',
];

export function isBlockedDiscoveryUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return MARKETPLACE_DOMAIN_DENYLIST.some((d) => lower.includes(d));
}

export function isBlockedDiscoveryQuery(query: string): boolean {
  const lower = query.toLowerCase();
  const blockedTerms = ['indiamart', 'tradeindia', 'alibaba'];
  return blockedTerms.some((t) => lower.includes(t));
}
