'use client';

/**
 * Marketplace Safety Panel — Founder Approval Queue (Option B).
 *
 * Every RFQ whose supplier matching found fewer than the minimum relevant
 * matches lands here instead of auto-notifying an unrelated pool of real
 * suppliers (see lib/orchestration.ts's MIN_SUPPLIERS_BEFORE_FALLBACK).
 * No supplier is contacted for these RFQs until a founder explicitly
 * selects who to notify below.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  CockpitShell,
  CockpitPanel,
  CockpitSectionLabel,
  CockpitFallback,
  CockpitError,
} from '@/src/components/admin/cockpit/CockpitShell';

interface Candidate {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  location: string | null;
  isVerified: boolean;
  trustScore: number;
  score: number;
}

interface Approval {
  id: string;
  rfqId: string;
  status: 'PENDING_FOUNDER_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  candidatePool: Candidate[];
  selectedSupplierIds: string[];
  isCertificationTest: boolean;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  notificationReleasedAt: string | null;
  expiresAt: string;
  createdAt: string;
  rfq: { id: string; title: string; category: string; location: string | null; createdAt: string };
}

interface Counts {
  pendingApprovalRfqs: number;
  approvedRfqs: number;
  rejectedRfqs: number;
  notificationsReleased: number;
  certificationTests: number;
}

const STATUS_TABS = ['PENDING_FOUNDER_APPROVAL', 'APPROVED', 'REJECTED', 'ALL'] as const;

export default function MatchApprovalsPage() {
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]>('PENDING_FOUNDER_APPROVAL');
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedBySupplier, setSelectedBySupplier] = useState<Record<string, Set<string>>>({});
  const [certTestByApproval, setCertTestByApproval] = useState<Record<string, boolean>>({});
  const [rejectReasonByApproval, setRejectReasonByApproval] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/match-approvals?status=${status}`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load match approvals');
      setApprovals(data.approvals ?? []);
      setCounts(data.counts ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load match approvals');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleSupplier(approvalId: string, supplierId: string) {
    setSelectedBySupplier((prev) => {
      const next = new Set(prev[approvalId] ?? []);
      if (next.has(supplierId)) next.delete(supplierId);
      else next.add(supplierId);
      return { ...prev, [approvalId]: next };
    });
  }

  async function approve(approval: Approval) {
    const selected = Array.from(selectedBySupplier[approval.id] ?? []);
    if (selected.length === 0) {
      setError('Select at least one supplier before approving.');
      return;
    }
    setBusyId(approval.id);
    setError('');
    try {
      const res = await fetch('/api/admin/match-approvals', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          id: approval.id,
          selectedSupplierIds: selected,
          isCertificationTest: !!certTestByApproval[approval.id],
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Approve failed');
      await load();
      setExpandedId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approve failed');
    } finally {
      setBusyId(null);
    }
  }

  async function reject(approval: Approval) {
    setBusyId(approval.id);
    setError('');
    try {
      const res = await fetch('/api/admin/match-approvals', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          id: approval.id,
          rejectionReason: rejectReasonByApproval[approval.id] || null,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Reject failed');
      await load();
      setExpandedId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reject failed');
    } finally {
      setBusyId(null);
    }
  }

  const statusColor = (s: Approval['status']) =>
    s === 'PENDING_FOUNDER_APPROVAL'
      ? 'border-amber-700/50 bg-amber-900/20 text-amber-300'
      : s === 'APPROVED'
      ? 'border-emerald-700/50 bg-emerald-900/20 text-emerald-300'
      : s === 'REJECTED'
      ? 'border-red-700/50 bg-red-900/20 text-red-300'
      : 'border-slate-700/50 bg-slate-800/40 text-slate-400';

  return (
    <CockpitShell
      title="Marketplace Safety — Founder Approval Queue"
      subtitle="RFQs with too few relevant supplier matches wait here — no supplier is contacted until you approve."
      onRefresh={load}
      loading={loading}
    >
      {error && <CockpitError message={error} onRetry={load} />}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          ['Pending approval', counts?.pendingApprovalRfqs, 'text-amber-300'],
          ['Approved', counts?.approvedRfqs, 'text-emerald-300'],
          ['Rejected', counts?.rejectedRfqs, 'text-red-300'],
          ['Notifications released', counts?.notificationsReleased, 'text-blue-300'],
          ['Certification tests', counts?.certificationTests, 'text-purple-300'],
        ].map(([label, value, color]) => (
          <div key={label as string} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <p className="text-slate-500 text-xs">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value ?? '—'}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setStatus(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              status === t
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white'
            }`}
          >
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <CockpitPanel>
        <CockpitSectionLabel>Match approvals</CockpitSectionLabel>
        {approvals.length === 0 ? (
          <CockpitFallback message="Nothing here right now." />
        ) : (
          <div className="space-y-3">
            {approvals.map((a) => {
              const isExpanded = expandedId === a.id;
              const selected = selectedBySupplier[a.id] ?? new Set<string>();
              return (
                <div key={a.id} className="border border-slate-700/50 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : a.id)}
                    className="w-full text-left p-4 bg-slate-800/40 hover:bg-slate-800/70 transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-white font-medium text-sm">{a.rfq.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {a.rfq.category}{a.rfq.location ? ` · ${a.rfq.location}` : ''} · {a.candidatePool.length} candidate{a.candidatePool.length !== 1 ? 's' : ''} · {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[11px] font-semibold border ${statusColor(a.status)}`}>
                      {a.status.replace(/_/g, ' ')}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-slate-900/40 border-t border-slate-700/50 space-y-3">
                      {a.status !== 'PENDING_FOUNDER_APPROVAL' ? (
                        <p className="text-slate-400 text-xs">
                          {a.status === 'APPROVED'
                            ? `Approved — ${a.selectedSupplierIds.length} supplier(s) notified${a.notificationReleasedAt ? ` at ${new Date(a.notificationReleasedAt).toLocaleString()}` : ''}.`
                            : a.status === 'REJECTED'
                            ? `Rejected${a.rejectionReason ? `: ${a.rejectionReason}` : '.'}`
                            : 'Expired — never reviewed in time.'}
                        </p>
                      ) : (
                        <>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-slate-500 text-left">
                                <th className="pb-2 pr-2"></th>
                                <th className="pb-2 pr-2">Supplier</th>
                                <th className="pb-2 pr-2">Score</th>
                                <th className="pb-2 pr-2">Contact</th>
                                <th className="pb-2">Verified</th>
                              </tr>
                            </thead>
                            <tbody>
                              {a.candidatePool
                                .slice()
                                .sort((x, y) => y.score - x.score)
                                .map((c) => (
                                  <tr key={c.id} className="border-t border-slate-800">
                                    <td className="py-2 pr-2">
                                      <input
                                        type="checkbox"
                                        checked={selected.has(c.id)}
                                        onChange={() => toggleSupplier(a.id, c.id)}
                                      />
                                    </td>
                                    <td className="py-2 pr-2 text-white">{c.name || c.company || c.id}</td>
                                    <td className="py-2 pr-2 text-slate-300">{c.score}</td>
                                    <td className="py-2 pr-2 text-slate-400">
                                      {c.phone ? 'phone' : ''}{c.phone && c.email ? ' + ' : ''}{c.email ? 'email' : ''}
                                      {!c.phone && !c.email && '—'}
                                    </td>
                                    <td className="py-2 text-slate-400">{c.isVerified ? 'yes' : 'no'}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>

                          <label className="flex items-center gap-2 text-xs text-slate-400">
                            <input
                              type="checkbox"
                              checked={!!certTestByApproval[a.id]}
                              onChange={(e) =>
                                setCertTestByApproval((prev) => ({ ...prev, [a.id]: e.target.checked }))
                              }
                            />
                            Mark as a certification test (not real marketplace activity)
                          </label>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              type="button"
                              disabled={busyId === a.id}
                              onClick={() => approve(a)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white disabled:opacity-50"
                            >
                              Approve selected ({selected.size})
                            </button>
                            <input
                              type="text"
                              placeholder="Rejection reason (optional)"
                              value={rejectReasonByApproval[a.id] ?? ''}
                              onChange={(e) =>
                                setRejectReasonByApproval((prev) => ({ ...prev, [a.id]: e.target.value }))
                              }
                              className="px-2 py-1.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-white flex-1 min-w-[160px]"
                            />
                            <button
                              type="button"
                              disabled={busyId === a.id}
                              onClick={() => reject(a)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-800 hover:bg-red-700 text-white disabled:opacity-50"
                            >
                              Reject RFQ
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CockpitPanel>
    </CockpitShell>
  );
}
