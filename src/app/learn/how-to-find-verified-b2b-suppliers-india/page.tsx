import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'How to Find Verified B2B Suppliers in India — 7-Step Guide',
  description: 'Step-by-step guide to finding verified B2B suppliers in India: GSTIN check, Udyam verification, sample orders, and how to use VyaparSethu to source from pre-verified suppliers safely.',
  keywords: ['how to find verified suppliers india', 'b2b supplier verification india', 'find supplier india', 'verified supplier india', 'gstin supplier check india'],
  openGraph: {
    title: 'How to Find Verified B2B Suppliers in India | VyaparSethu',
    description: '7-step guide to finding and verifying B2B suppliers in India — GSTIN check, Udyam, sample orders, and VyaparSethu\'s pre-verified supplier network.',
    url: `${SITE_URL}/learn/how-to-find-verified-b2b-suppliers-india`,
    siteName: 'VyaparSethu',
  },
  alternates: { canonical: `${SITE_URL}/learn/how-to-find-verified-b2b-suppliers-india` },
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I verify a supplier in India?',
      acceptedAnswer: { '@type': 'Answer', text: 'Verify a supplier by checking their GSTIN on search.gst.gov.in, confirming their Udyam Registration on udyamregistration.gov.in, requesting a GST-compliant sample invoice, and placing a small sample order before committing to a large purchase. On VyaparSethu, all these checks are done automatically before a supplier profile goes live.' },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between a manufacturer and a supplier in India?',
      acceptedAnswer: { '@type': 'Answer', text: 'A manufacturer makes the product from raw materials. A supplier is a broader term — it can be a manufacturer, a trader who resells, or an importer. A middleman (broker) does not hold inventory but connects buyers to manufacturers. For the best B2B price, buy directly from the manufacturer when possible. Verify GSTIN to confirm the business type.' },
    },
    {
      '@type': 'Question',
      name: 'How do I protect myself from advance payment fraud when buying from a new supplier?',
      acceptedAnswer: { '@type': 'Answer', text: 'Use Protected Payment through VyaparSethu — buyer funds are held in a Razorpay-regulated nodal account and released to the supplier only after you confirm delivery. Never pay full advance to an unverified supplier. Always start with a small sample order. Verify GSTIN before any payment.' },
    },
    {
      '@type': 'Question',
      name: 'What is a Trade Confidence Score?',
      acceptedAnswer: { '@type': 'Answer', text: 'VyaparSethu\'s Trade Confidence Score rates suppliers on a scale of 0–100 based on payment history (30%), on-time delivery (20%), response speed (15%), repeat orders (15%), dispute rate (10%), and verification strength (10%). Higher-score suppliers have a proven track record of reliable supply.' },
    },
  ],
};

const steps = [
  {
    n: '01',
    title: 'Verify GSTIN on the government portal',
    body: 'Every legitimate Indian business has an active GSTIN. Check on search.gst.gov.in — enter the supplier\'s GSTIN and confirm the Legal Name matches what the supplier told you, the Registration Status is "Active" (not cancelled), and the Principal Place of Business matches their stated location.',
    warning: 'A cancelled or non-existent GSTIN is a hard stop — do not proceed.',
  },
  {
    n: '02',
    title: 'Check Udyam Registration (for MSME suppliers)',
    body: 'If the supplier claims MSME status, verify their Udyam Registration Number (URN) on udyamregistration.gov.in. The URN confirms the business is registered as Micro, Small, or Medium, and the category (Micro: turnover ≤ ₹5 cr; Small: ≤ ₹50 cr; Medium: ≤ ₹250 cr). MSME-registered suppliers have government-backed legal status.',
    warning: null,
  },
  {
    n: '03',
    title: 'Request a sample GST invoice',
    body: 'Ask for a blank sample invoice before placing any order. A properly formatted GST invoice must include: Supplier\'s GSTIN and Legal Name, Your GSTIN, HSN code of the product, CGST + SGST (intra-state) or IGST (inter-state) breakdown clearly shown, Invoice number and date. Reject any supplier who cannot provide a correctly formatted invoice — you cannot claim ITC on non-compliant invoices.',
    warning: null,
  },
  {
    n: '04',
    title: 'Place a small sample order first',
    body: 'Never start with a large order from an unverified supplier. Place a sample order — typically ₹5,000–15,000 — to verify actual product quality, packaging, labelling, and lead time. A genuine manufacturer will accept small sample orders. A middleman or fraud will often push you toward large upfront orders.',
    warning: null,
  },
  {
    n: '05',
    title: 'Check Trade Confidence Score on VyaparSethu',
    body: 'VyaparSethu\'s Trade Confidence Score (0–100) rates each supplier on payment history, on-time delivery, response speed, repeat orders, dispute rate, and verification strength. The score is computed from actual transaction data — not self-reported. Higher scores mean more reliable supply history.',
    warning: null,
  },
  {
    n: '06',
    title: 'Issue a Purchase Order before production begins',
    body: 'Once you have selected a supplier, issue a written Purchase Order specifying product description, quantity, unit price, delivery date, delivery location, and payment terms. A PO is a legal commitment — it protects you if the supplier tries to change terms after production begins, and gives the supplier documented proof of your order.',
    warning: null,
  },
  {
    n: '07',
    title: 'Use Protected Payment for first-time transactions',
    body: 'For any first-time transaction with a new supplier, use VyaparSethu\'s Protected Payment. Your funds are held in a Razorpay-regulated nodal account and released only after you confirm receipt and quality. This eliminates advance fraud risk entirely on the first order — the highest-risk transaction in any new supplier relationship.',
    warning: null,
  },
];

export default function HowToFindVerifiedSuppliersPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-4 py-16">

          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <Link href="/learn" className="hover:text-slate-300">Learn</Link><span>/</span>
            <span className="text-slate-400">Find Verified Suppliers</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 text-xs text-[#D4AF37] font-medium mb-4">
            Step-by-Step Guide
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug">
            How to Find Verified B2B Suppliers in India
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Advance payment fraud, fake suppliers, and middlemen posing as manufacturers cost Indian B2B buyers crores every year. This 7-step process eliminates those risks before you place your first order.
          </p>

          <div className="space-y-6 mb-12">
            {steps.map(step => (
              <div key={step.n} className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#001f3f] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                  {step.n}
                </div>
                <div className="flex-1 pt-1">
                  <h2 className="text-white font-semibold mb-2">{step.title}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.body}</p>
                  {step.warning && (
                    <p className="mt-2 text-amber-400 text-xs font-medium">⚠ {step.warning}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-12 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">Supplier Verification Checklist</h2>
            <div className="space-y-2">
              {[
                'GSTIN verified on search.gst.gov.in — Status: Active',
                'Legal Name on GSTIN matches supplier\'s stated business name',
                'Udyam Registration confirmed (if MSME claimed)',
                'Sample GST invoice received and format is compliant',
                'Sample order placed and goods received',
                'Product quality matches specification',
                'Lead time matches what was quoted',
                'Purchase Order issued and signed/acknowledged',
                'Protected Payment used for first full order',
                'Trade Confidence Score reviewed on VyaparSethu',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-4 h-4 border border-slate-600 rounded mt-0.5" />
                  <span className="text-slate-400 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-5">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {faqLd.mainEntity.map(item => (
                <div key={item.name} className="border-b border-slate-800 pb-5">
                  <h3 className="text-white font-semibold text-sm mb-2">{item.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm mb-12">
            <Link href="/glossary" className="text-[#D4AF37] hover:underline">→ B2B Glossary</Link>
            <Link href="/tools/hsn-lookup" className="text-[#D4AF37] hover:underline">→ HSN Code Lookup</Link>
            <Link href="/tools/gst-calculator" className="text-[#D4AF37] hover:underline">→ GST Calculator</Link>
            <Link href="/learn/b2b-procurement-guide-india" className="text-[#D4AF37] hover:underline">→ B2B Procurement Guide</Link>
          </div>

          <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-8">
            <h3 className="text-white font-semibold text-lg mb-2">Source from Pre-Verified Suppliers</h3>
            <p className="text-slate-400 text-sm mb-5">Every supplier on VyaparSethu is GSTIN-verified before their profile goes live. Skip steps 1–3 and start from a verified baseline.</p>
            <Link href="/rfq/create" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
              Post a Requirement — Free
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
