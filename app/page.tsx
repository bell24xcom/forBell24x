'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Mic, Video, FileText, Brain, Lock, Zap, Globe, Sparkles, ArrowRight, Users, CheckCircle, ChevronRight } from 'lucide-react';

/* ============================================
   BELL24H PRODUCTION HOMEPAGE
   Single dark blue (#0F172A) throughout
   IndieHackers-inspired 3-column layout
   Compact vertical spacing
   ============================================ */

// Top 6 categories for homepage display
const TOP_CATEGORIES = [
  { name: 'Packaging', icon: '📦', rfqs: 2340, subcategories: 48 },
  { name: 'Chemicals', icon: '⚗️', rfqs: 1876, subcategories: 35 },
  { name: 'Electronics', icon: '⚡', rfqs: 3102, subcategories: 52 },
  { name: 'Construction', icon: '🏗️', rfqs: 4521, subcategories: 41 },
  { name: 'Machinery', icon: '🔧', rfqs: 1234, subcategories: 38 },
  { name: 'Textiles', icon: '👕', rfqs: 987, subcategories: 29 },
];

const STATS = [
  { value: '10,000+', label: 'Verified Suppliers' },
  { value: '450+', label: 'Categories' },
  { value: '24H', label: 'Avg Response' },
];

export default function HomePage() {
  return (
    <div className="bg-[#0F172A] min-h-screen">
      {/* === HERO SECTION === */}
      <HeroSection />

      {/* === VALUE PROPS - 3 Columns === */}
      <ValuePropsSection />

      {/* === HOW IT WORKS - 3 Steps === */}
      <HowItWorksSection />

      {/* === TOP CATEGORIES - 3 Columns === */}
      <CategoriesSection />

      {/* === STATS === */}
      <StatsSection />

      {/* === FINAL CTA === */}
      <FinalCTASection />
    </div>
  );
}

