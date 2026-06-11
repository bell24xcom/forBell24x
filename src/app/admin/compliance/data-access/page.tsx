'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const ACTION_STYLE: Record<string, string> = {
  VIEW:   'bg-blue-900/40 text-blue-300',
  EXPORT: 'bg-amber-900/40 text-amber-300',
  DELETE: 'bg-red-900/40 text-red-300',
};

export default function DataAccessLogPage() {
  const [items, setItems]   = useState<any[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (action) params.set('action', action);
    fetch(`/api/admin/compliance/data-access?${params}`)
      .then(r => r.json())
      .then(d => { setItems(d.items ?? []); setTotal(d.total ?? 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, action]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/compliance" className="text-indigo-400 text-sm hover:underline">← Compliance</Link>
          <h1 className="text-2xl font-bold text-white mt-1">Data Access Log</h1>
          <p className="text-slate-400 text-sm">{total} records · who accessed / exported / deleted personal data</p>
        </div>
        <select
          value={action}
          onChange={e => { setAction(e.target.value); setPage(1); }}
          className="bg-slate-800 border border-slate-600 text-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All actions</option>
          <option value="VIEW">VIEW</option>
          <option value="EXPORT">EXPORT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-left">
                <th className="pb-2 pr-4">Admin</th>
                <th className="pb-2 pr-4">Action</th>
                <th className="pb-2 pr-4">Entity</th>
                <th className="pb-2 pr-4">Entity ID</th>
                <th className="pb-2">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item: any) => (
                <tr key={item.id} className="text-slate-300">
                  <td className="py-2 pr-4 font-mono text-xs text-slate-400">{item.adminUserId}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ACTION_STYLE[item.action] ?? 'bg-slate-700 text-slate-300'}`}>
                      {item.action}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{item.entity}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-slate-500">{item.entityId}</td>
                  <td className="py-2 text-slate-500 text-xs">{new Date(item.timestamp).toLocaleString('en-IN')}</td>
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
