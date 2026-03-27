'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Search, CheckCircle, MapPin, Clock, ShieldCheck } from 'lucide-react';

interface FeatureScore { feature: string; score: number; label: string }
interface SupplierMatch {
  id: string;
  name: string;
  company: string;
  location: string;
  trustScore: number;
  isVerified: boolean;
  matchScore: number;
  reasons: string[];
  featureImportance?: FeatureScore[];
  priceEstimate?: string;
  deliveryTime?: string;
  categories?: string[];
}

const CATEGORIES = [
  'Industrial Machinery', 'Textiles', 'Electronics & Electrical', 'Construction Materials',
  'Chemical & Petrochemical', 'Packaging', 'Automobile & Auto Parts', 'Agriculture',
  'Food Products', 'Pharmaceuticals', 'Metals & Steel', 'Plastics & Rubber',
];

const trustColor = (s: number) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-amber-400' : 'text-slate-400';
const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`;

export default function SmartMatchingPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', category: CATEGORIES[0], quantity: '', targetPrice: '', location: '', description: '' });
  const [matches, setMatches] = useState<SupplierMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!form.title.trim() || !form.category) { setError('Please fill in the title and category'); return; }
    setError('');
    setLoading(true);
    setSearched(true);
    setMatches([]);

    try {
      const res = await fetch('/api/ai/smart-matching', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category:    form.category,
          location:    form.location,
          budget:      form.targetPrice,
          description: form.description || form.title,
          title:       form.title,
          quantity:    form.quantity,
        }),
      });
      const data = await res.json();
      if (data.success && data.matches) {
        setMatches(data.matches);
      } else {
        setError(data.error || 'No matches found. Try adjusting your requirements.');
      }
    } catch {
      setError('Failed to fetch matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors min-h-[44px]">
          ← Back
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" /> AI Smart Matching
            </h1>
            <p className="text-slate-400 text-sm mt-1">Find verified suppliers using NVIDIA DeepSeek AI</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 sticky top-6">
              <div className="flex items-center gap-2 mb-5">
                <Search className="w-4 h-4 text-indigo-400" />
                <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-300">Your Requirements</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Product / Service Title *</label>
                  <input type="text" value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., Stainless Steel Pipes Grade 304"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category *</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Quantity</label>
                  <input type="text" value={form.quantity}
                    onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                    placeholder="e.g., 500 kg"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Budget</label>
                  <input type="text" value={form.targetPrice}
                    onChange={e => setForm(p => ({ ...p, targetPrice: e.target.value }))}
                    placeholder="e.g., ₹2,50,000"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Your Location</label>
                  <input type="text" value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g., Mumbai"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
                </div>

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button onClick={handleSearch} disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 min-h-[44px]">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Finding Matches...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Find Smart Matches</>
                  )}
                </button>

                <a href="/voice-rfq"
                  className="w-full block text-center bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold text-sm transition-colors min-h-[44px] leading-[44px]">
                  🎤 Use Voice RFQ Instead
                </a>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-4">
            {loading && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-10 text-center">
                <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white font-semibold">AI is analyzing your requirements…</p>
                <p className="text-slate-400 text-sm mt-1">Powered by NVIDIA DeepSeek V3.2</p>
              </div>
            )}

            {!loading && searched && matches.length === 0 && !error && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-10 text-center">
                <p className="text-slate-400">No verified suppliers found for this combination yet.</p>
                <p className="text-slate-500 text-sm mt-2">Try a different category or location.</p>
              </div>
            )}

            {!loading && !searched && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-10 text-center">
                <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">AI-Powered Supplier Matching</h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Enter your requirements and our AI will rank suppliers by category match, location, trust score, and budget compatibility.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6 text-left max-w-sm mx-auto">
                  {[['⚡','SHAP-like scoring','Explains every match decision'],['🔍','Multi-factor ranking','Category · Location · Trust · Budget']].map(([icon,title,desc]) => (
                    <div key={title} className="bg-slate-900/60 rounded-lg p-3">
                      <p className="text-lg mb-1">{icon}</p>
                      <p className="text-white text-sm font-semibold">{title}</p>
                      <p className="text-slate-400 text-xs">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && matches.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-slate-300 text-sm">Found <span className="text-white font-semibold">{matches.length}</span> AI-matched suppliers for <span className="text-indigo-400">"{form.title}"</span></p>
                </div>

                {matches.map((supplier, idx) => (
                  <div key={supplier.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/40 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-bold text-sm flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-white">{supplier.company || supplier.name}</h3>
                            {supplier.isVerified && (
                              <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/30 border border-green-700/50 px-2 py-0.5 rounded-full">
                                <ShieldCheck className="w-3 h-3" /> Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                            {supplier.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{supplier.location}</span>}
                            {supplier.deliveryTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{supplier.deliveryTime}</span>}
                            {supplier.priceEstimate && <span>{supplier.priceEstimate}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-indigo-400">{Math.round(supplier.matchScore * 100)}%</div>
                        <div className="text-xs text-slate-400">Match</div>
                        <div className={`text-xs font-semibold mt-1 ${trustColor(supplier.trustScore)}`}>
                          Trust {supplier.trustScore}
                        </div>
                      </div>
                    </div>

                    {/* SHAP-like breakdown bars */}
                    {supplier.featureImportance && supplier.featureImportance.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">AI Match Breakdown</p>
                        <div className="space-y-1.5">
                          {supplier.featureImportance.map(f => (
                            <div key={f.feature} className="flex items-center gap-2 text-xs">
                              <span className="text-slate-400 w-28 flex-shrink-0">{f.label}</span>
                              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.round(f.score * 100)}%` }} />
                              </div>
                              <span className="text-slate-300 w-8 text-right">{Math.round(f.score * 100)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Match reasons */}
                    {supplier.reasons && supplier.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {supplier.reasons.map((r, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-indigo-900/30 border border-indigo-700/40 text-indigo-300 rounded-full">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <a href={`/rfq/create?matchedSupplier=${supplier.id}`}
                        className="flex-1 min-w-[120px] text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors min-h-[44px] leading-[28px]">
                        Request Quote
                      </a>
                      <a href={`/supplier/${supplier.id}`}
                        className="px-4 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg text-sm transition-colors min-h-[44px] leading-[28px]">
                        View Profile
                      </a>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
