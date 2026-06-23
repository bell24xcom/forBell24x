import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Supplier Verification — How It Works | VyaparSethu',
  description: 'Every supplier on VyaparSethu is GST-verified and Udyam-registered before their profile goes live. No fake listings. No self-reported data.',
  openGraph: {
    title: 'Supplier Verification — How It Works | VyaparSethu',
    description: 'GST + Udyam verified against government portals. Profile reviewed by our team. 24-48 hour approval.',
    url: `${SITE_URL}/how-verification-works`,
    siteName: 'VyaparSethu',
  },
  alternates: { canonical: `${SITE_URL}/how-verification-works` },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Supplier Verification', item: `${SITE_URL}/how-verification-works` },
  ],
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How long does supplier verification take on VyaparSethu?',
      acceptedAnswer: { '@type': 'Answer', text: 'GST and Udyam verification is checked against government portals in real time. Profile review by our team takes 24-48 hours. WhatsApp notification is sent on approval.' },
    },
    {
      '@type': 'Question',
      name: 'Is supplier verification on VyaparSethu free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Basic verification (GST + Udyam + profile review) is completely free.' },
    },
    {
      '@type': 'Question',
      name: 'What if my GST registration is new?',
      acceptedAnswer: { '@type': 'Answer', text: 'New GST registrations are accepted. Your profile will show your registration date. Your Trade Confidence Score builds from your first completed transaction.' },
    },
    {
      '@type': 'Question',
      name: 'What happens if my GST registration is cancelled later?',
      acceptedAnswer: { '@type': 'Answer', text: 'If your GST registration is cancelled or suspended, your VyaparSethu profile is automatically deactivated until you update your registration details.' },
    },
  ],
};

const scoreComponents = [
  { label: 'Payment History', weight: '30%' },
  { label: 'On-time Delivery', weight: '20%' },
  { label: 'Response Speed', weight: '15%' },
  { label: 'Repeat Orders', weight: '15%' },
  { label: 'Dispute Rate', weight: '10%' },
  { label: 'Verification Strength', weight: '10%' },
];

export default function HowVerificationWorksPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-4 py-16">

          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <Link href="/how-it-works" className="hover:text-slate-300">How It Works</Link><span>/</span>
            <span className="text-slate-400">Supplier Verification</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 text-xs text-[#D4AF37] font-medium mb-5">
            GST + Udyam Verified Against Government Portals
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug">
            How VyaparSethu Verifies Every Supplier
          </h1>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed">
            On most B2B directories, any business can create a listing in minutes with no checks. VyaparSethu does not work this way. Every supplier must pass a 3-step verification before their profile is visible to buyers.
          </p>

          {/* 3-step process */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-7">The 3-Step Verification Process</h2>
            <div className="space-y-6">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#001f3f] font-bold text-sm shrink-0">1</div>
                  <h3 className="text-white font-bold">GST Verification</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed pl-11">
                  The supplier provides their GSTIN. VyaparSethu checks it against the government GST portal in real time. We verify: legal business name, registration status (active or cancelled), state of registration, and business type. Suppliers with cancelled or suspended GSTINs are not listed.
                </p>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#001f3f] font-bold text-sm shrink-0">2</div>
                  <h3 className="text-white font-bold">Udyam Verification</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed pl-11">
                  For MSME suppliers, the Udyam Registration Number is verified against the government Udyam portal. This confirms the business is a legally registered micro, small, or medium enterprise with the benefits and protections that status provides.
                </p>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#001f3f] font-bold text-sm shrink-0">3</div>
                  <h3 className="text-white font-bold">Profile Review</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed pl-11">
                  Our team reviews the supplier&apos;s product catalogue and category selection before approving the listing. Profiles that are incomplete or inconsistent with the supplier&apos;s GST registration are returned for correction.
                </p>
              </div>
            </div>
          </section>

          {/* Honest limitations */}
          <section className="mb-14 bg-slate-800/20 border border-slate-700/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">What Verification Does Not Cover</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              GST and Udyam verification confirms that a business is legally registered. It does not guarantee product quality, delivery performance, or business reputation. These factors are tracked through the Trade Confidence Score, which builds over time with each completed transaction on VyaparSethu.
            </p>
          </section>

          {/* Trade Confidence Score */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-4">Trade Confidence Score</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              After a supplier&apos;s first transaction, they begin building a Trade Confidence Score — VyaparSethu&apos;s trust rating system. Scores range from 0 to 100 and update with each transaction. Buyers can see a supplier&apos;s score on every profile.
            </p>
            <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-6">
              <p className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-4">Score Breakdown</p>
              <div className="space-y-2">
                {scoreComponents.map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">{item.label}</span>
                    <span className="text-[#D4AF37] font-bold text-sm">{item.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How to apply */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-4">How to Get Verified</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Visit the registration page to apply as a verified supplier. Verification takes 24-48 hours. You will receive a WhatsApp notification when your profile is approved.
            </p>
            <Link href="/register" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
              Apply as Verified Supplier →
            </Link>
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

        </div>
      </div>
    </>
  );
}
