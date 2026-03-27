'use client';

import Link from 'next/link';

export default function TradeAssurancePage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            🛡️ Trade Assurance
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Protect your purchases with escrow payments, verified suppliers, and comprehensive dispute resolution.
            Buy with confidence on Bell24h.
          </p>
        </div>

        {/* Features Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 sm:p-12 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Protection Features:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start">
              <span className="text-2xl mr-3">💳</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Escrow Payments</h3>
                <p className="text-slate-300">Funds held safely until you receive and verify your order</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">✅</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Verified Suppliers</h3>
                <p className="text-slate-300">Buy only from GST verified and validated suppliers</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚖️</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Dispute Resolution</h3>
                <p className="text-slate-300">Fair resolution process for any disagreements</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">💯</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Quality Guarantee</h3>
                <p className="text-slate-300">Verify product quality before releasing payment</p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-slate-700/50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-white mb-4">How Trade Assurance Works:</h3>
            <ol className="space-y-3 text-slate-300">
              <li className="flex items-start">
                <span className="text-blue-400 mr-3 font-semibold">1.</span>
                <span>You place an order with a verified supplier</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-3 font-semibold">2.</span>
                <span>Payment held in escrow by Bell24h</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-3 font-semibold">3.</span>
                <span>Supplier ships the order</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-3 font-semibold">4.</span>
                <span>You receive and verify the goods</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-3 font-semibold">5.</span>
                <span>Payment released to supplier</span>
              </li>
            </ol>
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
