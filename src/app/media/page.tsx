'use client';

import Link from 'next/link';

export default function MediaPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            📰 Press & Media
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            For press inquiries and media coverage, please reach out to our media team.
            Press kit and media assets coming soon.
          </p>
        </div>

        {/* Contact Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 sm:p-12 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Media Inquiries:</h2>

          <div className="space-y-6 mb-8">
            <div className="bg-slate-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Press Releases</h3>
              <p className="text-slate-300 mb-3">Stay updated with our latest news and announcements</p>
              <p className="text-slate-400">Coming soon</p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Brand Assets</h3>
              <p className="text-slate-300 mb-3">Download logos, screenshots, and brand materials</p>
              <p className="text-slate-400">Coming soon</p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Media Contact</h3>
              <p className="text-slate-300 mb-3">Get in touch with our media relations team</p>
              <a
                href="mailto:bell24h.helpline@gmail.com"
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                bell24h.helpline@gmail.com
              </a>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:bell24h.helpline@gmail.com"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-center"
            >
              Send Media Inquiry
            </a>
            <Link
              href="/"
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Direct Contact Email */}
        <div className="text-center text-slate-300 mb-8">
          <p className="text-lg font-semibold text-white mb-2">For Press Inquiries:</p>
          <a href="mailto:bell24h.helpline@gmail.com" className="text-blue-400 hover:text-blue-300 text-xl font-semibold">
            bell24h.helpline@gmail.com
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
