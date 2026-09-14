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

interface Diagnostics {
  generatedAt: string;
  environment: { requiredConfigured: number; requiredTotal: number; checks: { key: string; label: string; configured: boolean; severity: string }[] };
  health: {
    database: { connected: boolean; latencyMs: number | null; error: string | null };
    counts: Record<string, number>;
  };
  readiness: { overall: number; color: string; scores: { id: string; label: string; value: number; color: string }[] };
}

interface Monitoring {
  systemHealth: number;
  metrics: {
    users: { total: number; active: number };
    rfqs: { total: number; active: number };
    transactions: { completed: number; successRate: string };
  };
  alerts: { type: string; message: string }[];
}

export default function SystemHealthPage() {
  const [diag, setDiag] = useState<Diagnostics | null>(null);
  const [mon, setMon] = useState<Monitoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [diagRes, monRes] = await Promise.all([
        fetch('/api/admin/system/diagnostics', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/admin/monitoring', { credentials: 'include' }).then((r) => r.json()),
      ]);
      if (diagRes.success) setDiag(diagRes);
      if (monRes.success) setMon(monRes);
      if (!diagRes.success && !monRes.success) throw new Error('Health data unavailable');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load system health');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const colorClass = (c: string) =>
    c === 'green' ? 'text-green-400' : c === 'amber' ? 'text-amber-400' : 'text-red-400';

  return (
    <CockpitShell
      title="System Health Dashboard"
      subtitle="Environment diagnostics, database, and live monitoring"
      onRefresh={load}
      loading={loading}
    >
      {error && <CockpitError message={error} onRetry={load} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {mon && (
          <>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-500 text-xs">System health score</p>
              <p className="text-2xl font-bold text-white mt-1">{mon.systemHealth}%</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-500 text-xs">Active users</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{mon.metrics.users.active}</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-500 text-xs">Active RFQs</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{mon.metrics.rfqs.active}</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-500 text-xs">Tx success rate</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{mon.metrics.transactions.successRate}%</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CockpitPanel>
          <CockpitSectionLabel>Environment &amp; database</CockpitSectionLabel>
          {!diag ? (
            <CockpitFallback message="Diagnostics unavailable" />
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Required env vars</span>
                <span className="text-white">
                  {diag.environment.requiredConfigured}/{diag.environment.requiredTotal}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Database</span>
                <span className={diag.health.database.connected ? 'text-green-400' : 'text-red-400'}>
                  {diag.health.database.connected
                    ? `Connected (${diag.health.database.latencyMs}ms)`
                    : diag.health.database.error || 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Readiness overall</span>
                <span className={colorClass(diag.readiness.color)}>{diag.readiness.overall}%</span>
              </div>
              <ul className="max-h-32 overflow-y-auto space-y-1 text-xs">
                {diag.environment.checks
                  .filter((c) => c.severity === 'required' && !c.configured)
                  .slice(0, 8)
                  .map((c) => (
                    <li key={c.key} className="text-amber-500">Missing: {c.label}</li>
                  ))}
              </ul>
            </div>
          )}
          <Link href="/admin/system" className="text-indigo-400 hover:underline text-xs mt-3 inline-block">
            Full system diagnostics →
          </Link>
        </CockpitPanel>

        <CockpitPanel>
          <CockpitSectionLabel>Live alerts</CockpitSectionLabel>
          {!mon?.alerts?.length ? (
            <CockpitFallback message="No active alerts" />
          ) : (
            <ul className="space-y-2 text-sm">
              {mon.alerts.map((a, i) => (
                <li key={i} className="text-amber-300 border-b border-slate-700/30 pb-2 last:border-0">
                  {a.message}
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/monitoring" className="text-indigo-400 hover:underline text-xs mt-3 inline-block">
            Full monitoring board →
          </Link>
        </CockpitPanel>
      </div>

      {diag?.health.counts && (
        <CockpitPanel>
          <CockpitSectionLabel>Entity counts</CockpitSectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {Object.entries(diag.health.counts).slice(0, 8).map(([k, v]) => (
              <div key={k}>
                <p className="text-slate-500 text-xs">{k}</p>
                <p className="text-white font-semibold">{v}</p>
              </div>
            ))}
          </div>
        </CockpitPanel>
      )}
    </CockpitShell>
  );
}
