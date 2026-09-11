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

interface Supplier {
  id: string;
  name: string;
  company: string | null;
  trustScore: number;
  quoteCount: number;
  dealCount: number;
  isActive: boolean;
  isClaimed: boolean;
  categories: string[];
}

export default function SupplierIntelligencePage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [trustDist, setTrustDist] = useState<Record<string, number> | null>(null);
  const [outreach, setOutreach] = useState<{ outreachSent: number; conversionRate: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [supRes, cpRes, outRes] = await Promise.all([
        fetch('/api/admin/suppliers?page=1&active=true', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/admin/control-panel', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/admin/outreach-stats?days=30', { credentials: 'include' }).then((r) => r.json()),
      ]);

      if (!supRes.success) throw new Error(supRes.error || 'Suppliers failed');
      setSuppliers(supRes.suppliers ?? []);
      setStats(supRes.stats ?? null);

      if (cpRes.success) setTrustDist(cpRes.trustDistribution ?? null);
      if (outRes.success && outRes.period) {
        setOutreach({
          outreachSent: outRes.period.outreachSent,
          conversionRate: outRes.period.conversionRate,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load supplier intelligence');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const topByTrust = [...suppliers].sort((a, b) => b.trustScore - a.trustScore).slice(0, 10);
  const topByDeals = [...suppliers].sort((a, b) => b.dealCount - a.dealCount).slice(0, 10);

  return (
    <CockpitShell
      title="Supplier Intelligence"
      subtitle="Trust, performance, and outreach reach"
      onRefresh={load}
      loading={loading}
    >
      {error && <CockpitError message={error} onRetry={load} />}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total suppliers', value: stats.total },
            { label: 'Active', value: stats.active },
            { label: 'With phone', value: stats.withPhone },
            { label: 'High trust (≥70)', value: stats.highTrust },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-500 text-xs">{s.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CockpitPanel>
          <CockpitSectionLabel>Trust distribution</CockpitSectionLabel>
          {!trustDist ? (
            <CockpitFallback message="Trust data unavailable" />
          ) : (
            <div className="space-y-2">
              {Object.entries(trustDist).map(([band, count]) => (
                <div key={band} className="flex justify-between text-sm">
                  <span className="text-slate-400">Score {band}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            </div>
          )}
        </CockpitPanel>

        <CockpitPanel>
          <CockpitSectionLabel>Outreach (30d)</CockpitSectionLabel>
          {!outreach ? (
            <CockpitFallback message="Outreach stats unavailable" />
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-slate-500 text-xs">Suppliers reached</p>
                <p className="text-2xl font-bold text-blue-400">{outreach.outreachSent}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Subscription conversion</p>
                <p className="text-xl font-bold text-amber-400">{outreach.conversionRate}%</p>
              </div>
              <Link href="/admin/outreach" className="text-indigo-400 hover:underline text-xs">
                Outreach dialer →
              </Link>
            </div>
          )}
        </CockpitPanel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CockpitPanel>
          <CockpitSectionLabel>Top by trust score</CockpitSectionLabel>
          {topByTrust.length === 0 ? (
            <CockpitFallback message="No active suppliers" />
          ) : (
            <ul className="space-y-2 text-sm">
              {topByTrust.map((s) => (
                <li key={s.id} className="flex justify-between gap-2 border-b border-slate-700/30 py-1.5 last:border-0">
                  <span className="text-slate-300 truncate">{s.company || s.name}</span>
                  <span className="text-indigo-400 font-semibold shrink-0">{s.trustScore}</span>
                </li>
              ))}
            </ul>
          )}
        </CockpitPanel>

        <CockpitPanel>
          <CockpitSectionLabel>Top by deals closed</CockpitSectionLabel>
          {topByDeals.length === 0 ? (
            <CockpitFallback message="No deal data yet" />
          ) : (
            <ul className="space-y-2 text-sm">
              {topByDeals.map((s) => (
                <li key={s.id} className="flex justify-between gap-2 border-b border-slate-700/30 py-1.5 last:border-0">
                  <span className="text-slate-300 truncate">{s.company || s.name}</span>
                  <span className="text-green-400 font-semibold shrink-0">{s.dealCount} deals</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/suppliers" className="text-indigo-400 hover:underline text-xs mt-3 inline-block">
            Full supplier directory →
          </Link>
        </CockpitPanel>
      </div>
    </CockpitShell>
  );
}
