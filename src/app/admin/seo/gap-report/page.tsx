'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  COMPARED_PLATFORMS,
  SEMRUSH_TOOLS,
  AHREFS_TOOLS,
  UBERSUGGEST_TOOLS,
  MOZ_TOOLS,
  SEO_GAP_MATRIX,
  BUILD_ROADMAP,
  getGapSummary,
  type GapStatus,
} from '@/src/data/seo-tool-gap-report';

const STATUS_STYLE: Record<GapStatus, string> = {
  have: 'bg-emerald-500/20 text-emerald-300',
  partial: 'bg-amber-500/20 text-amber-300',
  missing: 'bg-red-500/20 text-red-300',
  free_alt: 'bg-blue-500/20 text-blue-300',
  not_needed: 'bg-slate-700 text-slate-500',
};

const STATUS_LABEL: Record<GapStatus, string> = {
  have: 'Have',
  partial: 'Partial',
  missing: 'Missing',
  free_alt: 'Free alt',
  not_needed: 'N/A',
};

const PRIORITY_STYLE = {
  critical: 'text-red-400',
  high: 'text-amber-400',
  medium: 'text-slate-400',
  low: 'text-slate-600',
};

function PlatformToolList({ tools, name }: { tools: typeof SEMRUSH_TOOLS; name: string }) {
  const byCat = useMemo(() => {
    const m = new Map<string, typeof tools>();
    for (const t of tools) {
      const list = m.get(t.category) ?? [];
      list.push(t);
      m.set(t.category, list);
    }
    return m;
  }, [tools]);

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
      <h3 className="text-white font-semibold text-sm mb-3">{name} tools ({tools.length})</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto text-xs">
        {[...byCat.entries()].map(([cat, items]) => (
          <div key={cat}>
            <p className="text-slate-500 uppercase text-[10px] font-bold mb-1">{cat}</p>
            <ul className="space-y-1">
              {items.map(t => (
                <li key={t.id} className="text-slate-400">
                  <span className="text-slate-300">{t.name}</span> — {t.description}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SeoGapReportPage() {
  const summary = getGapSummary();
  const [filter, setFilter] = useState<GapStatus | 'all'>('all');
  const [showMissingOnly, setShowMissingOnly] = useState(false);

  const rows = useMemo(() => {
    let list = [...SEO_GAP_MATRIX];
    if (filter !== 'all') list = list.filter(r => r.vyaparsethu === filter);
    if (showMissingOnly) list = list.filter(r => r.vyaparsethu === 'missing' || r.vyaparsethu === 'partial');
    return list.sort((a, b) => {
      const p = { critical: 0, high: 1, medium: 2, low: 3 };
      return p[a.priority] - p[b.priority];
    });
  }, [filter, showMissingOnly]);

  const exportCsv = () => {
    const header = 'Feature,Category,Semrush,Ahrefs,Ubersuggest,Moz,VyaparSethu,Priority,How to Add\n';
    const body = SEO_GAP_MATRIX.map(r =>
      `"${r.feature}","${r.category}",${r.semrush},${r.ahrefs},${r.ubersuggest},${r.moz},"${r.vyaparsethu}","${r.priority}","${r.howToAdd.replace(/"/g, "'")}"`,
    ).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vyaparsethu-seo-gap-report.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
        Feature inventory from <strong className="text-slate-200">Semrush, Ahrefs, Ubersuggest, Moz</strong> official docs — compared to VyaparSethu SEO Cockpit.
        We cannot crawl their live databases (paid APIs). This report maps <em>tool types</em> and how to build or substitute each free.
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-800/40 rounded-xl p-3 border border-indigo-500/30 col-span-2 sm:col-span-1">
          <p className="text-slate-500 text-xs">Coverage</p>
          <p className="text-2xl font-bold text-indigo-400">{summary.coveragePct}%</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-emerald-500/20">
          <p className="text-slate-500 text-xs">Have</p>
          <p className="text-xl font-bold text-emerald-400">{summary.have}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-amber-500/20">
          <p className="text-slate-500 text-xs">Partial</p>
          <p className="text-xl font-bold text-amber-400">{summary.partial}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-red-500/20">
          <p className="text-slate-500 text-xs">Missing</p>
          <p className="text-xl font-bold text-red-400">{summary.missing}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
          <p className="text-slate-500 text-xs">Free alt</p>
          <p className="text-xl font-bold text-blue-400">{summary.freeAlt}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
          <p className="text-slate-500 text-xs">Features tracked</p>
          <p className="text-xl font-bold text-white">{summary.total}</p>
        </div>
      </div>

      <section className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 text-left border-b border-slate-700">
              <th className="pb-2 pr-3">Platform</th>
              <th className="pb-2 pr-3">Price</th>
              <th className="pb-2">Link</th>
            </tr>
          </thead>
          <tbody>
            {COMPARED_PLATFORMS.map(p => (
              <tr key={p.id} className="border-b border-slate-800/80">
                <td className="py-2 pr-3 text-slate-200 font-medium">{p.name}</td>
                <td className="py-2 pr-3 text-slate-500">{p.price}</td>
                <td className="py-2">
                  {p.id === 'vyaparsethu' ? (
                    <Link href={p.url} className="text-indigo-400">{p.url}</Link>
                  ) : (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400">{p.url.replace('https://', '')} ↗</a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        <PlatformToolList tools={SEMRUSH_TOOLS} name="Semrush" />
        <PlatformToolList tools={AHREFS_TOOLS} name="Ahrefs" />
        <PlatformToolList tools={UBERSUGGEST_TOOLS} name="Ubersuggest" />
        <PlatformToolList tools={MOZ_TOOLS} name="Moz Pro" />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-slate-500 text-xs">Filter:</span>
        {(['all', 'missing', 'partial', 'have', 'free_alt'] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            {f}
          </button>
        ))}
        <label className="flex items-center gap-2 text-xs text-slate-500 ml-auto">
          <input type="checkbox" checked={showMissingOnly} onChange={e => setShowMissingOnly(e.target.checked)} />
          Gaps only
        </label>
        <button type="button" onClick={exportCsv} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg">
          Export gap CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/60 sticky top-0">
            <tr className="text-slate-500 text-xs text-left">
              <th className="p-3">Feature</th>
              <th className="p-3">SE</th>
              <th className="p-3">AH</th>
              <th className="p-3">UB</th>
              <th className="p-3">Moz</th>
              <th className="p-3">You</th>
              <th className="p-3">Priority</th>
              <th className="p-3">How to add</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-slate-800/80 align-top hover:bg-slate-800/20">
                <td className="p-3">
                  <p className="text-slate-200 text-xs font-medium">{r.feature}</p>
                  <p className="text-slate-600 text-[10px]">{r.category}</p>
                  {r.vyaparsethuPage && (
                    <Link href={r.vyaparsethuPage} className="text-indigo-400 text-[10px]">{r.vyaparsethuPage}</Link>
                  )}
                </td>
                <td className="p-3 text-center">{r.semrush ? '✓' : '—'}</td>
                <td className="p-3 text-center">{r.ahrefs ? '✓' : '—'}</td>
                <td className="p-3 text-center">{r.ubersuggest ? '✓' : '—'}</td>
                <td className="p-3 text-center">{r.moz ? '✓' : '—'}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_STYLE[r.vyaparsethu]}`}>
                    {STATUS_LABEL[r.vyaparsethu]}
                  </span>
                </td>
                <td className={`p-3 text-xs font-medium ${PRIORITY_STYLE[r.priority]}`}>{r.priority}</td>
                <td className="p-3 text-slate-500 text-xs max-w-md">{r.howToAdd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="bg-[#001f3f] border border-[#D4AF37]/30 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Build roadmap (free-first)</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {BUILD_ROADMAP.map(phase => (
            <div key={phase.phase} className="bg-slate-900/40 rounded-lg p-4">
              <p className="text-[#D4AF37] text-xs font-bold mb-2">{phase.phase}</p>
              <ul className="space-y-1">
                {phase.items.map(item => (
                  <li key={item} className="text-slate-400 text-xs">• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <p className="text-slate-600 text-xs">
        Edit matrix in <code className="text-slate-500">src/data/seo-tool-gap-report.ts</code>. Cannot replicate paid link/keyword indexes — use GSC + CSV + optional SerpApi.
      </p>
    </div>
  );
}
