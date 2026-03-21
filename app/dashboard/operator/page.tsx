'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Mail, RefreshCw, ExternalLink, Users, FileText, TrendingUp, Copy, CheckCheck } from 'lucide-react';
import { logEvent } from '@/lib/log-event';

interface SupplierMessage {
  supplierId: string;
  name: string;
  company: string;
  phone: string | null;
  emailAddress: string | null;
  location: string | null;
  trustScore: number;
  whatsapp: string;
  waLink: string | null;
  emailDraft: { subject: string; body: string };
}

interface OutreachGroup {
  category: string;
  rfqCount: number;
  featuredRFQ: { id: string; title: string; link: string };
  suppliers: SupplierMessage[];
}

interface DashboardStats {
  activity: { rfqsToday: number; quotesThisWeek: number; activeSuppliers: number; totalRFQs: number };
  leads: { total: number; pending: number; converted: number; conversionRate: string };
}

interface FollowUp {
  supplierId: string;
  rfqId: string;
  followUpType: 'day2' | 'day5';
  name: string;
  company: string;
  phone: string | null;
  trustScore: number;
  rfqTitle: string;
  rfqCategory: string;
  message: string;
  waLink: string | null;
}

interface Drip {
  supplierId: string;
  name: string;
  company: string | null;
  phone: string;
  category: string;
  dripType: 'day3' | 'day7' | 'day14';
  message: string;
  waLink: string;
}

