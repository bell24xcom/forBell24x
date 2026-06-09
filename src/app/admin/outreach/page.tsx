'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageCircle, RefreshCw, TrendingUp, ExternalLink, Zap, Send,
  X, Check, SkipForward, Phone, AlertTriangle,
} from 'lucide-react';

const DAILY_LIMIT = 50;

const RANGES = [{ label: '7 Days', value: 7 }, { label: '30 Days', value: 30 }, { label: '90 Days', value: 90 }];

const ACTION_LABEL: Record<string, string> = {
  outreach_sent:          'Initial Outreach',
  follow_up_1_sent:       'Day 2 Follow-up',
  follow_up_2_sent:       'Day 5 Follow-up',
  drip_day3_sent:         'Day 3 Profile Drip',
  drip_day7_sent:         'Day 7 Quote Drip',
  drip_day14_sent:        'Day 14 Re-engage',
  subscription_activated: 'Subscribed',
  whatsapp_click:         'WhatsApp Clicks',
};

const ACTION_COLOR: Record<string, string> = {
  outreach_sent:          'text-blue-400 bg-blue-900/40',
  follow_up_1_sent:       'text-cyan-400 bg-cyan-900/40',
  follow_up_2_sent:       'text-indigo-400 bg-indigo-900/40',
  drip_day3_sent:         'text-blue-300 bg-blue-900/30',
  drip_day7_sent:         'text-amber-400 bg-amber-900/40',
  drip_day14_sent:        'text-red-400 bg-red-900/40',
  subscription_activated: 'text-green-400 bg-green-900/40',
  whatsapp_click:         'text-green-300 bg-green-900/30',
};

interface OutreachStats {
  period: {
    outreachSent: number; followUp1: number; followUp2: number;
    drip3: number; drip7: number; drip14: number;
    subscriptions: number; waClicks: number;
    uniqueSuppliersReached: number; conversionRate: string;
  };
  allTime: {
    outreachSent: number; followUp1: number; followUp2: number;
    drip3: number; drip7: number; drip14: number; subscriptions: number;
  };
  recentEvents: { actionType: string; userId: string | null; source: string | null; metadata: unknown; createdAt: string }[];
  days: number;
}

interface Supplier {
  id: string;
  company: string;
  phone: string | null;
  email: string | null;
  location: string | null;
  trustScore: number;
  claimLink: string;
  waLink: string | null;
  apiSent?: boolean;
}

interface DailyStatus {
  sentToday: number;
  remaining: number;
  dailyLimit: number;
  limitReached: boolean;
  configured: boolean; // MSG91 WA API configured
}

interface BulkResult {
  sent: number;
  apiSent: number;
  apiFailed: number;
  useApi: boolean;
  sentToday: number;
  remaining: number;
  suppliers: Supplier[];
}

interface BatchStats {
  total: number; unclaimed: number; claimed: number; contactedToday: number;
}

