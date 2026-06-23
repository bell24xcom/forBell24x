import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site-url';
import WaitlistForm from '@/src/components/features/WaitlistForm';

export const metadata: Metadata = {
  title: 'B2B Procurement in Hindi and Indian Regional Languages | VyaparSethu',
  description: 'VyaparSethu supports Hindi-language B2B procurement via voice input — the first B2B Trade Network designed for Tier 2 and Tier 3 city SMEs who operate in their regional language. Coming Soon.',
  keywords: ['hindi b2b marketplace', 'regional language b2b india', 'hindi procurement platform', 'b2b in hindi india', 'tier 2 city b2b supplier india'],
  openGraph: {
    title: 'B2B Procurement in Hindi | VyaparSethu',
    description: 'Hindi voice input for B2B requirements. Post requirements in Hindi — verified suppliers respond in 24 hours. Beta — Coming Soon.',
    url: `${SITE_URL}/features/regional-languages`,
    siteName: 'VyaparSethu',
  },
  alternates: { canonical: `${SITE_URL}/features/regional-languages` },
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'क्या VyaparSethu Hindi में काम करता है?',
      acceptedAnswer: { '@type': 'Answer', text: 'VyaparSethu का Speak Requirement Feature Hindi में Voice Input Support करेगा। यह feature अभी Beta में है और जल्द launch होगा। आप waitlist join कर सकते हैं।' },
    },
    {
      '@type': 'Question',
      name: 'Which B2B platform in India supports Hindi language?',
      acceptedAnswer: { '@type': 'Answer', text: 'VyaparSethu is building Hindi voice input for requirement posting. Buyers will be able to speak their requirements in Hindi and the platform\'s AI will transcribe and structure them automatically. This feature is in Beta and launching soon. Most other B2B portals (IndiaMART, TradeIndia) are English-only in their procurement workflow.' },
    },
    {
      '@type': 'Question',
      name: 'Why does regional language support matter for B2B procurement in India?',
      acceptedAnswer: { '@type': 'Answer', text: 'Over 70% of India\'s 63 million MSMEs operate primarily in their regional language — Hindi, Tamil, Telugu, Marathi, Gujarati, or Kannada. English-only B2B platforms exclude this majority. A factory owner in Bhiwandi, a trader in Coimbatore, or a manufacturer in Surat should not need to switch languages to access B2B procurement tools.' },
    },
    {
      '@type': 'Question',
      name: 'Can I find Hindi-speaking suppliers on VyaparSethu?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Many VyaparSethu suppliers are based in Hindi-speaking regions including Mumbai, Bhiwandi, Pune, Delhi, and industrial clusters across Uttar Pradesh and Rajasthan. Buyers can post requirements in text today and will soon be able to post in Hindi voice.' },
    },
  ],
};

