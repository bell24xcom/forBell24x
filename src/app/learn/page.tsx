import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Learn B2B Procurement — Guides for Indian SMEs | VyaparSethu',
  description: 'Free B2B procurement guides for Indian SMEs: what is a B2B marketplace, how to find verified suppliers, GST procurement guide, RFQ templates, and more.',
  openGraph: {
    title: 'B2B Procurement Learning Hub | VyaparSethu',
    description: 'Free guides on B2B marketplace, supplier verification, procurement process, and GST compliance for Indian MSMEs.',
    url: `${SITE_URL}/learn`,
    siteName: 'VyaparSethu',
  },
  alternates: { canonical: `${SITE_URL}/learn` },
};

const guides = [
  {
    href: '/learn/what-is-b2b-marketplace',
    title: 'What is a B2B Marketplace?',
    desc: 'B2B marketplace meaning, how it works, difference from B2C, and which platform is right for your Indian business.',
    badge: 'Beginner',
    time: '5 min',
  },
  {
    href: '/learn/how-to-find-verified-b2b-suppliers-india',
    title: 'How to Find Verified B2B Suppliers in India',
    desc: '7-step process: GSTIN verification, Udyam check, sample orders, Protected Payment, and Trade Confidence Score.',
    badge: 'Practical',
    time: '7 min',
  },
  {
    href: '/learn/b2b-procurement-guide-india',
    title: 'B2B Procurement Guide India 2026',
    desc: 'Complete guide: RFQ, MOQ, GST invoicing, credit terms, Protected Payment, supplier verification — all in one place.',
    badge: 'Complete',
    time: '10 min',
  },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
          <span className="text-slate-400">Learn</span>
        </nav>

        <h1 className="text-3xl font-bold text-white mb-3">B2B Procurement Learning Hub</h1>
        <p className="text-slate-400 text-lg max-w-2xl mb-10">
          Free guides for Indian SMEs and procurement managers on verified sourcing, GST compliance, RFQ writing, and safer B2B trade.
        </p>

        <div className="space-y-5">
          {guides.map(g => (
            <Link key={g.href} href={g.href} className="block bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-[#D4AF37]/40 transition-colors group">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-medium text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-full">{g.badge}</span>
                <span className="text-xs text-slate-500">{g.time} read</span>
              </div>
              <h2 className="text-white font-bold text-lg mb-2 group-hover:text-[#D4AF37] transition-colors">{g.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{g.desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-14 bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-8 text-center">
          <h3 className="text-white font-semibold text-lg mb-2">Ready to apply what you&apos;ve learned?</h3>
          <p className="text-slate-400 text-sm mb-5">Post your first Requirement on VyaparSethu. Verified suppliers quote within 24 hours.</p>
          <Link href="/rfq/create" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
            Post a Requirement — Free
          </Link>
        </div>
      </div>
    </div>
  );
}
