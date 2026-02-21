import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/contexts/AuthContext';

export default function RFQDetailPage() {
  const [rfq, setRFQ] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteData, setQuoteData] = useState({
    price: '',
    quantity: '',
    timeline: '',
    description: '',
    terms: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSession();

  useEffect(() => {
    if (!user) {
      setIsLoggedIn(false);
    } else {
      setIsLoggedIn(true);
    }
  }, [user]);

  useEffect(() => {
    fetchRFQ();
  }, [pathname]);

  const fetchRFQ = async () => {
    try {
      const response = await fetch(`/api/rfq/${pathname.split('/').pop()}`);
      const data = await response.json();
      if (data.success) {
        setRFQ(data.rfq);
      } else {
        setError(data.error || 'RFQ not found');
      }
    } catch (err) {
      console.error('Error fetching RFQ:', err);
      setError('Failed to load RFQ');
    }
  };

  const submitQuote = async () => {
    if (!quoteData.price || !quoteData.quantity || !quoteData.timeline) {
      setError('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/supplier/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({
          rfqId: rfq.id,
          price: parseFloat(quoteData.price),
          quantity: quoteData.quantity,
          timeline: quoteData.timeline,
          description: quoteData.description,
          terms: quoteData.terms,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quote');
      }

      const data = await response.json();
      if (data.success) {
        setShowQuoteForm(false);
        setQuoteData({ price: '', quantity: '', timeline: '', description: '', terms: '' });
        alert('Quote submitted successfully!');
      } else {
        setError(data.error || 'Failed to submit quote');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuote = () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?next=${encodeURIComponent(pathname)}`);
    } else {
      setShowQuoteForm(true);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-900/50 rounded-lg p-4 text-red-300">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-8 text-slate-400">
            <p>Loading RFQ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-slate-400">
            <li>
              <a href="/rfq" className="hover:text-white">Marketplace</a>
            </li>
            <li>
              <span className="text-white">RFQ Details</span>
            </li>
          </ol>
        </nav>

        {/* RFQ Content */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            {/* RFQ Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">{rfq.title}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>RFQ #{rfq.id}</span>
                <span>Posted {new Date(rfq.createdAt).toLocaleDateString()}</span>
                <span>Views: {rfq.views}</span>
              </div>
            </div>

            {/* RFQ Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium mb-2">Category</h3>
                <p className="text-slate-900">{rfq.category}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Quantity</h3>
                <p className="text-slate-900">{rfq.quantity} {rfq.unit}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Budget</h3>
                <p className="text-slate-900">₹{rfq.maxBudget.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Timeline</h3>
                <p className="text-slate-900">{rfq.timeline}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Location</h3>
                <p className="text-slate-900">{rfq.location}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Urgency</h3>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white">
                  {rfq.urgency}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-slate-900">{rfq.description}</p>
            </div>

            {/* Buyer Info */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Buyer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500">Name</p>
                  <p className="text-slate-900 font-medium">{rfq.user.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Company</p>
                  <p className="text-slate-900 font-medium">{rfq.user.company}</p>
                </div>
                <div>
                  <p className="text-slate-500">Location</p>
                  <p className="text-slate-900">{rfq.user.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Button */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <button
              onClick={handleQuote}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
            >
              {isLoggedIn ? 'Submit Quote' : 'Login to Quote'}
            </button>
          </div>
        </div>

        {/* Quote Form */}
        {showQuoteForm && (
          <div className="bg-white rounded-xl shadow-sm mt-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Submit Your Quote</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (₹)</label>
                    <input
                      type="number"
                      value={quoteData.price}
                      onChange={(e) => setQuoteData({ ...quoteData, price: e.target.value })}
                      placeholder="10000"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <input
                      type="text"
                      value={quoteData.quantity}
                      onChange={(e) => setQuoteData({ ...quoteData, quantity: e.target.value })}
                      placeholder="1000 units"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Delivery Timeline</label>
                    <input
                      type="text"
                      value={quoteData.timeline}
                      onChange={(e) => setQuoteData({ ...quoteData, timeline: e.target.value })}
                      placeholder="14 days"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={quoteData.description}
                    onChange={(e) => setQuoteData({ ...quoteData, description: e.target.value })}
                    placeholder="Describe your offer and why the buyer should choose you"
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Terms</label>
                  <textarea
                    value={quoteData.terms}
                    onChange={(e) => setQuoteData({ ...quoteData, terms: e.target.value })}
                    placeholder="Payment terms, warranty, delivery terms"
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {error && (
                  <div className="bg-red-900/50 rounded-lg p-3 text-red-300">
                    {error}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowQuoteForm(false)}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitQuote}
                    disabled={isSubmitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : null}
                    Submit Quote
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}