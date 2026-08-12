import { Metadata } from 'next';
import Link from 'next/link';
import { Mic, Volume2, ClipboardCheck } from 'lucide-react';
import { SITE_URL } from '@/lib/site-url';
import { voiceRFQFAQ, breadcrumbSchema } from '@/src/lib/schema/faq-schema';

// H6-11A: this page previously described Speak Requirement as
// "Coming Soon — Beta — join the waitlist." That's no longer true —
// the feature is live at /voice-rfq (confirmed: real MediaRecorder
// recording, Groq Whisper v3 transcription, AI field extraction,
// linked from the homepage hero and dashboard nav). This page is now
// the SEO/informational landing page for that live feature; /voice-rfq
// itself is the product and is not touched by this change.
//
// Claims deliberately NOT made here, per the H6-11A audit:
// - no fixed "12 languages" count (Whisper auto-detects; there's no
//   curated, tested language list in the repo)
// - no "3 second" / "87 second" / "90 second" processing or posting
//   time (no analytics evidence for any of these numbers)
// - no automatic WhatsApp-to-supplier notification claim (not wired
//   into the RFQ posting flow — WhatsApp is used for OTP and admin
//   outreach only)
// - no "trained on" / "tuned for" language about the AI model

export const metadata: Metadata = {
  // `absolute` — this string already ends in "| VyaparSethu"; without it the
  // root layout's `template: '%s | VyaparSethu'` appends the suffix a
  // second time (caught in local validation, same bug class as the earlier
  // /learn fix this week).
  title: { absolute: 'Voice RFQ India — Post B2B Requirements by Speaking | VyaparSethu' },
  description: "Post your B2B requirement by speaking naturally. VyaparSethu uses AI speech recognition and requirement extraction to turn your spoken requirement into a structured RFQ.",
  keywords: ['voice rfq india', 'speak requirement b2b', 'voice b2b procurement india', 'hindi voice rfq', 'voice enabled b2b platform india'],
  openGraph: {
    title: 'Voice RFQ India — Post B2B Requirements by Speaking',
    description: 'Speak your requirement naturally. AI transcribes it, extracts the details, and gets it ready to post to verified suppliers.',
    url: `${SITE_URL}/features/voice-rfq`,
    siteName: 'VyaparSethu',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Voice RFQ India — Post B2B Requirements by Speaking',
    description: 'Speak your requirement naturally. AI transcribes it, extracts the details, and gets it ready to post to verified suppliers.',
  },
  alternates: { canonical: `${SITE_URL}/features/voice-rfq` },
};

// FAQPage + BreadcrumbList JSON-LD now come from the shared schema module
// (H6-11A.1) — src/lib/schema/faq-schema.ts — instead of being defined
// page-local, so future SEO pages can reuse voiceRFQFAQ/breadcrumbSchema
// rather than each re-declaring their own copy.
const breadcrumbLd = breadcrumbSchema([
  { name: 'Home', url: SITE_URL },
  { name: 'Voice RFQ', url: `${SITE_URL}/features/voice-rfq` },
]);

const steps = [
  {
    icon: Mic,
    title: 'Speak',
    body: "Open Speak Requirement and describe what you need, naturally, in your own words — product, quantity, delivery city, timeline.",
  },
  {
    icon: Volume2,
    title: 'AI Parses Your Requirement',
    body: "Groq Whisper v3 transcribes your speech. AI then extracts product, quantity, unit, location, and timeline into structured fields.",
  },
  {
    icon: ClipboardCheck,
    title: 'Create Your Requirement',
    body: 'Review what the AI captured, edit anything that needs fixing, and post — verified suppliers in your category can now quote on it.',
  },
];

const whyVoice = [
  {
    icon: '🗣️',
    title: 'Faster than typing out a spec',
    body: 'Describing a requirement out loud is often quicker than structuring the same information into a form, field by field.',
  },
  {
    icon: '🌐',
    title: 'No language barrier to a form',
    body: "Speak in the language you're comfortable in, instead of composing a requirement in a second language you're less fluent in.",
  },
  {
    icon: '📱',
    title: 'Works from the factory floor',
    body: 'Post a requirement while walking the floor, between sites, or on a call — without stopping to type on a small keyboard.',
  },
];

const categories = [
  { name: 'Steel & Metals', example: '"500 kilos of TMT bars, 10mm, delivered to Bhiwandi by next week."' },
  { name: 'Textiles & Garments', example: '"2000 metres of cotton fabric, 150 GSM, for a Surat delivery."' },
  { name: 'Packaging', example: '"5000 corrugated boxes, double-wall, for export packaging."' },
  { name: 'Chemicals', example: '"200 litres of industrial-grade adhesive, need it within 10 days."' },
  { name: 'Construction', example: '"10 tonnes of cement, OPC 53 grade, site delivery in Pune."' },
  { name: 'Industrial Supplies', example: '"Bulk order of safety gloves and hard hats for a 50-worker site."' },
];

