'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import type { SubmissionStatus } from '@/src/data/directory-submissions';
import { TEXTILE_BACKLINK_TARGETS } from '@/src/data/seo-opportunities';

const PRIORITY_BACKLINKS = [
  {
    id: 'crunchbase',
    name: 'Crunchbase',
    da: 90,
    time: '~15 min',
    blurb: 'DA 90 dofollow profile — highest-impact backlink for a new B2B startup.',
    submitUrl: 'https://www.crunchbase.com/add-new-organization',
    guidePath: '/admin/directories/submit?guide=crunchbase',
    verifyUrl: 'https://www.crunchbase.com/discover/organization/vyaparsethu',
  },
  {
    id: 'g2',
    name: 'G2',
    da: 85,
    time: '~20 min',
    blurb: 'B2B Marketplace listing + reviews — comparison traffic vs IndiaMART.',
    submitUrl: 'https://sell.g2.com/free-listing',
    guidePath: '/admin/directories/submit?guide=g2',
    verifyUrl: 'https://www.g2.com/search?query=vyaparsethu',
  },
  {
    id: 'startupindia',
    name: 'Startup India (DPIIT)',
    da: 66,
    time: '~30 min',
    blurb: 'Government recognition — credibility for MSME buyers and suppliers.',
    submitUrl: 'https://www.startupindia.gov.in/content/sih/en/startupgov/startup-recognition-page.html',
    guidePath: '/admin/directories/submit?guide=startupindia',
    verifyUrl: 'https://www.startupindia.gov.in/',
  },
] as const;

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  pending:   'bg-slate-700 text-slate-400',
  submitted: 'bg-amber-500/20 text-amber-300',
  live:      'bg-emerald-500/20 text-emerald-300',
  rejected:  'bg-red-500/20 text-red-400',
  skip:      'bg-slate-800 text-slate-600',
};

type StatusMap = Record<string, SubmissionStatus>;

export default function SeoBacklinksPage() {
  const [statuses, setStatuses] = useState<StatusMap>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('dir_statuses') || '{}'); } catch { return {}; }
  });

  const setStatus = (id: string, status: SubmissionStatus) => {
    const next = { ...statuses, [id]: status };
    setStatuses(next);
    try { localStorage.setItem('dir_statuses', JSON.stringify(next)); } catch { /* ignore */ }
  };

  const done = useMemo(
    () => PRIORITY_BACKLINKS.filter(b => statuses[b.id] === 'live' || statuses[b.id] === 'submitted').length,
    [statuses],
  );

  return (
    <div className="space-y-6">
      <div className="bg-amber-500/5 border border-amber-500/25 rounded-xl p-4">
        <p className="text-amber-200/90 text-sm">
          <strong>Manual step required.</strong> These listings cannot be submitted from code — use the copy-paste guides below,
          then mark status here. Target order: <strong>Crunchbase → G2 → Startup India</strong>.
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-400">Progress:</span>
        <span className="text-white font-bold">{done} / {PRIORITY_BACKLINKS.length}</span>
        <span className="text-slate-500">submitted or live</span>
        <Link href="/admin/directories" className="text-indigo-400 hover:text-indigo-300 text-xs ml-auto">
          All {40}+ directories →
        </Link>
      </div>

      <div className="space-y-4">
        {PRIORITY_BACKLINKS.map((item, i) => {
          const status = statuses[item.id] || 'pending';
          return (
            <div
              key={item.id}
              className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs font-mono">#{i + 1}</span>
                    <h2 className="text-white font-bold text-lg">{item.name}</h2>
                    <span className="text-[#D4AF37] text-xs font-mono">DA {item.da}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${STATUS_STYLES[status]}`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{item.blurb}</p>
                  <p className="text-slate-600 text-xs mt-1">{item.time} · digitex.studio@gmail.com</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={item.guidePath}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
                  >
                    Copy-paste guide →
                  </Link>
                  <a
                    href={item.submitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] text-xs font-semibold rounded-lg"
                  >
                    Open form ↗
                  </a>
                  <a
                    href={item.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg"
                  >
                    Check live ↗
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-700/50">
                {(['pending', 'submitted', 'live', 'skip'] as SubmissionStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(item.id, s)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors ${
                      status === s ? STATUS_STYLES[s] + ' ring-1 ring-white/20' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <section className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <div className="mb-4">
          <h2 className="text-white font-semibold text-sm">Textile swatch-book outreach targets</h2>
          <p className="text-slate-500 text-xs mt-1">
            Use these for the new upholstery, curtain, fabric sample card, and binding-hardware pages.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {TEXTILE_BACKLINK_TARGETS.map(target => (
            <div key={target.name} className="bg-slate-900/40 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-white font-medium text-sm">{target.name}</h3>
                  <p className="text-slate-500 text-xs mt-1">{target.use}</p>
                </div>
                <a
                  href={target.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 shrink-0"
                >
                  Open ↗
                </a>
              </div>
              <p className="text-slate-600 text-[11px] font-mono break-all">{target.url}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