// ─────────────────────────────────────────────
// Daily Quota Bar
// ─────────────────────────────────────────────
function QuotaBar({ sent, limit }: { sent: number; limit: number }) {
  const pct = Math.min(100, Math.round((sent / limit) * 100));
  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-bold tabular-nums ${pct >= 100 ? 'text-red-400' : 'text-white'}`}>
        {sent} / {limit}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// WhatsApp Dialer (auto-advance countdown)
// ─────────────────────────────────────────────
function Dialer({
  suppliers,
  onClose,
}: {
  suppliers: Supplier[];
  onClose: () => void;
}) {
  const [idx,       setIdx]       = useState(0);
  const [sentSet,   setSentSet]   = useState<Set<number>>(new Set());
  const [skipSet,   setSkipSet]   = useState<Set<number>>(new Set());
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = suppliers.length;

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setCountdown(null);
  };

  const advance = useCallback(() => {
    clearTimer();
    if (idx < total - 1) setIdx(i => i + 1);
    else onClose();
  }, [idx, total, onClose]);

  const startCountdown = useCallback((secs: number) => {
    clearTimer();
    setCountdown(secs);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearTimer();
          advance();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [advance]);

  useEffect(() => () => clearTimer(), []);

  // When idx changes, cancel any running countdown
  useEffect(() => { clearTimer(); }, [idx]);

  const handleOpenWA = () => {
    setSentSet(prev => new Set([...prev, idx]));
    startCountdown(5);
  };

  const handleSkip = () => {
    clearTimer();
    setSkipSet(prev => new Set([...prev, idx]));
    advance();
  };

  const handleMarkDone = () => {
    setSentSet(prev => new Set([...prev, idx]));
    advance();
  };

  const s   = suppliers[idx];
  const pct = Math.round((idx / total) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-green-400" />
            <span className="text-white font-semibold text-sm">WhatsApp Dialer</span>
            {countdown !== null && (
              <span className="text-xs bg-amber-900/50 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded-full animate-pulse">
                Next in {countdown}s
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs">{idx + 1} / {total}</span>
            {countdown !== null && (
              <button onClick={clearTimer} className="text-amber-400 hover:text-amber-300 text-xs underline">
                Cancel
              </button>
            )}
            <button onClick={onClose} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1 bg-slate-800">
          <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        {countdown !== null && (
          <div className="h-0.5 bg-slate-800">
            <div
              className="h-full bg-amber-400 transition-all duration-1000"
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            />
          </div>
        )}

        {/* Supplier card */}
        <div className="px-6 py-5">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
              {(s.company || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-lg leading-tight">{s.company}</p>
              {s.location && <p className="text-slate-400 text-sm mt-0.5">📍 {s.location}</p>}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-slate-500 font-mono">
                  {s.phone ? `+91 ${s.phone.replace(/\D/g, '').slice(-10).replace(/(\d{5})(\d{5})/, '$1 $2')}` : 'No phone'}
                </span>
                <span className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
                  Trust {s.trustScore}
                </span>
                {s.apiSent && (
                  <span className="text-xs bg-green-900/40 border border-green-700/50 text-green-400 px-1.5 py-0.5 rounded">
                    ✓ Sent via API
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Message preview */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 mb-4 text-xs text-slate-400 leading-relaxed whitespace-pre-line">
            {`Namaste! 🙏\n\nYour business "${s.company}" has a verified profile on VyaparSethu — India's B2B Supplier & Buyer Network.\n\nVerified buyers are searching for your products right now.\n\nClaim your FREE profile in 2 minutes:\n[Claim Link]\n\n— Team VyaparSethu`}
          </div>

          {/* Countdown hint */}
          {countdown !== null && (
            <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg px-3 py-2 mb-3 text-xs text-amber-300 text-center">
              Auto-advancing in {countdown}s — tap Send in WhatsApp now
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            {s.waLink ? (
              <a
                href={s.waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleOpenWA}
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl text-base shadow-lg shadow-green-900/30 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.5 13.8c-.25-.12-1.47-.72-1.7-.8-.23-.08-.4-.12-.57.12-.17.25-.66.8-.8.96-.15.17-.3.19-.55.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.12-.12.25-.3.37-.46.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.57-1.37-.78-1.88-.2-.49-.41-.42-.57-.43h-.49c-.17 0-.44.06-.67.31S8.5 8.5 8.5 9.63s.77 2.07.88 2.22c.12.15 1.52 2.32 3.68 3.25.51.22.91.35 1.22.45.51.16.98.14 1.35.08.41-.06 1.27-.52 1.45-1.02.18-.5.18-.93.13-1.02-.06-.1-.22-.15-.47-.27ZM12 2a10 10 0 0 0-8.66 15L2 22l5.08-1.34A10 10 0 1 0 12 2Z" />
                </svg>
                Open WhatsApp — Auto-advances in 5s
              </a>
            ) : (
              <button
                onClick={handleMarkDone}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3.5 rounded-xl text-sm transition-colors"
              >
                No phone — Mark &amp; Next
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              {s.waLink && (
                <button
                  onClick={handleMarkDone}
                  className="flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
                >
                  <Check className="w-4 h-4 text-green-400" /> Mark Sent
                </button>
              )}
              <button
                onClick={handleSkip}
                className={`flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl text-sm border border-slate-700 transition-colors ${!s.waLink ? 'col-span-2' : ''}`}
              >
                <SkipForward className="w-4 h-4" />
                {idx === total - 1 ? 'Finish' : 'Skip'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer stats */}
        <div className="px-5 py-3 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>✓ {sentSet.size} sent  ·  ↷ {skipSet.size} skipped  ·  {total - idx - 1} remaining</span>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-400 transition-colors">
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function OutreachPage() {
  const [data,       setData]       = useState<OutreachStats | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [days,       setDays]       = useState(30);

  // Bulk WA state
  const [daily,      setDaily]      = useState<DailyStatus | null>(null);
  const [bulkLoading,setBulkLoading]= useState(false);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const [bulkError,  setBulkError]  = useState('');

  // Legacy batch stats
  const [batchStats, setBatchStats] = useState<BatchStats | null>(null);

  // Dialer
  const [dialerSuppliers, setDialerSuppliers] = useState<Supplier[]>([]);
  const [dialerOpen,      setDialerOpen]      = useState(false);

  // ── Fetch campaign stats ──
  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`/api/admin/outreach-stats?days=${days}`, { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally { setLoading(false); }
  }, [days]);

  // ── Fetch daily quota ──
  const fetchDaily = useCallback(async () => {
    try {
      const [dailyRes, batchRes] = await Promise.all([
        fetch('/api/admin/outreach/bulk-wa', { credentials: 'include' }),
        fetch('/api/admin/outreach/stats',   { credentials: 'include' }),
      ]);
      const d = await dailyRes.json();
      const b = await batchRes.json();
      if (d.success) setDaily(d);
      if (b.success) setBatchStats(b);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchData(); fetchDaily(); }, [fetchData, fetchDaily]);

  // ── Bulk send / generate batch ──
  const handleBulkSend = async () => {
    setBulkLoading(true);
    setBulkError('');
    setBulkResult(null);
    try {
      const remaining = daily?.remaining ?? DAILY_LIMIT;
      const res  = await fetch('/api/admin/outreach/bulk-wa', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: remaining }),
      });
      const json = await res.json();
      if (json.limitReached) {
        setBulkError(`Daily limit of ${DAILY_LIMIT} reached. Resets at midnight IST.`);
        return;
      }
      if (!json.success) { setBulkError(json.error || 'Failed'); return; }
      setBulkResult(json);
      setDaily(d => d ? { ...d, sentToday: json.sentToday, remaining: json.remaining, limitReached: json.remaining === 0 } : d);
      // Open dialer automatically if not using MSG91 API
      if (!json.useApi && json.suppliers?.length > 0) {
        setDialerSuppliers(json.suppliers);
        setDialerOpen(true);
      }
    } catch (e) {
      setBulkError(e instanceof Error ? e.message : 'Network error');
    } finally { setBulkLoading(false); }
  };

  const exportCSV = (suppliers: Supplier[]) => {
    const h   = 'company,phone,location,trust_score,claim_link,wa_link';
    const rows = suppliers.map(s =>
      `"${s.company}","${s.phone ?? ''}","${s.location ?? ''}",${s.trustScore},"${s.claimLink}","${s.waLink ?? ''}"`
    );
    const blob = new Blob([[h, ...rows].join('\n')], { type: 'text/csv' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `vyaparsethu-outreach-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const funnel    = data ? [
    { label: 'Outreach Sent',   value: data.period.outreachSent,  color: 'bg-blue-500' },
    { label: 'Day 2 Follow-up', value: data.period.followUp1,     color: 'bg-cyan-500' },
    { label: 'Day 5 Follow-up', value: data.period.followUp2,     color: 'bg-indigo-500' },
    { label: 'Subscribed',      value: data.period.subscriptions, color: 'bg-green-500' },
  ] : [];
  const funnelMax = funnel.length > 0 ? Math.max(1, funnel[0].value) : 1;

  return (
    <div className="space-y-6">

      {/* ═══════════════════════════════════════ */}
      {/*  BULK SEND PANEL                        */}
      {/* ═══════════════════════════════════════ */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-green-400" />
              Today's WhatsApp Outreach
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              TRAI-safe daily limit: <span className="text-white font-semibold">{DAILY_LIMIT} messages/day</span>
              {daily?.configured && (
                <span className="ml-2 text-xs bg-green-900/40 border border-green-700/50 text-green-400 px-2 py-0.5 rounded-full">
                  MSG91 WA API active
                </span>
              )}
            </p>
          </div>

          <button
            onClick={handleBulkSend}
            disabled={bulkLoading || daily?.limitReached === true}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-5 py-2.5 rounded-lg min-h-[44px] transition-colors text-sm"
          >
            {bulkLoading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Preparing…</>
            ) : daily?.limitReached ? (
              '✓ Limit Reached — Resets Midnight IST'
            ) : (
              <>
                <Phone className="w-4 h-4" />
                Send Today's {daily?.remaining ?? DAILY_LIMIT} →
              </>
            )}
          </button>
        </div>

        {/* Quota bar */}
        {daily && (
          <div className="space-y-1">
            <QuotaBar sent={daily.sentToday} limit={daily.dailyLimit} />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{daily.sentToday} sent today</span>
              <span>{daily.remaining} remaining · resets midnight IST</span>
            </div>
          </div>
        )}

        {bulkError && (
          <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-red-300 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {bulkError}
          </div>
        )}

        {/* Bulk result */}
        {bulkResult && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Generated',    value: bulkResult.sent,      color: 'text-white' },
                { label: 'API Sent',     value: bulkResult.apiSent,   color: 'text-green-400' },
                { label: 'API Failed',   value: bulkResult.apiFailed, color: 'text-red-400' },
                { label: 'Remaining',    value: bulkResult.remaining, color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="bg-slate-900/60 rounded-lg p-3 text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Result message */}
            {bulkResult.useApi && bulkResult.apiSent > 0 && (
              <div className="flex items-center gap-2 bg-green-900/20 border border-green-700/40 rounded-lg px-4 py-3 text-green-300 text-sm">
                <Check className="w-4 h-4 flex-shrink-0" />
                {bulkResult.apiSent} messages sent automatically via MSG91 WhatsApp API
              </div>
            )}

            {/* If not via API — show dialer option */}
            {!bulkResult.useApi && bulkResult.suppliers.length > 0 && (
              <div className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3">
                <div>
                  <p className="text-white text-sm font-semibold">
                    {bulkResult.suppliers.length} contacts ready — open WhatsApp dialer
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Auto-advances to next contact after each send
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setDialerSuppliers(bulkResult.suppliers); setDialerOpen(true); }}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-4 h-4" /> Start Dialer
                  </button>
                  <button
                    onClick={() => exportCSV(bulkResult.suppliers)}
                    className="text-slate-400 hover:text-white text-xs transition-colors"
                  >
                    CSV ↓
                  </button>
                </div>
              </div>
            )}

            {/* Setup MSG91 WA hint */}
            {!bulkResult.useApi && (
              <p className="text-slate-600 text-xs">
                To auto-send without the dialer, set{' '}
                <code className="text-slate-400">MSG91_WA_AUTH_KEY</code>,{' '}
                <code className="text-slate-400">MSG91_WA_PHONE</code>, and{' '}
                <code className="text-slate-400">MSG91_WA_TEMPLATE</code> in Vercel env vars.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════ */}
      {/*  OUTREACH CAMPAIGN STATS (existing)    */}
      {/* ═══════════════════════════════════════ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Outreach Campaigns</h1>
          <p className="text-slate-400 text-sm">WhatsApp outreach, follow-ups, drip sequence, and conversion</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/dashboard/operator" target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg transition-colors">
            Operator Dashboard <ExternalLink className="w-3 h-3" />
          </a>
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            {RANGES.map(r => (
              <button key={r.value} onClick={() => setDays(r.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${days === r.value ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={() => { fetchData(); fetchDaily(); }} disabled={loading}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {loading && !data && (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {data && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Unique Suppliers Reached', value: data.period.uniqueSuppliersReached, color: 'text-blue-400',   border: 'border-blue-500/20' },
              { label: 'Subscriptions (period)',    value: data.period.subscriptions,          color: 'text-green-400', border: 'border-green-500/20' },
              { label: 'Conversion Rate',           value: `${data.period.conversionRate}%`,   color: 'text-amber-400', border: 'border-amber-500/20' },
              { label: 'WA Clicks (period)',        value: data.period.waClicks,               color: 'text-cyan-400',  border: 'border-cyan-500/20' },
            ].map(c => (
              <div key={c.label} className={`bg-slate-800/60 border ${c.border} rounded-xl p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className={`w-4 h-4 ${c.color}`} />
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">{c.label}</span>
                </div>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Funnel */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" /> Conversion Funnel — {days}d
            </h3>
            <div className="space-y-3">
              {funnel.map((f, i) => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="w-36 text-slate-400 text-xs">{f.label}</span>
                  <div className="flex-1 h-6 bg-slate-700 rounded-lg overflow-hidden">
                    <div className={`h-full ${f.color} rounded-lg flex items-center px-2`}
                      style={{ width: `${Math.max(4, Math.round((f.value / funnelMax) * 100))}%` }}>
                      <span className="text-white text-xs font-semibold">{f.value}</span>
                    </div>
                  </div>
                  {i > 0 && funnel[i - 1].value > 0 && (
                    <span className="text-slate-500 text-xs w-14 text-right">
                      {((f.value / funnel[i - 1].value) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Period + All-time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Period Actions ({days}d)</h3>
              <div className="space-y-2">
                {([
                  ['outreach_sent',          data.period.outreachSent],
                  ['follow_up_1_sent',       data.period.followUp1],
                  ['follow_up_2_sent',       data.period.followUp2],
                  ['drip_day3_sent',         data.period.drip3],
                  ['drip_day7_sent',         data.period.drip7],
                  ['drip_day14_sent',        data.period.drip14],
                  ['subscription_activated', data.period.subscriptions],
                ] as [string, number][]).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/30">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLOR[key] ?? 'text-slate-400 bg-slate-700'}`}>
                      {ACTION_LABEL[key] ?? key}
                    </span>
                    <span className="text-white font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> All-Time Totals
              </h3>
              <div className="space-y-2">
                {([
                  ['outreach_sent',          data.allTime.outreachSent],
                  ['follow_up_1_sent',       data.allTime.followUp1],
                  ['follow_up_2_sent',       data.allTime.followUp2],
                  ['drip_day3_sent',         data.allTime.drip3],
                  ['drip_day7_sent',         data.allTime.drip7],
                  ['drip_day14_sent',        data.allTime.drip14],
                  ['subscription_activated', data.allTime.subscriptions],
                ] as [string, number][]).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/30">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLOR[key] ?? 'text-slate-400 bg-slate-700'}`}>
                      {ACTION_LABEL[key] ?? key}
                    </span>
                    <span className="text-white font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
            {data.recentEvents.length === 0 ? (
              <p className="text-slate-500 text-xs">No outreach events in this period</p>
            ) : (
              <div className="space-y-1.5">
                {data.recentEvents.map((e, i) => {
                  const meta = e.metadata as Record<string, unknown> | null;
                  return (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-700/30 text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${ACTION_COLOR[e.actionType] ?? 'text-slate-400 bg-slate-700'}`}>
                        {ACTION_LABEL[e.actionType] ?? e.actionType}
                      </span>
                      <span className="text-slate-400 truncate flex-1">
                        {String(meta?.company ?? meta?.name ?? e.userId ?? '—')}
                        {meta?.category ? ` · ${meta.category}` : ''}
                      </span>
                      <span className="text-slate-600 shrink-0">
                        {new Date(e.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Legacy batch stats summary */}
      {batchStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Suppliers',  value: batchStats.total,          color: 'text-blue-400' },
            { label: 'Unclaimed',        value: batchStats.unclaimed,      color: 'text-amber-400' },
            { label: 'Claimed',          value: batchStats.claimed,        color: 'text-green-400' },
            { label: 'Contacted Today',  value: batchStats.contactedToday, color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp Dialer Modal */}
      {dialerOpen && dialerSuppliers.length > 0 && (
        <Dialer
          suppliers={dialerSuppliers}
          onClose={() => { setDialerOpen(false); fetchDaily(); }}
        />
      )}
    </div>
  );
}
