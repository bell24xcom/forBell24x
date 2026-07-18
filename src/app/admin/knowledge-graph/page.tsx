'use client';

import { useCallback, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { FLAGS } from '@/src/lib/feature-flags';

interface GraphStats {
  products: number;
  industries: number;
  clusters: number;
  geographicNodes: number;
  totalNodes: number;
  totalEdges: number;
  avgProductCompleteness: number;
  avgIndustryCompleteness: number;
}

const ROOT_OPTIONS = [
  { type: 'product', slug: 'fabric-sample-books', label: 'Fabric Sample Books' },
  { type: 'industry', slug: 'fabric-sampling-industry', label: 'Fabric Sampling Industry' },
  { type: 'cluster', slug: 'bhiwandi-textile-cluster', label: 'Bhiwandi Textile Cluster' },
];

export default function KnowledgeGraphAdminPage() {
  if (!FLAGS.INTELLIGENCE_ENABLED) {
    notFound();
  }

  const [stats, setStats] = useState<GraphStats | null>(null);
  const [graphMeta, setGraphMeta] = useState<{ nodeCount: number; edgeCount: number; rootId: string } | null>(null);
  const [nodes, setNodes] = useState<{ id: string; label: string; type: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    const res = await fetch('/api/admin/knowledge-graph', { credentials: 'include' });
    const json = await res.json();
    if (json.success) setStats(json.stats);
  }, []);

  const loadGraph = async (type: string, slug: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/knowledge-graph?type=${type}&slug=${slug}`, { credentials: 'include' });
    const json = await res.json();
    if (json.success && json.graph) {
      setGraphMeta(json.graph.meta);
      setNodes(json.graph.nodes.slice(0, 40));
    }
    setLoading(false);
  };

  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Business Knowledge Graph</h1>
        <p className="text-slate-400 text-sm mt-1">Unified Company → Product → Industry → Cluster → Geography graph (AI-ready, no LLM)</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['Products', stats.products],
            ['Industries', stats.industries],
            ['Clusters', stats.clusters],
            ['Geo nodes', stats.geographicNodes],
            ['Product DNA avg', `${stats.avgProductCompleteness}%`],
            ['Industry DNA avg', `${stats.avgIndustryCompleteness}%`],
          ].map(([label, val]) => (
            <div key={String(label)} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-500 text-xs">{label}</p>
              <p className="text-white text-xl font-bold">{val}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {ROOT_OPTIONS.map(o => (
          <button
            key={o.slug}
            type="button"
            onClick={() => loadGraph(o.type, o.slug)}
            className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
          >
            Explore: {o.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-slate-500 text-sm">Building graph…</p>}

      {graphMeta && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
          <p className="text-white font-medium text-sm mb-2">
            Graph root: {graphMeta.rootId} — {graphMeta.nodeCount} nodes, {graphMeta.edgeCount} edges
          </p>
          <ul className="grid sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
            {nodes.map(n => (
              <li key={n.id} className="text-xs px-3 py-2 bg-slate-900/50 rounded border border-slate-700/40">
                <span className="text-cyan-400">{n.type}</span>
                <span className="text-slate-300 ml-2">{n.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
