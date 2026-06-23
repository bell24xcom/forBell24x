import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Voice RFQ — Post B2B Requirements by Speaking | VyaparSethu',
  description: 'India\'s first voice-enabled B2B procurement. Speak your requirement in Hindi or English — VyaparSethu\'s AI transcribes and structures it in 90 seconds. Verified suppliers quote within 24 hours.',
  keywords: ['voice rfq india', 'speak requirement b2b', 'voice b2b procurement india', 'hindi voice rfq', 'voice enabled b2b platform india'],
  openGraph: {
    title: 'Voice RFQ — Post B2B Requirements by Speaking | VyaparSethu',
    description: 'Speak your requirement in Hindi or English. AI structures it in 90 seconds. Verified suppliers quote within 24 hours.',
    url: `${SITE_URL}/features/voice-rfq`,
    siteName: 'VyaparSethu',
  },
  alternates: { canonical: `${SITE_URL}/features/voice-rfq` },
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I post a B2B requirement using voice commands in India?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. VyaparSethu\'s Speak Requirement feature allows buyers to post B2B requirements by speaking into their phone or computer microphone. The AI transcribes the voice input, extracts structured fields (product, quantity, location, timeline), and creates a formatted Requirement in under 90 seconds. Hindi and English are both supported.' },
    },
    {
      '@type': 'Question',
      name: 'Which languages does VyaparSethu\'s voice RFQ support?',
      acceptedAnswer: { '@type': 'Answer', text: 'VyaparSethu currently supports Hindi and English voice input for requirement posting. The transcription is powered by Groq Whisper v3, which accurately handles Indian accents and Hinglish (mixed Hindi-English) speech patterns common among Indian SME procurement managers.' },
    },
    {
      '@type': 'Question',
      name: 'How accurate is voice-to-RFQ conversion?',
      acceptedAnswer: { '@type': 'Answer', text: 'VyaparSethu uses Groq Whisper v3 for transcription, which has high accuracy for Indian English and Hindi. After transcription, you can review and edit all extracted fields (product, quantity, location, date, budget) before the Requirement is posted to suppliers.' },
    },
    {
      '@type': 'Question',
      name: 'Is voice RFQ free to use on VyaparSethu?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The Speak Requirement feature is free for all buyers on VyaparSethu. No subscription or premium plan is required.' },
    },
  ],
};

const steps = [
  { n: '1', title: 'Open Speak Requirement', body: 'Go to /voice-rfq or tap "Speak Requirement" from the homepage or dashboard.' },
  { n: '2', title: 'Speak your requirement', body: 'Describe what you need in Hindi or English — product name, quantity, delivery city, and timeline. Speak naturally for 20–60 seconds.' },
  { n: '3', title: 'AI structures it automatically', body: 'Groq Whisper v3 transcribes your speech. AI extracts product, quantity, unit, location, timeline, and budget into structured fields.' },
  { n: '4', title: 'Review and confirm', body: 'Review all extracted fields. Edit anything that wasn\'t captured correctly. Add any missing details.' },
  { n: '5', title: 'Post — suppliers quote within 24h', body: 'Your Requirement goes live. Verified suppliers in your category receive a notification and submit competitive quotes within 24 hours.' },
];

export default function VoiceRFQFeaturePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-4xl mx-auto px-4 py-16">

          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <span className="text-slate-400">Features</span><span>/</span>
            <span className="text-slate-400">Voice RFQ</span>
          </nav>

          {/* Hero */}
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 text-xs text-[#D4AF37] font-medium mb-4">
              India&apos;s First Voice-Enabled B2B Procurement
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug">
              Post B2B Requirements<br className="hidden sm:block" /> by Speaking
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mb-6 leading-relaxed">
              No typing. No forms. Just speak your requirement in Hindi or English — VyaparSethu&apos;s AI structures it automatically and sends it to verified suppliers in your category.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/voice-rfq" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
                Try Speak Requirement
              </Link>
              <Link href="/rfq/create" className="inline-block border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-6 py-3 rounded-lg text-sm transition-colors">
                Post by Text Instead
              </Link>
            </div>
          </div>

          {/* Why voice matters */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-6">Why Voice-First Procurement Matters for Indian SMEs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  icon: '🗣️',
                  title: 'Most buyers think faster than they type',
                  body: 'A procurement manager in Bhiwandi can describe a corrugated box requirement in 30 seconds by voice — but takes 5 minutes to type the same specification on a form.',
                },
                {
                  icon: '🌐',
                  title: 'Hindi-first SMEs are underserved',
                  body: 'Most B2B platforms are English-only. A factory owner in Tier 2 cities communicates in Hindi or their regional language. Speak Requirement removes the language barrier entirely.',
                },
                {
                  icon: '📱',
                  title: 'Mobile procurement from anywhere',
                  body: 'Speak your requirement while walking the production floor, travelling between sites, or during a phone call — without stopping to type on a small keyboard.',
                },
              ].map(item => (
                <div key={item.title} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="text-white font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-6">How Speak Requirement Works</h2>
            <div className="space-y-5">
              {steps.map(step => (
                <div key={step.n} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#001f3f] font-bold text-sm">{step.n}</div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-white font-semibold text-sm mb-1">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tech */}
          <section className="mb-14 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Under the Hood</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-1">Transcription</p>
                <p className="text-slate-300 font-semibold text-sm">Groq Whisper v3</p>
                <p className="text-slate-500 text-xs mt-1">State-of-the-art audio transcription optimised for Indian English, Hindi, and Hinglish speech patterns. Processes 60 seconds of audio in under 3 seconds.</p>
              </div>
              <div>
                <p className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-1">Field Extraction</p>
                <p className="text-slate-300 font-semibold text-sm">AI-Structured RFQ</p>
                <p className="text-slate-500 text-xs mt-1">After transcription, AI extracts product, quantity, unit, delivery location, required date, and budget into structured fields — saving you from filling in a form manually.</p>
              </div>
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

          <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-8 text-center">
            <h3 className="text-white font-semibold text-lg mb-2">Try Speak Requirement Now — Free</h3>
            <p className="text-slate-400 text-sm mb-5">Speak your requirement in 30 seconds. Verified suppliers quote within 24 hours. Protected Payment on every deal.</p>
            <Link href="/voice-rfq" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
              🎤 Open Speak Requirement
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
