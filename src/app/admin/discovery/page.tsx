'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Search, ExternalLink } from 'lucide-react';

type ReadinessLevel = 'READY' | 'PARTIAL' | 'MISSING';

interface ReadinessItem {
  id: string;
  label: string;
  status: ReadinessLevel;
  note: string;
}

interface DiscoveryCompany {
  id: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  trustScore: number;
  isClaimed: boolean;
  claimedAt: string | null;
  importedFrom: string | null;
  category: string;
  createdAt: string;
  invitationStatus: string;
  campaign: { id: string; name: string; status: string; channel: string } | null;
  crmHref: string;
}

interface OsCapability {
  name: string;
  status: 'READY' | 'PARTIAL' | 'MISSING' | 'NOT_CONFIGURED';
  detail?: string;
}

const STATUS_STYLES: Record<ReadinessLevel, string> = {
  READY: 'bg-green-900/40 border-green-700/50 text-green-400',
  PARTIAL: 'bg-amber-900/40 border-amber-700/50 text-amber-400',
  MISSING: 'bg-red-900/40 border-red-700/50 text-red-400',
};

const INVITE_STYLES: Record<string, string> = {
  claimed: 'text-green-400',
  sent: 'text-blue-400',
  queued: 'text-amber-400',
  none: 'text-slate-500',
};