export default function OperatorDashboard() {
  const [category, setCategory] = useState('');
  const [outreach, setOutreach] = useState<OutreachGroup[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [drips, setDrips] = useState<Drip[]>([]);

  useEffect(() => {
    loadStats();
    loadFunnel();
    loadFollowUps();
    loadDrips();
  }, []);

  async function loadStats() {
    const res = await fetch('/api/demand/dashboard').catch(() => null);
    if (res?.ok) setStats(await res.json());
  }

  async function loadFunnel() {
    const res = await fetch('/api/analytics/funnel?days=7').catch(() => null);
    if (res?.ok) setFunnelData(await res.json());
  }

  async function loadFollowUps() {
    const res = await fetch('/api/outreach/follow-up').catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      setFollowUps(data.followUps ?? []);
    }
  }

  async function markFollowUpSent(supplierId: string, rfqId: string, type: string) {
    await fetch('/api/outreach/follow-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplierId, rfqId, type }),
    }).catch(() => {});
    setFollowUps(prev => prev.filter(f => !(f.supplierId === supplierId && f.rfqId === rfqId)));
  }

  async function loadDrips() {
    const res = await fetch('/api/outreach/drip').catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      setDrips(data.drips ?? []);
    }
  }

  async function markDripSent(supplierId: string, dripType: string) {
    await fetch('/api/outreach/drip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplierId, dripType }),
    }).catch(() => {});
    setDrips(prev => prev.filter(d => d.supplierId !== supplierId));
  }

  async function generateOutreach() {
    setLoading(true);
    try {
      const url = category
        ? `/api/outreach/generate?category=${encodeURIComponent(category)}`
        : '/api/outreach/generate';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOutreach(data.outreach ?? []);
      } else {
        alert(data.message || data.error || 'No data returned');
      }
    } catch (e) {
      alert('Failed to load outreach data');
    }
    setLoading(false);
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const CATEGORIES = [
    '', 'Textiles', 'Packaging & Paper', 'Industrial Machinery', 'Automobile',
    'Electronics & Electrical', 'Chemical', 'Food Products & Beverage',
    'Agriculture', 'Apparel & Fashion', 'Tools & Equipment',
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Operator Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Manual activation — send outreach, track pipeline</p>
          </div>
          <button
            onClick={() => { loadStats(); loadFunnel(); }}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'RFQs Today', value: stats.activity.rfqsToday, icon: FileText },
              { label: 'Active Suppliers', value: stats.activity.activeSuppliers, icon: Users },
              { label: 'Quotes This Week', value: stats.activity.quotesThisWeek, icon: TrendingUp },
              { label: 'Leads Pipeline', value: `${stats.leads.converted}/${stats.leads.total}`, icon: TrendingUp },
            ].map(s => (
              <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">{s.value}</div>
                <div className="text-slate-400 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Funnel */}
        {funnelData?.rates && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">7-Day Funnel</h2>
            <div className="flex gap-6 flex-wrap">
              {[
                { label: 'RFQs Created', value: funnelData.funnel.rfqsCreated },
                { label: 'Viewed', value: funnelData.funnel.rfqsViewed, rate: funnelData.rates.viewRate },
                { label: 'Quoted', value: funnelData.funnel.rfqsQuoted, rate: funnelData.rates.quoteRate },
                { label: 'Deals', value: funnelData.funnel.dealsAccepted, rate: funnelData.rates.dealRate },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                  {s.rate && <div className="text-xs text-blue-400">{s.rate}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow-ups Due */}
        {followUps.length > 0 && (
          <div className="bg-amber-950/40 border border-amber-700/50 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-amber-300">Follow-ups Due</h2>
              <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                {followUps.length}
              </span>
              <span className="text-slate-500 text-xs ml-auto">
                {followUps.filter(f => f.followUpType === 'day2').length} Day 2 ·{' '}
                {followUps.filter(f => f.followUpType === 'day5').length} Day 5
              </span>
            </div>
            <div className="space-y-3">
              {followUps.map(f => (
                <div key={`${f.supplierId}-${f.rfqId}`} className="bg-slate-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white text-sm">{f.company}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                          f.followUpType === 'day2'
                            ? 'bg-blue-900 text-blue-300'
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {f.followUpType === 'day2' ? 'Day 2' : 'Day 5 — Final'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs">{f.name} · Trust: {f.trustScore} · {f.rfqCategory}</p>
                      <p className="text-slate-500 text-xs mt-0.5">RFQ: {f.rfqTitle}</p>
                    </div>
                    {f.waLink && (
                      <a
                        href={f.waLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          logEvent({ type: 'whatsapp_click', meta: { supplierId: f.supplierId, company: f.company, followUp: f.followUpType } });
                          markFollowUpSent(f.supplierId, f.rfqId, f.followUpType);
                        }}
                        className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Send
                      </a>
                    )}
                  </div>
                  <div className="bg-slate-900 rounded p-3 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {f.message}
                  </div>
                  <button
                    onClick={() => copyText(f.message, `fu-${f.supplierId}`)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {copied === `fu-${f.supplierId}`
                      ? <><CheckCheck className="w-3.5 h-3.5 text-green-400" /> Copied ✓</>
                      : <><Copy className="w-3.5 h-3.5" /> Copy message</>
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onboarding Drips Due */}
        {drips.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">Onboarding Drips Due</h2>
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {drips.length}
              </span>
              <span className="text-slate-500 text-xs ml-auto">
                {drips.filter(d => d.dripType === 'day3').length} Day 3 ·{' '}
                {drips.filter(d => d.dripType === 'day7').length} Day 7 ·{' '}
                {drips.filter(d => d.dripType === 'day14').length} Day 14
              </span>
            </div>
            <div className="space-y-3">
              {drips.map(d => (
                <div key={`${d.supplierId}-${d.dripType}`} className="bg-slate-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white text-sm">{d.company ?? d.name}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                          d.dripType === 'day3'
                            ? 'bg-blue-900 text-blue-300'
                            : d.dripType === 'day7'
                            ? 'bg-amber-900 text-amber-300'
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {d.dripType === 'day3' ? 'Day 3 — Profile' : d.dripType === 'day7' ? 'Day 7 — Quote' : 'Day 14 — Re-engage'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs">{d.phone} · {d.category}</p>
                    </div>
                    <a
                      href={d.waLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        logEvent({ type: 'whatsapp_click', meta: { supplierId: d.supplierId, company: d.company, drip: d.dripType } });
                        markDripSent(d.supplierId, d.dripType);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Send
                    </a>
                  </div>
                  <div className="bg-slate-900 rounded p-3 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {d.message}
                  </div>
                  <button
                    onClick={() => copyText(d.message, `drip-${d.supplierId}`)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {copied === `drip-${d.supplierId}`
                      ? <><CheckCheck className="w-3.5 h-3.5 text-green-400" /> Copied ✓</>
                      : <><Copy className="w-3.5 h-3.5" /> Copy message</>
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outreach Generator */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">Generate Outreach Messages</h2>
          <div className="flex gap-3 flex-wrap">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px]"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c || 'All Categories'}</option>
              ))}
            </select>
            <button
              onClick={generateOutreach}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              {loading ? 'Loading...' : 'Generate Messages'}
            </button>
          </div>
        </div>

        {/* Outreach Results */}
        {outreach.length === 0 && !loading && (
          <div className="text-slate-500 text-sm text-center py-8">
            Click "Generate Messages" to load suppliers and ready-to-send WhatsApp messages.
          </div>
        )}

        {outreach.map(group => (
          <div key={group.category} className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">{group.category}</h3>
                <p className="text-sm text-slate-400">
                  {group.rfqCount} live RFQ{group.rfqCount !== 1 ? 's' : ''} —{' '}
                  <a href={group.featuredRFQ.link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                    {group.featuredRFQ.title.slice(0, 50)}
                  </a>
                </p>
              </div>
              <a
                href={group.featuredRFQ.link}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-white"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {group.suppliers.length === 0 ? (
              <p className="text-slate-500 text-sm">No suppliers with contact info found for this category.</p>
            ) : (
              <div className="space-y-3">
                {group.suppliers.map(s => (
                  <div key={s.supplierId} className="bg-slate-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-white text-sm">{s.company}</p>
                        <p className="text-slate-400 text-xs">{s.name} {s.location ? `· ${s.location}` : ''} · Trust: {s.trustScore}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {s.waLink && (
                          <a
                            href={s.waLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => logEvent({ type: 'whatsapp_click', meta: { supplierId: s.supplierId, company: s.company } })}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        )}
                        {s.emailAddress && (
                          <a
                            href={`mailto:${s.emailAddress}?subject=${encodeURIComponent(s.emailDraft.subject)}&body=${encodeURIComponent(s.emailDraft.body)}`}
                            className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Email
                          </a>
                        )}
                      </div>
                    </div>

                    {/* WhatsApp message preview */}
                    <div className="bg-slate-900 rounded p-3 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {s.whatsapp}
                    </div>
                    <button
                      onClick={() => copyText(s.whatsapp, s.supplierId)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {copied === s.supplierId
                        ? <><CheckCheck className="w-3.5 h-3.5 text-green-400" /> Copied ✓</>
                        : <><Copy className="w-3.5 h-3.5" /> Copy message</>
                      }
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
