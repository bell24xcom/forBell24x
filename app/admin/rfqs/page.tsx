'use client';

import { CheckCircle, Clock, Download, Eye, FileText, Mic, Play, RefreshCw, X, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Quote { id: string; price: number; status: string; createdAt: string; supplier: { name: string | null; email: string | null } | null }
interface RFQ {
  id: string; title: string; description: string | null;
  user: { name: string | null; company: string | null; email: string | null; phone: string | null } | null;
  category: string; minBudget: number | null; maxBudget: number | null;
  status: string; urgency: string; timeline: string | null;
  createdAt: string; expiresAt: string | null; type: string | null;
  _count: { quotes: number }; quotes: Quote[];
}

const urgencyColor: Record<string, string> = { URGENT: 'bg-red-500', HIGH: 'bg-orange-500', MEDIUM: 'bg-yellow-500', NORMAL: 'bg-green-500', LOW: 'bg-green-500' };
const statusBadge = (s: string) => s === 'ACTIVE' ? 'bg-blue-900/40 text-blue-300 border-blue-700/50' : s === 'COMPLETED' ? 'bg-green-900/40 text-green-300 border-green-700/50' : s === 'EXPIRED' ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-red-900/40 text-red-300 border-red-700/50';
const fmt = (n: number | null) => n ? `₹${(n / 100000).toFixed(1)}L` : '—';
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function AdminRFQsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [drawer, setDrawer] = useState<RFQ | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null); // rfqId to confirm close

  const fetchRFQs = async () => {
    setRefreshing(true);
    try {
      const p = new URLSearchParams({ limit: '50' });
      if (statusF) p.set('status', statusF);
      if (search)  p.set('search', search);
      const res = await fetch(`/api/admin/rfqs?${p}`, { credentials: 'include' });
      const data = await res.json();
      if (data.rfqs) setRfqs(data.rfqs);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchRFQs(); }, [statusF]);

  const patchRFQ = async (id: string, action: string, days?: number) => {
    setActionLoading(true);
    try {
      await fetch('/api/admin/rfqs', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfqId: id, updates: action === 'close' ? { status: 'CANCELLED' } : { expiresAt: new Date(Date.now() + (days || 7) * 86400000) } }),
      });
      await fetchRFQs();
      if (drawer?.id === id) setDrawer(null);
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); setConfirm(null); }
  };

  const exportCSV = () => {
    const headers = 'ID,Title,Category,Status,Budget,Urgency,Buyer,Quotes,Created,Expires\n';
    const rows = rfqs.map(r =>
      `"${r.id}","${r.title}","${r.category}","${r.status}","${fmt(r.maxBudget)}","${r.urgency}","${r.user?.name || ''}",${r._count.quotes},"${fmtDate(r.createdAt)}","${fmtDate(r.expiresAt)}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `rfqs-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  const filtered = rfqs.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">RFQ Management</h1>
          <p className="text-slate-400 text-sm">{filtered.length} RFQs</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white rounded-lg text-sm transition-colors min-h-[44px]">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={fetchRFQs} disabled={refreshing} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 min-h-[44px]">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search title, buyer, category…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
        <select value={statusF} onChange={e => setStatusF(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none min-h-[44px]">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button onClick={fetchRFQs} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors min-h-[44px]">Search</button>
      </div>

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left">
                {['RFQ', 'Type', 'Buyer', 'Category', 'Budget', 'Urgency', 'Status', 'Quotes', 'Created', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-500">No RFQs found</td></tr>
              ) : filtered.map(rfq => (
                <tr key={rfq.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="font-medium text-white truncate">{rfq.title}</div>
                    <div className="text-slate-500 text-xs truncate">{rfq.id.slice(-8)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      {rfq.type === 'video' ? <Play className="w-3 h-3" /> : rfq.type === 'voice' ? <Mic className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                      {rfq.type?.toUpperCase() || 'TEXT'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white text-sm">{rfq.user?.name || '—'}</div>
                    <div className="text-slate-500 text-xs">{rfq.user?.phone || rfq.user?.email || ''}</div>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 border border-blue-700/40 rounded-full">{rfq.category}</span></td>
                  <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">{fmt(rfq.maxBudget)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${urgencyColor[rfq.urgency] || 'bg-slate-500'}`} />
                      <span className="text-xs text-slate-400">{rfq.urgency}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusBadge(rfq.status)}`}>{rfq.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{rfq._count.quotes}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{fmtDate(rfq.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setDrawer(rfq)} title="View" className="text-indigo-400 hover:text-indigo-300 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirm(rfq.id)} title="Close RFQ" className="text-red-400 hover:text-red-300 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center" disabled={rfq.status !== 'ACTIVE'}>
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Close Dialog */}
      {confirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-white font-bold mb-2">Close this RFQ?</h3>
            <p className="text-slate-400 text-sm mb-5">This will set the status to CANCELLED. Suppliers cannot submit new quotes.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-800 transition-colors min-h-[44px]">Cancel</button>
              <button onClick={() => patchRFQ(confirm, 'close')} disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 min-h-[44px]">
                {actionLoading ? 'Closing…' : 'Confirm Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RFQ Drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setDrawer(null)} />
          <div className="w-full max-w-[440px] bg-slate-900 border-l border-slate-700 overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex items-start justify-between p-5 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
              <div>
                <h2 className="text-white font-bold text-base leading-snug">{drawer.title}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusBadge(drawer.status)}`}>{drawer.status}</span>
              </div>
              <button onClick={() => setDrawer(null)} className="text-slate-400 hover:text-white transition-colors ml-3 mt-1"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-5 flex-1">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 border border-blue-700/40 rounded-full">{drawer.category}</span>
                <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-full flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${urgencyColor[drawer.urgency] || 'bg-slate-500'}`} />{drawer.urgency}
                </span>
                <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-full">
                  {drawer.type?.toUpperCase() || 'TEXT'}
                </span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-slate-500 text-xs">Budget</p><p className="text-white">{fmt(drawer.maxBudget)}</p></div>
                <div><p className="text-slate-500 text-xs">Timeline</p><p className="text-white">{drawer.timeline || '—'}</p></div>
                <div><p className="text-slate-500 text-xs">Created</p><p className="text-white">{fmtDate(drawer.createdAt)}</p></div>
                <div><p className="text-slate-500 text-xs">Expires</p><p className="text-white">{fmtDate(drawer.expiresAt)}</p></div>
              </div>

              {/* Buyer */}
              {drawer.user && (
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-2 uppercase tracking-wider">Buyer</p>
                  <p className="text-white font-medium">{drawer.user.name || '—'}</p>
                  {drawer.user.phone && <p className="text-slate-400 text-xs">{drawer.user.phone}</p>}
                  {drawer.user.email && <p className="text-slate-400 text-xs">{drawer.user.email}</p>}
                </div>
              )}

              {/* Description */}
              {drawer.description && (
                <div>
                  <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Description</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{drawer.description}</p>
                </div>
              )}

              {/* Quotes */}
              <div>
                <p className="text-slate-500 text-xs mb-2 uppercase tracking-wider">Quotes ({drawer._count.quotes})</p>
                {drawer.quotes.length === 0 ? (
                  <p className="text-slate-300 text-sm">No quotes yet</p>
                ) : (
                  <div className="space-y-2">
                    {drawer.quotes.map(q => (
                      <div key={q.id} className="bg-slate-800/60 rounded-lg p-3 flex items-center justify-between text-sm">
                        <div>
                          <p className="text-white">{q.supplier?.name || 'Supplier'}</p>
                          <p className="text-slate-400 text-xs">{new Date(q.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-indigo-300 font-semibold">₹{q.price.toLocaleString('en-IN')}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${q.status === 'ACCEPTED' ? 'bg-green-900/40 text-green-400' : q.status === 'REJECTED' ? 'bg-red-900/40 text-red-400' : 'bg-slate-800 text-slate-400'}`}>{q.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {drawer.status === 'ACTIVE' && (
              <div className="p-5 border-t border-slate-700 flex gap-3 sticky bottom-0 bg-slate-900">
                <button onClick={() => patchRFQ(drawer.id, 'extend', 7)} disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 min-h-[44px]">
                  {actionLoading ? '…' : 'Extend 7 Days'}
                </button>
                <button onClick={() => { setConfirm(drawer.id); setDrawer(null); }} disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-700/50 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 min-h-[44px]">
                  Close RFQ
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
