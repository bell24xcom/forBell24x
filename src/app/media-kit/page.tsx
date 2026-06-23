import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Media Kit — Brand Assets | VyaparSethu',
  description: 'Download VyaparSethu brand assets, logos, and company information for press and editorial use.',
  openGraph: {
    title: 'Media Kit — Brand Assets | VyaparSethu',
    description: 'Brand assets, founder bio, and company fact sheet for VyaparSethu — India\'s verified B2B marketplace.',
    url: `${SITE_URL}/media-kit`,
    siteName: 'VyaparSethu',
  },
  alternates: { canonical: `${SITE_URL}/media-kit` },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Media Kit', item: `${SITE_URL}/media-kit` },
  ],
};

const colors = [
  { name: 'Vyapar Navy', hex: '#0B1F45', use: 'Primary brand color — headings, backgrounds, nav' },
  { name: 'Vyapar Gold', hex: '#D4AF37', use: 'Accent color — CTAs, highlights, icons' },
  { name: 'Vyapar Teal', hex: '#00A7A0', use: 'Secondary accent — links, badges' },
  { name: 'Ivory White', hex: '#F7F5F0', use: 'Body text on dark backgrounds' },
];

export default function MediaKitPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-4 py-16">

          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <Link href="/press" className="hover:text-slate-300">Press</Link><span>/</span>
            <span className="text-slate-400">Media Kit</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">VyaparSethu Media Kit</h1>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed">
            Brand assets, company facts, and founder information for editorial and press use. All information on this page is cleared for publication.
          </p>

          {/* Quick Facts */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-5">Quick Facts</h2>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
              {[
                { label: 'Full Name', value: 'VyaparSethu' },
                { label: 'Tagline', value: 'Verified. Protected. Faster.' },
                { label: 'Founded', value: '2024' },
                { label: 'Founders', value: 'Vishal Pendharkar' },
                { label: 'Headquarters', value: 'Bhiwandi, Maharashtra, India' },
                { label: 'Operating Entity', value: 'Digitex Studio' },
                { label: 'GSTIN', value: '27AAAPP9753F2ZF' },
                { label: 'Category', value: 'B2B Marketplace' },
                { label: 'Primary Market', value: 'Indian MSMEs' },
                { label: 'Coverage', value: 'Pan-India, focus on Mumbai–Bhiwandi–Kalamboli cluster' },
                { label: 'Website', value: 'vyaparsethu.com' },
                { label: 'Press Contact', value: 'contact@vyaparsethu.com' },
              ].map((row, i) => (
                <div key={row.label} className={`flex gap-4 px-5 py-3 ${i % 2 === 0 ? 'bg-slate-800/20' : ''}`}>
                  <span className="text-[#D4AF37] text-xs font-semibold w-36 shrink-0 pt-0.5">{row.label}</span>
                  <span className="text-slate-300 text-sm leading-relaxed">{row.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Brand Colors */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-5">Brand Colors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {colors.map(c => (
                <div key={c.hex} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex gap-4">
                  <div className="w-12 h-12 rounded-lg shrink-0 border border-slate-700" style={{ backgroundColor: c.hex }} />
                  <div>
                    <p className="text-white font-semibold text-sm">{c.name}</p>
                    <p className="text-slate-400 text-xs font-mono mt-0.5">{c.hex}</p>
                    <p className="text-slate-500 text-xs mt-1">{c.use}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-3">
              Typography: Poppins (headings) · Inter (body). Both available via Google Fonts.
            </p>
          </section>

          {/* Founder Bio */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-5">Founder</h2>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-white font-bold text-lg mb-1">Vishal Pendharkar</h3>
              <p className="text-[#D4AF37] text-sm font-medium mb-4">Founder, VyaparSethu · Managing Director, Digitex Studio</p>
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                Vishal Pendharkar is the founder of VyaparSethu and Managing Director of Digitex Studio, based in Bhiwandi, Maharashtra. With a background in fabric sample manufacturing and metal hardware export (Kuwait market), Vishal brings firsthand experience of the challenges Indian MSME suppliers face in finding verified buyers and receiving payments on time.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                VyaparSethu was built to solve the problems he personally encountered in B2B trade — unverified buyer leads, advance payment fraud, and the absence of a trusted intermediary for first-time supplier relationships. The platform launched in 2026, starting with the Bhiwandi industrial cluster where Vishal has direct supplier relationships built over years of personal trading experience.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap gap-4 text-xs text-slate-500">
                <span>Location: Bhiwandi, Maharashtra</span>
                <span>Background: Manufacturing, Export, B2B Trade</span>
              </div>
            </div>
          </section>

          {/* Logo guidance */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-4">Logo Usage</h2>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#0B1F45' }}>
                  <span className="font-bold text-sm" style={{ color: '#D4AF37' }}>V</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-bold text-white">Vyapar</span>
                  <span className="text-2xl font-bold text-blue-400">Sethu</span>
                </div>
              </div>
              <ul className="space-y-1.5 text-slate-400 text-sm">
                <li>✅ Use &ldquo;VyaparSethu&rdquo; (one word, capital V and S) in all editorial references</li>
                <li>✅ Tagline: &ldquo;Verified. Protected. Faster.&rdquo;</li>
                <li>✅ Mission: &ldquo;Wipe Out Bad Debt in Indian B2B Trade&rdquo;</li>
                <li>❌ Do not use &ldquo;Vyapar Sethu&rdquo; (two words) or &ldquo;vyaparsethu&rdquo; (lowercase)</li>
                <li>❌ Do not abbreviate as &ldquo;VS&rdquo; in editorial context</li>
              </ul>
            </div>
          </section>

          {/* Press Contact */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-4">Press Contact</h2>
            <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-6">
              <p className="text-slate-300 text-sm mb-4">For interviews, features, guest contributions, and editorial enquiries:</p>
              <div className="space-y-2 text-sm">
                <p><span className="text-[#D4AF37] font-semibold">Email:</span> <a href="mailto:contact@vyaparsethu.com" className="text-slate-300 hover:text-white">contact@vyaparsethu.com</a></p>
                <p><span className="text-[#D4AF37] font-semibold">Website:</span> <a href="https://www.vyaparsethu.com" className="text-slate-300 hover:text-white">www.vyaparsethu.com</a></p>
                <p><span className="text-[#D4AF37] font-semibold">Press page:</span> <Link href="/press" className="text-slate-300 hover:text-white">www.vyaparsethu.com/press</Link></p>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link href="/press" className="inline-block border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-5 py-2.5 rounded-lg text-sm transition-colors">
              ← Back to Press
            </Link>
            <a href="/downloads/b2b-glossary" target="_blank" rel="noopener noreferrer" className="inline-block border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-5 py-2.5 rounded-lg text-sm transition-colors">
              B2B Glossary (Printable PDF)
            </a>
          </div>

        </div>
      </div>
    </>
  );
}
