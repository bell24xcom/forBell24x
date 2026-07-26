'use client';

import { CheckCircle, Clock, Download, Eye, FileText, Mic, Play, RefreshCw, X, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Quote {
  id: string; price: number; status: string; createdAt: string;
  supplier: { name: string | null; email: string | null } | null;
  deal: { id: string; status: string } | null;
}
interface RFQ {
  id: string; title: string; description: string | null;
  user: { name: string | null; company: string | null; email: string | null; phone: string | null } | null;
  category: string; minBudget: number | null; maxBudget: number | null;
  status: string; urgency: string; timeline: string | null;
  createdAt: string; expiresAt: string | null; type: string | null;
  quantity?: string; // already returned by GET /api/admin/rfqs (include, not select) — just untyped until now
  _count: { quotes: number }; quotes: Quote[];
}
interface SupplierOption {
  id: string; name: string; company: string | null; phone: string | null; email: string | null;
}

const urgencyColor: Record<string, string> = { URGENT: 'bg-red-500', HIGH: 'bg-orange-500', MEDIUM: 'bg-yellow-500', NORMAL: 'bg-green-500', LOW: 'bg-green-500' };
const statusBadge = (s: string) => s === 'ACTIVE' ? 'bg-blue-900/40 text-blue-300 border-blue-700/50' : s === 'COMPLETED' ? 'bg-green-900/40 text-green-300 border-green-700/50' : s === 'EXPIRED' ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-red-900/40 text-red-300 border-red-700/50';
const fmt = (n: number | null) => n ? `₹${(n / 100000).toFixed(1)}L` : '—';
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function AdminRFQsPage() {
  const [rfqs,       setRfqs]       = useState<RFQ[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [statusF,    setStatusF]    = useState('');
  const [drawer,     setDrawer]     = useState<RFQ | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm,    setConfirm]    = useState<string | null>(null);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 50;

  // Off-platform deal settlement (admin-only; see /api/deal/[id]/complete —
  // never touches the separate wallet-escrow flow, which stays untouched)
  const [settleOpenId, setSettleOpenId] = useState<string | null>(null);
  const [settleMethod, setSettleMethod] = useState('');
  const [settleRef,    setSettleRef]    = useState('');
  const [settleLoading, setSettleLoading] = useState(false);
  const [settleMsg,    setSettleMsg]    = useState<{ dealId: string; text: string; ok: boolean } | null>(null);

  const markDealComplete = async (dealId: string) => {
    setSettleLoading(true);
    setSettleMsg(null);
    try {
      const res = await fetch(`/api/deal/${dealId}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settlementMethod: settleMethod || undefined, reference: settleRef || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setSettleMsg({ dealId, text: data.alreadyCompleted ? 'Already recorded.' : 'Recorded — deal marked complete.', ok: true });
        setSettleOpenId(null);
        setSettleMethod('');
        setSettleRef('');
        if (drawer) fetchRFQs(page); // refresh deal.status shown in the drawer's source data
      } else {
        setSettleMsg({ dealId, text: data.error || 'Failed to record settlement.', ok: false });
      }
    } catch {
      setSettleMsg({ dealId, text: 'Network error. Please try again.', ok: false });
    } finally {
      setSettleLoading(false);
    }
  };

  // Concierge quote submission (admin-only; see POST /api/admin/rfqs
  // {action:'submit-concierge-quote'} — existing, unmodified endpoint that
  // previously had no UI to reach it).
  const [conciergeOpen,        setConciergeOpen]        = useState(false);
  const [supplierQuery,        setSupplierQuery]        = useState('');
  const [supplierResults,      setSupplierResults]      = useState<SupplierOption[]>([]);
  const [supplierSearching,    setSupplierSearching]    = useState(false);
  const [selectedSupplier,     setSelectedSupplier]     = useState<SupplierOption | null>(null);
  const [conciergePrice,       setConciergePrice]       = useState('');
  const [sourcingNote,         setSourcingNote]         = useState('');
  const [showOptionalFields,   setShowOptionalFields]   = useState(false);
  const [conciergeQuantity,    setConciergeQuantity]    = useState('');
  const [conciergeTerms,       setConciergeTerms]       = useState('');
  const [conciergeTimeline,    setConciergeTimeline]    = useState('');
  const [conciergeDeliveryDays, setConciergeDeliveryDays] = useState('');
  const [conciergeNotes,       setConciergeNotes]       = useState('');
  const [conciergeSubmitting,  setConciergeSubmitting]  = useState(false);
  const [conciergeMsg,         setConciergeMsg]         = useState<{ text: string; ok: boolean } | null>(null);

  const resetConciergeForm = () => {
    setConciergeOpen(false);
    setSupplierQuery(''); setSupplierResults([]); setSelectedSupplier(null);
    setConciergePrice(''); setSourcingNote(''); setShowOptionalFields(false);
    setConciergeQuantity(''); setConciergeTerms(''); setConciergeTimeline('');
    setConciergeDeliveryDays(''); setConciergeNotes(''); setConciergeMsg(null);
  };

  // Debounced supplier search — mirrors the existing /admin/suppliers list
  // endpoint (role: SUPPLIER, matches name/company/phone/email).
  useEffect(() => {
    if (!conciergeOpen) return;
    if (!supplierQuery.trim()) { setSupplierResults([]); return; }
    const t = setTimeout(async () => {
      setSupplierSearching(true);
      try {
        const res = await fetch(`/api/admin/suppliers?search=${encodeURIComponent(supplierQuery)}`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) setSupplierResults(data.suppliers);
      } catch (e) { console.error(e); }
      finally { setSupplierSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [supplierQuery, conciergeOpen]);

  const submitConciergeQuote = async () => {
    if (!drawer || !selectedSupplier || !conciergePrice || sourcingNote.trim().length < 10) return;
    setConciergeSubmitting(true);
    setConciergeMsg(null);
    try {
      const res = await fetch('/api/admin/rfqs', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit-concierge-quote',
          rfqId: drawer.id,
          supplierId: selectedSupplier.id,
          price: Number(conciergePrice),
          sourcingNote: sourcingNote.trim(),
          quantity: conciergeQuantity || undefined,
          terms: conciergeTerms || undefined,
          timeline: conciergeTimeline || undefined,
          deliveryDays: conciergeDeliveryDays ? Number(conciergeDeliveryDays) : undefined,
          notes: conciergeNotes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchRFQs(page); // also refreshes the open drawer's quotes list
        resetConciergeForm();
      } else {
        setConciergeMsg({ text: data.error || 'Failed to submit concierge quote.', ok: false });
      }
    } catch {
      setConciergeMsg({ text: 'Network error. Please try again.', ok: false });
    } finally {
      setConciergeSubmitting(false);
    }
  };

  const fetchRFQs = async (pg = page) => {
    setRefreshing(true);
    try {
      const p = new URLSearchParams({ limit: String(LIMIT), page: String(pg) });
      if (statusF) p.set('status', statusF);
      if (search)  p.set('search', search);
      const res = await fetch(`/api/admin/rfqs?${p}`, { credentials: 'include' });
      const data = await res.json();
      if (data.rfqs) {
        setRfqs(data.rfqs);
        setTotalPages(data.pagination?.pages ?? 1);
        setTotalCount(data.pagination?.total ?? data.rfqs.length);
        // Keep an open drawer showing fresh data (e.g. its quotes list right
        // after a concierge quote is submitted) instead of a stale snapshot.
        setDrawer(prev => prev ? (data.rfqs.find((r: RFQ) => r.id === prev.id) ?? prev) : prev);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { setPage(1); fetchRFQs(1); }, [statusF]);

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
      if (drawer?.id === id) { resetConciergeForm(); setDrawer(null); }
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
          <p className="text-slate-400 text-sm">{totalCount} total · page {page}/{totalPages}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white rounded-lg text-sm transition-colors min-h-[44px]">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => fetchRFQs(page)} disabled={refreshing} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 min-h-[44px]">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search title, buyer, category…" value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { setPage(1); fetchRFQs(1); } }}
          className="flex-1 min-w-[200px] px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" />
        <select value={statusF} onChange={e => setStatusF(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none min-h-[44px]">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button onClick={() => { setPage(1); fetchRFQs(1); }} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors min-h-[44px]">Search</button>
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
                      <button onClick={() => { resetConciergeForm(); setDrawer(rfq); }} title="View" className="text-indigo-400 hover:text-indigo-300 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500 text-xs">
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, totalCount)} of {totalCount} RFQs
          </p>
          <div className="flex gap-2">
            <button onClick={() => { const p = Math.max(1, page - 1); setPage(p); fetchRFQs(p); }}
              disabled={page === 1}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs disabled:opacity-40 hover:bg-slate-700 transition-colors min-h-[36px]">
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page <= 3 ? i + 1 : page + i - 2;
              if (pg < 1 || pg > totalPages) return null;
              return (
                <button key={pg} onClick={() => { setPage(pg); fetchRFQs(pg); }}
                  className={`px-3 py-1.5 rounded-lg text-xs min-h-[36px] transition-colors ${pg === page ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
                  {pg}
                </button>
              );
            })}
            <button onClick={() => { const p = Math.min(totalPages, page + 1); setPage(p); fetchRFQs(p); }}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs disabled:opacity-40 hover:bg-slate-700 transition-colors min-h-[36px]">
              Next
            </button>
          </div>
        </div>
      )}

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
          <div className="flex-1 bg-black/40" onClick={() => { resetConciergeForm(); setDrawer(null); }} />
          <div className="w-full max-w-[440px] bg-slate-900 border-l border-slate-700 overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex items-start justify-between p-5 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
              <div>
                <h2 className="text-white font-bold text-base leading-snug">{drawer.title}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusBadge(drawer.status)}`}>{drawer.status}</span>
              </div>
              <button onClick={() => { resetConciergeForm(); setDrawer(null); }} className="text-slate-400 hover:text-white transition-colors ml-3 mt-1"><X className="w-5 h-5" /></button>
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

              {/* Concierge Quote — staff logs a real quote obtained off-platform
                  from a real supplier; see route.ts doc-comment on
                  submit-concierge-quote for the disclosure/audit rules this
                  form must satisfy (real supplier with contact info, mandatory
                  sourcing note). */}
              {conciergeOpen && (
                <div className="bg-slate-800/60 border border-amber-700/40 rounded-lg p-3 space-y-3">
                  <p className="text-amber-300 text-xs font-semibold uppercase tracking-wider">Submit Concierge Quote</p>

                  {!selectedSupplier ? (
                    <div>
                      <input
                        type="text"
                        placeholder="Search supplier by name, company, phone, email…"
                        value={supplierQuery}
                        onChange={e => setSupplierQuery(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {supplierSearching && <p className="text-slate-500 text-xs mt-1">Searching…</p>}
                      {supplierResults.length > 0 && (
                        <div className="mt-1.5 max-h-40 overflow-y-auto border border-slate-700 rounded divide-y divide-slate-700/50">
                          {supplierResults.map(s => (
                            <button
                              key={s.id}
                              onClick={() => { setSelectedSupplier(s); setSupplierResults([]); }}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-700/50 transition-colors"
                            >
                              <p className="text-white text-xs">{s.company || s.name}</p>
                              <p className="text-slate-500 text-[11px]">{s.phone || s.email || 'no contact on file'}</p>
                            </button>
                          ))}
                        </div>
                      )}
                      {!supplierSearching && supplierQuery.trim() && supplierResults.length === 0 && (
                        <p className="text-slate-500 text-xs mt-1">No matching suppliers.</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded px-2.5 py-2">
                      <div>
                        <p className="text-white text-xs">{selectedSupplier.company || selectedSupplier.name}</p>
                        <p className="text-slate-500 text-[11px]">{selectedSupplier.phone || selectedSupplier.email}</p>
                      </div>
                      <button onClick={() => setSelectedSupplier(null)} className="text-slate-400 hover:text-white text-xs">Change</button>
                    </div>
                  )}

                  <input
                    type="number"
                    placeholder="Price (₹) *"
                    value={conciergePrice}
                    onChange={e => setConciergePrice(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />

                  <textarea
                    placeholder='Sourcing note * (how this quote was obtained, e.g. "Phone call 2026-07-20 with Mr. Sharma, Apparel Solutions Inc, +9198xxxxxxx")'
                    value={sourcingNote}
                    onChange={e => setSourcingNote(e.target.value)}
                    rows={2}
                    className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {sourcingNote.length > 0 && sourcingNote.trim().length < 10 && (
                    <p className="text-red-400 text-[11px]">At least 10 characters.</p>
                  )}

                  <button onClick={() => setShowOptionalFields(v => !v)} className="text-slate-400 hover:text-white text-[11px] underline">
                    {showOptionalFields ? 'Hide' : 'Show'} optional fields (quantity, terms, timeline, delivery)
                  </button>

                  {showOptionalFields && (
                    <div className="space-y-2">
                      <input type="text" placeholder={`Quantity (defaults to ${drawer.quantity || 'RFQ quantity'})`} value={conciergeQuantity}
                        onChange={e => setConciergeQuantity(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      <input type="text" placeholder="Terms" value={conciergeTerms}
                        onChange={e => setConciergeTerms(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      <input type="text" placeholder="Timeline" value={conciergeTimeline}
                        onChange={e => setConciergeTimeline(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      <input type="number" placeholder="Delivery days" value={conciergeDeliveryDays}
                        onChange={e => setConciergeDeliveryDays(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      <textarea placeholder="Notes" value={conciergeNotes}
                        onChange={e => setConciergeNotes(e.target.value)} rows={2}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                  )}

                  {conciergeMsg && (
                    <p className={`text-xs ${conciergeMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{conciergeMsg.text}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={submitConciergeQuote}
                      disabled={conciergeSubmitting || !selectedSupplier || !conciergePrice || sourcingNote.trim().length < 10}
                      className="flex-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded disabled:opacity-50 min-h-[32px]"
                    >
                      {conciergeSubmitting ? 'Submitting…' : 'Submit Quote'}
                    </button>
                    <button onClick={resetConciergeForm} className="px-3 py-1.5 border border-slate-700 text-slate-300 text-xs rounded min-h-[32px]">
                      Cancel
                    </button>
                  </div>
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
                      <div key={q.id} className="bg-slate-800/60 rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">{q.supplier?.name || 'Supplier'}</p>
                            <p className="text-slate-400 text-xs">{new Date(q.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-indigo-300 font-semibold">₹{q.price.toLocaleString('en-IN')}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${q.status === 'ACCEPTED' ? 'bg-green-900/40 text-green-400' : q.status === 'REJECTED' ? 'bg-red-900/40 text-red-400' : 'bg-slate-800 text-slate-400'}`}>{q.status}</span>
                          </div>
                        </div>

                        {/* Deal settlement — admin-only, off-platform recorder.
                            Never shown/available for the wallet-escrow flow;
                            that one lives entirely on the buyer's own dashboard. */}
                        {q.status === 'ACCEPTED' && q.deal && (
                          <div className="mt-2 pt-2 border-t border-slate-700/50">
                            {q.deal.status === 'ACTIVE' ? (
                              settleOpenId === q.deal.id ? (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    placeholder="Settlement method (e.g. UPI, Bank Transfer)"
                                    value={settleMethod}
                                    onChange={e => setSettleMethod(e.target.value)}
                                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Reference / note (e.g. UPI ref, who confirmed)"
                                    value={settleRef}
                                    onChange={e => setSettleRef(e.target.value)}
                                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => markDealComplete(q.deal!.id)}
                                      disabled={settleLoading}
                                      className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded disabled:opacity-50 min-h-[32px]"
                                    >
                                      {settleLoading ? 'Recording…' : 'Confirm Paid (Off-Platform)'}
                                    </button>
                                    <button
                                      onClick={() => { setSettleOpenId(null); setSettleMethod(''); setSettleRef(''); }}
                                      className="px-3 py-1.5 border border-slate-700 text-slate-300 text-xs rounded min-h-[32px]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setSettleOpenId(q.deal!.id)}
                                  className="text-xs px-3 py-1.5 bg-amber-900/40 hover:bg-amber-900/60 text-amber-300 border border-amber-700/50 rounded transition-colors min-h-[32px]"
                                >
                                  Mark Paid (Off-Platform)
                                </button>
                              )
                            ) : (
                              <span className="text-xs text-slate-500">
                                Deal status: <span className="text-slate-300">{q.deal.status}</span>
                                {q.deal.status !== 'COMPLETED' && ' — using wallet escrow, complete via buyer dashboard'}
                              </span>
                            )}
                            {settleMsg?.dealId === q.deal.id && (
                              <p className={`text-xs mt-1.5 ${settleMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{settleMsg.text}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {drawer.status === 'ACTIVE' && (
              <div className="p-5 border-t border-slate-700 flex gap-2 sticky bottom-0 bg-slate-900">
                <button onClick={() => patchRFQ(drawer.id, 'extend', 7)} disabled={actionLoading}
                  className="flex-1 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 min-h-[44px]">
                  {actionLoading ? '…' : 'Extend 7 Days'}
                </button>
                <button onClick={() => setConciergeOpen(v => !v)} disabled={actionLoading}
                  className="flex-1 px-3 py-2.5 bg-amber-900/40 hover:bg-amber-900/60 text-amber-300 border border-amber-700/50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 min-h-[44px]">
                  {conciergeOpen ? 'Hide Concierge Form' : 'Submit Concierge Quote'}
                </button>
                <button onClick={() => { setConfirm(drawer.id); resetConciergeForm(); setDrawer(null); }} disabled={actionLoading}
                  className="flex-1 px-3 py-2.5 bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-700/50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 min-h-[44px]">
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
