'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CockpitShell,
  CockpitPanel,
  CockpitSectionLabel,
  CockpitFallback,
  CockpitError,
} from '@/src/components/admin/cockpit/CockpitShell';

interface RfqCard {
  id: string;
  title: string;
  status: string;
  urgency: string;
  category: string;
  createdAt: string;
  _count?: { quotes: number };
}

interface FunnelPeriod {
  rfqsCreated: number;
  rfqsActive: number;
  quotesSubmitted: number;
  dealsCompleted: number;
  categoryBreakdown: { category: string; count: number }[];
}

const COLUMNS = [
  { key: 'ACTIVE', label: 'Active', statuses: ['ACTIVE', 'OPEN'] },
  { key: 'COMPLETED', label: 'Completed', statuses: ['COMPLETED'] },
  { key: 'CANCELLED', label: 'Cancelled', statuses: ['CANCELLED', 'EXPIRED'] },
] as const;

export default function RfqPipelinePage() {
  const [columns, setColumns] = useState<Record<string, RfqCard[]>>({});
  const [funnel, setFunnel] = useState<FunnelPeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [activeRes, completedRes, cancelledRes, funnelRes] = await Promise.all([
        fetch('/api/admin/rfqs?status=ACTIVE&limit=30', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/admin/rfqs?status=COMPLETED&limit=20', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/admin/rfqs?status=CANCELLED&limit=20', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/metrics/funnel?days=30', { credentials: 'include' }).then((r) => r.json()),
      ]);

      setColumns({
        ACTIVE: activeRes.rfqs ?? [],
        COMPLETED: completedRes.rfqs ?? [],
        CANCELLED: cancelledRes.rfqs ?? [],
      });

      if (funnelRes.success && funnelRes.period) {
        setFunnel({
          rfqsCreated: funnelRes.period.rfqsCreated,
          rfqsActive: funnelRes.period.rfqsActive,
          quotesSubmitted: funnelRes.period.quotesSubmitted,
          dealsCompleted: funnelRes.period.dealsCompleted,
          categoryBreakdown: funnelRes.categoryBreakdown ?? [],
        });
      }
    } catch {
      setError('Failed to load RFQ pipeline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <CockpitShell
      title="RFQ Pipeline Board"
      subtitle="Requirements by stage — active, completed, cancelled"
      onRefresh={load}
      loading={loading}
    >
      {error && <CockpitError message={error} onRetry={load} />}

      {funnel && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Created (30d)', value: funnel.rfqsCreated },
            { label: 'Active now', value: funnel.rfqsActive },
            { label: 'Quotes (30d)', value: funnel.quotesSubmitted },
            { label: 'Deals done (30d)', value: funnel.dealsCompleted },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-500 text-xs">{s.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {funnel?.categoryBreakdown.length ? (
        <CockpitPanel>
          <CockpitSectionLabel>Category demand (30d)</CockpitSectionLabel>
          <div className="flex flex-wrap gap-2">
            {funnel.categoryBreakdown.map((c) => (
              <span key={c.category} className="text-xs bg-slate-700/60 text-slate-300 px-2 py-1 rounded-full">
                {c.category}: {c.count}
              </span>
            ))}
          </div>
        </CockpitPanel>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <CockpitPanel key={col.key} className="min-h-[200px]">
            <CockpitSectionLabel>{col.label}</CockpitSectionLabel>
            {(columns[col.key] ?? []).length === 0 ? (
              <CockpitFallback message={`No ${col.label.toLowerCase()} RFQs`} />
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {(columns[col.key] ?? []).map((r) => (
                  <Link
                    key={r.id}
                    href="/admin/rfqs"
                    className="block p-3 bg-slate-900/40 border border-slate-700/40 rounded-lg hover:border-indigo-500/40 transition-colors"
                  >
                    <p className="text-slate-200 text-sm font-medium truncate">{r.title}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {r._count?.quotes ?? 0} quotes · {r.category}
                    </p>
                    <p className="text-slate-600 text-[10px] mt-1">
                      {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CockpitPanel>
        ))}
      </div>

      <Link href="/admin/rfqs" className="text-indigo-400 hover:underline text-sm">
        Open full RFQ board →
      </Link>
    </CockpitShell>
  );
}
