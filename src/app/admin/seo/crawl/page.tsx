'use client';

import { useState } from 'react';

interface CrawlIssue {
  type: string;
  url: string;
  target?: string;
  status?: number;
  message: string;
}

interface CrawlResult {
  crawledAt: string;
  sitemapUrl: string;
  pagesChecked: number;
  linksChecked: number;
  issues: CrawlIssue[];
  urls: string[];
}

const TYPE_COLORS: Record<string, string> = {
  broken_internal: 'text-red-400',
  broken_external: 'text-red-400',
  redirect: 'text-amber-400',
  timeout: 'text-orange-400',
  missing_title: 'text-yellow-400',
  missing_meta: 'text-yellow-400',
};

export default function SeoCrawlPage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runCrawl() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/seo/crawl', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Crawl failed');
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Crawl failed');
    } finally {
      setRunning(false);
    }
  }

  const broken = result?.issues.filter(i => i.type === 'broken_internal') ?? [];

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
        Crawls <strong className="text-slate-200">sitemap.xml</strong> (up to 80 URLs) and checks internal links,
        titles, and meta descriptions. Free — no Ubersuggest API. Takes ~30–60s on Vercel.
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runCrawl}
          disabled={running}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
        >
          {running ? 'Crawling…' : 'Run sitemap crawl'}
        </button>
        {result && (
          <span className="text-slate-500 text-xs">
            Last run: {new Date(result.crawledAt).toLocaleString('en-IN')}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 text-red-300 text-sm">{error}</div>
      )}

      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Pages checked" value={String(result.pagesChecked)} />
            <Stat label="Links checked" value={String(result.linksChecked)} />
            <Stat label="Issues found" value={String(result.issues.length)} warn={result.issues.length > 0} />
            <Stat label="Broken internal" value={String(broken.length)} warn={broken.length > 0} />
          </div>

          {result.issues.length === 0 ? (
            <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-5 text-emerald-300 text-sm">
              No issues found in sampled pages.
            </div>
          ) : (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs border-b border-slate-700">
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Page</th>
                    <th className="text-left p-3 hidden md:table-cell">Target</th>
                    <th className="text-left p-3">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {result.issues.map((issue, i) => (
                    <tr key={i} className="border-b border-slate-800/60">
                      <td className={`p-3 text-xs font-mono ${TYPE_COLORS[issue.type] ?? 'text-slate-400'}`}>
                        {issue.type}
                      </td>
                      <td className="p-3 text-slate-300 text-xs break-all max-w-[200px]">{issue.url}</td>
                      <td className="p-3 text-slate-500 text-xs break-all hidden md:table-cell max-w-[180px]">
                        {issue.target ?? '—'}
                      </td>
                      <td className="p-3 text-slate-400 text-xs">{issue.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
      <p className="text-slate-500 text-xs">{label}</p>
      <p className={`text-xl font-bold mt-1 ${warn ? 'text-amber-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}
