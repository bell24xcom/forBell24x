'use client';

import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface DiscoveryPageShellProps {
  title: string;
  subtitle: string;
  backHref?: string;
  loading: boolean;
  error: string;
  onRefresh: () => void;
  children: React.ReactNode;
}

export function DiscoveryPageShell({
  title,
  subtitle,
  backHref = '/admin/discovery',
  loading,
  error,
  onRefresh,
  children,
}: DiscoveryPageShellProps) {
  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={backHref} className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-2">
            <ArrowLeft className="w-4 h-4" /> Discovery Engine
          </Link>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {loading && !children ? (
        <p className="text-slate-500 text-sm">Loading…</p>
      ) : (
        children
      )}
    </div>
  );
}

export function MetricGrid({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((s) => (
        <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-500 text-xs uppercase">{s.label}</p>
          <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][] ;
}) {
  if (rows.length === 0) {
    return <p className="text-slate-500 text-sm">No data yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 text-left border-b border-slate-700">
            {headers.map((h) => (
              <th key={h} className="pb-2 pr-4 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-800 text-slate-300">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
