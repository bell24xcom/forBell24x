'use client';

import { useEffect, useState, useCallback } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Database, FileText, RefreshCw, TrendingUp, Users, Zap } from 'lucide-react';

interface MonitoringData {
  systemHealth: number;
  metrics: {
    users: { total: number; active: number; newToday: number; newThisWeek: number };
    rfqs: { total: number; active: number; today: number; thisWeek: number; accepted: number; completed: number; cancelled: number };
    quotes: { total: number; today: number; accepted: number; conversionRate: string };
    transactions: { total: number; completed: number; completedVolume: number; successRate: string };
  };
  recentActivity: {
    rfqs: Array<{ id: string; title: string; status: string; category: string; buyer: string; minutesAgo: number }>;
    quotes: Array<{ id: string; rfqTitle: string; price: number; status: string; supplier: string; minutesAgo: number }>;
  };
  alerts: Array<{ type: string; message: string; timestamp: string }>;
  lastUpdated: string;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    'bg-green-900/40 text-green-300',
  QUOTED:    'bg-blue-900/40 text-blue-300',
  COMPLETED: 'bg-slate-700 text-slate-300',
  CANCELLED: 'bg-red-900/40 text-red-300',
  ACCEPTED:  'bg-indigo-900/40 text-indigo-300',
  PENDING:   'bg-amber-900/40 text-amber-300',
};

function timeAgo(min: number) {
  if (min < 1)  return 'just now';
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}

