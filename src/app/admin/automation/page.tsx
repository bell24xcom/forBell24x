'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  GitBranch,
  Calendar,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface Job {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  schedule?: string;
  enabled: boolean;
  retryCount: number;
  timeoutSeconds: number;
}

interface SchedulerInfo {
  current: string;
  available: string[];
  migrationPath: string[];
}

export default function AutomationDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [scheduler, setScheduler] = useState<SchedulerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/automation/jobs', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
        setScheduler(data.scheduler);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  async function executeJob(jobId: string) {
    setExecuting(jobId);
    setError(null);
    try {
      const res = await fetch('/api/admin/automation/jobs', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action: 'execute' }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
      }
      // Refresh list
      await loadJobs();
    } catch (e) {
      setError('Failed to execute job');
    } finally {
      setExecuting(null);
    }
  }

  function formatSchedule(cron: string): string {
    const parts = cron.split(' ');
    if (parts.length !== 5) return cron;
    const [minute, hour, , , dayOfWeek] = parts;
    if (dayOfWeek === '*') {
      return `Daily at ${hour}:${minute.padStart(2, '0')}`;
    }
    if (dayOfWeek === '1') {
      return `Mondays at ${hour}:${minute.padStart(2, '0')}`;
    }
    return cron;
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-white mb-4">Automation & Jobs</h1>
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-white">Automation & Jobs</h1>
        <p className="text-slate-400 text-sm mt-1">
          Scheduler provider: <span className="text-emerald-400 font-medium">{scheduler?.current}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Scheduler Info */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-indigo-400" />
          Scheduler Architecture
        </h2>
        <div className="space-y-2 text-sm">
          <p className="text-slate-400">
            <span className="text-slate-300">Current:</span> {scheduler?.current}
          </p>
          <p className="text-slate-400">
            <span className="text-slate-300">Migration Path:</span>{' '}
            {scheduler?.migrationPath.join(' ')}
          </p>
          <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-slate-500">
              Jobs are executed via GitHub Actions workflows. 
              View workflow runs on{' '}
              <a 
                href="https://github.com/bell24xcom/forBell24x/actions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
              >
                GitHub <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Scheduled Jobs
          </h2>
          <button
            onClick={loadJobs}
            className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        <div className="divide-y divide-slate-700/50">
          {jobs.filter(j => j.enabled).map(job => (
            <div key={job.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-800/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium text-sm">{job.name}</h3>
                  {job.schedule && (
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatSchedule(job.schedule)}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs">{job.description}</p>
                <p className="text-slate-600 text-[10px] font-mono">{job.endpoint}</p>
              </div>

              <button
                onClick={() => executeJob(job.id)}
                disabled={executing === job.id}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {executing === job.id ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    Run Now
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Disabled Jobs */}
      {jobs.filter(j => !j.enabled).length > 0 && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-slate-500" />
              Future Jobs (Disabled)
            </h2>
          </div>
          <div className="divide-y divide-slate-700/50">
            {jobs.filter(j => !j.enabled).map(job => (
              <div key={job.id} className="px-5 py-3 opacity-60">
                <h3 className="text-slate-400 font-medium text-sm">{job.name}</h3>
                <p className="text-slate-600 text-xs">{job.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GitHub Actions Links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <a 
          href="https://github.com/bell24xcom/forBell24x/actions/workflows/daily-cron.yml"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 rounded-xl p-4 flex items-center gap-3 transition-colors"
        >
          <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">Daily Cron Workflow</h3>
            <p className="text-slate-500 text-xs">View runs on GitHub</p>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-500 ml-auto" />
        </a>

        <a 
          href="https://github.com/bell24xcom/forBell24x/actions/workflows/manual-job.yml"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-800/40 border border-slate-700/50 hover:border-emerald-500/50 rounded-xl p-4 flex items-center gap-3 transition-colors"
        >
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <Play className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">Manual Job Trigger</h3>
            <p className="text-slate-500 text-xs">Run any job on-demand</p>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-500 ml-auto" />
        </a>
      </div>
    </div>
  );
}
