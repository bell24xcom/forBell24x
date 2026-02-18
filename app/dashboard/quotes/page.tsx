'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Loader2,
} from 'lucide-react';

type QuoteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

interface QuoteItem {
  id: string;
  rfqTitle: string;
  rfqCategory: string;
  supplierName: string;
  supplierCompany: string;
  price: number;
  quantity: number;
  timeline: string | null;
  status: QuoteStatus;
  isAccepted: boolean;
  createdAt: string;
}

const QUOTE_STATUS_CONFIG: Record<QuoteStatus, { label: string; classes: string }> = {
  PENDING: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED: { label: 'Accepted', classes: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rejected', classes: 'bg-red-100 text-red-700' },
  EXPIRED: { label: 'Expired', classes: 'bg-gray-100 text-gray-600' },
};

function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const cfg = QUOTE_STATUS_CONFIG[status] ?? { label: status, classes: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function formatPrice(price: number): string {
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

export default function MyQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/quotes');
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Failed to load quotes');
      setQuotes(data.quotes as QuoteItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleAccept = async (quoteId: string) => {
    setAcceptingId(quoteId);
    setAcceptError(null);
    try {
      const res = await fetch('/api/rfq/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, action: 'accept' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Failed to accept quote');
      // Optimistically update the quote status
      setQuotes(prev =>
        prev.map(q =>
          q.id === quoteId ? { ...q, status: 'ACCEPTED' as QuoteStatus, isAccepted: true } : q
        )
      );
    } catch (err) {
      setAcceptError(err instanceof Error ? err.message : 'Failed to accept quote');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <span className="text-gray-300">My Quotes</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Quotes</h1>
            <p className="text-gray-400 text-sm mt-1">Quotes received from suppliers on your RFQs</p>
          </div>
          <button
            onClick={fetchQuotes}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Accept Error */}
        {acceptError && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{acceptError}</p>
            <button
              onClick={() => setAcceptError(null)}
              className="ml-auto text-red-400 hover:text-red-300 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Fetch Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">Failed to load quotes</p>
              <p className="text-red-400 text-sm mt-1">{error}</p>
              <button
                onClick={fetchQuotes}
                className="text-red-300 hover:text-red-200 text-sm underline mt-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Stats strip */}
          {!loading && !error && quotes.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(
                [
                  { label: 'Total', value: quotes.length, color: 'text-gray-900' },
                  { label: 'Pending', value: quotes.filter(q => q.status === 'PENDING').length, color: 'text-yellow-600' },
                  { label: 'Accepted', value: quotes.filter(q => q.status === 'ACCEPTED').length, color: 'text-green-600' },
                  { label: 'Rejected', value: quotes.filter(q => q.status === 'REJECTED').length, color: 'text-red-600' },
                ] as const
              ).map(stat => (
                <div key={stat.label} className="text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['RFQ Title', 'Supplier / Company', 'Price', 'Timeline', 'Status', 'Actions'].map(h => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {loading && (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                )}

                {!loading && !error && quotes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-8 h-8 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-gray-800 font-semibold text-lg">No quotes received yet</p>
                          <p className="text-gray-500 text-sm mt-1">
                            Post an RFQ to start receiving quotes from verified suppliers.
                          </p>
                        </div>
                        <Link
                          href="/rfq/create"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Post an RFQ
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && !error && quotes.map(quote => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 max-w-[200px] truncate">{quote.rfqTitle}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{quote.rfqCategory}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{quote.supplierName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{quote.supplierCompany}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(quote.price)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{quote.timeline ?? '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <QuoteStatusBadge status={quote.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {quote.status === 'PENDING' && (
                          <button
                            onClick={() => handleAccept(quote.id)}
                            disabled={acceptingId === quote.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-60"
                          >
                            {acceptingId === quote.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            Accept
                          </button>
                        )}
                        <Link
                          href={`/rfq/compare-quotes`}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
