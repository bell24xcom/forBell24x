'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mic, Video, FileText, Search, ArrowRight, CheckCircle,
  Zap, Shield, Globe, Star, Clock, TrendingUp, Users, Package,
  ChevronRight, X, Phone, Loader2
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
  suppliers: number;
  rfqs: number;
  categories: number;
}

interface LiveRFQ {
  id: string;
  title: string;
  category: string;
  location: string | null;
  urgency: string;
  createdAt: string;
  views: number;
}

// ─── OTP Login Modal ──────────────────────────────────────────────────────────

function LoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Failed to send OTP'); return; }
      setStep('otp');
    } catch { setError('Network error. Try again.'); }
    finally { setLoading(false); }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Invalid OTP'); return; }
      if (data.token) localStorage.setItem('bell24h_token', data.token);
      if (data.user) localStorage.setItem('bell24h_user', JSON.stringify(data.user));
      onClose();
      router.push('/dashboard');
    } catch { setError('Network error. Try again.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Welcome to Bell24h</h2>
            <p className="text-slate-400 text-sm mt-0.5">Sign in with your phone number</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2 text-red-300 text-sm mb-4">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 focus-within:border-indigo-500 rounded-lg px-3 transition-colors">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-400 text-sm">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98765 43210"
                className="flex-1 bg-transparent py-3 text-white placeholder-slate-500 outline-none text-sm"
                required pattern="\d{10}" autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Get OTP <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-slate-400 text-sm">OTP sent to +91 {phone.slice(0, 5)}*****</p>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="● ● ● ● ● ●"
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-4 py-3 text-white text-center text-xl tracking-[0.5em] outline-none transition-colors"
              required pattern="\d{6}" autoFocus
            />
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Verify & Login</>}
            </button>
            <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError(''); }} className="w-full text-slate-400 hover:text-white text-sm transition-colors">
              ← Change number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────

