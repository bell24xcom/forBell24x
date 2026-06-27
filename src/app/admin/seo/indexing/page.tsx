'use client';

import Link from 'next/link';
import { INDEXING_STATUS, EXTERNAL_LINKS, SITE_CANONICAL } from '@/src/data/seo-dashboard';
import { StatusBadge } from '@/src/components/admin/seo/SeoScoreCard';
import { openGscInspect } from '@/src/lib/seo-analytics';

export default function SeoIndexingPage() {
  const copyUrl = async (path: string) => {
    await navigator.clipboard.writeText(`${SITE_CANONICAL}${path}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <a href={EXTERNAL_LINKS.searchConsole} target="_blank" rel="noopener noreferrer"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg">
          URL Inspection ↗
        </a>
        <a href={EXTERNAL_LINKS.sitemap} target="_blank" rel="noopener noreferrer"
          className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg hover:text-white">
          Sitemap ↗
        </a>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 text-xs uppercase tracking-wide border-b border-slate-700/50 bg-slate-900/30">
              <th className="px-5 py-3 font-medium">Page</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Last crawl</th>
              <th className="px-5 py-3 font-medium">Notes</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {INDEXING_STATUS.map(row => (
              <tr key={row.path} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="px-5 py-4">
                  <p className="text-white font-medium">{row.label}</p>
                  <p className="text-slate-500 text-xs font-mono">{row.path}</p>
                </td>
                <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                <td className="px-5 py-4 text-slate-400 text-xs">{row.lastCrawl ?? '—'}</td>
                <td className="px-5 py-4 text-slate-500 text-xs max-w-xs">{row.notes}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openGscInspect(row.path)}
                      className="text-xs text-amber-400 hover:text-amber-300"
                    >
                      Inspect in GSC ↗
                    </button>
                    <button
                      type="button"
                      onClick={() => void copyUrl(row.path)}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      Copy URL
                    </button>
                    <Link
                      href={`${SITE_CANONICAL}${row.path}`}
                      target="_blank"
                      className="text-xs text-slate-400 hover:text-slate-300"
                    >
                      View ↗
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <h3 className="text-emerald-400 font-semibold text-sm mb-2">Breadcrumbs validated</h3>
          <p className="text-slate-400 text-xs">
            /how-it-works and /founding-suppliers have valid BreadcrumbList schema. GSC Enhancements → Breadcrumbs shows 1 valid item per page.
          </p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <h3 className="text-blue-400 font-semibold text-sm mb-2">Discovery paths</h3>
          <p className="text-slate-400 text-xs">
            Sitemap.xml + internal links (header/footer, /how-it-works → /founding-suppliers). Request indexing for remaining trust pages in GSC.
          </p>
        </div>
      </div>
    </div>
  );
}
