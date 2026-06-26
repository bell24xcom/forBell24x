/**
 * Fire GA4 events + open GSC deep links from SEO Cockpit.
 */

export function trackSeoEvent(eventName: string, params?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gtag || !gaId) return;
  gtag('event', eventName, { ...params, send_to: gaId });
}

export function openGscInspect(path: string) {
  const site = 'https://www.vyaparsethu.com';
  const url = `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent('sc-domain:vyaparsethu.com')}&id=${encodeURIComponent(site + path)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  trackSeoEvent('seo_gsc_inspect', { page_path: path });
}

export function openRichResultsTest(path: string) {
  const site = 'https://www.vyaparsethu.com';
  window.open(
    `https://search.google.com/test/rich-results?url=${encodeURIComponent(site + path)}`,
    '_blank',
    'noopener,noreferrer',
  );
  trackSeoEvent('seo_rich_results_test', { page_path: path });
}

export function copyRankReportCsv(rows: { keyword: string; position: string; competitor: string; compPosition: string }[]) {
  const header = 'Keyword,Your Position,Competitor,Competitor Est. Position\n';
  const body = rows.map(r => `"${r.keyword}",${r.position},"${r.competitor}",${r.compPosition}`).join('\n');
  return header + body;
}
