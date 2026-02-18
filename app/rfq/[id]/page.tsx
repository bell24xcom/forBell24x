'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface RFQ {
  id: string;
  title: string;
  description: string | null;
  category: string;
  quantity: string;
  unit: string;
  minBudget: number | null;
  maxBudget: number | null;
  timeline: string;
  requirements: string | null;
  urgency: string;
  status: string;
  location: string | null;
  tags: string[];
  views: number;
  totalQuotes: number;
  createdAt: string;
  user: {
    name: string | null;
    company: string | null;
    location: string | null;
    isVerified: boolean;
  };
}

export default function RFQDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quote form state
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteQty, setQuoteQty] = useState('');
  const [quoteTimeline, setQuoteTimeline] = useState('');
  const [quoteDesc, setQuoteDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState('');
  const [quoteError, setQuoteError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/rfq/${id}`);
        if (res.status === 401) { router.push('/login'); return; }
        const data = await res.json();
        if (!data.success) { setError(data.error || 'RFQ not found'); return; }
        setRfq(data.rfq);
      } catch {
        setError('Failed to load RFQ');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id, router]);

  async function handleSubmitQuote(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setQuoteError('');
    setQuoteSuccess('');
    try {
      const res = await fetch('/api/supplier/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: id,
          price: quotePrice,
          quantity: quoteQty,
          timeline: quoteTimeline,
          description: quoteDesc,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setQuoteError(data.error || 'Failed to submit quote');
      } else {
        setQuoteSuccess('Quote submitted successfully!');
        setQuotePrice(''); setQuoteQty(''); setQuoteTimeline(''); setQuoteDesc('');
      }
    } catch {
      setQuoteError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const urgencyColor: Record<string, string> = {
    URGENT: 'bg-red-500/20 text-red-300',
    HIGH: 'bg-orange-500/20 text-orange-300',
    NORMAL: 'bg-blue-500/20 text-blue-300',
    LOW: 'bg-gray-500/20 text-gray-400',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Loading RFQ...</p>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error || 'RFQ not found'}</p>
          <button onClick={() => router.back()} className="text-indigo-400 underline">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Back */}
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white mb-6 flex items-center gap-1">
          ← Back
        </button>

        {/* RFQ Header */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap gap-3 items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">{rfq.title}</h1>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${urgencyColor[rfq.urgency] || 'bg-gray-500/20 text-gray-400'}`}>
                {rfq.urgency}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">
                {rfq.status}
              </span>
            </div>
          </div>

          {rfq.description && (
            <p className="text-gray-300 mb-4">{rfq.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Category</p>
              <p className="text-white font-medium">{rfq.category}</p>
            </div>
            <div>
              <p className="text-gray-500">Quantity</p>
              <p className="text-white font-medium">{rfq.quantity} {rfq.unit}</p>
            </div>
            <div>
              <p className="text-gray-500">Timeline</p>
              <p className="text-white font-medium">{rfq.timeline}</p>
            </div>
            <div>
              <p className="text-gray-500">Budget</p>
              <p className="text-white font-medium">
                {rfq.minBudget || rfq.maxBudget
                  ? `₹${(rfq.minBudget || 0).toLocaleString('en-IN')} – ₹${(rfq.maxBudget || 0).toLocaleString('en-IN')}`
                  : 'Not specified'}
              </p>
            </div>
          </div>

          {rfq.requirements && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-gray-500 text-sm mb-1">Requirements</p>
              <p className="text-gray-300 text-sm">{rfq.requirements}</p>
            </div>
          )}

          <div className="flex gap-4 mt-4 pt-4 border-t border-white/10 text-sm text-gray-400">
            <span>{rfq.views} views</span>
            <span>{rfq.totalQuotes} quotes</span>
            <span>Posted {new Date(rfq.createdAt).toLocaleDateString('en-IN')}</span>
            {rfq.location && <span>📍 {rfq.location}</span>}
          </div>
        </div>

        {/* Buyer info */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Buyer</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white">
              {(rfq.user.name || rfq.user.company || '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium">
                {rfq.user.company || rfq.user.name || 'Anonymous'}
                {rfq.user.isVerified && (
                  <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Verified</span>
                )}
              </p>
              {rfq.user.location && (
                <p className="text-gray-400 text-sm">📍 {rfq.user.location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quote submission form */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Submit Your Quote</h2>

          {quoteSuccess && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-300 rounded-lg p-3 mb-4">
              {quoteSuccess}
            </div>
          )}
          {quoteError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3 mb-4">
              {quoteError}
            </div>
          )}

          <form onSubmit={handleSubmitQuote} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Your Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={quotePrice}
                onChange={e => setQuotePrice(e.target.value)}
                placeholder="e.g. 150000"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Quantity you can supply *</label>
              <input
                type="text"
                required
                value={quoteQty}
                onChange={e => setQuoteQty(e.target.value)}
                placeholder="e.g. 500 units"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Delivery Timeline *</label>
              <input
                type="text"
                required
                value={quoteTimeline}
                onChange={e => setQuoteTimeline(e.target.value)}
                placeholder="e.g. 15 days"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Additional Notes</label>
              <input
                type="text"
                value={quoteDesc}
                onChange={e => setQuoteDesc(e.target.value)}
                placeholder="Quality, certifications, etc."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Quote'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
