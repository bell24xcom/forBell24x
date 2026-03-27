'use client';

import { useState } from 'react';
import { Mic, Video, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ALL_MOCK_RFQS, getMockRFQsByType } from '@/data/mockRFQs';
import AudioPlayer from '@/components/homepage/AudioPlayer';
import VideoPlayer from '@/components/homepage/VideoPlayer';

export default function AllRFQDemoPage() {
  const [filter, setFilter] = useState<'all' | 'voice' | 'video' | 'text'>('all');

  const getFilteredRFQs = () => {
    if (filter === 'all') return ALL_MOCK_RFQS;
    return getMockRFQsByType(filter);
  };

  const filteredRFQs = getFilteredRFQs();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return <Mic className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'voice':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'video':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mb-2">All RFQ Demos</h1>
          <p className="text-gray-600">
            Explore {ALL_MOCK_RFQS.length} demo RFQs across all types: Voice, Video, and Text
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {(['all', 'voice', 'video', 'text'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === type
                  ? type === 'all'
                    ? 'bg-gray-900 text-white'
                    : type === 'voice'
                    ? 'bg-blue-600 text-white'
                    : type === 'video'
                    ? 'bg-purple-600 text-white'
                    : 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
              }`}
            >
              {type === 'all' ? (
                'All Types'
              ) : (
                <span className="flex items-center gap-2">
                  {getTypeIcon(type)}
                  {type[0].toUpperCase() + type.slice(1)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRFQs.map((rfq) => (
            <div
              key={rfq.id}
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:border-blue-500 transition"
            >
              <div className="flex items-center gap-2 mb-4">
                {getTypeIcon(rfq.type)}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getTypeColor(rfq.type)}`}>
                  {rfq.type[0].toUpperCase() + rfq.type.slice(1)} RFQ
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">{rfq.title}</h3>
              <p className="text-gray-600 mb-4">{rfq.description}</p>

              {/* Media Player */}
              {rfq.type === 'voice' && (
                <div className="mb-4">
                  <AudioPlayer
                    src={`/api/demo/audio/${rfq.id}`}
                    title={rfq.title}
                  />
                </div>
              )}

              {rfq.type === 'video' && (
                <div className="mb-4">
                  <VideoPlayer
                    src={`/api/demo/video/${rfq.id}`}
                    title={rfq.title}
                  />
                </div>
              )}

              {/* Details */}
              <div className="space-y-2 mb-4 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-semibold">{rfq.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-semibold">{rfq.location}</span>
                </div>
                {rfq.quantity && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-semibold">{rfq.quantity}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Quotes:</span>
                  <span className="font-semibold text-blue-600">{rfq.quotesCount} received</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/rfq/${rfq.id}`}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-center text-sm"
                >
                  View Details
                </Link>
                <Link
                  href={`/rfq/create?type=${rfq.type}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition text-sm"
                >
                  Try {rfq.type[0].toUpperCase() + rfq.type.slice(1)} RFQ
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/rfq/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-xl hover:bg-blue-700 transition"
          >
            Create Your Own RFQ
          </Link>
        </div>
      </div>
    </main>
  );
}

