'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const STATUS_STYLE: Record<string, string> = {
  RECEIVED:   'bg-blue-900/40 text-blue-300',
  VERIFYING:  'bg-amber-900/40 text-amber-300',
  COMPLETED:  'bg-green-900/40 text-green-300',
  REJECTED:   'bg-slate-700 text-slate-400',
};

export default function ErasureRequestsPage() {
  const [items, setItems]       = useState<any[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [completing, setCompleting]     = useState<string | null>(null);
  const [notes, setNotes]               = useState('');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (filterStatus) params.set('status', filterStatus);
    fetch(`/api/admin/compliance/erasure-requests?${params}`)
      .then(r => r.json())
      .then(d => { setItems(d.items ?? []); setTotal(d.total ?? 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, filterStatus]);

  const complete = async (id: string) => {
    if (!confirm('Mark this erasure request as COMPLETED and delete the user\'s personal data? This is irreversible.')) return;
    try {
      const res  = await fetch(`/api/admin/compliance/erasure/${id}/complete`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (data.success) { setCompleting(null); setNotes(''); load(); }
      else alert(data.error || 'Failed');
    } catch { alert('Network error'); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/compliance" className="text-indigo-400 text-sm hover:underline">← Compliance</Link>
          <h1 className="text-2xl font-bold text-white mt-1">Erasure Requests</h1>
          <p className="text-slate-400 text-sm">{total} total · must be resolved within 30 days of receipt</p>
        </div>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="bg-slate-800 border border-slate-600 text-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="RECEIVED">Received</option>
          <option value="VERIFYING">Verifying</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => (
            <div key={item.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[item.status] ?? 'bg-slate-700 text-slate-300'}`}>
                      {item.status}
                    </span>
                    <span className="text-white font-medium truncate">{item.requesterIdentifier}</span>
                  </div>
                  {item.notes && <p className="text-slate-400 text-sm">{item.notes}</p>}
                  <p className="text-slate-500 text-xs mt-1">
                    Received {new Date(item.requestedAt).toLocaleString('en-IN')}
                    {item.completedAt && ` · Completed ${new Date(item.completedAt).toLocaleString('en-IN')}`}
                    {item.handledBy && ` by ${item.handledBy}`}
                  </p>
                </div>
                {item.status !== 'COMPLETED' && item.status !== 'REJECTED' && (
                  <div className="flex-shrink-0">
                    {completing === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          placeholder="Optional notes"
                          className="bg-slate-700 border border-slate-600 text-white text-sm rounded px-2 py-1 w-40"
                        />
                        <button
                          onClick={() => complete(item.id)}
                          className="bg-red-700 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded"
                        >
                          Confirm Delete
                        </button>
                        <button onClick={() => setCompleting(null)} className="text-slate-400 text-xs">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCompleting(item.id)}
                        className="bg-red-900/40 hover:bg-red-700 border border-red-700/50 text-red-300 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
                      >
                        Mark Complete + Delete Data
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded disabled:opacity-40">Prev</button>
        <span className="px-3 py-1.5 text-sm text-slate-400">Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={items.length < 50} className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}
