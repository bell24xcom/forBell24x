'use client';

import { useState, useEffect, useCallback } from 'react';

interface Stats {
  users:        { total: number; buyers: number; suppliers: number; newToday: number; newThisWeek: number };
  rfqs:         { total: number; active: number; completed: number; cancelled: number };
  quotes:       { total: number; accepted: number; pending: number };
  transactions: { total: number; completed: number; completedVolume: number };
  funnel:       { rfqsCreated: number; quotesSubmitted: number; quotesAccepted: number; dealsCompleted: number; conversionRate: string };
  trust:        { highTrustSuppliers: number };
  plans:        { FREE: number; PRO: number; ENTERPRISE: number };
}

const fmt = (n: number) => n.toLocaleString('en-IN');
const fmtINR = (n: number) => `₹${(n / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function StatCard({ label, value, sub, color = 'indigo' }: { label: string; value: string | number; sub?: string; color?: string }) {
  const border = color === 'green' ? 'border-green-500/30' : color === 'amber' ? 'border-amber-500/30' : color === 'rose' ? 'border-rose-500/30' : 'border-indigo-500/30';
  const text   = color === 'green' ? 'text-green-400'  : color === 'amber' ? 'text-amber-400'  : color === 'rose' ? 'text-rose-400'  : 'text-indigo-400';
  return (
    <div className={`bg-slate-800/60 border ${border} rounded-xl p-4`}>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${text}`}>{typeof value === 'number' ? fmt(value) : value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-white font-semibold">{fmt(value)} <span className="text-slate-500 text-xs">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
      else setError(data.message || 'Failed to load stats');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-red-900/30 border border-red-500/40 text-red-300 p-6 rounded-xl">
      {error} — <button onClick={fetchStats} className="underline">Retry</button>
    </div>
  );

  if (!stats) return null;

  const max = stats.funnel.rfqsCreated || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm">Live platform metrics</p>
        </div>
        <button onClick={fetchStats} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors">
          ↻ Refresh
        </button>
      </div>

      {/* User Stats */}
      <div>
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Users</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Users"    value={stats.users.total}     sub={`+${stats.users.newToday} today`} />
          <StatCard label="Suppliers"      value={stats.users.suppliers}  color="green" />
          <StatCard label="Buyers"         value={stats.users.buyers}     color="amber" />
          <StatCard label="New This Week"  value={stats.users.newThisWeek} color="indigo" />
        </div>
      </div>

      {/* RFQ + Quote Stats */}
      <div>
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Marketplace Activity</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total RFQs"     value={stats.rfqs.total}          />
          <StatCard label="Active RFQs"    value={stats.rfqs.active}    color="green" />
          <StatCard label="Quotes Sent"    value={stats.quotes.total}        />
          <StatCard label="Quotes Accepted" value={stats.quotes.accepted} color="green" />
        </div>
      </div>

      {/* Revenue */}
      <div>
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Transactions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Total Transactions"  value={stats.transactions.total}     />
          <StatCard label="Completed"           value={stats.transactions.completed}  color="green" />
          <StatCard label="GMV (completed)"     value={fmtINR(stats.transactions.completedVolume)} color="amber" />
        </div>
      </div>

      {/* Deal Funnel + Plans side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Funnel */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-slate-200 font-semibold text-sm mb-1">Deal Funnel</h2>
          <p className="text-slate-500 text-xs mb-4">Conversion: {stats.funnel.conversionRate}%</p>
          <div className="space-y-4">
            <FunnelBar label="RFQs Created"    value={stats.funnel.rfqsCreated}    max={max} color="bg-indigo-500" />
            <FunnelBar label="Quotes Submitted" value={stats.funnel.quotesSubmitted} max={max} color="bg-violet-500" />
            <FunnelBar label="Quotes Accepted"  value={stats.funnel.quotesAccepted}  max={max} color="bg-amber-500"  />
            <FunnelBar label="Deals Completed"  value={stats.funnel.dealsCompleted}  max={max} color="bg-green-500"  />
          </div>
        </div>

        {/* Plans + Trust */}
        <div className="space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h2 className="text-slate-200 font-semibold text-sm mb-4">Plan Distribution</h2>
            <div className="space-y-2 text-sm">
              {(['FREE', 'PRO', 'ENTERPRISE'] as const).map(p => (
                <div key={p} className="flex justify-between items-center">
                  <span className="text-slate-400">{p}</span>
                  <span className="text-white font-semibold">{fmt(stats.plans[p])}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h2 className="text-slate-200 font-semibold text-sm mb-2">Trust Quality</h2>
            <p className="text-3xl font-bold text-indigo-400">{fmt(stats.trust.highTrustSuppliers)}</p>
            <p className="text-slate-400 text-xs mt-1">Suppliers with trust score ≥ 70</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/admin/crm',           label: 'Manage Users',    desc: 'CRM & plan upgrades' },
          { href: '/admin/control-panel', label: 'Control Panel',   desc: 'Features & plans'    },
          { href: '/admin/rfqs',          label: 'View RFQs',       desc: 'All requests'        },
          { href: '/admin/monitoring',    label: 'System Health',   desc: 'Uptime & errors'     },
        ].map(link => (
          <a key={link.href} href={link.href}
            className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-indigo-500/50 hover:bg-slate-800 transition-all group">
            <p className="text-white text-sm font-medium group-hover:text-indigo-400 transition-colors">{link.label}</p>
            <p className="text-slate-500 text-xs mt-1">{link.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
