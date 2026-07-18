'use client';

import { useCallback, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { FLAGS } from '@/src/lib/feature-flags';

interface ProductRow {
  slug: string;
  name: string;
  category: string;
  completenessScore: number;
  family?: string;
}

interface ProductDetail extends ProductRow {
  description: string;
  missingFields: string[];
  commercial: { hsCode?: string; moq?: string; exportMarkets?: string[] };
  businessIntel: { relatedClusterSlugs?: string[]; relatedIndustrySlugs?: string[] };
}

export default function ProductIntelligenceAdminPage() {
  if (!FLAGS.INTELLIGENCE_ENABLED) {
    notFound();
  }

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [selected, setSelected] = useState<ProductDetail | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ total: number; avgCompleteness: number } | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    const url = query ? `/api/admin/product-intelligence?q=${encodeURIComponent(query)}` : '/api/admin/product-intelligence';
    const res = await fetch(url, { credentials: 'include' });
    const json = await res.json();
    if (json.success) {
      setProducts(json.products ?? []);
      setStats(json.stats ?? null);
    }
    setLoading(false);
  }, [query]);

  const loadDetail = async (slug: string) => {
    const res = await fetch(`/api/admin/product-intelligence?slug=${slug}`, { credentials: 'include' });
    const json = await res.json();
    if (json.success) setSelected(json.product);
  };

  useEffect(() => { loadList(); }, [loadList]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Product Intelligence</h1>
        <p className="text-slate-400 text-sm mt-1">Business Knowledge Graph — product entities (Digitex textile vertical seeded)</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-500 text-xs">Products</p>
            <p className="text-white text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-500 text-xs">Avg completeness</p>
            <p className="text-[#D4AF37] text-2xl font-bold">{stats.avgCompleteness}%</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search products…"
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white"
        />
        <button type="button" onClick={loadList} className="px-4 py-2 bg-[#D4AF37] text-[#001f3f] rounded-lg text-sm font-semibold">
          Search
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/50 text-white font-medium text-sm">Catalog</div>
          {loading ? (
            <p className="p-4 text-slate-500 text-sm">Loading…</p>
          ) : (
            <ul className="divide-y divide-slate-700/40 max-h-[480px] overflow-y-auto">
              {products.map(p => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => loadDetail(p.slug)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-white text-sm font-medium">{p.name}</span>
                      <span className="text-[#D4AF37] text-xs shrink-0">{p.completenessScore}%</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">{p.category}</p>
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
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500">HS Code</span><p className="text-white">{selected.commercial.hsCode ?? '—'}</p></div>
                <div><span className="text-slate-500">MOQ</span><p className="text-white">{selected.commercial.moq ?? '—'}</p></div>
              </div>
              {selected.businessIntel.relatedClusterSlugs && (
                <div>
                  <p className="text-slate-500 text-xs mb-2">Industrial clusters</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.businessIntel.relatedClusterSlugs.map(c => (
                      <span key={c} className="text-xs px-2 py-1 rounded-full border border-cyan-700/50 text-cyan-300">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {selected.missingFields.length > 0 && (
                <div>
                  <p className="text-slate-500 text-xs mb-2">Missing for 100% DNA</p>
                  <p className="text-slate-400 text-xs">{selected.missingFields.join(', ')}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Select a product to view intelligence record.</p>
          )}
        </div>
      </div>
    </div>
  );
}
