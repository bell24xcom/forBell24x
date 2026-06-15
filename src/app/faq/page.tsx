import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ — VyaparSethu B2B Trade Network India',
  description: 'Answers to the most common questions about VyaparSethu: how Protected Payment works, supplier verification, Trade Confidence Score, GST compliance, and how to post a Requirement.',
  keywords: ['VyaparSethu FAQ', 'B2B marketplace India FAQ', 'protected payment India', 'supplier verification India', 'how to find suppliers India'],
  openGraph: { title: 'Frequently Asked Questions — VyaparSethu', description: 'Everything you need to know about sourcing safely on VyaparSethu.', url: 'https://www.vyaparsethu.com/faq', siteName: 'VyaparSethu' },
  alternates: { canonical: 'https://www.vyaparsethu.com/faq' },
};

const FAQS = [
  {
    q: 'What is VyaparSethu?',
    a: 'VyaparSethu is India\'s B2B Trade Network for verified sourcing. Buyers post Requirements (voice, video, or text) and receive competitive quotations from verified suppliers within 24 hours. Every deal is protected by our Protected Payment system — funds only release to the supplier when the buyer confirms delivery.',
  },
  {
    q: 'How does Protected Payment (escrow) work?',
    a: 'When a buyer accepts a quotation, they pay into a Razorpay nodal account — funds are held in escrow, not accessible to the supplier. Once goods are delivered and the buyer confirms receipt, funds are released to the supplier within 24 hours. If no action is taken within 72 hours of delivery, funds auto-release. Disputes are resolved by VyaparSethu\'s team within 48 hours.',
  },
  {
    q: 'How does VyaparSethu verify suppliers?',
    a: 'Verification has 3 layers: (1) GSTIN verification — we check the supplier\'s GST registration is active and their filing history is consistent; (2) Udyam/business address verification; (3) Phone OTP + manual review for Verified Supplier badge. Suppliers with the Verified badge have completed all three layers.',
  },
  {
    q: 'Is VyaparSethu free to use?',
    a: 'Posting Requirements is free for buyers. Suppliers on the free tier can submit up to 5 quotations per month. Pro suppliers get unlimited quotations, priority matching, and access to requirement alerts. There is no listing fee or subscription required to browse.',
  },
  {
    q: 'What is the Trade Confidence Score™?',
    a: 'The Trade Confidence Score (0–100) measures how reliable a buyer or supplier is. It\'s calculated from 6 factors: Payment History (30%), On-time Delivery (20%), Response Speed (15%), Repeat Orders (15%), Dispute Rate (10%), and Verification Strength (10%). Scores are updated daily at 2 AM IST using a rolling 90-day window.',
  },
  {
    q: 'What categories does VyaparSethu cover?',
    a: 'VyaparSethu covers 450+ subcategories across 50 parent categories including Metals & Alloys, Packaging Materials, Chemicals & Petrochemicals, Industrial Machinery, Textiles & Garments, Electronics & Electricals, Food & Beverages, Pharmaceuticals, Automotive Parts, Construction Materials, and Industrial Adhesives & Sealants.',
  },
  {
    q: 'How do I post a Requirement (RFQ)?',
    a: 'There are 3 ways: (1) Speak Requirement — tap the microphone and speak your requirement in Hindi or English; AI transcribes and extracts specifications in 3 seconds. (2) Video Requirement — upload a video explaining your need. (3) Text Requirement — fill in the form with category, quantity, grade, timeline, and delivery location. All 3 are free.',
  },
  {
    q: 'How quickly do suppliers respond?',
    a: 'Average time to first quotation on VyaparSethu is under 4 hours. 73% of Requirements receive at least 3 quotations within 24 hours. Urgent Requirements (marked HIGH priority) are also sent as WhatsApp alerts to relevant verified suppliers immediately.',
  },
  {
    q: 'What is the Speak Requirement (Voice RFQ) feature?',
    a: 'Speak Requirement lets you post a sourcing requirement by speaking — in Hindi, English, or Hinglish. VyaparSethu uses Groq Whisper v3 for transcription and AI to extract category, quantity, grade, location, and timeline. Average time to post: 87 seconds. Works even on slow 4G connections.',
  },
  {
    q: 'How do I become a Verified Supplier on VyaparSethu?',
    a: 'Register at vyaparsethu.com/supplier/registration. Upload your GSTIN, Udyam registration certificate, and business address proof. Our team reviews within 24–48 hours. Verified Suppliers get priority placement in buyer requirement matching and a Verified badge on their profile.',
  },
  {
    q: 'Is VyaparSethu compliant with India\'s DPDP Act 2023?',
    a: 'Yes. VyaparSethu implements consent audit logging for all data collection, a right-to-erasure mechanism (PII scrubbing on request), explicit consent at registration, and data minimisation. We do not share user data with third parties for advertising. Our privacy policy is available at vyaparsethu.com/legal/privacy-policy.',
  },
  {
    q: 'What is the difference between VyaparSethu and IndiaMART?',
    a: 'IndiaMART is a supplier directory — you discover suppliers and then contact them directly, with no transaction protection. VyaparSethu is a deal-completion platform with Protected Payment (escrow), verified suppliers, and the Trade Confidence Score. VyaparSethu is not trying to replace IndiaMART for discovery — it completes the transaction safely once you\'ve shortlisted suppliers.',
  },
  {
    q: 'Does VyaparSethu support GST compliance?',
    a: 'VyaparSethu verifies supplier GSTIN at onboarding and displays it on all supplier profiles. Invoice generation includes mandatory GST fields (supplier GSTIN, buyer GSTIN, HSN code, tax breakup). For e-invoicing requirements (turnover above ₹5 crore), buyers and suppliers manage IRN generation with their own CA/accounting software — VyaparSethu provides the raw invoice data.',
  },
  {
    q: 'What happens if there is a dispute?',
    a: 'If a buyer raises a dispute after delivery, VyaparSethu\'s dispute team reviews the case within 48 hours using delivery proof, chat logs from Business Conversations, and any uploaded documents. If a resolution can\'t be reached, the dispute escalates to a registered mediator. The Protected Payment funds remain in escrow until the dispute is resolved.',
  },
  {
    q: 'Can I use VyaparSethu for large orders (above ₹10 lakh)?',
    a: 'Yes. There is no upper limit on order value for Protected Payment. For orders above ₹50 lakh, we recommend contacting our enterprise team for custom payment schedules (e.g., milestone-based releases). Enterprise buyers also get dedicated account managers and custom SLAs.',
  },
];

export default function FAQPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-4 py-14">

          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <span className="text-slate-300">FAQ</span>
          </nav>

          <h1 className="text-3xl font-bold text-white mb-3">Frequently Asked Questions</h1>
          <p className="text-slate-400 mb-10 max-w-xl">Everything you need to know about sourcing safely on VyaparSethu.</p>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer text-white font-medium text-sm leading-snug select-none hover:bg-slate-700/30 transition-colors list-none">
                  <span>{faq.q}</span>
                  <span className="text-[#D4AF37] ml-4 flex-shrink-0 text-lg group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-slate-700/40 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-7">
            <h2 className="text-white font-semibold mb-2">Still have questions?</h2>
            <p className="text-slate-400 text-sm mb-4">Our team is available on WhatsApp or email — typically respond within 2 hours during business hours (9 AM–7 PM IST).</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">Contact Us</Link>
              <Link href="/rfq/create" className="inline-block border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-5 py-2.5 rounded-lg text-sm transition-colors">Post a Requirement</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
