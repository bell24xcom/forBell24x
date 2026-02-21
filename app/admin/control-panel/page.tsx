'use client';

import { useState, useEffect, useCallback } from 'react';

interface PlanFeature {
  label: string; monthlyPriceINR: number;
  maxRFQsPerMonth: number; maxQuotesPerRFQ: number;
  canUseEscrow: boolean; canUseAIMatching: boolean;
  contactUnlocksPerMonth: number; prioritySupport: boolean;
  analyticsAccess: boolean; apiAccess: boolean;
}
interface ControlData {
  plans: Record<string, PlanFeature>;
  planStats: Record<string, { count: number; avgTrustScore: number }>;
  kyc: { gstProvided: number; udyamProvided: number; bothProvided: number; verified: number };
  trustDistribution: Record<string, number>;
  validators: { gstExample: string; udyamExample: string; gstPattern: string; udyamPattern: string };
}

const fmt = (v: number) => v === -1 ? '∞' : v.toLocaleString('en-IN');

const FEATURE_ROWS: { key: keyof PlanFeature; label: string }[] = [
  { key: 'monthlyPriceINR',        label: 'Price (₹/month)'        },
  { key: 'maxRFQsPerMonth',        label: 'RFQs per month'         },
  { key: 'maxQuotesPerRFQ',        label: 'Quotes per RFQ'         },
  { key: 'canUseEscrow',           label: 'Escrow payments'         },
  { key: 'canUseAIMatching',       label: 'AI supplier matching'   },
  { key: 'contactUnlocksPerMonth', label: 'Contact unlocks/month'  },
  { key: 'prioritySupport',        label: 'Priority support'        },
  { key: 'analyticsAccess',        label: 'Analytics access'        },
  { key: 'apiAccess',              label: 'API access'              },
];

function renderValue(v: number | boolean): React.ReactNode {
  if (typeof v === 'boolean') {
    return v
      ? <span className="text-green-400 font-semibold">✓ Yes</span>
      : <span className="text-slate-600">✗ No</span>;
  }
  if (v === 0) return <span className="text-slate-600">0</span>;
  return <span className="text-white font-semibold">{fmt(v)}</span>;
}

function TrustBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-14 text-slate-400 text-xs text-right shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-white text-right text-xs">{value}</span>
    </div>
  );
}

