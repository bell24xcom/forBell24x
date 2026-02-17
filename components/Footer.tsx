'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0A0F1E] border-t border-slate-800">
      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-base font-bold text-white">BELL</span>
                <span className="text-base font-bold text-blue-400">24H</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              India&apos;s fastest B2B marketplace. AI-powered supplier matching with voice, video, and text RFQs.
            </p>
            <div className="flex gap-3">
              <a href="https://twitter.com/bell24h" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com/company/bell24h" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><Link href="/post-rfq" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Post RFQ</Link></li>
              <li><Link href="/suppliers" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Find Suppliers</Link></li>
              <li><Link href="/categories" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Browse Categories</Link></li>
              <li><Link href="/pricing" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Contact</Link></li>
              <li><Link href="/help-center" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Legal - Required for Razorpay/Stripe */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Refund Policy</Link></li>
              <li><Link href="/shipping" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Shipping Policy</Link></li>
              <li><Link href="/cookies" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-slate-600 text-xs">
              &copy; {new Date().getFullYear()} BELL Technology Pvt. Ltd. All rights reserved. Made in India.
            </p>
            <p className="text-slate-600 text-xs">
              CIN: U00000MH2024PTC000000
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
