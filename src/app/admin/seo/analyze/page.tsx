'use client';

import { useState } from 'react';
import Link from 'next/link';

type AnalyzeType = 'gsc_queries' | 'position_tracking' | 'content_ideas' | 'ref_domains' | 'generic';

const TYPES: { id: AnalyzeType; label: string; hint: string }[] = [
  { id: 'position_tracking', label: 'Position tracking CSV', hint: 'Ubersuggest / manual rank export' },
  { id: 'content_ideas', label: 'Content ideas CSV', hint: 'Competitor pages for a seed keyword' },
  { id: 'ref_domains', label: 'Referring domains CSV', hint: 'Backlink gap / competitor ref domains' },
  { id: 'gsc_queries', label: 'GSC queries export', hint: 'Search Console → Performance → Export' },
  { id: 'generic', label: 'Generic SEO CSV', hint: 'Any audit export' },
];

export default function SeoAnalyzePage() {
  const [csvText, setCsvText] = useState('');
  const [type, setType] = useState<AnalyzeType>('position_tracking');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState<{ provider?: string; model?: string } | null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsvText(String(reader.result ?? ''));
    reader.readAsText(file);
  };

  const analyze = async () => {
    if (!csvText.trim()) {
      setError('Paste CSV or upload a file first');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/admin/seo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Analysis failed');
        if (data.fallback) setResult(data.fallback);
        return;
      }
      setResult(data.result);
      setMeta({ provider: data.provider, model: data.model });
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
        Upload GSC, position tracking, content ideas, or backlink CSVs. Analyzes via{' '}
        <strong className="text-slate-200">Groq</strong> or <strong className="text-slate-200">NVIDIA NIM</strong> — no Ubersuggest API, no Gemini required.
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPES.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs ${type === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            title={t.hint}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-500 mb-2">Paste CSV</label>
          <textarea
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            rows={12}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 font-mono"
            placeholder="No,Position,Keyword,..."
          />
        </div>
        <div className="space-y-3">
          <label className="block text-xs text-slate-500">Or upload file</label>
          <input type="file" accept=".csv,.txt" onChange={onFile} className="text-xs text-slate-400" />
          <button
            type="button"
            onClick={analyze}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl"
          >
            {loading ? 'Analyzing…' : 'Analyze with AI (Groq → NVIDIA)'}
          </button>
          {meta?.provider && (
            <p className="text-slate-600 text-xs">Powered by {meta.provider} · {meta.model}</p>
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </div>

      {result && (
        <section className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Results</h2>
          <pre className="text-xs text-slate-400 overflow-auto max-h-[480px] whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </section>
      )}

      <p className="text-slate-600 text-xs">
        Import opportunities manually into{' '}
        <Link href="/admin/seo/opportunities" className="text-indigo-400">Opportunities</Link> or update{' '}
        <code className="text-slate-500">seo-opportunities.ts</code> after review.
      </p>
    </div>
  );
}
