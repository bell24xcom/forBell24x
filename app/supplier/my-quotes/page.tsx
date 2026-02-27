'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FileText, MapPin, IndianRupee, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Quote {
  id: string;
  rfqId: string;
  rfqTitle: string;
  myPrice: number;
  buyerLocation: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
}

export default function MyQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/supplier/quotes');
      if (response.ok) {
        const data = await response.json();
        setQuotes(data.quotes || []);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-900/40 text-yellow-300 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            Pending
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-900/40 text-green-300 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-900/40 text-red-300 rounded-full text-sm">
            <XCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700 text-slate-400 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            Expired
          </span>
        );
    }
  };

  const filteredQuotes = quotes.filter(quote =>
    statusFilter === 'all' || quote.status === statusFilter
  );

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'PENDING').length,
    accepted: quotes.filter(q => q.status === 'ACCEPTED').length,
    rejected: quotes.filter(q => q.status === 'REJECTED').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">My Quotes</h1>
          <p className="text-slate-400">Track all quotes you've submitted to buyers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Total Quotes</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Accepted</p>
            <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status === 'all' ? 'All Quotes' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Quotes Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading your quotes...</p>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Quotes Yet</h3>
            <p className="text-slate-400 mb-6">
              You haven't submitted any quotes yet. Browse RFQs to start quoting.
            </p>
            <Link
              href="/supplier/browse-rfqs"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Browse RFQs →
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">RFQ Title</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">My Price</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Location</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 text-white">{quote.rfqTitle}</td>
                      <td className="px-6 py-4 text-white font-semibold">
                        ₹{quote.myPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-300">{quote.buyerLocation}</td>
                      <td className="px-6 py-4">{getStatusBadge(quote.status)}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/rfq/${quote.rfqId}`}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                          View RFQ →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
