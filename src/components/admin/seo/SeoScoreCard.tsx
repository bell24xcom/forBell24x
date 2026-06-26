'use client';

function scoreColor(n: number) {
  if (n >= 90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  if (n >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
  return 'text-red-400 border-red-500/40 bg-red-500/10';
}

export function SeoScoreCard({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  const isNum = typeof value === 'number';
  return (
    <div className={`rounded-xl border p-5 ${isNum ? scoreColor(value) : 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10'}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-2">{label}</p>
      <p className="text-3xl font-black tabular-nums">
        {value}
        {suffix && <span className="text-lg font-semibold ml-0.5">{suffix}</span>}
      </p>
    </div>
  );
}

export function SeoMetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-white font-mono text-sm font-semibold">{value}</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    indexed: 'bg-emerald-500/20 text-emerald-300',
    requested: 'bg-amber-500/20 text-amber-300',
    pending: 'bg-slate-700 text-slate-400',
    'video-only': 'bg-blue-500/20 text-blue-300',
    done: 'bg-emerald-500/20 text-emerald-300',
    optional: 'bg-slate-700 text-slate-500',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${styles[status] ?? 'bg-slate-700 text-slate-400'}`}>
      {status.replace('-', ' ')}
    </span>
  );
}
