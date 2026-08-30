'use client';

import { useState, useEffect, useCallback } from 'react';

interface RecentDeal {
  id: string;
  price: number;
  status: string;
  rfqTitle: string;
  buyerName: string;
  supplierName: string;
  createdAt: string;
}

interface Stats {
  users:        { total: number; buyers: number; suppliers: number; newToday: number; newThisWeek: number };
  rfqs:         { total: number; active: number; completed: number; cancelled: number; seeded?: number; real?: number };
  quotes:       { total: number; accepted: number; pending: number };
  transactions: { total: number; completed: number; completedVolume: number };
  deals?:       { total: number; active: number; escrowLocked: number; recentDeals: RecentDeal[] };
  funnel:       { rfqsCreated: number; quotesSubmitted: number; quotesAccepted: number; dealsCompleted: number; conversionRate: string };
  trust:        { highTrustSuppliers: number };
  plans:        { FREE: number; PRO: number; ENTERPRISE: number };
  range?:       string;
  pendingKyc?:         number;
  pendingKycReal?:     number;
  importedUnverified?: number;
  unansweredRfqs?:     number;
  unansweredRealRfqs?: number;
  expiringSoon?: number;
  activity?:    Array<{ type: string; label: string; time: string }>;
}

const fmt    = (n: number) => n.toLocaleString('en-IN');
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

