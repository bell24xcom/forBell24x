'use client';

import Link from 'next/link';
import {
  AI_VISIBILITY_META,
  AI_VISIBILITY_OVERVIEW,
  AI_VISIBILITY_BRANDS,
  AI_VISIBILITY_TOPICS,
  AI_VISIBILITY_PROMPTS,
  AI_PROMPT_INTENT_BREAKDOWN,
  AI_CONTENT_ACTIONS,
} from '@/src/data/seo-ai-visibility';

export default function AiVisibilityPage() {
  const filteredTopics = AI_VISIBILITY_TOPICS;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
        <strong className="text-slate-200">AI Search Visibility</strong> — manual checks on ChatGPT & Gemini.
        Last updated: {new Date(AI_VISIBILITY_META.lastUpdated).toLocaleDateString('en-IN')}.
        Next cycle in {AI_VISIBILITY_META.nextUpdateCycleDays} days. No paid Ubersuggest API.
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-800/40 border border-red-500/30 rounded-xl p-4">
          <p className="text-slate-500 text-xs">Brand visibility</p>
          <p className="text-3xl font-bold text-red-400">{AI_VISIBILITY_OVERVIEW.brandVisibilityPct}%</p>
          <p className="text-slate-600 text-xs mt-1">of AI responses mention you</p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-500 text-xs">Share of voice</p>
          <p className="text-3xl font-bold text-white">{AI_VISIBILITY_OVERVIEW.shareOfVoicePct}%</p>
        </div>
        <div className="bg-slate-800/40 border border-amber-500/30 rounded-xl p-4">
          <p className="text-slate-500 text-xs">vs {AI_VISIBILITY_OVERVIEW.topCompetitor}</p>
          <p className="text-3xl font-bold text-amber-400">{AI_VISIBILITY_OVERVIEW.competitorGapPct}%</p>
          <p className="text-slate-600 text-xs mt-1">gap ({AI_VISIBILITY_OVERVIEW.topCompetitorVisibilityPct}% leader)</p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-500 text-xs">Prompts tracked</p>
          <p className="text-3xl font-bold text-indigo-400">{AI_VISIBILITY_OVERVIEW.promptsTracked}</p>
        </div>
      </div>

      <section className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-4">
        <p className="text-indigo-200 text-sm leading-relaxed">{AI_VISIBILITY_META.summary}</p>
      </section>

      <section className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Top brands (AI mentions)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs text-left border-b border-slate-700">
                <th className="pb-2 pr-4">Brand</th>
                <th className="pb-2 pr-4">Visibility</th>
                <th className="pb-2 pr-4">Share of voice</th>
                <th className="pb-2 pr-4">Mentions</th>
                <th className="pb-2">Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {AI_VISIBILITY_BRANDS.map(b => (
                <tr key={b.id} className={`border-b border-slate-800/80 ${b.isYou ? 'bg-indigo-900/20' : ''}`}>
                  <td className="py-2 pr-4 text-slate-200">
                    {b.name}
                    {b.isYou && <span className="ml-2 text-[10px] text-indigo-400">(you)</span>}
                  </td>
                  <td className="py-2 pr-4 font-mono">{b.visibilityPct}%</td>
                  <td className="py-2 pr-4 font-mono">{b.shareOfVoicePct}%</td>
                  <td className="py-2 pr-4">{b.mentions}</td>
                  <td className="py-2 text-slate-400">{b.sentiment ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Visibility by topic</h2>
        <div className="space-y-4">
          {filteredTopics.map(t => (
            <div key={t.id} className="border border-slate-700/50 rounded-lg p-3">
              <p className="text-slate-200 text-sm font-medium mb-2">{t.topic}</p>
              {t.brands.length === 0 ? (
                <p className="text-slate-600 text-xs">No brand mentioned — opportunity for VyaparSethu</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {t.brands.map(b => (
                    <span key={b.name} className="px-2 py-0.5 rounded bg-slate-900 text-xs text-slate-400">
                      {b.name} <span className="text-amber-400">{b.visibilityPct}%</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-white font-semibold">Tracked prompts ({AI_VISIBILITY_PROMPTS.length})</h2>
          <div className="flex gap-2 text-[10px]">
            {Object.entries(AI_PROMPT_INTENT_BREAKDOWN).map(([k, v]) => (
              <span key={k} className="px-2 py-0.5 rounded bg-slate-900 text-slate-500">{k} {v}%</span>
            ))}
          </div>
        </div>
        <ul className="space-y-2">
          {AI_VISIBILITY_PROMPTS.map(p => (
            <li key={p.id} className="text-sm text-slate-300 border-b border-slate-800/80 pb-2">
              {p.prompt}
              <span className="ml-2 text-[10px] text-slate-600 uppercase">{p.intent}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">Content actions to improve AI visibility</h2>
        <ul className="space-y-2">
          {AI_CONTENT_ACTIONS.map(a => (
            <li key={a.topic} className="flex flex-wrap gap-2 text-sm">
              <span className="text-slate-400">{a.topic}</span>
              <Link href={a.page} className="text-indigo-400 hover:text-indigo-300">{a.page}</Link>
              <span className="text-slate-600 text-xs">— {a.action}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/seo/tools" className="text-xs text-indigo-400 hover:text-indigo-300">Open AI check tools →</Link>
        <Link href="/admin/seo/analyze" className="text-xs text-indigo-400 hover:text-indigo-300">Upload CSV + AI analyze →</Link>
      </div>
    </div>
  );
}
