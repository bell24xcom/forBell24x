import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Founding Supplier Programme | VyaparSethu',
  description: 'Join VyaparSethu as one of our first 100 verified suppliers. Free profile, priority placement, and permanent Founding Member badge. Limited to 100 suppliers.',
  openGraph: {
    title: 'Founding Supplier Programme | VyaparSethu',
    description: 'Free forever. Priority listing. Permanent Founding Member badge. Limited to 100 suppliers.',
    url: `${SITE_URL}/founding-suppliers`,
    siteName: 'VyaparSethu',
  },
  alternates: { canonical: `${SITE_URL}/founding-suppliers` },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Founding Suppliers', item: `${SITE_URL}/founding-suppliers` },
  ],
};

const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VyaparSethu',
  url: SITE_URL,
  founder: { '@type': 'Person', name: 'Vishal Pendharkar' },
  foundingDate: '2024',
  address: { '@type': 'PostalAddress', addressLocality: 'Bhiwandi', addressRegion: 'Maharashtra', addressCountry: 'IN' },
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is the Founding Supplier programme free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Profile, verification, priority placement, and Founding Member badge are all free. After the first 100 suppliers, new listings will require a paid subscription.' },
    },
    {
      '@type': 'Question',
      name: 'How many Founding Supplier slots are available?',
      acceptedAnswer: { '@type': 'Answer', text: 'Exactly 100 Founding Supplier slots. Once filled, the programme closes permanently.' },
    },
    {
      '@type': 'Question',
      name: 'What categories are currently open for Founding Suppliers?',
      acceptedAnswer: { '@type': 'Answer', text: 'Steel and Metals, Industrial Chemicals, Packaging Materials, Pipes and Irrigation Equipment, Construction Materials, and Industrial Supplies. New categories open monthly based on buyer demand.' },
    },
    {
      '@type': 'Question',
      name: 'Do I need to pay anything to apply for Founding Supplier status?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Registration, verification, and Founding Supplier status are completely free.' },
    },
    {
      '@type': 'Question',
      name: 'What happens after I am approved as a Founding Supplier?',
      acceptedAnswer: { '@type': 'Answer', text: 'Your Founding Member profile goes live immediately. You receive WhatsApp notifications when verified buyers post Requirements matching your products.' },
    },
    {
      '@type': 'Question',
      name: 'Can I lose my Founding Supplier status?',
      acceptedAnswer: { '@type': 'Answer', text: 'Founding Member status is permanent once approved. Your profile can be suspended if your GST registration is cancelled or you violate platform policies.' },
    },
  ],
};

const benefits = [
  {
    title: 'Free Verified Profile — Forever',
    body: 'Your GST-verified supplier profile is free for life. After the founding period, new suppliers pay a monthly subscription fee.',
    icon: '✓',
  },
  {
    title: 'Founding Member Badge — Permanent',
    body: 'A permanent Founding Member badge on your profile, visible to all buyers. Signals that you were among the first trusted suppliers on VyaparSethu.',
    icon: '★',
  },
  {
    title: 'Priority Placement — Permanent',
    body: 'Founding Suppliers appear at the top of category search results, above all future paid and free listings. This placement is guaranteed for life.',
    icon: '↑',
  },
  {
    title: 'Direct Founder Access',
    body: 'WhatsApp direct access to Vishal Pendharkar, Founder of VyaparSethu. Any issue, question, or feedback — direct line, no support tickets.',
    icon: '💬',
  },
];

const applySteps = [
  'Register at /register',
  'Select your product categories',
  'Add your GSTIN and Udyam number',
  'Our team verifies within 48 hours',
  'Your Founding Member profile goes live',
];

const categories = [
  'Steel and Metals',
  'Industrial Chemicals',
  'Packaging Materials',
  'Pipes and Irrigation Equipment',
  'Construction Materials',
  'Industrial Supplies',
];

