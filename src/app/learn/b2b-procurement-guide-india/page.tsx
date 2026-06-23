import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'B2B Procurement Guide India 2026 — RFQ, MOQ, GST, Payment Terms Explained',
  description: 'Complete B2B procurement guide for Indian SMEs: what is RFQ, MOQ, GST invoice, credit period, protected payment, and supplier verification — with step-by-step sourcing process.',
  keywords: ['b2b procurement guide india', 'b2b procurement platform', 'rfq india guide', 'b2b buying india', 'procurement terms india', 'msme procurement'],
  openGraph: {
    title: 'B2B Procurement Guide India 2026 | VyaparSethu',
    description: 'Complete procurement guide for Indian SMEs — RFQ, MOQ, GST invoice, credit terms, Protected Payment, supplier verification explained.',
    url: `${SITE_URL}/learn/b2b-procurement-guide-india`,
    siteName: 'VyaparSethu',
  },
  alternates: { canonical: `${SITE_URL}/learn/b2b-procurement-guide-india` },
};

const terms = [
  { term: 'RFQ (Request for Quotation)', def: 'A formal request sent to multiple suppliers asking for price, lead time, and terms. On VyaparSethu, called a "Requirement". Post once, receive multiple competitive quotes.' },
  { term: 'MOQ (Minimum Order Quantity)', def: 'The smallest quantity a supplier will accept per order. Exists because suppliers have fixed setup costs. Always confirm MOQ before shortlisting a supplier.' },
  { term: 'Lead Time', def: 'Total time from order placement to delivery, including manufacturing, packaging, and shipping. For custom products: 2–8 weeks. For stock items: 1–5 days.' },
  { term: 'Credit Period', def: 'Days allowed to pay after receiving goods — e.g., Net 30, Net 60. For MSME suppliers, the MSMED Act caps credit at 45 days.' },
  { term: 'Protected Payment', def: 'Buyer funds held in a regulated account until delivery is confirmed. Eliminates advance fraud. VyaparSethu uses Razorpay\'s RBI-approved nodal account.' },
  { term: 'Purchase Order (PO)', def: 'A legally binding document committing the buyer to purchase at agreed price, quantity, and delivery date. Always issue a PO before production begins.' },
  { term: 'HSN Code', def: 'Harmonised System of Nomenclature code on every B2B invoice. Determines the GST rate. Wrong HSN = wrong tax rate = ITC claim rejection.' },
  { term: 'Input Tax Credit (ITC)', def: 'The GST you pay on purchases can offset the GST you collect on sales. Only valid when the supplier\'s invoice is GST-compliant with correct GSTIN and HSN code.' },
  { term: 'Trade Confidence Score', def: 'VyaparSethu\'s 0–100 score for each supplier based on payment history, delivery punctuality, response speed, repeat orders, and dispute rate.' },
  { term: 'FOB (Free on Board)', def: 'Supplier responsibility ends when goods are loaded on the vessel at origin port. Buyer arranges freight and insurance beyond that. Common in exports.' },
];

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the procurement process for Indian SMEs?',
      acceptedAnswer: { '@type': 'Answer', text: 'The B2B procurement process for Indian SMEs: (1) Identify requirement with specification, quantity, and timeline. (2) Post RFQ (Requirement) to multiple verified suppliers. (3) Compare quotes on price, lead time, MOQ, and supplier score. (4) Select supplier and issue Purchase Order. (5) Pay via Protected Payment for first-time suppliers. (6) Confirm delivery and release payment. (7) Rate the supplier for future reference.' },
    },
    {
      '@type': 'Question',
      name: 'What documents are needed for B2B procurement in India?',
      acceptedAnswer: { '@type': 'Answer', text: 'Documents for Indian B2B procurement: GST-compliant tax invoice (with GSTIN, HSN code, CGST/SGST or IGST breakdown), Purchase Order (issued by buyer before production), Delivery Challan (goods dispatch document), E-way bill (for goods above ₹50,000 in value), and for exports: Commercial Invoice + Packing List + Bill of Lading/Airway Bill.' },
    },
    {
      '@type': 'Question',
      name: 'How do I negotiate payment terms with a supplier in India?',
      acceptedAnswer: { '@type': 'Answer', text: 'Payment term negotiation depends on relationship stage. First order: aim for 30% advance + 70% on delivery, or use Protected Payment (best option). Established relationship: Net 30 or Net 60 credit period. MSME suppliers cannot extend beyond 45 days credit under MSMED Act. Offering advance payment for a discount (5–8% off) works well with trusted suppliers who have working capital constraints.' },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between an RFQ and a Purchase Order?',
      acceptedAnswer: { '@type': 'Answer', text: 'An RFQ (Requirement) is a request for prices and terms — it is not a commitment. You send it to multiple suppliers. A Purchase Order is a legal commitment to buy from one selected supplier at agreed price, quantity, and delivery date. RFQ comes first; PO comes after you select a supplier.' },
    },
  ],
};

