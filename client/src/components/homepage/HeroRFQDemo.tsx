'use client';

import { useState } from 'react';
import { Mic, Video, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';

type RFQType = 'text' | 'voice' | 'video';

export default function HeroRFQDemo() {
  const [activeType, setActiveType] = useState<RFQType>('voice');

  const demoContent = {
    text: {
      title: 'Type Your Requirement',
      description: 'Traditional text-based RFQ with full specifications',
      example: {
        product: 'Industrial LED Bulbs',
        quantity: '10,000 units',
        specs: '9W, Cool White, B22 Base, IP65 rated',
        budget: '₹2L - ₹3L',
        location: 'Bangalore',
      },
    },
    voice: {
      title: 'Speak Your Requirement',
      description: 'Just speak in any language - our AI understands 12 Indian languages',
      audioUrl: '/api/demo/audio/sample-voice-rfq.mp3',
      transcription: 'मुझे 5000 यूनिट स्टील पाइप चाहिए, ग्रेड 304, मुंबई में डिलीवरी',
      translation: 'I need 5000 units of steel pipes, Grade 304, delivery in Mumbai',
      aiAnalysis: {
        product: 'Steel Pipes',
        quantity: '5000 units',
        grade: 'Grade 304',
        location: 'Mumbai',
        language: 'Hindi',
      },
    },
    video: {
      title: 'Show Us via Video',
      description: 'Record or upload a video showing the product you need',
      videoUrl: 'https://res.cloudinary.com/dcwhgtqld/video/upload/v1234567890/demo-rfq-video.mp4',
      aiAnalysis: {
        detectedProduct: 'Industrial Machinery',
        confidence: '94%',
        extractedSpecs: ['Heavy-duty', 'Electric motor', 'Stainless steel'],
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#0a1128]">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-white/5"></div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-cyan-500/20">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400">AI-Powered RFQ System</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 text-white leading-tight">
            Ready to Transform Your Procurement?
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Join thousands of businesses using Bell24H for faster, smarter B2B transactions
          </p>
        </div>

        {/* Type Selector Tabs */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={() => setActiveType('text')}
            className={`flex items-center gap-2 px-8 py-5 rounded-2xl font-bold text-lg transition-all ${
              activeType === 'text'
                ? 'bg-white text-[#0a1128] shadow-2xl scale-105'
                : 'bg-gray-800/50 border-2 border-gray-600 text-white hover:bg-gray-800 backdrop-blur'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Try Text RFQ</span>
          </button>
          <button
            onClick={() => setActiveType('voice')}
            className={`flex items-center gap-2 px-8 py-5 rounded-2xl font-bold text-lg transition-all ${
              activeType === 'voice'
                ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 shadow-2xl scale-105'
                : 'bg-gray-800/50 border-2 border-gray-600 text-white hover:bg-cyan-500/10 backdrop-blur'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span>Try Voice RFQ</span>
          </button>
          <button
            onClick={() => setActiveType('video')}
            className={`flex items-center gap-2 px-8 py-5 rounded-2xl font-bold text-lg transition-all ${
              activeType === 'video'
                ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 shadow-2xl scale-105'
                : 'bg-gray-800/50 border-2 border-gray-600 text-white hover:bg-cyan-500/10 backdrop-blur'
            }`}
          >
            <Video className="w-5 h-5" />
            <span>Try Video RFQ</span>
          </button>
        </div>

        {/* Demo Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/10">
            <h3 className="text-2xl font-bold mb-2 text-white">{demoContent[activeType].title}</h3>
            <p className="text-gray-300 mb-6">{demoContent[activeType].description}</p>

            {/* Text Demo */}
            {activeType === 'text' && (
              <div className="bg-gray-800/50 rounded-lg p-6 space-y-4 border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Product</p>
                    <p className="font-medium text-white">{demoContent.text.example.product}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Quantity</p>
                    <p className="font-medium">{demoContent.text.example.quantity}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-blue-200 mb-1">Specifications</p>
                    <p className="font-medium">{demoContent.text.example.specs}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200 mb-1">Budget</p>
                    <p className="font-medium">{demoContent.text.example.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200 mb-1">Location</p>
                    <p className="font-medium">{demoContent.text.example.location}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Voice Demo */}
            {activeType === 'voice' && (
              <div className="space-y-4">
                <AudioPlayer audioUrl={demoContent.voice.audioUrl} />
                
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-blue-200 mb-1">Original (Hindi)</p>
                  <p className="font-medium mb-3">{demoContent.voice.transcription}</p>
                  <p className="text-sm text-blue-200 mb-1">Translation (English)</p>
                  <p className="font-medium">{demoContent.voice.translation}</p>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-blue-200 mb-2">AI Extracted Information</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-200">Product:</span> {demoContent.voice.aiAnalysis.product}
                    </div>
                    <div>
                      <span className="text-blue-200">Quantity:</span> {demoContent.voice.aiAnalysis.quantity}
                    </div>
                    <div>
                      <span className="text-blue-200">Grade:</span> {demoContent.voice.aiAnalysis.grade}
                    </div>
                    <div>
                      <span className="text-blue-200">Location:</span> {demoContent.voice.aiAnalysis.location}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Video Demo */}
            {activeType === 'video' && (
              <div className="space-y-4">
                <VideoPlayer videoUrl={demoContent.video.videoUrl} />
                
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-blue-200 mb-2">AI Video Analysis</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-blue-200">Detected Product:</span> {demoContent.video.aiAnalysis.detectedProduct}
                    </div>
                    <div>
                      <span className="text-blue-200">Confidence:</span> {demoContent.video.aiAnalysis.confidence}
                    </div>
                    <div>
                      <span className="text-blue-200">Extracted Specs:</span> {demoContent.video.aiAnalysis.extractedSpecs.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              <Link
                href={`/rfq/create?type=${activeType}`}
                className="px-8 py-5 bg-white text-[#0a1128] rounded-2xl font-bold text-lg hover:scale-105 transition shadow-2xl inline-flex items-center gap-2"
              >
                Try {activeType.charAt(0).toUpperCase() + activeType.slice(1)} RFQ
              </Link>
              <Link 
                href="/rfq/demo/all"
                className="px-8 py-5 bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 rounded-2xl font-bold text-lg hover:bg-cyan-500/30 transition backdrop-blur inline-flex items-center gap-2"
              >
                View All Demos
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center bg-gray-900/50 rounded-lg p-4 border border-cyan-500/20">
            <p className="text-3xl font-bold mb-1 text-cyan-400">~800</p>
            <p className="text-sm text-gray-400">Text RFQs</p>
          </div>
          <div className="text-center bg-gray-900/50 rounded-lg p-4 border border-cyan-500/20">
            <p className="text-3xl font-bold mb-1 text-cyan-400">~300</p>
            <p className="text-sm text-gray-400">Voice RFQs</p>
          </div>
          <div className="text-center bg-gray-900/50 rounded-lg p-4 border border-cyan-500/20">
            <p className="text-3xl font-bold mb-1 text-cyan-400">~150</p>
            <p className="text-sm text-gray-400">Video RFQs</p>
          </div>
          <div className="text-center bg-gray-900/50 rounded-lg p-4 border border-cyan-500/20">
            <p className="text-3xl font-bold mb-1 text-cyan-400">12+</p>
            <p className="text-sm text-gray-400">Languages</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-400 mb-4">
            <Link href="/auth/login-otp" className="text-cyan-400 hover:text-cyan-300 underline font-semibold">
              or Sign up for free →
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            No credit card required • Free to start • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

