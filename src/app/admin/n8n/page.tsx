'use client';

import { useState } from 'react';
import { RefreshCw, Clock, CheckCircle, AlertCircle, ExternalLink, Zap } from 'lucide-react';

interface CronJob {
  name: string;
  path: string;
  schedule: string;
  description: string;
  scheduleHuman: string;
  type: 'daily' | 'weekly';
}

const CRON_JOBS: CronJob[] = [
  {
    name: 'Demand Loop',
    path: '/api/cron/demand-loop',
    schedule: '0 6 * * *',
    scheduleHuman: 'Daily at 6:00 AM UTC',
    description: 'Converts external leads to RFQs, generates demand signals, refreshes market data.',
    type: 'daily',
  },
  {
    name: 'Supplier Follow-up',
    path: '/api/cron/follow-up-due',
    schedule: '0 7 * * *',
    scheduleHuman: 'Daily at 7:00 AM UTC',
    description: 'Surfaces Day 2 and Day 5 follow-ups for unresponsive suppliers. Operator sends via operator dashboard.',
    type: 'daily',
  },
  {
    name: 'Supplier Drip',
    path: '/api/cron/supplier-drip',
    schedule: '0 9 * * *',
    scheduleHuman: 'Daily at 9:00 AM UTC',
    description: 'Day 3 profile reminder, Day 7 first-quote nudge, Day 14 re-engagement. Logs drip_dayX_sent to InteractionMemory.',
    type: 'daily',
  },
  {
    name: 'Analyze Behavior',
    path: '/api/cron/analyze-behavior',
    schedule: '0 2 * * *',
    scheduleHuman: 'Daily at 2:00 AM UTC',
    description: 'Analyzes user behavior patterns for the past 30 days and generates market insights.',
    type: 'daily',
  },
  {
    name: 'Expire RFQs',
    path: '/api/cron/expire-rfqs',
    schedule: '0 3 * * *',
    scheduleHuman: 'Daily at 3:00 AM UTC',
    description: 'Marks overdue RFQs as EXPIRED so the marketplace stays clean.',
    type: 'daily',
  },
  {
    name: 'Update Insights',
    path: '/api/cron/update-insights',
    schedule: '0 6 * * *',
    scheduleHuman: 'Daily at 6:00 AM UTC',
    description: 'Refreshes category-level market insights (price bands, demand trends, conversion rates).',
    type: 'daily',
  },
  {
    name: 'Churn Check',
    path: '/api/cron/churn-check',
    schedule: '0 9 * * 1',
    scheduleHuman: 'Every Monday at 9:00 AM UTC',
    description: 'Sends re-engagement emails to users inactive for 14+ days.',
    type: 'weekly',
  },
  {
    name: 'Weekly Digest',
    path: '/api/cron/weekly-digest',
    schedule: '0 10 * * 1',
    scheduleHuman: 'Every Monday at 10:00 AM UTC',
    description: 'Sends weekly marketplace summary email to active buyers and suppliers.',
    type: 'weekly',
  },
];

export default function AutomationAdminPage() {
  const [testing, setTesting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { ok: boolean; data: string }>>({});

  async function triggerCron(path: string) {
    setTesting(path);
    try {
      const res = await fetch(path, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`,
        },
      });
      const data = await res.json();
      setResults(prev => ({ ...prev, [path]: { ok: res.ok, data: JSON.stringify(data, null, 2) } }));
    } catch (e) {
      setResults(prev => ({ ...prev, [path]: { ok: false, data: 'Failed to reach endpoint' } }));
    } finally {
      setTesting(null);
    }
  }

  const dailyCrons = CRON_JOBS.filter(c => c.type === 'daily');
  const weeklyCrons = CRON_JOBS.filter(c => c.type === 'weekly');

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Automation Status</h1>
            <p className="text-slate-400 text-sm mt-1">
              Vercel Cron Jobs — replaces the old n8n setup on DigitalOcean (cancelled March 2026)
            </p>
          </div>
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm"
          >
            Vercel Dashboard <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Architecture note */}
        <div className="bg-blue-950/40 border border-blue-800/50 rounded-lg p-4 text-sm text-blue-300">
          <p className="font-semibold text-blue-200 mb-1 flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> Golden Rule
          </p>
          <p>
            Cron jobs <strong>execute</strong> — they never decide. All matching, scoring, and revenue logic
            lives in <code className="bg-blue-900/50 px-1 rounded">app/api/</code> routes. If vercel.json is
            deleted, Bell24h must still work.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Cron Jobs', value: CRON_JOBS.length, color: 'text-blue-400' },
            { label: 'Daily Jobs', value: dailyCrons.length, color: 'text-green-400' },
            { label: 'Weekly Jobs', value: weeklyCrons.length, color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-slate-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Daily crons */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Daily Jobs</h2>
          <div className="space-y-3">
            {dailyCrons.map(job => (
              <CronCard key={job.path} job={job} testing={testing} results={results} onTrigger={triggerCron} />
            ))}
          </div>
        </section>

        {/* Weekly crons */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Weekly Jobs</h2>
          <div className="space-y-3">
            {weeklyCrons.map(job => (
              <CronCard key={job.path} job={job} testing={testing} results={results} onTrigger={triggerCron} />
            ))}
          </div>
        </section>

        {/* Operator dashboard link */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-white text-sm">Operator Dashboard</p>
            <p className="text-slate-400 text-xs mt-0.5">
              Manual outreach, follow-up sending, funnel stats — your daily command center
            </p>
          </div>
          <a
            href="/dashboard/operator"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Open
          </a>
        </div>

      </div>
    </div>
  );
}

function CronCard({
  job,
  testing,
  results,
  onTrigger,
}: {
  job: CronJob;
  testing: string | null;
  results: Record<string, { ok: boolean; data: string }>;
  onTrigger: (path: string) => void;
}) {
  const result = results[job.path];
  const isLoading = testing === job.path;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white text-sm">{job.name}</span>
            <span className="bg-green-900/50 text-green-400 text-xs px-1.5 py-0.5 rounded font-mono">
              {job.schedule}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-slate-400 text-xs">
            <Clock className="w-3 h-3" />
            {job.scheduleHuman}
          </div>
          <p className="text-slate-400 text-xs mt-1.5">{job.description}</p>
          <p className="text-slate-600 text-xs font-mono mt-1">{job.path}</p>
        </div>
        <button
          onClick={() => onTrigger(job.path)}
          disabled={isLoading}
          className="shrink-0 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Running...' : 'Test'}
        </button>
      </div>

      {result && (
        <div className={`rounded p-3 text-xs font-mono ${result.ok ? 'bg-green-950/50 border border-green-800/50' : 'bg-red-950/50 border border-red-800/50'}`}>
          <div className={`flex items-center gap-1 mb-1 font-semibold ${result.ok ? 'text-green-400' : 'text-red-400'}`}>
            {result.ok ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {result.ok ? 'Success' : 'Error'}
          </div>
          <pre className="whitespace-pre-wrap text-slate-300 leading-relaxed overflow-auto max-h-32">
            {result.data}
          </pre>
        </div>
      )}
    </div>
  );
}
