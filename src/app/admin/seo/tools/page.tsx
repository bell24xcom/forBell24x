'use client';

import { useState } from 'react';
import { SEO_TOOLS, SEO_TOOL_CATEGORIES, type SeoToolCategory } from '@/src/data/seo-tools';
import { trackSeoEvent, openGscInspect, openRichResultsTest } from '@/lib/seo-analytics';

const SAMPLE_PATHS = ['/', '/how-it-works', '/how-payment-works', '/voice-rfq', '/founding-suppliers'];

export default function SeoToolsPage() {
  const [category, setCategory] = useState<SeoToolCategory | 'all'>('all');
  const [inspectPath, setInspectPath] = useState('/how-payment-works');

  const tools = category === 'all' ? SEO_TOOLS : SEO_TOOLS.filter(t => t.category === category);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
        Free SEO & analytics tools with deep links for <strong className="text-slate-200">vyaparsethu.com</strong>.
        GA4 events fire when <code className="text-slate-500">NEXT_PUBLIC_GA_ID</code> is set in Vercel.
      </div>

      <section className="bg-[#001f3f] border border-[#D4AF37]/30 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">Quick actions (this site)</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {SAMPLE_PATHS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setInspectPath(p)}
              className={`px-2.5 py-1 rounded-lg text-xs ${inspectPath === p ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openGscInspect(inspectPath)}
            className="px-4 py-2 bg-[#D4AF37] text-[#001f3f] text-xs font-bold rounded-lg"
          >
            GSC URL Inspect ↗
          </button>
          <button
            type="button"
            onClick={() => openRichResultsTest(inspectPath)}
            className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg border border-slate-700"
          >
            Rich Results Test ↗
          </button>
          <a
            href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent('https://www.vyaparsethu.com' + inspectPath)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackSeoEvent('seo_tool_pagespeed', { page_path: inspectPath })}
            className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg border border-slate-700"
          >
            PageSpeed ↗
          </a>
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${category === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
        >
          All
        </button>
        {SEO_TOOL_CATEGORIES.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${category === c.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {tools.map(tool => (
          <div key={tool.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-white font-medium text-sm">{tool.name}</h3>
              {tool.free && <span className="text-[10px] text-emerald-400 uppercase shrink-0">Free</span>}
            </div>
            <p className="text-slate-500 text-xs mt-1 mb-3">{tool.description}</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => tool.gaEventName && trackSeoEvent(tool.gaEventName)}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Open tool ↗
              </a>
              {tool.siteDeepLink && (
                <button
                  type="button"
                  onClick={() => {
                    window.open(tool.siteDeepLink!(inspectPath), '_blank', 'noopener,noreferrer');
                    trackSeoEvent('seo_tool_deep_link', { tool: tool.id, path: inspectPath });
                  }}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Deep link ({inspectPath}) ↗
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <section className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 text-sm text-slate-400">
        <h2 className="text-white font-semibold mb-2">Google Analytics setup</h2>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Create GA4 property at analytics.google.com</li>
          <li>Add <code className="text-slate-500">NEXT_PUBLIC_GA_ID=G-XXXXXXXX</code> in Vercel env</li>
          <li>Connect GSC to GA4 (Admin → Product links)</li>
          <li>Use Looker Studio GSC connector for weekly SEO dashboards</li>
        </ol>
      </section>
    </div>
  );
}
