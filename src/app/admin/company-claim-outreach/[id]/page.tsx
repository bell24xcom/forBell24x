'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { RefreshCw, AlertTriangle, ShieldAlert, Users, PlayCircle, Send } from 'lucide-react';

interface Recipient {
  id: string;
  companyId: string;
  state: string;
  eligibilityReason: string | null;
  destination: string | null;
  company: { company: string | null; name: string | null; location: string | null; isClaimed: boolean };
}

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  channel: string;
  status: string;
  messageTemplate: string | null;
  dryRunSummary: Record<string, number> | null;
  lastDryRunAt: string | null;
  promotedToLiveAt: string | null;
  recipients: Recipient[];
}

interface Candidate { id: string; company: string | null; name: string | null; location: string | null; trustScore: number }

const NEXT_STATUS: Record<string, string[]> = {
  DRAFT: ['DRY_RUN', 'CANCELLED'],
  DRY_RUN: ['READY', 'CANCELLED'],
  READY: ['DRY_RUN', 'LIVE', 'CANCELLED'],
  LIVE: ['PAUSED', 'CANCELLED'],
  PAUSED: ['LIVE', 'CANCELLED'],
};

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchCampaign = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/admin/outreach-campaigns/${id}`, { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load');
      setCampaign(json.campaign);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchCampaign(); }, [fetchCampaign]);

  const loadCandidates = async () => {
    const res = await fetch('/api/admin/outreach-campaigns?candidates=1&limit=50', { credentials: 'include' });
    const json = await res.json();
    if (json.success) setCandidates(json.candidates);
  };

  const addSelected = async () => {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/outreach-campaigns/${id}`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add-recipients', companyIds: Array.from(selected) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSelected(new Set());
      setCandidates([]);
      fetchCampaign();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add recipients');
    } finally { setBusy(false); }
  };

  const runDryRun = async () => {
    setBusy(true); setError('');
    try {
      const res = await fetch(`/api/admin/outreach-campaigns/${id}`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dry-run' }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      fetchCampaign();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Dry-run failed');
    } finally { setBusy(false); }
  };

  const promote = async (to: string) => {
    const confirmLive = to === 'LIVE';
    if (confirmLive && !window.confirm(
      'LIVE CAMPAIGN — external recipients may receive real messages once you trigger the send. Promote to LIVE?'
    )) return;
    setBusy(true); setError('');
    try {
      const res = await fetch(`/api/admin/outreach-campaigns/${id}`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'promote', to, confirm: confirmLive || undefined }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      fetchCampaign();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Promotion failed');
    } finally { setBusy(false); }
  };

  const liveSend = async () => {
    if (!window.confirm('This sends real messages to external recipients right now. Continue?')) return;
    setBusy(true); setError('');
    try {
      const res = await fetch(`/api/admin/outreach-campaigns/${id}`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'live-send', confirm: true }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      fetchCampaign();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed');
    } finally { setBusy(false); }
  };

  if (loading && !campaign) {
    return <div className="py-16 flex justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!campaign) {
    return <div className="text-red-300 text-sm">{error || 'Campaign not found'}</div>;
  }

  const counts: Record<string, number> = {};
  for (const r of campaign.recipients) counts[r.state] = (counts[r.state] ?? 0) + 1;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">{campaign.name}</h1>
          <p className="text-slate-400 text-sm">{campaign.channel} · {campaign.recipients.length} recipients</p>
        </div>
        <button onClick={fetchCampaign} disabled={loading}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Status + lifecycle controls */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
            campaign.status === 'LIVE' ? 'bg-red-900/40 border border-red-700/50 text-red-400'
            : campaign.status === 'DRAFT' ? 'bg-slate-700 text-slate-300'
            : 'bg-blue-900/40 border border-blue-700/50 text-blue-400'
          }`}>
            {campaign.status}
          </span>
          {campaign.status === 'LIVE' && (
            <span className="flex items-center gap-1.5 text-red-400 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4" /> LIVE CAMPAIGN — external recipients may receive messages
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {campaign.status === 'DRAFT' && (
            <button onClick={runDryRun} disabled={busy || campaign.recipients.length === 0}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">
              <PlayCircle className="w-4 h-4" /> Run Dry-Run
            </button>
          )}
          {NEXT_STATUS[campaign.status]?.filter(s => s !== 'DRY_RUN' || campaign.status !== 'DRY_RUN').map(to => (
            <button key={to} onClick={() => to === 'DRY_RUN' ? runDryRun() : promote(to)} disabled={busy}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                to === 'LIVE' ? 'bg-red-600 hover:bg-red-500 text-white'
                : to === 'CANCELLED' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}>
              {to === 'DRY_RUN' ? 'Re-run Dry-Run' : `Promote to ${to}`}
            </button>
          ))}
          {campaign.status === 'LIVE' && (
            <button onClick={liveSend} disabled={busy}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg text-sm">
              <Send className="w-4 h-4" /> Send Now
            </button>
          )}
        </div>

        {campaign.dryRunSummary && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-700/40">
            {Object.entries(campaign.dryRunSummary).map(([k, v]) => (
              <div key={k} className="bg-slate-900/50 rounded-lg p-2 text-center">
                <p className="text-white font-bold text-sm">{String(v)}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">{k}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message template */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-2">Message Template</h3>
        <p className="text-slate-400 text-xs whitespace-pre-line bg-slate-900/50 rounded-lg p-3">{campaign.messageTemplate}</p>
      </div>

      {/* Recipient selection — DRAFT only */}
      {campaign.status === 'DRAFT' && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Users className="w-4 h-4" /> Add Recipients</h3>
          {candidates.length === 0 ? (
            <button onClick={loadCandidates} className="text-indigo-400 hover:underline text-sm">
              Load eligible unclaimed suppliers →
            </button>
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto space-y-1 bg-slate-900/40 rounded-lg p-2">
                {candidates.map(c => (
                  <label key={c.id} className="flex items-center gap-2 text-xs text-slate-300 px-2 py-1.5 hover:bg-slate-800/60 rounded">
                    <input type="checkbox" checked={selected.has(c.id)} onChange={e => {
                      setSelected(prev => { const next = new Set(prev); e.target.checked ? next.add(c.id) : next.delete(c.id); return next; });
                    }} />
                    {c.company || c.name || c.id} {c.location ? `· ${c.location}` : ''}
                  </label>
                ))}
              </div>
              <button onClick={addSelected} disabled={busy || selected.size === 0}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">
                Add {selected.size} Selected
              </button>
            </>
          )}
        </div>
      )}

      {/* Recipients table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl divide-y divide-slate-700/40">
        {campaign.recipients.length === 0 ? (
          <p className="text-slate-500 text-sm p-5">No recipients yet.</p>
        ) : campaign.recipients.map(r => (
          <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs">
            <span className="text-slate-300 truncate flex-1">{r.company.company || r.company.name || r.companyId}</span>
            <span className="text-slate-500">{r.eligibilityReason ?? ''}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-semibold shrink-0">{r.state}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
