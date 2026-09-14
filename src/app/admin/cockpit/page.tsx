'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { RevenueSummary } from '@/src/components/admin/RevenueSummary';

/** Founder Cockpit v1 — composition over existing admin APIs. No new tables. */

type Range = '1d' | '7d' | '30d';

interface Stats {
  users: { total: number; buyers: number; suppliers: number; newToday: number; newThisWeek: number };
  rfqs: { total: number; active: number; completed: number; cancelled: number; seeded?: number; real?: number };
  quotes: { total: number; accepted: number; pending: number };
  transactions: { total: number; completed: number; completedVolume: number };
  funnel: {
    rfqsCreated: number;
    quotesSubmitted: number;
    quotesAccepted: number;
    dealsCompleted: number;
    conversionRate: string;
  };
  trust: { highTrustSuppliers: number };
  pendingKyc?: number;
  pendingKycReal?: number;
  importedUnverified?: number;
  unansweredRfqs?: number;
  unansweredRealRfqs?: number;
  expiringSoon?: number;
  activity?: Array<{ type: string; label: string; time: string }>;
  providerFailures24h?: number;
}

interface WaStatus {
  status: 'READY' | 'NOT_CONFIGURED';
  phoneConfigured?: boolean;
  wabaConfigured?: boolean;
  tokenConfigured?: boolean;
  webhookConfigured?: boolean;
  capabilities?: { deliveryStatus?: boolean };
  missingSendVars?: string[];
  missingWebhookVars?: string[];
}

interface OsStatus {
  status: 'READY' | 'NOT_CONFIGURED';
  missing?: string[];
}

interface OutreachPeriod {
  outreachSent: number;
  waClicks: number;
  uniqueSuppliersReached: number;
  conversionRate: string;
  subscriptions: number;
}

interface RfqPreview {
  id: string;
  title: string;
  status: string;
  urgency: string;
  createdAt: string;
  _count?: { quotes: number };
  quotes?: unknown[];
}

interface Job {
  id: string;
  name: string;
  enabled: boolean;
  schedule?: string;
}

const RANGES: [Range, string][] = [
  ['1d', 'Today'],
  ['7d', '7 Days'],
  ['30d', '30 Days'],
];

const ACTIVITY_ICONS: Record<string, string> = {
  user: '🟢',
  rfq: '📋',
  quote: '💬',
  deal: '💰',
};

const QUICK_LAUNCH = [
  { href: '/admin/rfqs', label: 'RFQs', desc: 'Requirements board' },
  { href: '/admin/crm', label: 'CRM', desc: 'Users & verify' },
  { href: '/admin/suppliers', label: 'Suppliers', desc: 'Supplier directory' },
  { href: '/admin/customers', label: 'Customers', desc: 'Buyer list' },
  { href: '/admin/whatsapp/ops', label: 'WA Ops', desc: 'WhatsApp operations' },
  { href: '/admin/whatsapp-cloud-api', label: 'WA Meta', desc: 'Cloud API status' },
  { href: '/admin/outreach', label: 'Outreach', desc: 'WhatsApp dialer' },
  { href: '/admin/revenue', label: 'Revenue', desc: 'Full revenue board' },
  { href: '/admin/errors', label: 'Errors', desc: 'Provider & logs' },
  { href: '/admin/automation', label: 'Jobs', desc: 'Scheduler' },
];

