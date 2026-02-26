'use client';

import Link from 'next/link';

export default function VerifiedSuppliersPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            ⭐ Verified Supplier Program
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Become a verified supplier and unlock exclusive benefits. GST verification, business validation,
            trust scores, and priority placement in our smart matching system.
          </p>
        </div>

        {/* Features Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 sm:p-12 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Verification Process:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start">
              <span className="text-2xl mr-3">🔍</span>
              <div>
                <h3 className="font-semibold text-white mb-1">GST Verification</h3>
                <p className="text-slate-300">Verify your GST registration and business compliance</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">📋</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Business Validation</h3>
                <p className="text-slate-300">Complete business profile review and verification</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">⭐</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Trust Score System</h3>
                <p className="text-slate-300">Build your reputation with our comprehensive rating system</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">🏆</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Trust Badge</h3>
                <p className="text-slate-300">Display verified badge on your profile to gain buyer confidence</p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-slate-700/50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-white mb-4">Verified Supplier Benefits:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Priority placement in smart matching
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Featured in verified supplier listings
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Increased visibility to buyers
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Access to premium advertising options
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Higher bid response rates
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Better match with quality buyers
              </div>
            </div>
          </div>

          {/* How to Get Verified */}
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-white mb-3">Getting Verified is Easy:</h3>
            <ol className="space-y-2 text-blue-200">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Complete your supplier profile</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Submit GST registration details</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Our team reviews and verifies</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <span>Get verified badge and priority placement</span>
              </li>
            </ol>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-center"
            >
              Get Verified Now
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
