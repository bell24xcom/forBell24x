'use client';
import { useState, useEffect, useCallback } from 'react';

interface FunnelData {
  modal_open: number;
  otp_sent: number;
  registration_complete: number;
  conversionRate: string;
  otpToRegistration: string;
}

interface PageStat {
  source: string;
  modal_open: number;
  otp_sent: number;
  registration_complete: number;
}

interface CategoryStat {
  category: string;
  city: string;
  count: number;
}

interface AcquisitionData {
  funnel: FunnelData;
  byPage: PageStat[];
  byCategory: CategoryStat[];
  recentRegistrations: { source: string; createdAt: string; metadata: Record<string, unknown> }[];
}

const RANGES = [{ label: '24h', value: '1d' }, { label: '7 Days', value: '7d' }, { label: '30 Days', value: '30d' }];

export default function AcquisitionPage() {
  const [data, setData] = useState<AcquisitionData | null>(null);
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/acquisition?range=${range}`, { credentials: 'include' });
      if (res.ok) setData(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [range]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Acquisition Funnel</h1>
          <p className="text-slate-400 text-sm mt-1">Modal opens → OTP → Registrations by page and category</p>
        </div>
        <div className="flex gap-2">
          {RANGES.map(r => (
            <button key={r.value} onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${range === r.value ? 'bg-[#D4AF37] text-[#001f3f]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {r.label}
            </button>
          ))}
          <button onClick={load} className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-400 hover:bg-slate-700">↻</button>
        </div>
      </div>

      {loading && !data && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {data && (
        <>
          {/* Funnel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Modal Opens', value: data.funnel.modal_open, color: 'text-blue-400', sub: 'Visitors who saw the modal' },
              { label: 'OTP Sent', value: data.funnel.otp_sent, color: 'text-amber-400', sub: 'Entered phone number' },
              { label: 'Registrations', value: data.funnel.registration_complete, color: 'text-emerald-400', sub: 'Verified OTP & logged in' },
              { label: 'Conversion', value: data.funnel.conversionRate + '%', color: 'text-[#D4AF37]', sub: 'Modal → Registration rate', isString: true },
            ].map(m => (
              <div key={m.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
                <p className={`text-2xl font-bold ${m.color}`}>
                  {m.isString ? m.value : Number(m.value).toLocaleString('en-IN')}
                </p>
                <p className="text-white text-sm font-medium mt-1">{m.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{m.sub}</p>
              </div>
            ))}
          </div>

          {/* Funnel visual */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 mb-8">
            <h2 className="text-white font-semibold text-sm mb-5">Funnel Visualisation</h2>
            {[
              { label: 'Modal Opens', value: data.funnel.modal_open, color: 'bg-blue-500' },
              { label: 'OTP Sent', value: data.funnel.otp_sent, color: 'bg-amber-500' },
              { label: 'Registered', value: data.funnel.registration_complete, color: 'bg-emerald-500' },
            ].map((step, i, arr) => {
              const pct = arr[0].value > 0 ? (step.value / arr[0].value) * 100 : 0;
              return (
                <div key={step.label} className="flex items-center gap-4 mb-3">
                  <div className="w-32 text-slate-400 text-xs shrink-0 text-right">{step.label}</div>
                  <div className="flex-1 h-7 bg-slate-700/40 rounded-lg overflow-hidden">
                    <div className={`h-full ${step.color} rounded-lg transition-all duration-700 flex items-center pl-3`}
                      style={{ width: `${Math.max(pct, 2)}%` }}>
                      <span className="text-white text-xs font-bold">{step.value.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="w-12 text-slate-500 text-xs shrink-0">{pct.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top pages by modal opens */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-white font-semibold text-sm mb-5">Top Pages — Modal Opens</h2>
              {data.byPage.length === 0 ? (
                <p className="text-slate-500 text-xs">No data yet — modal tracking fires automatically when modal opens.</p>
              ) : (
                <div className="space-y-2">
                  {data.byPage.slice(0, 10).map((p, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-700/30 text-xs">
                      <span className="text-slate-600 w-4 shrink-0">{i + 1}</span>
                      <span className="text-slate-300 flex-1 truncate font-mono text-[11px]">{p.source}</span>
                      <span className="text-blue-400 shrink-0 font-semibold">{p.modal_open} opens</span>
                      <span className="text-emerald-400 shrink-0">{p.registration_complete} reg</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top category+city */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-white font-semibold text-sm mb-5">Top Category + City Intent</h2>
              {data.byCategory.length === 0 ? (
                <p className="text-slate-500 text-xs">No category intent data yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.byCategory.slice(0, 10).map((c, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-700/30 text-xs">
                      <span className="text-slate-600 w-4 shrink-0">{i + 1}</span>
                      <span className="text-slate-300 flex-1 truncate">
                        {c.category || '—'}{c.city ? ` · ${c.city}` : ''}
                      </span>
                      <span className="text-[#D4AF37] font-semibold shrink-0">{c.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Deep-link WhatsApp Campaign Launcher */}
          <DeepLinkCampaign />

          {/* Recent registrations */}
          {data.recentRegistrations.length > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-white font-semibold text-sm mb-5">Recent Registrations (last 20)</h2>
              <div className="space-y-2">
                {data.recentRegistrations.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-700/30 text-xs">
                    <span className="text-emerald-400 shrink-0">✓</span>
                    <span className="text-slate-400 font-mono text-[11px] flex-1 truncate">{r.source || 'direct'}</span>
                    <span className="text-slate-500 shrink-0">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DeepLinkCampaign() {
  const CLUSTERS = [
    { category: 'Steel & Metals', city: 'Kalamboli' },
    { category: 'Packaging Materials', city: 'Bhiwandi' },
    { category: 'Chemicals', city: 'Taloja' },
    { category: 'Textiles', city: 'Surat' },
    { category: 'Industrial Machinery', city: 'Coimbatore' },
    { category: 'Steel & Metals', city: 'Ludhiana' },
    { category: 'Packaging Materials', city: 'Silvassa' },
    { category: 'Chemicals', city: 'Ankleshwar' },
  ];

  const [selected, setSelected] = useState(CLUSTERS[0]);
  const [minScore, setMinScore] = useState(0);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; apiSent: number; suppliers: { company: string; waLink: string | null; apiSent: boolean }[] } | null>(null);

  const preview = `https://www.vyaparsethu.com/supplier/claim?category=${encodeURIComponent(selected.category)}&city=${encodeURIComponent(selected.city)}`;

  const handleSend = async (dryRun: boolean) => {
    setSending(true); setResult(null);
    try {
      const res = await fetch('/api/admin/outreach/bulk-wa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          count: 20,
          dryRun,
          minTrustScore: minScore,
          category: selected.category,
          city: selected.city,
        }),
      });
      const json = await res.json();
      setResult(json);
    } catch { /* ignore */ }
    setSending(false);
  };

  return (
    <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-6 mb-8">
      <h2 className="text-white font-bold text-base mb-1">Deep-Link WhatsApp Campaign</h2>
      <p className="text-slate-400 text-xs mb-6">Send category+city specific claim links to suppliers — highest conversion rate for supplier acquisition.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="block text-slate-300 text-xs font-medium mb-1.5">Cluster</label>
          <select value={`${selected.category}|${selected.city}`}
            onChange={e => { const [cat, city] = e.target.value.split('|'); setSelected({ category: cat, city }); }}
            className="w-full bg-slate-800 border border-slate-600 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#D4AF37]/60">
            {CLUSTERS.map(c => (
              <option key={`${c.category}|${c.city}`} value={`${c.category}|${c.city}`}>
                {c.category} · {c.city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-300 text-xs font-medium mb-1.5">Min Trust Score</label>
          <select value={minScore} onChange={e => setMinScore(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-600 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#D4AF37]/60">
            <option value={0}>All contacts</option>
            <option value={60}>60+ (Good)</option>
            <option value={75}>75+ (High trust)</option>
            <option value={80}>80+ (Very high)</option>
            <option value={90}>90+ (Top tier)</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-300 text-xs font-medium mb-1.5">Deep-link Preview</label>
          <p className="text-[#D4AF37] text-[10px] font-mono bg-slate-800/60 rounded-lg px-3 py-2.5 truncate">{preview}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => handleSend(true)} disabled={sending}
          className="px-4 py-2 border border-slate-600 text-slate-300 hover:text-white rounded-lg text-xs transition-colors disabled:opacity-40">
          {sending ? '…' : 'Dry Run (Preview)'}
        </button>
        <button onClick={() => handleSend(false)} disabled={sending}
          className="px-5 py-2 bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-bold rounded-lg text-xs transition-colors disabled:opacity-40">
          {sending ? 'Sending…' : `Send 20 WhatsApp Messages →`}
        </button>
      </div>

      {result && (
        <div className="mt-5 bg-slate-800/60 rounded-xl p-4">
          <p className="text-white text-sm font-semibold mb-3">
            {result.sent === 0 ? 'Dry run preview' : `Sent ${result.sent} messages (${result.apiSent} via MSG91 API)`}
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {(result.suppliers || []).map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-xs py-1.5 border-b border-slate-700/30">
                <span className={s.apiSent ? 'text-emerald-400' : 'text-amber-400'}>{s.apiSent ? '✓ API' : '🔗 Link'}</span>
                <span className="text-slate-300 flex-1 truncate">{s.company}</span>
                {s.waLink && (
                  <a href={s.waLink} target="_blank" rel="noopener noreferrer"
                    className="text-[#D4AF37] underline shrink-0">Open WA</a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
