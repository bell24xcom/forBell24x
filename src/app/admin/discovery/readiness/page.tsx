'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

type ReadinessLevel = 'READY' | 'PARTIAL' | 'MISSING';

interface ReadinessItem {
  id: string;
  label: string;
  status: ReadinessLevel;
  note: string;
}

interface ReadinessSummary {
  score: number;
  ready: number;
  partial: number;
  missing: number;
}

const STATUS_STYLES: Record<ReadinessLevel, string> = {
  READY: 'bg-green-900/40 border-green-700/50 text-green-400',
  PARTIAL: 'bg-amber-900/40 border-amber-700/50 text-amber-400',
  MISSING: 'bg-red-900/40 border-red-700/50 text-red-400',
};

export default function DiscoveryReadinessPage() {
  const [readiness, setReadiness] = useState<ReadinessItem[]>([]);
  const [summary, setSummary] = useState<ReadinessSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/discovery/readiness', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load');
      setReadiness(json.readiness ?? []);
      setSummary(json.summary ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/discovery" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-2">
            <ArrowLeft className="w-4 h-4" /> Discovery Engine
          </Link>
          <h1 className="text-2xl font-bold text-white">Discovery Readiness</h1>
          <p className="text-slate-400 text-sm mt-1">Runtime probes · READY / PARTIAL / MISSING</p>
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

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Score', value: `${summary.score}%` },
            { label: 'Ready', value: summary.ready },
            { label: 'Partial', value: summary.partial },
            { label: 'Missing', value: summary.missing },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-500 text-xs uppercase">{s.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {loading && readiness.length === 0 ? (
        <p className="text-slate-500 text-sm">Loading readiness board…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {readiness.map((item) => (
            <div key={item.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-white font-medium">{item.label}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_STYLES[item.status]}`}>
                  {item.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">{item.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
