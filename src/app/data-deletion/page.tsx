'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LEGAL_ENTITY } from '../config/legal';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function DataDeletionPage() {
  const [identifier, setIdentifier] = useState('');
  const [reason, setReason]         = useState('');
  const [consented, setConsented]   = useState(false);
  const [status, setStatus]         = useState<Status>('idle');
  const [errorMsg, setErrorMsg]     = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !consented) return;
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res  = await fetch('/api/compliance/erasure-request', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ requesterIdentifier: identifier.trim(), reason: reason.trim() }),
      });
      const data = await res.json();
      if (data.success) setStatus('success');
      else { setStatus('error'); setErrorMsg(data.error || 'Submission failed.'); }
    } catch {
      setStatus('error');
      setErrorMsg('Network error — please try again or email us directly.');
    }
  };

  const isDraft = process.env.NODE_ENV !== 'production';

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {isDraft && (
        <div className="bg-amber-900/80 border-b border-amber-600/50 px-4 py-2 text-amber-200 text-sm font-medium">
          ⚠ Draft — pending advocate review.
        </div>
      )}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-indigo-400 text-sm font-medium mb-2">{LEGAL_ENTITY.platform} · Your Rights</p>
        <h1 className="text-3xl font-bold text-white mb-3">Data Deletion Request</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Under the <strong className="text-slate-300">Digital Personal Data Protection Act 2023</strong>,
          you have the right to request erasure of your personal data.
          Submit the form below or email{' '}
          <a href={`mailto:${LEGAL_ENTITY.grievanceEmail}`} className="text-indigo-400 hover:underline">
            {LEGAL_ENTITY.grievanceEmail}
          </a>{' '}
          directly. We will respond within 7 business days and complete processing within 30 days.
        </p>

        {/* What gets deleted */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 mb-8 space-y-3">
          <h2 className="text-white font-semibold">What will be deleted</h2>
          <ul className="text-slate-300 text-sm space-y-1.5 list-disc list-inside">
            <li>Your user account and login credentials</li>
            <li>Your business profile and listed contact details</li>
            <li>All Quotation Requirements you posted</li>
            <li>Quotes you submitted as a supplier</li>
            <li>Notification and interaction history</li>
          </ul>
          <h2 className="text-white font-semibold pt-2">What cannot be deleted</h2>
          <ul className="text-slate-300 text-sm space-y-1.5 list-disc list-inside">
            <li>Transaction and payment records required for 7-year GST/tax compliance</li>
            <li>Anonymised, non-re-linkable aggregate statistics</li>
            <li>Compliance logs (consent events, erasure request record itself) — retained for legal audit</li>
          </ul>
          <p className="text-slate-400 text-xs">
            Pre-built supplier profiles sourced from public business data can also be removed.
            Indicate this in the reason field below.{' '}
            <Link href="/data-retention" className="text-indigo-400 hover:underline">Data Retention Policy →</Link>
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-900/30 border border-green-600/40 rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">✓</div>
            <h2 className="text-green-300 font-semibold text-lg mb-2">Request Received</h2>
            <p className="text-slate-300 text-sm">
              We have logged your erasure request. You will receive confirmation at the contact
              you provided within 7 business days.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Registered Mobile or Email *
              </label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="+91 98765 43210 or you@example.com"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
              />
              <p className="text-slate-500 text-xs mt-1">We use this to locate and verify your account.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Reason (optional)</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder="e.g. No longer using the platform / Pre-built profile removal request / Withdrawal of consent"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500 text-sm"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consented}
                onChange={e => setConsented(e.target.checked)}
                required
                className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-300 leading-snug">
                I confirm I am the account holder or authorised representative and I understand that
                deletion is <strong className="text-white">irreversible</strong> and that records
                required for legal compliance will be retained.
              </span>
            </label>

            {status === 'error' && (
              <div className="bg-red-900/30 border border-red-600/40 rounded-xl px-4 py-3 text-red-300 text-sm">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting' || !consented || !identifier.trim()}
              className="w-full bg-red-700 hover:bg-red-600 disabled:bg-red-900 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {status === 'submitting' ? 'Submitting…' : 'Submit Deletion Request'}
            </button>
          </form>
        )}

        <div className="mt-10 pt-8 border-t border-slate-700/50 text-slate-400 text-sm space-y-1">
          <p><strong className="text-slate-300">Grievance Officer:</strong> {LEGAL_ENTITY.proprietor}</p>
          <p><strong className="text-slate-300">Entity:</strong> {LEGAL_ENTITY.name}, GSTIN {LEGAL_ENTITY.gstin}</p>
          <p><strong className="text-slate-300">Address:</strong> {LEGAL_ENTITY.address}</p>
          <p><strong className="text-slate-300">Email:</strong>{' '}
            <a href={`mailto:${LEGAL_ENTITY.grievanceEmail}`} className="text-indigo-400 hover:underline">
              {LEGAL_ENTITY.grievanceEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
