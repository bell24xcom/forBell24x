import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'What is a B2B Marketplace? Complete Guide for Indian Businesses',
  description: 'A B2B marketplace connects verified buyers and suppliers for bulk orders, competitive quotes, and protected payments. Learn how B2B marketplaces work, how they differ from B2C, and which platform is right for your Indian business.',
  keywords: ['what is b2b marketplace', 'b2b marketplace india', 'b2b marketplace meaning', 'b2b portal india', 'b2b buying platform india'],
  openGraph: {
    title: 'What is a B2B Marketplace? | VyaparSethu',
    description: 'A B2B marketplace connects verified buyers and suppliers for bulk orders, competitive quotes, and protected payments.',
    url: `${SITE_URL}/learn/what-is-b2b-marketplace`,
    siteName: 'VyaparSethu',
  },
  alternates: { canonical: `${SITE_URL}/learn/what-is-b2b-marketplace` },
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a B2B marketplace?',
      acceptedAnswer: { '@type': 'Answer', text: 'A B2B (Business-to-Business) marketplace is an online platform that connects buyers and suppliers who are both businesses — not individual consumers. B2B marketplaces facilitate bulk orders, competitive quoting, verified supplier profiles, and business-to-business payment terms like Net 30 or protected escrow-style payments.' },
    },
    {
      '@type': 'Question',
      name: 'How is a B2B marketplace different from a B2C marketplace?',
      acceptedAnswer: { '@type': 'Answer', text: 'B2C marketplaces (Amazon, Flipkart) sell products from businesses to individual consumers, usually with fixed prices and small quantities. B2B marketplaces handle bulk orders, negotiated pricing, credit terms, GST-compliant invoicing, and supplier verification — things individual consumers do not need.' },
    },
    {
      '@type': 'Question',
      name: 'Which is the best B2B marketplace in India?',
      acceptedAnswer: { '@type': 'Answer', text: 'VyaparSethu is India\'s only B2B marketplace with mandatory GSTIN supplier verification and Protected Payment for every transaction. IndiaMART is the largest by listing count. Amazon Business is best for catalogue products. For large, first-time orders with unknown suppliers, VyaparSethu\'s verification and payment protection provide the most safety.' },
    },
    {
      '@type': 'Question',
      name: 'Is a B2B marketplace free to use?',
      acceptedAnswer: { '@type': 'Answer', text: 'For buyers, most B2B marketplaces including VyaparSethu are free to use — browsing, posting requirements, and receiving quotes costs nothing. Suppliers on some platforms pay for premium listings. VyaparSethu charges suppliers nothing during its launch phase.' },
    },
    {
      '@type': 'Question',
      name: 'How does payment protection work on a B2B marketplace?',
      acceptedAnswer: { '@type': 'Answer', text: 'On VyaparSethu, buyer funds are held in a Razorpay-regulated nodal account when a deal is confirmed. The supplier delivers the goods. The buyer confirms receipt. Only then are funds released to the supplier. This eliminates advance payment fraud — the most common B2B financial risk in India.' },
    },
  ],
};

