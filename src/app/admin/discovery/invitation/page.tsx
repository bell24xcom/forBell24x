'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { DiscoveryPageShell, MetricGrid, DataTable } from '@/src/components/admin/discovery/DiscoveryPageShell';

interface InvitationMetrics {
  invitations: { status: string; count: number }[];
  recipientStates: { status: string; count: number }[];
  campaignStatuses: { status: string; count: number }[];
  funnel: { stage: string; count: number; rateFromPrevious: number }[];
  readiness: {
    claimTokenConfigured: boolean;
    scrapegraphConfigured: boolean;
    unclaimedWithPhone: number;
    draftCampaigns: number;
    liveCampaigns: number;
    suppressedCount: number;
  };
  claimSummary: { claimed: number; unclaimed: number; claimRate: number };
}

export default function InvitationEnginePage() {
  const [data, setData] = useState<InvitationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/discovery/invitation', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load');
      setData(json.metrics);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const r = data?.readiness;

  return (
    <DiscoveryPageShell
      title="Invitation Engine"
      subtitle="Invitation status, claim funnel, and outreach readiness"
      loading={loading && !data}
      error={error}
      onRefresh={load}
    >
      {data && (
        <div className="space-y-6">
          <MetricGrid
            items={[
              { label: 'Claimed', value: data.claimSummary.claimed },
              { label: 'Unclaimed', value: data.claimSummary.unclaimed },
              { label: 'Claim Rate', value: `${data.claimSummary.claimRate}%` },
              { label: 'Live Campaigns', value: r?.liveCampaigns ?? 0 },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title="Conversion Funnel">
              <div className="space-y-3">
                {data.funnel.map((step) => (
                  <div key={step.stage} className="flex items-center gap-3">
                    <span className="text-slate-300 text-sm w-24">{step.stage}</span>
                    <div className="flex-1 bg-slate-900 rounded h-4 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded"
                        style={{ width: `${Math.min(100, step.rateFromPrevious)}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-xs w-16 text-right">{step.count}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Outreach Readiness">
              <ul className="space-y-2 text-sm">
                <ReadinessRow ok={r?.claimTokenConfigured} label="Claim token (JWT_SECRET)" />
                <ReadinessRow ok={r?.scrapegraphConfigured} label="ScrapeGraph API key" />
                <li className="text-slate-300">Unclaimed with phone: <strong>{r?.unclaimedWithPhone}</strong></li>
                <li className="text-slate-300">Draft campaigns: <strong>{r?.draftCampaigns}</strong></li>
                <li className="text-slate-300">Suppressed recipients: <strong>{r?.suppressedCount}</strong></li>
              </ul>
              <Link
                href="/admin/company-claim-outreach"
                className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 text-sm"
              >
                Manage campaigns →
              </Link>
            </Panel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Panel title="Invitation Status">
              <DataTable
                headers={['Status', 'Count']}
                rows={data.invitations.map((i) => [i.status, i.count])}
              />
            </Panel>
            <Panel title="Recipient States">
              <DataTable
                headers={['State', 'Count']}
                rows={data.recipientStates.map((i) => [i.status, i.count])}
              />
            </Panel>
            <Panel title="Campaign Status">
              <DataTable
                headers={['Status', 'Count']}
                rows={data.campaignStatuses.map((i) => [i.status, i.count])}
              />
            </Panel>
          </div>
        </div>
      )}
    </DiscoveryPageShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
      <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </div>
  );
}

function ReadinessRow({ ok, label }: { ok?: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-slate-300">
      <span className={ok ? 'text-green-400' : 'text-amber-400'}>{ok ? '✓' : '○'}</span>
      {label}
    </li>
  );
}