/* ---- HERO SECTION WITH 3-TAB DEMO ---- */
function HeroSection() {
  const [activeTab, setActiveTab] = useState<'voice' | 'video' | 'text'>('voice');

  return (
    <section className="relative pt-8 pb-12 lg:pt-12 lg:pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-blue-300 text-sm font-medium">India&apos;s #1 Multi-Modal B2B Platform</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 text-center">
          Post RFQs in{' '}
          <span className="text-blue-400">3 Different Ways</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 text-center">
          Choose Voice, Video, or Text. AI-powered matching across 450+ categories.
        </p>

        {/* 3-Tab Switcher */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8">
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'voice'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
              }`}
            >
              <Mic className="w-5 h-5" />
              <span>Voice RFQ</span>
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'video'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
              }`}
            >
              <Video className="w-5 h-5" />
              <span>Video RFQ</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'text'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Text RFQ</span>
            </button>
          </div>

          {/* Demo Container */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 min-h-[400px]">
            {activeTab === 'voice' && <VoiceDemoContent />}
            {activeTab === 'video' && <VideoDemoContent />}
            {activeTab === 'text' && <TextDemoContent />}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link
            href="/rfq/create"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-lg text-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            Post Your RFQ Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/suppliers"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-medium px-6 py-3.5 rounded-lg border border-slate-600 hover:border-slate-500 transition-all duration-200"
          >
            Browse Suppliers
          </Link>
        </div>

        {/* Trust Signals */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-400" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Free during beta
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-400" />
            AI-powered matching
          </span>
        </div>
      </div>
    </section>
  );
}

/* ---- VOICE DEMO CONTENT ---- */
function VoiceDemoContent() {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsListening(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      {/* Microphone Visual */}
      <div className="relative">
        <div className={`w-24 h-24 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center transition-all duration-300 ${
          isListening ? 'scale-110' : ''
        }`}>
          <Mic className="w-10 h-10 text-blue-400" />
        </div>
        {isListening && (
          <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
        )}
      </div>

      {/* Status Text */}
      <div className="text-center space-y-2">
        <p className="text-xl font-semibold text-white">
          {isListening ? 'Listening...' : 'Click to speak'}
        </p>
        <p className="text-sm text-slate-300 max-w-md">
          {isListening
            ? '"I need 5000 meters of corrugated packaging boxes with 3-ply strength..."'
            : 'Just speak naturally. AI will extract all product details.'}
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-6">
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="text-2xl mb-1">🎤</div>
          <div className="text-xs text-slate-300">Works in any language</div>
        </div>
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-xs text-slate-300">Real-time transcription</div>
        </div>
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="text-2xl mb-1">🤖</div>
          <div className="text-xs text-slate-300">AI-powered extraction</div>
        </div>
      </div>

      {/* Try Button */}
      <Link
        href="/voice-rfq"
        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
      >
        Try Voice RFQ <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

/* ---- VIDEO DEMO CONTENT ---- */
function VideoDemoContent() {
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsRecording(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      {/* Camera Visual */}
      <div className="relative w-full max-w-md aspect-video bg-slate-900 rounded-xl border-2 border-slate-700 flex items-center justify-center overflow-hidden">
        <Video className="w-16 h-16 text-slate-600" />
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            REC 0:15
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center space-y-2">
        <p className="text-xl font-semibold text-white">
          {isRecording ? 'Recording product demo...' : 'Show us what you need'}
        </p>
        <p className="text-sm text-slate-300 max-w-md">
          Point camera at product, sample, or blueprint. AI extracts specs automatically.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-6">
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="text-2xl mb-1">📹</div>
          <div className="text-xs text-slate-300">Visual recognition</div>
        </div>
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="text-2xl mb-1">📏</div>
          <div className="text-xs text-slate-300">Auto spec extraction</div>
        </div>
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-xs text-slate-300">Instant matching</div>
        </div>
      </div>

      {/* Try Button */}
      <Link
        href="/video-rfq"
        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
      >
        Try Video RFQ <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

/* ---- TEXT DEMO CONTENT ---- */
function TextDemoContent() {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Form Preview */}
      <div className={`space-y-4 transition-opacity duration-500 ${showForm ? 'opacity-100' : 'opacity-0'}`}>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Product/Service</label>
          <input
            type="text"
            value="Corrugated Packaging Boxes"
            readOnly
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Quantity</label>
            <input
              type="text"
              value="5000 meters"
              readOnly
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
            <input
              type="text"
              value="Packaging"
              readOnly
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Specifications</label>
          <textarea
            value="3-ply strength, brown kraft paper, suitable for export shipping, ISPM 15 compliant"
            readOnly
            rows={3}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white resize-none"
          />
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-auto">
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="text-2xl mb-1">📝</div>
          <div className="text-xs text-slate-300">Detailed forms</div>
        </div>
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="text-2xl mb-1">💾</div>
          <div className="text-xs text-slate-300">Save drafts</div>
        </div>
        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
          <div className="text-2xl mb-1">📎</div>
          <div className="text-xs text-slate-300">Attach files</div>
        </div>
      </div>

      {/* Try Button */}
      <Link
        href="/rfq/create"
        className="inline-flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
      >
        Try Text RFQ <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

/* ---- VALUE PROPS - Text / Voice / Video ---- */
function ValuePropsSection() {
  const props = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Text RFQ',
      desc: 'Type your requirements with detailed specs. AI formats and matches instantly.',
      link: '/demo/text-rfq',
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: 'Voice RFQ',
      desc: 'Speak in any Indian language. AI transcribes, translates, and finds suppliers.',
      link: '/demo/voice-rfq',
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: 'Video RFQ',
      desc: 'Show what you need visually. AI analyzes video to extract product specifications.',
      link: '/demo/video-rfq',
    },
  ];

  return (
    <section className="py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Three Ways to Post Your RFQ
        </h2>
        <p className="text-slate-300 text-center mb-8">
          Choose the format that works best for you
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {props.map((prop) => (
            <div
              key={prop.title}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-500/20 transition-colors">
                {prop.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{prop.title}</h3>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">{prop.desc}</p>
              <Link
                href={prop.link}
                className="inline-flex items-center gap-1 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
              >
                Try Demo <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- HOW IT WORKS - 3 Steps ---- */
function HowItWorksSection() {
  const steps = [
    {
      num: '1',
      title: 'Post Your RFQ',
      desc: 'Text, voice, or video. Takes under 2 minutes.',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      num: '2',
      title: 'AI Finds Matches',
      desc: 'Our AI scans 10,000+ suppliers and finds the best fits.',
      icon: <Brain className="w-5 h-5" />,
    },
    {
      num: '3',
      title: 'Compare & Select',
      desc: 'Review quotes, compare suppliers, and choose the best offer.',
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ];

  return (
    <section className="py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          How Bell24H Works
        </h2>
        <p className="text-slate-300 text-center mb-8">
          Simple, fast, and AI-powered
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="text-center">
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold text-lg">{step.num}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- AI FEATURES - 3x2 Grid ---- */
// Removed to keep homepage compact - AI features available via nav

/* ---- TOP CATEGORIES - 3 Columns ---- */
function CategoriesSection() {
  return (
    <section className="py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Browse 450+ Categories
            </h2>
            <p className="text-slate-300 text-sm">Top categories by active RFQs</p>
          </div>
          <Link
            href="/categories"
            className="hidden sm:inline-flex items-center gap-1 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {TOP_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/categories/${cat.name.toLowerCase()}`}
              className="flex items-center gap-4 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 hover:bg-slate-800/80 transition-all duration-300 group"
            >
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium group-hover:text-blue-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-slate-400 text-xs">
                  {cat.rfqs.toLocaleString()} RFQs &middot; {cat.subcategories} subcategories
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </Link>
          ))}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
          >
            View All 450+ Categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---- STATS — fetched live from DB ---- */
function StatsSection() {
  const [stats, setStats] = useState<{ suppliers: number; rfqs: number; categories: number } | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.stats); })
      .catch(() => {}); // fail silently
  }, []);

  const items = [
    {
      value: stats ? (stats.suppliers > 0 ? `${stats.suppliers}+` : 'Growing') : '—',
      label: 'Verified Suppliers',
    },
    {
      value: stats ? (stats.categories > 0 ? `${stats.categories}+` : '19+') : '—',
      label: 'Categories',
    },
    {
      value: stats ? String(stats.rfqs) : '—',
      label: 'RFQs Posted',
    },
  ];

  return (
    <section className="py-12 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-8">
          {items.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-1">
                {stat.value}
              </div>
              <div className="text-slate-300 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- FINAL CTA ---- */
function FinalCTASection() {
  return (
    <section className="py-16 border-t border-slate-800">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
          Ready to Transform Your Procurement?
        </h2>
        <p className="text-slate-300 mb-8">
          Join thousands of businesses already using Bell24H to find verified suppliers faster.
        </p>
        <Link
          href="/rfq/create"
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-lg text-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
        >
          Post Your First RFQ Free
          <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="text-slate-500 text-sm mt-4">
          No credit card required &middot; Free during beta &middot; Cancel anytime
        </p>
      </div>
    </section>
  );
}
