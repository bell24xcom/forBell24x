import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/contexts/AuthContext';

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
  const router = useRouter();
  const { user } = useSession();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    fetchStats();
    fetchQuotes();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/supplier/stats');
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
      const response = await fetch('/api/supplier/quotes');
      const data = await response.json();
      if (data.success) {
        setQuotes(data.quotes);
      }
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError('Failed to load quotes');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-500',
      ACCEPTED: 'bg-green-500',
      REJECTED: 'bg-red-500',
      EXPIRED: 'bg-gray-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-slate-400">
            <li>
              <a href="/dashboard" className="hover:text-white">Dashboard</a>
            </li>
            <li>
              <span className="text-white">Supplier Dashboard</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Supplier Dashboard
          </h1>
          <p className="text-slate-400">
            Welcome back, {user?.name} ({user?.company})
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-indigo-600">₹{stats.totalEarned.toLocaleString('en-IN')}</div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-sm text-slate-500">Total Earned</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-green-600">{stats.wonQuotes}</div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-sm text-slate-500">RFQs Won</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-yellow-600">{stats.activeQuotes}</div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-sm text-slate-500">Active Quotes</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-blue-600">{stats.responseRate}</div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="text-sm text-slate-500">Response Rate</div>
          </div>
        </div>

        {/* Browse RFQs CTA */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Looking for new opportunities?</h3>
              <p className="text-slate-400">Browse new RFQs and submit your quotes</p>
            </div>
            <a href="/rfq" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
              Browse RFQs
            </a>
          </div>
        </div>

        {/* Recent Quotes Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold">Recent Quotes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">RFQ Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">My Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No quotes submitted yet
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote: any) => (
                    <tr key={quote.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {quote.rfq.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {quote.rfq.user.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        ₹{parseFloat(quote.price).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(quote.status)}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDateTime(new Date(quote.createdAt))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}