const fmt = (n: number) => n.toLocaleString('en-IN');

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-white font-semibold">
          {fmt(value)}{' '}
          <span className="text-slate-500 text-xs">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ReadinessChip({
  label,
  tone,
  detail,
  href,
}: {
  label: string;
  tone: 'green' | 'amber' | 'red' | 'slate';
  detail: string;
  href?: string;
}) {
  const border =
    tone === 'green'
      ? 'border-green-700/50 bg-green-900/20'
      : tone === 'amber'
        ? 'border-amber-700/50 bg-amber-900/20'
        : tone === 'red'
          ? 'border-red-700/50 bg-red-900/20'
          : 'border-slate-700/50 bg-slate-800/60';
  const text =
    tone === 'green'
      ? 'text-green-400'
      : tone === 'amber'
        ? 'text-amber-400'
        : tone === 'red'
          ? 'text-red-400'
          : 'text-slate-400';

  const inner = (
    <div className={`border rounded-xl px-3 py-3 ${border} h-full`}>
      <p className="text-slate-400 text-[10px] uppercase tracking-wide font-medium">{label}</p>
      <p className={`text-sm font-bold mt-1 ${text}`}>{detail}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-90 transition-opacity">
        {inner}
      </Link>
    );
  }
  return inner;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">{children}</h2>
  );
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 ${className}`}>{children}</div>
  );
}

function WidgetFallback({ message }: { message: string }) {
  return <p className="text-slate-500 text-sm">{message}</p>;
}

export default function FounderCockpitPage() {
  const [range, setRange] = useState<Range>('7d');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState('');

  const [wa, setWa] = useState<WaStatus | null>(null);
  const [waError, setWaError] = useState('');

  const [os, setOs] = useState<OsStatus | null>(null);
  const [osError, setOsError] = useState('');

  const [outreach, setOutreach] = useState<OutreachPeriod | null>(null);
  const [outreachError, setOutreachError] = useState('');
  const [outreachDays, setOutreachDays] = useState(7);

  const [rfqs, setRfqs] = useState<RfqPreview[]>([]);
  const [rfqsError, setRfqsError] = useState('');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsError, setJobsError] = useState('');
  const [schedulerName, setSchedulerName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setStatsError('');
    setWaError('');
    setOsError('');
    setOutreachError('');
    setRfqsError('');
    setJobsError('');

    const days = range === '1d' ? 1 : range === '30d' ? 30 : 7;
    setOutreachDays(days);

    const settled = await Promise.allSettled([
      fetch(`/api/admin/stats?range=${range}`, { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/admin/whatsapp-meta/status', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/admin/bell24h-os/test-ai', { credentials: 'include' }).then((r) => r.json()),
      fetch(`/api/admin/outreach-stats?days=${days}`, { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/admin/rfqs?status=ACTIVE&limit=5&page=1', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/admin/automation/jobs', { credentials: 'include' }).then((r) => r.json()),
    ]);

    // Stats
    const s0 = settled[0];
    if (s0.status === 'fulfilled' && s0.value?.success && s0.value.stats) {
      setStats(s0.value.stats);
    } else {
      setStats(null);
      setStatsError(
        s0.status === 'fulfilled' ? s0.value?.message || 'Failed to load stats' : 'Network error loading stats'
      );
    }

    // WhatsApp
    const s1 = settled[1];
    if (s1.status === 'fulfilled' && s1.value?.success) {
      setWa({
        status: s1.value.status === 'READY' ? 'READY' : 'NOT_CONFIGURED',
        phoneConfigured: s1.value.phoneConfigured,
        wabaConfigured: s1.value.wabaConfigured,
        tokenConfigured: s1.value.tokenConfigured,
        webhookConfigured: s1.value.webhookConfigured,
        capabilities: s1.value.capabilities,
        missingSendVars: s1.value.missingSendVars,
        missingWebhookVars: s1.value.missingWebhookVars,
      });
    } else {
      setWa(null);
      setWaError('WhatsApp status unavailable');
    }

    // OS AI — GET status only (no confirm / live call)
    const s2 = settled[2];
    if (s2.status === 'fulfilled' && s2.value?.success) {
      setOs({
        status: s2.value.status === 'READY' ? 'READY' : 'NOT_CONFIGURED',
        missing: s2.value.missing,
      });
    } else {
      setOs(null);
      setOsError('Bell24h-OS status unavailable');
    }

    // Outreach
    const s3 = settled[3];
    if (s3.status === 'fulfilled' && s3.value?.success && s3.value.period) {
      setOutreach(s3.value.period);
    } else {
      setOutreach(null);
      setOutreachError('Outreach stats unavailable');
    }

    // RFQs — route returns { rfqs } without success flag
    const s4 = settled[4];
    if (s4.status === 'fulfilled' && Array.isArray(s4.value?.rfqs)) {
      setRfqs(s4.value.rfqs.slice(0, 5));
    } else if (s4.status === 'fulfilled' && s4.value?.error) {
      setRfqs([]);
      setRfqsError(s4.value.error);
    } else {
      setRfqs([]);
      setRfqsError('RFQ preview unavailable');
    }

    // Automation
    const s5 = settled[5];
    if (s5.status === 'fulfilled' && s5.value?.success && Array.isArray(s5.value.jobs)) {
      setJobs(s5.value.jobs);
      setSchedulerName(s5.value.scheduler?.current || '');
    } else {
      setJobs([]);
      setJobsError('Automation jobs unavailable');
    }

    setLoading(false);
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  const enabledJobs = jobs.filter((j) => j.enabled).length;
  const funnelMax = stats?.funnel?.rfqsCreated || 1;

  const waTone: 'green' | 'amber' | 'red' | 'slate' = waError
    ? 'slate'
    : wa?.status === 'READY'
      ? 'green'
      : 'amber';
  const waDetail = waError
    ? 'UNAVAILABLE'
    : wa?.status === 'READY'
      ? 'READY'
      : 'NOT_CONFIGURED';

  const webhookTone: 'green' | 'amber' | 'red' | 'slate' = waError
    ? 'slate'
    : wa?.webhookConfigured
      ? 'green'
      : 'amber';
  const webhookDetail = waError ? 'UNAVAILABLE' : wa?.webhookConfigured ? 'CONFIGURED' : 'NOT SET';

  const osTone: 'green' | 'amber' | 'red' | 'slate' = osError
    ? 'slate'
    : os?.status === 'READY'
      ? 'green'
      : 'amber';
  const osDetail = osError ? 'UNAVAILABLE' : os?.status === 'READY' ? 'READY' : 'NOT_CONFIGURED';

  const providerFails = stats?.providerFailures24h ?? 0;
  const providerTone: 'green' | 'amber' | 'red' | 'slate' = statsError
    ? 'slate'
    : providerFails > 0
      ? 'red'
      : 'green';

  const urgencyClass = (u: string) => {
    const key = (u || '').toUpperCase();
    if (key === 'URGENT') return 'bg-red-900/40 text-red-300 border-red-700/50';
    if (key === 'HIGH') return 'bg-orange-900/40 text-orange-300 border-orange-700/50';
    if (key === 'MEDIUM') return 'bg-amber-900/40 text-amber-300 border-amber-700/50';
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Founder Cockpit</h1>
          <p className="text-slate-400 text-sm">VyaparSethu · live ops command surface</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            {RANGES.map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setRange(v)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  range === v ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors min-h-[32px] disabled:opacity-50"
          >
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Command Center — Phase 3 dashboards */}
      <div>
        <SectionLabel>Command Center</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { href: '/admin/discovery', label: 'Discovery Engine', desc: 'Public-web ingest' },
            { href: '/admin/discovery/health', label: 'Discovery Health', desc: 'Pipeline metrics' },
            { href: '/admin/discovery/readiness', label: 'Discovery Readiness', desc: 'READY/PARTIAL/MISSING' },
            { href: '/admin/cockpit/crm-timeline', label: 'CRM Timeline', desc: 'Platform activity' },
            { href: '/admin/crm', label: 'Company Journey', desc: 'Per-company CRM' },
            { href: '/admin/cockpit/supplier-intelligence', label: 'Supplier Intel', desc: 'Trust & deals' },
            { href: '/admin/cockpit/buyer-intelligence', label: 'Buyer Intel', desc: 'Demand & funnel' },
            { href: '/admin/cockpit/rfq-pipeline', label: 'RFQ Pipeline', desc: 'Stage board' },
            { href: '/admin/cockpit/revenue-analytics', label: 'Revenue', desc: 'Deposits & plans' },
            { href: '/admin/cockpit/notifications', label: 'Notifications', desc: 'Alerts & activity' },
            { href: '/admin/cockpit/ai-agents', label: 'AI Agents', desc: 'Health monitor' },
            { href: '/admin/cockpit/bell24h-os', label: 'Bell24h-OS', desc: 'Integration' },
            { href: '/admin/cockpit/communication-hub', label: 'Comms Hub', desc: 'Channel status' },
            { href: '/admin/cockpit/system-health', label: 'System Health', desc: 'Diagnostics' },
            { href: '/admin/whatsapp/ops', label: 'WhatsApp Ops', desc: 'Phase 2.1' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 hover:border-indigo-500/50 hover:bg-slate-800 transition-all group"
            >
              <p className="text-white text-sm font-medium group-hover:text-indigo-400">{item.label}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* A. Readiness Strip */}
      <div>
        <SectionLabel>A · Readiness</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <ReadinessChip
            label="Meta WA"
            tone={waTone}
            detail={waDetail}
            href="/admin/whatsapp-cloud-api"
          />
          <ReadinessChip
            label="Webhook"
            tone={webhookTone}
            detail={webhookDetail}
            href="/admin/whatsapp-cloud-api"
          />
          <ReadinessChip
            label="MSG91 / OTP"
            tone={statsError ? 'slate' : providerFails > 0 ? 'amber' : 'green'}
            detail={
              statsError
                ? 'UNKNOWN'
                : providerFails > 0
                  ? `${providerFails} fail(s) 24h`
                  : 'NO FAILS 24h'
            }
            href="/admin/errors?tab=provider"
          />
          <ReadinessChip label="OS AI" tone={osTone} detail={osDetail} />
          <ReadinessChip
            label="Provider fails 24h"
            tone={providerTone}
            detail={statsError ? '—' : String(providerFails)}
            href="/admin/errors?tab=provider"
          />
        </div>
      </div>

      {/* B. Action Queue */}
      <div>
        <SectionLabel>B · Action Queue</SectionLabel>
        {statsError && !stats ? (
          <Panel>
            <WidgetFallback message={statsError} />
          </Panel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Link
              href="/admin/crm?filter=unverified"
              className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4 hover:border-amber-500/60 transition-colors"
            >
              <p className="text-amber-300 text-2xl font-bold">{stats?.pendingKyc ?? '—'}</p>
              <p className="text-amber-400/80 text-xs mt-1">Pending KYC</p>
              {(stats?.importedUnverified ?? 0) > 0 && (
                <p className="text-amber-700 text-xs mt-1">
                  {stats?.pendingKycReal ?? 0} real · {stats?.importedUnverified} imported
                </p>
              )}
            </Link>
            <Link
              href="/admin/rfqs?status=ACTIVE"
              className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 hover:border-blue-500/60 transition-colors"
            >
              <p className="text-blue-300 text-2xl font-bold">{stats?.unansweredRfqs ?? '—'}</p>
              <p className="text-blue-400/80 text-xs mt-1">Unanswered RFQs</p>
              {stats?.unansweredRealRfqs != null && (
                <p className="text-blue-700 text-xs mt-1">{stats.unansweredRealRfqs} real</p>
              )}
            </Link>
            <Link
              href="/admin/rfqs"
              className="bg-rose-900/20 border border-rose-700/40 rounded-xl p-4 hover:border-rose-500/60 transition-colors"
            >
              <p className="text-rose-300 text-2xl font-bold">{stats?.expiringSoon ?? '—'}</p>
              <p className="text-rose-400/80 text-xs mt-1">Expiring in 3 days</p>
            </Link>
            <Link
              href="/admin/errors?tab=provider"
              className={`border rounded-xl p-4 transition-colors ${
                providerFails > 0
                  ? 'bg-red-900/30 border-red-600/50 hover:border-red-500/70'
                  : 'bg-slate-800/60 border-slate-700/50 hover:border-slate-500/60'
              }`}
            >
              <p className={`text-2xl font-bold ${providerFails > 0 ? 'text-red-300' : 'text-slate-300'}`}>
                {stats ? providerFails : '—'}
              </p>
              <p className={`text-xs mt-1 ${providerFails > 0 ? 'text-red-400/80' : 'text-slate-500'}`}>
                Provider failures (24h)
              </p>
            </Link>
          </div>
        )}
      </div>

      {/* C + D */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionLabel>C · Trade Funnel</SectionLabel>
          <Panel>
            {!stats ? (
              <WidgetFallback message={statsError || 'Funnel unavailable'} />
            ) : (
              <>
                <p className="text-slate-500 text-xs mb-4">Conversion: {stats.funnel.conversionRate}%</p>
                <div className="space-y-4">
                  <FunnelBar label="RFQs Created" value={stats.funnel.rfqsCreated} max={funnelMax} color="bg-indigo-500" />
                  <FunnelBar
                    label="Quotes Submitted"
                    value={stats.funnel.quotesSubmitted}
                    max={funnelMax}
                    color="bg-violet-500"
                  />
                  <FunnelBar
                    label="Quotes Accepted"
                    value={stats.funnel.quotesAccepted}
                    max={funnelMax}
                    color="bg-amber-500"
                  />
                  <FunnelBar
                    label="Deals Completed"
                    value={stats.funnel.dealsCompleted}
                    max={funnelMax}
                    color="bg-green-500"
                  />
                </div>
              </>
            )}
          </Panel>
        </div>

        <div>
          <SectionLabel>D · People Snapshot</SectionLabel>
          <Panel>
            {!stats ? (
              <WidgetFallback message={statsError || 'People stats unavailable'} />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-slate-500 text-xs">Buyers</p>
                    <p className="text-xl font-bold text-amber-400">{fmt(stats.users.buyers)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Suppliers</p>
                    <p className="text-xl font-bold text-green-400">{fmt(stats.users.suppliers)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">New today</p>
                    <p className="text-xl font-bold text-indigo-400">{fmt(stats.users.newToday)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">High-trust (≥70)</p>
                    <p className="text-xl font-bold text-white">{fmt(stats.trust.highTrustSuppliers)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs pt-2 border-t border-slate-700/40">
                  <Link href="/admin/customers" className="text-indigo-400 hover:underline">
                    Customers →
                  </Link>
                  <Link href="/admin/suppliers" className="text-indigo-400 hover:underline">
                    Suppliers →
                  </Link>
                  <Link href="/admin/crm" className="text-indigo-400 hover:underline">
                    CRM →
                  </Link>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* E + F */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionLabel>E · Activity Feed</SectionLabel>
          <Panel>
            {!stats ? (
              <WidgetFallback message={statsError || 'Activity unavailable'} />
            ) : !stats.activity?.length ? (
              <WidgetFallback message="No activity in the last 24h" />
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {stats.activity.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm py-1 border-b border-slate-700/30 last:border-0"
                  >
                    <span className="text-base">{ACTIVITY_ICONS[a.type] || '•'}</span>
                    <span className="text-slate-300 flex-1">{a.label}</span>
                    <span className="text-slate-500 text-xs whitespace-nowrap">{a.time}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div>
          <SectionLabel>F · Outreach Pulse</SectionLabel>
          <Panel>
            {outreachError || !outreach ? (
              <WidgetFallback message={outreachError || 'Outreach unavailable'} />
            ) : (
              <div className="space-y-4">
                <p className="text-slate-500 text-xs">Last {outreachDays} days</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-slate-500 text-xs">Sent</p>
                    <p className="text-xl font-bold text-blue-400">{fmt(outreach.outreachSent)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">WA clicks</p>
                    <p className="text-xl font-bold text-green-400">{fmt(outreach.waClicks)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Unique reached</p>
                    <p className="text-xl font-bold text-white">{fmt(outreach.uniqueSuppliersReached)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Conversion</p>
                    <p className="text-xl font-bold text-amber-400">{outreach.conversionRate}%</p>
                  </div>
                </div>
                <Link href="/admin/outreach" className="text-indigo-400 hover:underline text-xs">
                  Open WhatsApp Outreach →
                </Link>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* G + H */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionLabel>G · RFQ Ops Preview</SectionLabel>
          <Panel>
            {rfqsError ? (
              <WidgetFallback message={rfqsError} />
            ) : rfqs.length === 0 ? (
              <WidgetFallback message="No ACTIVE RFQs to preview" />
            ) : (
              <div className="space-y-2">
                {rfqs.map((r) => {
                  const quoteCount = r._count?.quotes ?? r.quotes?.length ?? 0;
                  return (
                    <Link
                      key={r.id}
                      href="/admin/rfqs"
                      className="flex items-start gap-3 py-2 border-b border-slate-700/30 last:border-0 hover:bg-slate-800/40 rounded-lg px-1 -mx-1"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 text-sm font-medium truncate">{r.title}</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {quoteCount} quote{quoteCount === 1 ? '' : 's'} ·{' '}
                          {new Date(r.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${urgencyClass(
                          r.urgency
                        )}`}
                      >
                        {r.urgency || 'NORMAL'}
                      </span>
                    </Link>
                  );
                })}
                <Link href="/admin/rfqs" className="text-indigo-400 hover:underline text-xs inline-block mt-2">
                  Open RFQ board →
                </Link>
              </div>
            )}
          </Panel>
        </div>

        <div>
          <SectionLabel>H · Automation Health</SectionLabel>
          <Panel>
            {jobsError ? (
              <WidgetFallback message={jobsError} />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-slate-500 text-xs">Jobs registered</p>
                    <p className="text-xl font-bold text-white">{jobs.length}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Enabled</p>
                    <p className="text-xl font-bold text-green-400">{enabledJobs}</p>
                  </div>
                </div>
                {schedulerName && (
                  <p className="text-slate-500 text-xs">
                    Scheduler: <span className="text-slate-300">{schedulerName}</span>
                  </p>
                )}
                <p className="text-slate-600 text-xs">
                  Last-run history not exposed by jobs API — open Jobs &amp; Scheduler for execute.
                </p>
                <ul className="space-y-1 max-h-32 overflow-y-auto">
                  {jobs.slice(0, 6).map((j) => (
                    <li key={j.id} className="flex justify-between text-xs gap-2">
                      <span className="text-slate-300 truncate">{j.name}</span>
                      <span className={j.enabled ? 'text-green-400' : 'text-slate-500'}>
                        {j.enabled ? 'on' : 'off'}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href="/admin/automation" className="text-indigo-400 hover:underline text-xs">
                  Open Jobs &amp; Scheduler →
                </Link>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* J. Revenue Summary (Phase 2.5) */}
      <div>
        <SectionLabel>J · Revenue Summary</SectionLabel>
        <Panel>
          <RevenueSummary days={range === '1d' ? 1 : range === '30d' ? 30 : 7} compact showRefresh />
        </Panel>
      </div>

      {/* I. Quick Launch */}
      <div>
        <SectionLabel>I · Quick Launch</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_LAUNCH.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-indigo-500/50 hover:bg-slate-800 transition-all group"
            >
              <p className="text-white text-sm font-medium group-hover:text-indigo-400 transition-colors">
                {link.label}
              </p>
              <p className="text-slate-500 text-xs mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
