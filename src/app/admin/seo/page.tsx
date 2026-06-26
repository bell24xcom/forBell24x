'use client';

import Link from 'next/link';
import {
  LIGHTHOUSE_DESKTOP,
  GSC_PERFORMANCE,
  INDEXING_STATUS,
  SEO_CHECKLIST,
  EXTERNAL_LINKS,
  SITE_CANONICAL,
} from '@/src/data/seo-dashboard';
import { SeoScoreCard, StatusBadge } from '@/src/components/admin/seo/SeoScoreCard';

export default function SeoOverviewPage() {
  const lh = LIGHTHOUSE_DESKTOP;
  const pending = SEO_CHECKLIST.filter(i => i.status === 'pending').length;
  const indexed = INDEXING_STATUS.filter(i => i.status === 'indexed').length;

  return (
    <div className="space-y-6">
      {/* Lighthouse summary */}
      <section className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-white font-semibold">PageSpeed Insights — Desktop</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {lh.url} · {new Date(lh.capturedAt).toLocaleString('en-IN')} · Lighthouse {lh.lighthouseVersion}
            </p>
          </div>
          <Link href="/admin/seo/lighthouse" className="text-xs text-indigo-400 hover:text-indigo-300">
            Full report →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <SeoScoreCard label="Performance" value={lh.scores.performance} />
          <SeoScoreCard label="Accessibility" value={lh.scores.accessibility} />
          <SeoScoreCard label="Best Practices" value={lh.scores.bestPractices} />
          <SeoScoreCard label="SEO" value={lh.scores.seo} />
          <SeoScoreCard label="Agentic Browsing" value={lh.scores.agenticBrowsing} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
          {Object.entries(lh.metrics).map(([k, v]) => (
            <div key={k} className="bg-slate-900/50 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-slate-500 uppercase">{k}</p>
              <p className="text-white font-mono text-sm font-semibold">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        {/* GSC snapshot */}
        <section className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Search Console</h2>
            <Link href="/admin/seo/search-console" className="text-xs text-indigo-400 hover:text-indigo-300">
              Queries →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs">Clicks</p>
              <p className="text-2xl font-bold text-white">{GSC_PERFORMANCE.totals.clicks}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs">Impressions</p>
              <p className="text-2xl font-bold text-amber-400">{GSC_PERFORMANCE.totals.impressions}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs">Avg CTR</p>
              <p className="text-2xl font-bold text-white">{GSC_PERFORMANCE.totals.ctr}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs">Avg Position</p>
              <p className="text-2xl font-bold text-red-400">{GSC_PERFORMANCE.totals.avgPosition}</p>
            </div>
          </div>
          <p className="text-slate-500 text-xs">
            Top queries are glossary/GST long-tail — not core B2B marketplace terms yet.
          </p>
        </section>

        {/* Indexing snapshot */}
        <section className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Indexing</h2>
            <Link href="/admin/seo/indexing" className="text-xs text-indigo-400 hover:text-indigo-300">
              All URLs →
            </Link>
          </div>
          <p className="text-3xl font-bold text-emerald-400 mb-1">{indexed} / {INDEXING_STATUS.length}</p>
          <p className="text-slate-500 text-xs mb-4">Key URLs indexed or on Google</p>
          <ul className="space-y-2">
            {INDEXING_STATUS.slice(0, 4).map(row => (
              <li key={row.path} className="flex items-center justify-between text-sm">
                <span className="text-slate-300 truncate">{row.label}</span>
                <StatusBadge status={row.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/seo/ai-visibility" className="bg-slate-800/40 border border-red-500/20 rounded-xl p-4 hover:border-indigo-500/40 transition-colors block">
          <p className="text-white font-semibold text-sm">AI Search Visibility</p>
          <p className="text-slate-500 text-xs mt-1">0% brand mentions — 9 prompts, IndiaMART leads at 33%</p>
        </Link>
        <Link href="/admin/seo/content-ideas" className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-indigo-500/40 transition-colors block">
          <p className="text-white font-semibold text-sm">Content Ideas</p>
          <p className="text-slate-500 text-xs mt-1">7 competitor pages for &quot;b2b marketplace india&quot;</p>
        </Link>
        <Link href="/admin/seo/category-ranks" className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-indigo-500/40 transition-colors block">
          <p className="text-white font-semibold text-sm">Category keyword ranks</p>
          <p className="text-slate-500 text-xs mt-1">400+ categories — you vs IndiaMART/TradeIndia</p>
        </Link>
        <Link href="/admin/seo/analyze" className="bg-slate-800/40 border border-indigo-500/30 rounded-xl p-4 hover:border-indigo-500/40 transition-colors block">
          <p className="text-white font-semibold text-sm">AI CSV Analyze</p>
          <p className="text-slate-500 text-xs mt-1">Upload GSC / rank CSV — Groq or NVIDIA extraction</p>
        </Link>
        <Link href="/admin/seo/gap-report" className="bg-slate-800/40 border border-red-500/20 rounded-xl p-4 hover:border-indigo-500/40 transition-colors block">
          <p className="text-white font-semibold text-sm">SEO Gap Report</p>
          <p className="text-slate-500 text-xs mt-1">vs Semrush, Ahrefs, Ubersuggest, Moz — missing tools + how to add</p>
        </Link>
        <Link href="/admin/seo/tools" className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-indigo-500/40 transition-colors block">
          <p className="text-white font-semibold text-sm">SEO Tools hub</p>
          <p className="text-slate-500 text-xs mt-1">GSC, GA4, PageSpeed — deep links + GA4 events</p>
        </Link>
        <Link href="/admin/seo/opportunities" className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-indigo-500/40 transition-colors block">
          <p className="text-white font-semibold text-sm">SEO Opportunities</p>
          <p className="text-slate-500 text-xs mt-1">10 tasks — broken links, comparison content, local pages</p>
        </Link>
        <Link href="/admin/seo/rankings" className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-indigo-500/40 transition-colors block">
          <p className="text-white font-semibold text-sm">Keyword Rankings</p>
          <p className="text-slate-500 text-xs mt-1">18 B2B keywords — manual GSC updates, no paid tools</p>
        </Link>
        <Link href="/admin/seo/competitors" className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-indigo-500/40 transition-colors block">
          <p className="text-white font-semibold text-sm">Competitor gaps</p>
          <p className="text-slate-500 text-xs mt-1">IndiaMART backlink targets for VyaparSethu</p>
        </Link>
      </div>

      {/* Pending backlinks — highest SEO impact */}
      <section className="bg-[#001f3f] border border-[#D4AF37]/30 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-white font-semibold">Trust backlinks (manual)</h2>
            <p className="text-slate-500 text-xs mt-0.5">Crunchbase DA 90 · G2 DA 85 — unlocks rankings faster than more code</p>
          </div>
          <Link href="/admin/seo/backlinks" className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] text-xs font-bold rounded-lg">
            Start Crunchbase / G2 →
          </Link>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <Link href="/admin/directories/submit?guide=crunchbase" className="text-indigo-400 hover:text-indigo-300">Crunchbase guide</Link>
          <Link href="/admin/directories/submit?guide=g2" className="text-indigo-400 hover:text-indigo-300">G2 guide</Link>
          <Link href="/admin/directories" className="text-slate-500 hover:text-slate-300">All directories</Link>
        </div>
      </section>

      {/* Pending checklist */}
      <section className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Pending Actions ({pending})</h2>
          <Link href="/admin/seo/checklist" className="text-xs text-indigo-400 hover:text-indigo-300">
            Full checklist →
          </Link>
        </div>
        <ul className="space-y-2">
          {SEO_CHECKLIST.filter(i => i.status === 'pending').slice(0, 5).map(item => (
            <li key={item.id} className="flex items-start gap-3 text-sm">
              <span className="text-amber-400 shrink-0">○</span>
              <span className="text-slate-300">{item.task}</span>
              <span className="text-[10px] text-slate-600 uppercase ml-auto shrink-0">{item.owner}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* External tools */}
      <section className="flex flex-wrap gap-3">
        {[
          { label: 'PageSpeed', href: EXTERNAL_LINKS.pagespeed },
          { label: 'Search Console', href: EXTERNAL_LINKS.searchConsole },
          { label: 'Rich Results Test', href: EXTERNAL_LINKS.richResults },
          { label: 'Sitemap', href: EXTERNAL_LINKS.sitemap },
          { label: 'llms.txt', href: EXTERNAL_LINKS.llmsTxt },
        ].map(link => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white hover:border-indigo-500/50 transition-colors"
          >
            {link.label} ↗
          </a>
        ))}
      </section>

      <p className="text-slate-600 text-xs">
        Canonical: {SITE_CANONICAL} · Update snapshots in <code className="text-slate-500">src/data/seo-dashboard.ts</code>
      </p>
    </div>
  );
}
