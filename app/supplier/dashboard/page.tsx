'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SupplierDashboardPage() {
  const [stats, setStats] = useState({
    activeQuotes: 0,
    wonQuotes: 0,
    totalEarned: 0,
    totalQuotes: 0,
    responseRate: '0%',
  });
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<Record<string, string> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('bell24h_user');
    if (!userData) {
      router.push('/auth/phone-email');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => {
    fetchStats();
    fetchQuotes();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/supplier/stats', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/supplier/quotes?limit=5', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setQuotes(data.quotes || []);
      }
    } catch (err) {
      console.error('Error fetching quotes:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-900/40 text-yellow-300';
      case 'ACCEPTED': return 'bg-green-900/40 text-green-300';
      case 'REJECTED': return 'bg-red-900/40 text-red-300';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-slate-300">
            <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
            <li><span className="text-white">Supplier Dashboard</span></li>
          </ol>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Supplier Dashboard</h1>
          <p className="text-slate-300">Welcome back, {user?.name} ({user?.company})</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="text-2xl font-bold text-emerald-400 mb-1">
              {'\u20B9'}{stats.totalEarned.toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-slate-400">Total Earned</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.wonQuotes}</div>
            <div className="text-sm text-slate-400">RFQs Won</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.activeQuotes}</div>
            <div className="text-sm text-slate-400">Active Quotes</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="text-2xl font-bold text-blue-400 mb-1">{stats.responseRate}</div>
            <div className="text-sm text-slate-400">Win Rate</div>
          </div>
        </div>

        {/* Browse RFQs CTA */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Looking for new opportunities?</h3>
              <p className="text-slate-400">Browse active RFQs and submit competitive quotes</p>
            </div>
            <Link
              href="/supplier/browse-rfqs"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              Browse RFQs
            </Link>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Quotes</h2>
            <Link href="/supplier/my-quotes" className="text-blue-400 hover:text-blue-300 text-sm">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">RFQ Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">My Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading...</td></tr>
                ) : quotes.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No quotes submitted yet</td></tr>
                ) : (
                  quotes.map((quote: any) => (
                    <tr key={quote.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {quote.rfq?.title || 'Untitled RFQ'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {quote.rfq?.buyer?.company || quote.rfq?.buyer?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-semibold">
                        {'\u20B9'}{parseFloat(quote.price).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(quote.status)}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
