'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';

type TimelineEventType =
  | 'interaction'
  | 'discovery'
  | 'whatsapp'
  | 'rfq'
  | 'quote'
  | 'outreach'
  | 'notification'
  | 'claim_invitation';

interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  action: string;
  title: string;
  detail?: string;
  createdAt: string;
}

interface JourneyData {
  profile: {
    id: string;
    name: string | null;
    company: string | null;
    phone: string | null;
    email: string | null;
    location: string | null;
    role: string;
    trustScore: number;
    isClaimed: boolean;
    isVerified: boolean;
    claimedAt: string | null;
    importedFrom: string | null;
    createdAt: string;
    gstNumber: string | null;
    stats: {
      rfqs: number;
      quotes: number;
      outreachRecipients: number;
      claimInvitations: number;
      notifications: number;
    };
  };
  discoverySource: string | null;
  claimStatus: {
    isClaimed: boolean;
    claimedAt: string | null;
    latestInvitation: {
      id: string;
      status: string;
      issuedAt: string;
      expiresAt: string;
      consumedAt: string | null;
      campaignName: string | null;
    } | null;
  };
  rfqActivity: {
    rfqs: Array<{ id: string; title: string; category: string; status: string; createdAt: string }>;
    quotes: Array<{ id: string; price: number; status: string; rfqTitle: string | null; createdAt: string }>;
  };
  outreachHistory: Array<{
    id: string;
    state: string;
    channel: string;
    campaignName: string | null;
    campaignStatus: string | null;
    sentAt: string | null;
    createdAt: string;
  }>;
  whatsappHistory: Array<{ id: string; actionType: string; source: string | null; createdAt: string }>;
  timeline: TimelineEvent[];
}

const TYPE_COLORS: Record<TimelineEventType, string> = {
  interaction: 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50',
  discovery: 'bg-teal-900/40 text-teal-300 border-teal-700/50',
  whatsapp: 'bg-green-900/40 text-green-300 border-green-700/50',
  rfq: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  quote: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
  outreach: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  notification: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
  claim_invitation: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50',
};

function TrustBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'text-green-400 bg-green-900/30 border-green-700/50'
      : score >= 60
        ? 'text-amber-400 bg-amber-900/30 border-amber-700/50'
        : score >= 30
          ? 'text-blue-400 bg-blue-900/30 border-blue-700/50'
          : 'text-slate-400 bg-slate-800 border-slate-700';
  return (
    <span className={`text-sm font-bold px-3 py-1 rounded-full border ${color}`}>{score}</span>
  );
}

