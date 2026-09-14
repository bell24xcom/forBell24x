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

interface Customer {
  id: string;
  name: string;
  company: string | null;
  rfqCount: number;
  dealCount: number;
  lastCategory: string | null;
  lastRfqAt: string | null;
  isActive: boolean;
}

export default function BuyerIntelligencePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<{ totalBuyers: number; activeBuyers: number; totalRfqs: number } | null>(null);
  const [acquisition, setAcquisition] = useState<{
    funnel: { registration_complete: number; conversionRate: string };
    byCategory: { category: string; city: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [custRes, acqRes] = await Promise.all([
        fetch('/api/admin/customers?page=1', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/admin/acquisition', { credentials: 'include' }).then((r) => r.json()),
      ]);

      if (!custRes.success) throw new Error(custRes.error || 'Customers failed');
      setCustomers(custRes.customers ?? []);
      setStats(custRes.stats ?? null);

      if (acqRes.success) setAcquisition(acqRes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load buyer intelligence');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const topByRfqs = [...customers].sort((a, b) => b.rfqCount - a.rfqCount).slice(0, 10);

  return (
    <CockpitShell
      title="Buyer Intelligence"
      subtitle="Requirement posters, acquisition funnel, category demand"
      onRefresh={load}
      loading={loading}
    >
      {error && <CockpitError message={error} onRetry={load} />}

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total buyers', value: stats.totalBuyers, color: 'text-white' },
            { label: 'Active buyers', value: stats.activeBuyers, color: 'text-green-400' },
            { label: 'Total RFQs', value: stats.totalRfqs, color: 'text-indigo-400' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-500 text-xs">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CockpitPanel>
          <CockpitSectionLabel>Acquisition funnel</CockpitSectionLabel>
          {!acquisition?.funnel ? (
            <CockpitFallback message="Acquisition data unavailable" />
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Registrations complete</span>
                <span className="text-white font-semibold">{acquisition.funnel.registration_complete}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Modal → registration rate</span>
                <span className="text-amber-400 font-semibold">{acquisition.funnel.conversionRate}%</span>
              </div>
              <Link href="/admin/acquisition" className="text-indigo-400 hover:underline text-xs">
                Full acquisition board →
              </Link>
            </div>
          )}
        </CockpitPanel>

        <CockpitPanel>
          <CockpitSectionLabel>Category demand (signup intent)</CockpitSectionLabel>
          {!acquisition?.byCategory?.length ? (
            <CockpitFallback message="No category signup data" />
          ) : (
            <ul className="space-y-1.5 text-sm max-h-40 overflow-y-auto">
              {acquisition.byCategory.slice(0, 8).map((c, i) => (
                <li key={i} className="flex justify-between gap-2">
                  <span className="text-slate-300 truncate">{c.category} · {c.city}</span>
                  <span className="text-slate-500 shrink-0">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </CockpitPanel>
      </div>

      <CockpitPanel>
        <CockpitSectionLabel>Top buyers by requirements posted</CockpitSectionLabel>
        {topByRfqs.length === 0 ? (
          <CockpitFallback message="No buyers with RFQs yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs text-left border-b border-slate-700/50">
                  <th className="pb-2">Buyer</th>
                  <th className="pb-2">RFQs</th>
                  <th className="pb-2">Deals</th>
                  <th className="pb-2">Last category</th>
                </tr>
              </thead>
              <tbody>
                {topByRfqs.map((c) => (
                  <tr key={c.id} className="border-b border-slate-700/30 last:border-0">
                    <td className="py-2 text-slate-200">{c.company || c.name}</td>
                    <td className="py-2 text-indigo-400">{c.rfqCount}</td>
                    <td className="py-2 text-green-400">{c.dealCount}</td>
                    <td className="py-2 text-slate-500">{c.lastCategory || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Link href="/admin/customers" className="text-indigo-400 hover:underline text-xs mt-3 inline-block">
          Full customer list →
        </Link>
      </CockpitPanel>
    </CockpitShell>
  );
}
