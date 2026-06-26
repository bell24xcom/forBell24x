'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CATEGORY_KEYWORD_INDEX,
  CATEGORY_RANK_SUMMARY,
  searchCategoryRanks,
  type EntityRankType,
} from '@/src/lib/seo-category-keywords';
import { copyRankReportCsv } from '@/src/lib/seo-analytics';

const TYPE_LABEL: Record<EntityRankType, string> = {
  category: 'Category',
  subcategory: 'Subcategory',
  'city-category': 'City+Category',
  supplier: 'Supplier',
  product: 'Product',
};

export default function CategoryRanksPage() {
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState<EntityRankType | 'all'>('all');

  const rows = useMemo(() => {
    let list = q ? searchCategoryRanks(q, 200) : CATEGORY_KEYWORD_INDEX.slice(0, 100);
    if (typeFilter !== 'all') list = list.filter(r => r.entityType === typeFilter);
    return list;
  }, [q, typeFilter]);

  const exportCsv = () => {
    const data = rows.flatMap(r =>
      r.competitors.map(c => ({
        keyword: r.primaryKeyword,
        position: r.ourPosition === null ? 'Not ranked' : String(r.ourPosition),
        competitor: c.name,
        compPosition: c.estPosition === null ? '—' : String(c.estPosition),
      })),
    );
    const csv = copyRankReportCsv(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vyaparsethu-category-ranks.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
        <strong className="text-slate-200">{CATEGORY_RANK_SUMMARY.totalEntities}</strong> category/subcategory keyword rows.
        Update positions from GSC — competitor columns are manual SERP benchmarks.
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
          <p className="text-slate-500 text-xs">Categories</p>
          <p className="text-xl font-bold text-white">{CATEGORY_RANK_SUMMARY.categories}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
          <p className="text-slate-500 text-xs">Subcategories</p>
          <p className="text-xl font-bold text-white">{CATEGORY_RANK_SUMMARY.subcategories}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
          <p className="text-slate-500 text-xs">Ranked (you)</p>
          <p className="text-xl font-bold text-emerald-400">{CATEGORY_RANK_SUMMARY.ranked}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
          <p className="text-slate-500 text-xs">Not ranked</p>
          <p className="text-xl font-bold text-red-400">{CATEGORY_RANK_SUMMARY.notRanked}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search category, keyword, slug…"
          className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300"
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as EntityRankType | 'all')}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300"
        >
          <option value="all">All types</option>
          {(Object.keys(TYPE_LABEL) as EntityRankType[]).map(t => (
            <option key={t} value={t}>{TYPE_LABEL[t]}</option>
          ))}
        </select>
        <button type="button" onClick={exportCsv} className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg">
          Export comparison CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700/50 max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/80 sticky top-0">
            <tr className="text-slate-500 text-xs text-left">
              <th className="p-3">Entity</th>
              <th className="p-3">Type</th>
              <th className="p-3">Primary keyword</th>
              <th className="p-3">You</th>
              <th className="p-3">IndiaMART</th>
              <th className="p-3">TradeIndia</th>
              <th className="p-3">Page</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-slate-800/80 hover:bg-slate-800/30">
                <td className="p-3 text-slate-200">{r.entityName}</td>
                <td className="p-3 text-slate-500 text-xs">{TYPE_LABEL[r.entityType]}</td>
                <td className="p-3 text-slate-400 text-xs max-w-[180px] truncate">{r.primaryKeyword}</td>
                <td className="p-3 font-mono text-red-400">{r.ourPosition ?? '—'}</td>
                <td className="p-3 font-mono text-amber-400/80">{r.competitors[0]?.estPosition ?? '—'}</td>
                <td className="p-3 font-mono text-amber-400/80">{r.competitors[1]?.estPosition ?? '—'}</td>
                <td className="p-3">
                  {r.ourUrl ? (
                    <Link href={r.ourUrl} className="text-indigo-400 text-xs hover:text-indigo-300">
                      {r.ourUrl}
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

      <p className="text-slate-600 text-xs">
        Panels also appear on <Link href="/suppliers/mumbai/construction-real-estate" className="text-indigo-400">supplier category pages</Link> and{' '}
        <Link href="/supplier" className="text-indigo-400">public supplier profiles</Link>.
        Edit index in <code className="text-slate-500">src/lib/seo-category-keywords.ts</code>.
      </p>
    </div>
  );
}
