"use client";

import { useState, useEffect } from 'react';
import { Clock, MapPin, TrendingUp, Mic, Video, FileText, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { ALL_MOCK_RFQS, type MockRFQ } from '@/data/mockRFQs';

export default function LiveRFQFeed() {
  const [rfqs, setRfqs] = useState<MockRFQ[]>([]);
  const [filter, setFilter] = useState<'all' | 'voice' | 'video' | 'text'>('all');

  useEffect(() => {
    const recentRFQs = ALL_MOCK_RFQS.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime()).slice(0, 6);
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

  const getTypeIcon = (t: 'voice' | 'video' | 'text') => t === 'voice' ? <Mic className="w-5 h-5" /> : t === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />;
  const getTypeColor = (t: 'voice' | 'video' | 'text') => t === 'voice' ? 'bg-blue-100 text-blue-700 border-blue-200' : t === 'video' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-green-100 text-green-700 border-green-200';

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-6">
            <TrendingUp className="w-4 h-4" />
            Live RFQs
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">Latest Opportunities</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">Real-time RFQs from buyers across India. Respond fast, win business.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {(['all','voice','video','text'] as const).map((t) => (
            <button key={t} onClick={() => setFilter(t)} className={`px-8 py-4 rounded-xl font-bold transition-all text-lg ${
              filter === t ? (t==='all' ? 'bg-gray-900 text-white shadow-lg scale-105' : t==='voice' ? 'bg-blue-600 text-white shadow-lg scale-105' : t==='video' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-green-600 text-white shadow-lg scale-105') : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
            }`}>
              {t === 'all' ? 'All RFQs' : <span className="flex items-center gap-2">{getTypeIcon(t)} {t[0].toUpperCase()+t.slice(1)}</span>}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredRFQs.map((rfq) => (
            <div key={rfq.id} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 ${getTypeColor(rfq.type)}`}>
                  {getTypeIcon(rfq.type)}
                  {rfq.type.charAt(0).toUpperCase()+rfq.type.slice(1)}
                </div>
                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">Active</div>
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">{rfq.title}</h3>
              <p className="text-gray-600 mb-6 line-clamp-3">{rfq.description}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold mb-6">{rfq.category}</div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-600"><MapPin className="w-5 h-5 text-gray-400" /><span className="font-medium">{rfq.location}</span></div>
                <div className="flex items-center gap-3 text-gray-500"><Clock className="w-5 h-5 text-gray-400" /><span>{getTimeAgo(rfq.postedAt)}</span></div>
              </div>
              <div className="flex justify-between items-center pt-6 border-t-2 border-gray-100">
                <div className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-blue-600" /><span className="font-bold text-blue-600">{rfq.quotesCount} {rfq.quotesCount===1?'Quote':'Quotes'}</span></div>
                <Link href={`/rfq/${rfq.id}`} className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">View Details →</Link>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mb-20">
          <Link href="/rfqs" className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-xl font-bold shadow-xl hover:bg-blue-700 hover:shadow-2xl transform hover:scale-105 transition-all text-lg">
            View All RFQs
            <TrendingUp className="w-6 h-6" />
          </Link>
          <p className="text-gray-500 mt-6 text-lg">New RFQs posted every minute • Be the first to respond</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-8 bg-blue-50 rounded-2xl"><div className="text-5xl font-black text-blue-600 mb-3">2,500+</div><div className="text-gray-600 font-semibold">RFQs Posted Today</div></div>
          <div className="text-center p-8 bg-green-50 rounded-2xl"><div className="text-5xl font-black text-green-600 mb-3">15k+</div><div className="text-gray-600 font-semibold">Active Suppliers</div></div>
          <div className="text-center p-8 bg-purple-50 rounded-2xl"><div className="text-5xl font-black text-purple-600 mb-3">98%</div><div className="text-gray-600 font-semibold">Response Rate</div></div>
          <div className="text-center p-8 bg-orange-50 rounded-2xl"><div className="text-5xl font-black text-orange-600 mb-3">&lt;2min</div><div className="text-gray-600 font-semibold">Avg First Quote</div></div>
        </div>
      </div>
    </section>
  );
}
