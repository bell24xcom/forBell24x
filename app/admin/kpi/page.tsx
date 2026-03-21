'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, IndianRupee, FileText, Users, Handshake, MessageCircle, Zap } from 'lucide-react';

const RANGES = [
  { label: '7 Days',  value: 7  },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
];

interface FunnelData {
  days: number;
  period: {
    rfqsCreated: number; rfqsActive: number;
    quotesSubmitted: number; dealsCreated: number; dealsCompleted: number;
    revenue: number; outreachSent: number; waClicks: number;
    subscriptions: number; followUp1: number; followUp2: number; drips: number;
  };
  growth: { rfqs: number; quotes: number; deals: number; revenue: number };
  rates:  { quoteRate: number; dealRate: number; waClickRate: number; subRate: number };
  funnel: { step: string; value: number; color: string }[];
  categoryBreakdown: { category: string; count: number }[];
  dailyRfqs: { date: string; count: number }[];
}

function GrowthBadge({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{pct.toFixed(1)}%
    </span>
  );
}

function KpiCard({
  label, value, growth, icon: Icon, color, border, sub,
}: {
  label: string; value: string | number; growth?: number;
  icon: React.ElementType; color: string; border: string; sub?: string;
}) {
  return (
    <div className={`bg-slate-800/60 border ${border} rounded-xl p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      {growth !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          <GrowthBadge pct={growth} />
          <span className="text-slate-600 text-xs">vs prev period</span>
        </div>
      )}
    </div>
  );
}

function RateBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

export default function KPIPage() {
  const [data,    setData]    = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [days,    setDays]    = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`/api/metrics/funnel?days=${days}`);
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

  const funnelMax   = data ? Math.max(1, data.funnel[0]?.value ?? 1) : 1;
  const trendMax    = data ? Math.max(1, ...data.dailyRfqs.map(d => d.count)) : 1;
  const catMax      = data ? Math.max(1, data.categoryBreakdown[0]?.count ?? 1) : 1;

  const fmt = (n: number) =>
    `₹${(n / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Business KPIs</h1>
          <p className="text-slate-400 text-sm">Real funnel performance — outreach to revenue. No mock data.</p>
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
          {/* Core KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="RFQs Created"    value={data.period.rfqsCreated}
              growth={data.growth.rfqs}    icon={FileText}     color="text-blue-400"   border="border-blue-500/20"
              sub={`${data.period.rfqsActive} active now`} />
            <KpiCard label="Quotes Posted"   value={data.period.quotesSubmitted}
              growth={data.growth.quotes}  icon={MessageCircle} color="text-cyan-400"  border="border-cyan-500/20" />
            <KpiCard label="Deals Created"   value={data.period.dealsCreated}
              growth={data.growth.deals}   icon={Handshake}    color="text-purple-400" border="border-purple-500/20"
              sub={`${data.period.dealsCompleted} completed`} />
            <KpiCard label="Revenue"         value={fmt(data.period.revenue)}
              growth={data.growth.revenue} icon={IndianRupee}  color="text-amber-400"  border="border-amber-500/20" />
          </div>

          {/* Outreach KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Outreach Sent"   value={data.period.outreachSent}   icon={Zap}          color="text-indigo-400" border="border-indigo-500/20" />
            <KpiCard label="WA Clicks"       value={data.period.waClicks}       icon={MessageCircle} color="text-green-400" border="border-green-500/20"
              sub={`${data.rates.waClickRate}% click rate`} />
            <KpiCard label="Subscriptions"   value={data.period.subscriptions}  icon={Users}        color="text-emerald-400" border="border-emerald-500/20"
              sub={`${data.rates.subRate}% of outreach`} />
            <KpiCard label="Follow-ups Sent" value={data.period.followUp1 + data.period.followUp2 + data.period.drips}
              icon={RefreshCw} color="text-orange-400" border="border-orange-500/20"
              sub={`D2:${data.period.followUp1} D5:${data.period.followUp2} Drip:${data.period.drips}`} />
          </div>

          {/* Funnel + Conversion Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Visual Funnel */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Outreach → Revenue Funnel</h3>
              <div className="space-y-2">
                {data.funnel.map((step, i) => {
                  const pct = Math.max(2, Math.round((step.value / funnelMax) * 100));
                  const convPct = i > 0 && data.funnel[i - 1].value > 0
                    ? ((step.value / data.funnel[i - 1].value) * 100).toFixed(0)
                    : null;
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
              {data.funnel.every(f => f.value === 0) && (
                <p className="text-slate-500 text-xs mt-4 text-center">No outreach activity yet in this period.</p>
              )}
            </div>

            {/* Conversion Rates */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Conversion Rates</h3>
              <div className="space-y-4">
                <RateBar label="RFQs → Quoted"       value={data.rates.quoteRate}   color="bg-cyan-500" />
                <RateBar label="Quotes → Deal"        value={data.rates.dealRate}    color="bg-purple-500" />
                <RateBar label="Outreach → WA Click"  value={data.rates.waClickRate} color="bg-green-500" />
                <RateBar label="Outreach → Subscribed" value={data.rates.subRate}    color="bg-amber-500" />
              </div>

              {/* Benchmark note */}
              <div className="mt-4 bg-slate-700/40 rounded-lg p-3 text-xs text-slate-400 space-y-1">
                <p><span className="text-slate-300 font-medium">Industry benchmarks:</span></p>
                <p>B2B email open: 20–35% · WA click: 15–25% · Quote: 10–30% · Deal: 5–15%</p>
              </div>
            </div>
          </div>

          {/* Category Breakdown + Daily Trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Top Categories by RFQ */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Top Categories by RFQ Volume</h3>
              {data.categoryBreakdown.length === 0 ? (
                <p className="text-slate-500 text-xs">No RFQ data for this period.</p>
              ) : (
                <div className="space-y-2">
                  {data.categoryBreakdown.map(c => (
                    <div key={c.category} className="flex items-center gap-3 text-xs">
                      <span className="text-slate-300 w-36 truncate shrink-0">{c.category}</span>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.round((c.count / catMax) * 100)}%` }} />
                      </div>
                      <span className="text-white font-semibold w-8 text-right">{c.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Daily RFQ Trend */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Daily RFQ Inflow</h3>
              {data.dailyRfqs.length === 0 ? (
                <p className="text-slate-500 text-xs">No data yet.</p>
              ) : (
                <div className="flex items-end gap-0.5 h-24">
                  {data.dailyRfqs.map(d => {
                    const h = Math.max(2, Math.round((d.count / trendMax) * 88));
                    return (
                      <div key={d.date} className="flex flex-col items-center gap-1 flex-1"
                        title={`${d.date}: ${d.count} RFQs`}>
                        <div className="w-full bg-blue-500 rounded-t" style={{ height: `${h}px` }} />
                        {data.dailyRfqs.length <= 14 && (
                          <span className="text-[8px] text-slate-600">{d.date.slice(8)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Data freshness note */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-xs text-slate-500">
            <strong className="text-slate-400">Data source:</strong> All numbers pulled live from Prisma/Neon.
            Revenue is wallet deposits in paise (divide by 100 for ₹).
            Funnel shows the {days}-day window ending now.
            Zero mock data — empty states are real.
          </div>
        </>
      )}
    </div>
  );
}
