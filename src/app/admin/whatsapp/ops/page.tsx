'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  MessageCircle,
  Webhook,
  FileText,
  Truck,
  Activity,
} from 'lucide-react';

const RANGES = [
  { label: '24h', value: 1 },
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
];

const ACTION_LABEL: Record<string, string> = {
  day1_wa_sent: 'Outreach sent',
  outreach_sent: 'Outreach sent',
  follow_up_1_sent: 'Follow-up 1',
  follow_up_2_sent: 'Follow-up 2',
  drip_day3_sent: 'Drip day 3',
  drip_day7_sent: 'Drip day 7',
  drip_day14_sent: 'Drip day 14',
  whatsapp_click: 'WA link click',
};

interface WaMetaStatus {
  status: 'READY' | 'NOT_CONFIGURED';
  phoneConfigured?: boolean;
  wabaConfigured?: boolean;
  tokenConfigured?: boolean;
  webhookConfigured?: boolean;
  capabilities?: { deliveryStatus?: boolean; templateMessage?: boolean };
  missingSendVars?: string[];
  missingWebhookVars?: string[];
}

interface OpsData {
  templates: {
    rfq: { configured: boolean; name: string | null; language: string };
    claim: { configured: boolean; name: string | null };
  };
  deliverySummary: { sent: number; delivered: number; read: number; failed: number; total: number };
  recentDeliveries: Array<{
    messageId: string;
    status: string;
    recipientRedacted: string;
    timestamp: string;
    loggedAt: string;
  }>;
  webhookEventsLogged: number;
  providerFailures24h: number;
  recentProviderFailures: Array<{
    id: string;
    provider: string;
    endpoint: string;
    errorCode: string | null;
    errorMessage: string;
    phoneOrRecipient: string | null;
    createdAt: string;
  }>;
  recentOutreachEvents: Array<{
    actionType: string;
    userId: string | null;
    source: string | null;
    createdAt: string;
  }>;
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold border px-2.5 py-1 rounded-full ${
        ok
          ? 'bg-green-900/40 border-green-700/50 text-green-400'
          : 'bg-amber-900/40 border-amber-700/50 text-amber-400'
      }`}
    >
      {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 ${className}`}>{children}</div>
  );
}

function deliveryStatusColor(status: string) {
  const s = status.toLowerCase();
  if (s === 'delivered' || s === 'read') return 'text-green-400';
  if (s === 'failed') return 'text-red-400';
  if (s === 'sent') return 'text-blue-400';
  return 'text-slate-400';
}

