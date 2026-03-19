'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/app/contexts/AuthContext';
import { Video, Mic, FileText, MapPin, Clock, DollarSign, Package, AlertTriangle, CheckCircle } from 'lucide-react';

const URGENCY_CONFIG = {
  LOW:      { bg: 'bg-blue-100',    text: 'text-blue-800',  border: 'border-blue-200',  label: 'Low Priority' },
  NORMAL:   { bg: 'bg-green-100',   text: 'text-green-800',  border: 'border-green-200', label: 'Normal' },
  HIGH:     { bg: 'bg-orange-100',  text: 'text-orange-800', border: 'border-orange-200', label: 'High Priority' },
  URGENT:   { bg: 'bg-red-100',     text: 'text-red-800',    border: 'border-red-200',    label: 'Urgent' },
};

const RFQ_TYPE_ICONS = {
  video: <Video size={18} className="text-purple-500" />,
  voice: <Mic size={18} className="text-blue-500" />,
  text:  <FileText size={18} className="text-slate-500" />,
};

export default function RFQDetailPage() {
  const [rfq, setRFQ] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
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
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => setIsLoggedIn(!!(data?.success && data?.user)))
      .catch(() => setIsLoggedIn(false))
      .finally(() => setAuthChecked(true));
  }, [user]);

  useEffect(() => { fetchRFQ(); }, [pathname]);

  const fetchRFQ = async () => {
    try {
      const response = await fetch(`/api/rfq/${pathname.split('/').pop()}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) setRFQ(data.rfq);
      else setError(data.error || 'RFQ not found');
    } catch {
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
      if (!response.ok) throw new Error('Failed to submit quote');
      const data = await response.json();
      if (data.success) {
        setShowQuoteForm(false);
        setQuoteData({ price: '', quantity: '', timeline: '', description: '', terms: '' });
        alert('Quote submitted successfully!');
        router.push('/supplier/my-quotes');
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
      localStorage.setItem('bell24h_returnUrl', window.location.href);
      router.push(`/auth/phone-email?redirect=${encodeURIComponent(pathname)}`);
    } else {
      setShowQuoteForm(true);
    }
  };

  const urgency = rfq?.urgency ? URGENCY_CONFIG[rfq.urgency as keyof typeof URGENCY_CONFIG] : URGENCY_CONFIG.NORMAL;
  const rfqType = rfq?.type?.toLowerCase() || 'text';

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="bg-red-900/50 border border-red-700/50 rounded-xl p-6 max-w-md w-full mx-4 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-red-300 mb-2">Something went wrong</h2>
          <p className="text-red-400/80 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading RFQ details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm">
          <a href="/rfq" className="text-slate-400 hover:text-white transition-colors">Marketplace</a>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 truncate max-w-[200px]">{rfq.title}</span>
        </nav>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* RFQ Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 border-b border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1.5 rounded-lg bg-white/10">
                    {RFQ_TYPE_ICONS[rfqType as keyof typeof RFQ_TYPE_ICONS] || RFQ_TYPE_ICONS.text}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${urgency.bg} ${urgency.text} ${urgency.border}`}>
                    {urgency.label}
                  </span>
                  <span className="text-slate-500 text-xs">RFQ #{rfq.id.slice(0, 8)}</span>
                </div>
                <h1 className="text-xl font-bold text-white leading-tight">{rfq.title}</h1>
                <p className="text-slate-400 text-sm mt-1">
                  Posted {new Date(rfq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {rfq.views} views
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="p-6 border-b border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon={<Package size={18} className="text-indigo-500" />} label="Quantity" value={`${rfq.quantity} ${rfq.unit}`} />
              <MetricCard icon={<DollarSign size={18} className="text-green-500" />} label="Budget" value={rfq.maxBudget ? `₹${Number(rfq.maxBudget).toLocaleString('en-IN')}` : 'Negotiable'} />
              <MetricCard icon={<Clock size={18} className="text-amber-500" />} label="Timeline" value={rfq.timeline || 'Flexible'} />
              <MetricCard icon={<MapPin size={18} className="text-red-500" />} label="Location" value={rfq.location || 'Pan India'} />
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Category & Description */}
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category</p>
                  <span className="inline-block bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1.5 rounded-lg border border-indigo-100">
                    {rfq.category}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</p>
                  <p className="text-slate-800 text-sm leading-relaxed font-medium">{rfq.description || 'No description provided.'}</p>
                </div>
              </div>

              {/* Right: Buyer Info */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Buyer Information</p>
                {rfq.user?.name || rfq.user?.company ? (
                  <div className="space-y-3">
                    {rfq.user?.company && (
                      <div>
                        <p className="text-slate-500 text-xs">Company</p>
                        <p className="text-slate-900 font-semibold">{rfq.user.company}</p>
                      </div>
                    )}
                    {rfq.user?.name && (
                      <div>
                        <p className="text-slate-500 text-xs">Contact</p>
                        <p className="text-slate-900 font-semibold">{rfq.user.name}</p>
                      </div>
                    )}
                    {rfq.user?.location && (
                      <div>
                        <p className="text-slate-500 text-xs">Location</p>
                        <p className="text-slate-700 font-medium">{rfq.user.location}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>Posted by Bell24h Marketplace</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky CTA Bar */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 md:static fixed-bottom-bar md:border-t md:border-slate-200 md:rounded-b-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="hidden md:block text-sm text-slate-500">
                {isLoggedIn ? 'Ready to submit your quote' : 'Login to submit a quote'}
              </div>
              <button
                onClick={handleQuote}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isLoggedIn ? 'Submit Your Quote' : 'Login to Quote'}
              </button>
            </div>
          </div>
        </div>

        {/* Quote Form Modal */}
        {showQuoteForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Submit Your Quote</h2>
                  <button
                    onClick={() => setShowQuoteForm(false)}
                    className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <p className="text-slate-500 text-sm mt-1">Quote for: <span className="font-medium text-slate-700">{rfq.title}</span></p>
              </div>

              <div className="p-6 space-y-6">
                {/* Required Fields */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Required Information</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Price (₹) *</label>
                      <input
                        type="number"
                        value={quoteData.price}
                        onChange={(e) => setQuoteData({ ...quoteData, price: e.target.value })}
                        placeholder="50000"
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity *</label>
                      <input
                        type="text"
                        value={quoteData.quantity}
                        onChange={(e) => setQuoteData({ ...quoteData, quantity: e.target.value })}
                        placeholder="500 units"
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Delivery Timeline *</label>
                      <input
                        type="text"
                        value={quoteData.timeline}
                        onChange={(e) => setQuoteData({ ...quoteData, timeline: e.target.value })}
                        placeholder="21 days"
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Your Offer</p>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
                  <textarea
                    value={quoteData.description}
                    onChange={(e) => setQuoteData({ ...quoteData, description: e.target.value })}
                    placeholder="Describe your product specifications, material quality, certifications, and what makes your offer competitive..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-sm leading-relaxed"
                    required
                  />
                </div>

                {/* Terms */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Terms & Conditions</p>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Terms</label>
                  <textarea
                    value={quoteData.terms}
                    onChange={(e) => setQuoteData({ ...quoteData, terms: e.target.value })}
                    placeholder="Payment terms (e.g., 50% advance, 50% on delivery), warranty details, delivery terms, GST inclusion status..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-sm leading-relaxed"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowQuoteForm(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitQuote}
                    disabled={isSubmitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-4 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/25 disabled:shadow-none flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Quote'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky CTA overlay */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-40">
        <button
          onClick={handleQuote}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg"
        >
          {isLoggedIn ? 'Submit Your Quote' : 'Login to Quote'}
        </button>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-slate-900 font-bold text-lg leading-tight">{value}</p>
    </div>
  );
}
