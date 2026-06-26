'use client';

import { useState } from 'react';

interface Check {
  id: string;
  label: string;
  pass: boolean;
  value?: string;
  suggestion?: string;
}

interface OnPageResult {
  url: string;
  analyzedAt: string;
  score: number;
  checks: Check[];
  raw: {
    title: string | null;
    metaDescription: string | null;
    h1: string | null;
    canonical: string | null;
    wordCount: number;
  };
}

const SAMPLE_URLS = [
  '/',
  '/how-payment-works',
  '/how-verification-works',
  '/voice-rfq',
  '/how-it-works',
];

export default function SeoOnPagePage() {
  const [url, setUrl] = useState('/how-payment-works');
  const [keyword, setKeyword] = useState('b2b marketplace india');
  const [withAi, setWithAi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OnPageResult | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    setAiSuggestions(null);
    try {
      const res = await fetch('/api/admin/seo/on-page', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, targetKeyword: keyword, aiSuggestions: withAi }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Analysis failed');
      setResult(json.result);
      setAiSuggestions(json.aiSuggestions);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  const scoreColor =
    result && result.score >= 80 ? 'text-emerald-400' : result && result.score >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
        On-page SEO checker — title, meta, H1, canonical, word count. Optional Groq/NVIDIA AI suggestions.
        Replaces paid Ubersuggest on-page audits for your own pages.
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {SAMPLE_URLS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setUrl(p)}
              className={`px-2.5 py-1 rounded-lg text-xs ${url === p ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-slate-500 text-xs">Page URL or path</span>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="/how-payment-works"
            />
          </label>
          <label className="block">
            <span className="text-slate-500 text-xs">Target keyword (optional)</span>
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input type="checkbox" checked={withAi} onChange={e => setWithAi(e.target.checked)} />
          Include AI fix suggestions (Groq/NVIDIA)
        </label>

        <button
          type="button"
          onClick={analyze}
          disabled={loading || !url.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
        >
          {loading ? 'Analyzing…' : 'Run on-page check'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 text-red-300 text-sm">{error}</div>
      )}

      {result && (
        <>
          <div className="flex items-center gap-4">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 text-center min-w-[120px]">
              <p className="text-slate-500 text-xs">Score</p>
              <p className={`text-3xl font-bold ${scoreColor}`}>{result.score}</p>
            </div>
            <div className="text-sm text-slate-400">
              <p className="text-slate-300 break-all">{result.url}</p>
              <p className="text-xs mt-1">{result.raw.wordCount} words · {new Date(result.analyzedAt).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 space-y-3">
            <h3 className="text-white font-semibold text-sm">Checks</h3>
            {result.checks.map(c => (
              <div key={c.id} className="flex gap-3 text-sm border-b border-slate-800 pb-3 last:border-0">
                <span className={`shrink-0 ${c.pass ? 'text-emerald-400' : 'text-red-400'}`}>{c.pass ? '✓' : '✗'}</span>
                <div className="min-w-0">
                  <p className="text-slate-200 font-medium">{c.label}</p>
                  {c.value && <p className="text-slate-500 text-xs mt-0.5 break-words">{c.value}</p>}
                  {c.suggestion && <p className="text-amber-400/90 text-xs mt-1">{c.suggestion}</p>}
                </div>
              </div>
            ))}
          </div>

          {aiSuggestions && aiSuggestions.length > 0 && (
            <div className="bg-indigo-900/20 border border-indigo-700/40 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">AI suggestions</h3>
              <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
                {aiSuggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
