/**
 * VyaparSethu — reusable JSON-LD schema utilities.
 *
 * H6-11A.1: extracted from src/app/features/voice-rfq/page.tsx, where this
 * content was first implemented page-local (no reusable schema module
 * existed in the repo at the time). This file is the schema-architecture
 * home for content used by more than one future SEO page; `voiceRFQFAQ`
 * moved here as the first tenant, `breadcrumbSchema()` as a general helper
 * any page can call.
 *
 * `voiceRFQFAQ`'s content is deliberately narrower than an earlier draft of
 * this file that was proposed before /voice-rfq's live status was verified
 * against the repository (see docs/project/VS-H6-11A-VOICE-RFQ-SEO-LANDING-PAGE-REPORT.md).
 * It does not claim:
 *   - a fixed language count ("12 languages") — Whisper auto-detects the
 *     spoken language; there is no curated, tested language list in the repo
 *   - a specific processing or posting-time number ("3 seconds", "87
 *     seconds", "90 seconds") — no analytics evidence for any of these
 *   - automatic WhatsApp notification to matched suppliers — not wired into
 *     the RFQ posting flow (WhatsApp is used for OTP and admin outreach only)
 *   - /rfq/create?type=voice as a working entry point — that route reads no
 *     query params at all, confirmed by reading src/app/rfq/create/page.tsx
 */

export const voiceRFQFAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Voice RFQ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Voice RFQ (Speak Requirement) lets you post a B2B sourcing requirement by speaking instead of filling in a form. VyaparSethu transcribes what you say using Groq Whisper v3, then AI extracts structured details — category, quantity, location, and timeline — for you to review before posting.",
      },
    },
    {
      '@type': 'Question',
      name: 'Which languages can I speak in?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Speak naturally, in whichever language you're comfortable with. The transcription engine detects the spoken language automatically rather than requiring you to pick one from a fixed list first.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is Voice RFQ accurate for technical B2B requirements?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "After transcription, AI extracts the structured fields — product, quantity, unit, location, timeline — and shows them to you before anything is posted, so you can correct any detail it didn't capture the way you meant.",
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need a good internet connection to use Voice RFQ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Voice RFQ works over a standard mobile data connection — you don't need a desktop or a fast connection to use it.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is Voice RFQ free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Voice RFQ is free for all buyers — there is no per-request fee and no subscription required to post a Requirement by voice.',
      },
    },
  ],
};

/**
 * Usage:
 *   breadcrumbSchema([
 *     { name: "Home", url: "https://www.vyaparsethu.com" },
 *     { name: "Voice RFQ", url: "https://www.vyaparsethu.com/features/voice-rfq" },
 *   ])
 */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
