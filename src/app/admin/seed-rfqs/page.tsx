'use client';

import { useState, useEffect } from 'react';
import { Database, Trash2, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

interface Counts { seeded: number; real: number; availableToSeed: number }

export default function SeedRFQsPage() {
  const [counts,  setCounts]  = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy,    setBusy]    = useState(false);
  const [result,  setResult]  = useState<{ ok: boolean; message: string } | null>(null);

  const fetchCounts = async () => {
    try {
      const res  = await fetch('/api/admin/seed-rfqs', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setCounts({ seeded: data.seeded, real: data.real, availableToSeed: data.availableToSeed });
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCounts(); }, []);

  const handleAction = async (action: 'seed_all' | 'clear_all') => {
    if (action === 'clear_all' && !confirm('Delete ALL seeded RFQs? This cannot be undone.')) return;
    setBusy(true);
    setResult(null);
    try {
      const res  = await fetch('/api/admin/seed-rfqs', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'seed_all') {
          setResult({ ok: true, message: `✓ Created ${data.created} RFQs across all 50 categories + subcategories. Total seeded: ${data.seeded}.` });
        } else {
          setResult({ ok: true, message: `✓ Cleared ${data.cleared} seeded RFQs. Marketplace reset.` });
        }
        await fetchCounts();
      } else {
        setResult({ ok: false, message: data.error || 'Action failed' });
      }
    } catch {
      setResult({ ok: false, message: 'Network error — try again' });
    } finally {
      setBusy(false);
    }
  };

  const available = counts?.availableToSeed ?? 325;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" /> RFQ Seeding Tool
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Populate all 50 categories + subcategories (~450 slots) so every supplier sees active listings immediately.
          Seeded RFQs are excluded from email notifications.
        </p>
      </div>

      {/* Current counts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-indigo-400">{loading ? '…' : (counts?.seeded ?? 0)}</p>
          <p className="text-slate-400 text-sm mt-1">Seeded RFQs</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-green-400">{loading ? '…' : (counts?.real ?? 0)}</p>
          <p className="text-slate-400 text-sm mt-1">Real RFQs</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-amber-400">{loading ? '…' : available}</p>
          <p className="text-slate-400 text-sm mt-1">Available to Seed</p>
        </div>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${
          result.ok
            ? 'bg-green-900/20 border-green-700/40 text-green-300'
            : 'bg-red-900/20 border-red-700/40 text-red-300'
        }`}>
          {result.ok
            ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            : <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          <p className="text-sm">{result.message}</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => handleAction('seed_all')}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors min-h-[44px]"
        >
          <Zap className="w-5 h-5" />
          {busy ? 'Seeding… (may take 5–10s)' : `Seed ~${available} RFQs — All 50 Categories + Subcategories`}
        </button>

        <button
          onClick={() => handleAction('clear_all')}
          disabled={busy || (counts?.seeded ?? 0) === 0}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-900/30 hover:bg-red-900/50 disabled:opacity-40 text-red-400 font-semibold rounded-xl border border-red-800/50 transition-colors min-h-[44px]"
        >
          <Trash2 className="w-5 h-5" />
          Clear All Seeded RFQs ({counts?.seeded ?? 0})
        </button>
      </div>

      {/* Coverage breakdown */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5 text-sm text-slate-400 space-y-3">
        <p className="text-slate-300 font-medium">Coverage breakdown</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
          <span>50 parent categories × 1 RFQ</span><span className="text-slate-300">= 50</span>
          <span>~275 subcategories × 1 RFQ</span><span className="text-slate-300">≈ 275</span>
          <span className="text-white font-semibold">Total</span><span className="text-indigo-400 font-bold">≈ 325</span>
        </div>
        <ul className="space-y-1.5 list-disc list-inside mt-2">
          <li>All seeded RFQs marked <code className="text-indigo-300 text-xs">isSeeded: true</code> — no email noise</li>
          <li>Random cities from 65 Indian cities, realistic budgets (₹10K–₹20L)</li>
          <li>Expires in 30 days — re-seed when needed</li>
          <li>Safe to clear and re-seed anytime</li>
        </ul>
      </div>
    </div>
  );
}