export default function WhatIsB2BMarketplacePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-4 py-16">

          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <Link href="/learn" className="hover:text-slate-300">Learn</Link><span>/</span>
            <span className="text-slate-400">What is a B2B Marketplace</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 text-xs text-[#D4AF37] font-medium mb-4">
            Beginner Guide
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug">
            What is a B2B Marketplace?
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            A B2B marketplace connects verified businesses — buyers and suppliers — for bulk orders, competitive quotes, and business-grade payments. It is different from a consumer marketplace in every important way.
          </p>

          <div className="space-y-8">

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Definition</h2>
              <p className="text-slate-400 leading-relaxed mb-3">
                A <strong className="text-white">B2B marketplace</strong> (Business-to-Business marketplace) is an online platform where businesses buy from and sell to other businesses — not individual consumers.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Key characteristics of a B2B marketplace:
              </p>
              <ul className="mt-3 space-y-2 text-slate-400 text-sm list-disc list-inside">
                <li>Both buyers and sellers are registered businesses (GST-registered in India)</li>
                <li>Orders are typically bulk quantities with negotiated pricing</li>
                <li>Payment terms include credit periods (Net 30, Net 60) and advance/escrow arrangements</li>
                <li>Invoices are GST-compliant B2B tax invoices for Input Tax Credit claims</li>
                <li>Supplier verification is critical — fake suppliers cost buyers crores annually</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">B2B vs B2C: Key Differences</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-[#D4AF37] text-xs uppercase tracking-wider py-2 pr-6">Dimension</th>
                      <th className="text-left text-[#D4AF37] text-xs uppercase tracking-wider py-2 pr-6">B2B Marketplace</th>
                      <th className="text-left text-[#D4AF37] text-xs uppercase tracking-wider py-2">B2C Marketplace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {[
                      ['Buyer type', 'Registered businesses', 'Individual consumers'],
                      ['Order size', 'Bulk (100 units to 100 MT)', 'Single units'],
                      ['Pricing', 'Negotiated / quote-based', 'Fixed catalogue price'],
                      ['Payment', 'Net 30/60, protected advance', 'Instant payment'],
                      ['Invoice', 'GST B2B tax invoice', 'Consumer receipt'],
                      ['Verification', 'Supplier GSTIN verification', 'Seller onboarding'],
                      ['Examples', 'VyaparSethu, IndiaMART', 'Amazon, Flipkart'],
                    ].map(([dim, b2b, b2c]) => (
                      <tr key={dim}>
                        <td className="text-white font-medium text-xs py-2.5 pr-6">{dim}</td>
                        <td className="text-slate-300 text-xs py-2.5 pr-6">{b2b}</td>
                        <td className="text-slate-400 text-xs py-2.5">{b2c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">How a B2B Marketplace Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { step: '1', title: 'Buyer posts a Requirement', desc: 'Specify product, quantity, delivery location, and timeline. On VyaparSethu, post by voice, video, or text in 90 seconds.' },
                  { step: '2', title: 'Verified suppliers quote', desc: 'GST-verified suppliers submit competitive quotes with price, MOQ, lead time, and payment terms.' },
                  { step: '3', title: 'Buyer accepts and pays safely', desc: 'Buyer selects the best quote. Protected Payment holds funds until delivery is confirmed — no advance fraud.' },
                ].map(item => (
                  <div key={item.step} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                    <div className="w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#001f3f] font-bold text-sm mb-3">{item.step}</div>
                    <h3 className="text-white font-semibold text-sm mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Why Supplier Verification Matters</h2>
              <p className="text-slate-400 leading-relaxed mb-3">
                In India, advance payment fraud is the #1 risk in B2B procurement. A buyer sends 30–50% advance, the supplier vanishes or delivers substandard goods. This happens because most platforms allow self-reported supplier profiles — anyone can create a listing.
              </p>
              <p className="text-slate-400 leading-relaxed">
                VyaparSethu requires mandatory GSTIN verification for every supplier. GSTIN is cross-checked against the government GST database — you cannot fake an active GSTIN. This means every supplier on VyaparSethu is a real, registered business.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Types of B2B Marketplaces in India</h2>
              <div className="space-y-3">
                {[
                  { type: 'General B2B directory', desc: 'IndiaMART, TradeIndia — large listings, minimal verification, no payment protection', suitable: 'Discovery / long-listing' },
                  { type: 'Verified trade platform', desc: 'VyaparSethu — GSTIN-verified suppliers, protected payment, competitive quoting', suitable: 'First-time large orders' },
                  { type: 'Wholesale marketplace', desc: 'Udaan, Flipkart Wholesale — catalogue-based, verified sellers, trade credit available', suitable: 'FMCG / retail replenishment' },
                  { type: 'Catalogue marketplace', desc: 'Amazon Business — fast delivery, GST invoices, fixed prices', suitable: 'Standard catalogue items' },
                ].map(item => (
                  <div key={item.type} className="flex gap-4 bg-slate-800/30 border border-slate-700/40 rounded-lg p-4">
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{item.type}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
                    </div>
                    <div className="text-xs text-[#D4AF37] font-medium whitespace-nowrap">{item.suitable}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-5">Frequently Asked Questions</h2>
              <div className="space-y-5">
                {faqLd.mainEntity.map(item => (
                  <div key={item.name} className="border-b border-slate-800 pb-5">
                    <h3 className="text-white font-semibold text-sm mb-2">{item.name}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.acceptedAnswer.text}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          <div className="mt-12 bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-8">
            <h3 className="text-white font-semibold text-lg mb-2">Try VyaparSethu — India&apos;s Verified B2B Marketplace</h3>
            <p className="text-slate-400 text-sm mb-5">Post your first Requirement in 90 seconds. Verified suppliers quote within 24 hours. Protected Payment on every deal.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/rfq/create" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
                Post a Requirement — Free
              </Link>
              <Link href="/categories" className="inline-block border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-6 py-3 rounded-lg text-sm transition-colors">
                Browse Categories
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
