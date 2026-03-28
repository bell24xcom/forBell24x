'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Video, FileText, MapPin } from 'lucide-react';

interface DemoRFQ {
  id: string;
  title: string;
  category: string;
  type: string;
  location?: string;
  quotesCount?: number;
  description?: string;
}

export default function DemoRFQsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'VOICE' | 'VIDEO' | 'TEXT'>('all');
  const [rfqs, setRfqs] = useState<DemoRFQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = filter === 'all'
      ? '/api/marketplace/rfqs?limit=20'
      : `/api/marketplace/rfqs?limit=20&type=${filter}`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.rfqs) setRfqs(d.rfqs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const typeColor: Record<string, string> = {
    VOICE: 'bg-purple-900/50 text-purple-300 border-purple-700/50',
    VIDEO: 'bg-rose-900/50 text-rose-300 border-rose-700/50',
    TEXT: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
  };

  const typeIcon = (t: string) =>
    t === 'VOICE' ? <Mic className="w-3 h-3" /> :
    t === 'VIDEO' ? <Video className="w-3 h-3" /> :
    <FileText className="w-3 h-3" />;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-900/40 border border-indigo-700/50 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-4">
            🎯 Live Examples
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Featured Demo RFQs</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            See how Bell24h handles real procurement requests across Voice, Video, and Text formats.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Text RFQ Demos', count: '~800', color: 'text-blue-400' },
            { label: 'Voice RFQ Demos', count: '~300', color: 'text-purple-400' },
            { label: 'Video RFQ Demos', count: '~150', color: 'text-rose-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-slate-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex bg-slate-900/60 rounded-xl p-1 mb-8 max-w-md mx-auto">
          {(['all', 'VOICE', 'VIDEO', 'TEXT'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All Types' :
               tab === 'VOICE' ? '🎤 Voice' :
               tab === 'VIDEO' ? '📹 Video' : '📝 Text'}
            </button>
          ))}
        </div>

        {/* RFQ Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-slate-700 rounded mb-3 w-3/4" />
                <div className="h-3 bg-slate-700/60 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : rfqs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rfqs.map(rfq => (
              <div
                key={rfq.id}
                className="bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-indigo-500/40 rounded-xl p-5 transition-all cursor-pointer group"
                onClick={() => router.push(`/rfq/${rfq.id}`)}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 flex items-center gap-1 border ${typeColor[rfq.type] || 'bg-slate-700/50 text-slate-300 border-slate-600/50'}`}>
                    {typeIcon(rfq.type)} {rfq.type}
                  </span>
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {rfq.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="bg-slate-700/60 px-2 py-0.5 rounded">{rfq.category}</span>
                  {rfq.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{rfq.location}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{rfq.quotesCount || 0} quotes received</span>
                  <span className="text-indigo-400 text-xs group-hover:text-indigo-300">View Full RFQ →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 mb-4">No RFQs available yet.</p>
            <Link href="/rfq/create" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2 transition-colors">
              Post the First RFQ →
            </Link>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-4">Ready to post your own RFQ?</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/voice-rfq" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors min-h-[44px] flex items-center gap-2">
              🎤 Try Voice RFQ
            </Link>
            <Link href="/video-rfq" className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors min-h-[44px] flex items-center gap-2">
              📹 Try Video RFQ
            </Link>
            <Link href="/rfq/create" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors min-h-[44px] flex items-center gap-2">
              📝 Try Text RFQ
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
