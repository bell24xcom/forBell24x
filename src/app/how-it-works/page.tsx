import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'How VyaparSethu Works — Verified B2B Trade India',
  description: 'Learn how VyaparSethu connects verified MSME buyers and suppliers with GST-verified profiles, Razorpay-protected payments, and 24-hour quotations. Free for buyers.',
  openGraph: {
    title: 'How VyaparSethu Works — Verified B2B Trade India',
    description: 'GST-verified suppliers, Razorpay-protected payments, 24-hour quotations. Free for buyers.',
    url: `${SITE_URL}/how-it-works`,
    siteName: 'VyaparSethu',
  },
  alternates: { canonical: `${SITE_URL}/how-it-works` },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'How It Works', item: `${SITE_URL}/how-it-works` },
  ],
};

const howToBuyerLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to buy on VyaparSethu as a buyer',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Post Your Requirement', text: 'Write what you need — product, quantity, delivery location, and timeline.' },
    { '@type': 'HowToStep', position: 2, name: 'Verified Suppliers Respond', text: 'Only GST-verified, Udyam-registered suppliers in your category receive your Requirement.' },
    { '@type': 'HowToStep', position: 3, name: 'Compare Quotations', text: 'Receive quotations from multiple verified suppliers. Compare price, lead time, MOQ, and payment terms.' },
    { '@type': 'HowToStep', position: 4, name: 'Pay via Razorpay', text: 'Funds are held in an RBI-regulated nodal account — not with VyaparSethu, not with the supplier.' },
    { '@type': 'HowToStep', position: 5, name: 'Confirm Delivery', text: 'When goods arrive, confirm delivery on VyaparSethu. Razorpay releases payment to the supplier.' },
  ],
};

const howToSupplierLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to sell on VyaparSethu as a supplier',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Create Verified Profile', text: 'Register with your GSTIN and Udyam number. Verified against government portals in real time.' },
    { '@type': 'HowToStep', position: 2, name: 'Receive Real Buyer Requirements', text: 'Get notified on WhatsApp when a verified buyer posts a Requirement matching your products.' },
    { '@type': 'HowToStep', position: 3, name: 'Submit Your Quotation', text: 'Respond with your price, lead time, MOQ, and terms.' },
    { '@type': 'HowToStep', position: 4, name: 'Win the Order', text: 'Buyers compare quotations and select the best offer. Payment is secured before you ship.' },
    { '@type': 'HowToStep', position: 5, name: 'Deliver and Get Paid', text: 'Ship the goods. Buyer confirms delivery. Razorpay releases your payment automatically.' },
  ],
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is VyaparSethu free for buyers?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Buyers can post Requirements, receive quotations, and use all platform features at no cost. There are no hidden charges or lead pack fees.' },
    },
    {
      '@type': 'Question',
      name: 'How is VyaparSethu different from IndiaMART?',
      acceptedAnswer: { '@type': 'Answer', text: 'VyaparSethu verifies every supplier\'s GST and Udyam registration before listing, uses Razorpay-protected payments so your money is safe until delivery, and never resells your Requirement to multiple suppliers simultaneously.' },
    },
    {
      '@type': 'Question',
      name: 'What is Trade Confidence Score?',
      acceptedAnswer: { '@type': 'Answer', text: 'A trust rating calculated from payment history (30%), on-time delivery (20%), response speed (15%), repeat orders (15%), dispute rate (10%), and verification strength (10%). It updates with every transaction.' },
    },
    {
      '@type': 'Question',
      name: 'How long does supplier verification take?',
      acceptedAnswer: { '@type': 'Answer', text: 'GST and Udyam verification is done against government portals in real time. Profile review by our team takes 24-48 hours.' },
    },
    {
      '@type': 'Question',
      name: 'Is my payment safe with VyaparSethu?',
      acceptedAnswer: { '@type': 'Answer', text: 'VyaparSethu never holds your funds. All payments are processed and held by Razorpay in an RBI-regulated nodal account until delivery is confirmed.' },
    },
  ],
};

const buyerSteps = [
  { n: '1', title: 'Post Your Requirement — 2 Minutes', body: 'Write what you need — product, quantity, delivery location, and timeline. Use text to describe your Requirement. Our system matches you to verified suppliers automatically. Speak Requirement (voice input) is coming soon.' },
  { n: '2', title: 'Verified Suppliers Respond — 24 Hours', body: 'Only GST-verified, Udyam-registered suppliers in your category receive your Requirement. No spam. No fake brokers. No lead reselling to multiple competitors.' },
  { n: '3', title: 'Compare Quotations Side by Side', body: 'Receive quotations from multiple verified suppliers. Compare price, lead time, MOQ, and payment terms. Filter by Trade Confidence Score, location, and buyer ratings.' },
  { n: '4', title: 'Pay via Razorpay — Funds Held Safely', body: 'Deposit payment via Razorpay. Funds are held in an RBI-regulated nodal account — not with VyaparSethu, not with the supplier. You never lose money to advance payment fraud.' },
  { n: '5', title: 'Confirm Delivery — Supplier Gets Paid', body: 'When goods arrive, confirm delivery on VyaparSethu. Razorpay releases payment to the supplier within 1-2 working days. Both parties receive permanent transaction records for GST compliance.' },
];

