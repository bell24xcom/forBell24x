'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  COMPARED_PLATFORMS,
  ALL_PLATFORM_TOOLS,
  PLATFORM_TOOL_COUNTS,
  SEO_GAP_MATRIX,
  BUILD_ROADMAP,
  MISSING_FEATURES_REPORT,
  UNIQUE_VYAPARSETHU_FEATURES,
  getGapSummary,
  type GapStatus,
  type PlatformId,
} from '@/src/data/seo-tool-gap-report';

const PAID_PLATFORMS: Exclude<PlatformId, 'vyaparsethu'>[] = [
  'semrush', 'ahrefs', 'similarweb', 'ubersuggest', 'moz', 'majestic', 'seranking',
];

const PLATFORM_SHORT: Record<Exclude<PlatformId, 'vyaparsethu'>, string> = {
  semrush: 'SE',
  ahrefs: 'AH',
  similarweb: 'SW',
  ubersuggest: 'UB',
  moz: 'MZ',
  majestic: 'MJ',
  seranking: 'SR',
};

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

function PlatformToolList({ platformId, name }: { platformId: Exclude<PlatformId, 'vyaparsethu'>; name: string }) {
  const tools = ALL_PLATFORM_TOOLS[platformId];
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
      <h3 className="text-white font-semibold text-sm mb-1">{name}</h3>
      <p className="text-slate-600 text-[10px] mb-3">{tools.length} features from homepage · Jun 2026</p>
      <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
        {[...byCat.entries()].map(([cat, items]) => (
          <div key={cat}>
            <p className="text-slate-500 uppercase text-[10px] font-bold mb-0.5">{cat}</p>
            <ul className="space-y-0.5">
              {items.map(t => (
                <li key={t.id} className="text-slate-400">
                  <span className="text-slate-300">{t.name}</span>
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
  const [platformFilter, setPlatformFilter] = useState<Exclude<PlatformId, 'vyaparsethu'> | 'all'>('all');
  const [showMissingOnly, setShowMissingOnly] = useState(true);

  const rows = useMemo(() => {
    let list = [...SEO_GAP_MATRIX];
    if (filter !== 'all') list = list.filter(r => r.vyaparsethu === filter);
    if (showMissingOnly) list = list.filter(r => r.vyaparsethu === 'missing' || r.vyaparsethu === 'partial');
    if (platformFilter !== 'all') {
      list = list.filter(r => r.platforms[platformFilter]);
    }
    const pri = { critical: 0, high: 1, medium: 2, low: 3 };
    return list.sort((a, b) => pri[a.priority] - pri[b.priority]);
  }, [filter, showMissingOnly, platformFilter]);

  const exportCsv = () => {
    const cols = PAID_PLATFORMS.map(p => PLATFORM_SHORT[p]).join(',');
    const header = `Feature,Category,${cols},VyaparSethu,Priority,How to Add\n`;
    const body = SEO_GAP_MATRIX.map(r => {
      const plats = PAID_PLATFORMS.map(p => (r.platforms[p] ? 'Y' : '')).join(',');
      return `"${r.feature}","${r.category}",${plats},"${r.vyaparsethu}","${r.priority}","${r.howToAdd.replace(/"/g, "'")}"`;
    }).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vyaparsethu-seo-gap-vs-semrush-ahrefs-similarweb.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
        Feature names extracted from <strong className="text-slate-200">homepages</strong> of Semrush, Ahrefs, Similarweb,
        Ubersuggest, Moz, Majestic, SE Ranking (fetched Jun 26, 2026). Not live database crawls — marketing tool names only.
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <div className="bg-slate-800/40 rounded-xl p-3 border border-indigo-500/30 col-span-2">
          <p className="text-slate-500 text-xs">Coverage vs {summary.paidPlatformsCompared} platforms</p>
          <p className="text-2xl font-bold text-indigo-400">{summary.coveragePct}%</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-emerald-500/20">
          <p className="text-slate-500 text-[10px]">Have</p>
          <p className="text-lg font-bold text-emerald-400">{summary.have}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-amber-500/20">
          <p className="text-slate-500 text-[10px]">Partial</p>
          <p className="text-lg font-bold text-amber-400">{summary.partial}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-red-500/20">
          <p className="text-slate-500 text-[10px]">Missing</p>
          <p className="text-lg font-bold text-red-400">{summary.missing}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50 col-span-2">
          <p className="text-slate-500 text-[10px]">Unique to VyaparSethu</p>
          <p className="text-lg font-bold text-[#D4AF37]">{summary.uniqueToUs}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
          <p className="text-slate-500 text-[10px]">Tracked</p>
          <p className="text-lg font-bold text-white">{summary.total}</p>
        </div>
      </div>

      {/* Platform tool counts from homepages */}
      <div className="flex flex-wrap gap-2 text-xs">
        {COMPARED_PLATFORMS.filter(p => p.id !== 'vyaparsethu').map(p => (
          <a
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
          >
            {p.name} <span className="text-indigo-400">{PLATFORM_TOOL_COUNTS[p.id as Exclude<PlatformId, 'vyaparsethu'>]}</span> tools
          </a>
        ))}
      </div>

      {/* Homepage feature lists */}
      <div>
        <h2 className="text-white font-semibold mb-3">Tools on each platform homepage</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {PAID_PLATFORMS.map(pid => {
            const meta = COMPARED_PLATFORMS.find(p => p.id === pid)!;
            return <PlatformToolList key={pid} platformId={pid} name={meta.name} />;
          })}
        </div>
      </div>

      {/* Missing features report */}
      <section className="bg-red-950/20 border border-red-500/30 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">Missing tools report (high/critical priority)</h2>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {MISSING_FEATURES_REPORT.map(r => (
            <div key={r.feature} className="border-b border-slate-800/80 pb-2">
              <p className="text-slate-200 text-sm font-medium">{r.feature}</p>
              <p className="text-slate-600 text-[10px]">On: {r.offeredBy || '—'} · {r.priority} · {r.buildCost}</p>
              <p className="text-slate-500 text-xs mt-1">{r.howToAdd}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Unique features */}
      <section className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">VyaparSethu-only features (paid tools don&apos;t have)</h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          {UNIQUE_VYAPARSETHU_FEATURES.map(u => (
            <li key={u.feature} className="text-slate-400">
              <span className="text-emerald-300">{u.feature}</span>
              {u.page && <Link href={u.page} className="text-indigo-400 text-xs ml-2">{u.page}</Link>}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={platformFilter}
          onChange={e => setPlatformFilter(e.target.value as typeof platformFilter)}
          className="bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1.5"
        >
          <option value="all">All platforms</option>
          {PAID_PLATFORMS.map(p => (
            <option key={p} value={p}>{COMPARED_PLATFORMS.find(x => x.id === p)?.name}</option>
          ))}
        </select>
        {(['all', 'missing', 'partial', 'have'] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            {f}
          </button>
        ))}
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input type="checkbox" checked={showMissingOnly} onChange={e => setShowMissingOnly(e.target.checked)} />
          Gaps only
        </label>
        <button type="button" onClick={exportCsv} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg ml-auto">
          Export comparison CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-slate-800/60">
            <tr className="text-slate-500 text-xs text-left">
              <th className="p-3 sticky left-0 bg-slate-800/95">Feature</th>
              {PAID_PLATFORMS.map(p => (
                <th key={p} className="p-2 text-center w-8" title={COMPARED_PLATFORMS.find(x => x.id === p)?.name}>
                  {PLATFORM_SHORT[p]}
                </th>
              ))}
              <th className="p-3">You</th>
              <th className="p-3">How to add</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-slate-800/80 align-top hover:bg-slate-800/20">
                <td className="p-3 sticky left-0 bg-[#0f172a]">
                  <p className="text-slate-200 text-xs font-medium">{r.feature}</p>
                  <p className="text-slate-600 text-[10px]">{r.category}</p>
                </td>
                {PAID_PLATFORMS.map(p => (
                  <td key={p} className="p-2 text-center text-slate-500">{r.platforms[p] ? '✓' : '·'}</td>
                ))}
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_STYLE[r.vyaparsethu]}`}>
                    {STATUS_LABEL[r.vyaparsethu]}
                  </span>
                </td>
                <td className="p-3 text-slate-500 text-xs max-w-sm">{r.howToAdd}</td>
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
    </div>
  );
}
