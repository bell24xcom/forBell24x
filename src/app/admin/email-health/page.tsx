'use client';

export default function EmailHealthPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white">📧 Email DNS Checklist</h1>
        <p className="text-slate-400 text-sm mt-1">
          Add these DNS records in Cloudflare before clicking "Verify Domain" in Brevo.
          FROM address: <code className="text-blue-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">noreply@bell24h.com</code>
        </p>
      </div>

      {/* Main DNS card */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 space-y-5">
        <h2 className="text-white font-semibold text-base">
          EMAIL DOMAIN HEALTH — bell24h.com
        </h2>
        <p className="text-slate-400 text-sm">Add these records in Cloudflare (or your DNS provider):</p>

        {/* SPF */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/40 px-2 py-0.5 rounded">TXT</span>
            <span className="text-white font-semibold text-sm">SPF — record on @ (root domain)</span>
          </div>
          <code className="block text-green-300 text-sm bg-slate-950/60 border border-slate-700/40 rounded px-3 py-2 font-mono select-all">
            v=spf1 include:spf.brevo.com mx ~all
          </code>
        </div>

        {/* DKIM */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold bg-purple-900/60 text-purple-300 border border-purple-700/40 px-2 py-0.5 rounded">TXT</span>
            <span className="text-white font-semibold text-sm">DKIM — get value from Brevo dashboard</span>
          </div>
          <ol className="text-slate-300 text-sm space-y-1 list-decimal list-inside mb-3">
            <li>Brevo Dashboard → Senders &amp; IP → Domains</li>
            <li>Click <strong className="text-white">"Authenticate your domain"</strong></li>
            <li>Copy the DKIM TXT record (hostname + value)</li>
            <li>Paste into Cloudflare DNS (name: <code className="text-blue-300 bg-slate-800 px-1 rounded text-xs">mail._domainkey</code>)</li>
          </ol>
          <p className="text-slate-500 text-xs">Note: DKIM value is unique per Brevo account — cannot be pre-filled here.</p>
        </div>

        {/* DMARC */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold bg-orange-900/60 text-orange-300 border border-orange-700/40 px-2 py-0.5 rounded">TXT</span>
            <span className="text-white font-semibold text-sm">DMARC — record on _dmarc subdomain</span>
          </div>
          <code className="block text-green-300 text-sm bg-slate-950/60 border border-slate-700/40 rounded px-3 py-2 font-mono select-all">
            v=DMARC1; p=none; rua=mailto:hello@bell24h.com
          </code>
        </div>

        {/* Final step */}
        <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-lg p-4">
          <p className="text-emerald-300 font-semibold text-sm mb-1">After adding all 3 records:</p>
          <p className="text-slate-300 text-sm">
            Go to <strong className="text-white">Brevo → Senders &amp; IP → Domains</strong> → click <strong className="text-white">"Verify Domain"</strong>.
            DNS propagation takes up to 24 hours.
          </p>
        </div>
      </div>

      {/* Manual checklist */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Verification Checklist (tick manually)</h3>
        <div className="space-y-2.5">
          {[
            'SPF TXT record added on @ in Cloudflare',
            'DKIM TXT record added on mail._domainkey in Cloudflare',
            'DMARC TXT record added on _dmarc in Cloudflare',
            'Brevo → "Verify Domain" button clicked',
            'Test email sent from noreply@bell24h.com and received — not in spam',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-slate-300 text-sm">
              <span className="text-slate-600 mt-0.5 shrink-0 font-mono">☐</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Why this matters:</strong> Without SPF + DKIM + DMARC, Brevo emails from bell24h.com land in spam.
        DNS changes must be made by Vishal manually in Cloudflare — this page is informational only.
      </div>
    </div>
  );
}
