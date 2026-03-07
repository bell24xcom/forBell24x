'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Clock, Database, RefreshCw, Shield, Trash2, XCircle } from 'lucide-react';

interface ErrorLog {
  id: string;
  route: string;
  method: string;
  message: string;
  stack?: string;
  userId?: string;
  severity: string;
  createdAt: string;
}

interface LogData {
  logs: ErrorLog[];
  pagination: { page: number; limit: number; total: number; pages: number };
  summary: { critical: number; error: number; warn: number };
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-900/50 text-red-300 border border-red-700',
  error:    'bg-orange-900/50 text-orange-300 border border-orange-700',
  warn:     'bg-amber-900/50 text-amber-300 border border-amber-700',
  info:     'bg-blue-900/50 text-blue-300 border border-blue-700',
};

const SEVERITY_ICONS: Record<string, React.ReactNode> = {
  critical: <XCircle className="w-4 h-4 text-red-400" />,
  error:    <AlertTriangle className="w-4 h-4 text-orange-400" />,
  warn:     <AlertTriangle className="w-4 h-4 text-amber-400" />,
  info:     <CheckCircle className="w-4 h-4 text-blue-400" />,
};

export default function SecurityPage() {
  const [tab,       setTab]       = useState<'logs' | 'compliance'>('logs');
  const [data,      setData]      = useState<LogData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [severity,  setSeverity]  = useState('');
  const [page,      setPage]      = useState(1);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [expanded,  setExpanded]  = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ page: String(page), limit: '30' });
    if (severity) params.set('severity', severity);
    try {
      const res  = await fetch(`/api/admin/errors?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      setError('Failed to load error logs');
    } finally {
      setLoading(false);
    }
  }, [page, severity]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const deleteLog = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/admin/errors?id=${id}`, { method: 'DELETE' });
      setData(prev => prev ? {
        ...prev,
        logs: prev.logs.filter(l => l.id !== id),
        pagination: { ...prev.pagination, total: prev.pagination.total - 1 },
      } : prev);
    } finally {
      setDeleting(null);
    }
  };

  const clearOld = async () => {
    if (!confirm('Clear all error logs older than 30 days?')) return;
    await fetch('/api/admin/errors', { method: 'DELETE' });
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Security & Error Logs</h1>
          <p className="text-slate-400 text-sm">Platform error monitoring and compliance status</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Critical', value: data.summary.critical, color: 'text-red-400',    bg: 'bg-red-900/20 border-red-700/40' },
            { label: 'Errors',   value: data.summary.error,    color: 'text-orange-400', bg: 'bg-orange-900/20 border-orange-700/40' },
            { label: 'Warnings', value: data.summary.warn,     color: 'text-amber-400',  bg: 'bg-amber-900/20 border-amber-700/40' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`border rounded-xl px-4 py-3 ${bg}`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 rounded-xl p-1 w-fit border border-slate-700/50">
        {(['logs', 'compliance'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t === 'logs' ? 'Error Logs' : 'Compliance'}
          </button>
        ))}
      </div>

      {/* Logs Tab */}
      {tab === 'logs' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={severity}
              onChange={e => { setSeverity(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none"
            >
              <option value="">All severities</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
            </select>
            <button
              onClick={clearOld}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-900/30 border border-red-700/50 text-red-300 rounded-lg text-sm hover:bg-red-900/50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear old logs (&gt;30d)
            </button>
            {data && (
              <span className="text-slate-500 text-sm ml-auto">{data.pagination.total} logs total</span>
            )}
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          {/* Table */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !data || data.logs.length === 0 ? (
              <div className="py-12 text-center">
                <Shield className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="text-white font-medium">No error logs found</p>
                <p className="text-slate-400 text-sm mt-1">The system is running cleanly</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/30">
                {data.logs.map(log => (
                  <div key={log.id} className="px-5 py-3 hover:bg-slate-700/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">{SEVERITY_ICONS[log.severity] ?? SEVERITY_ICONS.info}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_COLORS[log.severity] ?? SEVERITY_COLORS.info}`}>
                            {log.severity}
                          </span>
                          <code className="text-xs text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded">
                            {log.method} {log.route}
                          </code>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(log.createdAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-200 mt-1 truncate">{log.message}</p>
                        {log.stack && (
                          <button
                            onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 transition-colors"
                          >
                            {expanded === log.id ? 'Hide stack trace' : 'Show stack trace'}
                          </button>
                        )}
                        {expanded === log.id && log.stack && (
                          <pre className="mt-2 text-xs bg-slate-900/70 text-slate-300 p-3 rounded-lg overflow-x-auto max-h-32 font-mono">
                            {log.stack}
                          </pre>
                        )}
                      </div>
                      <button
                        onClick={() => deleteLog(log.id)}
                        disabled={deleting === log.id}
                        className="shrink-0 p-1.5 text-slate-600 hover:text-red-400 transition-colors rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Page {data.pagination.page} of {data.pagination.pages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 bg-slate-800 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors">
                  ← Prev
                </button>
                <button disabled={page >= data.pagination.pages} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 bg-slate-800 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compliance Tab */}
      {tab === 'compliance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" /> Data Protection
            </h3>
            <div className="space-y-3">
              {[
                'JWT authentication with HttpOnly cookies',
                'Bcrypt password hashing (12 rounds)',
                'Admin routes protected with admin-token',
                'Database encryption at rest (Neon)',
                'HTTPS enforced (TLS 1.3)',
                'No PII in public supplier API responses',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" /> Application Security
            </h3>
            <div className="space-y-3">
              {[
                'SQL injection prevention (Prisma ORM)',
                'XSS protection (React JSX escaping)',
                'CSRF-safe (SameSite cookie attribute)',
                'Input validation on all API routes',
                'Rate limiting via Vercel Edge',
                'Error logs retained for 30 days',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
