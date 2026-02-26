'use client';

import Link from 'next/link';

export default function GSTRegistrationPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            📋 GST Registration Assistance
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Simplifying GST registration for new businesses. We help MSMEs navigate the registration process
            quickly and efficiently, ensuring you're fully compliant to sell on Bell24h.
          </p>
        </div>

        {/* Features Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 sm:p-12 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">How We Help:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start">
              <span className="text-2xl mr-3">📝</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Documentation Support</h3>
                <p className="text-slate-300">Guidance on collecting and preparing required documents</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">👨‍💼</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Expert Guidance</h3>
                <p className="text-slate-300">Step-by-step assistance from compliance experts</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚡</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Fast Processing</h3>
                <p className="text-slate-300">Quick turnaround with our partner network</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">✅</span>
              <div>
                <h3 className="font-semibold text-white mb-1">Compliance Assured</h3>
                <p className="text-slate-300">Ensure full regulatory compliance before launching</p>
              </div>
            </div>
          </div>

          {/* Coming Soon Message */}
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-6">
            <p className="text-blue-200 font-semibold">
              This feature is coming soon
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-center"
            >
              Register as Supplier
            </Link>
            <a
              href="mailto:support@bell24h.com"
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-center"
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* Contact Email */}
        <div className="text-center text-slate-300 mb-8">
          <p className="mb-2">Need GST registration assistance?</p>
          <a href="mailto:support@bell24h.com" className="text-blue-400 hover:text-blue-300 font-semibold">
            support@bell24h.com
          </a>
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