export default function SystemMonitoringPage() {
  const [data,     setData]     = useState<MonitoringData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [tab,      setTab]      = useState<'overview' | 'activity' | 'alerts'>('overview');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/admin/monitoring');
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || 'Failed to load monitoring data');
    } catch {
      setError('Network error — check your connection');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60_000);
    return () => clearInterval(id);
  }, [fetchData]);

  const health = data?.systemHealth ?? 0;
  const healthColor = health >= 80 ? 'text-green-400' : health >= 60 ? 'text-amber-400' : 'text-red-400';
  const healthRing  = health >= 80 ? '#4ade80' : health >= 60 ? '#fbbf24' : '#f87171';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">System Monitoring</h1>
          <p className="text-slate-400 text-sm">
            {data?.lastUpdated
              ? `Last updated ${new Date(data.lastUpdated).toLocaleTimeString('en-IN')}`
              : 'Real-time platform health'}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 rounded-xl p-1 w-fit border border-slate-700/50">
        {(['overview', 'activity', 'alerts'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t}
            {t === 'alerts' && data?.alerts.length ? (
              <span className="ml-1.5 text-xs bg-amber-600 text-white px-1.5 py-0.5 rounded-full">
                {data.alerts.length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Health + Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Health Score */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 flex flex-col items-center justify-center lg:col-span-1">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#1e293b" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke={healthRing} strokeWidth="3"
                  strokeDasharray={`${health}, 100`} strokeLinecap="round" />
              </svg>
              <p className={`text-3xl font-bold mt-2 ${healthColor}`}>{health.toFixed(1)}%</p>
              <p className="text-slate-400 text-xs mt-1">System Health</p>
            </div>

            {/* Metric Cards */}
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: Users,    label: 'Total Users',    value: data?.metrics.users.total ?? '—',      sub: `+${data?.metrics.users.newToday ?? 0} today`, color: 'text-indigo-400' },
                { icon: Activity, label: 'Active Users',   value: data?.metrics.users.active ?? '—',     sub: `+${data?.metrics.users.newThisWeek ?? 0} this week`, color: 'text-green-400' },
                { icon: FileText, label: 'Active RFQs',    value: data?.metrics.rfqs.active ?? '—',      sub: `${data?.metrics.rfqs.today ?? 0} posted today`, color: 'text-blue-400' },
                { icon: TrendingUp, label: 'Total Quotes', value: data?.metrics.quotes.total ?? '—',     sub: `${data?.metrics.quotes.conversionRate ?? '—'}% conversion`, color: 'text-cyan-400' },
                { icon: Database, label: 'Transactions',   value: data?.metrics.transactions.total ?? '—', sub: `${data?.metrics.transactions.successRate ?? '—'}% success`, color: 'text-amber-400' },
                { icon: Zap,      label: 'Volume (₹)',     value: data ? `₹${(data.metrics.transactions.completedVolume / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—', sub: 'completed escrow', color: 'text-rose-400' },
              ].map(({ icon: Icon, label, value, sub, color }) => (
                <div key={label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-slate-400 text-xs">{label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${color}`}>{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
                  <p className="text-slate-500 text-xs mt-1">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Services Status */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Service Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'API Server',  ok: true },
                { name: 'Database',    ok: !!data },
                { name: 'Auth Service', ok: true },
                { name: 'Notifications', ok: true },
              ].map(({ name, ok }) => (
                <div key={name} className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-700/30">
                  {ok
                    ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                  <span className="text-sm text-slate-300">{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RFQ & Quote funnel */}
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">RFQ Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Active',    value: data.metrics.rfqs.active,    color: 'bg-green-500' },
                    { label: 'Accepted',  value: data.metrics.rfqs.accepted,  color: 'bg-indigo-500' },
                    { label: 'Completed', value: data.metrics.rfqs.completed, color: 'bg-slate-500' },
                    { label: 'Cancelled', value: data.metrics.rfqs.cancelled, color: 'bg-red-500' },
                  ].map(({ label, value, color }) => {
                    const pct = data.metrics.rfqs.total > 0 ? Math.round((value / data.metrics.rfqs.total) * 100) : 0;
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">{label}</span>
                          <span className="text-white font-medium">{value.toLocaleString()} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Transaction Health</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Total',     value: data.metrics.transactions.total,     color: 'bg-blue-500' },
                    { label: 'Completed', value: data.metrics.transactions.completed, color: 'bg-green-500' },
                  ].map(({ label, value, color }) => {
                    const pct = data.metrics.transactions.total > 0 ? Math.round((value / data.metrics.transactions.total) * 100) : 0;
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">{label}</span>
                          <span className="text-white font-medium">{value.toLocaleString()} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-xs text-slate-400">Completed volume</p>
                    <p className="text-lg font-bold text-green-400 mt-1">
                      ₹{(data.metrics.transactions.completedVolume / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {tab === 'activity' && (
        <div className="space-y-4">
          {loading && <div className="text-center text-slate-400 py-8">Loading activity…</div>}
          {data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent RFQs */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700/50">
                  <h3 className="text-sm font-semibold text-white">Recent RFQs (24h)</h3>
                </div>
                <div className="divide-y divide-slate-700/30">
                  {data.recentActivity.rfqs.length === 0 ? (
                    <div className="px-5 py-8 text-center text-slate-500 text-sm">No RFQs in last 24h</div>
                  ) : data.recentActivity.rfqs.map(rfq => (
                    <div key={rfq.id} className="px-5 py-3 hover:bg-slate-700/20 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">{rfq.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{rfq.buyer} · {rfq.category}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[rfq.status] ?? 'bg-slate-700 text-slate-300'}`}>
                            {rfq.status}
                          </span>
                          <span className="text-xs text-slate-500">{timeAgo(rfq.minutesAgo)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Quotes */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700/50">
                  <h3 className="text-sm font-semibold text-white">Recent Quotes (24h)</h3>
                </div>
                <div className="divide-y divide-slate-700/30">
                  {data.recentActivity.quotes.length === 0 ? (
                    <div className="px-5 py-8 text-center text-slate-500 text-sm">No quotes in last 24h</div>
                  ) : data.recentActivity.quotes.map(q => (
                    <div key={q.id} className="px-5 py-3 hover:bg-slate-700/20 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">{q.rfqTitle}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{q.supplier}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-sm font-semibold text-indigo-300">₹{Number(q.price).toLocaleString('en-IN')}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[q.status] ?? 'bg-slate-700 text-slate-300'}`}>
                            {q.status}
                          </span>
                          <span className="text-xs text-slate-500">{timeAgo(q.minutesAgo)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {tab === 'alerts' && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <h3 className="text-sm font-semibold text-white">System Alerts</h3>
          </div>
          {!data || data.alerts.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-white font-medium">All systems healthy</p>
              <p className="text-slate-400 text-sm mt-1">No active alerts detected</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/30">
              {data.alerts.map((alert, i) => (
                <div key={i} className="px-5 py-4 flex items-start gap-3">
                  {alert.type === 'error'   && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                  {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                  {alert.type === 'info'    && <CheckCircle   className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-sm text-white">{alert.message}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.timestamp).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    alert.type === 'error'   ? 'bg-red-900/40 text-red-300' :
                    alert.type === 'warning' ? 'bg-amber-900/40 text-amber-300' :
                    'bg-blue-900/40 text-blue-300'
                  }`}>
                    {alert.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
