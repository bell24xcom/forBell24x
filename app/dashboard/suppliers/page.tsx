'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Users,
  Search,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  Building2,
} from 'lucide-react';

interface RawQuote {
  id: string;
  supplierName: string;
  supplierCompany: string;
  price: number;
  rfqTitle: string;
  rfqCategory: string;
  status: string;
}

interface SupplierSummary {
  name: string;
  company: string;
  quotesCount: number;
  totalValue: number;
  categories: string[];
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function buildSupplierSummaries(quotes: RawQuote[]): SupplierSummary[] {
  const map = new Map<string, SupplierSummary>();

  for (const q of quotes) {
    const key = `${q.supplierName}|${q.supplierCompany}`;
    const existing = map.get(key);
    if (existing) {
      existing.quotesCount += 1;
      existing.totalValue += q.price;
      if (!existing.categories.includes(q.rfqCategory)) {
        existing.categories.push(q.rfqCategory);
      }
    } else {
      map.set(key, {
        name: q.supplierName,
        company: q.supplierCompany,
        quotesCount: 1,
        totalValue: q.price,
        categories: [q.rfqCategory],
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.quotesCount - a.quotesCount);
}

function SupplierCard({ supplier }: { supplier: SupplierSummary }) {
  const initials = supplier.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Top row */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-blue-700 font-bold text-sm">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{supplier.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <p className="text-sm text-gray-500 truncate">{supplier.company}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{supplier.quotesCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Quote{supplier.quotesCount !== 1 ? 's' : ''} submitted</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{formatCurrency(supplier.totalValue)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total value quoted</p>
        </div>
      </div>

      {/* Categories */}
      {supplier.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {supplier.categories.slice(0, 3).map(cat => (
            <span
              key={cat}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
            >
              {cat}
            </span>
          ))}
          {supplier.categories.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs text-gray-500 bg-gray-100">
              +{supplier.categories.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <Link
        href="/messages"
        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        Message
      </Link>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 bg-gray-100 rounded-lg" />
        <div className="h-16 bg-gray-100 rounded-lg" />
      </div>
      <div className="h-8 bg-gray-200 rounded-lg" />
    </div>
  );
}

export default function MySuppliersPage() {
  const [quotes, setQuotes] = useState<RawQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/quotes');
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Failed to load supplier data');
      setQuotes(data.quotes as RawQuote[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const suppliers = useMemo(() => buildSupplierSummaries(quotes), [quotes]);

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;
    const q = searchQuery.toLowerCase();
    return suppliers.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.company.toLowerCase().includes(q) ||
        s.categories.some(c => c.toLowerCase().includes(q))
    );
  }, [suppliers, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <span className="text-gray-300">My Suppliers</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Suppliers</h1>
            <p className="text-gray-400 text-sm mt-1">
              Suppliers who have quoted on your RFQs
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search */}
        {!loading && !error && suppliers.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, company, or category..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">Failed to load suppliers</p>
              <p className="text-red-400 text-sm mt-1">{error}</p>
              <button
                onClick={fetchData}
                className="text-red-300 hover:text-red-200 text-sm underline mt-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Summary badge */}
        {!loading && !error && suppliers.length > 0 && (
          <p className="text-gray-400 text-sm">
            Showing <span className="text-white font-medium">{filteredSuppliers.length}</span> of{' '}
            <span className="text-white font-medium">{suppliers.length}</span> supplier
            {suppliers.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && suppliers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-800 font-semibold text-lg">No suppliers yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Once suppliers quote on your RFQs, they will appear here.
                </p>
              </div>
              <Link
                href="/rfq/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Post an RFQ
              </Link>
            </div>
          </div>
        )}

        {/* No search results */}
        {!loading && !error && suppliers.length > 0 && filteredSuppliers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600">No suppliers match your search.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Supplier Cards */}
        {!loading && !error && filteredSuppliers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map(supplier => (
              <SupplierCard key={`${supplier.name}|${supplier.company}`} supplier={supplier} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
