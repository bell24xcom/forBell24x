'use client';

import Link from 'next/link';
import { RefreshCw, ArrowLeft } from 'lucide-react';

export function CockpitPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 ${className}`}>{children}</div>
  );
}

export function CockpitSectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">{children}</h2>;
}

export function CockpitShell({
  title,
  subtitle,
  children,
  onRefresh,
  loading,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/cockpit"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Founder Cockpit
          </Link>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <p className="text-slate-400 text-sm">{subtitle}</p>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function CockpitFallback({ message }: { message: string }) {
  return <p className="text-slate-500 text-sm">{message}</p>;
}

export function CockpitError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-900/20 border border-red-700/40 text-red-300 text-sm px-4 py-3 rounded-xl">
      {message}
      {onRetry && (
        <button type="button" onClick={onRetry} className="ml-2 underline">
          Retry
        </button>
      )}
    </div>
  );
}
