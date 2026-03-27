'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS        = Array.from({ length: 24 }, (_, i) => i);
const RANGES       = [{ label: '7 Days', value: 7 }, { label: '30 Days', value: 30 }, { label: '90 Days', value: 90 }];

type HeatCell = { hour: number; dow: number; count: number };
type CatCell  = { category: string; actionType: string; count: number };

interface HeatmapData {
  timeGrid:     HeatCell[];
  categoryGrid: CatCell[];
  actionTotals: { actionType: string; count: number }[];
  sourceTotals: { source: string; count: number }[];
  dailyTrend:   { date: string; count: number }[];
  days:         number;
}

function intensity(value: number, max: number): string {
  if (max === 0 || value === 0) return 'bg-slate-800 text-slate-600';
  const pct = value / max;
  if (pct < 0.15) return 'bg-indigo-950 text-indigo-400';
  if (pct < 0.30) return 'bg-indigo-900 text-indigo-300';
  if (pct < 0.50) return 'bg-indigo-700 text-white';
  if (pct < 0.75) return 'bg-indigo-500 text-white';
  return 'bg-indigo-400 text-white font-semibold';
}

function catIntensity(value: number, max: number): string {
  if (max === 0 || value === 0) return 'bg-slate-800';
  const pct = value / max;
  if (pct < 0.15) return 'bg-cyan-950';
  if (pct < 0.30) return 'bg-cyan-900';
  if (pct < 0.50) return 'bg-cyan-700';
  if (pct < 0.75) return 'bg-cyan-500';
  return 'bg-cyan-400';
}

