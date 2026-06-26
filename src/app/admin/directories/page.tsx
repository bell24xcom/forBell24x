'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { DIRECTORIES, SUBMISSION_COPY, type Directory, type SubmissionStatus } from '@/src/data/directory-submissions';

const CATEGORY_COLORS: Record<string, string> = {
  'B2B India':        'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'MSME/Govt':        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Global B2B':       'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Industry Specific':'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'SEO/Backlink':     'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  pending:   'bg-slate-700 text-slate-400',
  submitted: 'bg-amber-500/20 text-amber-300',
  live:      'bg-emerald-500/20 text-emerald-300',
  rejected:  'bg-red-500/20 text-red-400',
  skip:      'bg-slate-800 text-slate-600',
};

const CATEGORIES = ['All', 'B2B India', 'MSME/Govt', 'Global B2B', 'Industry Specific', 'SEO/Backlink'];

type StatusMap = Record<string, SubmissionStatus>;

export default function DirectoriesPage() {
  const [statuses, setStatuses] = useState<StatusMap>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('dir_statuses') || '{}'); } catch { return {}; }
  });
  const [filter, setFilter] = useState('All');
  const [showCopy, setShowCopy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const setStatus = (id: string, status: SubmissionStatus) => {
    const next = { ...statuses, [id]: status };
    setStatuses(next);
    try { localStorage.setItem('dir_statuses', JSON.stringify(next)); } catch { /* ignore */ }
  };

  const copyText = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const filtered = useMemo(() =>
    filter === 'All' ? DIRECTORIES : DIRECTORIES.filter(d => d.category === filter),
  [filter]);

  const counts = useMemo(() => ({
    total: DIRECTORIES.length,
    pending:   DIRECTORIES.filter(d => !statuses[d.id] || statuses[d.id] === 'pending').length,
    submitted: DIRECTORIES.filter(d => statuses[d.id] === 'submitted').length,
    live:      DIRECTORIES.filter(d => statuses[d.id] === 'live').length,
    skip:      DIRECTORIES.filter(d => statuses[d.id] === 'skip').length,
  }), [statuses]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Directory Submissions</h1>
          <p className="text-slate-400 text-sm mt-1">Track listing submissions across {counts.total} B2B, MSME, and SEO directories</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/directories/submit"
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold rounded-lg text-xs transition-colors">
            Crunchbase / G2 guides →
          </Link>
          <button onClick={() => setShowCopy(s => !s)}
            className="px-4 py-2 bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg text-xs font-medium hover:bg-[#D4AF37]/30 transition-colors">
            {showCopy ? '✕ Hide Copy Kit' : '📋 Copy Kit'}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Pending',   value: counts.pending,   color: 'text-slate-400' },
          { label: 'Submitted', value: counts.submitted, color: 'text-amber-400' },
          { label: 'Live',      value: counts.live,      color: 'text-emerald-400' },
          { label: 'Skipped',   value: counts.skip,      color: 'text-slate-600' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Copy Kit Panel */}
      {showCopy && (
        <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-6 mb-8">
          <h2 className="text-white font-bold text-sm mb-4">Submission Copy Kit — paste into every directory form</h2>
          <div className="space-y-3">
            {[
              { label: 'Company Name',   text: SUBMISSION_COPY.companyName },
              { label: 'Tagline',        text: SUBMISSION_COPY.tagline },
              { label: 'Short Desc',     text: SUBMISSION_COPY.shortDescription },
              { label: 'Website',        text: SUBMISSION_COPY.website },
              { label: 'Email',          text: SUBMISSION_COPY.email },
              { label: 'Address',        text: SUBMISSION_COPY.address },
              { label: 'Categories',     text: SUBMISSION_COPY.categories.join(', ') },
              { label: 'Keywords',       text: SUBMISSION_COPY.keywords.join(', ') },
              { label: 'Long Desc',      text: SUBMISSION_COPY.longDescription },
            ].map(({ label, text }) => (
              <div key={label} className="bg-slate-800/60 rounded-lg p-3 flex gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">{text}</p>
                </div>
                <button onClick={() => copyText(text, label)}
                  className="shrink-0 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors">
                  {copied === label ? '✓' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === cat ? 'bg-[#D4AF37] text-[#001f3f]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}>
            {cat}
            {cat !== 'All' && (
              <span className="ml-1.5 text-[10px] opacity-60">
                {DIRECTORIES.filter(d => d.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Directory table */}
      <div className="space-y-2">
        {filtered.map((dir: Directory) => {
          const status: SubmissionStatus = statuses[dir.id] || 'pending';
          return (
            <div key={dir.id}
              className={`bg-slate-800/40 border rounded-xl p-4 transition-all ${
                status === 'live'      ? 'border-emerald-500/30' :
                status === 'skip'     ? 'border-slate-800 opacity-50' :
                status === 'submitted'? 'border-amber-500/30' :
                                        'border-slate-700/50'
              }`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                {/* Left: info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <a href={dir.url} target="_blank" rel="noopener noreferrer"
                      className="text-white font-semibold text-sm hover:text-[#D4AF37] transition-colors">
                      {dir.name}
                    </a>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${CATEGORY_COLORS[dir.category]}`}>
                      {dir.category}
                    </span>
                    {dir.freeSubmission && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Free
                      </span>
                    )}
                    <span className="text-slate-500 text-[10px]">DA {dir.da}</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{dir.notes}</p>
                </div>

                {/* Right: status selector */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={status}
                    onChange={e => setStatus(dir.id, e.target.value as SubmissionStatus)}
                    className={`text-xs rounded-lg px-2 py-1.5 border-0 outline-none cursor-pointer ${STATUS_COLORS[status]}`}>
                    <option value="pending">⏳ Pending</option>
                    <option value="submitted">📤 Submitted</option>
                    <option value="live">✅ Live</option>
                    <option value="rejected">❌ Rejected</option>
                    <option value="skip">⏭ Skip</option>
                  </select>
                  <a href={dir.url} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors whitespace-nowrap">
                    Open →
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority guide */}
      <div className="mt-10 bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-6">
        <h2 className="text-white font-bold text-sm mb-4">Submission Priority Guide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
          <div>
            <p className="text-white font-semibold mb-2">Day 1–2 (Do Today)</p>
            <ul className="space-y-1">
              <li>• Crunchbase (DA 90)</li>
              <li>• Startup India / DPIIT</li>
              <li>• G2 + Capterra (DA 85+)</li>
              <li>• AlternativeTo (IndiaMART alt)</li>
              <li>• Wellfound/AngelList</li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Day 3–5 (High DA India)</p>
            <ul className="space-y-1">
              <li>• IndiaMART seller listing</li>
              <li>• TradeIndia</li>
              <li>• Justdial</li>
              <li>• Alibaba.com India</li>
              <li>• GeM (Govt e-Marketplace)</li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Day 6–14 (Long tail)</p>
            <ul className="space-y-1">
              <li>• All remaining B2B India</li>
              <li>• Industry-specific (steel, chemicals)</li>
              <li>• Global B2B directories</li>
              <li>• Product Hunt launch (Tuesday)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
