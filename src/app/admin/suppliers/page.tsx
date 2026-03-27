'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Building, Phone, Star } from 'lucide-react';

interface Supplier {
  id: string; name: string; company: string | null; phone: string | null;
  email: string | null; trustScore: number; isActive: boolean; isClaimed: boolean;
  plan: string; categories: string[]; quoteCount: number; dealCount: number;
  joinedAt: string;
}

interface SuppliersResponse {
  suppliers: Supplier[];
  pagination: { page: number; limit: number; total: number; pages: number };
  stats: { total: number; active: number; withPhone: number; highTrust: number };
}

const PLAN_COLOR: Record<string, string> = {
  FREE:       'bg-slate-700 text-slate-300',
  PRO:        'bg-indigo-800 text-indigo-200',
  ENTERPRISE: 'bg-amber-800 text-amber-200',
};

export default function SuppliersPage() {
  const [data,     setData]     = useState<SuppliersResponse | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [query,    setQuery]    = useState('');   // debounced search

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page), search: query });
      const res  = await fetch(`/api/admin/suppliers?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white">Suppliers</h1>
          <p className="text-slate-400 text-sm">
            {data ? `${data.stats.total} total · ${data.stats.active} active · ${data.stats.withPhone} with phone · ${data.stats.highTrust} high-trust` : 'Loading…'}
          </p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total',      value: data.stats.total,     color: 'text-blue-400',    border: 'border-blue-500/20' },
            { label: 'Active',     value: data.stats.active,    color: 'text-green-400',   border: 'border-green-500/20' },
            { label: 'With Phone', value: data.stats.withPhone, color: 'text-cyan-400',    border: 'border-cyan-500/20' },
            { label: 'High Trust', value: data.stats.highTrust, color: 'text-amber-400',   border: 'border-amber-500/20' },
          ].map(s => (
            <div key={s.label} className={`bg-slate-800/60 border ${s.border} rounded-xl p-4`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, company, phone…"
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
          Search
        </button>
      </form>

      {error && <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {loading && !data && (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Table */}
      {data && (
        <>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Supplier</th>
                    <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Phone</th>
                    <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Categories</th>
                    <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Trust</th>
                    <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Activity</th>
                    <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Plan</th>
                    <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {data.suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-slate-500 py-12 text-sm">
                        <Building className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                        No suppliers found
                      </td>
                    </tr>
                  ) : data.suppliers.map(s => (
                    <tr key={s.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium text-sm">{s.company ?? s.name}</p>
                        {s.company && <p className="text-slate-500 text-xs">{s.name}</p>}
                        <p className="text-slate-600 text-xs font-mono">{s.id.slice(0, 8)}…</p>
                      </td>
                      <td className="px-4 py-3">
                        {s.phone ? (
                          <span className="flex items-center gap-1 text-slate-300 text-xs">
                            <Phone className="w-3 h-3 text-green-500" />{s.phone}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {s.categories.length > 0
                            ? s.categories.slice(0, 2).map(c => (
                                <span key={c} className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{c}</span>
                              ))
                            : <span className="text-slate-600 text-xs">—</span>
                          }
                          {s.categories.length > 2 && (
                            <span className="text-[10px] text-slate-500">+{s.categories.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs font-semibold ${
                          s.trustScore >= 70 ? 'text-green-400' :
                          s.trustScore >= 40 ? 'text-amber-400' : 'text-slate-500'
                        }`}>
                          <Star className="w-3 h-3" /> {s.trustScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        <span className="text-white">{s.quoteCount}</span> quotes ·{' '}
                        <span className="text-white">{s.dealCount}</span> deals
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${PLAN_COLOR[s.plan] ?? PLAN_COLOR.FREE}`}>
                          {s.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                          s.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                        }`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-slate-500 text-xs">
                Showing {(data.pagination.page - 1) * data.pagination.limit + 1}–
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs disabled:opacity-40 hover:bg-slate-700 transition-colors">
                  Previous
                </button>
                <button onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                  disabled={page === data.pagination.pages}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs disabled:opacity-40 hover:bg-slate-700 transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
