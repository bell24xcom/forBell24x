'use client';

import Link from 'next/link';
import type { EntityKeywordRank } from '@/lib/seo-category-keywords';
import { openGscInspect, openRichResultsTest, trackSeoEvent } from '@/lib/seo-analytics';

interface Props {
  ranks: EntityKeywordRank[];
  title?: string;
  compact?: boolean;
  pagePath?: string;
  adminLink?: boolean;
}

function posLabel(p: number | null): string {
  if (p === null) return 'Not ranked';
  if (p <= 3) return `#${p}`;
  if (p <= 10) return `#${p}`;
  if (p <= 100) return `#${p}`;
  return '100+';
}

export default function SeoRankComparisonPanel({ ranks, title = 'SEO keyword comparison', compact, pagePath, adminLink }: Props) {
  if (!ranks.length) return null;

  const primary = ranks[0];

  return (
    <section className={`border border-slate-700/60 rounded-xl bg-slate-900/40 ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h2 className={`font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>{title}</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Manual GSC tracking · competitor positions are SERP benchmarks
          </p>
        </div>
        {adminLink && (
          <Link href="/admin/seo/category-ranks" className="text-xs text-indigo-400 hover:text-indigo-300">
            SEO Pilot →
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {ranks.slice(0, compact ? 2 : 4).map(rank => (
          <div key={rank.id} className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-slate-300 text-sm font-medium">{rank.primaryKeyword}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
              <div>
                <p className="text-slate-600 uppercase text-[10px]">VyaparSethu</p>
                <p className={rank.ourPosition === null ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  {posLabel(rank.ourPosition)}
                </p>
              </div>
              {rank.competitors.slice(0, 3).map(c => (
                <div key={c.domain}>
                  <p className="text-slate-600 uppercase text-[10px] truncate">{c.name}</p>
                  <p className="text-amber-400/90 font-mono">{c.estPosition ? `#${c.estPosition}` : '—'}</p>
                </div>
              ))}
            </div>
            {rank.ourUrl && (
              <p className="text-slate-600 text-[10px] mt-1 truncate">Target: {rank.ourUrl}</p>
            )}
          </div>
        ))}
      </div>

      {pagePath && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => openGscInspect(pagePath)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-[10px] font-medium"
          >
            Inspect in GSC ↗
          </button>
          <button
            type="button"
            onClick={() => openRichResultsTest(pagePath)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-[10px] font-medium"
          >
            Rich Results Test ↗
          </button>
          <button
            type="button"
            onClick={() => {
              trackSeoEvent('seo_rank_panel_view', { entity: primary.entityName });
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-[10px] font-medium"
          >
            Log to GA4
          </button>
        </div>
      )}
    </section>
  );
}
