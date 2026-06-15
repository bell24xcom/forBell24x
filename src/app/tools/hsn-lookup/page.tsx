'use client';
import { Metadata } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { HSN_CODES, searchHSN, HSNCode } from '@/src/data/hsn-codes';

// Note: metadata must be in a separate server component when using 'use client'
// SEO is handled via layout or a wrapper — title injected below via document title

const POPULAR = HSN_CODES.filter(h => ['7214', '4819', '3506', '8413', '5208', '3004', '8708', '2523', '3901', '8544'].includes(h.code));

export default function HSNLookupPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HSNCode[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (q: string) => {
    setQuery(q);
    setSearched(true);
    setResults(q.trim().length >= 2 ? searchHSN(q) : []);
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-4xl mx-auto px-4 py-14">

        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
          <Link href="/tools" className="hover:text-slate-300">Tools</Link><span>/</span>
          <span className="text-slate-300">HSN Code Lookup</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-3">HSN Code Lookup — India B2B</h1>
          <p className="text-slate-400 text-base max-w-2xl">
            Search HSN codes by product name or code number. Includes GST rate, product description, and common examples.
            Covers 70+ categories used in B2B procurement.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by product (e.g. TMT bar, corrugated box, epoxy adhesive) or HSN code (e.g. 7214)..."
            className="w-full bg-slate-800/60 border border-slate-600/60 text-white placeholder-slate-500 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-[#D4AF37]/60 pr-14"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</div>
        </div>

        {/* Results */}
        {searched && query.trim().length >= 2 && (
          <div className="mb-10">
            {results.length === 0 ? (
              <p className="text-slate-500 text-sm">No results for "{query}". Try a broader term or HSN code prefix.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-500 text-xs mb-3">{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</p>
                {results.map(r => (
                  <div key={r.code} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                      <code className="text-[#D4AF37] font-bold text-lg font-mono">{r.code}</code>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 bg-slate-700/50 px-2.5 py-1 rounded-full">{r.category}</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.gstRate === 0 ? 'text-emerald-400 bg-emerald-400/10' : r.gstRate <= 5 ? 'text-blue-400 bg-blue-400/10' : r.gstRate <= 12 ? 'text-amber-400 bg-amber-400/10' : r.gstRate === 18 ? 'text-orange-400 bg-orange-400/10' : 'text-red-400 bg-red-400/10'}`}>
                          GST {r.gstRate}%
                        </span>
                      </div>
                    </div>
                    <p className="text-white text-sm font-medium mb-1">{r.description}</p>
                    <p className="text-slate-400 text-xs">Examples: {r.examples}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Popular codes */}
        {(!searched || query.trim().length < 2) && (
          <div className="mb-10">
            <h2 className="text-white font-semibold text-base mb-4">Commonly Searched HSN Codes</h2>
            <div className="space-y-3">
              {POPULAR.map(r => (
                <div key={r.code} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5 cursor-pointer hover:border-slate-600/60 transition-colors"
                  onClick={() => handleSearch(r.code)}>
                  <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                    <code className="text-[#D4AF37] font-bold font-mono">{r.code}</code>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 bg-slate-700/50 px-2.5 py-1 rounded-full">{r.category}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.gstRate === 0 ? 'text-emerald-400 bg-emerald-400/10' : r.gstRate <= 5 ? 'text-blue-400 bg-blue-400/10' : r.gstRate <= 12 ? 'text-amber-400 bg-amber-400/10' : r.gstRate === 18 ? 'text-orange-400 bg-orange-400/10' : 'text-red-400 bg-red-400/10'}`}>
                        GST {r.gstRate}%
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm">{r.description}</p>
                  <p className="text-slate-500 text-xs mt-1">{r.examples}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GST note */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 text-xs text-slate-400 leading-relaxed">
          <strong className="text-amber-400">Note:</strong> HSN codes and GST rates are indicative based on the GST Council's rate schedule as of 2026.
          Always verify with a CA or GST portal (cbic-gst.gov.in) for your specific product and use case.
          Rates may vary by product specification, end-use, or state-specific notifications.
        </div>

        <div className="mt-10 pt-8 border-t border-slate-800 flex flex-wrap gap-4 text-sm">
          <Link href="/tools/gst-calculator" className="text-[#D4AF37] hover:underline">→ GST Calculator for B2B</Link>
          <Link href="/blog/gst-compliance-b2b-buyers" className="text-slate-400 hover:text-white">→ GST Compliance Guide</Link>
          <Link href="/rfq/create" className="text-slate-400 hover:text-white">→ Post a Sourcing Requirement</Link>
        </div>
      </div>
    </div>
  );
}