export default function B2BProcurementGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-4 py-16">

          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <Link href="/learn" className="hover:text-slate-300">Learn</Link><span>/</span>
            <span className="text-slate-400">B2B Procurement Guide</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 text-xs text-[#D4AF37] font-medium mb-4">
            Complete Guide
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug">
            B2B Procurement Guide India 2026
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Everything Indian SMEs need to know about B2B procurement — RFQ, MOQ, GST invoicing, credit terms, supplier verification, and Protected Payment — in one place.
          </p>

          <div className="space-y-10">

            <section>
              <h2 className="text-xl font-bold text-white mb-4">The B2B Procurement Process — Step by Step</h2>
              <div className="space-y-4">
                {[
                  { n: '1', title: 'Define your requirement', body: 'Product name + specification (grade, size, material), quantity and unit (MT, kg, pieces), delivery location (city or PIN code), required date, budget range (optional but gets better quotes), quality certifications needed (ISI, BIS, ISO, FSSAI).' },
                  { n: '2', title: 'Post to multiple verified suppliers', body: 'Send your RFQ (Requirement) to at least 3–5 suppliers simultaneously. On VyaparSethu, post once and receive competitive quotes from multiple verified suppliers — no need to contact each one separately.' },
                  { n: '3', title: 'Compare quotes on all dimensions', body: 'Compare quotes on price per unit, MOQ, lead time, GST-inclusive total, payment terms, and Trade Confidence Score. The cheapest quote is not always the best — factor in lead time reliability and supplier score.' },
                  { n: '4', title: 'Verify the shortlisted supplier', body: 'Check GSTIN on search.gst.gov.in, confirm Udyam Registration if MSME, request a sample invoice, and start with a small sample order for new suppliers.' },
                  { n: '5', title: 'Issue a Purchase Order', body: 'Issue a written PO specifying all agreed terms before the supplier begins production. This is your legal protection if terms change later.' },
                  { n: '6', title: 'Pay safely', body: 'For new suppliers: use Protected Payment (funds held until delivery confirmed). For trusted suppliers: agree credit period in the PO (Net 30, Net 60 within MSMED Act limits).' },
                  { n: '7', title: 'Confirm delivery and rate the supplier', body: 'Inspect goods against PO specification. Confirm on VyaparSethu to release Protected Payment. Rate the supplier — your rating improves the Trade Confidence Score for future buyers.' },
                ].map(s => (
                  <div key={s.n} className="flex gap-4">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#001f3f] font-bold text-xs">{s.n}</div>
                    <div className="flex-1 pt-0.5">
                      <h3 className="text-white font-semibold text-sm mb-1">{s.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Key B2B Procurement Terms</h2>
              <div className="space-y-3">
                {terms.map(t => (
                  <div key={t.term} className="bg-slate-800/30 border border-slate-700/40 rounded-lg p-4">
                    <p className="text-white font-semibold text-sm mb-1">{t.term}</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{t.def}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">GST in B2B Procurement</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-3">
                Every B2B purchase in India generates a GST tax invoice. For registered buyers, the GST paid is recoverable as Input Tax Credit (ITC) — reducing your effective cost. This makes GST cost-neutral for registered B2B buyers.
              </p>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-[#D4AF37] text-xs uppercase tracking-wider py-2 pr-4">Transaction Type</th>
                      <th className="text-left text-[#D4AF37] text-xs uppercase tracking-wider py-2 pr-4">GST Component</th>
                      <th className="text-left text-[#D4AF37] text-xs uppercase tracking-wider py-2">ITC Claimable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {[
                      ['Intra-state (same state)', 'CGST + SGST (split equally)', 'Yes — if buyer is GST registered'],
                      ['Inter-state (different state)', 'IGST (full rate)', 'Yes — if buyer is GST registered'],
                      ['Exempt goods (e.g., fresh produce)', 'None', 'N/A'],
                      ['Composition scheme supplier', 'No GST on invoice', 'No ITC for buyer'],
                    ].map(row => (
                      <tr key={row[0]}>
                        <td className="text-slate-300 text-xs py-2.5 pr-4">{row[0]}</td>
                        <td className="text-slate-400 text-xs py-2.5 pr-4">{row[1]}</td>
                        <td className="text-slate-400 text-xs py-2.5">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-slate-500 text-xs">Use VyaparSethu&apos;s free <Link href="/tools/gst-calculator" className="text-[#D4AF37] hover:underline">GST Calculator</Link> and <Link href="/tools/hsn-lookup" className="text-[#D4AF37] hover:underline">HSN Code Lookup</Link> before finalising any supplier quote.</p>
            </section>

            <section>
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

          </div>

          <div className="mt-12 flex flex-wrap gap-4 text-sm border-t border-slate-800 pt-8">
            <Link href="/glossary" className="text-[#D4AF37] hover:underline">→ Full B2B Glossary</Link>
            <Link href="/learn/what-is-b2b-marketplace" className="text-[#D4AF37] hover:underline">→ What is a B2B Marketplace</Link>
            <Link href="/learn/how-to-find-verified-b2b-suppliers-india" className="text-[#D4AF37] hover:underline">→ Find Verified Suppliers</Link>
          </div>

          <div className="mt-8 bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-8">
            <h3 className="text-white font-semibold text-lg mb-2">Start Your First Verified Procurement</h3>
            <p className="text-slate-400 text-sm mb-5">Post a Requirement in 90 seconds. Receive competitive quotes from GSTIN-verified suppliers. Pay safely via Protected Payment.</p>
            <Link href="/rfq/create" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
              Post a Requirement — Free
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
