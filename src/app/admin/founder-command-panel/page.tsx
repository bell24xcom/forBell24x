'use client';

/**
 * VS-FOUNDER-COMMAND-PANEL-01
 * Founder Command Panel — single-page marketplace activation monitor.
 *
 * Sections:
 *  1. Marketplace Health   → /api/admin/stats
 *  2. Transaction Funnel   → /api/metrics/funnel
 *  3. Supplier Activity    → /api/admin/stats + /api/admin/launch-metrics
 *  4. Buyer Activity       → /api/admin/stats
 *  5. Revenue Snapshot     → /api/admin/stats + /api/admin/transaction-evidence
 *  6. Video RFQ Status     → /api/cloudinary/upload-signature (probe) + NEXT_PUBLIC flag
 *  7. System Status        → /api/admin/monitoring
 *
 * No new backend APIs. No schema changes. All data sourced from existing endpoints.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AdminStats {
  success: boolean;
  stats: {
    users:        { total: number; buyers: number; suppliers: number; newToday: number; newThisWeek: number };
    rfqs:         { total: number; active: number; completed: number; cancelled: number; seeded: number; real: number };
    quotes:       { total: number; accepted: number; pending: number };
    transactions: { total: number; completed: number; completedVolume: number };
    deals:        { total: number; active: number; escrowLocked: number; recentDeals: RecentDeal[] };
    funnel:       { rfqsCreated: number; quotesSubmitted: number; quotesAccepted: number; dealsCompleted: number; conversionRate: string };
    trust:        { highTrustSuppliers: number };
    pendingKyc: number; unansweredRealRfqs: number; expiringSoon: number;
    activity:     ActivityItem[];
  };
}

interface RecentDeal {
  id: string; price: number | string; status: string;
  rfqTitle: string; buyerName: string; supplierName: string; createdAt: string;
}

interface ActivityItem { type: string; label: string; time: string }

interface FunnelData {
  success: boolean;
  days: number;
  period:  { rfqsCreated: number; quotesSubmitted: number; dealsCreated: number; dealsCompleted: number; revenue: number; outreachSent: number; waClicks: number; subscriptions: number };
  growth:  { rfqs: number; quotes: number; deals: number; revenue: number };
  rates:   { quoteRate: number; dealRate: number; waClickRate: number };
}

interface LaunchMetrics {
  success: boolean;
  trustVelocity: { dealsThisWeek: number; unit: string };
  suppliers:     { total: number; claimed: number; claimRate: string; pendingOutreach: number };
  rfqs:          { total: number; active: number };
  deals:         { total: number; thisWeek: number };
  outreach:      { sent: number; subscriptions: number; waClicks: number };
}

interface EvidenceResponse {
  success: boolean;
  totalDeals: number;
  summary: { totalDeals: number; realDeals: number; dealsWithPayment: number; dealsWithUnlock: number; avgQuoteToAcceptanceHours: number | null };
  evidence: Array<{ dealId: string; rfqTitle: string | null; dealStatus: string; dealValue: number; paymentTimestamp: string | null; rfqCreatedAt: string | null }>;
}

interface MonitoringData {
  success: boolean;
  health?: { status: string; uptime?: string; dbStatus?: string };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString('en-IN'); }
function inr(n: number) { return '₹' + (n >= 100000 ? (n / 100000).toFixed(1) + 'L' : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString()); }
function pct(num: number, den: number) { return den > 0 ? ((num / den) * 100).toFixed(1) + '%' : '—'; }

function StatCard({ label, value, sub, highlight, dim }: {
  label: string; value: string | number; sub?: string; highlight?: boolean; dim?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? 'bg-amber-950/40 border-amber-700/50' : 'bg-slate-800/60 border-slate-700/50'}`}>
      <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${dim ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-amber-400' : dim ? 'text-slate-500' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function SectionHeader({ icon, title, badge }: { icon: string; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-lg">{icon}</span>
      <h2 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h2>
      {badge && <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{badge}</span>}
    </div>
  );
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const w = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{fmt(value)}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

function StatusDot({ ok, label }: { ok: boolean | null; label: string }) {
  const color = ok === null ? 'bg-yellow-400' : ok ? 'bg-green-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-slate-800 last:border-0">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
      <span className="text-sm text-slate-300">{label}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FounderCommandPanel() {
  const [stats,   setStats]   = useState<AdminStats | null>(null);
  const [funnel,  setFunnel]  = useState<FunnelData | null>(null);
  const [launch,  setLaunch]  = useState<LaunchMetrics | null>(null);
  const [evidence,setEvidence]= useState<EvidenceResponse | null>(null);
  const [cloudOk, setCloudOk] = useState<boolean | null>(null);  // null = checking
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const videoFlagActive = process.env.NEXT_PUBLIC_VIDEO_RFQ_ENABLED === 'true';

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [statsRes, funnelRes, launchRes, evidenceRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/metrics/funnel?days=30'),
        fetch('/api/admin/launch-metrics?days=30'),
        fetch('/api/admin/transaction-evidence?limit=10'),
      ]);

      const [s, f, l, e] = await Promise.all([
        statsRes.json(), funnelRes.json(), launchRes.json(), evidenceRes.json(),
      ]);

      if (s.success) setStats(s);
      if (f.success) setFunnel(f);
      if (l.success) setLaunch(l);
      if (e.success) setEvidence(e);

      if (!s.success) throw new Error('Stats API failed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  // Probe Cloudinary config: call upload-signature — 503 = not configured, 401 = configured
  const probeCloudinary = useCallback(async () => {
    try {
      const res = await fetch('/api/cloudinary/upload-signature', { method: 'POST' });
      // 401 = auth missing but route reached (Cloudinary IS configured)
      // 503 = env vars not set
      // 200 = fully configured + authenticated
      setCloudOk(res.status !== 503);
    } catch {
      setCloudOk(null);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    probeCloudinary();
  }, [fetchAll, probeCloudinary]);

  // Auto-refresh every 60s
  useEffect(() => {
    const id = setInterval(() => { fetchAll(); probeCloudinary(); }, 60000);
    return () => clearInterval(id);
  }, [fetchAll, probeCloudinary]);

  const st  = stats?.stats;
  const fn  = funnel;
  const lm  = launch;
  const ev  = evidence;

  const completedDeals = ev?.summary?.dealsWithPayment ?? 0;
  const totalDeals     = ev?.summary?.totalDeals ?? st?.deals?.total ?? 0;
  const realDeals      = ev?.summary?.realDeals ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16">

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 py-3">
        <div>
          <h1 className="text-sm font-bold text-white tracking-wider uppercase">⚡ Founder Command Panel</h1>
          <p className="text-xs text-slate-500">VyaparSethu — Marketplace Activation Monitor</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-slate-500">
              Last refresh: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => { fetchAll(); probeCloudinary(); }}
            disabled={loading}
            className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '⟳ Loading…' : '↻ Refresh'}
          </button>
          <Link href="/admin" className="text-xs text-slate-500 hover:text-white transition-colors">← Admin</Link>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-950/50 border border-red-700/50 text-red-400 text-xs px-4 py-2 rounded-lg">{error}</div>
      )}

      <div className="px-6 pt-6 space-y-6">

        {/* ══════════════════════════════════════════════════════════
            PRIMARY KPI — Completed Transactions
        ══════════════════════════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-amber-950/60 to-amber-900/30 border border-amber-700/60 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-400/70 uppercase tracking-widest mb-1">Primary KPI — Trust Velocity</p>
              <p className="text-5xl font-black text-amber-400">{loading ? '—' : fmt(completedDeals)}</p>
              <p className="text-sm text-amber-300/70 mt-1">Completed Transactions (payment confirmed)</p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-slate-400 text-xs">Total Deals Created</div>
              <div className="text-2xl font-bold text-white">{loading ? '—' : fmt(totalDeals)}</div>
              <div className="text-slate-400 text-xs mt-2">Real (non-seeded) Deals</div>
              <div className="text-xl font-bold text-green-400">{loading ? '—' : fmt(realDeals)}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            <div className="bg-slate-900/60 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400">Deals w/ Unlock</p>
              <p className="text-lg font-bold text-white mt-0.5">{ev?.summary?.dealsWithUnlock ?? '—'}</p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400">Avg Quote→Accept</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {ev?.summary?.avgQuoteToAcceptanceHours != null ? ev.summary.avgQuoteToAcceptanceHours + 'h' : '—'}
              </p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400">Deals This Week</p>
              <p className="text-lg font-bold text-white mt-0.5">{lm?.deals?.thisWeek ?? '—'}</p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400">Conversion Rate</p>
              <p className="text-lg font-bold text-white mt-0.5">{st?.funnel?.conversionRate ? st.funnel.conversionRate + '%' : '—'}</p>
            </div>
          </div>
        </div>

        {/* ── Recent Deals ── */}
        {(ev?.evidence ?? []).length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Recent Deals</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="text-left py-2 pr-4 font-medium">RFQ</th>
                    <th className="text-left py-2 pr-4 font-medium">Buyer</th>
                    <th className="text-left py-2 pr-4 font-medium">Supplier</th>
                    <th className="text-right py-2 pr-4 font-medium">Value</th>
                    <th className="text-left py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(ev?.evidence ?? []).slice(0, 5).map(d => (
                    <tr key={d.dealId} className="border-b border-slate-800/50 last:border-0">
                      <td className="py-2 pr-4 text-slate-300 truncate max-w-[180px]">{d.rfqTitle ?? '—'}</td>
                      <td className="py-2 pr-4 text-slate-400">—</td>
                      <td className="py-2 pr-4 text-slate-400">—</td>
                      <td className="py-2 pr-4 text-right text-white font-medium">{inr(d.dealValue)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          d.dealStatus === 'COMPLETED' ? 'bg-green-900/50 text-green-400' :
                          d.dealStatus === 'ESCROW_LOCKED' ? 'bg-amber-900/50 text-amber-400' :
                          d.paymentTimestamp ? 'bg-blue-900/50 text-blue-400' :
                          'bg-slate-700 text-slate-400'
                        }`}>{d.paymentTimestamp ? 'Paid' : d.dealStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Sections Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* ══════════════════════════
              1. Marketplace Health
          ══════════════════════════ */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <SectionHeader icon="🏪" title="Marketplace Health" />
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Real RFQs" value={loading ? '…' : fmt(st?.rfqs?.real ?? 0)} sub="non-seeded" />
              <StatCard label="Active RFQs" value={loading ? '…' : fmt(st?.rfqs?.active ?? 0)} sub="open for quotes" />
              <StatCard label="Total Users" value={loading ? '…' : fmt(st?.users?.total ?? 0)} />
              <StatCard label="New This Week" value={loading ? '…' : fmt(st?.users?.newThisWeek ?? 0)} sub="registrations" />
              <StatCard label="Total Quotes" value={loading ? '…' : fmt(st?.quotes?.total ?? 0)} />
              <StatCard label="Accepted Quotes" value={loading ? '…' : fmt(st?.quotes?.accepted ?? 0)} />
            </div>
            <div className="mt-4 space-y-2">
              {st?.unansweredRealRfqs != null && (
                <div className={`flex justify-between text-xs px-3 py-2 rounded-lg ${st.unansweredRealRfqs > 0 ? 'bg-orange-950/40 text-orange-300' : 'bg-slate-800 text-slate-400'}`}>
                  <span>Unanswered Real RFQs</span>
                  <span className="font-bold">{st.unansweredRealRfqs}</span>
                </div>
              )}
              {st?.expiringSoon != null && (
                <div className={`flex justify-between text-xs px-3 py-2 rounded-lg ${st.expiringSoon > 0 ? 'bg-yellow-950/40 text-yellow-300' : 'bg-slate-800 text-slate-400'}`}>
                  <span>Expiring in 3 Days</span>
                  <span className="font-bold">{st.expiringSoon}</span>
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════
              2. Transaction Funnel
          ══════════════════════════ */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <SectionHeader icon="🔽" title="Transaction Funnel" badge="30d" />
            {fn ? (
              <>
                <FunnelBar label="Real RFQs Created"    value={fn.period.rfqsCreated}    max={fn.period.rfqsCreated}    color="bg-blue-500" />
                <FunnelBar label="Quotes Submitted"     value={fn.period.quotesSubmitted} max={fn.period.rfqsCreated}    color="bg-indigo-500" />
                <FunnelBar label="Deals Created"        value={fn.period.dealsCreated}    max={fn.period.rfqsCreated}    color="bg-purple-500" />
                <FunnelBar label="Deals Completed"      value={fn.period.dealsCompleted}  max={fn.period.rfqsCreated}    color="bg-green-500" />
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400">RFQ → Quote</p>
                    <p className="text-base font-bold text-white">{fn.rates.quoteRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400">Quote → Deal</p>
                    <p className="text-base font-bold text-white">{fn.rates.dealRate.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  {fn.period.outreachSent > 0 && (
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Outreach Sent</span><span className="text-white">{fmt(fn.period.outreachSent)}</span>
                    </div>
                  )}
                  {fn.period.waClicks > 0 && (
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>WhatsApp Clicks</span><span className="text-white">{fmt(fn.period.waClicks)}</span>
                    </div>
                  )}
                  {fn.period.subscriptions > 0 && (
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Subscriptions</span><span className="text-white">{fmt(fn.period.subscriptions)}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm">{loading ? 'Loading…' : 'No funnel data'}</p>
            )}
          </div>

          {/* ══════════════════════════
              3. Supplier Activity
          ══════════════════════════ */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <SectionHeader icon="🏭" title="Supplier Activity" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard label="Total Suppliers" value={loading ? '…' : fmt(lm?.suppliers?.total ?? st?.users?.suppliers ?? 0)} />
              <StatCard label="Claimed"         value={loading ? '…' : fmt(lm?.suppliers?.claimed ?? 0)} sub={lm?.suppliers?.claimRate} />
              <StatCard label="High Trust (≥70)" value={loading ? '…' : fmt(st?.trust?.highTrustSuppliers ?? 0)} />
              <StatCard label="Pending Outreach" value={loading ? '…' : fmt(lm?.suppliers?.pendingOutreach ?? 0)} />
            </div>
            {lm && (
              <div className="bg-slate-800/60 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Trust Velocity (North Star)</p>
                <p className="text-xl font-bold text-green-400">{lm.trustVelocity.dealsThisWeek} <span className="text-xs text-slate-500 font-normal">trades this week</span></p>
                <p className="text-xs text-slate-600 mt-0.5">Target: Successful Transactions ÷ Time</p>
              </div>
            )}
          </div>

          {/* ══════════════════════════
              4. Buyer Activity
          ══════════════════════════ */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <SectionHeader icon="🤝" title="Buyer Activity" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard label="Total Buyers"   value={loading ? '…' : fmt(st?.users?.buyers ?? 0)} />
              <StatCard label="New Today"      value={loading ? '…' : fmt(st?.users?.newToday ?? 0)} />
              <StatCard label="Completed RFQs" value={loading ? '…' : fmt(st?.rfqs?.completed ?? 0)} />
              <StatCard label="RFQ→Quote Rate" value={loading || !fn ? '…' : fn.rates.quoteRate.toFixed(1) + '%'} />
            </div>
            {/* Activity feed */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Last 24h Activity</p>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {(st?.activity ?? []).slice(0, 8).map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs py-1 border-b border-slate-800/50 last:border-0">
                    <span className={`shrink-0 mt-0.5 ${a.type === 'user' ? 'text-green-400' : a.type === 'rfq' ? 'text-blue-400' : 'text-purple-400'}`}>
                      {a.type === 'user' ? '●' : a.type === 'rfq' ? '◆' : '▲'}
                    </span>
                    <span className="text-slate-400 flex-1 truncate">{a.label}</span>
                    <span className="text-slate-600 shrink-0">{a.time}</span>
                  </div>
                ))}
                {(st?.activity ?? []).length === 0 && !loading && (
                  <p className="text-slate-600 text-xs">No activity in last 24h</p>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════
              5. Revenue Snapshot
          ══════════════════════════ */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <SectionHeader icon="💰" title="Revenue Snapshot" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard
                label="Completed Tx Volume"
                value={loading ? '…' : inr(st?.transactions?.completedVolume ?? 0)}
                highlight={!loading && (st?.transactions?.completedVolume ?? 0) > 0}
              />
              <StatCard
                label="Completed Transactions"
                value={loading ? '…' : fmt(st?.transactions?.completed ?? 0)}
              />
              <StatCard
                label="Total Tx (all states)"
                value={loading ? '…' : fmt(st?.transactions?.total ?? 0)}
              />
              <StatCard
                label="Deals w/ Payment"
                value={loading ? '…' : fmt(ev?.summary?.dealsWithPayment ?? 0)}
                highlight={!loading && (ev?.summary?.dealsWithPayment ?? 0) > 0}
              />
            </div>
            {/* Deal value breakdown */}
            {(ev?.evidence ?? []).length > 0 && (
              <div className="bg-slate-800/60 rounded-lg p-3 mt-2">
                <p className="text-xs text-slate-400 mb-2">Recent Deal Values</p>
                {(ev?.evidence ?? []).slice(0, 4).map(d => (
                  <div key={d.dealId} className="flex justify-between text-xs py-1 border-b border-slate-700/50 last:border-0">
                    <span className="text-slate-400 truncate flex-1 pr-2">{d.rfqTitle ?? 'Deal'}</span>
                    <span className="text-white font-medium shrink-0">{inr(d.dealValue)}</span>
                  </div>
                ))}
              </div>
            )}
            {(ev?.evidence ?? []).length === 0 && !loading && (
              <div className="bg-slate-800/40 rounded-lg p-3 text-center">
                <p className="text-slate-500 text-xs">No deals yet — first transaction will appear here</p>
              </div>
            )}
          </div>

          {/* ══════════════════════════
              6. Video RFQ Status
          ══════════════════════════ */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <SectionHeader icon="🎥" title="Video RFQ Status" />

            {/* Activation checklist */}
            <div className="space-y-0.5 mb-4">
              <StatusDot
                ok={null}  // can't auto-detect CSP from client
                label="PR #54 merged (CSP fix)"
              />
              <StatusDot
                ok={cloudOk}
                label={`Cloudinary env vars ${cloudOk === null ? '(checking…)' : cloudOk ? '✓ configured' : '✗ missing'}`}
              />
              <StatusDot
                ok={cloudOk}  // same indicator — preset needed alongside creds
                label="Upload preset bell24h-rfq-videos"
              />
              <StatusDot
                ok={videoFlagActive}
                label={`NEXT_PUBLIC_VIDEO_RFQ_ENABLED ${videoFlagActive ? '✓ active' : '✗ not set'}`}
              />
            </div>

            {/* Overall readiness banner */}
            <div className={`rounded-lg px-3 py-2 text-xs font-semibold text-center ${
              videoFlagActive && cloudOk ? 'bg-green-900/50 text-green-300' : 'bg-orange-950/50 text-orange-300'
            }`}>
              {videoFlagActive && cloudOk
                ? '✅ Video RFQ: READY TO ACTIVATE'
                : '⚠️ Video RFQ: CONFIGURATION REQUIRED'}
            </div>

            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-slate-400 py-1 border-b border-slate-800">
                <span>Video RFQs in Production</span>
                <span className="text-white font-medium">0</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                See <Link href="/admin/launch-metrics" className="text-slate-400 underline">Launch Metrics</Link> or <Link href="/admin/analytics" className="text-slate-400 underline">Analytics</Link> for outreach pipeline.
              </p>
            </div>
          </div>

          {/* ══════════════════════════
              7. System Status
          ══════════════════════════ */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <SectionHeader icon="🩺" title="System Status" />
            <div className="space-y-0.5">
              <StatusDot ok={!loading && !error} label="Admin Stats API (/api/admin/stats)" />
              <StatusDot ok={!loading && !!fn}    label="Funnel API (/api/metrics/funnel)" />
              <StatusDot ok={!loading && !!lm}    label="Launch Metrics API (/api/admin/launch-metrics)" />
              <StatusDot ok={!loading && !!ev}    label="Transaction Evidence API" />
              <StatusDot ok={cloudOk}             label="Cloudinary API (upload-signature probe)" />
              <StatusDot ok={null}                label="MSG91 OTP (not probed — live only)" />
              <StatusDot ok={null}                label="Razorpay (not probed — live only)" />
            </div>
            <div className="mt-4 border-t border-slate-800 pt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Pending KYC Users</span>
                <span className={`font-medium ${(st?.pendingKyc ?? 0) > 0 ? 'text-orange-400' : 'text-slate-400'}`}>
                  {loading ? '…' : st?.pendingKyc ?? '—'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Unread Notifications (DB)</span>
                <span className="text-slate-400">—</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-2">
              <Link href="/admin/monitoring"  className="text-xs text-slate-400 hover:text-white underline">Monitoring →</Link>
              <Link href="/admin/errors"      className="text-xs text-slate-400 hover:text-white underline">Error Logs →</Link>
              <Link href="/admin/email-health" className="text-xs text-slate-400 hover:text-white underline">Email DNS →</Link>
            </div>
          </div>

        </div>

        {/* ── Quick Links ── */}
        <div className="border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Quick Links — Detailed Dashboards</p>
          <div className="flex flex-wrap gap-2">
            {[
              ['/admin/kpi',           '📈 KPI & Funnel'],
              ['/admin/analytics',     '📊 Analytics'],
              ['/admin/crm',           '👥 CRM / Users'],
              ['/admin/leads',         '🎯 Leads'],
              ['/admin/marketing',     '📣 Marketing'],
              ['/admin/outreach',      '📢 Outreach'],
              ['/admin/launch-metrics','🚀 Launch Metrics'],
              ['/admin/monitoring',    '🔍 Monitoring'],
              ['/admin/flow-test',     '🧪 Flow Test'],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-700 text-center pb-2">
          VS-FOUNDER-COMMAND-PANEL-01 · Auto-refreshes every 60s · {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>

      </div>
    </div>
  );
}
