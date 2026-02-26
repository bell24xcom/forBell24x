'use client';

import Link from 'next/link';

export default function LogisticsPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            🚚 Logistics Integration
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Seamless logistics integration with Shiprocket and other leading carriers.
            Coming Q2 2026. Currently, buyers and suppliers arrange delivery directly through preferred logistics partners.
          </p>
        </div>

        {/* Features Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 sm:p-12 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Coming Soon Features:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start">
              <span className="text-2xl mr-3">🔗</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Multi-Carrier Integration</h3>
                <p className="text-slate-300">Connect with Shiprocket and other major logistics providers</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">📍</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Real-Time Tracking</h3>
                <p className="text-slate-300">Track shipments from warehouse to customer doorstep</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">💰</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Competitive Rates</h3>
                <p className="text-slate-300">Get best rates through our carrier partnerships</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">📦</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Automated Label Printing</h3>
                <p className="text-slate-300">Generate shipping labels directly from order system</p>
              </div>
            </div>
          </div>

          {/* Current Process Note */}
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 mb-6">
            <p className="text-yellow-200 font-semibold">
              Currently: Buyers and suppliers arrange delivery directly with their preferred logistics partners
            </p>
          </div>

          {/* Coming Soon Message */}
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-6">
            <p className="text-blue-200 font-semibold">
              This feature is launching Q2 2026
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-center"
            >
              Register Now
            </Link>
            <Link
              href="/"
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-center"
            >
              Back to Home
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