export default function CrmJourneyPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [data, setData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/crm/${userId}/timeline`, { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || json.error || 'Failed to load');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const displayName = data?.profile.company || data?.profile.name || 'Company';

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/crm" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" /> CRM
        </Link>
        <Link href="/admin/discovery" className="text-slate-500 hover:text-white text-sm">Discovery</Link>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white ml-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {loading && !data ? (
        <p className="text-slate-500 text-sm">Loading CRM journey…</p>
      ) : data ? (
        <>
          {/* Company Profile */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                <p className="text-slate-400 text-sm mt-1">
                  {data.profile.role} · {data.profile.location || 'Location unknown'}
                </p>
              </div>
              <TrustBadge score={data.profile.trustScore} />
            </div>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-4">
              {[
                ['Phone', data.profile.phone],
                ['Email', data.profile.email],
                ['GST', data.profile.gstNumber],
                ['Verified', data.profile.isVerified ? 'Yes' : 'No'],
                ['Joined', new Date(data.profile.createdAt).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="text-slate-500 w-20 shrink-0">{k}</dt>
                  <dd className="text-slate-300">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Discovery Source */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Discovery Source</h2>
              <p className="text-white text-sm">
                {data.discoverySource
                  ? data.discoverySource.replace('discovery:', '')
                  : 'Not from discovery pipeline'}
              </p>
            </div>

            {/* Claim Status */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Claim Status</h2>
              <p className={`text-sm font-semibold ${data.claimStatus.isClaimed ? 'text-green-400' : 'text-amber-400'}`}>
                {data.claimStatus.isClaimed ? 'Claimed' : 'Unclaimed'}
                {data.claimStatus.claimedAt && (
                  <span className="text-slate-500 font-normal ml-2">
                    on {new Date(data.claimStatus.claimedAt).toLocaleDateString()}
                  </span>
                )}
              </p>
              {data.claimStatus.latestInvitation && (
                <p className="text-slate-500 text-xs mt-2">
                  Latest invitation: {data.claimStatus.latestInvitation.status}
                  {data.claimStatus.latestInvitation.campaignName &&
                    ` · ${data.claimStatus.latestInvitation.campaignName}`}
                </p>
              )}
            </div>
          </div>

          {/* RFQ Activity */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
              RFQ Activity ({data.rfqActivity.rfqs.length} requirements · {data.rfqActivity.quotes.length} quotes)
            </h2>
            {data.rfqActivity.rfqs.length === 0 && data.rfqActivity.quotes.length === 0 ? (
              <p className="text-slate-500 text-sm">No RFQ or quote activity yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 text-xs mb-2">Requirements posted</p>
                  <ul className="space-y-1 text-sm max-h-40 overflow-y-auto">
                    {data.rfqActivity.rfqs.map((r) => (
                      <li key={r.id} className="text-slate-300 border-b border-slate-700/20 py-1">
                        {r.title} <span className="text-slate-600 text-xs">· {r.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-2">Quotes submitted</p>
                  <ul className="space-y-1 text-sm max-h-40 overflow-y-auto">
                    {data.rfqActivity.quotes.map((q) => (
                      <li key={q.id} className="text-slate-300 border-b border-slate-700/20 py-1">
                        {q.rfqTitle || 'Quote'} · ₹{q.price.toLocaleString('en-IN')}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Outreach History */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Outreach History ({data.outreachHistory.length})
              </h2>
              {data.outreachHistory.length === 0 ? (
                <p className="text-slate-500 text-sm">No outreach campaigns yet.</p>
              ) : (
                <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
                  {data.outreachHistory.map((o) => (
                    <li key={o.id} className="border-b border-slate-700/20 pb-2">
                      <p className="text-white">{o.campaignName || 'Campaign'}</p>
                      <p className="text-slate-500 text-xs">
                        {o.channel} · {o.state}
                        {o.sentAt && ` · sent ${new Date(o.sentAt).toLocaleDateString()}`}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/admin/company-claim-outreach" className="text-indigo-400 hover:underline text-xs mt-3 inline-block">
                View campaigns →
              </Link>
            </div>

            {/* WhatsApp History */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                WhatsApp History ({data.whatsappHistory.length})
              </h2>
              {data.whatsappHistory.length === 0 ? (
                <p className="text-slate-500 text-sm">No WhatsApp events logged for this company.</p>
              ) : (
                <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
                  {data.whatsappHistory.map((w) => (
                    <li key={w.id} className="border-b border-slate-700/20 pb-2">
                      <p className="text-green-400">{w.actionType.replace(/_/g, ' ')}</p>
                      <p className="text-slate-600 text-xs">{new Date(w.createdAt).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/admin/whatsapp/ops" className="text-indigo-400 hover:underline text-xs mt-3 inline-block">
                WhatsApp Ops →
              </Link>
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Timeline Feed ({data.timeline.length} events)
            </h2>
            {data.timeline.length === 0 ? (
              <p className="text-slate-500 text-sm">No events recorded yet.</p>
            ) : (
              <ul className="space-y-2 max-h-[500px] overflow-y-auto">
                {data.timeline.map((e) => (
                  <li key={e.id} className="flex items-start gap-3 border-b border-slate-700/20 pb-2 text-sm">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${TYPE_COLORS[e.type]}`}
                    >
                      {e.type.replace('_', ' ')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{e.title}</p>
                      {e.detail && <p className="text-slate-500 text-xs">{e.detail}</p>}
                    </div>
                    <time className="text-slate-600 text-xs shrink-0">{new Date(e.createdAt).toLocaleString()}</time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
