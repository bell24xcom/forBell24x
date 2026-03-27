'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Zap, AlertCircle } from 'lucide-react';

interface FeatureFlag {
  id:          string;
  key:         string;
  label:       string;
  description: string | null;
  enabled:     boolean;
  updatedAt:   string;
}

export default function FeatureFlagsPage() {
  const [flags,   setFlags]   = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [saving,  setSaving]  = useState<string | null>(null);
  const [saved,   setSaved]   = useState<string | null>(null);

  async function fetchFlags() {
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/admin/feature-flags');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      setFlags(json.flags);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchFlags(); }, []);

  async function toggle(flag: FeatureFlag) {
    setSaving(flag.id);
    try {
      const res  = await fetch('/api/admin/feature-flags', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id: flag.id, enabled: !flag.enabled }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to save');
      setFlags(prev => prev.map(f => f.id === flag.id ? { ...f, enabled: !f.enabled, updatedAt: new Date().toISOString() } : f));
      setSaved(flag.id);
      setTimeout(() => setSaved(null), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to toggle');
    } finally {
      setSaving(null);
    }
  }

  const enabled  = flags.filter(f => f.enabled).length;
  const disabled = flags.filter(f => !f.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Feature Flags</h1>
          <p className="text-slate-400 text-sm">
            Toggle platform features live without redeploying.
            {flags.length > 0 && <span className="ml-2 text-slate-500">{enabled} on · {disabled} off</span>}
          </p>
        </div>
        <button onClick={fetchFlags} disabled={loading}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {loading && (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && flags.length === 0 && !error && (
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-10 text-center">
          <Zap className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">No feature flags found</p>
          <p className="text-slate-500 text-xs mt-1">
            Add flags to the <code className="bg-slate-700 px-1 rounded">feature_flags</code> table in the database.
          </p>
        </div>
      )}

      {flags.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl divide-y divide-slate-700/40">
          {flags.map(flag => (
            <div key={flag.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium text-sm">{flag.label}</p>
                  <code className="text-slate-500 text-xs bg-slate-700/60 px-1.5 py-0.5 rounded font-mono">{flag.key}</code>
                </div>
                {flag.description && (
                  <p className="text-slate-400 text-xs mt-0.5">{flag.description}</p>
                )}
                <p className="text-slate-600 text-xs mt-1">
                  Updated {new Date(flag.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Toggle */}
              <div className="shrink-0 flex items-center gap-3">
                {saved === flag.id && (
                  <span className="text-green-400 text-xs font-medium">Saved</span>
                )}
                <button
                  onClick={() => toggle(flag)}
                  disabled={saving === flag.id}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    flag.enabled ? 'bg-indigo-600' : 'bg-slate-600'
                  } ${saving === flag.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-label={flag.enabled ? 'Disable' : 'Enable'}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    flag.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className={`text-xs font-semibold w-12 ${flag.enabled ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {saving === flag.id ? '...' : flag.enabled ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Note:</strong> Feature flags are stored in the <code className="bg-slate-700 px-1 rounded">feature_flags</code> table.
        Changes take effect immediately — no redeploy needed. Cron jobs and server-side logic must check flags via Prisma.
      </div>
    </div>
  );
}
