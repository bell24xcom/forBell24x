'use client';

import { useCallback, useEffect, useState } from 'react';
import { RevenueSummary, formatRevenueInr } from '@/src/components/admin/RevenueSummary';
import {
  CockpitShell,
  CockpitPanel,
  CockpitSectionLabel,
  CockpitFallback,
} from '@/src/components/admin/cockpit/CockpitShell';

interface RevenueDetail {
  recentTransactions: {
    id: string;
    amount: number;
    description: string;
    createdAt: string;
    user: { name: string | null; company: string | null };
  }[];
  subscriptionEvents: { userId: string | null; metadata: unknown; createdAt: string }[];
  planDistribution: { plan: string; count: number }[];
  days: number;
}

export default function RevenueAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [detail, setDetail] = useState<RevenueDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/revenue?days=${days}`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setDetail({
          recentTransactions: json.recentTransactions ?? [],
          subscriptionEvents: json.subscriptionEvents ?? [],
          planDistribution: json.planDistribution ?? [],
          days: json.days,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  return (
    <CockpitShell
      title="Revenue Analytics"
      subtitle="Trade Account deposits, plans, and subscription activations"
      onRefresh={loadDetail}
      loading={loading}
    >
      <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden w-fit">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              days === d ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      <RevenueSummary days={days} compact={false} showRefresh={false} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CockpitPanel>
          <CockpitSectionLabel>Recent deposits</CockpitSectionLabel>
          {!detail?.recentTransactions.length ? (
            <CockpitFallback message="No deposits recorded" />
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {detail.recentTransactions.map((t) => (
                <div key={t.id} className="flex justify-between text-xs py-1.5 border-b border-slate-700/30 last:border-0">
                  <span className="text-slate-300 truncate">{t.user.company || t.user.name || '—'}</span>
                  <span className="text-green-400 font-semibold shrink-0 ml-2">{formatRevenueInr(t.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CockpitPanel>

        <CockpitPanel>
          <CockpitSectionLabel>Plan distribution</CockpitSectionLabel>
          {!detail?.planDistribution.length ? (
            <CockpitFallback message="No plan data" />
          ) : (
            <ul className="space-y-2 text-sm">
              {detail.planDistribution.map((p) => (
                <li key={p.plan} className="flex justify-between">
                  <span className="text-slate-400">{p.plan}</span>
                  <span className="text-white font-semibold">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </CockpitPanel>
      </div>

      {detail?.subscriptionEvents.length ? (
        <CockpitPanel>
          <CockpitSectionLabel>Subscription activations ({detail.days}d)</CockpitSectionLabel>
          <div className="space-y-1 text-xs">
            {detail.subscriptionEvents.map((e, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-slate-700/30 last:border-0">
                <span className="text-slate-400">{String((e.metadata as Record<string, unknown>)?.plan ?? '—')}</span>
                <span className="text-slate-600">{new Date(e.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            ))}
          </div>
        </CockpitPanel>
      ) : null}
    </CockpitShell>
  );
}
