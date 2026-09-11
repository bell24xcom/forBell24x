'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { RefreshCw, Plus, AlertTriangle } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: string;
  createdAt: string;
  recipientCounts: Record<string, number>;
  _count: { recipients: number };
}

const STATUS_TONE: Record<string, string> = {
  DRAFT: 'bg-slate-700 text-slate-300',
  DRY_RUN: 'bg-blue-900/40 border border-blue-700/50 text-blue-400',
  READY: 'bg-amber-900/40 border border-amber-700/50 text-amber-400',
  LIVE: 'bg-red-900/40 border border-red-700/50 text-red-400',
  PAUSED: 'bg-slate-700 text-slate-300',
  COMPLETED: 'bg-green-900/40 border border-green-700/50 text-green-400',
  CANCELLED: 'bg-slate-800 text-slate-500',
};

export default function CompanyClaimOutreachPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('WHATSAPP');

  const fetchCampaigns = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/outreach-campaigns', { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load campaigns');
      setCampaigns(json.campaigns);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/outreach-campaigns', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, channel }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to create');
      setShowCreate(false);
      setName('');
      fetchCampaigns();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create campaign');
    } finally { setCreating(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Company Claim Outreach</h1>
          <p className="text-slate-400 text-sm">
            Campaigns inviting unclaimed supplier profiles to claim ownership. Separate from{' '}
            <a href="/admin/outreach" className="text-indigo-400 hover:underline">WhatsApp Outreach</a> and{' '}
            <a href="/admin/whatsapp-cloud-api" className="text-indigo-400 hover:underline">WhatsApp Cloud API (Meta)</a> —
            this owns campaign meaning, recipients, and claim invitations; those own transport.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreate(v => !v)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
          <button onClick={fetchCampaigns} disabled={loading}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {showCreate && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">New Campaign — starts DRAFT</h3>
          <input
            type="text" placeholder="Campaign name, e.g. Bhiwandi Pipes Q1"
            value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500"
          />
          <select value={channel} onChange={e => setChannel(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
            <option value="WHATSAPP">WhatsApp</option>
            <option value="EMAIL">Email (not available — documented gap)</option>
            <option value="SMS">SMS (not available — documented gap)</option>
          </select>
          <button onClick={handleCreate} disabled={creating || !name.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            {creating ? 'Creating…' : 'Create Draft Campaign'}
          </button>
        </div>
      )}

      {loading && campaigns.length === 0 && (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && campaigns.length === 0 && !error && (
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-10 text-center">
          <p className="text-slate-400 text-sm font-medium">No campaigns yet</p>
        </div>
      )}

      {campaigns.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl divide-y divide-slate-700/40">
          {campaigns.map(c => {
            const would = c.recipientCounts?.DRY_RUN ?? c.recipientCounts?.ELIGIBLE ?? 0;
            const suppressed = c.recipientCounts?.SUPPRESSED ?? 0;
            const sent = c.recipientCounts?.SENT ?? 0;
            const claimed = c.recipientCounts?.CLAIMED ?? 0;
            const failed = c.recipientCounts?.FAILED ?? 0;
            return (
              <Link key={c.id} href={`/admin/company-claim-outreach/${c.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-800/40 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm">{c.name}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_TONE[c.status] ?? 'bg-slate-700 text-slate-300'}`}>
                      {c.status}
                    </span>
                    <span className="text-slate-500 text-xs">{c.channel}</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">
                    {c._count.recipients} recipients · {would} would-send · {suppressed} suppressed · {sent} sent · {claimed} claimed · {failed} failed
                  </p>
                </div>
                <span className="text-slate-600 text-xs shrink-0">{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
