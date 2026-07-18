'use client';

import { useCallback, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { FLAGS } from '@/src/lib/feature-flags';

interface IndustryRow {
  slug: string;
  name: string;
  completenessScore: number;
  relatedClusterSlugs?: string[];
}

export default function IndustryIntelligenceAdminPage() {
  if (!FLAGS.INTELLIGENCE_ENABLED) {
    notFound();
  }

  const [industries, setIndustries] = useState<IndustryRow[]>([]);
  const [selected, setSelected] = useState<IndustryRow & { description?: string; trends?: Record<string, string>; products?: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadList = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/industry-intelligence', { credentials: 'include' });
    const json = await res.json();
    if (json.success) setIndustries(json.industries ?? []);
    setLoading(false);
  }, []);

  const loadDetail = async (slug: string) => {
    const res = await fetch(`/api/admin/industry-intelligence?slug=${slug}`, { credentials: 'include' });
    const json = await res.json();
    if (json.success) setSelected(json.industry);
  };

  useEffect(() => { loadList(); }, [loadList]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Industry Intelligence</h1>
        <p className="text-slate-400 text-sm mt-1">Vertical knowledge for the Business Knowledge Graph</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/50 text-white font-medium text-sm">Industries</div>
          {loading ? (
            <p className="p-4 text-slate-500 text-sm">Loading…</p>
          ) : (
            <ul className="divide-y divide-slate-700/40">
              {industries.map(i => (
                <li key={i.slug}>
                  <button
                    type="button"
                    onClick={() => loadDetail(i.slug)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-700/30"
                  >
                    <div className="flex justify-between">
                      <span className="text-white text-sm font-medium">{i.name}</span>
                      <span className="text-emerald-400 text-xs">{i.completenessScore}%</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
          {selected ? (
            <div className="space-y-4">
              <h2 className="text-white font-semibold text-lg">{selected.name}</h2>
              <p className="text-slate-400 text-sm">{selected.description}</p>
              {selected.trends && (
                <div className="space-y-2 text-xs">
                  {Object.entries(selected.trends).map(([k, v]) => v && (
                    <div key={k}><span className="text-slate-500 capitalize">{k.replace(/Trend$/, '')}: </span><span className="text-slate-300">{v}</span></div>
                  ))}
                </div>
              )}
              {selected.products && (
                <div>
                  <p className="text-slate-500 text-xs mb-2">Linked products</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.products.map(p => (
                      <span key={p} className="text-xs px-2 py-1 rounded border border-[#D4AF37]/30 text-[#D4AF37]">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Select an industry vertical.</p>
          )}
        </div>
      </div>
    </div>
  );
}
