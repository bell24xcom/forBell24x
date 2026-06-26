'use client';

import { useState } from 'react';
import { SEO_CHECKLIST } from '@/src/data/seo-dashboard';
import { StatusBadge } from '@/src/components/admin/seo/SeoScoreCard';

const FILTERS = ['all', 'pending', 'done', 'optional'] as const;
const OWNER_COLORS: Record<string, string> = {
  code: 'text-indigo-400',
  manual: 'text-amber-400',
  content: 'text-cyan-400',
};

export default function SeoChecklistPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');

  const items = SEO_CHECKLIST.filter(i => filter === 'all' || i.status === filter);
  const done = SEO_CHECKLIST.filter(i => i.status === 'done').length;
  const pending = SEO_CHECKLIST.filter(i => i.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{done}</p>
          <p className="text-slate-500 text-xs">Done</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{pending}</p>
          <p className="text-slate-500 text-xs">Pending</p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-400">{SEO_CHECKLIST.length}</p>
          <p className="text-slate-500 text-xs">Total</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.id}
            className={`flex flex-wrap items-start gap-3 p-4 rounded-xl border ${
              item.status === 'done'
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : item.status === 'pending'
                  ? 'bg-slate-800/40 border-slate-700/50'
                  : 'bg-slate-900/30 border-slate-800'
            }`}
          >
            <span className="text-lg shrink-0">
              {item.status === 'done' ? '✅' : item.status === 'pending' ? '○' : '◇'}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${item.status === 'done' ? 'text-slate-400 line-through' : 'text-white'}`}>
                {item.task}
              </p>
              {item.notes && <p className="text-slate-500 text-xs mt-1">{item.notes}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-bold uppercase ${OWNER_COLORS[item.owner]}`}>{item.owner}</span>
              <span className={`text-[10px] uppercase ${
                item.priority === 'high' ? 'text-red-400' : item.priority === 'medium' ? 'text-amber-400' : 'text-slate-600'
              }`}>{item.priority}</span>
              <StatusBadge status={item.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