export default function RegionalLanguagesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-4xl mx-auto px-4 py-16">

          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <span className="text-slate-400">Features</span><span>/</span>
            <span className="text-slate-400">Regional Languages</span>
          </nav>

          {/* Hero */}
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 text-xs text-amber-400 font-semibold mb-4">
              🚧 Beta — Coming Soon
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug">
              B2B Procurement<br className="hidden sm:block" /> in Hindi and Indian Languages
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mb-3 leading-relaxed">
              India&apos;s 63 million MSMEs operate in Hindi, Tamil, Telugu, Marathi, Gujarati, and dozens of other languages. Most B2B platforms are English-only.
            </p>
            <p className="text-white text-lg font-semibold mb-6">VyaparSethu is changing this — Hindi voice input is coming soon.</p>
            <div className="flex flex-wrap gap-3 mb-6">
              <Link href="/rfq/create" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
                Post in Text (Available Now)
              </Link>
            </div>

            {/* Waitlist form */}
            <WaitlistForm feature="Hindi Voice Requirement" />
          </div>

          {/* The problem */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-4">The Language Gap in Indian B2B</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
                <p className="text-4xl font-bold text-white mb-2">63M+</p>
                <p className="text-slate-400 text-sm">MSMEs in India. The majority operate primarily in regional languages — Hindi, Tamil, Telugu, Marathi, Gujarati.</p>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
                <p className="text-4xl font-bold text-white mb-2">0</p>
                <p className="text-slate-400 text-sm">Major B2B procurement platforms with Hindi voice input today. Most platforms are English-only in their core procurement workflow. VyaparSethu is building this.</p>
              </div>
            </div>
          </section>

          {/* Hindi demo — how it will work */}
          <section className="mb-14 bg-[#001f3f] border border-[#D4AF37]/20 rounded-2xl p-8">
            <h2 className="text-white font-bold text-xl mb-2">Hindi में Requirement कैसे Post करेंगे</h2>
            <p className="text-slate-400 text-sm mb-6">Step-by-step process for Hindi-language procurement on VyaparSethu (launching soon):</p>
            <div className="space-y-4">
              {[
                { step: '1', hindi: 'Speak Requirement पर जाएं', eng: 'Go to Speak Requirement from the homepage (coming soon — join waitlist above)' },
                { step: '2', hindi: 'Hindi में बोलें', eng: 'Speak your requirement in Hindi: "मुझे 500 किलो HR Coil Steel चाहिए, Grade E250, Bhiwandi delivery, 15 July से पहले"' },
                { step: '3', hindi: 'AI समझेगा', eng: 'AI will transcribe and extract: product = HR Coil Steel E250, quantity = 500 kg, location = Bhiwandi, deadline = 15 July' },
                { step: '4', hindi: 'Review करें और Post करें', eng: 'Review extracted fields, edit if needed, and post your Requirement to verified suppliers' },
                { step: '5', hindi: 'Suppliers 24 घंटे में Quote देंगे', eng: 'Verified suppliers receive notification and submit competitive quotes within 24 hours' },
              ].map(item => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#001f3f] font-bold text-xs">{item.step}</div>
                  <div>
                    <p className="text-white font-semibold text-sm">{item.hindi}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{item.eng}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Why it matters */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-5">Why Regional Language Support Matters</h2>
            <div className="space-y-4 text-slate-400 text-sm leading-relaxed">
              <p>
                India&apos;s B2B supply chain is built on personal relationships developed in local languages. A steel trader in Bhiwandi speaks Marathi and Hindi. A chemical manufacturer in Ahmedabad communicates in Gujarati. A textile mill owner in Coimbatore conducts business in Tamil.
              </p>
              <p>
                When B2B platforms are English-only, they effectively exclude the majority of India&apos;s 63 million MSMEs from digital procurement. These businesses end up staying on WhatsApp, phone calls, and personal networks — not because they are resistant to technology, but because the technology hasn&apos;t met them where they are.
              </p>
              <p>
                VyaparSethu&apos;s Speak Requirement feature is the first step toward fixing this. By accepting Hindi voice input, we allow a factory owner in Bhiwandi or a procurement manager in Kanpur to post a structured B2B Requirement without switching to English — and without typing anything at all.
              </p>
              <p>
                AI search queries (on ChatGPT, Google, and Gemini) in Hindi are growing 3× faster than English B2B queries in India. Buyers are asking questions like &ldquo;b2b supplier kaise dhundhein&rdquo; and &ldquo;rfq क्या होता है&rdquo; in Hindi. VyaparSethu is built to serve this demand.
              </p>
            </div>
          </section>

          {/* Geographic coverage */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-5">Industrial Clusters We Serve</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { city: 'Bhiwandi, Maharashtra', lang: 'Marathi / Hindi', industry: 'Corrugated Packaging, Textiles, Logistics' },
                { city: 'Kalamboli, Maharashtra', lang: 'Marathi / Hindi', industry: 'Steel, Metals, Industrial Goods' },
                { city: 'Taloja, Maharashtra', lang: 'Marathi / Hindi', industry: 'Chemicals, Petrochemicals' },
                { city: 'Surat, Gujarat', lang: 'Gujarati / Hindi', industry: 'Textiles, Diamonds, Chemicals' },
                { city: 'Ludhiana, Punjab', lang: 'Punjabi / Hindi', industry: 'Hosiery, Steel, Machine Tools' },
                { city: 'Coimbatore, Tamil Nadu', lang: 'Tamil', industry: 'Textiles, Pumps, Wet Grinders' },
              ].map(item => (
                <div key={item.city} className="bg-slate-800/30 border border-slate-700/40 rounded-lg p-4">
                  <p className="text-white font-semibold text-sm">{item.city}</p>
                  <p className="text-[#D4AF37] text-xs mt-0.5 mb-1">{item.lang}</p>
                  <p className="text-slate-500 text-xs">{item.industry}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
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

          {/* Bottom waitlist */}
          <WaitlistForm feature="Hindi Voice Requirement" />

        </div>
      </div>
    </>
  );
}
