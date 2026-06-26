'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { EXTERNAL_LINKS, GSC_PERFORMANCE } from '@/src/data/seo-dashboard';

interface GscQuery {
  query: string;
  impressions: number;
  clicks: number;
  position?: number;
  ctr?: number;
}

interface GscData {
  source: string;
  configured: boolean;
  period: string;
  lastUpdate: string;
  totals: { clicks: number | string; impressions: number | string; ctr: string; avgPosition: string };
  queries: GscQuery[];
  setupHint?: string;
  liveError?: string;
}

export default function SeoSearchConsolePage() {
  const [data, setData] = useState<GscData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setSyncing(true);
    else setLoading(true);
    try {
      const res = await fetch('/api/admin/seo/gsc?days=28', { credentials: 'include' });
      const json = await res.json();
      setData(json);
    } catch {
      setData({
        source: 'snapshot',
        configured: false,
        period: GSC_PERFORMANCE.period,
        lastUpdate: GSC_PERFORMANCE.lastUpdate,
        totals: GSC_PERFORMANCE.totals,
        queries: GSC_PERFORMANCE.queries.map(q => ({
          query: q.query,
          impressions: q.impressions,
          clicks: q.clicks,
        })),
      });
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = data?.totals ?? GSC_PERFORMANCE.totals;
  const queries = data?.queries ?? GSC_PERFORMANCE.queries;
  const isLive = data?.source === 'live';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-slate-400 text-sm">
            {data?.period ?? GSC_PERFORMANCE.period} · Last updated {data?.lastUpdate?.slice(0, 10) ?? GSC_PERFORMANCE.lastUpdate}
          </p>
          <p className="text-slate-600 text-xs mt-1">
            Source:{' '}
            <span className={isLive ? 'text-emerald-400' : 'text-amber-400'}>
              {isLive ? 'GSC API live' : data?.source === 'snapshot' ? 'Static snapshot' : 'Loading…'}
            </span>
            {data?.configured === false && ' · API not configured'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => load(true)}
            disabled={syncing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg"
          >
            {syncing ? 'Syncing…' : 'Sync from GSC API'}
          </button>
          <a
            href={EXTERNAL_LINKS.searchConsole}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg border border-slate-700"
          >
            Open GSC ↗
          </a>
        </div>
      </div>

      {!data?.configured && data?.setupHint && (
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 text-sm text-indigo-200">
          <p className="font-semibold mb-2">Enable live GSC sync</p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-indigo-300/90">
            <li>Google Cloud Console → enable <strong>Search Console API</strong></li>
            <li>Create service account → download JSON key</li>
            <li>GSC → Settings → Users → add service account email as <strong>Full</strong></li>
            <li>Vercel env: <code className="text-indigo-200">GSC_SERVICE_ACCOUNT_JSON</code> = full JSON (one line)</li>
            <li>Optional: <code className="text-indigo-200">GSC_SITE_URL=sc-domain:vyaparsethu.com</code></li>
          </ol>
        </div>
      )}

      {data?.liveError && (
        <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4 text-sm text-red-300">
          Live sync failed: {data.liveError}. Showing snapshot fallback.
        </div>
      )}

      {loading ? (
        <p className="text-slate-500 text-sm">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total clicks', value: totals.clicks, color: 'text-white' },
              { label: 'Total impressions', value: totals.impressions, color: 'text-amber-400' },
              { label: 'Average CTR', value: totals.ctr, color: 'text-white' },
              { label: 'Average position', value: totals.avgPosition, color: 'text-red-400' },
            ].map(m => (
              <div key={m.label} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">{m.label}</p>
                <p className={`text-3xl font-black tabular-nums ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/50 flex justify-between items-center">
              <h2 className="text-white font-semibold text-sm">Top queries</h2>
              <Link href="/admin/seo/analyze" className="text-xs text-indigo-400">Analyze CSV →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 text-xs uppercase border-b border-slate-700/50">
                    <th className="px-5 py-3">Query</th>
                    <th className="px-5 py-3">Impressions</th>
                    <th className="px-5 py-3">Clicks</th>
                    <th className="px-5 py-3">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {queries.map(q => (
                    <tr key={q.query} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                      <td className="px-5 py-3 text-slate-200 font-medium">{q.query}</td>
                      <td className="px-5 py-3 text-amber-400 tabular-nums">{q.impressions}</td>
                      <td className="px-5 py-3 text-slate-500 tabular-nums">{q.clicks}</td>
                      <td className="px-5 py-3 text-slate-400 tabular-nums">
                        {'position' in q && q.position ? q.position.toFixed(1) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
