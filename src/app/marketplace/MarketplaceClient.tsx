'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Clock, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import WhatsAppShare from '@/components/ui/WhatsAppShare';

interface RFQ {
  id: string;
  title: string;
  category: string;
  quantity: string;
  unit: string;
  minBudget: number | null;
  maxBudget: number | null;
  timeline: string;
  urgency: string;
  location: string;
  tags: string[];
  priority: number;
  estimatedValue: number;
  createdAt: string;
  expiresAt: string | null;
  quotesCount: number;
  _count?: { quotes: number };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface Props {
  initialRfqs: RFQ[];
  initialTotal: number;
}

const URGENCY_COLORS: Record<string, string> = {
  URGENT: 'bg-red-900/50 text-red-300 border border-red-700',
  HIGH:   'bg-orange-900/50 text-orange-300 border border-orange-700',
  NORMAL: 'bg-slate-700 text-slate-300',
  LOW:    'bg-green-900/50 text-green-300 border border-green-700',
};

const CATEGORIES = [
  'All', 'Steel & Metals', 'Textiles & Apparel', 'Electronics & Electrical',
  'Construction Materials', 'Chemicals & Pharmaceuticals', 'Machinery & Equipment',
  'Packaging & Printing', 'Automotive & Components', 'Food & Beverages',
  'Agricultural Products',
];

export default function MarketplaceClient({ initialRfqs, initialTotal }: Props) {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [rfqs, setRfqs] = useState<RFQ[]>(initialRfqs);
  const [pagination, setPagination] = useState<Pagination | null>(
    initialTotal > 0
      ? { total: initialTotal, page: 1, limit: 20, pages: Math.ceil(initialTotal / 20) }
      : null
  );
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const loadRFQs = useCallback(async (q: string, cat: string, pg: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      if (cat && cat !== 'All') params.set('category', cat);
      params.set('page', String(pg));
      params.set('limit', '20');

      const res = await fetch(`/api/marketplace/rfqs?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setRfqs(data.rfqs || []);
        setPagination(data.pagination);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Only re-fetch when page changes (initial data already loaded server-side)
  useEffect(() => {
    if (page > 1) loadRFQs(search, category, page);
  }, [page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadRFQs(search, category, 1);
  }

  function handleCategory(cat: string) {
    const newCat = cat === 'All' ? '' : cat;
    setCategory(newCat);
    setPage(1);
    loadRFQs(search, newCat, 1);
  }

  const fmt = (n: number | null) => n
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
    : null;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Hero */}
      <div className="bg-slate-800/60 border-b border-slate-700/50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2">B2B Marketplace</h1>
          <p className="text-slate-400 mb-6">Browse active RFQs and submit your quotes</p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search RFQs by keyword…"
                aria-label="Search active RFQs"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-lg font-medium transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar filters */}
        <aside className="w-56 flex-shrink-0 hidden md:block">
          <div className="bg-slate-800 rounded-xl p-4 sticky top-20">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-300">
              <Filter className="w-4 h-4" /> Categories
            </div>
            <div className="space-y-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    (cat === 'All' && !category) || category === cat
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* RFQ list */}
        <main className="flex-1 min-w-0">
          {/* Stats row */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-slate-400 text-sm">
              {pagination ? `${pagination.total} active RFQs` : 'Loading…'}
            </div>
            <Link
              href="/rfq/create"
              className="bg-indigo-600 hover:bg-indigo-700 text-sm px-4 py-2 rounded-lg transition-colors"
            >
              + Post RFQ
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-800 rounded-xl p-5 animate-pulse h-32" />
              ))}
            </div>
          ) : rfqs.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-12 text-center text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No RFQs found</p>
              <p className="text-sm mt-1">Try a different search or category</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {rfqs.map(rfq => (
                  <Link
                    key={rfq.id}
                    href={`/rfq/${rfq.id}`}
                    className="block bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-indigo-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${URGENCY_COLORS[rfq.urgency] ?? URGENCY_COLORS.NORMAL}`}>
                            {rfq.urgency}
                          </span>
                          <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">{rfq.category}</span>
                        </div>
                        <h3 className="font-semibold text-base text-white mb-1 truncate">{rfq.title}</h3>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                          <span>Qty: {rfq.quantity} {rfq.unit}</span>
                          {(rfq.minBudget || rfq.maxBudget) && (
                            <span>
                              Budget: {fmt(rfq.minBudget)} {rfq.maxBudget ? `– ${fmt(rfq.maxBudget)}` : '+'}
                            </span>
                          )}
                          {rfq.timeline && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {rfq.timeline}
                            </span>
                          )}
                          {rfq.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {rfq.location}
                            </span>
                          )}
                        </div>

                        {rfq.tags?.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Tag className="w-3 h-3 text-slate-500" />
                            {rfq.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-indigo-300 text-sm">
                          {(rfq.quotesCount ?? rfq._count?.quotes ?? 0) === 0
                            ? 'Be the first to quote →'
                            : `${rfq.quotesCount ?? rfq._count?.quotes ?? 0} quote${(rfq.quotesCount ?? rfq._count?.quotes ?? 0) !== 1 ? 's' : ''}`}
                        </div>
                        <div className="text-slate-500 text-xs mt-1">
                          {new Date(rfq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </div>
                        <div className="mt-3 text-xs bg-indigo-700 text-white px-3 py-1 rounded-lg">
                          Submit Quote →
                        </div>
                        <div className="mt-2">
                          <WhatsAppShare
                            rfqTitle={rfq.title}
                            rfqId={rfq.id}
                            category={rfq.category}
                            budget={rfq.minBudget ?? undefined}
                            location={rfq.location}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded-lg text-sm transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-slate-400 text-sm">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded-lg text-sm transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
