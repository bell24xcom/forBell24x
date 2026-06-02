'use client';

import { useState } from 'react';
import { Mic, Video, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import VideoPlayer from './VideoPlayer';

type RFQType = 'text' | 'voice' | 'video';

export default function HeroRFQDemo() {
  const [activeType, setActiveType] = useState<RFQType>('voice');

  const demoContent = {
    text: {
      title: 'Type Your Requirement',
      description: 'Traditional text-based requirement with full specifications',
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
      transcription: 'मुझे 1000 टी-शर्ट चाहिए, भिवंडी डिलीवरी, अर्जेंट',
      translation: 'I need 1000 T-Shirts, Bhiwandi delivery, Urgent',
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
            <span className="text-sm font-medium text-cyan-400">AI-Powered Requirement System</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white leading-tight">
            Get Verified Quotations from Trusted Suppliers — In 24 Hours.
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Verified Suppliers • Protected Payments • Faster Quotations
          </p>
        </div>

        {/* Type Selector Tabs — Voice first (default), then Video, then Text */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={() => setActiveType('voice')}
            className={`flex items-center gap-2 px-8 py-5 rounded-2xl font-bold text-lg transition-all ${
              activeType === 'voice'
                ? 'bg-cyan-500 border-2 border-cyan-500 text-white shadow-2xl shadow-cyan-500/30 scale-105'
                : 'bg-slate-900/60 border-2 border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-white backdrop-blur'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span>Speak Requirement</span>
          </button>
          <button
            onClick={() => setActiveType('video')}
            className={`flex items-center gap-2 px-8 py-5 rounded-2xl font-bold text-lg transition-all ${
              activeType === 'video'
                ? 'bg-cyan-500 border-2 border-cyan-500 text-white shadow-2xl shadow-cyan-500/30 scale-105'
                : 'bg-slate-900/60 border-2 border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-white backdrop-blur'
            }`}
          >
            <Video className="w-5 h-5" />
            <span>Video Requirement</span>
          </button>
          <button
            onClick={() => setActiveType('text')}
            className={`flex items-center gap-2 px-8 py-5 rounded-2xl font-bold text-lg transition-all ${
              activeType === 'text'
                ? 'bg-cyan-500 border-2 border-cyan-500 text-white shadow-2xl shadow-cyan-500/30 scale-105'
                : 'bg-slate-900/60 border-2 border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-white backdrop-blur'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Text Requirement</span>
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

            {/* Voice Demo — animated mic + Hindi/English transcript */}
            {activeType === 'voice' && (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-6 py-6">
                  {/* Left waveform */}
                  <div className="flex items-end gap-1.5 h-20">
                    <span className="w-1.5 h-6  bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0ms',   animationDuration: '1s' }} />
                    <span className="w-1.5 h-12 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '150ms', animationDuration: '1s' }} />
                    <span className="w-1.5 h-8  bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '300ms', animationDuration: '1s' }} />
                    <span className="w-1.5 h-16 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '450ms', animationDuration: '1s' }} />
                  </div>

                  {/* Mic */}
                  <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow-2xl shadow-red-500/50 ring-4 ring-red-500/30 animate-pulse">
                    <Mic className="w-10 h-10 text-white" />
                  </div>

                  {/* Right waveform (mirrored) */}
                  <div className="flex items-end gap-1.5 h-20">
                    <span className="w-1.5 h-16 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '450ms', animationDuration: '1s' }} />
                    <span className="w-1.5 h-8  bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '300ms', animationDuration: '1s' }} />
                    <span className="w-1.5 h-12 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '150ms', animationDuration: '1s' }} />
                    <span className="w-1.5 h-6  bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0ms',   animationDuration: '1s' }} />
                  </div>
                </div>

                <p lang="hi" className="text-2xl md:text-3xl font-bold text-white text-center leading-relaxed">
                  {demoContent.voice.transcription}
                </p>

                <p className="text-lg text-gray-400 text-center">
                  {demoContent.voice.translation}
                </p>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-medium text-red-400 tracking-wide">Recording...</span>
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
                href={activeType === 'voice' ? '/voice-rfq' : activeType === 'video' ? '/video-rfq' : '/rfq/create'}
                className="px-8 py-5 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:scale-105 transition shadow-2xl inline-flex items-center gap-2"
              >
                {activeType.charAt(0).toUpperCase() + activeType.slice(1)} Requirement
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

