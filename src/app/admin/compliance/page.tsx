'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, Users, MessageSquare, Eye } from 'lucide-react';

interface Counts {
  consentEvents: number;
  erasureRequests: number;
  pendingErasure: number;
  outreachConsent: number;
  dataAccessLogs: number;
}

export default function ComplianceDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/compliance/consent-events?limit=1'),
      fetch('/api/admin/compliance/erasure-requests?limit=1'),
      fetch('/api/admin/compliance/erasure-requests?status=RECEIVED&limit=1'),
      fetch('/api/admin/compliance/outreach-consent?limit=1'),
      fetch('/api/admin/compliance/data-access?limit=1'),
    ])
      .then(rs => Promise.all(rs.map(r => r.json())))
      .then(([c, e, pe, o, d]) => setCounts({
        consentEvents:   c.total  ?? 0,
        erasureRequests: e.total  ?? 0,
        pendingErasure:  pe.total ?? 0,
        outreachConsent: o.total  ?? 0,
        dataAccessLogs:  d.total  ?? 0,
      }))
      .catch(() => {});
  }, []);

  const cards = [
    {
      href:  '/admin/compliance/consent-events',
      icon:  <ShieldCheck className="w-6 h-6 text-indigo-400" />,
      label: 'Consent Events',
      count: counts?.consentEvents,
      desc:  'All consent grants and withdrawals',
    },
    {
      href:  '/admin/compliance/erasure-requests',
      icon:  <FileText className="w-6 h-6 text-red-400" />,
      label: 'Erasure Requests',
      count: counts?.erasureRequests,
      badge: counts?.pendingErasure ? `${counts.pendingErasure} pending` : undefined,
      desc:  'DPDP right-to-erasure requests',
    },
    {
      href:  '/admin/compliance/outreach-consent',
      icon:  <MessageSquare className="w-6 h-6 text-green-400" />,
      label: 'Outreach Consent',
      count: counts?.outreachConsent,
      desc:  'WhatsApp/email opt-in and opt-out log',
    },
    {
      href:  '/admin/compliance/data-access',
      icon:  <Eye className="w-6 h-6 text-amber-400" />,
      label: 'Data Access Log',
      count: counts?.dataAccessLogs,
      desc:  'Admin view / export / delete audit trail',
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-7 h-7 text-indigo-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Compliance Centre</h1>
          <p className="text-slate-400 text-sm">DPDP Act 2023 — logs retained ≥ 1 year, no auto-purge</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(c => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/50 rounded-xl p-5 transition-colors group"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {c.icon}
                  <span className="text-white font-semibold">{c.label}</span>
                  {c.badge && (
                    <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">{c.badge}</span>
                  )}
                </div>
                <p className="text-slate-400 text-sm">{c.desc}</p>
              </div>
              <div className="text-2xl font-bold text-slate-300 flex-shrink-0">
                {counts ? (c.count ?? 0) : '—'}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-amber-900/20 border border-amber-700/40 rounded-xl p-4 text-sm text-amber-200">
        <strong className="text-amber-300">Legal note:</strong> All logs in this section are retained for a minimum of 1 year
        with no automated purge, as required for DPDP Act 2023 compliance demonstration.
        Erasure requests must be completed within 30 days of receipt.
      </div>
    </div>
  );
}