export default function HeatmapPage() {
  const [data,    setData]    = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [days,    setDays]    = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`/api/admin/heatmap?days=${days}`);
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

  // Build time grid map: key = `${dow}-${hour}` → count
  const timeMap = new Map<string, number>();
  data?.timeGrid.forEach(c => timeMap.set(`${c.dow}-${c.hour}`, c.count));
  const timeMax = data ? Math.max(0, ...data.timeGrid.map(c => c.count)) : 0;

  // Build category pivot
  const categories  = data ? [...new Set(data.categoryGrid.map(c => c.category))].slice(0, 12) : [];
  const actionTypes = data ? [...new Set(data.categoryGrid.map(c => c.actionType))].filter(a =>
    ['view', 'click', 'quote', 'bookmark', 'share'].includes(a)
  ) : [];
  const catMap = new Map<string, number>();
  data?.categoryGrid.forEach(c => catMap.set(`${c.category}|${c.actionType}`, c.count));
  const catMax = data ? Math.max(0, ...data.categoryGrid.map(c => c.count)) : 0;

  // Daily trend sparkline
  const trendMax = data ? Math.max(1, ...data.dailyTrend.map(d => d.count)) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Activity Heatmap</h1>
          <p className="text-slate-400 text-sm">User interaction patterns from InteractionMemory</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            {RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setDays(r.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === r.value ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
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

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {loading && !data && (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {data && (
        <>
          {/* Action Type + Source Totals */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Actions — {days}d</h3>
              <div className="space-y-2">
                {data.actionTotals.map(a => (
                  <div key={a.actionType} className="flex items-center gap-2 text-sm">
                    <span className="w-40 text-slate-400 text-xs truncate">{a.actionType}</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, (a.count / Math.max(1, data.actionTotals[0]?.count ?? 1)) * 100)}%` }} />
                    </div>
                    <span className="text-white text-xs w-10 text-right">{a.count.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                {data.actionTotals.length === 0 && <p className="text-slate-500 text-xs">No actions recorded</p>}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Traffic Sources — {days}d</h3>
              <div className="space-y-2">
                {data.sourceTotals.map(s => (
                  <div key={s.source} className="flex items-center gap-2 text-sm">
                    <span className="w-40 text-slate-400 text-xs truncate">{s.source}</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${Math.min(100, (s.count / Math.max(1, data.sourceTotals[0]?.count ?? 1)) * 100)}%` }} />
                    </div>
                    <span className="text-white text-xs w-10 text-right">{s.count.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                {data.sourceTotals.length === 0 && <p className="text-slate-500 text-xs">No source data</p>}
              </div>
            </div>
          </div>

          {/* Time-of-Day × Day-of-Week heatmap */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1">When Are Users Active?</h3>
            <p className="text-slate-500 text-xs mb-4">Hour of day (UTC) × Day of week — darker = more activity</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="text-slate-500 text-left pr-3 pb-2 w-10 font-normal">Day</th>
                    {HOURS.map(h => (
                      <th key={h} className="text-slate-500 text-center pb-2 font-normal w-7">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS_OF_WEEK.map((day, dow) => (
                    <tr key={day}>
                      <td className="text-slate-400 pr-3 py-0.5 font-medium">{day}</td>
                      {HOURS.map(hour => {
                        const count = timeMap.get(`${dow}-${hour}`) ?? 0;
                        const cls   = intensity(count, timeMax);
                        return (
                          <td key={hour} className="py-0.5 px-0.5">
                            <div
                              className={`w-6 h-6 rounded flex items-center justify-center text-[9px] ${cls}`}
                              title={`${day} ${hour}:00 — ${count} interactions`}
                            >
                              {count > 0 ? count : ''}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                <span>Low</span>
                {['bg-slate-800', 'bg-indigo-950', 'bg-indigo-900', 'bg-indigo-700', 'bg-indigo-500', 'bg-indigo-400'].map(c => (
                  <div key={c} className={`w-4 h-4 rounded ${c}`} />
                ))}
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Category × Action Type heatmap */}
          {categories.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1">Category Activity Grid</h3>
              <p className="text-slate-500 text-xs mb-4">Top {categories.length} categories × action types — darker = more interactions</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="text-slate-500 text-left pr-4 pb-2 font-normal">Category</th>
                      {actionTypes.map(a => (
                        <th key={a} className="text-slate-400 text-center pb-2 font-normal px-2 capitalize">{a}</th>
                      ))}
                      <th className="text-slate-400 text-center pb-2 font-normal px-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => {
                      const rowTotal = actionTypes.reduce((s, a) => s + (catMap.get(`${cat}|${a}`) ?? 0), 0);
                      return (
                        <tr key={cat} className="border-t border-slate-700/30">
                          <td className="text-slate-300 pr-4 py-1.5 text-xs truncate max-w-[160px]">{cat}</td>
                          {actionTypes.map(a => {
                            const count = catMap.get(`${cat}|${a}`) ?? 0;
                            return (
                              <td key={a} className="py-1 px-2 text-center">
                                <div
                                  className={`rounded px-1.5 py-0.5 inline-block min-w-[28px] text-center text-white text-[10px] ${catIntensity(count, catMax)}`}
                                  title={`${cat} / ${a}: ${count}`}
                                >
                                  {count > 0 ? count : '—'}
                                </div>
                              </td>
                            );
                          })}
                          <td className="py-1 px-2 text-center text-slate-400 font-semibold text-xs">{rowTotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Daily Trend */}
          {data.dailyTrend.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Daily Interaction Trend</h3>
              <div className="flex items-end gap-0.5 h-24 overflow-x-auto">
                {data.dailyTrend.map(d => {
                  const barH = Math.max(2, Math.round((d.count / trendMax) * 88));
                  return (
                    <div key={d.date} className="flex flex-col items-center gap-1 shrink-0" title={`${d.date}: ${d.count}`}>
                      <div className="w-4 bg-indigo-500 rounded-t" style={{ height: `${barH}px` }} />
                      {data.dailyTrend.length <= 31 && (
                        <span className="text-[8px] text-slate-600 -rotate-45 origin-center mt-1">
                          {d.date.slice(5)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {data.timeGrid.length === 0 && data.categoryGrid.length === 0 && (
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-8 text-center">
              <p className="text-slate-400 text-sm">No interaction data found for the selected period.</p>
              <p className="text-slate-500 text-xs mt-1">Data is recorded as users browse RFQs and take actions.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
