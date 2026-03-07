'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, CheckSquare, Square, Eye, X } from 'lucide-react';

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
  const [saving,     setSaving]     = useState<string | null>(null); // userId being updated
  const [selected,   setSelected]   = useState<Set<string>>(new Set());
  const [drawerUser, setDrawerUser] = useState<User | null>(null);

  const limit = 25;

  const toggleSelect = (id: string) =>
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const toggleAll = () =>
    setSelected(prev => prev.size === users.length ? new Set() : new Set(users.map(u => u.id)));

  const exportCSV = () => {
    const rows = users.filter(u => selected.size === 0 || selected.has(u.id));
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Role', 'Plan', 'Trust Score', 'GST', 'RFQs', 'Wallet (₹)', 'Status', 'Joined'];
    const csv = [
      headers.join(','),
      ...rows.map(u => [
        u.name ?? '', u.email ?? '', u.phone ?? '', u.company ?? '',
        u.role, u.plan, u.trustScore, u.gstNumber ?? '',
        u._count.rfqs,
        u.wallet ? (u.wallet.balance / 100).toFixed(0) : '0',
        u.isActive ? 'Active' : 'Inactive',
        new Date(u.createdAt).toLocaleDateString('en-IN'),
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `crm-users-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">CRM — User Management</h1>
          <p className="text-slate-400 text-sm">{total.toLocaleString()} total users{selected.size > 0 ? ` · ${selected.size} selected` : ''}</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export {selected.size > 0 ? `${selected.size} selected` : 'all'} CSV
        </button>
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
                <th className="px-4 py-3">
                  <button onClick={toggleAll} className="text-slate-400 hover:text-white">
                    {selected.size === users.length && users.length > 0
                      ? <CheckSquare className="w-4 h-4 text-indigo-400" />
                      : <Square className="w-4 h-4" />}
                  </button>
                </th>
                {['User', 'Role', 'Plan', 'Trust', 'GST', 'Udyam', 'RFQs', 'Wallet', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan={12} className="px-4 py-8 text-center text-slate-500">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={12} className="px-4 py-8 text-center text-slate-500">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className={`hover:bg-slate-700/30 transition-colors ${!u.isActive ? 'opacity-50' : ''} ${selected.has(u.id) ? 'bg-indigo-900/10' : ''}`}>
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(u.id)} className="text-slate-400 hover:text-indigo-400">
                      {selected.has(u.id)
                        ? <CheckSquare className="w-4 h-4 text-indigo-400" />
                        : <Square className="w-4 h-4" />}
                    </button>
                  </td>
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
                      : <span className="text-slate-300">—</span>}
                  </td>

                  {/* Udyam */}
                  <td className="px-4 py-3 text-xs">
                    {u.udyamNumber
                      ? <span className="text-green-400" title={u.udyamNumber}>✓</span>
                      : <span className="text-slate-300">—</span>}
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
                    <div className="flex gap-2 items-center flex-wrap">
                      <button onClick={() => setDrawerUser(u)} className="text-indigo-400 hover:text-indigo-300 transition-colors" title="View details">
                        <Eye className="w-4 h-4" />
                      </button>
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

      {/* User Detail Drawer */}
      {drawerUser && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setDrawerUser(null)} />
          <div className="w-full max-w-[420px] bg-slate-900 border-l border-slate-700 overflow-y-auto flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-slate-700 sticky top-0 bg-slate-900 z-10 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center text-indigo-300 font-bold text-lg">
                  {(drawerUser.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-bold">{drawerUser.name || '—'}</p>
                  <p className="text-slate-400 text-xs">{drawerUser.phone || drawerUser.email || '—'}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${drawerUser.isActive ? 'bg-green-900/30 text-green-400 border border-green-700/50' : 'bg-red-900/30 text-red-400 border border-red-700/50'}`}>
                    {drawerUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button onClick={() => setDrawerUser(null)} className="text-slate-400 hover:text-white transition-colors ml-3"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-5 flex-1">
              {/* Account */}
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Account</p>
                <div className="bg-slate-800/60 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Role</span><span className="text-white">{drawerUser.role}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Plan</span><PlanBadge plan={drawerUser.plan} /></div>
                  <div className="flex justify-between"><span className="text-slate-400">Joined</span><span className="text-white">{new Date(drawerUser.createdAt).toLocaleDateString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Location</span><span className="text-white">{drawerUser.location || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Trust Score</span><TrustBadge score={drawerUser.trustScore} /></div>
                  {drawerUser.gstNumber && <div className="flex justify-between"><span className="text-slate-400">GST</span><span className="text-green-400 text-xs">{drawerUser.gstNumber}</span></div>}
                  {drawerUser.udyamNumber && <div className="flex justify-between"><span className="text-slate-400">Udyam</span><span className="text-green-400 text-xs">{drawerUser.udyamNumber}</span></div>}
                  <div className="flex justify-between"><span className="text-slate-400">KYC Verified</span><span className={drawerUser.isVerified ? 'text-green-400' : 'text-slate-500'}>{drawerUser.isVerified ? '✓ Verified' : 'Not verified'}</span></div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Activity</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                    <p className="text-white font-bold text-lg">{drawerUser._count.rfqs}</p>
                    <p className="text-slate-400 text-xs">RFQs</p>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                    <p className="text-white font-bold text-lg">{drawerUser._count.quotes}</p>
                    <p className="text-slate-400 text-xs">Quotes</p>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                    <p className="text-white font-bold text-lg">{drawerUser.wallet ? `₹${(drawerUser.wallet.balance / 100).toFixed(0)}` : '₹0'}</p>
                    <p className="text-slate-400 text-xs">Wallet</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Quick Actions</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue={drawerUser.plan}
                      onChange={e => { applyAction(drawerUser.id, 'setPlan', e.target.value); setDrawerUser(prev => prev ? { ...prev, plan: e.target.value } : prev); }}
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none min-h-[44px]"
                    >
                      {['FREE', 'PRO', 'ENTERPRISE'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <span className="text-slate-500 text-xs">Plan</span>
                  </div>
                  <button
                    onClick={() => { applyAction(drawerUser.id, drawerUser.isActive ? 'deactivate' : 'activate'); setDrawerUser(prev => prev ? { ...prev, isActive: !prev.isActive } : prev); }}
                    disabled={saving === drawerUser.id}
                    className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 min-h-[44px] ${drawerUser.isActive ? 'bg-red-900/30 text-red-300 border border-red-700/50 hover:bg-red-900/50' : 'bg-green-900/30 text-green-300 border border-green-700/50 hover:bg-green-900/50'}`}>
                    {saving === drawerUser.id ? '…' : drawerUser.isActive ? 'Deactivate User' : 'Activate User'}
                  </button>
                  {!drawerUser.isVerified && (
                    <button
                      onClick={() => { applyAction(drawerUser.id, 'setVerified', 'true'); setDrawerUser(prev => prev ? { ...prev, isVerified: true } : prev); }}
                      disabled={saving === drawerUser.id}
                      className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 min-h-[44px]">
                      {saving === drawerUser.id ? '…' : 'Verify KYC'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
