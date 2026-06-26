'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SupplierSeoRow {
  id: string;
  companyName: string;
  location: string | null;
  categories: string[];
  productCount: number;
  products: { name: string; slug: string; url: string }[];
  profileUrl: string;
  seoScore: number;
  dnaCompleteness: number | null;
  isClaimed: boolean;
}

interface Summary {
  total: number;
  withProducts: number;
  indexedProfiles: number;
  avgSeoScore: number;
}

export default function SupplierProfilesSeoPage() {
  const [suppliers, setSuppliers] = useState<SupplierSeoRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    fetch('/api/admin/seo/supplier-profiles', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setSuppliers(d.suppliers);
          setSummary(d.summary);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = suppliers.filter(
    s =>
      !q ||
      s.companyName.toLowerCase().includes(q.toLowerCase()) ||
      s.categories.some(c => c.toLowerCase().includes(q.toLowerCase())) ||
      s.products.some(p => p.name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
        Supplier <strong className="text-slate-200">profile</strong> and{' '}
        <strong className="text-slate-200">product pages</strong> SEO inventory. Profiles use{' '}
        <code className="text-slate-500">generateMetadata</code> + JSON-LD. Product URLs:{' '}
        <code className="text-slate-500">/supplier/[id]/products/[slug]</code>. DNA completeness from Company DNA engine.
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Suppliers" value={String(summary.total)} />
          <Stat label="With products" value={String(summary.withProducts)} />
          <Stat label="In sitemap" value={String(summary.indexedProfiles)} />
          <Stat label="Avg SEO score" value={`${summary.avgSeoScore}%`} />
        </div>
      )}

      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search company, category, product…"
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
      />

      {loading ? (
        <p className="text-slate-500 text-sm">Loading…</p>
      ) : (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-slate-700">
                <th className="text-left p-3">Company</th>
                <th className="text-left p-3">Categories</th>
                <th className="text-left p-3">Products</th>
                <th className="text-left p-3">SEO</th>
                <th className="text-left p-3">DNA</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-slate-800/60">
                  <td className="p-3">
                    <p className="text-slate-200 font-medium">{s.companyName}</p>
                    <p className="text-slate-500 text-xs">{s.location ?? '—'}</p>
                  </td>
                  <td className="p-3 text-slate-400 text-xs max-w-[140px] truncate">
                    {s.categories.join(', ') || '—'}
                  </td>
                  <td className="p-3 text-slate-400 text-xs">
                    {s.productCount === 0 ? '—' : `${s.productCount} page(s)`}
                  </td>
                  <td className="p-3">
                    <span className={s.seoScore >= 80 ? 'text-emerald-400' : s.seoScore >= 40 ? 'text-amber-400' : 'text-red-400'}>
                      {s.seoScore}%
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-xs">
                    {s.dnaCompleteness != null ? `${Math.round(s.dnaCompleteness)}%` : '—'}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <a href={s.profileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 text-xs">
                        Profile ↗
                      </a>
                      <Link href={`/admin/seo/on-page?url=${encodeURIComponent(`/supplier/${s.id}`)}`} className="text-slate-500 text-xs hover:text-white">
                        On-page
                      </Link>
                      <Link href={`/admin/company-dna`} className="text-slate-500 text-xs hover:text-white">
                        DNA
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
      <p className="text-slate-500 text-xs">{label}</p>
      <p className="text-xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}
