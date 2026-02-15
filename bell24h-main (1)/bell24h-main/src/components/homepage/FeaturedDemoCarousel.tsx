'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Mic, Video, FileText } from 'lucide-react';
import Link from 'next/link';
import { ALL_MOCK_RFQS, getMockRFQsByType } from '@/data/mockRFQs';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';

export default function FeaturedDemoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedType, setSelectedType] = useState<'all' | 'voice' | 'video' | 'text'>('all');

  // Get featured RFQs based on type
  const getFeaturedRFQs = () => {
    if (selectedType === 'all') {
      return ALL_MOCK_RFQS.slice(0, 10);
    }
    return getMockRFQsByType(selectedType).slice(0, 10);
  };

  const featuredRFQs = getFeaturedRFQs();
  const currentRFQ = featuredRFQs[currentIndex];

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (featuredRFQs.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredRFQs.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredRFQs.length]);

  const nextDemo = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredRFQs.length);
  };

  const prevDemo = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredRFQs.length) % featuredRFQs.length);
  };

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

  if (!currentRFQ) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Featured Demo RFQs
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how Bell24h handles different RFQ types with real examples
          </p>
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {(['all', 'voice', 'video', 'text'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
                setCurrentIndex(0);
              }}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedType === type
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {type === 'all' ? 'All Types' : (
                <span className="flex items-center gap-2">
                  {getTypeIcon(type)}
                  {type[0].toUpperCase() + type.slice(1)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={prevDemo}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition"
              aria-label="Previous demo"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={nextDemo}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition"
              aria-label="Next demo"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>

            {/* Demo Card */}
            <div className="p-8 md:p-12">
              {/* RFQ Type Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 border ${getTypeColor(currentRFQ.type)}`}>
                {getTypeIcon(currentRFQ.type)}
                {currentRFQ.type[0].toUpperCase() + currentRFQ.type.slice(1)} RFQ
              </div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {currentRFQ.title}
              </h3>

              {/* Media Player */}
              {currentRFQ.type === 'voice' && (
                <div className="mb-6">
                  <AudioPlayer
                    src={`/api/demo/audio/${currentRFQ.id}`}
                    title={currentRFQ.title}
                  />
                </div>
              )}

              {currentRFQ.type === 'video' && (
                <div className="mb-6">
                  <VideoPlayer
                    src={`/api/demo/video/${currentRFQ.id}`}
                    title={currentRFQ.title}
                  />
                </div>
              )}

              {/* Description */}
              <p className="text-gray-600 mb-6 text-lg">{currentRFQ.description}</p>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-semibold text-gray-900">{currentRFQ.location}</div>
                </div>
                {currentRFQ.quantity && (
                  <div>
                    <div className="text-sm text-gray-500">Quantity</div>
                    <div className="font-semibold text-gray-900">{currentRFQ.quantity}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">Quotes Received</div>
                  <div className="font-semibold text-blue-600">{currentRFQ.quotesCount} quotes</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="font-semibold text-gray-900">{currentRFQ.category}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/rfq/${currentRFQ.id}`}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  View Full RFQ
                </Link>
                <Link
                  href={`/rfq/create?type=${currentRFQ.type}`}
                  className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Try {currentRFQ.type[0].toUpperCase() + currentRFQ.type.slice(1)} RFQ
                </Link>
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 pb-6">
              {featuredRFQs.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition ${
                    idx === currentIndex ? 'bg-blue-600 w-8' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to demo ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Carousel Info */}
        <div className="text-center mt-6 text-gray-600">
          Showing {currentIndex + 1} of {featuredRFQs.length} featured demos
        </div>
      </div>
    </section>
  );
}

