'use client';

import { useState, useEffect } from 'react';
import { Mic, Video, FileText, MapPin, Clock, MessageCircle } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';
import { ALL_MOCK_RFQS, type MockRFQ } from '@/data/mockRFQs';

type RFQFilter = 'all' | 'standard' | 'voice' | 'video';

export default function LiveRFQFeed() {
  const [filter, setFilter] = useState<RFQFilter>('all');
  const [displayedRFQs, setDisplayedRFQs] = useState<MockRFQ[]>(ALL_MOCK_RFQS.slice(0, 10));

  const filteredRFQs = displayedRFQs.filter(rfq => {
    if (filter === 'all') return true;
    return rfq.rfqType === filter;
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Live RFQs</h2>
          <p className="text-sm text-gray-400 mt-1">
            All Types • Real-time updates
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('standard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'standard' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            Text
          </button>
          <button
            onClick={() => setFilter('voice')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'voice' 
                ? 'bg-cyan-600 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Mic className="w-4 h-4" />
            Voice
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'video' 
                ? 'bg-cyan-600 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Video className="w-4 h-4" />
            Video
          </button>
        </div>
      </div>

      {/* RFQ Cards */}
      <div className="space-y-4">
        {filteredRFQs.map((rfq) => (
          <div 
            key={rfq.id} 
            className="bg-gray-900/80 backdrop-blur border border-white/10 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            {/* Type Badge */}
            <div className="flex items-center gap-2 mb-3">
              {rfq.rfqType === 'voice' && (
                <span className="flex items-center gap-1 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium">
                  <Mic className="w-4 h-4" />
                  Voice RFQ
                </span>
              )}
              {rfq.rfqType === 'video' && (
                <span className="flex items-center gap-1 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium">
                  <Video className="w-4 h-4" />
                  Video RFQ
                </span>
              )}
              {rfq.rfqType === 'standard' && (
                <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  Text RFQ
                </span>
              )}
              {rfq.urgency === 'Urgent' && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                  Urgent
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {rfq.title}
            </h3>
            
            {/* Media Players */}
            {rfq.rfqType === 'voice' && rfq.audioUrl && (
              <div className="mb-4">
                <AudioPlayer audioUrl={rfq.audioUrl} />
                {rfq.transcription && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                    &quot;{rfq.transcription}&quot;
                  </p>
                )}
                {rfq.aiAnalysis && (
                  <div className="mt-2 p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded text-xs">
                    <span className="font-medium">AI Analysis:</span> {rfq.aiAnalysis}
                  </div>
                )}
              </div>
            )}
            
            {rfq.rfqType === 'video' && rfq.videoUrl && (
              <div className="mb-4">
                <VideoPlayer videoUrl={rfq.videoUrl} />
                {rfq.transcription && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                    &quot;{rfq.transcription}&quot;
                  </p>
                )}
                {rfq.aiAnalysis && (
                  <div className="mt-2 p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded text-xs">
                    <span className="font-medium">AI Analysis:</span> {rfq.aiAnalysis}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {rfq.description}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-500 text-xs mb-1">Quantity</p>
                <p className="font-medium text-gray-900 dark:text-white">{rfq.quantity}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-500 text-xs mb-1">Budget</p>
                <p className="font-medium text-green-600 dark:text-green-400">{rfq.budget}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-500 text-xs mb-1">Location</p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {rfq.location}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-500 text-xs mb-1">Timeline</p>
                <p className="font-medium text-gray-900 dark:text-white">{rfq.timeline}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTimeAgo(rfq.postedDate)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {rfq.responses || 0} responses
                </span>
              </div>
              <div className="flex gap-3">
                <a 
                  href={`/rfq/${rfq.id}`}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  View Details
                </a>
                <a 
                  href={`/rfq/${rfq.id}#quote`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Quick Quote
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          setDisplayedRFQs(ALL_MOCK_RFQS.slice(0, displayedRFQs.length + 10));
        }}
        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        Load More RFQs
      </button>
    </div>
  );
}

