'use client';

import { useState } from 'react';

const STEPS = [
  // Buyer flow
  { id: 1,  group: 'Buyer Flow',          text: 'Logged out — visit homepage. Voice demo widget works (no login required).' },
  { id: 2,  group: 'Buyer Flow',          text: 'Register as a new buyer account (use a test email or phone).' },
  { id: 3,  group: 'Buyer Flow',          text: 'Post a Text RFQ: "Need 500 units cotton fabric, Mumbai, ₹2L budget".' },
  { id: 4,  group: 'Buyer Flow',          text: 'Confirm RFQ appears on /rfq browse page with correct human-readable slug URL.' },
  { id: 5,  group: 'Buyer Flow',          text: 'Copy the RFQ link — open in incognito — page loads correctly (no 404).' },
  // Supplier flow
  { id: 6,  group: 'Supplier Flow',       text: 'Register as a new supplier account (use a different test email).' },
  { id: 7,  group: 'Supplier Flow',       text: 'Browse /rfq — find the RFQ just posted by the buyer account.' },
  { id: 8,  group: 'Supplier Flow',       text: 'Click "View & Quote →" — RFQ detail page loads without errors.' },
  { id: 9,  group: 'Supplier Flow',       text: 'Click "Submit Your Quote" — fill in: Price ₹1,80,000 | Qty 500 | Timeline 14 days | Description "ISI certified, immediate stock".' },
  { id: 10, group: 'Supplier Flow',       text: 'Submit quote — confirm success message appears.' },
  // Buyer receives quote
  { id: 11, group: 'Buyer Receives Quote', text: 'Log back in as buyer — go to Dashboard → Quotes Inbox.' },
  { id: 12, group: 'Buyer Receives Quote', text: 'Confirm quote appears in inbox with correct price and supplier name.' },
  { id: 13, group: 'Buyer Receives Quote', text: 'Click "Accept Quote" (or equivalent action) — no errors.' },
  { id: 14, group: 'Buyer Receives Quote', text: 'Confirm deal moves to Active Deals for both buyer and supplier accounts.' },
  // Email
  { id: 15, group: 'Email',               text: 'Check test email inbox — confirm quote notification email arrived (not in spam). If in spam → fix DNS records in Email Health page first.' },
];

const GROUP_COLORS: Record<string, string> = {
  'Buyer Flow':          'text-blue-400',
  'Supplier Flow':       'text-purple-400',
  'Buyer Receives Quote': 'text-emerald-400',
  'Email':               'text-orange-400',
};

export default function FlowTestPage() {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (id: number) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const reset  = () => setChecked({});

  const done  = Object.values(checked).filter(Boolean).length;
  const total = STEPS.length;
  const pct   = Math.round((done / total) * 100);

  const groups = [...new Set(STEPS.map(s => s.group))];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">🧪 Launch Readiness — Full Flow Test</h1>
          <p className="text-slate-400 text-sm mt-1">
            Complete all 15 steps before outreach. If any step fails, fix it before sending emails or WhatsApp messages.
          </p>
        </div>
        <button
          onClick={reset}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg shrink-0"
        >
          Reset
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300 text-sm font-medium">Overall progress</span>
          <span className={`text-sm font-bold ${done === total ? 'text-emerald-400' : 'text-white'}`}>
            {done}/{total} steps {done === total ? '— Ready to launch! 🚀' : ''}
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${done === total ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Step groups */}
      {groups.map(group => {
        const groupSteps = STEPS.filter(s => s.group === group);
        const groupDone  = groupSteps.filter(s => checked[s.id]).length;
        return (
          <div key={group} className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className={`text-sm font-semibold ${GROUP_COLORS[group] ?? 'text-white'}`}>{group}</h2>
              <span className="text-slate-500 text-xs">{groupDone}/{groupSteps.length}</span>
            </div>
            <div className="divide-y divide-slate-700/30">
              {groupSteps.map(step => (
                <label
                  key={step.id}
                  className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-slate-700/20 transition-colors"
                >
                  <div className="flex items-center gap-3 shrink-0 mt-0.5">
                    <span className="text-slate-600 text-xs font-mono w-5 text-right">{step.id}</span>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        checked[step.id]
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-slate-600 hover:border-slate-400'
                      }`}
                      onClick={() => toggle(step.id)}
                    >
                      {checked[step.id] && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm leading-relaxed ${checked[step.id] ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                    {step.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}

      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Note:</strong> Checkbox state is not saved — refresh resets the list.
        Run this test on production (bell24h.com), not localhost. Use real email addresses to verify email delivery.
      </div>
    </div>
  );
}