export default function WhatsAppOpsPage() {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [meta, setMeta] = useState<WaMetaStatus | null>(null);
  const [metaError, setMetaError] = useState('');
  const [ops, setOps] = useState<OpsData | null>(null);
  const [opsError, setOpsError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setMetaError('');
    setOpsError('');

    const [metaRes, opsRes] = await Promise.allSettled([
      fetch('/api/admin/whatsapp-meta/status', { credentials: 'include' }).then((r) => r.json()),
      fetch(`/api/admin/whatsapp/ops?days=${days}`, { credentials: 'include' }).then((r) => r.json()),
    ]);

    if (metaRes.status === 'fulfilled' && metaRes.value?.success) {
      setMeta(metaRes.value);
    } else {
      setMeta(null);
      setMetaError('Meta WhatsApp status unavailable');
    }

    if (opsRes.status === 'fulfilled' && opsRes.value?.success) {
      setOps(opsRes.value);
    } else {
      setOps(null);
      setOpsError(opsRes.status === 'fulfilled' ? opsRes.value?.error || 'Ops data unavailable' : 'Ops data unavailable');
    }

    if (
      (metaRes.status !== 'fulfilled' || !metaRes.value?.success) &&
      (opsRes.status !== 'fulfilled' || !opsRes.value?.success)
    ) {
      setError('Failed to load WhatsApp operations data');
    }
    setLoading(false);
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const providerFails = ops?.providerFailures24h ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">WhatsApp Operations</h1>
          <p className="text-slate-400 text-sm">Meta Cloud API · delivery · outreach · provider health</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setDays(r.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === r.value ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        {[
          { href: '/admin/whatsapp-cloud-api', label: 'Meta Cloud API', icon: MessageCircle },
          { href: '/admin/outreach', label: 'Outreach Dialer', icon: Activity },
          { href: '/admin/errors?tab=provider', label: 'Provider Errors', icon: AlertTriangle },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-2 text-xs bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500/50 px-3 py-2 rounded-lg transition-colors"
          >
            <link.icon className="w-3.5 h-3.5" />
            {link.label}
            <ExternalLink className="w-3 h-3 opacity-50" />
          </Link>
        ))}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {loading && !meta && !ops ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Readiness row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Panel>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-green-400" />
                <h2 className="text-sm font-semibold text-white">Meta WhatsApp</h2>
              </div>
              {metaError ? (
                <p className="text-slate-500 text-sm">{metaError}</p>
              ) : (
                <div className="space-y-2">
                  <StatusBadge ok={meta?.status === 'READY'} label={meta?.status === 'READY' ? 'READY' : 'NOT CONFIGURED'} />
                  <ul className="text-xs text-slate-400 space-y-1 mt-2">
                    <li>Phone ID: {meta?.phoneConfigured ? '✓' : '✗'}</li>
                    <li>WABA: {meta?.wabaConfigured ? '✓' : '✗'}</li>
                    <li>Access token: {meta?.tokenConfigured ? '✓' : '✗'}</li>
                  </ul>
                  {(meta?.missingSendVars?.length ?? 0) > 0 && (
                    <p className="text-amber-500/80 text-[10px] mt-2">Missing: {meta!.missingSendVars!.join(', ')}</p>
                  )}
                </div>
              )}
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-3">
                <Webhook className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">Webhook</h2>
              </div>
              {metaError ? (
                <p className="text-slate-500 text-sm">{metaError}</p>
              ) : (
                <div className="space-y-2">
                  <StatusBadge
                    ok={!!meta?.webhookConfigured}
                    label={meta?.webhookConfigured ? 'CONFIGURED' : 'NOT SET'}
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Delivery ingest: {meta?.capabilities?.deliveryStatus ? 'enabled' : 'disabled'}
                  </p>
                  {(meta?.missingWebhookVars?.length ?? 0) > 0 && (
                    <p className="text-amber-500/80 text-[10px]">Missing: {meta!.missingWebhookVars!.join(', ')}</p>
                  )}
                </div>
              )}
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-white">Templates</h2>
              </div>
              {opsError ? (
                <p className="text-slate-500 text-sm">{opsError}</p>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="text-slate-500 mb-1">RFQ notify</p>
                    <StatusBadge
                      ok={!!ops?.templates.rfq.configured}
                      label={ops?.templates.rfq.configured ? 'CONFIGURED' : 'NOT SET'}
                    />
                    {ops?.templates.rfq.name && (
                      <p className="text-slate-300 mt-1 font-mono truncate" title={ops.templates.rfq.name}>
                        {ops.templates.rfq.name} ({ops.templates.rfq.language})
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Claim outreach</p>
                    <StatusBadge
                      ok={!!ops?.templates.claim.configured}
                      label={ops?.templates.claim.configured ? 'CONFIGURED' : 'NOT SET'}
                    />
                    {ops?.templates.claim.name && (
                      <p className="text-slate-300 mt-1 font-mono truncate">{ops.templates.claim.name}</p>
                    )}
                  </div>
                </div>
              )}
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h2 className="text-sm font-semibold text-white">Provider Failures</h2>
              </div>
              {opsError ? (
                <p className="text-slate-500 text-sm">{opsError}</p>
              ) : (
                <>
                  <p className={`text-3xl font-bold ${providerFails > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {providerFails}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">Last 24 hours (MSG91 / providers)</p>
                  <Link href="/admin/errors?tab=provider" className="text-indigo-400 hover:underline text-xs mt-2 inline-block">
                    View error log →
                  </Link>
                </>
              )}
            </Panel>
          </div>

          {/* Delivery status */}
          <Panel>
            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-white">Delivery Status</h2>
                <span className="text-slate-500 text-xs">({days}d window)</span>
              </div>
              {ops && (
                <span className="text-slate-500 text-xs">{ops.webhookEventsLogged} webhook payloads logged</span>
              )}
            </div>
            {opsError ? (
              <p className="text-slate-500 text-sm">{opsError}</p>
            ) : !ops ? null : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  {[
                    { label: 'Total events', value: ops.deliverySummary.total, color: 'text-white' },
                    { label: 'Sent', value: ops.deliverySummary.sent, color: 'text-blue-400' },
                    { label: 'Delivered', value: ops.deliverySummary.delivered, color: 'text-green-400' },
                    { label: 'Read', value: ops.deliverySummary.read, color: 'text-emerald-300' },
                    { label: 'Failed', value: ops.deliverySummary.failed, color: 'text-red-400' },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-3">
                      <p className="text-slate-500 text-[10px] uppercase">{s.label}</p>
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
                {ops.deliverySummary.total === 0 ? (
                  <p className="text-slate-500 text-sm">
                    No Meta delivery status events in this period. Webhook must be configured and subscribed in Meta
                    dashboard.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {ops.recentDeliveries.map((d) => (
                      <div
                        key={`${d.messageId}-${d.timestamp}`}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/30 last:border-0"
                      >
                        <span className="text-slate-400 font-mono truncate max-w-[140px]">{d.messageId}</span>
                        <span className={deliveryStatusColor(d.status)}>{d.status}</span>
                        <span className="text-slate-500">{d.recipientRedacted}</span>
                        <span className="text-slate-600 whitespace-nowrap">
                          {new Date(d.timestamp).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Panel>

          {/* Activity: outreach + provider failures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel>
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Recent WhatsApp Activity
              </h2>
              {opsError ? (
                <p className="text-slate-500 text-sm">{opsError}</p>
              ) : !ops?.recentOutreachEvents.length ? (
                <p className="text-slate-500 text-sm">No outreach or drip events in this period</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {ops.recentOutreachEvents.map((e, i) => (
                    <div
                      key={`${e.actionType}-${e.createdAt}-${i}`}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/30 last:border-0"
                    >
                      <span className="text-slate-300">{ACTION_LABEL[e.actionType] ?? e.actionType}</span>
                      <span className="text-slate-500 truncate max-w-[100px]">{e.userId?.slice(0, 8) ?? '—'}</span>
                      <span className="text-slate-600 whitespace-nowrap">
                        {new Date(e.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/admin/outreach" className="text-indigo-400 hover:underline text-xs mt-3 inline-block">
                Open outreach dialer →
              </Link>
            </Panel>

            <Panel>
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Recent Provider Failures
              </h2>
              {opsError ? (
                <p className="text-slate-500 text-sm">{opsError}</p>
              ) : !ops?.recentProviderFailures.length ? (
                <p className="text-slate-500 text-sm">No provider failures logged</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {ops.recentProviderFailures.map((f) => (
                    <div key={f.id} className="py-2 border-b border-slate-700/30 last:border-0 text-xs">
                      <div className="flex justify-between gap-2">
                        <span className="text-red-300 font-medium">{f.provider}</span>
                        <span className="text-slate-600 whitespace-nowrap">
                          {new Date(f.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-400 truncate mt-0.5">{f.errorMessage}</p>
                      {f.phoneOrRecipient && (
                        <p className="text-slate-600 mt-0.5">Recipient: {f.phoneOrRecipient}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/admin/errors?tab=provider"
                className="text-indigo-400 hover:underline text-xs mt-3 inline-block"
              >
                Full provider error log →
              </Link>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