const ACTIVITY_ICONS: Record<string, string> = { user: '🟢', rfq: '📋', quote: '💬', deal: '💰' };
const RANGES = [['1d', 'Today'], ['7d', '7 Days'], ['30d', '30 Days'], ['90d', '90 Days']];

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [range,   setRange]   = useState('7d');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`/api/admin/stats?range=${range}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setStats(data.stats);
      else setError(data.message || 'Failed to load stats');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Auto-refresh activity feed every 60s
  useEffect(() => {
    const id = setInterval(fetchStats, 60000);
    return () => clearInterval(id);
  }, [fetchStats]);

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm">Live platform metrics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Range */}
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            {RANGES.map(([v, l]) => (
              <button key={v} onClick={() => setRange(v)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${range === v ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={fetchStats} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors min-h-[32px]">
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <a href="/admin/crm?filter=unverified"
          className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4 hover:border-amber-500/60 transition-colors">
          <p className="text-amber-300 text-2xl font-bold">{stats.pendingKyc ?? 0}</p>
          <p className="text-amber-400/80 text-xs mt-1">Pending KYC — needs verification</p>
          {(stats.importedUnverified ?? 0) > 0 && (
            <p className="text-amber-700 text-xs mt-1">
              {stats.pendingKycReal ?? 0} real users · {stats.importedUnverified} imported shells
            </p>
          )}
        </a>
        <a href="/admin/rfqs?status=ACTIVE"
          className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 hover:border-blue-500/60 transition-colors">
          <p className="text-blue-300 text-2xl font-bold">{stats.unansweredRfqs ?? 0}</p>
          <p className="text-blue-400/80 text-xs mt-1">Unanswered RFQs — 0 quotes so far</p>
          {stats.unansweredRealRfqs != null && (
            <p className="text-blue-700 text-xs mt-1">
              {stats.unansweredRealRfqs} real · {(stats.unansweredRfqs ?? 0) - stats.unansweredRealRfqs} seeded
            </p>
          )}
        </a>
        <a href="/admin/rfqs"
          className="bg-rose-900/20 border border-rose-700/40 rounded-xl p-4 hover:border-rose-500/60 transition-colors">
          <p className="text-rose-300 text-2xl font-bold">{stats.expiringSoon ?? 0}</p>
          <p className="text-rose-400/80 text-xs mt-1">Expiring in 3 days — take action</p>
        </a>
      </div>

      {/* User Stats */}
      <div>
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Users</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Users"   value={stats.users.total}      sub={`+${stats.users.newToday} today`} />
          <StatCard label="Suppliers"     value={stats.users.suppliers}  color="green" />
          <StatCard label="Buyers"        value={stats.users.buyers}     color="amber" />
          <StatCard label="New This Week" value={stats.users.newThisWeek} color="indigo" />
        </div>
      </div>

      {/* RFQ + Quote Stats */}
      <div>
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Marketplace Activity</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total RFQs"     value={stats.rfqs.total}        />
          <StatCard label="Active RFQs"    value={stats.rfqs.active}  color="green" />
          <StatCard label="Quotes Sent"    value={stats.quotes.total}      />
          <StatCard label="Quotes Accepted" value={stats.quotes.accepted} color="green" />
        </div>
        {(stats.rfqs.seeded !== undefined) && (
          <div className="mt-2 flex gap-4 text-xs text-slate-500">
            <span>Real RFQs: <span className="text-green-400 font-semibold">{stats.rfqs.real ?? 0}</span></span>
            <span>Seeded: <span className="text-slate-400 font-semibold">{stats.rfqs.seeded}</span></span>
            <a href="/admin/seed-rfqs" className="text-indigo-400 hover:text-indigo-300 underline">Manage seeds →</a>
          </div>
        )}
      </div>

      {/* Revenue */}
      <div>
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Transactions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Total Transactions" value={stats.transactions.total}     />
          <StatCard label="Completed"          value={stats.transactions.completed}  color="green" />
          <StatCard label="GMV (completed)"    value={fmtINR(stats.transactions.completedVolume)} color="amber" />
        </div>
      </div>

      {/* First Transaction Status */}
      {stats.deals && (
        <div>
          <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
            First Transaction Dashboard
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <StatCard label="Deals Created"      value={stats.deals.total}        color="indigo" />
            <StatCard label="Active (Awaiting Payment)" value={stats.deals.active} color="amber" />
            <StatCard label="Escrow Locked"      value={stats.deals.escrowLocked} color="green" />
          </div>
          {stats.deals.recentDeals.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-slate-200 font-semibold text-sm mb-4">Recent Deals</h3>
              <div className="space-y-3">
                {stats.deals.recentDeals.map(d => (
                  <div key={d.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-700/30 last:border-0 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{d.rfqTitle}</p>
                      <p className="text-slate-500 text-xs">{d.buyerName} → {d.supplierName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-indigo-400 font-bold">₹{Number(d.price).toLocaleString('en-IN')}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        d.status === 'ESCROW_LOCKED' ? 'bg-green-900/40 text-green-400' :
                        d.status === 'ACTIVE'        ? 'bg-amber-900/40 text-amber-400' :
                                                       'bg-slate-700 text-slate-400'
                      }`}>{d.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {stats.deals.total === 0 && (
            <div className="bg-slate-800/40 border border-dashed border-slate-600 rounded-xl p-6 text-center">
              <p className="text-slate-400 text-sm">No deals yet — first transaction pending</p>
              <p className="text-slate-600 text-xs mt-1">Run the Founder Runbook from Sprint-03 Certification</p>
            </div>
          )}
        </div>
      )}

      {/* Deal Funnel + Plans + Activity Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Funnel */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-slate-200 font-semibold text-sm mb-1">Deal Funnel</h2>
          <p className="text-slate-500 text-xs mb-4">Conversion: {stats.funnel.conversionRate}%</p>
          <div className="space-y-4">
            <FunnelBar label="RFQs Created"     value={stats.funnel.rfqsCreated}    max={max} color="bg-indigo-500" />
            <FunnelBar label="Quotes Submitted" value={stats.funnel.quotesSubmitted} max={max} color="bg-violet-500" />
            <FunnelBar label="Quotes Accepted"  value={stats.funnel.quotesAccepted}  max={max} color="bg-amber-500"  />
            <FunnelBar label="Deals Completed"  value={stats.funnel.dealsCompleted}  max={max} color="bg-green-500"  />
          </div>
        </div>

        <div className="space-y-4">
          {/* Plans + Trust */}
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

      {/* Activity Feed */}
      {stats.activity && stats.activity.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-slate-200 font-semibold text-sm mb-4">Recent Activity (last 24h)</h2>
          <div className="space-y-2">
            {stats.activity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-sm py-1 border-b border-slate-700/30 last:border-0">
                <span className="text-base">{ACTIVITY_ICONS[a.type] || '•'}</span>
                <span className="text-slate-300 flex-1">{a.label}</span>
                <span className="text-slate-500 text-xs whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/admin/crm',           label: 'Manage Users',   desc: 'CRM & plan upgrades' },
          { href: '/admin/control-panel', label: 'Control Panel',  desc: 'Features & plans'    },
          { href: '/admin/rfqs',          label: 'View RFQs',      desc: 'All requests'        },
          { href: '/admin/import',        label: 'Import Suppliers', desc: 'CSV bulk upload'   },
          { href: '/admin/seed-rfqs',     label: 'Seed RFQs',      desc: 'Populate marketplace' },
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
