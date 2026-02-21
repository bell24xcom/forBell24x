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

/* ---- HERO SECTION ---- */
function HeroSection() {
  return (
    <section className="relative pt-8 pb-12 lg:pt-12 lg:pb-16">
      <div className="max-w-6xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-blue-300 text-sm font-medium">India&apos;s #1 Multi-Modal B2B Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
          Connect with 10,000+{' '}
          <span className="text-blue-400">Verified Suppliers</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          Post RFQs via Voice, Video, or Text. AI-powered matching across 450+ categories.
        </p>

        {/* Primary CTA */}
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
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
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
        <p className="text-slate-400 text-center mb-8">
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
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">{prop.desc}</p>
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
        <p className="text-slate-400 text-center mb-8">
          Simple, fast, and AI-powered
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="text-center">
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold text-lg">{step.num}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
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
            <p className="text-slate-400 text-sm">Top categories by active RFQs</p>
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
                <p className="text-slate-500 text-xs">
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
              <div className="text-slate-400 text-sm">{stat.label}</div>
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
        <p className="text-slate-400 mb-8">
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
