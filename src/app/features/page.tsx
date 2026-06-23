import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Features — Voice RFQ, Protected Payment, Verified Suppliers | VyaparSethu',
  description: 'VyaparSethu features: voice-enabled B2B requirement posting in Hindi, GSTIN-verified supplier network, Protected Payment via Razorpay, and Trade Confidence Score.',
  openGraph: { title: 'VyaparSethu Features', url: `${SITE_URL}/features`, siteName: 'VyaparSethu' },
  alternates: { canonical: `${SITE_URL}/features` },
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
          <span className="text-slate-400">Features</span>
        </nav>
        <h1 className="text-3xl font-bold text-white mb-3">Platform Features</h1>
        <p className="text-slate-400 text-lg mb-10">Everything that makes VyaparSethu different from a supplier directory.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { href: '/features/voice-rfq', icon: '🎤', title: 'Speak Requirement', desc: 'Post B2B requirements by speaking in Hindi or English. AI structures it in 90 seconds.' },
            { href: '/features/regional-languages', icon: '🌐', title: 'Hindi & Regional Languages', desc: 'First B2B platform designed for Tier 2/3 city SMEs who operate in their regional language.' },
            { href: '/marketplace', icon: '🏪', title: 'Verified Marketplace', desc: 'Browse active Requirements from verified buyers. Submit quotes. Win new business.' },
            { href: '/glossary', icon: '📖', title: 'B2B Glossary', desc: 'Plain-language definitions of RFQ, MOQ, FOB, GST, Udyam, and 50+ B2B terms.' },
          ].map(f => (
            <Link key={f.href} href={f.href} className="group bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-[#D4AF37]/40 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h2 className="text-white font-bold mb-2 group-hover:text-[#D4AF37] transition-colors">{f.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
