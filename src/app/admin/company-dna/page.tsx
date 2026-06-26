'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DNA_LAYERS, type CompanyDnaProfileView, type DnaGraphData, type DnaGraphNode } from '@/lib/company-dna/types';

const DnaForceGraph = dynamic(() => import('@/components/admin/company-dna/DnaForceGraph'), { ssr: false });

interface ProfileListItem {
  userId: string;
  companyName: string;
  completeness: number;
  lastSyncedAt: string;
}

export default function CompanyDnaAdminPage() {
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<CompanyDnaProfileView | null>(null);
  const [graph, setGraph] = useState<DnaGraphData | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [selectedNode, setSelectedNode] = useState<DnaGraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    const res = await fetch('/api/admin/company-dna', { credentials: 'include' });
    const json = await res.json();
    if (json.success) setProfiles(json.profiles ?? []);
  }, []);

  const loadProfile = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, gRes] = await Promise.all([
        fetch(`/api/admin/company-dna?userId=${userId}`, { credentials: 'include' }),
        fetch(`/api/admin/company-dna/graph?userId=${userId}`, { credentials: 'include' }),
      ]);
      const pJson = await pRes.json();
      const gJson = await gRes.json();
      if (!pRes.ok) throw new Error(pJson.error || 'Profile not found');
      if (!gRes.ok) throw new Error(gJson.error || 'Graph not found');
      setProfile(pJson.profile);
      setGraph(gJson.graph);
      setSelectedUserId(userId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
      setProfile(null);
      setGraph(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList().finally(() => setLoading(false));
  }, [loadList]);

  async function syncProfile(userId: string, demo = false) {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/company-dna', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, demo }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Sync failed');
      await loadList();
      await loadProfile(userId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }

  async function seedDemo() {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/company-dna/seed-demo', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Demo seed failed');
      await loadList();
      await loadProfile(json.userId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Demo seed failed');
    } finally {
      setSyncing(false);
    }
  }

  const completenessColor =
    profile && profile.completeness >= 60 ? 'text-emerald-400' : profile && profile.completeness >= 30 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Company DNA Graph</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Business Operating Memory — 15 layers from Identity to AI Memory. Extends{' '}
            <strong className="text-slate-300">Elephant Memory</strong> into full MSME DNA.
            Graph UI inspired by knowledge-graph tools (original VyaparSethu implementation).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={seedDemo}
            disabled={syncing}
            className="px-3 py-2 bg-[#D4AF37] text-[#001f3f] text-xs font-bold rounded-lg disabled:opacity-50"
          >
            Seed Digitex Demo
          </button>
          {selectedUserId && (
            <button
              type="button"
              onClick={() => syncProfile(selectedUserId, false)}
              disabled={syncing}
              className="px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg disabled:opacity-50"
            >
              {syncing ? 'Syncing…' : 'Sync from DB'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 text-red-300 text-sm">{error}</div>
      )}

      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 max-h-[600px] overflow-y-auto">
          <h2 className="text-white text-sm font-semibold mb-3">DNA Profiles</h2>
          {loading && profiles.length === 0 ? (
            <p className="text-slate-500 text-xs">Loading…</p>
          ) : profiles.length === 0 ? (
            <p className="text-slate-500 text-xs">No profiles yet. Click &quot;Seed Digitex Demo&quot; to start.</p>
          ) : (
            <ul className="space-y-2">
              {profiles.map(p => (
                <li key={p.userId}>
                  <button
                    type="button"
                    onClick={() => loadProfile(p.userId)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      selectedUserId === p.userId ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="font-medium truncate">{p.companyName}</p>
                    <p className="opacity-70">{Math.round(p.completeness)}% complete</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {profile && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="DNA completeness" value={`${Math.round(profile.completeness)}%`} valueClass={completenessColor} />
              <Stat label="Timeline events" value={String(profile.timeline.length)} />
              <Stat label="Memory events" value={String(profile.memoryEventCount)} />
              <Stat label="Graph nodes" value={graph ? String(graph.meta.nodeCount) : '—'} />
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${viewMode === '2d' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              2D Graph
            </button>
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${viewMode === '3d' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              3D Layer View
            </button>
          </div>

          {graph ? (
            <DnaForceGraph
              data={graph}
              mode={viewMode}
              selectedId={selectedNode?.id}
              onSelect={setSelectedNode}
            />
          ) : (
            <div className="h-[520px] bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-center justify-center text-slate-500 text-sm">
              Select a profile or seed the Digitex Studio demo to view the DNA graph
            </div>
          )}

          {selectedNode && (
            <div className="bg-slate-800/60 border border-indigo-500/30 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-white font-semibold text-sm">{selectedNode.label}</h3>
                <button type="button" onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white text-lg leading-none">
                  ×
                </button>
              </div>
              <p className="text-slate-500 text-xs mt-1 capitalize">{selectedNode.type} · Layer {selectedNode.layer ?? '—'}</p>
              {selectedNode.summary && <p className="text-slate-300 text-sm mt-2">{selectedNode.summary}</p>}
              {selectedNode.attributes && (
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(selectedNode.attributes).map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-slate-500">{k}</dt>
                      <dd className="text-slate-200">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}
        </div>
      </div>

      {profile && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {DNA_LAYERS.map(layer => {
            const score = profile.layerScores[layer.id] ?? 0;
            return (
              <div key={layer.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: layer.color }} />
                  <p className="text-slate-300 text-[10px] font-medium leading-tight">L{layer.layer} {layer.label}</p>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: layer.color }} />
                </div>
                <p className="text-slate-500 text-[10px] mt-1">{score}%</p>
              </div>
            );
          })}
        </div>
      )}

      {profile && profile.timeline.length > 0 && (
        <section className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Business Timeline (Layer 14)</h2>
          <ol className="relative border-l border-slate-700 ml-2 space-y-4">
            {profile.timeline.map((ev, i) => (
              <li key={i} className="ml-4">
                <span className="absolute -left-1.5 w-3 h-3 bg-indigo-500 rounded-full" />
                <p className="text-indigo-400 text-xs font-bold">{ev.year}</p>
                <p className="text-slate-200 text-sm">{ev.label}</p>
                <p className="text-slate-500 text-xs">{ev.eventType}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, valueClass = 'text-white' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
      <p className="text-slate-500 text-xs">{label}</p>
      <p className={`text-xl font-bold mt-1 ${valueClass}`}>{value}</p>
    </div>
  );
}
