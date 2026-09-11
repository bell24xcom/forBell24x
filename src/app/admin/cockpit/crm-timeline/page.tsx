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

interface TimelineItem {
  id: string;
  source: string;
  label: string;
  time: string;
  href?: string;
}

const ICONS: Record<string, string> = {
  user: '🟢',
  rfq: '📋',
  quote: '💬',
  lead: '🎯',
  outreach: '📢',
  alert: '⚠️',
};

export default function CrmTimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, outreachRes, monitoringRes, leadsRes] = await Promise.all([
        fetch('/api/admin/stats?range=7d', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/admin/outreach-stats?days=7', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/admin/monitoring', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/admin/leads?limit=15', { credentials: 'include' }).then((r) => r.json()),
      ]);

      const merged: TimelineItem[] = [];

      if (statsRes.success && statsRes.stats?.activity) {
        for (const a of statsRes.stats.activity) {
          merged.push({
            id: `stats-${a.label}-${a.time}`,
            source: 'Platform activity',
            label: a.label,
            time: a.time,
            href: '/admin',
          });
        }
      }

      if (outreachRes.success && outreachRes.recentEvents) {
        for (const e of outreachRes.recentEvents) {
          merged.push({
            id: `outreach-${e.createdAt}-${e.actionType}`,
            source: 'Outreach',
            label: e.actionType.replace(/_/g, ' '),
            time: new Date(e.createdAt).toLocaleString('en-IN'),
            href: '/admin/outreach',
          });
        }
      }

      if (monitoringRes.success) {
        for (const a of monitoringRes.alerts ?? []) {
          merged.push({
            id: `alert-${a.timestamp}`,
            source: 'System alert',
            label: a.message,
            time: new Date(a.timestamp).toLocaleString('en-IN'),
            href: '/admin/cockpit/system-health',
          });
        }
        for (const r of monitoringRes.recentActivity?.rfqs ?? []) {
          merged.push({
            id: `mrfq-${r.id}`,
            source: 'RFQ',
            label: `${r.title} (${r.status}) · ${r.buyer}`,
            time: `${r.minutesAgo}m ago`,
            href: '/admin/rfqs',
          });
        }
        for (const q of monitoringRes.recentActivity?.quotes ?? []) {
          merged.push({
            id: `mquote-${q.id}`,
            source: 'Quote',
            label: `₹${q.price.toLocaleString('en-IN')} on "${q.rfqTitle}" · ${q.supplier}`,
            time: `${q.minutesAgo}m ago`,
            href: '/admin/rfqs',
          });
        }
      }

      if (leadsRes.success && leadsRes.leads) {
        for (const l of leadsRes.leads) {
          merged.push({
            id: `lead-${l.id}`,
            source: 'Lead',
            label: `${l.company || l.name || 'Lead'} · ${l.status}`,
            time: new Date(l.createdAt).toLocaleString('en-IN'),
            href: '/admin/leads',
          });
        }
      }

      setItems(merged.slice(0, 40));
    } catch {
      setError('Failed to load CRM timeline');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <CockpitShell
      title="CRM Timeline"
      subtitle="Cross-platform activity — users, RFQs, quotes, leads, outreach"
      onRefresh={load}
      loading={loading}
    >
      <div className="flex flex-wrap gap-3 text-xs">
        <Link href="/admin/crm" className="text-indigo-400 hover:underline">CRM / Users →</Link>
        <Link href="/admin/leads" className="text-indigo-400 hover:underline">Leads →</Link>
      </div>

      {error && <CockpitError message={error} onRetry={load} />}

      <CockpitPanel>
        <CockpitSectionLabel>Unified timeline (last 7 days)</CockpitSectionLabel>
        {loading && !items.length ? (
          <div className="py-12 flex justify-center">
            <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <CockpitFallback message="No timeline events in the selected window" />
        ) : (
          <div className="space-y-2 max-h-[32rem] overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 py-2 border-b border-slate-700/30 last:border-0 text-sm"
              >
                <span className="text-base">{ICONS[item.source.split(' ')[0].toLowerCase()] || '•'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-500 text-[10px] uppercase">{item.source}</p>
                  {item.href ? (
                    <Link href={item.href} className="text-slate-200 hover:text-indigo-400 truncate block">
                      {item.label}
                    </Link>
                  ) : (
                    <p className="text-slate-200 truncate">{item.label}</p>
                  )}
                </div>
                <span className="text-slate-500 text-xs whitespace-nowrap shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        )}
      </CockpitPanel>
    </CockpitShell>
  );
}
