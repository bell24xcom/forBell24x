'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, ShoppingBag, Phone, Clock } from 'lucide-react';

interface Customer {
  id: string; name: string; company: string | null; phone: string | null;
  email: string | null; isActive: boolean; plan: string;
  rfqCount: number; dealCount: number;
  lastCategory: string | null; lastRfqAt: string | null; lastLoginAt: string | null;
  joinedAt: string;
}

interface CustomersResponse {
  customers: Customer[];
  pagination: { page: number; limit: number; total: number; pages: number };
  stats: { totalBuyers: number; activeBuyers: number; totalRfqs: number };
}

function relativeTime(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

const PLAN_COLOR: Record<string, string> = {
  FREE:       'bg-slate-700 text-slate-300',
  PRO:        'bg-indigo-800 text-indigo-200',
  ENTERPRISE: 'bg-amber-800 text-amber-200',
};

export default function CustomersPage() {
  const [data,    setData]    = useState<CustomersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');
  const [query,   setQuery]   = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page), search: query });
      const res  = await fetch(`/api/admin/customers?${params}`);
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
          <h1 className="text-xl font-bold text-white">Customers</h1>
          <p className="text-slate-400 text-sm">
            {data
              ? `${data.stats.totalBuyers} buyers · ${data.stats.activeBuyers} active · ${data.stats.totalRfqs} total RFQs`
              : 'Loading…'}
          </p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Buyers',  value: data.stats.totalBuyers,  color: 'text-blue-400',  border: 'border-blue-500/20' },
            { label: 'Active Buyers', value: data.stats.activeBuyers, color: 'text-green-400', border: 'border-green-500/20' },
            { label: 'Total RFQs',    value: data.stats.totalRfqs,    color: 'text-purple-400', border: 'border-purple-500/20' },
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
            placeholder="Search name, company, phone, email…"
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

      {data && (
        <>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Customer</th>
                    <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Contact</th>
                    <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Activity</th>
                    <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Last RFQ</th>
                    <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Last Seen</th>
                    <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Plan</th>
                    <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {data.customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-slate-500 py-12 text-sm">
                        <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                        No customers found
                      </td>
                    </tr>
                  ) : data.customers.map(c => (
                    <tr key={c.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium text-sm">{c.company ?? c.name}</p>
                        {c.company && <p className="text-slate-500 text-xs">{c.name}</p>}
                        <p className="text-slate-600 text-xs font-mono">{c.id.slice(0, 8)}…</p>
                      </td>
                      <td className="px-4 py-3">
                        {c.phone ? (
                          <span className="flex items-center gap-1 text-slate-300 text-xs">
                            <Phone className="w-3 h-3 text-green-500" />{c.phone}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                        {c.email && <p className="text-slate-500 text-xs truncate max-w-[140px]">{c.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        <span className="text-white">{c.rfqCount}</span> RFQs ·{' '}
                        <span className="text-white">{c.dealCount}</span> deals
                      </td>
                      <td className="px-4 py-3">
                        {c.lastCategory && (
                          <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{c.lastCategory}</span>
                        )}
                        <p className="text-slate-500 text-xs mt-0.5">{relativeTime(c.lastRfqAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                          <Clock className="w-3 h-3" />{relativeTime(c.lastLoginAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${PLAN_COLOR[c.plan] ?? PLAN_COLOR.FREE}`}>
                          {c.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                          c.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                        }`}>
                          {c.isActive ? 'Active' : 'Inactive'}
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
