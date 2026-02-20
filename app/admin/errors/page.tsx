'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, AlertCircle, Info, RefreshCw, Trash2, Filter } from 'lucide-react';

interface ErrorLog {
  id: string;
  route: string;
  method: string;
  message: string;
  stack?: string;
  userId?: string;
  severity: 'warn' | 'error' | 'critical';
  meta?: any;
  createdAt: string;
}

interface Summary {
  critical: number;
  error: number;
  warn: number;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  error:    'bg-orange-100 text-orange-800 border-orange-300',
  warn:     'bg-yellow-100 text-yellow-800 border-yellow-300',
};

const SEVERITY_ICON = {
  critical: <AlertCircle  className="w-4 h-4 text-red-600" />,
  error:    <AlertTriangle className="w-4 h-4 text-orange-500" />,
  warn:     <Info          className="w-4 h-4 text-yellow-500" />,
};

export default function AdminErrorsPage() {
  const [logs, setLogs]         = useState<ErrorLog[]>([]);
  const [summary, setSummary]   = useState<Summary>({ critical: 0, error: 0, warn: 0 });
  const [loading, setLoading]   = useState(true);
  const [severity, setSeverity] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const LIMIT = 50;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (severity) params.set('severity', severity);

      const res = await fetch(`/api/admin/errors?${params}`, {
        headers: { Authorization: `Bearer ${document.cookie.match(/admin-token=([^;]+)/)?.[1] ?? ''}` },
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Unauthorised');
      const data = await res.json();
      setLogs(data.logs ?? []);
      setSummary(data.summary ?? { critical: 0, error: 0, warn: 0 });
      setTotal(data.pagination?.total ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, severity]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const clearOld = async () => {
    if (!confirm('Delete all error logs older than 30 days?')) return;
    await fetch('/api/admin/errors', { method: 'DELETE', credentials: 'include' });
    fetchLogs();
  };

  const deleteOne = async (id: string) => {
    await fetch(`/api/admin/errors?id=${id}`, { method: 'DELETE', credentials: 'include' });
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#0f172a', minHeight: '100vh', padding: '24px', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', margin: 0 }}>Error Logs</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0' }}>
            Real-time errors from Bell24h API routes
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchLogs}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', cursor: 'pointer', fontSize: '14px' }}
          >
            <RefreshCw style={{ width: 14, height: 14 }} /> Refresh
          </button>
          <button
            onClick={clearOld}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#7f1d1d', border: 'none', borderRadius: '8px', color: '#fca5a5', cursor: 'pointer', fontSize: '14px' }}
          >
            <Trash2 style={{ width: 14, height: 14 }} /> Clear Old
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { key: 'critical', label: 'Critical',  color: '#ef4444', bg: '#450a0a' },
          { key: 'error',    label: 'Errors',    color: '#f97316', bg: '#431407' },
          { key: 'warn',     label: 'Warnings',  color: '#eab308', bg: '#422006' },
        ].map(({ key, label, color, bg }) => (
          <div
            key={key}
            onClick={() => { setSeverity(severity === key ? '' : key); setPage(1); }}
            style={{ background: bg, border: `1px solid ${color}44`, borderRadius: '12px', padding: '16px', cursor: 'pointer', opacity: severity && severity !== key ? 0.5 : 1 }}
          >
            <div style={{ fontSize: '28px', fontWeight: 800, color }}>{summary[key as keyof Summary]}</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Filter style={{ width: 16, height: 16, color: '#64748b' }} />
        {['', 'critical', 'error', 'warn'].map(s => (
          <button
            key={s}
            onClick={() => { setSeverity(s); setPage(1); }}
            style={{
              padding: '4px 12px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
              background: severity === s ? '#3b82f6' : '#1e293b',
              color: severity === s ? '#fff' : '#94a3b8',
              border: 'none',
            }}
          >
            {s || 'All'}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>{total} total</span>
      </div>

      {/* Log list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading...</div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <AlertCircle style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.3 }} />
          <p>No errors logged yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {logs.map(log => (
            <div key={log.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', overflow: 'hidden' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === log.id ? null : log.id)}
              >
                {/* Severity badge */}
                <span style={{
                  padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                  background: log.severity === 'critical' ? '#7f1d1d' : log.severity === 'error' ? '#431407' : '#422006',
                  color: log.severity === 'critical' ? '#fca5a5' : log.severity === 'error' ? '#fb923c' : '#fde047',
                  flexShrink: 0,
                }}>
                  {log.severity}
                </span>

                {/* Route */}
                <code style={{ fontSize: '12px', color: '#818cf8', background: '#312e81', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                  {log.method} {log.route}
                </code>

                {/* Message */}
                <span style={{ fontSize: '13px', color: '#e2e8f0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.message}
                </span>

                {/* Time */}
                <span style={{ fontSize: '12px', color: '#64748b', flexShrink: 0 }}>
                  {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </span>

                {/* Delete */}
                <button
                  onClick={e => { e.stopPropagation(); deleteOne(log.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', flexShrink: 0 }}
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </div>

              {/* Expanded stack trace */}
              {expanded === log.id && (
                <div style={{ borderTop: '1px solid #334155', padding: '16px', background: '#0f172a' }}>
                  {log.userId && (
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 8px' }}>
                      User ID: <code style={{ color: '#a78bfa' }}>{log.userId}</code>
                    </p>
                  )}
                  {log.meta && Object.keys(log.meta).length > 0 && (
                    <pre style={{ fontSize: '12px', color: '#7dd3fc', background: '#1e293b', padding: '10px', borderRadius: '6px', overflow: 'auto', margin: '0 0 12px' }}>
                      {JSON.stringify(log.meta, null, 2)}
                    </pre>
                  )}
                  {log.stack ? (
                    <pre style={{ fontSize: '11px', color: '#94a3b8', background: '#1e293b', padding: '10px', borderRadius: '6px', overflow: 'auto', margin: 0, lineHeight: 1.6 }}>
                      {log.stack}
                    </pre>
                  ) : (
                    <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>No stack trace available.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > LIMIT && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: '8px 20px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}
          >
            Previous
          </button>
          <span style={{ lineHeight: '36px', fontSize: '14px', color: '#94a3b8' }}>
            Page {page} of {Math.ceil(total / LIMIT)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / LIMIT)}
            style={{ padding: '8px 20px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', cursor: 'pointer', opacity: page >= Math.ceil(total / LIMIT) ? 0.4 : 1 }}
          >
            Next
          </button>
        </div>
      )}

      {/* n8n tip */}
      <div style={{ marginTop: '32px', background: '#172554', border: '1px solid #1d4ed8', borderRadius: '12px', padding: '16px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#93c5fd' }}>
          <strong>n8n Alert Setup:</strong> Set <code style={{ background: '#1e3a8a', padding: '2px 6px', borderRadius: '4px' }}>N8N_ERROR_WEBHOOK_URL</code> in Vercel
          to receive instant Telegram/WhatsApp/Email alerts on <em>critical</em> errors.
          n8n Webhook → Filter (severity=critical) → Telegram/Slack.
        </p>
      </div>
    </div>
  );
}
