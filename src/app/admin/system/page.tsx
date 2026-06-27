'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Database,
  ShieldCheck,
  Gauge,
  Brain,
} from 'lucide-react';

type Severity = 'required' | 'recommended' | 'optional';
type Color = 'green' | 'amber' | 'red';

interface EnvCheck {
  key: string;
  label: string;
  group: string;
  severity: Severity;
  configured: boolean;
}

interface Diagnostics {
  generatedAt: string;
  environment: {
    checks: EnvCheck[];
    requiredConfigured: number;
    requiredTotal: number;
    legacyInsforgePresent: boolean;
  };
  health: {
    database: { connected: boolean; latencyMs: number | null; error: string | null };
    counts: Record<string, number>;
    bom: {
      totalEvents: number;
      lastEventAt: string | null;
      recordedTypes: number;
      totalTypes: number;
      coverage: { eventType: string; recorded: boolean }[];
    };
  };
  readiness: {
    overall: number;
    color: Color;
    scores: { id: string; label: string; value: number; color: Color }[];
  };
}

const COLOR_CLASS: Record<Color, string> = {
  green: 'text-emerald-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
};
const RING_CLASS: Record<Color, string> = {
  green: 'border-emerald-500/40 bg-emerald-500/10',
  amber: 'border-amber-500/40 bg-amber-500/10',
  red: 'border-red-500/40 bg-red-500/10',
};

type Tab = 'readiness' | 'environment' | 'health';

export default function SystemDashboard() {
  const [data, setData] = useState<Diagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('readiness');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/system/diagnostics', { credentials: 'include' });
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || 'Failed to load diagnostics');
    } catch {
      setError('Failed to load diagnostics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-white mb-4">System & Production Readiness</h1>
        <p className="text-slate-400">Loading diagnostics...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            System & Production Readiness
          </h1>
          {data && (
            <p className="text-slate-500 text-xs mt-1">
              Generated {new Date(data.generatedAt).toLocaleString('en-IN')}
            </p>
          )}
        </div>
        <button
          onClick={load}
          className="text-slate-400 hover:text-white text-xs flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 rounded-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-700/50">
            {([
              ['readiness', 'Readiness'],
              ['environment', 'Environment'],
              ['health', 'Health & Memory'],
            ] as [Tab, string][]).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === id
                    ? 'border-indigo-400 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'readiness' && <ReadinessTab data={data} />}
          {tab === 'environment' && <EnvironmentTab data={data} />}
          {tab === 'health' && <HealthTab data={data} />}
        </>
      )}
    </div>
  );
}

function ReadinessTab({ data }: { data: Diagnostics }) {
  const { overall, color, scores } = data.readiness;
  return (
    <div className="space-y-6">
      <div className={`rounded-xl border p-6 flex items-center gap-6 ${RING_CLASS[color]}`}>
        <div className="text-center">
          <div className={`text-5xl font-bold ${COLOR_CLASS[color]}`}>{overall}</div>
          <div className="text-slate-400 text-xs mt-1">/ 100</div>
        </div>
        <div>
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Gauge className="w-4 h-4 text-indigo-400" />
            Overall Platform Readiness
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {overall >= 80
              ? 'Ready for supplier onboarding.'
              : overall >= 50
                ? 'Close — clear the amber/red items below before onboarding.'
                : 'Not yet production-ready. Address the red items first.'}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {scores.map((s) => (
          <div key={s.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">{s.label}</span>
              <span className={`text-lg font-bold ${COLOR_CLASS[s.color]}`}>{s.value}</span>
            </div>
            <div className="mt-2 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  s.color === 'green' ? 'bg-emerald-400' : s.color === 'amber' ? 'bg-amber-400' : 'bg-red-400'
                }`}
                style={{ width: `${s.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnvironmentTab({ data }: { data: Diagnostics }) {
  const { checks, requiredConfigured, requiredTotal, legacyInsforgePresent } = data.environment;
  const groups = Array.from(new Set(checks.map((c) => c.group)));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 text-sm">
        <ShieldCheck className="w-4 h-4 text-indigo-400" />
        <span className="text-slate-300">
          Required variables configured:{' '}
          <span className={requiredConfigured === requiredTotal ? 'text-emerald-400' : 'text-amber-400'}>
            {requiredConfigured}/{requiredTotal}
          </span>
        </span>
      </div>

      {legacyInsforgePresent && (
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-3 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Legacy InsForge credentials are still set — the platform runs on Prisma + Neon. Remove them.
        </div>
      )}

      {groups.map((group) => (
        <div key={group} className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-700/50 text-white text-sm font-semibold">{group}</div>
          <div className="divide-y divide-slate-700/50">
            {checks
              .filter((c) => c.group === group)
              .map((c) => (
                <div key={c.key} className="px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-slate-200 text-sm">{c.label}</div>
                    <div className="text-slate-600 text-[10px] font-mono">{c.key}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] uppercase tracking-wide ${
                        c.severity === 'required'
                          ? 'text-red-400/80'
                          : c.severity === 'recommended'
                            ? 'text-amber-400/80'
                            : 'text-slate-500'
                      }`}
                    >
                      {c.severity}
                    </span>
                    {c.configured ? (
                      <span className="text-emerald-400 text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Configured
                      </span>
                    ) : (
                      <span
                        className={`text-xs flex items-center gap-1 ${
                          c.severity === 'optional' ? 'text-slate-500' : 'text-red-400'
                        }`}
                      >
                        <XCircle className="w-4 h-4" /> Missing
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
      <p className="text-slate-600 text-[11px]">
        Presence-only check — secret values are never read or transmitted.
      </p>
    </div>
  );
}

function HealthTab({ data }: { data: Diagnostics }) {
  const { database, counts, bom } = data.health;
  const countEntries: [string, string][] = [
    ['users', 'Users'],
    ['verifiedSuppliers', 'Verified Suppliers'],
    ['rfqs', 'RFQs'],
    ['rfqMemory', 'RFQ Memory'],
    ['quoteMemory', 'Quote Memory'],
    ['deals', 'Deals'],
    ['lifeEvents', 'Life Events'],
    ['marketInsights', 'Market Insights'],
  ];

  return (
    <div className="space-y-5">
      {/* Database */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
        <h2 className="text-white font-semibold flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-indigo-400" />
          Database (Neon)
        </h2>
        {database.connected ? (
          <p className="text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Connected
            {database.latencyMs != null && <span className="text-slate-500">· {database.latencyMs}ms</span>}
          </p>
        ) : (
          <p className="text-red-400 text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Not connected{database.error ? ` — ${database.error}` : ''}
          </p>
        )}
      </div>

      {/* Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {countEntries.map(([key, label]) => (
          <div key={key} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">{counts[key] ?? 0}</div>
            <div className="text-slate-500 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* BOM coverage */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Brain className="w-4 h-4 text-fuchsia-400" />
            Business Operating Memory — Event Coverage
          </h2>
          <span className="text-slate-400 text-xs">
            {bom.recordedTypes}/{bom.totalTypes} event types seen ·{' '}
            {bom.lastEventAt ? `last ${new Date(bom.lastEventAt).toLocaleString('en-IN')}` : 'no events yet'}
          </span>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {bom.coverage.map((c) => (
            <div key={c.eventType} className="flex items-center gap-2 text-xs">
              {c.recorded ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              )}
              <span className={c.recorded ? 'text-slate-300' : 'text-slate-600'}>{c.eventType}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
