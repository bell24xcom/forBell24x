import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Press & Media — VyaparSethu | India\'s Verified B2B Marketplace',
  description: 'Press releases, media kit, and news about VyaparSethu — India\'s verified B2B marketplace for MSME buyers and suppliers.',
  openGraph: {
    title: 'Press & Media | VyaparSethu',
    description: 'Press releases, media kit, and news about VyaparSethu — India\'s verified B2B marketplace.',
    url: `${SITE_URL}/press`,
    siteName: 'VyaparSethu',
  },
  alternates: { canonical: `${SITE_URL}/press` },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Press', item: `${SITE_URL}/press` },
  ],
};

const newsArticleLd = {
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  headline: "VyaparSethu Launches India's First GST-Verified B2B Marketplace for the Mumbai-Bhiwandi Industrial Cluster",
  description: "VyaparSethu today announced the launch of its verified B2B marketplace connecting MSME buyers and suppliers across the Mumbai-Kalamboli-Bhiwandi industrial cluster.",
  datePublished: '2026-06-01',
  dateModified: '2026-06-01',
  author: { '@type': 'Person', name: 'Vishal Pendharkar' },
  publisher: {
    '@type': 'Organization',
    name: 'VyaparSethu',
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.png` },
  },
  mainEntityOfPage: `${SITE_URL}/press`,
  image: `${SITE_URL}/og-image.png`,
};

export default function PressPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleLd) }} />
      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-4 py-16">

          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <span className="text-slate-400">Press</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">VyaparSethu in the Press</h1>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed">
            Press releases, media resources, and news about VyaparSethu — India&apos;s verified B2B marketplace for MSME buyers and suppliers.
          </p>

          {/* About section */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-5">About VyaparSethu — For Journalists</h2>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 mb-5">
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                VyaparSethu is India&apos;s verified B2B marketplace connecting MSME buyers and suppliers with GST-verified profiles and Razorpay-protected payments. Founded in 2024 and headquartered in Bhiwandi, Maharashtra, VyaparSethu serves the Mumbai–Kalamboli–Bhiwandi industrial cluster — one of India&apos;s largest MSME manufacturing hubs.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Founded', value: '2024' },
                  { label: 'Headquarters', value: 'Lodha Upper Thane, Bhiwandi, Thane 421302, Maharashtra' },
                  { label: 'Category', value: 'B2B Marketplace, MSME, Procurement' },
                  { label: 'Focus', value: 'Steel & Metals, Chemicals, Packaging, Industrial Supplies' },
                  { label: 'Payment', value: 'Razorpay-protected transactions' },
                  { label: 'Verification', value: 'GST + Udyam verified suppliers only' },
                ].map(item => (
                  <div key={item.label} className="flex gap-2">
                    <span className="text-[#D4AF37] text-xs font-semibold w-28 shrink-0">{item.label}</span>
                    <span className="text-slate-300 text-xs leading-relaxed">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Press release */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-2">Our Launch</h2>
            <p className="text-slate-500 text-xs mb-5 uppercase tracking-wider">Press Release — June 2026</p>

            <div className="border-l-2 border-[#D4AF37] pl-6 space-y-4">
              <h3 className="text-white font-bold text-lg leading-snug">
                VyaparSethu Launches India&apos;s First GST-Verified B2B Marketplace for the Mumbai–Bhiwandi Industrial Cluster
              </h3>

              <p className="text-slate-500 text-sm font-medium">Bhiwandi, Maharashtra — June 2026</p>

              <p className="text-slate-300 text-sm leading-relaxed">
                VyaparSethu today announced the launch of its verified B2B marketplace connecting MSME buyers and suppliers across the Mumbai–Kalamboli–Bhiwandi industrial cluster. Unlike existing B2B directories that allow self-reported listings, VyaparSethu verifies every supplier&apos;s GST registration and Udyam number before their profile goes live.
              </p>

              <p className="text-slate-300 text-sm leading-relaxed">
                The platform addresses a critical gap in Indian B2B trade: payment fraud and unverified supplier listings that cost MSME buyers an estimated ₹1,400 crore annually in bad debts and advance payment losses. VyaparSethu&apos;s Razorpay-protected payment system holds funds in trust until the buyer confirms delivery, eliminating advance payment risk for first-time supplier relationships.
              </p>

              <blockquote className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-lg p-4">
                <p className="text-white text-sm leading-relaxed italic">
                  &ldquo;Indian MSMEs deserve the same protection that large enterprises get from their procurement teams. We are starting with the Bhiwandi cluster because this is where we know the suppliers personally, and trust is built person to person before it scales to technology.&rdquo;
                </p>
                <footer className="mt-2 text-[#D4AF37] text-xs font-semibold">
                  — Vishal Pendharkar, Founder, VyaparSethu
                </footer>
              </blockquote>

              <p className="text-slate-300 text-sm leading-relaxed">
                VyaparSethu is currently onboarding verified suppliers in Steel & Metals, Industrial Chemicals, Packaging Materials, and Pipes & Irrigation Equipment categories.
              </p>

              <p className="text-slate-400 text-sm">
                <span className="font-semibold text-slate-300">Press enquiries:</span>{' '}
                <a href="mailto:contact@vyaparsethu.com" className="text-[#D4AF37] hover:underline">contact@vyaparsethu.com</a>
              </p>
            </div>
          </section>

          {/* Media kit CTA */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-4">Download Media Kit</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Download our brand assets, founder bio, and company fact sheet for editorial use.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/media-kit" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
                View Media Kit →
              </Link>
              <a href="/downloads/b2b-glossary" target="_blank" rel="noopener noreferrer" className="inline-block border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-6 py-3 rounded-lg text-sm transition-colors">
                B2B Glossary (Printable)
              </a>
            </div>
          </section>

          {/* Contact */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-3">Press Contact</h3>
            <p className="text-slate-400 text-sm mb-1">For interviews, features, and editorial enquiries:</p>
            <p className="text-slate-300 text-sm">
              <a href="mailto:contact@vyaparsethu.com" className="text-[#D4AF37] hover:underline">contact@vyaparsethu.com</a>
            </p>
            <p className="text-slate-500 text-xs mt-2">VyaparSethu · Operated by Digitex Studio · Bhiwandi, Maharashtra 421302</p>
          </div>

        </div>
      </div>
    </>
  );
}
