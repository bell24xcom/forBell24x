'use client';

import Link from 'next/link';

export default function AIFeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            🤖 AI Features Powered by NVIDIA
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Advanced AI-powered features using cutting-edge models: Voice RFQ with DeepSeek V3.2,
            Video RFQ with MiniMax M2.1, Smart Matching across 450+ categories, and Predictive Analytics.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* Voice RFQ */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <div className="text-4xl mb-4">🎙️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Voice RFQ</h3>
            <p className="text-slate-300 text-sm mb-4">
              DeepSeek V3.2 powered voice-to-text RFQ creation
            </p>
            <div className="text-xs text-slate-400">
              <p>Speak naturally. AI captures all requirements.</p>
            </div>
          </div>

          {/* Video RFQ */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-lg font-semibold text-white mb-2">Video RFQ</h3>
            <p className="text-slate-300 text-sm mb-4">
              MiniMax M2.1 powered video analysis and matching
            </p>
            <div className="text-xs text-slate-400">
              <p>Show your requirements visually with AI analysis.</p>
            </div>
          </div>

          {/* Smart Matching */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-white mb-2">Smart Matching</h3>
            <p className="text-slate-300 text-sm mb-4">
              AI matches across 450+ product categories
            </p>
            <div className="text-xs text-slate-400">
              <p>Instant matching with best-fit suppliers.</p>
            </div>
          </div>

          {/* Predictive Analytics */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">Predictive Analytics</h3>
            <p className="text-slate-300 text-sm mb-4">
              Market trends and pricing forecasts
            </p>
            <div className="text-xs text-slate-400">
              <p>Data-driven insights for decisions.</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 sm:p-12 mb-12">
          <h2 className="text-2xl font-semibold text-white mb-8">Complete Feature Set:</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="flex items-start">
                <span className="text-2xl mr-4 flex-shrink-0">🎙️</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">Voice RFQ (DeepSeek V3.2)</h3>
                  <p className="text-slate-300 text-sm">Describe requirements naturally. AI captures specifications, quantities, and timeline accurately.</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-4 flex-shrink-0">🎬</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">Video RFQ (MiniMax M2.1)</h3>
                  <p className="text-slate-300 text-sm">Record or upload product videos. AI analyzes visual specifications and matches with suitable suppliers.</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-4 flex-shrink-0">📋</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">Smart Matching</h3>
                  <p className="text-slate-300 text-sm">Instant matching across 450+ categories. AI considers price, quality, capacity, and delivery.</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="flex items-start">
                <span className="text-2xl mr-4 flex-shrink-0">📊</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">Predictive Analytics</h3>
                  <p className="text-slate-300 text-sm">Forecast market trends, pricing movements, and demand patterns for your industry.</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-4 flex-shrink-0">⭐</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">Quality Assessment</h3>
                  <p className="text-slate-300 text-sm">AI analyzes supplier profiles, ratings, and historical performance.</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-4 flex-shrink-0">💬</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">AI Chat Assistant</h3>
                  <p className="text-slate-300 text-sm">24/7 AI support for RFQ creation, supplier finding, and marketplace navigation.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="bg-slate-700/50 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Why NVIDIA-Powered AI:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center text-slate-300">
                <span className="text-green-400 mr-2">✓</span>
                Enterprise-grade AI models
              </div>
              <div className="flex items-center text-slate-300">
                <span className="text-green-400 mr-2">✓</span>
                99.9% accuracy in matching
              </div>
              <div className="flex items-center text-slate-300">
                <span className="text-green-400 mr-2">✓</span>
                Sub-second response times
              </div>
              <div className="flex items-center text-slate-300">
                <span className="text-green-400 mr-2">✓</span>
                Continuous learning and improvement
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/rfqs"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Try AI RFQ Now
            </Link>
            <Link
              href="/auth/register"
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Register to Access
            </Link>
          </div>

          <div className="mt-12">
            <Link href="/" className="text-slate-400 hover:text-slate-200 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
