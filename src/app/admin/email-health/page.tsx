'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

interface DnsRecord {
  status: 'ok' | 'missing';
  value: string | null;
  lookup: string;
  selector?: string;
}

interface EmailHealth {
  domain: string;
  checkedAt: string;
  allOk: boolean;
  records: { spf: DnsRecord; dkim: DnsRecord; dmarc: DnsRecord };
  recommendations: string[];
}

function RecordRow({ label, rec, color }: { label: string; rec: DnsRecord; color: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${color}`}>{label}</span>
        {rec.status === 'ok'
          ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          : <XCircle className="w-4 h-4 text-red-400" />}
        <span className={`text-xs font-medium ${rec.status === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
          {rec.status === 'ok' ? 'Found' : 'Missing'}
        </span>
        <span className="text-slate-500 text-xs ml-auto">{rec.lookup}</span>
      </div>
      {rec.value ? (
        <code className="block text-green-300 text-sm bg-slate-950/60 border border-slate-700/40 rounded px-3 py-2 font-mono break-all">
          {rec.value}
        </code>
      ) : (
        <p className="text-slate-500 text-sm italic">No record found — DNS may not be set or still propagating.</p>
      )}
    </div>
  );
}

export default function EmailHealthPage() {
  const [data,    setData]    = useState<EmailHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchHealth = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/admin/email-health');
      const json = await res.json();
      if (res.ok) setData(json);
      else setError(json.message || json.error || 'Failed to check DNS');
    } catch {
      setError('Network error — could not reach DNS checker');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Email DNS Health</h1>
          <p className="text-slate-400 text-sm mt-1">
            Live DNS check for <code className="text-blue-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">noreply@bell24h.com</code> — SPF, DKIM, DMARC
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 text-sm transition-colors shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Recheck
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {loading && !data && (
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {data && (
        <>
          {/* Overall status */}
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${data.allOk ? 'bg-emerald-900/20 border-emerald-700/40' : 'bg-amber-900/20 border-amber-600/40'}`}>
            {data.allOk
              ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              : <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
            <div>
              <p className={`font-semibold text-sm ${data.allOk ? 'text-emerald-300' : 'text-amber-300'}`}>
                {data.allOk ? 'All DNS records verified — email auth is correctly configured.' : 'Some DNS records are missing.'}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                {data.domain} · checked {new Date(data.checkedAt).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* DNS Record Cards */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 space-y-5">
            <h2 className="text-white font-semibold">DNS Records — {data.domain}</h2>
            <RecordRow label="SPF"   rec={data.records.spf}   color="bg-blue-900/60 text-blue-300 border-blue-700/40" />
            <RecordRow label="DKIM"  rec={data.records.dkim}  color="bg-purple-900/60 text-purple-300 border-purple-700/40" />
            <RecordRow label="DMARC" rec={data.records.dmarc} color="bg-orange-900/60 text-orange-300 border-orange-700/40" />
          </div>

          {/* Recommendations */}
          {data.recommendations.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">Action Required</h3>
              <div className="space-y-2">
                {data.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-4">
                After adding records in Cloudflare, go to <strong className="text-slate-400">Brevo → Senders &amp; IP → Domains → Verify Domain</strong>.
                DNS propagation takes up to 24 hours.
              </p>
            </div>
          )}

          {/* Checklist */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Verification Checklist</h3>
            <div className="space-y-2.5">
              {[
                { label: 'SPF TXT record added on @ in Cloudflare',                     ok: data.records.spf.status   === 'ok' },
                { label: 'DKIM CNAME records added on brevo1._domainkey and brevo2._domainkey in Cloudflare', ok: data.records.dkim.status === 'ok' },
                { label: 'DMARC TXT record added on _dmarc in Cloudflare',              ok: data.records.dmarc.status === 'ok' },
                { label: 'Brevo → "Verify Domain" button clicked',                      ok: false },
                { label: 'Test email sent from noreply@bell24h.com — not in spam',      ok: false },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                  {item.ok
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    : <span className="text-slate-600 mt-0.5 shrink-0 font-mono">☐</span>}
                  <span className={item.ok ? 'text-slate-200' : ''}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Why this matters:</strong> Without SPF + DKIM + DMARC, emails from bell24h.com land in spam.
        DNS changes must be made by Vishal manually in Cloudflare.
      </div>
    </div>
  );
}
