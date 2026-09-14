'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CockpitShell,
  CockpitPanel,
  CockpitSectionLabel,
  CockpitFallback,
  CockpitError,
} from '@/src/components/admin/cockpit/CockpitShell';

interface ExplainHealth {
  success: boolean;
  serviceUrl: string;
  configuredInVercel: boolean;
  health?: Record<string, unknown>;
  error?: string;
  hint?: string;
}

interface OsStatus {
  status: 'READY' | 'NOT_CONFIGURED';
  baseUrl?: string;
  missing?: string[];
}

export default function AiAgentsPage() {
  const [explain, setExplain] = useState<ExplainHealth | null>(null);
  const [os, setOs] = useState<OsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [explainRes, osRes] = await Promise.all([
        fetch('/api/admin/ai/explain-health', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/admin/bell24h-os/test-ai', { credentials: 'include' }).then((r) => r.json()),
      ]);
      setExplain(explainRes);
      if (osRes.success) {
        setOs({
          status: osRes.status === 'READY' ? 'READY' : 'NOT_CONFIGURED',
          baseUrl: osRes.baseUrl,
          missing: osRes.missing,
        });
      }
    } catch {
      setError('Failed to load AI agent health');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <CockpitShell
      title="AI Agent Health Monitor"
      subtitle="Python explainer service and Bell24h-OS AI gateway"
      onRefresh={load}
      loading={loading}
    >
      {error && <CockpitError message={error} onRetry={load} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CockpitPanel>
          <CockpitSectionLabel>SHAP / LIME Explainer (Python)</CockpitSectionLabel>
          {!explain ? (
            <CockpitFallback message="Health check pending" />
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className={explain.success ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                  {explain.success ? 'HEALTHY' : 'DOWN / UNREACHABLE'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Service URL</span>
                <span className="text-slate-300 text-xs truncate">{explain.serviceUrl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Env configured</span>
                <span className="text-slate-300">{explain.configuredInVercel ? 'Yes' : 'No (default URL)'}</span>
              </div>
              {explain.error && <p className="text-red-400 text-xs">{explain.error}</p>}
              {explain.hint && <p className="text-amber-500/80 text-xs">{explain.hint}</p>}
              {explain.health && (
                <pre className="text-[10px] text-slate-500 bg-slate-900/50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(explain.health, null, 2)}
                </pre>
              )}
            </div>
          )}
        </CockpitPanel>

        <CockpitPanel>
          <CockpitSectionLabel>Bell24h-OS AI Text Gateway</CockpitSectionLabel>
          {!os ? (
            <CockpitFallback message="OS status unavailable" />
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Integration</span>
                <span className={os.status === 'READY' ? 'text-green-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {os.status}
                </span>
              </div>
              {os.baseUrl && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Base URL</span>
                  <span className="text-slate-300 text-xs truncate">{os.baseUrl}</span>
                </div>
              )}
              {(os.missing?.length ?? 0) > 0 && (
                <p className="text-amber-500/80 text-xs">Missing: {os.missing!.join(', ')}</p>
              )}
              <p className="text-slate-600 text-xs">
                Live probe requires POST with confirm:true — see Bell24h-OS status page.
              </p>
            </div>
          )}
        </CockpitPanel>
      </div>
    </CockpitShell>
  );
}