export default function DiscoveryPage() {
  const [companies, setCompanies] = useState<DiscoveryCompany[]>([]);
  const [readiness, setReadiness] = useState<ReadinessItem[]>([]);
  const [readinessScore, setReadinessScore] = useState(0);
  const [stats, setStats] = useState({ total: 0, claimed: 0, unclaimed: 0 });
  const [recentEvents, setRecentEvents] = useState<
    { id: string; actionType: string; userId: string | null; createdAt: string }[]
  >([]);
  const [osCaps, setOsCaps] = useState<OsCapability[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [runResult, setRunResult] = useState<string | null>(null);
  const [claimedFilter, setClaimedFilter] = useState<'all' | 'claimed' | 'unclaimed'>('all');

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [dryRun, setDryRun] = useState(true);
  const [draftCampaigns, setDraftCampaigns] = useState<{ id: string; name: string; status: string }[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(new Set());
  const [queueing, setQueueing] = useState(false);

  const loadOsStatus = useCallback(async () => {
    const res = await fetch('/api/admin/bell24h-os/test-ai', { credentials: 'include' });
    const json = await res.json();
    const aiReady = json.status === 'READY';
    setOsCaps([
      {
        name: 'AI Routing',
        status: aiReady ? 'READY' : 'NOT_CONFIGURED',
        detail: aiReady ? 'POST /api/v1/ai/text' : json.missing?.join(', ') || 'Env not set',
      },
      {
        name: 'Job Runtime',
        status: 'PARTIAL',
        detail: 'VyaparSethu crons + n8n; OS JobOrchestrator not wired',
      },
      {
        name: 'Communication Hub',
        status: 'MISSING',
        detail: 'Contract-defined; not implemented in Bell24h-OS',
      },
      {
        name: 'Agent Runtime',
        status: 'MISSING',
        detail: 'AgentService stub in Bell24h-OS',
      },
    ]);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (claimedFilter === 'claimed') params.set('claimed', 'true');
      if (claimedFilter === 'unclaimed') params.set('claimed', 'false');

      const [discRes, campRes] = await Promise.all([
        fetch(`/api/admin/discovery?${params}`, { credentials: 'include' }).then((r) => r.json()),
        loadOsStatus(),
        fetch('/api/admin/outreach-campaigns', { credentials: 'include' }).then((r) => r.json()),
      ]);

      if (campRes.success && Array.isArray(campRes.campaigns)) {
        setDraftCampaigns(
          campRes.campaigns
            .filter((c: { status: string }) => c.status === 'DRAFT')
            .map((c: { id: string; name: string; status: string }) => ({ id: c.id, name: c.name, status: c.status })),
        );
      }

      if (!discRes.success) throw new Error(discRes.error || 'Failed to load discovery data');

      setCompanies(discRes.companies ?? []);
      setReadiness(discRes.readiness ?? []);
      setReadinessScore(discRes.stats?.readinessScore ?? 0);
      setStats({
        total: discRes.stats?.total ?? 0,
        claimed: discRes.stats?.claimed ?? 0,
        unclaimed: discRes.stats?.unclaimed ?? 0,
      });
      setRecentEvents(discRes.recentEvents ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [claimedFilter, loadOsStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const runDiscovery = async () => {
    setRunning(true);
    setRunResult(null);
    setError('');
    try {
      const body: Record<string, unknown> = { dryRun };
      if (query.trim()) body.query = query.trim();
      else if (category.trim() && city.trim()) {
        body.category = category.trim();
        body.city = city.trim();
      } else {
        throw new Error('Enter a search query or category + city');
      }
      if (selectedCampaignId && !dryRun) body.campaignId = selectedCampaignId;

      const res = await fetch('/api/admin/discovery', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Discovery run failed');
      setRunResult(json.message);
      if (!dryRun) await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Run failed');
    } finally {
      setRunning(false);
    }
  };

  const toggleCompany = (id: string) => {
    setSelectedCompanyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const queueToCampaign = async () => {
    if (!selectedCampaignId || selectedCompanyIds.size === 0) return;
    setQueueing(true);
    setError('');
    try {
      const res = await fetch('/api/admin/discovery/queue-campaign', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: selectedCampaignId,
          companyIds: [...selectedCompanyIds],
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Queue failed');
      setRunResult(json.message);
      setSelectedCompanyIds(new Set());
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Queue failed');
    } finally {
      setQueueing(false);
    }
  };

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Discovery Engine</h1>
          <p className="text-slate-400 text-sm mt-1">
            Public-web supplier discovery · unclaimed profiles · invitation pipeline
          </p>
          <div className="flex flex-wrap gap-3 mt-2 text-xs">
            <Link href="/admin/discovery/command-center" className="text-indigo-400 hover:underline">Command Center →</Link>
            <Link href="/admin/discovery/intelligence" className="text-indigo-400 hover:underline">Intelligence →</Link>
            <Link href="/admin/discovery/invitation" className="text-indigo-400 hover:underline">Invitation Engine →</Link>
            <Link href="/admin/discovery/insights" className="text-indigo-400 hover:underline">CRM Insights →</Link>
            <Link href="/admin/discovery/trust" className="text-indigo-400 hover:underline">Trust Engine →</Link>
            <Link href="/admin/discovery/health" className="text-indigo-400 hover:underline">Health →</Link>
            <Link href="/admin/discovery/readiness" className="text-indigo-400 hover:underline">Readiness →</Link>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      {runResult && (
        <div className="bg-green-900/30 border border-green-700/50 text-green-300 text-sm rounded-xl px-4 py-3">
          {runResult}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Discovered', value: stats.total },
          { label: 'Claimed', value: stats.claimed },
          { label: 'Unclaimed', value: stats.unclaimed },
          { label: 'Readiness', value: `${readinessScore}%` },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <p className="text-slate-500 text-xs uppercase">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Readiness board */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Discovery Readiness Board
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {readiness.map((item) => (
            <div key={item.id} className="border border-slate-700/40 rounded-lg p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-white text-sm font-medium">{item.label}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_STYLES[item.status]}`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">{item.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bell24h-OS status */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Bell24h-OS Status (read-only)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {osCaps.map((cap) => (
            <div key={cap.name} className="flex justify-between items-start border-b border-slate-700/30 pb-2">
              <div>
                <p className="text-slate-300 text-sm">{cap.name}</p>
                {cap.detail && <p className="text-slate-600 text-xs mt-0.5">{cap.detail}</p>}
              </div>
              <span
                className={`text-xs font-semibold shrink-0 ${
                  cap.status === 'READY'
                    ? 'text-green-400'
                    : cap.status === 'PARTIAL'
                      ? 'text-amber-400'
                      : 'text-red-400'
                }`}
              >
                {cap.status}
              </span>
            </div>
          ))}
        </div>
        <Link href="/admin/cockpit/bell24h-os" className="text-indigo-400 hover:underline text-xs mt-3 inline-block">
          Full OS integration panel →
        </Link>
      </div>

      {/* Run discovery */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Run Discovery (public web only)
        </h2>
        <p className="text-slate-500 text-xs mb-4">
          Uses ScrapeGraph + Google search. IndiaMART, TradeIndia, and Alibaba are blocked.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input
            type="text"
            placeholder="Search query (optional)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {draftCampaigns.length > 0 && (
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="">Queue to campaign (optional)</option>
              {draftCampaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          <label className="flex items-center gap-2 text-slate-400 text-sm">
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
            Dry run (preview only)
          </label>
          <button
            type="button"
            onClick={runDiscovery}
            disabled={running}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            <Search className="w-4 h-4" />
            {running ? 'Running…' : dryRun ? 'Preview discovery' : 'Import suppliers'}
          </button>
          <Link href="/admin/company-claim-outreach" className="text-indigo-400 hover:underline text-sm">
            Outreach campaigns →
          </Link>
        </div>
      </div>

      {/* Companies table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Discovered Companies
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {selectedCompanyIds.size > 0 && selectedCampaignId && (
              <button
                type="button"
                onClick={queueToCampaign}
                disabled={queueing}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-1 rounded"
              >
                {queueing ? 'Queueing…' : `Queue ${selectedCompanyIds.size} to campaign`}
              </button>
            )}
          <div className="flex gap-2 text-xs">
            {(['all', 'unclaimed', 'claimed'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setClaimedFilter(f)}
                className={`px-2 py-1 rounded ${
                  claimedFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          </div>
        </div>
        {loading ? (
          <p className="text-slate-500 text-sm">Loading…</p>
        ) : companies.length === 0 ? (
          <p className="text-slate-500 text-sm">No discovered suppliers yet. Run discovery or import via CSV.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-slate-700/50">
                <th className="py-2 pr-2 w-8">
                  <input
                    type="checkbox"
                    checked={companies.length > 0 && selectedCompanyIds.size === companies.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedCompanyIds(new Set(companies.map((c) => c.id)));
                      else setSelectedCompanyIds(new Set());
                    }}
                    title="Select all"
                  />
                </th>
                <th className="py-2 pr-3">Company</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3">Trust</th>
                <th className="py-2 pr-3">Invitation</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">CRM</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-slate-700/20 text-slate-300">
                  <td className="py-2 pr-2">
                    <input
                      type="checkbox"
                      checked={selectedCompanyIds.has(c.id)}
                      onChange={() => toggleCompany(c.id)}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <div className="font-medium text-white">{c.company || '—'}</div>
                    <div className="text-slate-500 text-xs">{c.location || '—'}</div>
                  </td>
                  <td className="py-2 pr-3">{c.category}</td>
                  <td className="py-2 pr-3 text-xs text-slate-500 max-w-[120px] truncate">
                    {c.importedFrom?.replace('discovery:', '') || '—'}
                  </td>
                  <td className="py-2 pr-3">{c.trustScore}</td>
                  <td className={`py-2 pr-3 text-xs capitalize ${INVITE_STYLES[c.invitationStatus] || 'text-slate-400'}`}>
                    {c.invitationStatus}
                    {c.campaign && (
                      <span className="block text-slate-600">{c.campaign.name}</span>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {c.isClaimed ? (
                      <span className="text-green-400 text-xs">Claimed</span>
                    ) : (
                      <span className="text-amber-400 text-xs">Unclaimed</span>
                    )}
                  </td>
                  <td className="py-2">
                    <Link
                      href={`/admin/crm/${c.id}`}
                      className="inline-flex items-center gap-1 text-indigo-400 hover:underline text-xs"
                    >
                      Journey <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent discovery events */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Recent Discovery Events
        </h2>
        {recentEvents.length === 0 ? (
          <p className="text-slate-500 text-sm">No discovery events logged yet.</p>
        ) : (
          <ul className="space-y-1 text-xs max-h-48 overflow-y-auto">
            {recentEvents.map((e) => (
              <li key={e.id} className="flex justify-between text-slate-400 border-b border-slate-700/20 py-1">
                <span>
                  <span className="text-indigo-400">{e.actionType}</span>
                  {e.userId && <span className="text-slate-600 ml-2">user:{e.userId.slice(-8)}</span>}
                </span>
                <span className="text-slate-600">{new Date(e.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-slate-600 text-xs">
        CRM timeline: <code className="text-slate-400">GET /api/admin/crm/[userId]/timeline</code>. Outreach:{' '}
        <Link href="/admin/company-claim-outreach" className="text-indigo-400 hover:underline">
          claim campaigns
        </Link>
        . Import CSV:{' '}
        <Link href="/admin/import" className="text-indigo-400 hover:underline">
          Import Suppliers
        </Link>
        .
      </p>
    </div>
  );
}
