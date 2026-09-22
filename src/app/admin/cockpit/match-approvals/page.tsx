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
import { Video, Download } from 'lucide-react';
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

interface CertificationRecord {
  rfqId: string;
  rfqTitle: string;
  category: string;
  location: string | null;
  videoUrl: string | null;
  stage: 'PENDING_APPROVAL' | 'REJECTED' | 'APPROVED' | 'NOTIFICATION_SENT' | 'QUOTE_RECEIVED' | 'CERTIFIED';
  matchApprovalId: string | null;
  matchApprovalStatus: string | null;
  isCertificationTest: boolean;
  sendCount: number;
  deliveredOrReadCount: number;
  failedCount: number;
  quoteCount: number;
  lastEventAt: string;
}

const STATUS_TABS = ['PENDING_FOUNDER_APPROVAL', 'APPROVED', 'REJECTED', 'ALL'] as const;
const MAIN_TABS = ['Approval Queue', 'Marketplace Certification'] as const;

const STAGE_COLOR: Record<CertificationRecord['stage'], string> = {
  PENDING_APPROVAL: 'border-amber-700/50 bg-amber-900/20 text-amber-300',
  REJECTED: 'border-red-700/50 bg-red-900/20 text-red-300',
  APPROVED: 'border-blue-700/50 bg-blue-900/20 text-blue-300',
  NOTIFICATION_SENT: 'border-indigo-700/50 bg-indigo-900/20 text-indigo-300',
  QUOTE_RECEIVED: 'border-cyan-700/50 bg-cyan-900/20 text-cyan-300',
  CERTIFIED: 'border-emerald-700/50 bg-emerald-900/20 text-emerald-300',
};

export default function MatchApprovalsPage() {
  const [mainTab, setMainTab] = useState<(typeof MAIN_TABS)[number]>('Approval Queue');
  const [certifications, setCertifications] = useState<CertificationRecord[]>([]);
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState('');
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

  const loadCertifications = useCallback(async () => {
    setCertLoading(true);
    setCertError('');
    try {
      const res = await fetch('/api/admin/match-approvals?view=certifications', { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load certifications');
      setCertifications(data.certifications ?? []);
    } catch (e) {
      setCertError(e instanceof Error ? e.message : 'Failed to load certifications');
    } finally {
      setCertLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mainTab === 'Marketplace Certification') loadCertifications();
  }, [mainTab, loadCertifications]);

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

      <div className="flex gap-2 flex-wrap border-b border-slate-700/50 pb-3">
        {MAIN_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setMainTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mainTab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {mainTab === 'Approval Queue' ? (
      <>
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
      </>
      ) : (
        <CockpitPanel>
          <CockpitSectionLabel>Marketplace Certification — RFQ → Match → Approval → WhatsApp → Quote</CockpitSectionLabel>
          {certError && <CockpitError message={certError} onRetry={loadCertifications} />}
          {certLoading ? (
            <CockpitFallback message="Loading…" />
          ) : certifications.length === 0 ? (
            <CockpitFallback message="No RFQ has entered the observable pipeline yet (no MatchApproval or WhatsApp send recorded)." />
          ) : (
            <div className="space-y-3">
              {certifications.map((c) => (
                <div key={c.rfqId} className="border border-slate-700/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-white font-medium text-sm">
                        {c.rfqTitle}
                        {c.isCertificationTest && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-700/50">
                            certification test
                          </span>
                        )}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {c.category}{c.location ? ` · ${c.location}` : ''} · {new Date(c.lastEventAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[11px] font-semibold border ${STAGE_COLOR[c.stage]}`}>
                      {c.stage.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <span>WhatsApp sent: <span className="text-slate-200">{c.sendCount}</span></span>
                    <span>Delivered/Read: <span className="text-emerald-300">{c.deliveredOrReadCount}</span></span>
                    <span>Failed: <span className="text-red-300">{c.failedCount}</span></span>
                    <span>Quotes: <span className="text-cyan-300">{c.quoteCount}</span></span>
                  </div>

                  {c.videoUrl && (
                    <div className="pt-2 space-y-2">
                      <p className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-purple-400" /> Submitted video
                      </p>
                      <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-w-sm">
                        <video src={c.videoUrl} controls className="w-full h-full object-contain" />
                      </div>
                      <a
                        href={c.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        <Download className="w-3.5 h-3.5" /> Download / open original
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CockpitPanel>
      )}
    </CockpitShell>
  );
}
