'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, IndianRupee, Users, CreditCard, BarChart2 } from 'lucide-react';

const RANGES = [{ label: '7 Days', value: 7 }, { label: '30 Days', value: 30 }, { label: '90 Days', value: 90 }];

const PLAN_COLOR: Record<string, string> = {
  FREE:       'bg-slate-700 text-slate-300',
  PRO:        'bg-indigo-700 text-indigo-200',
  ENTERPRISE: 'bg-amber-700 text-amber-200',
};

interface RevenueData {
  allTimeRevenue:     number;
  allTimeDeposits:    number;
  periodRevenue:      number;
  periodDeposits:     number;
  avgTransaction:     number;
  planDistribution:   { plan: string; count: number }[];
  recentTransactions: {
    id: string; amount: number; description: string; reference: string | null;
    createdAt: string; user: { name: string | null; company: string | null; phone: string | null };
  }[];
  monthlyRevenue: { month: string; total: number; txnCount: number }[];
  subscriptionEvents: { userId: string | null; metadata: unknown; createdAt: string }[];
  days: number;
  // Optional — older API responses won't have these. When true, one or more
  // (not all) of the 6 underlying metrics failed to load; the rest of the
  // page still renders with real data instead of going fully blank.
  degraded?: boolean;
  errors?: Record<string, string>;
}

function fmt(n: number) {
  return `₹${(n / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function RevenuePage() {
  const [data,    setData]    = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [days,    setDays]    = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`/api/admin/revenue?days=${days}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const monthMax = data ? Math.max(1, ...data.monthlyRevenue.map(m => m.total)) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Revenue</h1>
          <p className="text-slate-400 text-sm">Wallet deposits + subscription activations</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            {RANGES.map(r => (
              <button key={r.value} onClick={() => setDays(r.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === r.value ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}>
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={fetchData} disabled={loading}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {data?.degraded && (
        <div className="bg-amber-900/30 border border-amber-700/50 text-amber-300 px-4 py-3 rounded-xl text-sm">
          Some revenue metrics failed to load and are showing as empty below ({Object.keys(data.errors ?? {}).join(', ')}). The rest of this page is live data.
        </div>
      )}
      {loading && !data && (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {data && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'All-Time Revenue',    value: fmt(data.allTimeRevenue),     icon: IndianRupee, color: 'text-amber-400',   border: 'border-amber-500/20' },
              { label: `Revenue (${days}d)`,  value: fmt(data.periodRevenue),      icon: TrendingUp,  color: 'text-green-400',  border: 'border-green-500/20' },
              { label: 'Total Deposits',       value: data.allTimeDeposits,         icon: CreditCard,  color: 'text-indigo-400', border: 'border-indigo-500/20' },
              { label: 'Avg Transaction',      value: fmt(data.avgTransaction),     icon: BarChart2,   color: 'text-cyan-400',   border: 'border-cyan-500/20' },
            ].map(c => (
              <div key={c.label} className={`bg-slate-800/60 border ${c.border} rounded-xl p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <c.icon className={`w-5 h-5 ${c.color}`} />
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">{c.label}</span>
                </div>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Plan distribution + Monthly trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Plan distribution */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> User Plans
              </h3>
              {data.planDistribution.length === 0 ? (
                <p className="text-slate-500 text-xs">No users found</p>
              ) : (
                <div className="space-y-3">
                  {data.planDistribution.map(p => (
                    <div key={p.plan} className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${PLAN_COLOR[p.plan] ?? 'bg-slate-700 text-slate-300'}`}>
                        {p.plan}
                      </span>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, (p.count / Math.max(1, data.planDistribution.reduce((s, x) => s + x.count, 0))) * 100)}%` }} />
                      </div>
                      <span className="text-white text-sm font-semibold w-10 text-right">{p.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly revenue trend */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Monthly Revenue (6 months)</h3>
              {data.monthlyRevenue.length === 0 ? (
                <p className="text-slate-500 text-xs">No revenue data yet</p>
              ) : (
                <div className="flex items-end gap-2 h-28">
                  {data.monthlyRevenue.map(m => {
                    const barH = Math.max(4, Math.round((m.total / monthMax) * 96));
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1" title={`${m.month}: ${fmt(m.total)} (${m.txnCount} txns)`}>
                        <span className="text-[9px] text-slate-400">{fmt(m.total)}</span>
                        <div className="w-full bg-amber-500 rounded-t" style={{ height: `${barH}px` }} />
                        <span className="text-[9px] text-slate-500">{m.month.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent transactions */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Recent Deposits</h3>
            {data.recentTransactions.length === 0 ? (
              <p className="text-slate-500 text-xs">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {data.recentTransactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-700/40 text-sm">
                    <div className="min-w-0">
                      <p className="text-white font-medium text-xs truncate">
                        {t.user.company ?? t.user.name ?? t.user.phone ?? 'Unknown'}
                      </p>
                      <p className="text-slate-500 text-xs truncate">{t.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-green-400 font-semibold text-sm">{fmt(t.amount)}</p>
                      <p className="text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subscription activations */}
          {data.subscriptionEvents.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Recent Subscriptions ({days}d)</h3>
              <div className="space-y-2">
                {data.subscriptionEvents.map((e, i) => {
                  const meta = e.metadata as Record<string, unknown> | null;
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/40 text-xs">
                      <div>
                        <span className={`px-2 py-0.5 rounded font-semibold mr-2 ${PLAN_COLOR[String(meta?.userPlan ?? 'PRO')] ?? 'bg-slate-700 text-slate-300'}`}>
                          {String(meta?.plan ?? '—').toUpperCase()}
                        </span>
                        <span className="text-slate-400">{String(meta?.userPlan ?? '')}</span>
                      </div>
                      <span className="text-slate-500">{new Date(e.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