const supplierSteps = [
  { n: '1', title: 'Create Your Verified Profile — 5 Minutes', body: 'Register with your GSTIN and Udyam number. Verified against government portals in real time. Our team reviews your catalogue before your profile goes live.' },
  { n: '2', title: 'Receive Real Buyer Requirements', body: 'Get notified on WhatsApp when a verified buyer posts a Requirement matching your products. Only real, GST-registered businesses.' },
  { n: '3', title: 'Submit Your Quotation', body: 'Respond with your price, lead time, MOQ, and terms. Your Trade Confidence Score improves with every timely quotation and successful delivery.' },
  { n: '4', title: 'Win the Order', body: 'Buyers compare quotations and select the best offer. You receive a confirmed order with payment already secured before you ship.' },
  { n: '5', title: 'Deliver and Get Paid', body: 'Ship the goods. Buyer confirms delivery. Razorpay releases your payment automatically. No chasing invoices. No bounced cheques.' },
];

const comparisonRows = [
  { feature: 'Supplier Verification', vs: 'GST + Udyam verified', indiamart: 'Self-reported only', tradeindia: 'Self-reported only' },
  { feature: 'Payment Protection', vs: 'Razorpay Protected Payment', indiamart: 'None', tradeindia: 'None' },
  { feature: 'Lead Reselling', vs: 'Never — direct only', indiamart: 'Yes — multiple suppliers', tradeindia: 'Yes' },
  { feature: 'Trust Score', vs: 'Trade Confidence Score', indiamart: 'Not available', tradeindia: 'Not available' },
  { feature: 'Buyer Fees', vs: 'Zero', indiamart: 'Hidden lead pack costs', tradeindia: 'Paid' },
  { feature: 'Supplier Listing Cost', vs: 'Free (Phase 1)', indiamart: '₹15,000–₹80,000/yr', tradeindia: 'Paid' },
  { feature: 'Speak Requirement', vs: 'Beta — Coming Soon', indiamart: 'Not available', tradeindia: 'Not available' },
  { feature: 'WhatsApp Notifications', vs: 'Yes', indiamart: 'Email only', tradeindia: 'Email only' },
];

export default function HowItWorksPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToBuyerLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSupplierLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-4xl mx-auto px-4 py-16">

          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <span className="text-slate-400">How It Works</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">How VyaparSethu Works</h1>
          <p className="text-slate-400 text-lg mb-14 leading-relaxed max-w-2xl">
            India&apos;s verified B2B Trade Network. GST-verified suppliers. Razorpay-protected payments. 24-hour quotations. Free for buyers.
          </p>

          {/* For Buyers */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#001f3f] font-bold text-sm shrink-0">B</span>
              For Buyers
            </h2>
            <div className="space-y-6">
              {buyerSteps.map(step => (
                <div key={step.n} className="flex gap-5">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#001f3f] font-bold text-sm">{step.n}</div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-slate-800 mb-16" />

          {/* For Suppliers */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#001f3f] font-bold text-sm shrink-0">S</span>
              For Suppliers
            </h2>
            <div className="space-y-6">
              {supplierSteps.map(step => (
                <div key={step.n} className="flex gap-5">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#001f3f] font-bold text-sm">{step.n}</div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/founding-suppliers" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
                Apply for Founding Supplier Slot →
              </Link>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">VyaparSethu vs Other B2B Platforms</h2>
            <p className="text-xs text-slate-400 italic mb-2 sm:hidden">← Scroll to compare →</p>
            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
              <table className="w-full min-w-[580px] text-sm">
                <thead>
                  <tr className="bg-[#001f3f] border-b border-slate-700">
                    <th className="text-left text-[#D4AF37] font-semibold px-4 py-3 text-xs uppercase tracking-wider">Feature</th>
                    <th className="text-left text-[#D4AF37] font-semibold px-4 py-3 text-xs uppercase tracking-wider">VyaparSethu</th>
                    <th className="text-left text-slate-300 font-medium px-4 py-3 text-xs uppercase tracking-wider">IndiaMART</th>
                    <th className="text-left text-slate-300 font-medium px-4 py-3 text-xs uppercase tracking-wider">TradeIndia</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/10'}>
                      <td className="px-4 py-3 text-slate-300 text-xs font-medium">{row.feature}</td>
                      <td className="px-4 py-3 text-white text-xs font-semibold">{row.vs}</td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{row.indiamart}</td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{row.tradeindia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-slate-400 text-xs mt-2 italic">
              * IndiaMART and TradeIndia pricing is approximate based on publicly available information. Verify current pricing on their websites.
            </p>
          </section>

          {/* Trust Badges */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Our Commitments</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { title: 'GST Verified Suppliers Only', icon: '✓' },
                { title: 'Razorpay Protected Payments', icon: '🔒' },
                { title: 'Zero Fees for Buyers', icon: '₹0' },
                { title: 'Direct Quotation — No Middlemen', icon: '⚡' },
              ].map(badge => (
                <div key={badge.title} className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-4 text-center">
                  <div className="text-[#D4AF37] text-2xl font-bold mb-2">{badge.icon}</div>
                  <p className="text-white text-xs font-semibold leading-snug">{badge.title}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {faqLd.mainEntity.map(item => (
                <div key={item.name} className="border-b border-slate-800 pb-5">
                  <h3 className="text-white font-semibold text-sm mb-2">{item.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link href="/rfq/create" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
              Post a Requirement — Free →
            </Link>
            <Link href="/founding-suppliers" className="inline-block border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-6 py-3 rounded-lg text-sm transition-colors">
              Join as Founding Supplier
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
