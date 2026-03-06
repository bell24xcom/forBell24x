'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Search, Filter, MapPin, IndianRupee, Clock, MessageSquare, Mic, Video, FileText, X, CheckCircle } from 'lucide-react';

interface RFQ {
  id: string;
  title: string;
  category: string;
  location: string;
  quantity: string;
  unit: string;
  budget: number;
  type: 'VOICE' | 'VIDEO' | 'TEXT';
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  quotesCount: number;
  createdAt: string;
}

export default function BrowseRFQsPage() {
  const router = useRouter();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [quoteModal, setQuoteModal] = useState<RFQ | null>(null);
  const [quoteForm, setQuoteForm] = useState({ price: '', deliveryDays: '', notes: '', terms: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [quotedRfqs, setQuotedRfqs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async () => {
    try {
      const response = await fetch('/api/marketplace/rfqs?status=active', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setRfqs(data.rfqs || []);
      }
    } catch (error) {
      console.error('Error fetching RFQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteModal) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/supplier/quotes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: quoteModal.id,
          price: parseFloat(quoteForm.price),
          deliveryDays: parseInt(quoteForm.deliveryDays),
          notes: quoteForm.notes,
          terms: quoteForm.terms,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSubmitSuccess(`Quote submitted for "${quoteModal.title}"!`);
        setQuotedRfqs(prev => new Set(prev).add(quoteModal.id));
        setQuoteModal(null);
        setQuoteForm({ price: '', deliveryDays: '', notes: '', terms: '' });
        setTimeout(() => setSubmitSuccess(''), 4000);
      } else {
        setSubmitError(data.error || 'Failed to submit quote');
      }
    } catch (error) {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VOICE': return <Mic className="w-4 h-4" />;
      case 'VIDEO': return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH': return 'bg-red-900/40 text-red-300';
      case 'MEDIUM': return 'bg-yellow-900/40 text-yellow-300';
      default: return 'bg-green-900/40 text-green-300';
    }
  };

  const filteredRFQs = rfqs.filter(rfq => {
    if (searchQuery && !rfq.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (categoryFilter !== 'all' && rfq.category !== categoryFilter) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors cursor-pointer">
          ← Back
        </button>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Active RFQs</h1>
          <p className="text-slate-400">Find RFQs matching your business and submit competitive quotes</p>
        </div>

        {/* Success Toast */}
        {submitSuccess && (
          <div className="mb-4 p-4 bg-emerald-900/40 border border-emerald-700 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300">{submitSuccess}</span>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search RFQs by title, product, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Steel & Metal">Steel & Metal</option>
              <option value="Electronics">Electronics</option>
              <option value="Chemicals">Chemicals</option>
              <option value="Machinery">Machinery</option>
              <option value="Textiles">Textiles</option>
              <option value="Construction">Construction</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* RFQ Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading active RFQs...</p>
          </div>
        ) : filteredRFQs.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active RFQs Found</h3>
            <p className="text-slate-400 mb-6">
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your search filters'
                : 'New RFQs are posted daily — check back soon!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRFQs.map((rfq) => (
              <div
                key={rfq.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/40 text-blue-300 rounded-full text-sm">
                    {getTypeIcon(rfq.type)}
                    {rfq.type || 'TEXT'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(rfq.urgency)}`}>
                    {rfq.urgency || 'NORMAL'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">{rfq.title}</h3>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Filter className="w-4 h-4 text-slate-500" />
                    {rfq.category}
                  </div>
                  {rfq.location && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      {rfq.location}
                    </div>
                  )}
                  {rfq.budget > 0 && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <IndianRupee className="w-4 h-4 text-slate-500" />
                      Budget: ₹{rfq.budget.toLocaleString()}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <MessageSquare className="w-4 h-4" />
                    {rfq.quotesCount || 0} quotes submitted
                  </div>
                </div>

                {quotedRfqs.has(rfq.id) ? (
                  <div className="w-full px-4 py-2.5 bg-emerald-900/30 border border-emerald-700 text-emerald-400 text-center rounded-lg font-medium">
                    Quoted ✓
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setQuoteModal(rfq);
                      setSubmitError('');
                    }}
                    className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-center rounded-lg font-medium transition-colors min-h-[44px]"
                  >
                    Submit Quote →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quote Submission Modal */}
      {quoteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Submit Quote</h2>
              <button onClick={() => setQuoteModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* RFQ Summary */}
            <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
              <p className="text-sm text-slate-400">Quoting for:</p>
              <p className="text-white font-semibold">{quoteModal.title}</p>
              <div className="flex gap-4 mt-2 text-sm text-slate-400">
                <span>{quoteModal.category}</span>
                {quoteModal.quantity && <span>Qty: {quoteModal.quantity}</span>}
              </div>
            </div>

            <form onSubmit={handleSubmitQuote} className="p-6 space-y-4">
              {submitError && (
                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Your Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={quoteForm.price}
                  onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Delivery Timeline (days) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quoteForm.deliveryDays}
                  onChange={(e) => setQuoteForm({ ...quoteForm, deliveryDays: e.target.value })}
                  placeholder="e.g. 7"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notes / Comments</label>
                <textarea
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  placeholder="Any additional details about your offer..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Terms & Conditions</label>
                <textarea
                  value={quoteForm.terms}
                  onChange={(e) => setQuoteForm({ ...quoteForm, terms: e.target.value })}
                  placeholder="Payment terms, warranty, delivery conditions..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  {submitting ? 'Submitting...' : 'Submit Quote'}
                </button>
                <button
                  type="button"
                  onClick={() => setQuoteModal(null)}
                  className="px-4 py-3 border border-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
