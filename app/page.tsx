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

      {/* === LIVE ACTIVITY TICKER === */}
      <LiveActivityTicker />

      {/* === 3-COLUMN MARKETPLACE LAYOUT === */}
      <MarketplaceSection />

      {/* === HOW IT WORKS - 3 Steps === */}
      <HowItWorksSection />

      {/* === AI FEATURES - 6 Cards === */}
      <AIFeaturesSection />

      {/* === VALUE PROPS - 3 Columns === */}
      <ValuePropsSection />

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
        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 text-center">
          Post an RFQ in{' '}
          <span className="text-blue-400">30 Seconds.</span>{' '}
          Get Quotes from Verified Suppliers.
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-6 text-center">
          India's AI-powered B2B procurement platform. Voice, Video, or Text — your choice.
        </p>

        {/* Primary CTA links */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <a href="/voice-rfq" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors min-h-[44px]">
            🎤 Post Voice RFQ
          </a>
          <a href="/rfq/create" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-semibold rounded-xl transition-colors min-h-[44px]">
            📝 Post Text RFQ
          </a>
          <a href="/marketplace" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-semibold rounded-xl transition-colors min-h-[44px]">
            🔍 Browse RFQs
          </a>
        </div>

        {/* 3-Tab Switcher */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8">
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'voice'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-transparent text-slate-300 hover:bg-slate-800 border-2 border-slate-700/50'
              }`}
            >
              🎤 Voice RFQ
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'video'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-transparent text-slate-300 hover:bg-slate-800 border-2 border-slate-700/50'
              }`}
            >
              📹 Video RFQ
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'text'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-transparent text-slate-300 hover:bg-slate-800 border-2 border-slate-700/50'
              }`}
            >
              📝 Text RFQ
            </button>
          </div>

          {/* Demo Container */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 md:p-12 min-h-[500px]">
            {activeTab === 'voice' && <VoiceDemoContent />}
            {activeTab === 'video' && <VideoDemoContent />}
            {activeTab === 'text' && <TextDemoContent />}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- VOICE DEMO CONTENT ---- */
function VoiceDemoContent() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),   // Show Hindi text
      setTimeout(() => setStep(2), 2200),  // Show English text
      setTimeout(() => setStep(3), 3600),  // Show AI card
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <style jsx>{`
        @keyframes bar-animation {
          0%, 100% { height: 20px; }
          50% { height: 60px; }
        }
        .bar {
          animation: bar-animation 1.2s ease-in-out infinite;
        }
        .bar:nth-child(1) { animation-delay: 0s; }
        .bar:nth-child(2) { animation-delay: 0.15s; }
        .bar:nth-child(3) { animation-delay: 0.3s; }
        .bar:nth-child(4) { animation-delay: 0.45s; }
        .bar:nth-child(5) { animation-delay: 0.6s; }
        .bar:nth-child(6) { animation-delay: 0.75s; }
        .bar:nth-child(7) { animation-delay: 0.9s; }
        .bar:nth-child(8) { animation-delay: 1.05s; }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        .typewriter {
          overflow: hidden;
          white-space: nowrap;
          animation: typewriter 1.2s steps(40) forwards;
        }
      `}</style>

      {/* Animated Microphone with Bars */}
      <div className="relative flex items-center justify-center gap-2">
        {/* Left bars */}
        <div className="bar w-1.5 bg-orange-500 rounded-full" style={{ height: '20px' }} />
        <div className="bar w-1.5 bg-orange-500 rounded-full" style={{ height: '30px' }} />
        <div className="bar w-1.5 bg-orange-500 rounded-full" style={{ height: '40px' }} />
        <div className="bar w-1.5 bg-orange-500 rounded-full" style={{ height: '50px' }} />

        {/* Pulsing Mic */}
        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center animate-pulse mx-4">
          <Mic className="w-12 h-12 text-white" />
        </div>

        {/* Right bars */}
        <div className="bar w-1.5 bg-orange-500 rounded-full" style={{ height: '50px' }} />
        <div className="bar w-1.5 bg-orange-500 rounded-full" style={{ height: '40px' }} />
        <div className="bar w-1.5 bg-orange-500 rounded-full" style={{ height: '30px' }} />
        <div className="bar w-1.5 bg-orange-500 rounded-full" style={{ height: '20px' }} />
      </div>

      {/* Typewriter Text - Hindi */}
      {step >= 1 && (
        <div className="text-center">
          <p className="text-xl md:text-2xl font-semibold text-white typewriter inline-block">
            मुझे 1000 टी-शर्ट चाहिए, भिवंडी डिलीवरी, अर्जेंट
          </p>
        </div>
      )}

      {/* English Translation */}
      {step >= 2 && (
        <div className="text-center">
          <p className="text-lg text-slate-300 typewriter inline-block">
            I need 1000 T-Shirts, Bhiwandi delivery, Urgent
          </p>
        </div>
      )}

      {/* AI Structured Output */}
      {step >= 3 && (
        <div className="w-full max-w-2xl bg-green-500/10 border-2 border-green-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h4 className="text-green-400 font-bold mb-2">AI Structured RFQ:</h4>
              <p className="text-white text-sm leading-relaxed">
                <span className="font-semibold">Product:</span> T-Shirts |
                <span className="font-semibold"> Qty:</span> 1000 |
                <span className="font-semibold"> Location:</span> Bhiwandi |
                <span className="font-semibold"> Urgency:</span> Urgent
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <Link
        href="/voice-rfq"
        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-blue-500/25"
      >
        Post Voice RFQ Free →
      </Link>
    </div>
  );
}

/* ---- VIDEO DEMO CONTENT ---- */
function VideoDemoContent() {
  const [field, setField] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setField(1), 800),
      setTimeout(() => setField(2), 1600),
      setTimeout(() => setField(3), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col space-y-8">
      <style jsx>{`
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        .typing-animation {
          overflow: hidden;
          white-space: nowrap;
          animation: typing 0.8s steps(20) forwards;
        }
      `}</style>

      {/* Split Screen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Video Recording */}
        <div className="bg-slate-900 rounded-xl border-2 border-slate-700 flex flex-col items-center justify-center p-8 min-h-[300px]">
          <Video className="w-20 h-20 text-slate-400 mb-4" />
          <p className="text-white font-semibold text-lg">📹 Video recording...</p>
          <div className="mt-4 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="font-mono">0:15</span>
          </div>
        </div>

        {/* Right: AI Extraction */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-lg mb-4">🤖 AI Extracting...</h4>

          {/* Field 1 */}
          {field >= 1 && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Product:</p>
              <p className="text-white font-semibold typing-animation inline-block">Steel Rods</p>
            </div>
          )}

          {/* Field 2 */}
          {field >= 2 && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Grade:</p>
              <p className="text-white font-semibold typing-animation inline-block">Fe500</p>
            </div>
          )}

          {/* Field 3 */}
          {field >= 3 && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Quantity:</p>
              <p className="text-white font-semibold typing-animation inline-block">500 kg</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <Link
          href="/video-rfq"
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-blue-500/25"
        >
          Post Video RFQ Free →
        </Link>
      </div>
    </div>
  );
}

/* ---- TEXT DEMO CONTENT ---- */
function TextDemoContent() {
  return (
    <div className="flex flex-col space-y-6">
      {/* Textarea */}
      <div>
        <label className="block text-slate-300 font-semibold text-lg mb-3">
          Describe what you need...
        </label>
        <textarea
          value="500 kg MS Pipes, 3 inch diameter, Mumbai delivery, within 2 weeks"
          readOnly
          rows={6}
          className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-5 py-4 text-white text-lg resize-none focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Sample Badge */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className="bg-slate-700/50 px-3 py-1 rounded-full">💡 Sample pre-filled</span>
        <span>Edit to customize your requirements</span>
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <Link
          href="/rfq/create"
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-blue-500/25"
        >
          Post Text RFQ Free →
        </Link>
      </div>
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
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
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

/* ---- LIVE ACTIVITY TICKER ---- */
function LiveActivityTicker() {
  const activities = [
    '🔴 LIVE: Steel supplier Mumbai quoted ₹2.4L • 2 min ago',
    '📦 Textile RFQ from Surat — 3 suppliers matched',
    '✅ Deal closed: Auto Parts Pune ₹85,000',
    '🎤 Voice RFQ: Chemicals Gujarat — AI processed in 4s',
    '🔴 LIVE: New supplier registered: Electronics Delhi',
    '📹 Video RFQ: Steel Rods Maharashtra — Specs extracted',
    '💰 Payment released: Packaging Mumbai ₹1.2L',
    '🔴 LIVE: 5 quotes received for Textile Machinery Surat',
  ];

  return (
    <div className="border-y border-slate-800 bg-slate-900 py-4 overflow-hidden">
      <style jsx>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-content {
          animation: scroll-left 40s linear infinite;
        }
        .ticker-wrapper:hover .ticker-content {
          animation-play-state: paused;
        }
      `}</style>

      <div className="ticker-wrapper relative">
        <div className="ticker-content flex gap-12 whitespace-nowrap">
          {/* First set */}
          {activities.map((activity, idx) => (
            <span key={`first-${idx}`} className="text-slate-300 text-sm font-medium">
              {activity}
            </span>
          ))}
          {/* Duplicate set for seamless loop */}
          {activities.map((activity, idx) => (
            <span key={`second-${idx}`} className="text-slate-300 text-sm font-medium">
              {activity}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- 3-COLUMN MARKETPLACE LAYOUT ---- */
function MarketplaceSection() {
  const [rfqType, setRfqType] = useState<'all' | 'voice' | 'video' | 'text'>('all');

  const categories = [
    { name: 'Packaging', icon: '📦', count: 0 },
    { name: 'Chemicals', icon: '⚗️', count: 0 },
    { name: 'Electronics', icon: '⚡', count: 0 },
    { name: 'Construction', icon: '🏗️', count: 0 },
    { name: 'Machinery', icon: '🔧', count: 0 },
    { name: 'Textiles', icon: '👕', count: 0 },
    { name: 'Pharmaceuticals', icon: '💊', count: 0 },
    { name: 'Agricultural', icon: '🌾', count: 0 },
    { name: 'Automotive', icon: '🚗', count: 0 },
    { name: 'IT Services', icon: '💻', count: 0 },
    { name: 'Metals & Steel', icon: '🔩', count: 0 },
    { name: 'Plastics', icon: '🔄', count: 0 },
    { name: 'Paper', icon: '📄', count: 0 },
    { name: 'Rubber', icon: '🛞', count: 0 },
    { name: 'Leather', icon: '👜', count: 0 },
  ];

  const exampleRFQs = [
    {
      id: '1',
      type: 'voice' as const,
      title: 'Corrugated Packaging Boxes - 5000 meters',
      location: 'Mumbai, Maharashtra',
      budget: '₹2.5L - ₹3.5L',
      quotes: 0,
      postedAt: '2 hours ago',
    },
    {
      id: '2',
      type: 'video' as const,
      title: 'CNC Machinery Parts - Custom Specifications',
      location: 'Bengaluru, Karnataka',
      budget: '₹5L - ₹8L',
      quotes: 0,
      postedAt: '5 hours ago',
    },
    {
      id: '3',
      type: 'text' as const,
      title: 'Industrial Chemical Solvents - Bulk Order',
      location: 'Pune, Maharashtra',
      budget: '₹10L - ₹15L',
      quotes: 0,
      postedAt: '1 day ago',
    },
    {
      id: '4',
      type: 'voice' as const,
      title: 'Textile Machinery - Spinning Units',
      location: 'Surat, Gujarat',
      budget: '₹12L - ₹20L',
      quotes: 0,
      postedAt: '2 days ago',
    },
  ];

  const filteredRFQs = rfqType === 'all' ? exampleRFQs : exampleRFQs.filter(rfq => rfq.type === rfqType);

  return (
    <section className="py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT SIDEBAR - Categories & Filters */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            {/* Search */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <input
                type="search"
                placeholder="Search RFQs..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500"
              />
            </div>

            {/* RFQ Type Filter */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-white font-semibold text-sm mb-3">RFQ Type</h3>
              <div className="space-y-2">
                {[
                  { value: 'all' as const, label: 'All RFQs', count: 4 },
                  { value: 'voice' as const, label: 'Voice', count: 2 },
                  { value: 'video' as const, label: 'Video', count: 1 },
                  { value: 'text' as const, label: 'Text', count: 1 },
                ].map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setRfqType(filter.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      rfqType === filter.value
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    {filter.label} <span className="text-slate-400">({filter.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sticky top-4">
              <h3 className="text-white font-semibold text-sm mb-3">Categories</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {categories.map(cat => (
                  <button
                    key={cat.name}
                    className="w-full text-left px-2 py-1.5 rounded text-sm text-slate-300 hover:bg-slate-700/50 transition-colors flex items-center justify-between"
                  >
                    <span>
                      <span className="mr-2">{cat.icon}</span>
                      {cat.name}
                    </span>
                    <span className="text-xs text-slate-500">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-white font-semibold text-sm mb-3">Location</h3>
              <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                <option value="">All India</option>
                <option value="maharashtra">Maharashtra</option>
                <option value="karnataka">Karnataka</option>
                <option value="gujarat">Gujarat</option>
                <option value="tamil-nadu">Tamil Nadu</option>
                <option value="delhi">Delhi NCR</option>
                <option value="west-bengal">West Bengal</option>
                <option value="rajasthan">Rajasthan</option>
                <option value="up">Uttar Pradesh</option>
              </select>
            </div>
          </aside>

          {/* CENTER - Marketplace Feed */}
          <main className="lg:col-span-6 space-y-6">
            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/voice-rfq"
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-3 rounded-lg transition-colors"
              >
                <Mic className="w-4 h-4" />
                <span>Voice RFQ</span>
              </Link>
              <Link
                href="/video-rfq"
                className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-medium px-4 py-3 rounded-lg transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Video RFQ</span>
              </Link>
              <Link
                href="/rfq/create"
                className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-medium px-4 py-3 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Text RFQ</span>
              </Link>
            </div>

            {/* Be the First CTA */}
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-2 border-blue-500/30 rounded-xl p-8 text-center">
              <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Be the First to Post an RFQ!</h3>
              <p className="text-slate-300 mb-6">
                Start your procurement journey. Post via voice, video, or text and get quotes from verified suppliers.
              </p>
              <Link
                href="/rfq/create"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Post Your First RFQ
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Example RFQs */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>Example RFQs</span>
                <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">Demo</span>
              </h3>
              <div className="space-y-4">
                {filteredRFQs.map(rfq => (
                  <div
                    key={rfq.id}
                    className="bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 rounded-xl p-5 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                            rfq.type === 'voice'
                              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                              : rfq.type === 'video'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-slate-600/50 text-slate-300 border border-slate-600'
                          }`}
                        >
                          {rfq.type.toUpperCase()}
                        </span>
                        <h4 className="text-white font-semibold">{rfq.title}</h4>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" />
                        {rfq.location}
                      </span>
                      <span className="font-medium text-green-400">{rfq.budget}</span>
                      <span className="text-slate-500">{rfq.quotes} quotes</span>
                      <span className="text-slate-500 ml-auto">{rfq.postedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* RIGHT SIDEBAR - CTA & Stats */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            {/* Post RFQ CTA */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white sticky top-4">
              <h3 className="text-lg font-bold mb-2">Post RFQ Now</h3>
              <p className="text-sm text-blue-100 mb-4">
                Get quotes from verified suppliers in under 24 hours
              </p>
              <Link
                href="/rfq/create"
                className="block text-center bg-white text-blue-600 font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Create RFQ Free
              </Link>
            </div>

            {/* Live Stats */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-white font-semibold text-sm mb-4">Live Stats</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-blue-400">0</div>
                  <div className="text-xs text-slate-400">Suppliers Online</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">0</div>
                  <div className="text-xs text-slate-400">RFQs Today</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-400">0</div>
                  <div className="text-xs text-slate-400">Quotes Sent</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 italic">
                Join as the first supplier or buyer!
              </p>
            </div>

            {/* Top Categories */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-white font-semibold text-sm mb-3">Top Categories</h3>
              <div className="space-y-2">
                {categories.slice(0, 8).map(cat => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">
                      <span className="mr-2">{cat.icon}</span>
                      {cat.name}
                    </span>
                    <span className="text-slate-500 text-xs">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ---- AI FEATURES SECTION ---- */
function AIFeaturesSection() {
  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: 'Voice Understanding',
      description: 'Speak in any Indian language. AI transcribes, translates, and extracts product specifications automatically.',
      color: 'orange',
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: 'Video Analysis',
      description: 'Show products on camera. AI analyzes visual details, dimensions, and materials to create detailed RFQs.',
      color: 'purple',
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Smart Matching',
      description: 'AI matches your RFQ with verified suppliers based on capabilities, location, pricing, and past performance.',
      color: 'blue',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-time Quotes',
      description: 'Get instant notifications when suppliers submit quotes. AI ranks them by best value and reliability.',
      color: 'green',
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Secure Escrow',
      description: 'Payment protection with escrow. Funds released only after delivery confirmation and quality check.',
      color: 'red',
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Trust Scores',
      description: 'Every supplier has a verified trust score based on GST, Udyam, delivery history, and buyer ratings.',
      color: 'indigo',
    },
  ];

  return (
    <section className="py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">
            Powered by AI & NVIDIA Technology
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Advanced features that make B2B procurement faster, smarter, and more secure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 rounded-xl p-6 transition-all duration-300 group"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                  feature.color === 'orange'
                    ? 'bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20'
                    : feature.color === 'purple'
                    ? 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20'
                    : feature.color === 'blue'
                    ? 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20'
                    : feature.color === 'green'
                    ? 'bg-green-500/10 text-green-400 group-hover:bg-green-500/20'
                    : feature.color === 'red'
                    ? 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20'
                    : 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20'
                }`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/rfq/create"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            Experience AI-Powered RFQs
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