export default function VoiceRFQFeaturePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(voiceRFQFAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-4xl mx-auto px-4 py-16">

          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link><span aria-hidden="true">/</span>
            <span className="text-slate-400" aria-current="page">Voice RFQ</span>
          </nav>

          {/* Hero */}
          <div className="mb-14">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug">
              Post Your B2B Requirement by Speaking — In Hindi, English, or Any Indian Language
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mb-8 leading-relaxed">
              Skip the form. Describe what you need out loud — VyaparSethu&apos;s AI transcribes your speech and extracts the product, quantity, and specifications automatically, ready for you to review and post.
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <Link
                href="/voice-rfq"
                className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#0F172A]"
              >
                Try Speak Requirement →
              </Link>
              <Link
                href="/rfq/demo/all"
                className="inline-block border border-slate-600 hover:border-[#D4AF37]/50 text-slate-300 hover:text-[#D4AF37] font-semibold px-6 py-3 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#0F172A]"
              >
                See Live Demo →
              </Link>
            </div>
          </div>

          {/* Visual — honest placeholder: no dedicated demo asset exists yet
              (checked public/ and src/components for one). Uses the same
              icon set as the rest of the page rather than a fabricated
              screenshot or video. */}
          <div className="mb-14 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-10 flex items-center justify-center gap-6" aria-hidden="true">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
              <Mic className="w-7 h-7 text-[#D4AF37]" />
            </div>
            <div className="flex items-end gap-1 h-10">
              {[6, 14, 22, 14, 8, 18, 10].map((h, i) => (
                <span key={i} className="w-1.5 rounded-full bg-[#D4AF37]/40" style={{ height: `${h * 2}px` }} />
              ))}
            </div>
          </div>

          {/* How it works */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-6">How Voice RFQ Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#001f3f] font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <Icon className="w-5 h-5 text-[#D4AF37]" aria-hidden="true" />
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-2">{step.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{step.body}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Language positioning — no fixed count, no fake grid */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-4">Speak Your Requirement Naturally</h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
              Voice RFQ uses automatic speech recognition — it detects the language you&apos;re speaking rather than requiring you to select one first. Describe your requirement the way you&apos;d explain it to a colleague, and the AI takes it from there.
            </p>
          </section>

          {/* Why voice */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-6">Why Use Voice Instead of Typing?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {whyVoice.map(item => (
                <div key={item.title} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                  <div className="text-2xl mb-3" aria-hidden="true">{item.icon}</div>
                  <h3 className="text-white font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* B2B examples */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-2">Works Across Every B2B Category</h2>
            <p className="text-slate-500 text-sm mb-6">Examples of what you could say — not a guarantee of matching outcomes.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {categories.map(cat => (
                <div key={cat.name} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                  <h3 className="text-white font-semibold text-sm mb-2">{cat.name}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed italic">{cat.example}</p>
                </div>
              ))}
            </div>
            <Link href="/categories" className="text-[#D4AF37] hover:text-[#c4a030] text-sm font-semibold transition-colors">
              Browse All Categories →
            </Link>
          </section>

          {/* AI technology */}
          <section className="mb-14 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Powered by AI for B2B Requirements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-1">Speech-to-Text</p>
                <p className="text-slate-300 font-semibold text-sm">Groq Whisper v3</p>
                <p className="text-slate-500 text-xs mt-1">Transcribes your spoken requirement.</p>
              </div>
              <div>
                <p className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-1">Field Extraction</p>
                <p className="text-slate-300 font-semibold text-sm">AI-Structured Requirement</p>
                <p className="text-slate-500 text-xs mt-1">Extracts product, quantity, unit, location, and timeline from the transcript into structured fields you can review before posting.</p>
              </div>
            </div>
          </section>

          {/* FAQ — native <details>/<summary>, accessible, no client JS needed */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-5">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {voiceRFQFAQ.mainEntity.map(item => (
                <details key={item.name} className="group border border-slate-700/50 rounded-xl bg-slate-800/40 open:bg-slate-800/60">
                  <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-4 text-white font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-xl">
                    {item.name}
                    <span className="text-[#D4AF37] shrink-0 transition-transform group-open:rotate-45 text-lg leading-none" aria-hidden="true">+</span>
                  </summary>
                  <p className="px-5 pb-4 text-slate-400 text-sm leading-relaxed">{item.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </section>

          {/* More about the platform */}
          <section className="mb-14">
            <h2 className="text-lg font-bold text-white mb-4">More Ways to Source</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link href="/video-rfq" className="text-slate-400 hover:text-[#D4AF37] transition-colors">Post by Video Instead →</Link>
              <Link href="/rfq/create" className="text-slate-400 hover:text-[#D4AF37] transition-colors">Post by Text Instead →</Link>
              <Link href="/how-it-works" className="text-slate-400 hover:text-[#D4AF37] transition-colors">How VyaparSethu Works →</Link>
              <Link href="/how-payment-works" className="text-slate-400 hover:text-[#D4AF37] transition-colors">How Payment Protection Works →</Link>
              <Link href="/how-verification-works" className="text-slate-400 hover:text-[#D4AF37] transition-colors">How Supplier Verification Works →</Link>
            </div>
          </section>

          {/* Final CTA */}
          <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-2xl p-8 text-center">
            <h2 className="text-white font-bold text-xl mb-3">Try Voice RFQ — Free</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xl mx-auto">Post your first Requirement by speaking. No forms, no typing.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/voice-rfq"
                className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#001f3f]"
              >
                Try Speak Requirement →
              </Link>
              <Link
                href="/rfq/demo/all"
                className="inline-block border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 font-semibold px-6 py-3 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#001f3f]"
              >
                See Live Demo →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
