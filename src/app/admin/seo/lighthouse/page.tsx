'use client';

import { useState } from 'react';
import {
  LIGHTHOUSE_DESKTOP,
  LIGHTHOUSE_MOBILE_PRIOR,
  EXTERNAL_LINKS,
  type LighthouseSnapshot,
} from '@/src/data/seo-dashboard';
import { SeoScoreCard, SeoMetricRow } from '@/src/components/admin/seo/SeoScoreCard';

function ReportPanel({ report }: { report: LighthouseSnapshot }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <SeoScoreCard label="Performance" value={report.scores.performance} />
        <SeoScoreCard label="Accessibility" value={report.scores.accessibility} />
        <SeoScoreCard label="Best Practices" value={report.scores.bestPractices} />
        <SeoScoreCard label="SEO" value={report.scores.seo} />
        <SeoScoreCard label="Agentic Browsing" value={report.scores.agenticBrowsing} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Core Web Vitals (lab)</h3>
          <SeoMetricRow label="First Contentful Paint" value={report.metrics.fcp} />
          <SeoMetricRow label="Largest Contentful Paint" value={report.metrics.lcp} />
          <SeoMetricRow label="Total Blocking Time" value={report.metrics.tbt} />
          <SeoMetricRow label="Cumulative Layout Shift" value={report.metrics.cls} />
          <SeoMetricRow label="Speed Index" value={report.metrics.speedIndex} />
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Run metadata</h3>
          <SeoMetricRow label="URL tested" value={report.url.replace('https://', '')} />
          <SeoMetricRow label="Device" value={report.device} />
          <SeoMetricRow label="Lighthouse" value={report.lighthouseVersion} />
          <SeoMetricRow label="Captured" value={new Date(report.capturedAt).toLocaleString('en-IN')} />
          <SeoMetricRow label="CrUX real users" value={report.cruxRealUsers} />
          <SeoMetricRow label="Passed audits" value={String(report.passedAudits)} />
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Insights & diagnostics</h3>
        <ul className="space-y-3">
          {report.insights.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                item.severity === 'warn' ? 'bg-amber-400' : item.severity === 'pass' ? 'bg-emerald-400' : 'bg-slate-500'
              }`} />
              <div>
                <p className="text-slate-200 font-medium">{item.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Agentic Browsing (3/3)</h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Accessibility tree is well-formed</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Cumulative Layout Shift 0</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> llms.txt follows recommendations</li>
        </ul>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Accessibility — passed audits (27)</h3>
        <p className="text-slate-500 text-xs mb-3">Contrast fix deployed Jun 26. Comparison table now passes WCAG.</p>
        <p className="text-slate-500 text-xs">10 manual checks remain (keyboard focus, tab order, landmarks) — run periodic manual review.</p>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">SEO — passed audits (9)</h3>
        <ul className="space-y-1 text-xs text-slate-400">
          <li>Document has a meta description</li>
          <li>Page has successful HTTP status code</li>
          <li>Links are crawlable</li>
          <li>robots.txt is valid</li>
          <li>Document has a valid hreflang / canonical</li>
          <li>Structured data is valid (manual: Rich Results Test)</li>
        </ul>
      </div>
    </div>
  );
}

export default function SeoLighthousePage() {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const report = device === 'desktop' ? LIGHTHOUSE_DESKTOP : LIGHTHOUSE_MOBILE_PRIOR;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-slate-400 text-sm">
          Lighthouse 13.4.0 · Always test <strong className="text-slate-300">www.vyaparsethu.com</strong> (no redirect penalty)
        </p>
        <div className="flex gap-2">
          {(['desktop', 'mobile'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                device === d ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
          <a
            href={EXTERNAL_LINKS.pagespeed}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-indigo-400 hover:text-indigo-300"
          >
            Re-run ↗
          </a>
        </div>
      </div>

      <ReportPanel report={report} />
    </div>
  );
}
