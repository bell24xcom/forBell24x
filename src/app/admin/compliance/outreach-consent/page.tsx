'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OutreachConsentPage() {
  const [items, setItems]   = useState<any[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (channel) params.set('channel', channel);
    fetch(`/api/admin/compliance/outreach-consent?${params}`)
      .then(r => r.json())
      .then(d => { setItems(d.items ?? []); setTotal(d.total ?? 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, channel]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/compliance" className="text-indigo-400 text-sm hover:underline">← Compliance</Link>
          <h1 className="text-2xl font-bold text-white mt-1">Outreach Consent Log</h1>
          <p className="text-slate-400 text-sm">{total} records · opt-in basis and opt-outs for WA/email outreach</p>
        </div>
        <select
          value={channel}
          onChange={e => { setChannel(e.target.value); setPage(1); }}
          className="bg-slate-800 border border-slate-600 text-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All channels</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="EMAIL">Email</option>
        </select>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-left">
                <th className="pb-2 pr-4">Contact ID</th>
                <th className="pb-2 pr-4">Channel</th>
                <th className="pb-2 pr-4">Opt-in Source</th>
                <th className="pb-2 pr-4">Opted In</th>
                <th className="pb-2">Opted Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item: any) => (
                <tr key={item.id} className="text-slate-300">
                  <td className="py-2 pr-4 font-mono text-xs text-slate-400">{item.contactId}</td>
                  <td className="py-2 pr-4">{item.channel}</td>
                  <td className="py-2 pr-4">{item.optInSource}</td>
                  <td className="py-2 pr-4 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString('en-IN')}</td>
                  <td className="py-2">
                    {item.optOutAt ? (
                      <span className="text-red-400 text-xs">{new Date(item.optOutAt).toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-green-400 text-xs">Active</span>
                    )}
                  </td>
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
