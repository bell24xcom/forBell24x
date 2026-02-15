'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Mic, Video, FileText, MessageCircle, Eye } from 'lucide-react';
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
    t === 'voice' ? 'bg-blue-100 text-blue-700' : t === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700';

  return (
    <div className="bg-white border rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live RFQs
          </h2>
          <Link href="/rfq" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
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
                  ? t === 'all' ? 'bg-gray-900 text-white' : getTypeColor(t) + ' border-2'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
      <div className="divide-y">
        {filteredRFQs.slice(0, 6).map((rfq) => (
          <Link
            key={rfq.id}
            href={`/rfq/${rfq.id}`}
            className="block p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-start gap-3">
              <div className={`${getTypeColor(rfq.type)} p-2 rounded-lg`}>
                {getTypeIcon(rfq.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{rfq.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{rfq.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
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
        <div className="p-4 border-t text-center">
          <Link
            href="/rfq"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Load More RFQs →
          </Link>
        </div>
      )}
    </div>
  );
}

