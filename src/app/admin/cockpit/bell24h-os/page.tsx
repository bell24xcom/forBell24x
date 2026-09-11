'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CockpitShell,
  CockpitPanel,
  CockpitSectionLabel,
  CockpitFallback,
} from '@/src/components/admin/cockpit/CockpitShell';

interface OsStatus {
  provider: string;
  status: 'READY' | 'NOT_CONFIGURED';
  baseUrlConfigured?: boolean;
  baseUrl?: string;
  tokenConfigured?: boolean;
  missing?: string[];
}

interface Job {
  id: string;
  name: string;
  enabled: boolean;
}

export default function Bell24hOsPage() {
  const [os, setOs] = useState<OsStatus | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [osRes, jobsRes] = await Promise.all([
        fetch('/api/admin/bell24h-os/test-ai', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/admin/automation/jobs', { credentials: 'include' }).then((r) => r.json()),
      ]);
      if (osRes.success) setOs(osRes);
      if (jobsRes.success) setJobs(jobsRes.jobs ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const ready = os?.status === 'READY';

  return (
    <CockpitShell
      title="Bell24h-OS Integration Status"
      subtitle="Service-to-service AI gateway and automation surface"
      onRefresh={load}
      loading={loading}
    >
      <CockpitPanel>
        <CockpitSectionLabel>Integration readiness</CockpitSectionLabel>
        {!os ? (
          <CockpitFallback message="OS status unavailable" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className={`border rounded-xl p-4 ${ready ? 'border-green-700/50 bg-green-900/20' : 'border-amber-700/50 bg-amber-900/20'}`}>
              <p className="text-slate-400 text-xs uppercase">Overall</p>
              <p className={`text-xl font-bold mt-1 ${ready ? 'text-green-400' : 'text-amber-400'}`}>{os.status}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Base URL</span>
                <span className="text-slate-300">{os.baseUrlConfigured ? '✓' : '✗'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Service token</span>
                <span className="text-slate-300">{os.tokenConfigured ? '✓' : '✗'}</span>
              </div>
              {os.baseUrl && <p className="text-slate-500 text-xs truncate">{os.baseUrl}</p>}
              {(os.missing?.length ?? 0) > 0 && (
                <p className="text-amber-500/80 text-xs">Missing env: {os.missing!.join(', ')}</p>
              )}
            </div>
          </div>
        )}
      </CockpitPanel>

      <CockpitPanel>
        <CockpitSectionLabel>Capabilities (contract v1)</CockpitSectionLabel>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between border-b border-slate-700/30 py-2">
            <span className="text-slate-300">POST /api/v1/ai/text</span>
            <span className="text-green-400 font-medium">IMPLEMENTED</span>
          </li>
          <li className="flex justify-between border-b border-slate-700/30 py-2">
            <span className="text-slate-300">Communication Hub</span>
            <span className="text-amber-400 font-medium">NOT IMPLEMENTED</span>
          </li>
          <li className="flex justify-between border-b border-slate-700/30 py-2">
            <span className="text-slate-300">Supplier discovery / matching</span>
            <span className="text-amber-400 font-medium">VYAPARSETHU-OWNED</span>
          </li>
          <li className="flex justify-between py-2">
            <span className="text-slate-300">RFQ orchestration</span>
            <span className="text-amber-400 font-medium">VYAPARSETHU-OWNED</span>
          </li>
        </ul>
        <p className="text-slate-600 text-xs mt-3">
          Reference: <code className="text-slate-400">docs/project/BELL24H-OS-VYAPARSETHU-SDK-API-CONTRACT-v1.0.md</code>
        </p>
      </CockpitPanel>

      <CockpitPanel>
        <CockpitSectionLabel>Local automation jobs (VyaparSethu)</CockpitSectionLabel>
        {jobs.length === 0 ? (
          <CockpitFallback message="No jobs registered" />
        ) : (
          <ul className="space-y-1 text-xs max-h-40 overflow-y-auto">
            {jobs.map((j) => (
              <li key={j.id} className="flex justify-between py-1">
                <span className="text-slate-300">{j.name}</span>
                <span className={j.enabled ? 'text-green-400' : 'text-slate-500'}>{j.enabled ? 'on' : 'off'}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin/automation" className="text-indigo-400 hover:underline text-xs mt-2 inline-block">
          Jobs &amp; Scheduler →
        </Link>
      </CockpitPanel>
    </CockpitShell>
  );
}