export default function ControlPanelPage() {
  const [data,    setData]    = useState<ControlData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Quick plan assignment
  const [assignPhone, setAssignPhone] = useState('');
  const [assignPlan,  setAssignPlan]  = useState('PRO');
  const [assigning,   setAssigning]   = useState(false);
  const [assignMsg,   setAssignMsg]   = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/admin/control-panel');
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.message || 'Failed to load');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssigning(true); setAssignMsg('');
    try {
      // Find user by phone first
      const searchRes  = await fetch(`/api/admin/crm?search=${assignPhone}&limit=1`);
      const searchData = await searchRes.json();
      const user = searchData.users?.[0];

      if (!user) { setAssignMsg('❌ No user found with that phone or email'); setAssigning(false); return; }

      const res  = await fetch('/api/admin/crm', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: user.id, action: 'setPlan', value: assignPlan }),
      });
      const json = await res.json();
      setAssignMsg(json.success
        ? `✓ ${user.name || user.phone} upgraded to ${assignPlan}`
        : `❌ ${json.message}`
      );
      if (json.success) fetchData(); // refresh stats
    } catch { setAssignMsg('❌ Network error'); }
    finally { setAssigning(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-red-900/30 border border-red-500/40 text-red-300 p-6 rounded-xl">
      {error} — <button onClick={fetchData} className="underline">Retry</button>
    </div>
  );

  if (!data) return null;

  const planNames = ['FREE', 'PRO', 'ENTERPRISE'];
  const maxTrust = Math.max(...Object.values(data.trustDistribution));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Control Panel</h1>
        <p className="text-slate-400 text-sm">Plan features, KYC stats, and trust distribution</p>
      </div>

      {/* Plan Feature Matrix */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="text-white font-semibold">Subscription Plans</h2>
          <p className="text-slate-400 text-xs mt-0.5">Feature comparison across all plans</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-52">Feature</th>
                {planNames.map(p => {
                  const stat = data.planStats[p] ?? { count: 0, avgTrustScore: 0 };
                  return (
                    <th key={p} className="px-5 py-3 text-center">
                      <div className={`text-sm font-bold ${p === 'ENTERPRISE' ? 'text-amber-400' : p === 'PRO' ? 'text-indigo-400' : 'text-slate-400'}`}>{p}</div>
                      <div className="text-slate-500 text-xs">{stat.count} users · avg trust {stat.avgTrustScore}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {FEATURE_ROWS.map(row => (
                <tr key={row.key} className="hover:bg-slate-700/20">
                  <td className="px-5 py-3 text-slate-300">{row.label}</td>
                  {planNames.map(p => (
                    <td key={p} className="px-5 py-3 text-center">
                      {renderValue(data.plans[p][row.key] as number | boolean)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Assign + KYC + Trust side by side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Quick plan assignment */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-1">Quick Plan Assignment</h2>
          <p className="text-slate-400 text-xs mb-4">Search by phone or email, assign plan instantly</p>
          <form onSubmit={handleAssign} className="space-y-3">
            <input
              type="text" required placeholder="Phone or email"
              value={assignPhone} onChange={e => setAssignPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select value={assignPlan} onChange={e => setAssignPlan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none">
              <option value="FREE">FREE</option>
              <option value="PRO">PRO — ₹2,999/mo</option>
              <option value="ENTERPRISE">ENTERPRISE — ₹9,999/mo</option>
            </select>
            <button type="submit" disabled={assigning}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
              {assigning ? 'Assigning…' : 'Assign Plan'}
            </button>
            {assignMsg && (
              <p className={`text-xs ${assignMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                {assignMsg}
              </p>
            )}
          </form>
        </div>

        {/* KYC Stats */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4">KYC Completion</h2>
          <div className="space-y-3 text-sm">
            {[
              { label: 'GST provided',     value: data.kyc.gstProvided   },
              { label: 'Udyam provided',   value: data.kyc.udyamProvided },
              { label: 'Both GST + Udyam', value: data.kyc.bothProvided  },
              { label: 'KYC verified',     value: data.kyc.verified      },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-slate-400">{row.label}</span>
                <span className="text-white font-semibold">{row.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 space-y-1">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Format validators</p>
            <p className="text-slate-400 text-xs">GST: <code className="text-indigo-300">{data.validators.gstExample}</code></p>
            <p className="text-slate-400 text-xs">Udyam: <code className="text-indigo-300">{data.validators.udyamExample}</code></p>
          </div>
        </div>

        {/* Trust Score Distribution */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Trust Score Distribution</h2>
          <div className="space-y-3">
            {Object.entries(data.trustDistribution).map(([range, count]) => (
              <TrustBar key={range} label={range} value={count} max={maxTrust || 1} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 space-y-1 text-xs text-slate-500">
            <p>Score 0–30: Phone only (base)</p>
            <p>Score 31–60: +name, company, location</p>
            <p>Score 61–80: +GST <strong>or</strong> Udyam</p>
            <p>Score 81–100: +GST <strong>and</strong> Udyam</p>
          </div>
        </div>
      </div>

      {/* Warning box */}
      <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4">
        <p className="text-amber-300 text-sm font-semibold mb-1">GST/Udyam self-reported — Phase 1</p>
        <p className="text-amber-400/80 text-xs leading-relaxed">
          Currently GST and Udyam numbers are self-entered by suppliers. Format validation is applied (regex).
          In Phase 2, integrate with the official GST verification API and MSME Udyam portal API for
          cryptographic verification. Until then, treat trust scores as signal, not proof.
        </p>
      </div>
    </div>
  );
}
