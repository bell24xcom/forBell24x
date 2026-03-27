'use client';

import Link from 'next/link';

export default function RFQServicesPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            📋 RFQ Management
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Post your requirements via Voice, Video, or Text. Our AI instantly matches you with the best suppliers
            across 450+ categories. Get competitive quotes in hours, not days.
          </p>
        </div>

        {/* Features Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 sm:p-12 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">How It Works:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start">
              <span className="text-2xl mr-3">🎙️</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Voice RFQ</h3>
                <p className="text-slate-300">Describe your needs naturally. AI captures all requirements</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">🎬</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Video RFQ</h3>
                <p className="text-slate-300">Show what you need. Video demonstrates specifications clearly</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">📝</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Text RFQ</h3>
                <p className="text-slate-300">Traditional text-based RFQs for detailed specifications</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">🤖</span>
              <div>
                <h3 className="font-semibold text-white mb-1">AI Matching</h3>
                <p className="text-slate-300">Instant matching with verified suppliers in your category</p>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="bg-slate-700/50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-white mb-4">Key Benefits:</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center">
                <span className="text-blue-400 mr-2">✓</span>
                Get quotes in hours, not weeks
              </li>
              <li className="flex items-center">
                <span className="text-blue-400 mr-2">✓</span>
                Compare suppliers across 450+ categories
              </li>
              <li className="flex items-center">
                <span className="text-blue-400 mr-2">✓</span>
                AI ensures your RFQ reaches the right suppliers
              </li>
              <li className="flex items-center">
                <span className="text-blue-400 mr-2">✓</span>
                Transparent pricing and supplier ratings
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/rfq/create"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-center"
            >
              Post RFQ Now
            </Link>
            <Link
              href="/auth/register"
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-center"
            >
              Register Now
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-slate-400 hover:text-slate-200 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
