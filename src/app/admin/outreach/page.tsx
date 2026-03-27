'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, RefreshCw, TrendingUp, ExternalLink, Zap } from 'lucide-react';

const RANGES = [{ label: '7 Days', value: 7 }, { label: '30 Days', value: 30 }, { label: '90 Days', value: 90 }];

const ACTION_LABEL: Record<string, string> = {
  outreach_sent:         'Initial Outreach',
  follow_up_1_sent:      'Day 2 Follow-up',
  follow_up_2_sent:      'Day 5 Follow-up',
  drip_day3_sent:        'Day 3 Profile Drip',
  drip_day7_sent:        'Day 7 Quote Drip',
  drip_day14_sent:       'Day 14 Re-engage',
  subscription_activated:'Subscribed',
  whatsapp_click:        'WhatsApp Clicks',
};

const ACTION_COLOR: Record<string, string> = {
  outreach_sent:         'text-blue-400 bg-blue-900/40',
  follow_up_1_sent:      'text-cyan-400 bg-cyan-900/40',
  follow_up_2_sent:      'text-indigo-400 bg-indigo-900/40',
  drip_day3_sent:        'text-blue-300 bg-blue-900/30',
  drip_day7_sent:        'text-amber-400 bg-amber-900/40',
  drip_day14_sent:       'text-red-400 bg-red-900/40',
  subscription_activated:'text-green-400 bg-green-900/40',
  whatsapp_click:        'text-green-300 bg-green-900/30',
};

interface OutreachStats {
  period: {
    outreachSent: number; followUp1: number; followUp2: number;
    drip3: number; drip7: number; drip14: number;
    subscriptions: number; waClicks: number;
    uniqueSuppliersReached: number; conversionRate: string;
  };
  allTime: {
    outreachSent: number; followUp1: number; followUp2: number;
    drip3: number; drip7: number; drip14: number; subscriptions: number;
  };
  recentEvents: { actionType: string; userId: string | null; source: string | null; metadata: unknown; createdAt: string }[];
  days: number;
}

export default function OutreachPage() {
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

  const funnel = data ? [
    { label: 'Outreach Sent',      value: data.period.outreachSent,   color: 'bg-blue-500' },
    { label: 'Day 2 Follow-up',    value: data.period.followUp1,      color: 'bg-cyan-500' },
    { label: 'Day 5 Follow-up',    value: data.period.followUp2,      color: 'bg-indigo-500' },
    { label: 'Subscribed',         value: data.period.subscriptions,  color: 'bg-green-500' },
  ] : [];
  const funnelMax = funnel.length > 0 ? Math.max(1, funnel[0].value) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Outreach Campaigns</h1>
          <p className="text-slate-400 text-sm">WhatsApp outreach, follow-ups, drip sequence, and conversion</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/dashboard/operator" target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg transition-colors">
            Operator Dashboard <ExternalLink className="w-3 h-3" />
          </a>
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
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {data && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Unique Suppliers Reached', value: data.period.uniqueSuppliersReached, color: 'text-blue-400',   border: 'border-blue-500/20' },
              { label: 'Subscriptions (period)',    value: data.period.subscriptions,          color: 'text-green-400', border: 'border-green-500/20' },
              { label: 'Conversion Rate',           value: `${data.period.conversionRate}%`,   color: 'text-amber-400', border: 'border-amber-500/20' },
              { label: 'WA Clicks (period)',        value: data.period.waClicks,               color: 'text-cyan-400',  border: 'border-cyan-500/20' },
            ].map(c => (
              <div key={c.label} className={`bg-slate-800/60 border ${c.border} rounded-xl p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className={`w-4 h-4 ${c.color}`} />
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">{c.label}</span>
                </div>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Conversion funnel */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" /> Conversion Funnel — {days}d
            </h3>
            <div className="space-y-3">
              {funnel.map((f, i) => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="w-36 text-slate-400 text-xs">{f.label}</span>
                  <div className="flex-1 h-6 bg-slate-700 rounded-lg overflow-hidden">
                    <div className={`h-full ${f.color} rounded-lg flex items-center px-2`}
                      style={{ width: `${Math.max(4, Math.round((f.value / funnelMax) * 100))}%` }}>
                      <span className="text-white text-xs font-semibold">{f.value}</span>
                    </div>
                  </div>
                  {i > 0 && funnel[i - 1].value > 0 && (
                    <span className="text-slate-500 text-xs w-14 text-right">
                      {((f.value / funnel[i - 1].value) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Period breakdown + All-time breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Period Actions ({days}d)</h3>
              <div className="space-y-2">
                {([
                  ['outreach_sent',         data.period.outreachSent],
                  ['follow_up_1_sent',      data.period.followUp1],
                  ['follow_up_2_sent',      data.period.followUp2],
                  ['drip_day3_sent',        data.period.drip3],
                  ['drip_day7_sent',        data.period.drip7],
                  ['drip_day14_sent',       data.period.drip14],
                  ['subscription_activated', data.period.subscriptions],
                ] as [string, number][]).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/30">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLOR[key] ?? 'text-slate-400 bg-slate-700'}`}>
                      {ACTION_LABEL[key] ?? key}
                    </span>
                    <span className="text-white font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> All-Time Totals
              </h3>
              <div className="space-y-2">
                {([
                  ['outreach_sent',         data.allTime.outreachSent],
                  ['follow_up_1_sent',      data.allTime.followUp1],
                  ['follow_up_2_sent',      data.allTime.followUp2],
                  ['drip_day3_sent',        data.allTime.drip3],
                  ['drip_day7_sent',        data.allTime.drip7],
                  ['drip_day14_sent',       data.allTime.drip14],
                  ['subscription_activated', data.allTime.subscriptions],
                ] as [string, number][]).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/30">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLOR[key] ?? 'text-slate-400 bg-slate-700'}`}>
                      {ACTION_LABEL[key] ?? key}
                    </span>
                    <span className="text-white font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
            {data.recentEvents.length === 0 ? (
              <p className="text-slate-500 text-xs">No outreach events in this period</p>
            ) : (
              <div className="space-y-1.5">
                {data.recentEvents.map((e, i) => {
                  const meta = e.metadata as Record<string, unknown> | null;
                  return (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-700/30 text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${ACTION_COLOR[e.actionType] ?? 'text-slate-400 bg-slate-700'}`}>
                        {ACTION_LABEL[e.actionType] ?? e.actionType}
                      </span>
                      <span className="text-slate-400 truncate flex-1">
                        {String(meta?.company ?? meta?.name ?? e.userId ?? '—')}
                        {meta?.category ? ` · ${meta.category}` : ''}
                      </span>
                      <span className="text-slate-600 shrink-0">
                        {new Date(e.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
