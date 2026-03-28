'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Mic, Video, FileText, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { ALL_MOCK_RFQS, type MockRFQ } from '@/data/mockRFQs';

export default function LiveRFQFeedCompact() {
  const [rfqs, setRfqs] = useState<MockRFQ[]>([]);
  const [filter, setFilter] = useState<'all' | 'voice' | 'video' | 'text'>('all');

  useEffect(() => {
    const recentRFQs = ALL_MOCK_RFQS.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime()).slice(0, 10);
    setRfqs(recentRFQs);
  }, []);

  const filteredRFQs = filter === 'all' ? rfqs : rfqs.filter(rfq => rfq.type === filter);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getTypeIcon = (t: 'voice' | 'video' | 'text') =>
    t === 'voice' ? <Mic className="w-4 h-4" /> : t === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />;

  const getTypeColor = (t: 'voice' | 'video' | 'text') =>
    t === 'voice' ? 'bg-blue-900/30 text-blue-300' : t === 'video' ? 'bg-purple-900/30 text-purple-300' : 'bg-green-900/30 text-green-300';

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg flex items-center gap-2 text-white">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live RFQs
          </h2>
          <Link href="/rfq" className="text-sm text-blue-400 hover:text-blue-300 font-medium">
            View All →
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'voice', 'video', 'text'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filter === t
                  ? t === 'all' ? 'bg-slate-200 text-slate-900' : getTypeColor(t) + ' border-2 border-current'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              {t === 'all' ? 'All' : (
                <span className="flex items-center gap-1">
                  {getTypeIcon(t)}
                  {t[0].toUpperCase() + t.slice(1)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* RFQ List */}
      <div className="divide-y divide-slate-700/50">
        {filteredRFQs.slice(0, 6).map((rfq) => (
          <Link
            key={rfq.id}
            href={rfq.id.startsWith('rfq-') ? `/marketplace` : `/rfq/${rfq.id}`}
            className="block p-4 hover:bg-slate-700/30 transition"
          >
            <div className="flex items-start gap-3">
              <div className={`${getTypeColor(rfq.type)} p-2 rounded-lg flex-shrink-0`}>
                {getTypeIcon(rfq.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1 truncate">{rfq.title}</h3>
                <p className="text-sm text-slate-400 mb-2 line-clamp-2">{rfq.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {rfq.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeAgo(rfq.postedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {rfq.quotesCount} quotes
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More */}
      {filteredRFQs.length > 6 && (
        <div className="p-4 border-t border-slate-700/50 text-center">
          <Link href="/rfq" className="text-sm text-blue-400 hover:text-blue-300 font-medium">
            Load More RFQs →
          </Link>
        </div>
      )}
    </div>
  );
}
