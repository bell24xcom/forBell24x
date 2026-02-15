'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Mic, Video, FileText, Play } from 'lucide-react';
import Link from 'next/link';
import { ALL_MOCK_RFQS, type MockRFQ } from '@/data/mockRFQs';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';

export default function FeaturedDemoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Get featured RFQs (mix of all types)
  const featuredRFQs = ALL_MOCK_RFQS.slice(0, 6);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredRFQs.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredRFQs.length]);

  const currentRFQ = featuredRFQs[currentIndex];

  const getRFQType = (rfq: MockRFQ) => {
    // Use rfqType if available, otherwise fall back to type
    return rfq.rfqType === 'standard' ? 'text' : (rfq.rfqType || rfq.type || 'text');
  };

  const getTypeIcon = (rfq: MockRFQ) => {
    const type = getRFQType(rfq);
    switch (type) {
      case 'voice':
        return <Mic className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (rfq: MockRFQ) => {
    const type = getRFQType(rfq);
    switch (type) {
      case 'voice':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'video':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + featuredRFQs.length) % featuredRFQs.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % featuredRFQs.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <section className="py-16 bg-[#0a1128]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-white mb-4">
            Featured Demo RFQs
          </h2>
          <p className="text-gray-400 text-lg">
            Explore our platform with real examples
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Carousel Container */}
          <div className="relative bg-gray-900/80 backdrop-blur border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 dark:bg-slate-700/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-600 transition-all hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 dark:bg-slate-700/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-600 transition-all hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Slide Content */}
            <div className="p-8 md:p-12">
              {/* Slide Counter */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  {currentRFQ && getTypeIcon(currentRFQ)}
                  {currentRFQ && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getTypeColor(currentRFQ)}`}>
                      {getRFQType(currentRFQ).toUpperCase()} RFQ
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentIndex + 1} / {featuredRFQs.length}
                </span>
              </div>

              {/* RFQ Title */}
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {currentRFQ?.title || 'Sample RFQ'}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                {currentRFQ?.description || 'Sample description'}
              </p>

              {/* Media Player */}
              {currentRFQ && getRFQType(currentRFQ) === 'voice' && (
                <div className="mb-6">
                  <AudioPlayer
                    src={`/api/demo/audio/${currentRFQ.id}`}
                    title={currentRFQ.title}
                  />
                </div>
              )}

              {currentRFQ && getRFQType(currentRFQ) === 'video' && (
                <div className="mb-6">
                  <VideoPlayer
                    src={`/api/demo/video/${currentRFQ.id}`}
                    title={currentRFQ.title}
                  />
                </div>
              )}

              {/* RFQ Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{currentRFQ?.category || 'General'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{currentRFQ?.location || 'India'}</p>
                </div>
                {currentRFQ?.quantity && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{currentRFQ.quantity}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Quotes</p>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">{currentRFQ?.quotesCount || 0} received</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Link
                  href={`/rfq/${currentRFQ?.id}`}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-center"
                >
                  View Full RFQ
                </Link>
                <Link
                  href={`/rfq/create?type=${currentRFQ ? getRFQType(currentRFQ) : 'text'}`}
                  className="px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                >
                  Try {currentRFQ ? getRFQType(currentRFQ).toUpperCase() : 'TEXT'} RFQ
                </Link>
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 pb-6">
              {featuredRFQs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-blue-600 w-8'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