const TOP_CATEGORIES = [
  { name: 'Textiles & Fabric', icon: '🧵', slug: 'textiles' },
  { name: 'Electronics', icon: '⚡', slug: 'electronics' },
  { name: 'Industrial Equipment', icon: '🏭', slug: 'industrial' },
  { name: 'Chemicals', icon: '🧪', slug: 'chemicals' },
  { name: 'Food & Agriculture', icon: '🌾', slug: 'food' },
  { name: 'Packaging', icon: '📦', slug: 'packaging' },
  { name: 'Construction', icon: '🏗️', slug: 'construction' },
  { name: 'Automotive Parts', icon: '🔧', slug: 'automotive' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [stats, setStats] = useState<Stats>({ suppliers: 157, rfqs: 327, categories: 450 });
  const [liveRFQs, setLiveRFQs] = useState<LiveRFQ[]>([]);
  const [rfqTab, setRfqTab] = useState<'voice' | 'video' | 'text'>('voice');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => {
      if (d.success && d.stats) setStats(d.stats);
    }).catch(() => {});

    fetch('/api/marketplace/rfqs?limit=6').then(r => r.json()).then(d => {
      if (d.rfqs) setLiveRFQs(d.rfqs);
    }).catch(() => {});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) router.push(`/marketplace?search=${encodeURIComponent(search)}`);
  }

  const urgencyColor: Record<string, string> = {
    URGENT: 'bg-red-500/20 text-red-400 border-red-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    NORMAL: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    LOW: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-900/40 border border-indigo-700/50 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-6">
            <Zap className="w-3.5 h-3.5" />
            India's AI-Powered B2B Marketplace
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Find Verified Suppliers<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
              in 24 Hours
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Post RFQs by voice, video, or text. AI matches you to verified Indian suppliers instantly.
            No middlemen. No delays.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 focus-within:border-indigo-500 rounded-xl px-4 py-3 max-w-2xl mx-auto mb-8 transition-colors">
            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for suppliers, products, categories…"
              className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[36px]">
              Search
            </button>
          </form>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 flex-wrap text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-indigo-400" /><strong className="text-white">{stats.suppliers.toLocaleString('en-IN')}</strong> Verified Suppliers</span>
            <span className="flex items-center gap-1.5"><Package className="w-4 h-4 text-indigo-400" /><strong className="text-white">{stats.categories}+</strong> Categories</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400" /><strong className="text-white">24H</strong> Avg Response</span>
          </div>
        </div>
      </section>

      {/* ── RFQ Tabs ─────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 text-center">Post Your RFQ — It's Free</h2>

          {/* Tab selector */}
          <div className="flex bg-slate-900/60 rounded-xl p-1 mb-6">
            {([
              { id: 'voice', icon: Mic, label: 'Voice RFQ', desc: 'Speak your requirement', href: '/voice-rfq' },
              { id: 'video', icon: Video, label: 'Video RFQ', desc: 'Show what you need', href: '/video-rfq' },
              { id: 'text', icon: FileText, label: 'Text RFQ', desc: 'Type it out', href: '/rfq/create' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setRfqTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-colors ${
                  rfqTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{tab.label}</span>
                <span className="text-xs opacity-70 hidden sm:block">{tab.desc}</span>
              </button>
            ))}
          </div>

          {/* CTA for selected tab */}
          {rfqTab === 'voice' && (
            <div className="text-center space-y-3">
              <p className="text-slate-400 text-sm">Speak your requirement in Hindi or English. AI extracts all details automatically.</p>
              <Link href="/voice-rfq" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl min-h-[44px] transition-colors">
                <Mic className="w-5 h-5" /> Start Voice RFQ
              </Link>
            </div>
          )}
          {rfqTab === 'video' && (
            <div className="text-center space-y-3">
              <p className="text-slate-400 text-sm">Record a short video. Show your product sample or describe what you need visually.</p>
              <Link href="/video-rfq" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl min-h-[44px] transition-colors">
                <Video className="w-5 h-5" /> Record Video RFQ
              </Link>
            </div>
          )}
          {rfqTab === 'text' && (
            <div className="text-center space-y-3">
              <p className="text-slate-400 text-sm">Fill a simple form. Specify product, quantity, location, and budget.</p>
              <Link href="/rfq/create" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl min-h-[44px] transition-colors">
                <FileText className="w-5 h-5" /> Create Text RFQ
              </Link>
            </div>
          )}

          <p className="text-center text-xs text-slate-500 mt-4">
            Already have an account?{' '}
            <button onClick={() => setShowLogin(true)} className="text-indigo-400 hover:text-indigo-300 underline">
              Sign in
            </button>
          </p>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Browse by Category</h2>
          <Link href="/categories" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
            All categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TOP_CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-indigo-500/50 rounded-xl p-4 flex items-center gap-3 transition-all group"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Live RFQ Feed ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Live RFQs</h2>
            <span className="flex items-center gap-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2 py-0.5 text-xs">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
          </div>
          <Link href="/marketplace" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {liveRFQs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveRFQs.map(rfq => (
              <Link
                key={rfq.id}
                href={`/rfq/${rfq.id}`}
                className="bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-indigo-500/30 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-white font-medium text-sm leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
                    {rfq.title}
                  </h3>
                  <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded border ${urgencyColor[rfq.urgency] || urgencyColor.NORMAL}`}>
                    {rfq.urgency}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="bg-slate-700 px-2 py-0.5 rounded">{rfq.category}</span>
                  {rfq.location && <span>{rfq.location}</span>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-slate-700 rounded mb-3 w-3/4" />
                <div className="h-3 bg-slate-700/60 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Trust Features ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Why Bell24h?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Verified Suppliers', desc: 'Every supplier is GST-verified and trust-scored. No fake listings.', color: 'text-green-400' },
            { icon: Zap, title: 'AI-Powered Matching', desc: 'Our AI matches your RFQ to the most relevant suppliers in seconds.', color: 'text-yellow-400' },
            { icon: Globe, title: 'Pan-India Network', desc: 'Suppliers from 450+ categories across every major Indian city.', color: 'text-blue-400' },
          ].map(f => (
            <div key={f.title} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-6">
              <f.icon className={`w-8 h-8 ${f.color} mb-4`} />
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-r from-indigo-900/60 to-blue-900/60 border border-indigo-700/40 rounded-2xl p-8 md:p-12 text-center">
          <TrendingUp className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to source smarter?</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">Join {stats.suppliers.toLocaleString('en-IN')} verified suppliers and thousands of buyers already on Bell24h.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => setShowLogin(true)}
              className="min-h-[44px] inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Star className="w-4 h-4" /> Join Free Today
            </button>
            <Link
              href="/marketplace"
              className="min-h-[44px] inline-flex items-center gap-2 border border-slate-600 hover:border-indigo-500 text-slate-300 hover:text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Browse Marketplace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
