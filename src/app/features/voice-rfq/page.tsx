import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site-url';
import WaitlistForm from '@/src/components/features/WaitlistForm';

export const metadata: Metadata = {
  title: 'Speak Requirement — Post B2B Requirements by Voice | VyaparSethu',
  description: 'India\'s first voice-enabled B2B procurement. Speak your requirement in Hindi or English — VyaparSethu\'s AI transcribes and structures it in 90 seconds. Coming Soon — join the waitlist.',
  keywords: ['voice rfq india', 'speak requirement b2b', 'voice b2b procurement india', 'hindi voice rfq', 'voice enabled b2b platform india'],
  openGraph: {
    title: 'Speak Requirement — Post B2B Requirements by Voice | VyaparSethu',
    description: 'Speak your requirement in Hindi or English. AI structures it in 90 seconds. Beta — Coming Soon.',
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
      acceptedAnswer: { '@type': 'Answer', text: 'VyaparSethu\'s Speak Requirement feature will allow buyers to post B2B requirements by speaking into their phone or computer microphone. The AI transcribes the voice input, extracts structured fields (product, quantity, location, timeline), and creates a formatted Requirement in under 90 seconds. Hindi and English will both be supported. This feature is currently in Beta and launching soon.' },
    },
    {
      '@type': 'Question',
      name: 'Which languages will VyaparSethu\'s Speak Requirement support?',
      acceptedAnswer: { '@type': 'Answer', text: 'VyaparSethu plans to support Hindi and English voice input for requirement posting. The transcription will be powered by Groq Whisper v3, which accurately handles Indian accents and Hinglish speech patterns common among Indian SME procurement managers.' },
    },
    {
      '@type': 'Question',
      name: 'How accurate will voice-to-requirement conversion be?',
      acceptedAnswer: { '@type': 'Answer', text: 'VyaparSethu will use Groq Whisper v3 for transcription. After transcription, you can review and edit all extracted fields (product, quantity, location, date, budget) before the Requirement is posted to suppliers.' },
    },
    {
      '@type': 'Question',
      name: 'Will Speak Requirement be free to use on VyaparSethu?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The Speak Requirement feature will be free for all buyers on VyaparSethu. No subscription or premium plan will be required.' },
    },
  ],
};

const steps = [
  { n: '1', title: 'Open Speak Requirement', body: 'Tap "Speak Requirement" from the homepage or dashboard. (Launching soon — join the waitlist below to be notified.)' },
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
            <span className="text-slate-400">Speak Requirement</span>
          </nav>

          {/* Hero */}
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 text-xs text-amber-400 font-semibold mb-4">
              🚧 Beta — Coming Soon
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug">
              Post B2B Requirements<br className="hidden sm:block" /> by Speaking
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mb-6 leading-relaxed">
              No typing. No forms. Just speak your requirement in Hindi or English — VyaparSethu&apos;s AI will structure it automatically and send it to verified suppliers in your category. Launching soon.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <Link href="/rfq/create" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
                Post by Text Instead (Available Now)
              </Link>
            </div>

            {/* Waitlist form */}
            <WaitlistForm feature="Speak Requirement" />
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

          {/* How it will work */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-6">How Speak Requirement Will Work</h2>
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
                <p className="text-slate-300 font-semibold text-sm">AI-Structured Requirement</p>
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

          {/* Bottom waitlist CTA */}
          <WaitlistForm feature="Speak Requirement" />

        </div>
      </div>
    </>
  );
}
