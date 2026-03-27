'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Users, FileText, BarChart2, Zap, RefreshCw } from 'lucide-react';

interface AnalyticsData {
  metrics: {
    totalUsers: number;
    activeSuppliers: number;
    totalRevenue: number;
    systemHealth: number;
    highTrustSuppliers: number;
    recentLeads: number;
    recentRfqs: number;
    aiAccuracy: number;
    fraudDetection: number;
    uptime: number;
    performanceScore: number;
  };
  growth: {
    userGrowth: number;
    revenueGrowth: number;
    leadGrowth: number;
    supplierGrowth: number;
    rfqGrowth: number;
  };
  timeRange: string;
  lastUpdated: string;
}

const RANGES = [
  { label: '1 Day',   value: '1d'  },
  { label: '7 Days',  value: '7d'  },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
];

function GrowthBadge({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{pct.toFixed(1)}%
    </span>
  );
}

function MetricCard({ label, value, growth, icon: Icon, color, format = 'number' }: {
  label: string;
  value: number;
  growth?: number;
  icon: React.ElementType;
  color: string;
  format?: 'number' | 'currency' | 'percent';
}) {
  const fmt = (n: number) => {
    if (format === 'currency') return `₹${(n / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    if (format === 'percent') return `${n.toFixed(1)}%`;
    return n.toLocaleString('en-IN');
  };
  const border = color.replace('text-', 'border-').replace('400', '500/30');
  return (
    <div className={`bg-slate-800/60 border ${border} rounded-xl p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{fmt(value)}</p>
      {growth !== undefined && (
        <div className="mt-2">
          <GrowthBadge pct={growth} />
          <span className="text-xs text-slate-500 ml-1">vs previous period</span>
        </div>
      )}
    </div>
  );
}

function BarMini({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-36 text-slate-400 text-xs truncate shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-white text-xs w-8 text-right">{value.toLocaleString('en-IN')}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [range,   setRange]   = useState('7d');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`/api/admin/analytics?range=${range}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm">
            {data?.lastUpdated ? `Updated ${new Date(data.lastUpdated).toLocaleTimeString('en-IN')}` : 'Platform performance metrics'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Range Selector */}
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            {RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  range === r.value ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 text-sm transition-colors"
          >
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
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Users"        value={data.metrics.totalUsers}        growth={data.growth.userGrowth}     icon={Users}    color="text-indigo-400" />
            <MetricCard label="Active Suppliers"   value={data.metrics.activeSuppliers}   growth={data.growth.supplierGrowth} icon={Users}    color="text-cyan-400" />
            <MetricCard label="RFQs Posted"        value={data.metrics.recentRfqs}        growth={data.growth.rfqGrowth}      icon={FileText} color="text-blue-400" />
            <MetricCard label="Leads Generated"    value={data.metrics.recentLeads}       growth={data.growth.leadGrowth}     icon={Zap}      color="text-green-400" />
            <MetricCard label="Revenue (Period)"   value={data.metrics.totalRevenue}      growth={data.growth.revenueGrowth}  icon={BarChart2} color="text-amber-400" format="currency" />
            <MetricCard label="High-Trust Suppliers" value={data.metrics.highTrustSuppliers} icon={Users}    color="text-emerald-400" />
            <MetricCard label="System Health"      value={data.metrics.systemHealth}                                          icon={Zap}      color="text-green-400" format="percent" />
            <MetricCard label="Uptime"             value={data.metrics.uptime}                                                icon={BarChart2} color="text-slate-300" format="percent" />
          </div>

          {/* Performance Gauges */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Platform Performance Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {[
                  { label: 'AI Matching Accuracy', value: data.metrics.aiAccuracy,       color: 'bg-indigo-500', max: 100 },
                  { label: 'Fraud Detection Rate', value: data.metrics.fraudDetection,   color: 'bg-green-500',  max: 100 },
                  { label: 'Performance Score',    value: data.metrics.performanceScore, color: 'bg-blue-500',   max: 100 },
                  { label: 'System Health',        value: data.metrics.systemHealth,     color: 'bg-emerald-500', max: 100 },
                ].map(({ label, value, color, max }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-white font-semibold">{value.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(value, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Growth Summary */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Growth vs Prior Period</h4>
                {[
                  { label: 'User Signups',       value: data.growth.userGrowth },
                  { label: 'Revenue',            value: data.growth.revenueGrowth },
                  { label: 'RFQs Posted',        value: data.growth.rfqGrowth },
                  { label: 'New Suppliers',      value: data.growth.supplierGrowth },
                  { label: 'Lead Generation',    value: data.growth.leadGrowth },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{label}</span>
                    <GrowthBadge pct={value} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Range info note */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-xs text-slate-500">
            <strong className="text-slate-400">About this data:</strong> Metrics show counts for the selected range ({RANGES.find(r => r.value === range)?.label}).
            Growth percentages compare current period to the equal-length previous period. Revenue is in paisa (divide by 100 for ₹).
            High-trust suppliers have a trust score ≥ 70.
          </div>
        </>
      )}
    </div>
  );
}
