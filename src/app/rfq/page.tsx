'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RFQ {
  id: string;
  title: string;
  category: string;
  description: string;
  quantity: string;
  unit: string;
  budget: number;
  urgency: string;
  status: string;
  location: string;
  quotesCount: number;
  views: number;
  createdAt: string;
  type: string;
}

const URGENCY_COLORS: Record<string, string> = {
  HIGH:   'bg-red-900/40 text-red-300 border-red-800',
  URGENT: 'bg-red-900/40 text-red-300 border-red-800',
  MEDIUM: 'bg-yellow-900/40 text-yellow-300 border-yellow-800',
  LOW:    'bg-green-900/40 text-green-300 border-green-800',
  NORMAL: 'bg-slate-800 text-slate-400 border-slate-700',
};

const CATEGORIES = [
  'All Categories',
  'Steel & Metal', 'Electronics', 'Chemicals', 'Machinery',
  'Textiles', 'Construction', 'Packaging', 'Plastics', 'Food & Beverage', 'Other',
];

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function RFQPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRFQs = async (p = 1, search = searchTerm, cat = selectedCategory) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '20', page: String(p) });
      if (search) params.set('search', search);
      if (cat && cat !== 'All Categories') params.set('category', cat);

      const res = await fetch(`/api/marketplace/rfqs?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch RFQs');
      const data = await res.json();
      if (data.success || data.rfqs) {
        setRfqs(data.rfqs || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        throw new Error(data.error || 'Failed to load RFQs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch RFQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRFQs(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRFQs(1, searchTerm, selectedCategory);
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-700 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Active RFQs</h1>
          <p className="text-blue-200 mb-6">Find procurement requests from verified buyers across India</p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search RFQs by product, title, keyword…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
            <select
              value={selectedCategory}
              onChange={e => { setSelectedCategory(e.target.value); setPage(1); fetchRFQs(1, searchTerm, e.target.value); }}
              className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
            </select>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors min-h-[44px]"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading RFQs…</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-8 text-center">
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={() => fetchRFQs()}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium min-h-[44px]"
            >
              Try Again
            </button>
          </div>
        ) : rfqs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-white mb-2">No RFQs found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your search or check back soon for new requests.</p>
            <Link
              href="/rfq/create"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium min-h-[44px] inline-block"
            >
              Post an RFQ
            </Link>
          </div>
        ) : (
          <>
            <p className="text-slate-400 text-sm mb-5">{rfqs.length} active RFQ{rfqs.length !== 1 ? 's' : ''} found</p>
            <div className="space-y-4">
              {rfqs.map(rfq => (
                <div
                  key={rfq.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-xs px-2 py-0.5 bg-blue-900/40 text-blue-300 rounded-full border border-blue-800">
                          {rfq.category}
                        </span>
                        {rfq.urgency && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${URGENCY_COLORS[rfq.urgency] || URGENCY_COLORS.NORMAL}`}>
                            {rfq.urgency}
                          </span>
                        )}
                        <span className="text-xs text-slate-500">{timeAgo(rfq.createdAt)}</span>
                      </div>
                      <h3 className="text-base font-semibold text-white mb-1 leading-snug">{rfq.title}</h3>
                      {rfq.description && (
                        <p className="text-slate-400 text-sm line-clamp-2 mb-3">{rfq.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                        {rfq.location && <span>📍 {rfq.location}</span>}
                        {rfq.budget > 0 && <span>💰 Budget: ₹{rfq.budget.toLocaleString('en-IN')}</span>}
                        {rfq.quantity && <span>📦 Qty: {rfq.quantity} {rfq.unit}</span>}
                        <span className="text-slate-500">{rfq.quotesCount || 0} quote{(rfq.quotesCount || 0) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <Link
                      href={`/rfq/${rfq.id}`}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium whitespace-nowrap min-h-[44px] flex items-center"
                    >
                      View & Quote →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  onClick={() => { const p = page - 1; setPage(p); fetchRFQs(p); }}
                  disabled={page <= 1}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-700 min-h-[44px]"
                >
                  ← Prev
                </button>
                <span className="text-slate-400 text-sm">Page {page} of {totalPages}</span>
                <button
                  onClick={() => { const p = page + 1; setPage(p); fetchRFQs(p); }}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-700 min-h-[44px]"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
