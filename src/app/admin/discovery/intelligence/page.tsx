'use client';

import { useCallback, useEffect, useState } from 'react';
import { DiscoveryPageShell, MetricGrid, DataTable } from '@/src/components/admin/discovery/DiscoveryPageShell';

interface Intelligence {
  categories: { category: string; imported: number; claimed: number; claimRate: number; avgTrustScore: number }[];
  cities: { city: string; imported: number; claimed: number; claimRate: number }[];
  sources: { source: string; imported: number; claimed: number; claimRate: number; outreachSent: number; outreachClaimed: number }[];
  conversion: {
    imported: number;
    withOutreach: number;
    outreachRate: number;
    sent: number;
    sentRate: number;
    claimed: number;
    claimRate: number;
    endToEndConversion: number;
  };
}

export default function DiscoveryIntelligencePage() {
  const [data, setData] = useState<Intelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/discovery/intelligence', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load');
      setData(json.intelligence);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const c = data?.conversion;

  return (
    <DiscoveryPageShell
      title="Discovery Intelligence"
      subtitle="Category, city, source intelligence and conversion metrics"
      loading={loading && !data}
      error={error}
      onRefresh={load}
    >
      {data && (
        <div className="space-y-6">
          {c && (
            <MetricGrid
              items={[
                { label: 'Imported', value: c.imported },
                { label: 'With Outreach', value: `${c.outreachRate}%` },
                { label: 'Sent', value: `${c.sentRate}%` },
                { label: 'End-to-End Claim', value: `${c.endToEndConversion}%` },
              ]}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title="Category Intelligence">
              <DataTable
                headers={['Category', 'Imported', 'Claimed', 'Rate', 'Avg Trust']}
                rows={data.categories.slice(0, 20).map((r) => [
                  r.category, r.imported, r.claimed, `${r.claimRate}%`, r.avgTrustScore,
                ])}
              />
            </Panel>
            <Panel title="City Intelligence">
              <DataTable
                headers={['City', 'Imported', 'Claimed', 'Rate']}
                rows={data.cities.slice(0, 20).map((r) => [
                  r.city, r.imported, r.claimed, `${r.claimRate}%`,
                ])}
              />
            </Panel>
          </div>

          <Panel title="Supplier Source Intelligence">
            <DataTable
              headers={['Source', 'Imported', 'Claimed', 'Claim %', 'Outreach Sent', 'Outreach Claimed']}
              rows={data.sources.map((r) => [
                r.source, r.imported, r.claimed, `${r.claimRate}%`, r.outreachSent, r.outreachClaimed,
              ])}
            />
          </Panel>
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
