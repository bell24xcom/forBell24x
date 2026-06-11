'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ConsentEventsPage() {
  const [items, setItems]   = useState<any[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterGranted, setFilterGranted] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (filterGranted !== '') params.set('granted', filterGranted);
    fetch(`/api/admin/compliance/consent-events?${params}`)
      .then(r => r.json())
      .then(d => { setItems(d.items ?? []); setTotal(d.total ?? 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, filterGranted]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/compliance" className="text-indigo-400 text-sm hover:underline">← Compliance</Link>
          <h1 className="text-2xl font-bold text-white mt-1">Consent Events</h1>
          <p className="text-slate-400 text-sm">{total} total records</p>
        </div>
        <select
          value={filterGranted}
          onChange={e => { setFilterGranted(e.target.value); setPage(1); }}
          className="bg-slate-800 border border-slate-600 text-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="true">Granted</option>
          <option value="false">Withdrawn</option>
        </select>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-left">
                <th className="pb-2 pr-4">Purpose</th>
                <th className="pb-2 pr-4">Method</th>
                <th className="pb-2 pr-4">User / Contact</th>
                <th className="pb-2 pr-4">Version</th>
                <th className="pb-2 pr-4">Granted</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item: any) => (
                <tr key={item.id} className="text-slate-300">
                  <td className="py-2 pr-4 font-medium text-white">{item.purpose}</td>
                  <td className="py-2 pr-4 text-slate-400">{item.method}</td>
                  <td className="py-2 pr-4 text-slate-500 font-mono text-xs">{item.userId ?? item.contactId ?? '—'}</td>
                  <td className="py-2 pr-4">{item.consentTextVersion}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.granted ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                      {item.granted ? 'Yes' : 'Withdrawn'}
                    </span>
                  </td>
                  <td className="py-2 text-slate-500 text-xs">{new Date(item.createdAt).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
