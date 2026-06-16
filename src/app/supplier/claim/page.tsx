import { Metadata } from 'next';
import Link from 'next/link';
import SupplierClaimClient from './SupplierClaimClient';

export const metadata: Metadata = {
  title: 'Claim Your Free Supplier Profile — VyaparSethu',
  description: 'Join India\'s verified B2B Trade Network. Claim your free supplier profile on VyaparSethu and start receiving buyer quotation requests in your category within 24 hours.',
  alternates: { canonical: 'https://www.vyaparsethu.com/supplier/claim' },
};

export default function SupplierClaimPage({
  searchParams,
}: {
  searchParams: { category?: string; city?: string; token?: string };
}) {
  const { category, city, token } = searchParams;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-5xl mx-auto px-4 py-14">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: value prop */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 text-xs text-[#D4AF37] font-medium mb-6">
              Free — No listing fee
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
              Claim Your Free<br />Verified Supplier Profile
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              {category && city
                ? `Active buyers in ${city} are looking for ${category} suppliers right now. Get quoted — free.`
                : 'Verified Suppliers on VyaparSethu receive buyer Requirement alerts in their category, every day.'}
            </p>

            <div className="space-y-4 mb-10">
              {[
                { icon: '✅', title: 'Verified Badge', sub: 'GSTIN + Udyam verified — buyers trust you instantly' },
                { icon: '📋', title: 'Requirement Alerts', sub: 'WhatsApp notification when a buyer needs your products' },
                { icon: '🔒', title: 'Protected Payment', sub: 'Funds held in escrow — released when buyer confirms delivery' },
                { icon: '⭐', title: 'Trade Confidence Score', sub: 'Build your reputation — ranked higher with every deal' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4">
                  <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="text-white font-medium text-sm">{item.title}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-5">
              <p className="text-slate-400 text-xs leading-relaxed">
                <strong className="text-slate-300">Formerly Bell24h.</strong> VyaparSethu is India's B2B Trade Network — Verified Matching · Protected Payment · Faster Trade.
                {' '}<Link href="/compare/vyaparsethu-vs-indiamart" className="text-[#D4AF37] underline">How we compare to IndiaMART →</Link>
              </p>
            </div>
          </div>

          {/* Right: claim form */}
          <div>
            <SupplierClaimClient category={category} city={city} claimToken={token} />
          </div>
        </div>
      </div>
    </div>
  );
}
