'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { DiscoveryPageShell, MetricGrid } from '@/src/components/admin/discovery/DiscoveryPageShell';

type HealthSignal = 'healthy' | 'attention' | 'critical' | 'unknown';

interface Pillar {
  id: string;
  label: string;
  signal: HealthSignal;
  summary: string;
  metrics: Record<string, number | string>;
}

interface CommandCenter {
  pillars: Pillar[];
  readinessScore: number;
  overallSignal: HealthSignal;
}

const SIGNAL_STYLES: Record<HealthSignal, string> = {
  healthy: 'border-green-700/50 bg-green-900/20',
  attention: 'border-amber-700/50 bg-amber-900/20',
  critical: 'border-red-700/50 bg-red-900/20',
  unknown: 'border-slate-700/50 bg-slate-800/40',
};

const SIGNAL_DOT: Record<HealthSignal, string> = {
  healthy: 'bg-green-400',
  attention: 'bg-amber-400',
  critical: 'bg-red-400',
  unknown: 'bg-slate-500',
};

export default function DiscoveryCommandCenterPage() {
  const [data, setData] = useState<CommandCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/discovery/command-center', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load');
      setData(json.commandCenter);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <DiscoveryPageShell
      title="Discovery Command Center"
      subtitle="Founder view — discovery, outreach, claim, and trust health"
      loading={loading && !data}
      error={error}
      onRefresh={load}
    >
      {data && (
        <div className="space-y-6">
          <MetricGrid
            items={[
              { label: 'Readiness Score', value: `${data.readinessScore}%` },
              { label: 'Overall Signal', value: data.overallSignal },
              { label: 'Pillars', value: data.pillars.length },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.pillars.map((p) => (
              <div key={p.id} className={`rounded-xl border p-5 ${SIGNAL_STYLES[p.signal]}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${SIGNAL_DOT[p.signal]}`} />
                  <h2 className="text-white font-semibold">{p.label}</h2>
                </div>
                <p className="text-slate-400 text-sm mb-3">{p.summary}</p>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(p.metrics).map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-slate-500 text-xs">{k}</dt>
                      <dd className="text-slate-200 font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/admin/discovery/intelligence" className="text-indigo-400 hover:text-indigo-300">Intelligence →</Link>
            <Link href="/admin/discovery/invitation" className="text-indigo-400 hover:text-indigo-300">Invitation Engine →</Link>
            <Link href="/admin/discovery/insights" className="text-indigo-400 hover:text-indigo-300">CRM Insights →</Link>
            <Link href="/admin/discovery/trust" className="text-indigo-400 hover:text-indigo-300">Trust Engine →</Link>
            <Link href="/admin/discovery/health" className="text-indigo-400 hover:text-indigo-300">Health →</Link>
            <Link href="/admin/discovery/readiness" className="text-indigo-400 hover:text-indigo-300">Readiness →</Link>
          </div>
        </div>
      )}
    </DiscoveryPageShell>
  );
}
