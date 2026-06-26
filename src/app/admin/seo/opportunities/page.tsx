'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  SEO_OPPORTUNITIES,
  type OpportunityType,
  type OpportunityPriority,
} from '@/src/data/seo-opportunities';

const STORAGE_KEY = 'seo_opp_done';

const TYPE_LABEL: Record<OpportunityType, string> = {
  seo_issue: 'SEO Issue',
  new_content: 'New Content',
  technical: 'Technical',
};

const TYPE_STYLE: Record<OpportunityType, string> = {
  seo_issue: 'bg-red-500/20 text-red-300',
  new_content: 'bg-blue-500/20 text-blue-300',
  technical: 'bg-purple-500/20 text-purple-300',
};

const PRIORITY_STYLE: Record<OpportunityPriority, string> = {
  high: 'text-red-400',
  medium: 'text-amber-400',
  low: 'text-slate-500',
};

type Filter = 'all' | OpportunityType | 'done' | 'open';

export default function SeoOpportunitiesPage() {
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  });
  const [filter, setFilter] = useState<Filter>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | OpportunityPriority>('all');

  const toggleDone = (id: string) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const items = useMemo(() => {
    return SEO_OPPORTUNITIES.filter(o => {
      if (filter === 'done' && !done[o.id]) return false;
      if (filter === 'open' && done[o.id]) return false;
      if (filter !== 'all' && filter !== 'done' && filter !== 'open' && o.type !== filter) return false;
      if (priorityFilter !== 'all' && o.priority !== priorityFilter) return false;
      return true;
    });
  }, [done, filter, priorityFilter]);

  const openCount = SEO_OPPORTUNITIES.filter(o => !done[o.id]).length;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
        Manual opportunity list for <strong className="text-slate-200">vyaparsethu.com</strong> — update{' '}
        <code className="text-slate-500">src/data/seo-opportunities.ts</code> from GSC, site audits, and SERP research.
        No paid tools required.
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-slate-500 text-xs">{openCount} open · {SEO_OPPORTUNITIES.length - openCount} done</span>
        <div className="flex flex-wrap gap-1.5 ml-auto">
          {(['all', 'open', 'done', 'seo_issue', 'new_content'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value as typeof priorityFilter)}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1"
        >
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <ol className="space-y-3">
        {items.map((opp, i) => (
          <li
            key={opp.id}
            className={`rounded-xl border p-5 transition-colors ${
              done[opp.id]
                ? 'bg-slate-900/30 border-slate-800 opacity-60'
                : 'bg-slate-800/40 border-slate-700/50'
            }`}
          >
            <div className="flex flex-wrap items-start gap-3">
              <span className="text-slate-600 font-mono text-sm w-6 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${TYPE_STYLE[opp.type]}`}>
                    {TYPE_LABEL[opp.type]}
                  </span>
                  <span className={`text-[10px] font-bold uppercase ${PRIORITY_STYLE[opp.priority]}`}>
                    {opp.priority}
                  </span>
                </div>
                <h3 className={`font-semibold text-white ${done[opp.id] ? 'line-through text-slate-500' : ''}`}>
                  {opp.title}
                </h3>
                <p className="text-slate-400 text-sm">{opp.description}</p>
                <p className="text-slate-300 text-sm">
                  <span className="text-indigo-400 font-medium">Action: </span>
                  {opp.suggestedAction}
                </p>
                {opp.contentBrief && (
                  <p className="text-slate-500 text-xs bg-slate-900/50 rounded-lg p-3">{opp.contentBrief}</p>
                )}
                {opp.targetUrl && (
                  <Link href={opp.targetUrl} className="text-xs text-indigo-400 hover:text-indigo-300">
                    Related page →
                  </Link>
                )}
              </div>
              <button
                onClick={() => toggleDone(opp.id)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  done[opp.id]
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                    : 'border-slate-600 text-slate-400 hover:border-indigo-500 hover:text-white'
                }`}
              >
                {done[opp.id] ? '✓ Done' : 'Mark as done'}
              </button>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-slate-600 text-xs">
        Tip: &quot;top 5 / top 10 / best b2b portal&quot; opportunities can share one comparison article — mark duplicates done together.
      </p>
    </div>
  );
}
