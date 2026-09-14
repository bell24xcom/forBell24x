'use client';

import { useCallback, useEffect, useState } from 'react';
import { DiscoveryPageShell, MetricGrid } from '@/src/components/admin/discovery/DiscoveryPageShell';

interface TrustStatus {
  formula: {
    name: string;
    expression: string;
    schedule: string;
    components: { weight: number; label: string; detail: string }[];
    floors: string[];
  };
  cronEndpoint: string;
  discoveredSuppliers: {
    count: number;
    avgScore: number;
    min: number;
    max: number;
    claimedAvg: number;
    unclaimedAvg: number;
    distribution: { bucket: string; count: number }[];
  };
  allSuppliers: { count: number; avgScore: number; highTrustCount: number };
}

export default function TrustEnginePage() {
  const [data, setData] = useState<TrustStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/discovery/trust', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load');
      setData(json.trust);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const d = data?.discoveredSuppliers;
  const maxTrust = d?.distribution.reduce((m, b) => Math.max(m, b.count), 1) ?? 1;

  return (
    <DiscoveryPageShell
      title="Trust Score Engine"
      subtitle="Trade Confidence Score™ formula and daily batch recompute"
      loading={loading && !data}
      error={error}
      onRefresh={load}
    >
      {data && d && (
        <div className="space-y-6">
          <MetricGrid
            items={[
              { label: 'Discovered Avg', value: d.avgScore },
              { label: 'Claimed Avg', value: d.claimedAvg },
              { label: 'High Trust (70+)', value: data.allSuppliers.highTrustCount },
              { label: 'Cron', value: data.cronEndpoint },
            ]}
          />

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
              {data.formula.name}
            </h2>
            <p className="text-slate-300 text-sm font-mono mb-4">{data.formula.expression}</p>
            <p className="text-slate-500 text-xs mb-4">{data.formula.schedule}</p>
            <div className="space-y-2">
              {data.formula.components.map((c) => (
                <div key={c.label} className="flex gap-3 text-sm">
                  <span className="text-amber-400 font-bold w-10">{c.weight}%</span>
                  <span className="text-white font-medium w-40">{c.label}</span>
                  <span className="text-slate-400">{c.detail}</span>
                </div>
              ))}
            </div>
            <ul className="mt-4 text-slate-500 text-xs list-disc pl-5 space-y-1">
              {data.formula.floors.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Discovered Supplier Distribution
            </h2>
            {d.distribution.every((b) => b.count === 0) ? (
              <p className="text-slate-500 text-sm">No discovered suppliers yet.</p>
            ) : (
              <div className="space-y-2">
                {d.distribution.map((b) => (
                  <div key={b.bucket} className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-16">{b.bucket}</span>
                    <div className="flex-1 bg-slate-900 rounded h-4 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded"
                        style={{ width: `${(b.count / maxTrust) * 100}%` }}
                      />
                    </div>
                    <span className="text-slate-300 text-xs w-8 text-right">{b.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DiscoveryPageShell>
  );
}
