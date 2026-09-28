'use client';

import { useCallback, useEffect, useState } from 'react';
import { CockpitShell, CockpitError, CockpitFallback } from '@/src/components/admin/cockpit/CockpitShell';
import { ActivationOverview, PipelineOverview, SeedToggle } from '@/src/components/admin/marketplace/PipelinePanels';
import type { ActivationResult, PipelineResult } from '@/src/lib/discovery/pipeline-core';

/**
 * Marketplace Activation Dashboard (MA-01, Phase 5). Admin only (the API enforces it); nothing here is public.
 * Data: GET /api/admin/launch-metrics?include=activation — read-only, derived from live tables on every load.
 */
export default function MarketplaceActivationPage() {
  const [includeSeed, setIncludeSeed] = useState(false);
  const [activation, setActivation] = useState<ActivationResult | null>(null);
  const [pipeline, setPipeline] = useState<PipelineResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/launch-metrics?include=activation${includeSeed ? '&includeSeed=1' : ''}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || `Request failed (${res.status})`);
      if (json.activationError || !json.activation) throw new Error(json.activationError || 'Activation metrics were not returned');
      setActivation(json.activation);
      setPipeline(json.pipeline);
    } catch (e) {
      setActivation(null);
      setPipeline(null);
      setError(e instanceof Error ? e.message : 'Failed to load activation metrics');
    } finally {
      setLoading(false);
    }
  }, [includeSeed]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <CockpitShell title="Marketplace Activation" subtitle="Supplier activation, invitations, RFQ readiness and outreach — live from the database" onRefresh={load} loading={loading}>
      <div className="flex justify-end">
        <SeedToggle includeSeed={includeSeed} onChange={setIncludeSeed} />
      </div>
      {error && <CockpitError message={error} onRetry={load} />}
      {loading && !activation && !error && <CockpitFallback message="Loading…" />}
      {activation && pipeline && (
        <div className="space-y-8">
          <ActivationOverview activation={activation} />
          <PipelineOverview pipeline={pipeline} />
        </div>
      )}
    </CockpitShell>
  );
}
