'use client';

import { useState } from 'react';
import { Mic, Play, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getMockRFQsByType } from '@/data/mockRFQs';
import AudioPlayer from '@/components/homepage/AudioPlayer';

export default function VoiceRFQDemoPage() {
  const voiceRFQs = getMockRFQsByType('voice');

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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mic className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900">Voice RFQ Demos</h1>
              <p className="text-gray-600 mt-2">
                {voiceRFQs.length} voice RFQ examples with audio playback and AI transcription
              </p>
            </div>
          </div>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {voiceRFQs.map((rfq) => (
            <div
              key={rfq.id}
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:border-blue-500 transition"
            >
              <div className="flex items-center gap-2 mb-4">
                <Mic className="w-5 h-5 text-blue-600" />
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  Voice RFQ
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">{rfq.title}</h3>
              <p className="text-gray-600 mb-4">{rfq.description}</p>

              {/* Audio Player */}
              <div className="mb-4">
                <AudioPlayer
                  src={`/api/demo/audio/${rfq.id}`}
                  title={rfq.title}
                />
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4 text-sm">
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
                  href="/rfq/create?type=voice"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition text-sm"
                >
                  Try Voice RFQ
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/rfq/create?type=voice"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-xl hover:bg-blue-700 transition"
          >
            <Mic className="w-5 h-5" />
            Create Your Own Voice RFQ
          </Link>
        </div>
      </div>
    </main>
  );
}

