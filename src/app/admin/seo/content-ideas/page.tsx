'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CONTENT_IDEAS_B2B_MARKETPLACE, CONTENT_IDEA_SEEDS } from '@/src/data/seo-content-ideas';

export default function ContentIdeasPage() {
  const [seed, setSeed] = useState<string>('all');
  const [sort, setSort] = useState<'visits' | 'backlinks'>('visits');

  const items = useMemo(() => {
    let list = [...CONTENT_IDEAS_B2B_MARKETPLACE];
    if (seed !== 'all') list = list.filter(i => i.seedKeyword === seed);
    list.sort((a, b) => (sort === 'visits' ? b.estVisits - a.estVisits : b.backlinks - a.backlinks));
    return list;
  }, [seed, sort]);

  const exportCsv = () => {
    const header = 'Title,URL,Est Visits,Backlinks,VyaparSethu Angle\n';
    const rows = items.map(i =>
      `"${i.title}","${i.url}",${i.estVisits},${i.backlinks},"${i.vyaparsethuAngle ?? ''}"`,
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vyaparsethu-content-ideas.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
        Competitor content ranking for seed keywords — manual SERP research. Use angles to plan VyaparSethu pages.
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={seed}
          onChange={e => setSeed(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-3 py-1.5"
        >
          <option value="all">All seeds</option>
          {CONTENT_IDEA_SEEDS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSort(s => (s === 'visits' ? 'backlinks' : 'visits'))}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-400 hover:text-white"
        >
          Sort: {sort === 'visits' ? 'Est. visits' : 'Backlinks'} ↕
        </button>
        <button
          type="button"
          onClick={exportCsv}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs text-white font-medium ml-auto"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/60">
            <tr className="text-slate-500 text-xs text-left">
              <th className="p-3">Page title</th>
              <th className="p-3">URL</th>
              <th className="p-3">Est. visits</th>
              <th className="p-3">Backlinks</th>
              <th className="p-3">VyaparSethu angle</th>
            </tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row.id} className="border-t border-slate-800/80 hover:bg-slate-800/30">
                <td className="p-3 text-slate-200 max-w-xs">{row.title}</td>
                <td className="p-3">
                  <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 text-xs truncate block max-w-[200px]">
                    {row.url.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </td>
                <td className="p-3 font-mono text-amber-400">{row.estVisits.toLocaleString()}</td>
                <td className="p-3 font-mono text-slate-400">{row.backlinks}</td>
                <td className="p-3 text-slate-500 text-xs max-w-sm">{row.vyaparsethuAngle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-slate-600 text-xs">
        Add more seeds in <code className="text-slate-500">src/data/seo-content-ideas.ts</code> or upload CSV at{' '}
        <Link href="/admin/seo/analyze" className="text-indigo-400">AI Analyze</Link>.
      </p>
    </div>
  );
}
