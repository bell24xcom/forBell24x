'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CockpitShell,
  CockpitPanel,
  CockpitSectionLabel,
  CockpitFallback,
  CockpitError,
} from '@/src/components/admin/cockpit/CockpitShell';

interface Alert {
  type: string;
  message: string;
  timestamp: string;
}

export default function NotificationCenterPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activity, setActivity] = useState<Array<{ type: string; label: string; time: string }>>([]);
  const [systemHealth, setSystemHealth] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [monRes, statsRes] = await Promise.all([
        fetch('/api/admin/monitoring', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/admin/stats?range=1d', { credentials: 'include' }).then((r) => r.json()),
      ]);

      if (!monRes.success) throw new Error(monRes.error || 'Monitoring failed');
      setAlerts(monRes.alerts ?? []);
      setSystemHealth(monRes.systemHealth ?? null);

      if (statsRes.success && statsRes.stats?.activity) {
        setActivity(statsRes.stats.activity);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const alertColor = (type: string) =>
    type === 'warning' ? 'border-amber-700/50 bg-amber-900/20 text-amber-300' : 'border-blue-700/50 bg-blue-900/20 text-blue-300';

  return (
    <CockpitShell
      title="Notification Center"
      subtitle="Platform alerts, unread notification load, and recent activity"
      onRefresh={load}
      loading={loading}
    >
      {error && <CockpitError message={error} onRetry={load} />}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-500 text-xs">System health</p>
          <p className="text-2xl font-bold text-white mt-1">{systemHealth != null ? `${systemHealth}%` : '—'}</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-500 text-xs">Active alerts</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{alerts.length}</p>
        </div>
      </div>

      <CockpitPanel>
        <CockpitSectionLabel>System alerts</CockpitSectionLabel>
        {alerts.length === 0 ? (
          <CockpitFallback message="No active system alerts" />
        ) : (
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <div key={i} className={`border rounded-lg px-3 py-2 text-sm ${alertColor(a.type)}`}>
                <p>{a.message}</p>
                <p className="text-xs opacity-70 mt-1">{new Date(a.timestamp).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        )}
      </CockpitPanel>

      <CockpitPanel>
        <CockpitSectionLabel>Recent platform activity (24h)</CockpitSectionLabel>
        {activity.length === 0 ? (
          <CockpitFallback message="No activity in last 24h" />
        ) : (
          <div className="space-y-2">
            {activity.map((a, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-slate-700/30 last:border-0">
                <span className="text-slate-300">{a.label}</span>
                <span className="text-slate-500 text-xs">{a.time}</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-slate-600 text-xs mt-3">
          Per-user notification inbox: users see their own feed at{' '}
          <Link href="/notifications" className="text-indigo-400 hover:underline">/notifications</Link>.
          Admin-wide notification API is not yet exposed.
        </p>
      </CockpitPanel>
    </CockpitShell>
  );
}
