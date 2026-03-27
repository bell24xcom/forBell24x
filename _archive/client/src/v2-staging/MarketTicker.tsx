'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Signal = {
  id?: string;
  ts?: string;
  category?: string;
  subcategory?: string;
  location?: string;
  contextText?: string;
  buyerPersona?: string;
  interest?: { temperature?: string; intent?: string };
};

function formatSignal(s: Signal) {
  if (s.contextText) return s.contextText;
  const loc = s.location ? `in ${s.location}` : '';
  const sub = s.subcategory || 'Requirement';
  const cat = s.category || 'Buyer';
  return `Buyer ${loc} seeking ${sub} • ${cat}`.replace(/\s+/g, ' ').trim();
}

export default function MarketTicker() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [status, setStatus] = useState<'loading' | 'live' | 'empty'>('loading');
  const pausedRef = useRef(false);

  useEffect(() => {
    let active = true;
    const fetchNow = async () => {
      try {
        const res = await fetch('/api/market-ticker', { cache: 'no-store' });
        const json = await res.json();
        const next = Array.isArray(json?.signals) ? (json.signals as Signal[]) : [];
        if (!active) return;
        setSignals(next);
        setStatus(next.length ? 'live' : 'empty');
      } catch {
        if (!active) return;
        setSignals([]);
        setStatus('empty');
      }
    };

    fetchNow();
    const t = setInterval(() => {
      if (!pausedRef.current) fetchNow();
    }, 5000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  const items = useMemo(() => {
    const base = signals.length
      ? signals.map((s) => ({ key: s.id || `${s.ts}-${Math.random()}`, text: formatSignal(s) }))
      : [
          { key: 'fallback-1', text: 'Live buyers are entering the marketplace…' },
          { key: 'fallback-2', text: 'Steel RFQs warming up across Mumbai…' },
          { key: 'fallback-3', text: 'Verified suppliers are being shortlisted now…' }
        ];
    // Duplicate list for seamless marquee loop.
    return [...base, ...base];
  }, [signals]);

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/10 bg-[#05070f] shadow-[0_0_0_1px_rgba(34,211,238,0.10),0_0_35px_rgba(16,185,129,0.10)]"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_20%,rgba(34,211,238,0.08),transparent_40%),radial-gradient(1000px_circle_at_90%_10%,rgba(16,185,129,0.08),transparent_45%)]" />

      <div className="relative flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.8)]" />
          <span className="text-xs font-semibold tracking-wider text-emerald-300">LIVE ACTIVITY</span>
        </div>
        <span className="text-[11px] text-cyan-200/70">
          {status === 'live' ? 'Market heat is active' : status === 'loading' ? 'Connecting…' : 'Warming up…'}
        </span>
      </div>

      <div className="relative border-t border-white/10">
        <div className="ticker-track flex w-max items-center gap-10 px-4 py-3">
          {items.map((it, idx) => (
            <div
              key={`${it.key}-${idx}`}
              className="whitespace-nowrap text-sm text-cyan-100/90"
            >
              <span className="mr-3 inline-block h-1.5 w-1.5 rounded-full bg-cyan-300/70 shadow-[0_0_12px_rgba(34,211,238,0.55)]" />
              <span className="font-medium">{it.text}</span>
            </div>
          ))}
        </div>

        <style jsx>{`
          .ticker-track {
            animation: ticker 28s linear infinite;
          }
          @keyframes ticker {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

