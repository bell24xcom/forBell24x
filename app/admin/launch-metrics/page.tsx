'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Send, MessageCircle, Users, Zap, TrendingUp } from 'lucide-react';

interface OutreachPeriod {
  outreachSent: number;
  followUp1: number;
  followUp2: number;
  drip3: number;
  drip7: number;
  drip14: number;
  subscriptions: number;
  waClicks: number;
  uniqueSuppliersReached: number;
  conversionRate: string;
}

interface RecentEvent {
  actionType: string;
  userId: string | null;
  source: string | null;
  metadata: unknown;
  createdAt: string;
}

interface OutreachStats {
  success: boolean;
  days: number;
  period: OutreachPeriod;
  allTime: Omit<OutreachPeriod, 'uniqueSuppliersReached' | 'conversionRate' | 'waClicks'>;
  recentEvents: RecentEvent[];
}

const RANGES = [
  { label: '7 Days',  value: 7  },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
];

function relTime(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (d < 60) return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d / 60)}h ago`;
  return `${Math.floor(d / 1440)}d ago`;
}

export default function LaunchMetricsPage() {
  const [data,    setData]    = useState<OutreachStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [days,    setDays]    = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`/api/admin/outreach-stats?days=${days}`);
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

  const p = data?.period;
  const drips = (p?.drip3 ?? 0) + (p?.drip7 ?? 0) + (p?.drip14 ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Launch Metrics</h1>
          <p className="text-slate-400 text-sm">Real outreach activity from InteractionMemory. Zero mock data.</p>
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

      {loading && !data && (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {data && p && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Outreach Sent',    value: p.outreachSent,           icon: Send,          color: 'text-blue-400',    border: 'border-blue-500/20' },
              { label: 'WA Clicks',        value: p.waClicks,               icon: MessageCircle, color: 'text-green-400',   border: 'border-green-500/20',
                sub: `${p.conversionRate}% conv rate` },
              { label: 'Subscriptions',    value: p.subscriptions,          icon: Users,         color: 'text-emerald-400', border: 'border-emerald-500/20',
                sub: `${p.uniqueSuppliersReached} unique suppliers` },
              { label: 'Follow-up Day 2',  value: p.followUp1,              icon: Zap,           color: 'text-indigo-400',  border: 'border-indigo-500/20' },
              { label: 'Follow-up Day 5',  value: p.followUp2,              icon: Zap,           color: 'text-purple-400',  border: 'border-purple-500/20' },
              { label: 'Drip Messages',    value: drips,                    icon: TrendingUp,    color: 'text-orange-400',  border: 'border-orange-500/20',
                sub: `D3:${p.drip3} D7:${p.drip7} D14:${p.drip14}` },
            ].map(card => (
              <div key={card.label} className={`bg-slate-800/60 border ${card.border} rounded-xl p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">{card.label}</span>
                </div>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                {'sub' in card && card.sub && <p className="text-slate-500 text-xs mt-0.5">{card.sub}</p>}
              </div>
            ))}
          </div>

          {/* Funnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Outreach Funnel (Period)</h3>
              {p.outreachSent === 0 ? (
                <p className="text-slate-500 text-xs">No outreach activity in this period.</p>
              ) : (
                <div className="space-y-2">
                  {[
                    { step: 'Outreach Sent', value: p.outreachSent,   color: 'bg-blue-500' },
                    { step: 'WA Clicked',    value: p.waClicks,       color: 'bg-green-500' },
                    { step: 'Subscribed',    value: p.subscriptions,  color: 'bg-emerald-500' },
                    { step: 'Follow-up D2',  value: p.followUp1,      color: 'bg-indigo-500' },
                    { step: 'Follow-up D5',  value: p.followUp2,      color: 'bg-purple-500' },
                    { step: 'Drip Total',    value: drips,            color: 'bg-orange-500' },
                  ].map((step, i, arr) => {
                    const base = arr[0].value || 1;
                    const pct  = Math.max(2, Math.round((step.value / base) * 100));
                    const convPct = i > 0 && arr[i - 1].value > 0
                      ? ((step.value / arr[i - 1].value) * 100).toFixed(0) : null;
                    return (
                      <div key={step.step} className="flex items-center gap-3">
                        <span className="text-slate-400 text-xs w-28 shrink-0">{step.step}</span>
                        <div className="flex-1 h-7 bg-slate-700 rounded-lg overflow-hidden">
                          <div className={`h-full ${step.color} rounded-lg flex items-center px-2 transition-all`}
                            style={{ width: `${pct}%` }}>
                            <span className="text-white text-xs font-semibold">{step.value}</span>
                          </div>
                        </div>
                        {convPct !== null && (
                          <span className="text-slate-500 text-xs w-10 text-right shrink-0">{convPct}%</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* All-time totals */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">All-Time Totals</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Outreach',     value: data.allTime.outreachSent },
                  { label: 'Follow-up D2', value: data.allTime.followUp1 },
                  { label: 'Follow-up D5', value: data.allTime.followUp2 },
                  { label: 'Drip D3',      value: data.allTime.drip3 },
                  { label: 'Drip D7',      value: data.allTime.drip7 },
                  { label: 'Drip D14',     value: data.allTime.drip14 },
                  { label: 'Subscribed',   value: data.allTime.subscriptions },
                ].map(item => (
                  <div key={item.label} className="bg-slate-700/40 rounded-lg px-3 py-2">
                    <p className="text-white text-sm font-semibold">{item.value}</p>
                    <p className="text-slate-400 text-xs">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Events */}
          {data.recentEvents.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Recent Events</h3>
              <div className="space-y-1">
                {data.recentEvents.slice(0, 15).map((e, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-700/30 last:border-0">
                    <span className="text-slate-300">{e.actionType.replace(/_/g, ' ')}</span>
                    <span className="text-slate-500">{relTime(e.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-xs text-slate-500">
            <strong className="text-slate-400">Data source:</strong> All numbers pulled live from InteractionMemory table.
            Email campaign tracking handled via Brevo webhooks (not yet wired).
            Showing {days}-day window ending now.
          </div>
        </>
      )}
    </div>
  );
}
