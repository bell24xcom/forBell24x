'use client';

import { useEffect, useState } from 'react';

interface BriefInsight {
  type: string;
  text: string;
  priority: string;
}

interface MorningBrief {
  greeting: string;
  genomeOverall: number;
  insights: BriefInsight[];
  aiPolish?: string[];
  companyName: string;
}

interface GenomeModule {
  id: string;
  label: string;
  score: number;
}

export default function MorningBriefAdminPage() {
  const [suppliers, setSuppliers] = useState<{ id: string; companyName: string }[]>([]);
  const [userId, setUserId] = useState('');
  const [brief, setBrief] = useState<MorningBrief | null>(null);
  const [genome, setGenome] = useState<{ overall: number; modules: GenomeModule[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [withAi, setWithAi] = useState(false);

  useEffect(() => {
    fetch('/api/admin/seo/supplier-profiles', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setSuppliers(d.suppliers.map((s: { id: string; companyName: string }) => ({ id: s.id, companyName: s.companyName })));
        }
      });
  }, []);

  async function loadBrief() {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/morning-brief?userId=${userId}&ai=${withAi ? 1 : 0}`, { credentials: 'include' });
      const d = await res.json();
      if (d.success) {
        setBrief(d.brief);
        setGenome(d.genome);
      }
    } finally {
      setLoading(false);
    }
  }

  const priorityColor = (p: string) =>
    p === 'high' ? 'text-red-400' : p === 'medium' ? 'text-amber-400' : 'text-slate-400';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white">Morning Business Brief</h1>
        <p className="text-slate-400 text-sm mt-1">
          Reads only <strong className="text-slate-300">Business Operating Memory</strong> — no internet, no generic chatbot.
          Future mobile app home screen. See <code className="text-slate-600">docs/VYAPARSETHU_VISION.md</code> in repo.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <label className="block">
          <span className="text-slate-500 text-xs">Company</span>
          <select
            value={userId}
            onChange={e => setUserId(e.target.value)}
            className="mt-1 block bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white min-w-[200px]"
          >
            <option value="">Select supplier…</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.companyName}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-400 pb-2">
          <input type="checkbox" checked={withAi} onChange={e => setWithAi(e.target.checked)} />
          Groq polish (optional)
        </label>
        <button
          type="button"
          onClick={loadBrief}
          disabled={!userId || loading}
          className="px-4 py-2 bg-[#D4AF37] text-[#001f3f] text-sm font-bold rounded-lg disabled:opacity-50"
        >
          {loading ? 'Generating…' : 'Generate brief'}
        </button>
      </div>

      {brief && (
        <div className="bg-gradient-to-br from-[#001f3f] to-slate-900 border border-[#D4AF37]/30 rounded-2xl p-6 space-y-4">
          <p className="text-[#D4AF37] text-lg font-semibold">{brief.greeting}</p>
          <p className="text-slate-400 text-sm">
            Business Genome: <span className="text-white font-bold">{brief.genomeOverall}%</span>
          </p>
          <ul className="space-y-3">
            {brief.insights.map((ins, i) => (
              <li key={i} className={`text-sm ${priorityColor(ins.priority)}`}>
                <span className="text-slate-600 text-[10px] uppercase mr-2">{ins.type}</span>
                {ins.text}
              </li>
            ))}
          </ul>
          {brief.aiPolish && brief.aiPolish.length > 0 && (
            <div className="border-t border-slate-700 pt-4">
              <p className="text-slate-500 text-xs mb-2">AI polish (same facts)</p>
              {brief.aiPolish.map((line, i) => (
                <p key={i} className="text-slate-300 text-sm">{line}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {genome && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-3">Business Genome</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {genome.modules.slice(0, 12).map(m => (
              <div key={m.id} className="text-xs">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>{m.label}</span>
                  <span>{m.score}%</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${m.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
