import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'VyaparSethu vs IndiaMART — Which Is Better for B2B Sourcing in India?',
  description: 'Detailed comparison of VyaparSethu and IndiaMART for B2B sourcing in India. See how Protected Payment, verified suppliers, and Trade Confidence Score set VyaparSethu apart.',
  keywords: ['VyaparSethu vs IndiaMART', 'IndiaMART alternative India', 'B2B sourcing India comparison', 'protected payment B2B India', 'best B2B marketplace India 2026'],
  openGraph: {
    title: 'VyaparSethu vs IndiaMART — B2B Sourcing Comparison 2026',
    description: 'See how VyaparSethu compares to IndiaMART on payment safety, supplier verification, and trade speed.',
    url: 'https://www.vyaparsethu.com/compare/vyaparsethu-vs-indiamart',
    siteName: 'VyaparSethu',
  },
  alternates: { canonical: 'https://www.vyaparsethu.com/compare/vyaparsethu-vs-indiamart' },
};

const ROWS = [
  { feature: 'Primary Purpose', us: 'Deal completion — post Requirement → get quotes → pay safely', them: 'Supplier discovery directory' },
  { feature: 'Payment Protection', us: 'Protected Payment (escrow via Razorpay nodal) — funds release only on delivery confirmation', them: 'No payment protection — buyer pays supplier directly' },
  { feature: 'Supplier Verification', us: '3-layer: GSTIN active check + Udyam + phone OTP manual review', them: 'Self-declared — basic GSTIN listed but not verified' },
  { feature: 'Trade Confidence Score', us: 'Trade Confidence Score™ (0–100): payment history, delivery, response time, dispute rate', them: 'Trust Stamp based on self-certification and reviews (unverified)' },
  { feature: 'Quotation Process', us: 'Post Requirement → 3+ verified suppliers quote within 24h', them: 'Contact supplier → negotiate offline → no platform visibility' },
  { feature: 'Voice / AI Requirement', us: 'Speak Requirement in Hindi/English — AI extracts specs in 3 seconds', them: 'Text form only' },
  { feature: 'Dispute Resolution', us: 'Built-in dispute escalation, escrow held until resolved', them: 'No dispute mechanism — resolve directly with supplier' },
  { feature: 'Listing Cost for Suppliers', us: 'Free Verified Supplier profile; Pro tier for unlimited quotes', them: '₹30,000–₹80,000/year mandatory listing package' },
  { feature: 'Fake Supplier Risk', us: 'Low — GSTIN verified, Udyam verified, manual review', them: 'High — self-declared profiles, easy to fake' },
  { feature: 'Bad Debt Protection', us: 'Mission: Wipe Out Bad Debt — escrow prevents payment defaults', them: 'No protection — all credit risk on buyer' },
  { feature: 'Categories Focus', us: 'Industrial B2B: Metals, Packaging, Chemicals, Machinery, Textiles, Adhesives', them: '50+ categories including retail, gifts, services (broad)' },
  { feature: 'Data Privacy (DPDP 2023)', us: 'Consent logging, PII erasure on request, data minimisation', them: 'Legacy GDPR alignment — DPDP compliance unclear' },
  { feature: 'Speed', us: 'Quotation in 24h · Order in 48h · Settlement in 7 days', them: 'No SLA — depends entirely on supplier responsiveness' },
  { feature: 'Best For', us: 'B2B buyers who want safe, fast sourcing with payment protection', them: 'Browsing and discovering suppliers with no intent to transact on-platform' },
];

export default function ComparisonPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'VyaparSethu vs IndiaMART — B2B Sourcing Comparison 2026',
    description: 'Compare VyaparSethu and IndiaMART on payment safety, supplier verification, and trade speed for Indian B2B sourcing.',
    author: { '@type': 'Organization', name: 'VyaparSethu' },
    publisher: { '@type': 'Organization', name: 'VyaparSethu', url: 'https://www.vyaparsethu.com' },
    url: 'https://www.vyaparsethu.com/compare/vyaparsethu-vs-indiamart',
    datePublished: '2026-06-01',
    dateModified: '2026-06-14',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-5xl mx-auto px-4 py-14">

          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 flex-wrap">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <span className="text-slate-400">Compare</span><span>/</span>
            <span className="text-slate-300">VyaparSethu vs IndiaMART</span>
          </nav>

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 text-xs text-[#D4AF37] font-medium mb-4">
              Updated June 2026
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              VyaparSethu vs IndiaMART<br />
              <span className="text-slate-400 text-2xl font-normal">Which is better for B2B sourcing in India?</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-3xl">
              IndiaMART is India's largest B2B directory. VyaparSethu is India's B2B deal-completion platform.
              They solve different problems — here's the honest comparison.
            </p>
          </div>

          {/* Summary verdict boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
            <div className="bg-[#001f3f] border border-[#D4AF37]/30 rounded-2xl p-7">
              <div className="text-[#D4AF37] font-bold text-lg mb-3">VyaparSethu</div>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">Best for: buyers who want <strong className="text-white">payment-protected, verified-supplier</strong> sourcing with SLA guarantees. You post a Requirement; 3+ suppliers quote; funds only release on delivery.</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> Protected Payment (escrow)</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> GSTIN + Udyam verified suppliers</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> Trade Confidence Score™</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> Speak Requirement in Hindi/English</li>
              </ul>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-7">
              <div className="text-slate-300 font-bold text-lg mb-3">IndiaMART</div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">Best for: <strong className="text-slate-300">discovering</strong> suppliers in niche categories. No payment protection; negotiate and pay offline. Established network of 8M+ suppliers.</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">→</span> Large supplier directory</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> No payment protection</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> Unverified supplier profiles</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span> Suppliers pay ₹30k–80k/year</li>
              </ul>
            </div>
          </div>

          {/* Full comparison table */}
          <h2 className="text-white font-bold text-xl mb-5">Feature-by-Feature Comparison</h2>
          <div className="overflow-x-auto mb-12">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium py-3 pr-4 w-1/4">Feature</th>
                  <th className="text-left text-[#D4AF37] font-semibold py-3 px-4 w-3/8">VyaparSethu</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4 w-3/8">IndiaMART</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr key={i} className={`border-b border-slate-800 ${i % 2 === 0 ? 'bg-slate-800/10' : ''}`}>
                    <td className="py-3.5 pr-4 text-slate-400 font-medium align-top">{row.feature}</td>
                    <td className="py-3.5 px-4 text-slate-300 align-top leading-relaxed">{row.us}</td>
                    <td className="py-3.5 px-4 text-slate-500 align-top leading-relaxed">{row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Positioning note */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 mb-10">
            <h3 className="text-white font-semibold mb-2">The honest take</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              VyaparSethu is not trying to replace IndiaMART as a discovery directory — IndiaMART's network of 8M suppliers is too large to compete with head-on. VyaparSethu fills the gap IndiaMART deliberately leaves: <strong className="text-slate-300">what happens after you find a supplier</strong>. Payment protection, verified trust scores, dispute resolution, and SLA guarantees are the features IndiaMART has never built — because their revenue model depends on suppliers paying listing fees, not on buyers transacting safely.
            </p>
          </div>

          <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-2xl p-8">
            <h2 className="text-white font-bold text-xl mb-3">Try VyaparSethu — Free</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xl">Post a Requirement in 90 seconds. Get 3+ quotes from verified suppliers within 24 hours. Pay only when you're satisfied with delivery.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/rfq/create" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
                Post a Requirement — Free
              </Link>
              <Link href="/faq" className="inline-block border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-6 py-3 rounded-lg text-sm transition-colors">
                Read FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
