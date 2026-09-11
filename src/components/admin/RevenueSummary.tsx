'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { IndianRupee, TrendingUp, CreditCard, BarChart2, RefreshCw } from 'lucide-react';

export interface RevenueSummaryData {
  allTimeRevenue: number;
  allTimeDeposits: number;
  periodRevenue: number;
  periodDeposits: number;
  avgTransaction: number;
  days: number;
  monthlyRevenue: { month: string; total: number; txnCount: number }[];
}

export function formatRevenueInr(n: number) {
  return `₹${(n / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

interface RevenueSummaryProps {
  /** Period length in days — passed to /api/admin/revenue?days= */
  days: number;
  /** Compact layout for Founder Cockpit */
  compact?: boolean;
  /** Show refresh control */
  showRefresh?: boolean;
  className?: string;
}

export function RevenueSummary({ days, compact = false, showRefresh = true, className = '' }: RevenueSummaryProps) {
  const [data, setData] = useState<RevenueSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/revenue?days=${days}`, { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load revenue');
      setData({
        allTimeRevenue: json.allTimeRevenue,
        allTimeDeposits: json.allTimeDeposits,
        periodRevenue: json.periodRevenue,
        periodDeposits: json.periodDeposits,
        avgTransaction: json.avgTransaction,
        days: json.days,
        monthlyRevenue: json.monthlyRevenue ?? [],
      });
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : 'Failed to load revenue');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !data) {
    return (
      <div className={`flex justify-center py-8 ${className}`}>
        <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={`bg-red-900/20 border border-red-700/40 text-red-300 text-sm px-4 py-3 rounded-xl ${className}`}>
        {error}
        {showRefresh && (
          <button type="button" onClick={fetchData} className="ml-2 underline">
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!data) return null;

  const monthMax = Math.max(1, ...data.monthlyRevenue.map((m) => m.total));

  const cards = [
    {
      label: 'All-Time Revenue',
      value: formatRevenueInr(data.allTimeRevenue),
      icon: IndianRupee,
      color: 'text-amber-400',
      border: 'border-amber-500/20',
    },
    {
      label: `Revenue (${data.days}d)`,
      value: formatRevenueInr(data.periodRevenue),
      icon: TrendingUp,
      color: 'text-green-400',
      border: 'border-green-500/20',
    },
    {
      label: `Deposits (${data.days}d)`,
      value: data.periodDeposits.toLocaleString('en-IN'),
      icon: CreditCard,
      color: 'text-indigo-400',
      border: 'border-indigo-500/20',
    },
    {
      label: 'Avg Transaction',
      value: formatRevenueInr(data.avgTransaction),
      icon: BarChart2,
      color: 'text-cyan-400',
      border: 'border-cyan-500/20',
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-slate-500 text-xs">Wallet deposits · Trade Account credits</p>
        <div className="flex items-center gap-2">
          {showRefresh && (
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="p-1.5 text-slate-500 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh revenue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <Link href="/admin/revenue" className="text-indigo-400 hover:underline text-xs">
            Full revenue dashboard →
          </Link>
        </div>
      </div>

      <div className={`grid gap-3 ${compact ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4'}`}>
        {cards.map((c) => (
          <div key={c.label} className={`bg-slate-800/60 border ${c.border} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <c.icon className={`w-4 h-4 ${c.color}`} />
              <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wide">{c.label}</span>
            </div>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {!compact && data.monthlyRevenue.length > 0 && (
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
          <p className="text-slate-400 text-xs font-medium mb-3">Monthly trend (6 months)</p>
          <div className="flex items-end gap-2 h-20">
            {data.monthlyRevenue.map((m) => {
              const barH = Math.max(4, Math.round((m.total / monthMax) * 72));
              return (
                <div
                  key={m.month}
                  className="flex-1 flex flex-col items-center gap-1"
                  title={`${m.month}: ${formatRevenueInr(m.total)}`}
                >
                  <div className="w-full bg-amber-500 rounded-t" style={{ height: `${barH}px` }} />
                  <span className="text-[9px] text-slate-500">{m.month.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
