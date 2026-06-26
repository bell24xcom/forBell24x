'use client';

import Link from 'next/link';
import { GSC_PERFORMANCE, EXTERNAL_LINKS } from '@/src/data/seo-dashboard';

export default function SeoSearchConsolePage() {
  const { totals, queries, period, lastUpdate } = GSC_PERFORMANCE;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-slate-400 text-sm">
          Snapshot · {period} · Last updated {lastUpdate}
        </p>
        <a
          href={EXTERNAL_LINKS.searchConsole}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
        >
          Open Search Console ↗
        </a>
      </div>

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

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-200/90">
        <strong>Early-stage domain.</strong> 8 impressions at position ~69 is normal for a June 2026 launch.
        Queries are glossary/GST long-tail — core B2B marketplace terms not ranking yet. Next lever: backlinks (Crunchbase, G2, Startup India).
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/50">
          <h2 className="text-white font-semibold text-sm">Top queries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 text-xs uppercase tracking-wide border-b border-slate-700/50">
                <th className="px-5 py-3 font-medium">Query</th>
                <th className="px-5 py-3 font-medium">Impressions</th>
                <th className="px-5 py-3 font-medium">Clicks</th>
                <th className="px-5 py-3 font-medium">Likely pages</th>
              </tr>
            </thead>
            <tbody>
              {queries.map(q => (
                <tr key={q.query} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                  <td className="px-5 py-3 text-slate-200 font-medium">{q.query}</td>
                  <td className="px-5 py-3 text-amber-400 tabular-nums">{q.impressions}</td>
                  <td className="px-5 py-3 text-slate-500 tabular-nums">{q.clicks}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {q.likelyPages.map(p => (
                        <Link
                          key={p}
                          href={p}
                          target="_blank"
                          className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded"
                        >
                          {p}
                        </Link>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Video indexing (homepage)</h3>
        <p className="text-slate-400 text-sm">
          <code className="text-slate-300">brand-video.mp4</code> detected but not indexed — reason: supplementary content, not a watch page. Expected; does not block page indexing.
        </p>
      </div>

      <p className="text-slate-600 text-xs">
        Live GSC API integration deferred until &gt;100 impressions/month. Update <code className="text-slate-500">GSC_PERFORMANCE</code> in seo-dashboard.ts after each export.
      </p>
    </div>
  );
}
