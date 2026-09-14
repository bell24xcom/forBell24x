'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface HealthMetrics {
  imported: number;
  claimed: number;
  unclaimed: number;
  claimRate: number;
  invitationSent: number;
  invitationClaimed: number;
  invitationConversion: number;
  trustDistribution: { bucket: string; count: number }[];
  categoryCoverage: { category: string; count: number }[];
  outreachQueued: number;
  outreachSent: number;
  recentImports7d: number;
}

export default function DiscoveryHealthPage() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/discovery/health', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load');
      setMetrics(json.metrics);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const maxTrust = metrics?.trustDistribution.reduce((m, b) => Math.max(m, b.count), 1) ?? 1;
  const maxCat = metrics?.categoryCoverage.reduce((m, c) => Math.max(m, c.count), 1) ?? 1;

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/discovery" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-2">
            <ArrowLeft className="w-4 h-4" /> Discovery Engine
          </Link>
          <h1 className="text-2xl font-bold text-white">Discovery Health</h1>
          <p className="text-slate-400 text-sm mt-1">Live metrics from discovered supplier pipeline</p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {loading && !metrics ? (
        <p className="text-slate-500 text-sm">Loading health metrics…</p>
      ) : metrics ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Imported', value: metrics.imported },
              { label: 'Claimed', value: metrics.claimed },
              { label: 'Unclaimed', value: metrics.unclaimed },
              { label: 'Claim Rate', value: `${metrics.claimRate}%` },
              { label: 'Invites Sent', value: metrics.invitationSent },
              { label: 'Invites Claimed', value: metrics.invitationClaimed },
              { label: 'Invite Conversion', value: `${metrics.invitationConversion}%` },
              { label: 'Imports (7d)', value: metrics.recentImports7d },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <p className="text-slate-500 text-xs uppercase">{s.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                Trust Score Distribution
              </h2>
              {metrics.trustDistribution.every((b) => b.count === 0) ? (
                <p className="text-slate-500 text-sm">No discovered suppliers yet.</p>
              ) : (
                <div className="space-y-2">
                  {metrics.trustDistribution.map((b) => (
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

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                Category Coverage
              </h2>
              {metrics.categoryCoverage.length === 0 ? (
                <p className="text-slate-500 text-sm">No categories recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {metrics.categoryCoverage.map((c) => (
                    <div key={c.category} className="flex items-center gap-3">
                      <span className="text-slate-300 text-xs flex-1 truncate">{c.category}</span>
                      <div className="w-24 bg-slate-900 rounded h-3 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded"
                          style={{ width: `${(c.count / maxCat) * 100}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-xs w-6 text-right">{c.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Outreach Pipeline</h2>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-slate-500">Queued</span>
                <p className="text-white font-bold text-xl">{metrics.outreachQueued}</p>
              </div>
              <div>
                <span className="text-slate-500">Sent</span>
                <p className="text-white font-bold text-xl">{metrics.outreachSent}</p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
