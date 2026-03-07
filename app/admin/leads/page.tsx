'use client';

import { useState, useEffect } from 'react';
import { Eye, X, Users, DollarSign, Mail, Phone, MapPin } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  source: string | null;
  status: string;
  message: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_TABS = ['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'SPAM'];
const STATUS_COLORS: Record<string, string> = {
  NEW:       'bg-blue-900/40 text-blue-300 border-blue-700/50',
  CONTACTED: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  QUALIFIED: 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50',
  CONVERTED: 'bg-green-900/40 text-green-300 border-green-700/50',
  SPAM:      'bg-red-900/40 text-red-300 border-red-700/50',
};

export default function LeadsManagementPage() {
  const [leads,       setLeads]       = useState<Lead[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState<Lead | null>(null);
  const [search,      setSearch]      = useState('');
  const [tab,         setTab]         = useState('ALL');
  const [updating,    setUpdating]    = useState<string | null>(null);

  useEffect(() => { fetchLeads(); }, [tab]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limit: '100' });
      if (tab !== 'ALL') p.set('status', tab);
      const res = await fetch(`/api/admin/leads?${p}`, { credentials: 'include' });
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (leadId: string, status: string) => {
    setUpdating(leadId);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
        if (selected?.id === leadId) setSelected(prev => prev ? { ...prev, status } : prev);
      }
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  };

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.company || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.phone || '').includes(search)
  );

  const stats = {
    total:     leads.length,
    new:       leads.filter(l => l.status === 'NEW').length,
    qualified: leads.filter(l => l.status === 'QUALIFIED').length,
    converted: leads.filter(l => l.status === 'CONVERTED').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Lead Management</h1>
        <p className="text-slate-400 text-sm">Monitor and manage buyer leads</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'border-slate-700/50' },
          { label: 'New', value: stats.new, color: 'border-blue-700/30' },
          { label: 'Qualified', value: stats.qualified, color: 'border-indigo-700/30' },
          { label: 'Converted', value: stats.converted, color: 'border-green-700/30' },
        ].map(s => (
          <div key={s.label} className={`bg-slate-800/60 border ${s.color} rounded-xl p-4`}>
            <p className="text-slate-400 text-xs uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 flex-wrap bg-slate-800/60 border border-slate-700/50 rounded-xl p-1.5 w-fit">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[36px] ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <input type="text" placeholder="Search name, company, email, phone…" value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-md px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left">
                {['Name / Company', 'Contact', 'Source', 'Message', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No leads found</td></tr>
              ) : filtered.map(lead => (
                <tr key={lead.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{lead.name}</div>
                    {lead.company && <div className="text-slate-400 text-xs">{lead.company}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-300">
                    {lead.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</div>}
                    {lead.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{lead.source || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 max-w-[180px] truncate">{lead.message || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[lead.status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(lead)} className="text-indigo-400 hover:text-indigo-300 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setSelected(null)} />
          <div className="w-full max-w-[420px] bg-slate-900 border-l border-slate-700 overflow-y-auto flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-700 sticky top-0 bg-slate-900 z-10 flex items-start justify-between">
              <div>
                <h2 className="text-white font-bold">{selected.name}</h2>
                {selected.company && <p className="text-slate-400 text-xs">{selected.company}</p>}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block ${STATUS_COLORS[selected.status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                  {selected.status}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white transition-colors ml-3"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-5 flex-1">
              {/* Contact Info */}
              <div className="bg-slate-800/60 rounded-lg p-4 space-y-2 text-sm">
                {selected.phone && <div className="flex items-center gap-2 text-slate-300"><Phone className="w-4 h-4 text-slate-500" />{selected.phone}</div>}
                {selected.email && <div className="flex items-center gap-2 text-slate-300"><Mail className="w-4 h-4 text-slate-500" />{selected.email}</div>}
                <div className="flex items-center gap-2 text-slate-300"><Users className="w-4 h-4 text-slate-500" />Source: {selected.source || 'Unknown'}</div>
                {selected.assignedTo && <div className="flex items-center gap-2 text-slate-300"><MapPin className="w-4 h-4 text-slate-500" />Assigned: {selected.assignedTo}</div>}
                <div className="text-slate-500 text-xs">Created: {new Date(selected.createdAt).toLocaleDateString('en-IN')}</div>
              </div>

              {/* Message */}
              {selected.message && (
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Message</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{selected.message}</p>
                </div>
              )}

              {/* Status Actions */}
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { status: 'CONTACTED', label: 'Mark Contacted', color: 'bg-amber-900/40 text-amber-300 border-amber-700/50 hover:bg-amber-900/60' },
                    { status: 'QUALIFIED', label: 'Mark Qualified', color: 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50 hover:bg-indigo-900/60' },
                    { status: 'CONVERTED', label: 'Convert to User', color: 'bg-green-900/40 text-green-300 border-green-700/50 hover:bg-green-900/60' },
                    { status: 'SPAM',      label: 'Mark Spam',      color: 'bg-red-900/40 text-red-300 border-red-700/50 hover:bg-red-900/60' },
                  ].map(({ status, label, color }) => (
                    <button key={status}
                      onClick={() => updateStatus(selected.id, status)}
                      disabled={updating === selected.id || selected.status === status}
                      className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-40 min-h-[44px] ${color}`}>
                      {updating === selected.id ? '…' : label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
