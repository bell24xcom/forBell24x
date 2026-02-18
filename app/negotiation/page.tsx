'use client';

import { useEffect, useState } from 'react';

interface Quote {
  id: string;
  price: number;
  quantity: string;
  timeline: string;
  description: string | null;
  terms: string | null;
  status: string;
  createdAt: string;
  rfq: {
    id: string;
    title: string;
    category: string;
    quantity: string;
    timeline: string;
    status: string;
  };
}

export default function NegotiationPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Counter offer form
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterTimeline, setCounterTimeline] = useState('');
  const [counterNote, setCounterNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  async function loadQuotes() {
    try {
      const res = await fetch('/api/supplier/quotes?status=PENDING&limit=20');
      const data = await res.json();
      if (data.success) setQuotes(data.quotes);
      else setError(data.error || 'Failed to load quotes');
    } catch {
      setError('Network error loading quotes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadQuotes(); }, []);

  async function handleAction(quoteId: string, action: 'accept' | 'reject' | 'counter') {
    setActionLoading(true);
    setActionMsg('');
    setActionError('');
    try {
      const body: Record<string, string> = { quoteId, action };
      if (action === 'counter') {
        if (!counterPrice) { setActionError('Please enter a counter price'); setActionLoading(false); return; }
        body.counterPrice = counterPrice;
        body.counterTimeline = counterTimeline;
        body.counterNote = counterNote;
      }

      const res = await fetch('/api/negotiation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        setActionError(data.error || 'Action failed');
      } else {
        setActionMsg(
          action === 'accept' ? 'Quote accepted!' :
          action === 'reject' ? 'Quote rejected.' :
          'Counter offer sent!'
        );
        setActiveQuoteId(null);
        setCounterPrice(''); setCounterTimeline(''); setCounterNote('');
        // Refresh list
        await loadQuotes();
      }
    } catch {
      setActionError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Negotiation Centre</h1>
          <p className="text-gray-400 mt-1">Review your pending quotes and manage offers</p>
        </div>

        {(actionMsg || actionError) && (
          <div
            className={`rounded-lg p-4 mb-6 border ${
              actionMsg
                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {actionMsg || actionError}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 animate-pulse h-32" />
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center text-gray-400">
            No pending quotes to negotiate at the moment.
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map(q => (
              <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                {/* Quote header */}
                <div className="flex flex-wrap gap-3 items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{q.rfq.title}</h2>
                    <p className="text-sm text-gray-400">{q.rfq.category} · {q.rfq.quantity}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">
                    PENDING
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">Your Price</p>
                    <p className="text-white font-semibold">₹{q.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Your Timeline</p>
                    <p className="text-white">{q.timeline}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Quantity</p>
                    <p className="text-white">{q.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Submitted</p>
                    <p className="text-white">{new Date(q.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                {q.terms && (
                  <p className="text-xs text-gray-400 mb-4 bg-white/5 rounded p-2 italic">{q.terms}</p>
                )}

                {/* Action buttons (supplier can counter; buyer can accept/reject — shown if logged in as buyer) */}
                {activeQuoteId !== q.id ? (
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => { setActiveQuoteId(q.id); setActionMsg(''); setActionError(''); }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Counter Offer
                    </button>
                    <button
                      onClick={() => handleAction(q.id, 'accept')}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(q.id, 'reject')}
                      disabled={actionLoading}
                      className="bg-red-600/80 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-2">
                    <h3 className="text-sm font-semibold text-white mb-3">Your Counter Offer</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">New Price (₹) *</label>
                        <input
                          type="number"
                          min="0"
                          value={counterPrice}
                          onChange={e => setCounterPrice(e.target.value)}
                          placeholder={String(q.price)}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">New Timeline</label>
                        <input
                          type="text"
                          value={counterTimeline}
                          onChange={e => setCounterTimeline(e.target.value)}
                          placeholder={q.timeline}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Reason / Note</label>
                        <input
                          type="text"
                          value={counterNote}
                          onChange={e => setCounterNote(e.target.value)}
                          placeholder="e.g. raw material cost increase"
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction(q.id, 'counter')}
                        disabled={actionLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {actionLoading ? 'Sending...' : 'Send Counter Offer'}
                      </button>
                      <button
                        onClick={() => { setActiveQuoteId(null); setCounterPrice(''); setCounterTimeline(''); setCounterNote(''); }}
                        className="border border-white/20 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
