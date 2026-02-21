import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/contexts/AuthContext';

export default function NegotiationPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [negotiationData, setNegotiationData] = useState({
    counterPrice: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { user } = useSession();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/dashboard/quotes');
      const data = await response.json();
      if (data.success) {
        setQuotes(data.quotes.filter((q: any) => q.status === 'PENDING'));
      }
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError('Failed to load quotes');
    }
  };

  const handleNegotiation = async (quoteId: string, action: string) => {
    if (action === 'counter') {
      setSelectedQuote(quoteId);
    } else {
      setIsLoading(true);
      setError('');
      setSuccess('');

      try {
        const response = await fetch('/api/negotiation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          },
          body: JSON.stringify({
            quoteId,
            action,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to process negotiation');
        }

        const data = await response.json();
        if (data.success) {
          setSuccess(`Quote ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
          fetchQuotes();
        } else {
          setError(data.error || 'Failed to process negotiation');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const submitCounter = async () => {
    if (!negotiationData.counterPrice) {
      setError('Please enter a counter price');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/negotiation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({
          quoteId: selectedQuote!,
          action: 'counter',
          counterPrice: parseFloat(negotiationData.counterPrice),
          message: negotiationData.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit counter offer');
      }

      const data = await response.json();
      if (data.success) {
        setSuccess('Counter offer submitted successfully!');
        setNegotiationData({ counterPrice: '', message: '' });
        setSelectedQuote(null);
        fetchQuotes();
      } else {
        setError(data.error || 'Failed to submit counter offer');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-500',
      ACCEPTED: 'bg-green-500',
      REJECTED: 'bg-red-500',
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
              <span className="text-white">Negotiation</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Negotiation</h1>
          <p className="text-slate-400">
            Manage your quote negotiations with buyers
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-900/50 rounded-lg p-4 mb-6 text-green-300">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-900/50 rounded-lg p-4 mb-6 text-red-300">
            {error}
          </div>
        )}

        {/* Quotes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-6 text-center text-slate-400">
              <p>No pending quotes to negotiate</p>
            </div>
          ) : (
            quotes.map((quote: any) => (
              <div key={quote.id} className="bg-white rounded-xl shadow-sm p-6">
                {/* Quote Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center font-medium text-white">
                      {getInitials(quote.rfq.user.name)}
                    </div>
                    <div>
                      <h3 className="font-medium">{quote.rfq.user.company}</h3>
                      <p className="text-sm text-slate-400">{quote.rfq.user.name}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(quote.status)}`}>
                    {quote.status}
                  </span>
                </div>

                {/* RFQ Info */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">RFQ: {quote.rfq.title}</h4>
                  <p className="text-sm text-slate-400">
                    Category: {quote.rfq.category}
                  </p>
                </div>

                {/* Quote Details */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Your Quote:</span>
                    <span className="font-medium text-slate-900">₹{parseFloat(quote.price).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Quantity:</span>
                    <span className="text-sm text-slate-900">{quote.quantity}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleNegotiation(quote.id, 'accept')}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg disabled:opacity-50"
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : null}
                    Accept
                  </button>
                  <button
                    onClick={() => handleNegotiation(quote.id, 'counter')}
                    disabled={isLoading}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg disabled:opacity-50"
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : null}
                    Counter
                  </button>
                  <button
                    onClick={() => handleNegotiation(quote.id, 'reject')}
                    disabled={isLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg disabled:opacity-50"
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : null}
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Counter Offer Form */}
        {selectedQuote && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Submit Counter Offer</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Counter Price (₹)</label>
                <input
                  type="number"
                  value={negotiationData.counterPrice}
                  onChange={(e) => setNegotiationData({ ...negotiationData, counterPrice: e.target.value })}
                  placeholder="9500"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={negotiationData.message}
                  onChange={(e) => setNegotiationData({ ...negotiationData, message: e.target.value })}
                  placeholder="Add a message to your counter offer"
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitCounter}
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : null}
                  Submit Counter Offer
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}