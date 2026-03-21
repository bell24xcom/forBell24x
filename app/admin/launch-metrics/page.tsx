'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Send, MessageCircle, Users, Zap, TrendingUp } from 'lucide-react';

interface OutreachStats {
  days: number;
  outreachSent: number;
  waClicks: number;
  subscriptions: number;
  followUp1: number;
  followUp2: number;
  drips: number;
  waClickRate: number;
  subRate: number;
  totalActionsByType: { actionType: string; count: number }[];
  dailyOutreach: { date: string; count: number }[];
}

const RANGES = [
  { label: '7 Days',  value: 7  },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
];

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

  const trendMax = data ? Math.max(1, ...data.dailyOutreach.map(d => d.count)) : 1;

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

      {data && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Outreach Sent',    value: data.outreachSent,   icon: Send,          color: 'text-blue-400',    border: 'border-blue-500/20' },
              { label: 'WA Clicks',        value: data.waClicks,       icon: MessageCircle, color: 'text-green-400',   border: 'border-green-500/20',
                sub: `${data.waClickRate}% click rate` },
              { label: 'Subscriptions',    value: data.subscriptions,  icon: Users,         color: 'text-emerald-400', border: 'border-emerald-500/20',
                sub: `${data.subRate}% of outreach` },
              { label: 'Follow-up Day 2',  value: data.followUp1,      icon: Zap,           color: 'text-indigo-400',  border: 'border-indigo-500/20' },
              { label: 'Follow-up Day 5',  value: data.followUp2,      icon: Zap,           color: 'text-purple-400',  border: 'border-purple-500/20' },
              { label: 'Drip Messages',    value: data.drips,          icon: TrendingUp,    color: 'text-orange-400',  border: 'border-orange-500/20' },
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

          {/* Outreach Funnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Outreach Funnel</h3>
              {data.outreachSent === 0 ? (
                <p className="text-slate-500 text-xs">No outreach activity in this period.</p>
              ) : (
                <div className="space-y-2">
                  {[
                    { step: 'Outreach Sent',  value: data.outreachSent,  color: 'bg-blue-500' },
                    { step: 'WA Clicked',     value: data.waClicks,      color: 'bg-green-500' },
                    { step: 'Subscribed',     value: data.subscriptions, color: 'bg-emerald-500' },
                    { step: 'Follow-up D2',   value: data.followUp1,     color: 'bg-indigo-500' },
                    { step: 'Follow-up D5',   value: data.followUp2,     color: 'bg-purple-500' },
                    { step: 'Drips',          value: data.drips,         color: 'bg-orange-500' },
                  ].map((step, i, arr) => {
                    const pct = Math.max(2, Math.round((step.value / data.outreachSent) * 100));
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

            {/* Daily Outreach Trend */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Daily Outreach Trend</h3>
              {data.dailyOutreach.length === 0 ? (
                <p className="text-slate-500 text-xs">No data yet.</p>
              ) : (
                <div className="flex items-end gap-0.5 h-24">
                  {data.dailyOutreach.map(d => {
                    const h = Math.max(2, Math.round((d.count / trendMax) * 88));
                    return (
                      <div key={d.date} className="flex flex-col items-center gap-1 flex-1"
                        title={`${d.date}: ${d.count}`}>
                        <div className="w-full bg-blue-500 rounded-t" style={{ height: `${h}px` }} />
                        {data.dailyOutreach.length <= 14 && (
                          <span className="text-[8px] text-slate-600">{d.date.slice(8)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Action Type Breakdown */}
          {data.totalActionsByType.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">All Action Types</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {data.totalActionsByType.map(a => (
                  <div key={a.actionType} className="bg-slate-700/40 rounded-lg px-3 py-2">
                    <p className="text-white text-sm font-semibold">{a.count}</p>
                    <p className="text-slate-400 text-xs truncate">{a.actionType.replace(/_/g, ' ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-xs text-slate-500">
            <strong className="text-slate-400">Data source:</strong> All numbers pulled live from InteractionMemory table.
            Email campaign tracking is handled via Brevo webhooks (not yet wired).
            Showing {days}-day window ending now.
          </div>
        </>
      )}
    </div>
  );
}
