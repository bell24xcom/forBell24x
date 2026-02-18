'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, FileText, AlertCircle, RefreshCw } from 'lucide-react';

type RFQStatus = 'ACTIVE' | 'QUOTED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED' | 'DRAFT';

interface RFQItem {
  id: string;
  title: string;
  category: string;
  status: RFQStatus;
  urgency: string;
  quantity: number;
  unit: string;
  minBudget: number | null;
  maxBudget: number | null;
  timeline: string | null;
  createdAt: string;
  expiresAt: string | null;
  quotesCount: number;
  estimatedValue: number | null;
}

const STATUS_CONFIG: Record<RFQStatus, { label: string; classes: string }> = {
  ACTIVE: { label: 'Active', classes: 'bg-green-100 text-green-800' },
  QUOTED: { label: 'Quoted', classes: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Completed', classes: 'bg-gray-100 text-gray-700' },
  EXPIRED: { label: 'Expired', classes: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Cancelled', classes: 'bg-red-100 text-red-700' },
  DRAFT: { label: 'Draft', classes: 'bg-yellow-100 text-yellow-800' },
};

function StatusBadge({ status }: { status: RFQStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, classes: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
}

function formatBudget(min: number | null, max: number | null): string {
  if (min == null && max == null) return '—';
  const fmt = (v: number) =>
    v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${v.toLocaleString('en-IN')}`;
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (max != null) return `Up to ${fmt(max)}`;
  return `From ${fmt(min!)}`;
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

export default function MyRFQsPage() {
  const [rfqs, setRfqs] = useState<RFQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRFQs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/rfqs');
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Failed to load RFQs');
      setRfqs(data.rfqs as RFQItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <span className="text-gray-300">My RFQs</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My RFQs</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your Requests for Quotation</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchRFQs}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/rfq/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New RFQ
            </Link>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">Failed to load RFQs</p>
              <p className="text-red-400 text-sm mt-1">{error}</p>
              <button
                onClick={fetchRFQs}
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
          {!loading && !error && rfqs.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(
                [
                  { label: 'Total', value: rfqs.length, color: 'text-gray-900' },
                  { label: 'Active', value: rfqs.filter(r => r.status === 'ACTIVE').length, color: 'text-green-600' },
                  { label: 'Quoted', value: rfqs.filter(r => r.status === 'QUOTED').length, color: 'text-blue-600' },
                  { label: 'Completed', value: rfqs.filter(r => r.status === 'COMPLETED').length, color: 'text-gray-500' },
                ] as const
              ).map(stat => (
                <div key={stat.label} className="text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Title', 'Category', 'Status', 'Quotes', 'Budget', 'Created'].map(h => (
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
                    <SkeletonRow />
                  </>
                )}

                {!loading && !error && rfqs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-gray-800 font-semibold text-lg">No RFQs yet</p>
                          <p className="text-gray-500 text-sm mt-1">
                            Post your first Request for Quotation and get quotes from verified suppliers.
                          </p>
                        </div>
                        <Link
                          href="/rfq/create"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Create your first RFQ
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && !error && rfqs.map(rfq => (
                  <tr key={rfq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 truncate">{rfq.title}</p>
                        {rfq.quantity != null && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {rfq.quantity} {rfq.unit}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{rfq.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={rfq.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${rfq.quotesCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                        {rfq.quotesCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 whitespace-nowrap">
                        {formatBudget(rfq.minBudget, rfq.maxBudget)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(rfq.createdAt)}
                      </span>
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
