'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { TRACKED_KEYWORDS, RANK_SUMMARY, FREE_SEO_TOOLS, type KeywordRankStatus } from '@/src/data/seo-opportunities';

const STATUS_STYLE: Record<KeywordRankStatus, string> = {
  not_ranked: 'bg-red-500/20 text-red-300',
  unstable: 'bg-amber-500/20 text-amber-300',
  pending: 'bg-slate-600 text-slate-300',
  tracking: 'bg-emerald-500/20 text-emerald-300',
  noise: 'bg-slate-800 text-slate-600',
};

const CATEGORY_LABEL = {
  b2b_core: 'B2B core',
  local: 'Local',
  category: 'Category',
  brand: 'Brand',
  feature: 'Feature',
  noise: 'Noise',
};

export default function SeoRankingsPage() {
  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return TRACKED_KEYWORDS.filter(k => {
      if (category !== 'all' && k.category !== category) return false;
      if (status !== 'all' && k.status !== status) return false;
      if (search && !k.keyword.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [category, status, search]);

  const s = RANK_SUMMARY;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
        Rank tracking for <strong className="text-slate-200">vyaparsethu.com</strong> — B2B keywords only.
        Vyapar accounting-app terms excluded (wrong brand). Update positions in{' '}
        <code className="text-slate-500">seo-opportunities.ts</code> after GSC or manual Google checks.
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Tracked', value: s.totalKeywords },
          { label: 'Not ranking', value: s.notRanking, color: 'text-red-400' },
          { label: 'Top 3', value: s.top3 },
          { label: 'Top 10', value: s.top10 },
          { label: 'Top 100', value: s.top100 },
          { label: 'Unchanged', value: s.unchanged },
        ].map(m => (
          <div key={m.label} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 text-center">
            <p className={`text-xl font-bold tabular-nums ${m.color ?? 'text-white'}`}>{m.value}</p>
            <p className="text-slate-500 text-[10px] uppercase mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <p className="text-slate-500 text-xs">
        Last updated {s.lastUpdated} · Tracking since {s.trackingSince}. {s.note}
      </p>

      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Filter keywords…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 w-48"
        />
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5">
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5">
          <option value="all">All statuses</option>
          <option value="not_ranked">Not ranked</option>
          <option value="unstable">Unstable</option>
          <option value="pending">Pending</option>
        </select>
        <Link href="/admin/seo/opportunities" className="text-xs text-indigo-400 hover:text-indigo-300 self-center ml-auto">
          Content opportunities →
        </Link>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-slate-500 text-[10px] uppercase tracking-wide border-b border-slate-700/50">
              <th className="px-4 py-3">Keyword</th>
              <th className="px-4 py-3">Vol</th>
              <th className="px-4 py-3">SD</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Target URL</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(kw => (
              <tr key={kw.id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="px-4 py-3 text-slate-200 font-medium">{kw.keyword}</td>
                <td className="px-4 py-3 text-slate-400 tabular-nums">{kw.volume.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-400 tabular-nums">{kw.seoDifficulty}</td>
                <td className="px-4 py-3 text-slate-400 tabular-nums">{kw.position ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${STATUS_STYLE[kw.status]}`}>
                    {kw.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{CATEGORY_LABEL[kw.category]}</td>
                <td className="px-4 py-3">
                  {kw.url ? (
                    <Link href={kw.url} className="text-indigo-400 hover:text-indigo-300 text-xs font-mono">
                      {kw.url}
                    </Link>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-white text-sm font-semibold mb-2">Free tools to update this data</h3>
        <ul className="space-y-1">
          {FREE_SEO_TOOLS.map(t => (
            <li key={t.name} className="text-xs">
              <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                {t.name}
              </a>
              <span className="text-slate-500"> — {t.use}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
