'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  activeQuotes: number;
  rfqsWon: number;
  totalEarned: number;
  responseRate: number;
  totalQuotes: number;
}

interface Trust {
  score: number;
  isVerified: boolean;
  hasGST: boolean;
  hasUdyam: boolean;
  improvements: Array<{ label: string; points: number }>;
}

interface Quote {
  id: string;
  price: number;
  quantity: string;
  timeline: string;
  status: string;
  createdAt: string;
  rfq: {
    title: string;
    category: string;
    status: string;
  };
}

export default function SupplierDashboardPage() {
  const [stats,  setStats]  = useState<Stats | null>(null);
  const [trust,  setTrust]  = useState<Trust | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, quotesRes] = await Promise.all([
          fetch('/api/supplier/stats'),
          fetch('/api/supplier/quotes?limit=10'),
        ]);

        if (!statsRes.ok || !quotesRes.ok) {
          setError('Failed to load dashboard data. Please log in.');
          return;
        }

        const statsData = await statsRes.json();
        const quotesData = await quotesRes.json();

        if (statsData.success) {
          setStats(statsData.stats);
          if (statsData.trust) setTrust(statsData.trust);
        }
        if (quotesData.success) setQuotes(quotesData.quotes);
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-300',
    ACCEPTED: 'bg-green-500/20 text-green-300',
    REJECTED: 'bg-red-500/20 text-red-300',
    EXPIRED: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Supplier Dashboard</h1>
            <p className="text-gray-400 mt-1">Track your quotes and earnings</p>
          </div>
          <Link
            href="/rfq"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            Browse New RFQs
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Stats cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 animate-pulse h-28" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow">
              <p className="text-sm text-gray-500 mb-1">Active Quotes</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.activeQuotes}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow">
              <p className="text-sm text-gray-500 mb-1">RFQs Won</p>
              <p className="text-3xl font-bold text-green-600">{stats.rfqsWon}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow">
              <p className="text-sm text-gray-500 mb-1">Total Earned</p>
              <p className="text-3xl font-bold text-blue-600">
                ₹{stats.totalEarned.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow">
              <p className="text-sm text-gray-500 mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-purple-600">{stats.responseRate}%</p>
            </div>
          </div>
        ) : null}

        {/* Trust Score Card */}
        {!loading && trust && (
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-5 mb-6 flex flex-col sm:flex-row gap-5">
            {/* Score gauge */}
            <div className="flex-shrink-0 text-center sm:text-left">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Trust Score</p>
              <div className="flex items-end gap-1">
                <span className={`text-5xl font-extrabold ${
                  trust.score >= 70 ? 'text-green-400' : trust.score >= 40 ? 'text-amber-400' : 'text-slate-400'
                }`}>{trust.score}</span>
                <span className="text-slate-500 text-lg mb-1">/ 100</span>
              </div>
              <div className="w-full sm:w-36 h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    trust.score >= 70 ? 'bg-green-500' : trust.score >= 40 ? 'bg-amber-500' : 'bg-slate-500'
                  }`}
                  style={{ width: `${trust.score}%` }}
                />
              </div>
              {trust.isVerified && (
                <span className="inline-block mt-2 text-xs bg-green-900/40 text-green-400 border border-green-700/50 px-2 py-0.5 rounded-full font-semibold">
                  ✓ KYC Verified
                </span>
              )}
            </div>

            {/* Improvement hints */}
            {trust.improvements.length > 0 && (
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  Improve your visibility
                </p>
                <div className="space-y-1.5">
                  {trust.improvements.map(item => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-green-400 font-semibold">+{item.points} pts</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/auth/kyc"
                  className="inline-block mt-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  Complete KYC →
                </Link>
              </div>
            )}

            {trust.improvements.length === 0 && (
              <div className="flex-1 flex items-center">
                <p className="text-green-300 text-sm">
                  Maximum trust score achieved! Your profile is fully verified.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recent quotes table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Your Quotes</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 animate-pulse">Loading quotes...</div>
          ) : quotes.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No quotes yet.{' '}
              <Link href="/rfq" className="text-indigo-400 underline">
                Browse RFQs to submit your first quote.
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">RFQ Title</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">Category</th>
                    <th className="text-right px-6 py-3 text-gray-400 font-medium">Your Price</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">Timeline</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">Status</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {quotes.map(q => (
                    <tr key={q.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{q.rfq.title}</td>
                      <td className="px-6 py-4 text-gray-400">{q.rfq.category}</td>
                      <td className="px-6 py-4 text-right text-white">
                        ₹{q.price.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-gray-400">{q.timeline}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            statusColor[q.status] || 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(q.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
