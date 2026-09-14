'use client';

import { useCallback, useEffect, useState } from 'react';
import { DiscoveryPageShell, MetricGrid, DataTable } from '@/src/components/admin/discovery/DiscoveryPageShell';

interface CrmInsights {
  claimedUnclaimed: {
    claimed: number;
    unclaimed: number;
    claimRate: number;
    claimedLast7d: number;
    claimedLast30d: number;
  };
  sourcePerformance: { source: string; imported: number; claimed: number; claimRate: number; avgTrustScore: number }[];
  topCategories: { name: string; imported: number; claimed: number; claimRate: number }[];
  topCities: { name: string; imported: number; claimed: number; claimRate: number }[];
}

export default function DiscoveryInsightsPage() {
  const [data, setData] = useState<CrmInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/discovery/insights', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load');
      setData(json.insights);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cu = data?.claimedUnclaimed;

  return (
    <DiscoveryPageShell
      title="Discovery CRM Insights"
      subtitle="Claimed vs unclaimed, source performance, top converting categories and cities"
      loading={loading && !data}
      error={error}
      onRefresh={load}
    >
      {data && cu && (
        <div className="space-y-6">
          <MetricGrid
            items={[
              { label: 'Claimed', value: cu.claimed },
              { label: 'Unclaimed', value: cu.unclaimed },
              { label: 'Claims (7d)', value: cu.claimedLast7d },
              { label: 'Claims (30d)', value: cu.claimedLast30d },
            ]}
          />

          <Panel title="Discovery Source Performance">
            <DataTable
              headers={['Source', 'Imported', 'Claimed', 'Claim %', 'Avg Trust']}
              rows={data.sourcePerformance.map((r) => [
                r.source, r.imported, r.claimed, `${r.claimRate}%`, r.avgTrustScore,
              ])}
            />
          </Panel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title="Top Converting Categories">
              <DataTable
                headers={['Category', 'Imported', 'Claimed', 'Rate']}
                rows={data.topCategories.map((r) => [
                  r.name, r.imported, r.claimed, `${r.claimRate}%`,
                ])}
              />
            </Panel>
            <Panel title="Top Converting Cities">
              <DataTable
                headers={['City', 'Imported', 'Claimed', 'Rate']}
                rows={data.topCities.map((r) => [
                  r.name, r.imported, r.claimed, `${r.claimRate}%`,
                ])}
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
