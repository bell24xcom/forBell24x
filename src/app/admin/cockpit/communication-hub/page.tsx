'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CockpitShell,
  CockpitPanel,
  CockpitSectionLabel,
  CockpitFallback,
} from '@/src/components/admin/cockpit/CockpitShell';

interface WaMeta {
  status: string;
  webhookConfigured: boolean;
  capabilities?: { textMessage?: boolean; templateMessage?: boolean; webhook?: boolean; deliveryStatus?: boolean };
}

interface WaOps {
  templates: { rfq: { configured: boolean; name: string | null }; claim: { configured: boolean; name: string | null } };
  deliverySummary: { total: number; failed: number };
  providerFailures24h: number;
}

export default function CommunicationHubPage() {
  const [meta, setMeta] = useState<WaMeta | null>(null);
  const [ops, setOps] = useState<WaOps | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [metaRes, opsRes] = await Promise.all([
        fetch('/api/admin/whatsapp-meta/status', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/admin/whatsapp/ops?days=7', { credentials: 'include' }).then((r) => r.json()),
      ]);
      if (metaRes.success) setMeta(metaRes);
      if (opsRes.success) setOps(opsRes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <CockpitShell
      title="Communication Hub Status"
      subtitle="Bell24h-OS Communication Hub (planned) vs VyaparSethu Meta WhatsApp (live)"
      onRefresh={load}
      loading={loading}
    >
      <CockpitPanel>
        <CockpitSectionLabel>Bell24h-OS Communication Hub</CockpitSectionLabel>
        <div className="border border-amber-700/40 bg-amber-900/10 rounded-lg p-4 text-sm">
          <p className="text-amber-300 font-semibold">NOT IMPLEMENTED</p>
          <p className="text-slate-400 text-xs mt-2">
            Contract Group B defines a future unified messaging hub in Bell24h-OS. VyaparSethu currently routes
            WhatsApp directly via Meta Cloud API — not through OS.
          </p>
        </div>
      </CockpitPanel>

      <CockpitPanel>
        <CockpitSectionLabel>VyaparSethu WhatsApp channel (production path)</CockpitSectionLabel>
        {!meta ? (
          <CockpitFallback message="WhatsApp status unavailable" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              { label: 'Send readiness', ok: meta.status === 'READY' },
              { label: 'Webhook', ok: meta.webhookConfigured },
              { label: 'Templates', ok: meta.capabilities?.templateMessage },
              { label: 'Delivery ingest', ok: meta.capabilities?.deliveryStatus },
            ].map((c) => (
              <div key={c.label} className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-3">
                <p className="text-slate-500 text-xs">{c.label}</p>
                <p className={`font-semibold mt-1 ${c.ok ? 'text-green-400' : 'text-amber-400'}`}>
                  {c.ok ? 'OK' : 'GAP'}
                </p>
              </div>
            ))}
          </div>
        )}
        {ops && (
          <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-slate-500">RFQ template</p>
              <p className="text-slate-300">{ops.templates.rfq.name || 'not set'}</p>
            </div>
            <div>
              <p className="text-slate-500">Claim template</p>
              <p className="text-slate-300">{ops.templates.claim.name || 'not set'}</p>
            </div>
            <div>
              <p className="text-slate-500">Delivery events (7d)</p>
              <p className="text-slate-300">{ops.deliverySummary.total} ({ops.deliverySummary.failed} failed)</p>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-3 mt-4 text-xs">
          <Link href="/admin/whatsapp/ops" className="text-indigo-400 hover:underline">WhatsApp Ops →</Link>
          <Link href="/admin/whatsapp-cloud-api" className="text-indigo-400 hover:underline">Meta Cloud API →</Link>
          <Link href="/admin/outreach" className="text-indigo-400 hover:underline">Outreach →</Link>
        </div>
      </CockpitPanel>
    </CockpitShell>
  );
}
