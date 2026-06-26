'use client';

import Link from 'next/link';
import { COMPETITORS, COMPETITOR_BACKLINK_GAPS } from '@/src/data/seo-opportunities';

export default function SeoCompetitorsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
        Domains that link to <strong className="text-slate-200">IndiaMART / TradeIndia</strong> but not yet to VyaparSethu.
        Curated manually — not from a paid backlink API. Prioritize listings you can create (Crunchbase, G2, JustDial).
      </div>

      <div className="flex flex-wrap gap-3">
        {COMPETITORS.map(c => (
          <a
            key={c.id}
            href={`https://${c.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white hover:border-indigo-500/50"
          >
            {c.label} ↗
          </a>
        ))}
        <Link href="/admin/seo/backlinks" className="px-4 py-2 bg-[#D4AF37] text-[#001f3f] text-sm font-semibold rounded-lg ml-auto">
          Priority backlinks (Crunchbase/G2) →
        </Link>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="text-left text-slate-500 text-[10px] uppercase tracking-wide border-b border-slate-700/50">
              <th className="px-4 py-3">Referring domain</th>
              <th className="px-4 py-3">DA</th>
              <th className="px-4 py-3">Links to competitor</th>
              <th className="px-4 py-3">VyaparSethu action</th>
            </tr>
          </thead>
          <tbody>
            {COMPETITOR_BACKLINK_GAPS.map(row => (
              <tr key={row.domain} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="px-4 py-3 text-slate-200 font-mono text-xs">{row.domain}</td>
                <td className="px-4 py-3 text-[#D4AF37] font-bold tabular-nums">{row.domainAuthority}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{row.linksTo.join(', ')}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-slate-600 text-xs">
        High-DA sites (Forbes, NYT) are aspirational PR targets. Focus on Crunchbase, G2, Startup India, JustDial, and LinkedIn first.
      </p>
    </div>
  );
}
