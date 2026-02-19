'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string; name: string | null; email: string | null; phone: string | null;
  company: string | null; role: string; plan: string; isActive: boolean; isVerified: boolean;
  gstNumber: string | null; udyamNumber: string | null; trustScore: number;
  location: string | null; lastLoginAt: string | null; createdAt: string;
  _count: { rfqs: number; quotes: number };
  wallet?: { balance: number } | null;
}

const ROLES  = ['', 'SUPPLIER', 'BUYER', 'ADMIN', 'AGENT'];
const PLANS  = ['', 'FREE', 'PRO', 'ENTERPRISE'];

function TrustBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-400 bg-green-900/30 border-green-700/50'
              : score >= 60 ? 'text-amber-400 bg-amber-900/30 border-amber-700/50'
              : score >= 30 ? 'text-blue-400 bg-blue-900/30 border-blue-700/50'
              :               'text-slate-400 bg-slate-800 border-slate-700';
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      {score}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const color = plan === 'ENTERPRISE' ? 'text-amber-400 bg-amber-900/30 border-amber-700/50'
              : plan === 'PRO'        ? 'text-indigo-400 bg-indigo-900/30 border-indigo-700/50'
              :                        'text-slate-400 bg-slate-800 border-slate-700';
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${color}`}>{plan}</span>;
}

export default function CRMPage() {
  const [users,    setUsers]    = useState<User[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [roleF,    setRoleF]    = useState('');
  const [planF,    setPlanF]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [saving,   setSaving]   = useState<string | null>(null); // userId being updated

  const limit = 25;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (roleF)  params.set('role', roleF);
    if (planF)  params.set('plan', planF);

    try {
      const res  = await fetch(`/api/admin/crm?${params}`);
      const data = await res.json();
      if (data.success) { setUsers(data.users); setTotal(data.pagination.total); }
      else setError(data.message || 'Failed to load users');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleF, planF]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const applyAction = async (userId: string, action: string, value?: string) => {
    setSaving(userId);
    try {
      const res  = await fetch('/api/admin/crm', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId, action, value }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data.user } : u));
      } else {
        alert(data.message || 'Action failed');
      }
    } catch {
      alert('Network error');
    } finally {
      setSaving(null);
    }
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">CRM — User Management</h1>
        <p className="text-slate-400 text-sm">{total.toLocaleString()} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text" placeholder="Search name / phone / email / company…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[220px] px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select value={roleF} onChange={e => { setRoleF(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none">
          {ROLES.map(r => <option key={r} value={r}>{r || 'All roles'}</option>)}
        </select>
        <select value={planF} onChange={e => { setPlanF(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none">
          {PLANS.map(p => <option key={p} value={p}>{p || 'All plans'}</option>)}
        </select>
        <button onClick={fetchUsers} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors">
          Search
        </button>
      </div>

      {/* Error */}
      {error && <div className="bg-red-900/30 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>}

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left">
                {['User', 'Role', 'Plan', 'Trust', 'GST', 'Udyam', 'RFQs', 'Wallet', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-slate-500">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className={`hover:bg-slate-700/30 transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{u.name || '—'}</div>
                    <div className="text-slate-400 text-xs">{u.phone || u.email || '—'}</div>
                    {u.company && <div className="text-slate-500 text-xs">{u.company}</div>}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <select
                      defaultValue={u.role}
                      disabled={saving === u.id}
                      onChange={e => applyAction(u.id, 'setRole', e.target.value)}
                      className="bg-slate-700 text-slate-200 text-xs rounded px-1.5 py-1 border border-slate-600 focus:outline-none cursor-pointer"
                    >
                      {['SUPPLIER', 'BUYER', 'ADMIN', 'AGENT'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>

                  {/* Plan */}
                  <td className="px-4 py-3">
                    <select
                      defaultValue={u.plan}
                      disabled={saving === u.id}
                      onChange={e => applyAction(u.id, 'setPlan', e.target.value)}
                      className="bg-slate-700 text-slate-200 text-xs rounded px-1.5 py-1 border border-slate-600 focus:outline-none cursor-pointer"
                    >
                      {['FREE', 'PRO', 'ENTERPRISE'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>

                  {/* Trust */}
                  <td className="px-4 py-3"><TrustBadge score={u.trustScore} /></td>

                  {/* GST */}
                  <td className="px-4 py-3 text-xs">
                    {u.gstNumber
                      ? <span className="text-green-400" title={u.gstNumber}>✓ {u.gstNumber.slice(0, 6)}…</span>
                      : <span className="text-slate-600">—</span>}
                  </td>

                  {/* Udyam */}
                  <td className="px-4 py-3 text-xs">
                    {u.udyamNumber
                      ? <span className="text-green-400" title={u.udyamNumber}>✓</span>
                      : <span className="text-slate-600">—</span>}
                  </td>

                  {/* RFQs */}
                  <td className="px-4 py-3 text-slate-300 text-center">{u._count.rfqs}</td>

                  {/* Wallet */}
                  <td className="px-4 py-3 text-xs text-slate-300">
                    {u.wallet ? `₹${(u.wallet.balance / 100).toFixed(0)}` : '—'}
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.isActive ? 'bg-green-900/30 text-green-400 border border-green-700/50' : 'bg-red-900/30 text-red-400 border border-red-700/50'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <button
                        disabled={saving === u.id}
                        onClick={() => applyAction(u.id, u.isActive ? 'deactivate' : 'activate')}
                        className={`text-xs px-2 py-1 rounded transition-colors ${u.isActive ? 'bg-red-900/30 text-red-400 hover:bg-red-900/60 border border-red-700/50' : 'bg-green-900/30 text-green-400 hover:bg-green-900/60 border border-green-700/50'}`}
                      >
                        {saving === u.id ? '…' : u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      {!u.isVerified && (
                        <button
                          disabled={saving === u.id}
                          onClick={() => applyAction(u.id, 'setVerified', 'true')}
                          className="text-xs px-2 py-1 rounded bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/60 border border-indigo-700/50 transition-colors"
                        >
                          Verify KYC
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Page {page} of {pages} — {total} users</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 bg-slate-800 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors">
              ← Prev
            </button>
            <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 bg-slate-800 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