export default function FoundingSuppliersPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-4 py-16">

          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <span className="text-slate-400">Founding Suppliers</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 text-xs text-[#D4AF37] font-medium mb-5">
            Limited — 100 Slots Only
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug">
            Become a VyaparSethu Founding Supplier
          </h1>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed">
            VyaparSethu is onboarding its first 100 verified suppliers in the Mumbai–Bhiwandi industrial cluster. Founding Suppliers receive permanent benefits that will never be offered again.
          </p>

          {/* Benefits */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-6">What Founding Suppliers Get</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {benefits.map(b => (
                <div key={b.title} className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-6">
                  <div className="text-[#D4AF37] text-2xl font-bold mb-3">{b.icon}</div>
                  <h3 className="text-white font-bold text-sm mb-2">{b.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{b.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Slots counter — static, update manually */}
          <section className="mb-14 bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Spots Remaining</h2>
            <p className="text-[#D4AF37] text-4xl font-black mb-1">100</p>
            <p className="text-slate-400 text-sm mb-1">Founding Supplier slots total</p>
            <p className="text-white text-sm font-semibold">Currently accepting applications</p>
          </section>

          {/* Who this is for */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-4">Who This Is For</h2>
            <p className="text-slate-400 text-sm mb-5">Founding Supplier slots are open to:</p>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li className="flex items-start gap-2"><span className="text-[#D4AF37] mt-0.5">→</span> Manufacturers and traders in the Bhiwandi–Thane–Kalamboli–Dombivli cluster</li>
              <li className="flex items-start gap-2"><span className="text-[#D4AF37] mt-0.5">→</span> Suppliers in the following categories:</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2 pl-4">
              {categories.map(cat => (
                <span key={cat} className="inline-block bg-slate-800/60 border border-slate-700/50 rounded-md px-3 py-1 text-xs text-slate-300">{cat}</span>
              ))}
            </div>
            <ul className="space-y-2 text-slate-300 text-sm mt-4">
              <li className="flex items-start gap-2"><span className="text-[#D4AF37] mt-0.5">→</span> GST-registered businesses with active GSTIN</li>
              <li className="flex items-start gap-2"><span className="text-[#D4AF37] mt-0.5">→</span> Any Indian MSME with at least 1 year of trading history</li>
            </ul>
          </section>

          {/* How to apply */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-6">How to Apply</h2>
            <div className="space-y-4">
              {applySteps.map((step, i) => (
                <div key={step} className="flex gap-4">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#001f3f] font-bold text-xs">{i + 1}</div>
                  <p className="text-slate-300 text-sm pt-1">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/register" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-7 py-3 rounded-lg text-sm transition-colors">
                Apply for Founding Supplier Slot →
              </Link>
            </div>
          </section>

          {/* Why now */}
          <section className="mb-14 border-l-2 border-[#D4AF37] pl-6">
            <h2 className="text-xl font-bold text-white mb-4">Why Join Now, Not Later?</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              India&apos;s B2B market is growing rapidly. Digital procurement is expanding post-COVID. Platforms that build verified supplier networks first will dominate this space. IndiaMART built their directory 25 years ago when there was no alternative. VyaparSethu is building with better protection, GST verification, and zero upfront fees.
            </p>
            <p className="text-white text-sm font-semibold leading-relaxed">
              Do not pay ₹15,000–₹80,000 per year to list on IndiaMART. Do not compete with 10 suppliers for the same lead. Join VyaparSethu as a Founding Supplier and build your verified digital presence before your competitors do.
            </p>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {faqLd.mainEntity.map(item => (
                <div key={item.name} className="border-b border-slate-800 pb-5">
                  <h3 className="text-white font-semibold text-sm mb-2">{item.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-8 text-center">
            <p className="text-white font-bold text-lg mb-2">Ready to become a Founding Supplier?</p>
            <p className="text-slate-400 text-sm mb-5">Free forever. Priority listing. Permanent badge. Limited to 100.</p>
            <Link href="/register" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-7 py-3 rounded-lg text-sm transition-colors">
              Apply Now — Free
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
