import { Metadata } from 'next';
import Link from 'next/link';
import { GLOSSARY_TERMS, GLOSSARY_CATEGORIES } from '@/src/data/glossary';

export const metadata: Metadata = {
  title: 'B2B Trade Glossary — MSME, HSN, GST, RFQ & More | VyaparSethu',
  description: 'Plain-language explanations of Indian B2B trade terms: MSME, HSN codes, GST invoices, RFQ, Purchase Orders, Protected Payment, Trade Credit, and more. For buyers and suppliers.',
  keywords: ['B2B trade glossary India', 'MSME meaning', 'HSN code', 'GST invoice', 'RFQ meaning', 'trade terms India'],
  alternates: { canonical: 'https://www.vyaparsethu.com/glossary' },
  openGraph: {
    title: 'B2B Trade Glossary | VyaparSethu',
    description: 'Plain-language explanations of Indian B2B trade terms every buyer and supplier should know.',
    url: 'https://www.vyaparsethu.com/glossary',
    siteName: 'VyaparSethu',
  },
};

export default function GlossaryIndex() {
  const byCategory = GLOSSARY_CATEGORIES.map(cat => ({
    cat,
    terms: GLOSSARY_TERMS.filter(t => t.category === cat),
  })).filter(g => g.terms.length > 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'VyaparSethu B2B Trade Glossary',
    description: 'Indian B2B trade terminology explained in plain language',
    url: 'https://www.vyaparsethu.com/glossary',
    hasDefinedTerm: GLOSSARY_TERMS.map(t => ({
      '@type': 'DefinedTerm',
      name: t.title.replace('What is ', '').replace('?', ''),
      description: t.shortDef,
      url: `https://www.vyaparsethu.com/glossary/${t.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-4xl mx-auto px-4 py-12">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span>/</span>
            <span className="text-slate-300">Glossary</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 text-xs text-[#D4AF37] font-medium mb-4">
              {GLOSSARY_TERMS.length} Terms · Plain Language · India-focused
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              B2B Trade Glossary
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed mb-4">
              Every Indian B2B buyer and supplier should understand these terms before their first transaction.
              Plain language, no jargon.
            </p>
            <p className="text-slate-500 text-sm max-w-2xl leading-relaxed mb-3">
              India&apos;s B2B trade landscape uses terminology drawn from GST compliance, MSME policy,
              banking regulations, and international trade law. Terms like HSN codes, IGST, Letter of
              Credit, and Purchase Order carry specific legal and financial meaning that directly affects
              how deals are structured, how taxes are filed, and how disputes are resolved.
            </p>
            <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
              This glossary covers the vocabulary every buyer and supplier on the VyaparSethu Trade Network
              encounters — from posting a Requirement and receiving quotes to completing a deal under
              Protected Payment. Each definition links to a full explanation with examples, common mistakes,
              and how the term applies to MSME transactions specifically.
            </p>
          </div>

          {/* Why terminology matters + key term definitions */}
          <div className="mb-12 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-white font-bold text-xl mb-4">Why B2B Terminology Matters</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              Misunderstanding terms like FOB, CIF, or credit period can cost lakhs in bad deals. A buyer
              who does not know the difference between EXW and DDP may end up paying unexpected freight
              and customs charges. A supplier who misquotes MOQ may lose a large order. Use this glossary
              to compare quotes accurately, set clear payment terms, and protect your business with
              legally sound agreements.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              India&apos;s B2B trade landscape carries specific legal and financial meaning in every term —
              from how GST input tax credit flows between registered businesses to how Udyam numbers
              determine MSME lending eligibility. Understanding these terms before your first transaction
              protects small-scale MSME owners from payment defaults, bad debts, and non-compliance
              penalties under the Indian DPDP Act, 2023.
            </p>
          </div>

          {/* Core term definitions — inline for SEO and readers */}
          <div className="mb-12 space-y-6">
            <h2 className="text-white font-semibold text-sm uppercase tracking-widest flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-800" />Essential Terms<span className="h-px flex-1 bg-slate-800" />
            </h2>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">RFQ — Request for Quotation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A Request for Quotation is a formal document a buyer sends to multiple suppliers asking
                for price, lead time, and payment terms before placing an order. A good RFQ includes
                the product name, specification, quantity, delivery location, required date, and any
                quality certifications needed. On VyaparSethu, an RFQ is called a &ldquo;Requirement&rdquo; and can
                be posted by voice, video, or text in under 90 seconds.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">MOQ — Minimum Order Quantity</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The smallest quantity a supplier is willing to sell in a single order. MOQ exists because
                suppliers have fixed setup costs — a dye house may set MOQ at 500 metres of fabric
                because any smaller run is uneconomical. Always clarify MOQ before finalising a
                supplier, especially for custom or manufactured products. On VyaparSethu, suppliers
                include their MOQ in every Quotation so buyers can compare directly.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">GST — Goods and Services Tax</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                India&apos;s unified indirect tax system that replaced VAT, excise duty, and service tax
                in July 2017. B2B transactions between GST-registered businesses allow Input Tax Credit
                (ITC) claims — the tax you pay on purchases offsets the tax you collect on sales,
                making GST cost-neutral for registered businesses. Always confirm your supplier&apos;s
                GSTIN before placing a large order, and ensure invoices carry the correct HSN code,
                CGST/SGST or IGST breakdown, and both parties&apos; GSTINs.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">HSN Code — Harmonised System of Nomenclature</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A 6–8 digit international product classification code used on all B2B GST invoices to
                determine the applicable tax rate. Getting the HSN code wrong means the wrong GST rate
                is applied, which can trigger audit notices and disallow your ITC claim. Businesses
                with turnover above ₹5 crore must use 6-digit HSN codes on all invoices. Use
                VyaparSethu&apos;s free HSN Code Lookup tool to find the correct code for any product.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">Udyam Registration</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The Indian government&apos;s official MSME registration system, replacing the old Udyog
                Aadhaar from July 2020. Registered on udyamregistration.gov.in using Aadhaar and PAN
                — free and paperless, with no documents to upload. Suppliers with a valid Udyam
                Registration Number (URN) are legally recognised MSMEs and eligible for collateral-free
                loans, government tender quotas, and protection under the MSMED Act&apos;s 45-day payment
                rule. On VyaparSethu, Udyam numbers are verified against the government database before
                a supplier profile goes live.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">Purchase Order (PO)</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A legally binding commercial document issued by a buyer to a supplier, confirming the
                agreed product, quantity, price, delivery date, and payment terms. Once the supplier
                accepts a PO, it becomes a contract. A proper PO protects both parties: the buyer
                cannot later claim a different price, and the supplier has documented proof of the order
                to pursue payment if delayed. In Indian B2B trade, verbal orders frequently lead to
                disputes — always issue a written PO before production begins.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">Credit Period</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The number of days a supplier allows a buyer to pay after receiving goods, written as
                &ldquo;Net 30&rdquo;, &ldquo;Net 60&rdquo;, etc. Common credit periods in Indian B2B trade range from 15 to
                90 days. For MSME suppliers, the MSMED Act caps this at 45 days — buyers who pay late
                owe compound interest at 3× the RBI base rate. Always confirm credit terms in writing
                before placing an order to avoid disputes later.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">Lead Time</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The total time between placing an order and receiving the goods at your location,
                including manufacturing, quality checks, packaging, and shipping. For custom-made
                products, lead time can range from 2 days to 8 weeks. For stock items, it is often
                1–5 days for domestic supply. Always confirm lead time before committing to a supplier,
                especially for project-linked procurement with fixed deadlines.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">FOB — Free on Board</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                An Incoterm (international trade term) that defines where the supplier&apos;s
                responsibility ends and the buyer&apos;s begins. FOB means the supplier is responsible for
                getting goods onto the vessel at the origin port. From that point, the buyer bears
                freight, insurance, and risk. In Indian domestic trade, &ldquo;ex-works&rdquo; (EXW) is more
                common — the buyer arranges their own transporter from the supplier&apos;s factory gate.
                Always clarify delivery terms in your Requirement to get comparable quotes.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">MSME — Micro, Small and Medium Enterprise</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                India&apos;s official classification for businesses with investment and turnover below
                prescribed limits (Micro: turnover ≤ ₹5 cr; Small: ≤ ₹50 cr; Medium: ≤ ₹250 cr).
                MSME status unlocks priority bank lending, 25% government procurement quotas, and legal
                protection for delayed payments. Register free on udyamregistration.gov.in. On
                VyaparSethu, verified MSMEs receive a badge visible to buyers — which increases quote
                shortlisting rates significantly.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">OEM — Original Equipment Manufacturer</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A company that manufactures products or components that are then sold under another
                brand&apos;s label. In B2B trade, buyers often request OEM manufacturing — they provide the
                design, branding, and specifications, and the OEM produces to those exact requirements.
                Distinct from an ODM (Original Design Manufacturer), where the manufacturer also
                owns the product design. When posting a Requirement on VyaparSethu, specifying
                &ldquo;OEM required&rdquo; filters for suppliers capable of custom manufacturing under your brand.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">Protected Payment</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                VyaparSethu&apos;s payment mechanism where the buyer&apos;s funds are held securely via
                Razorpay&apos;s regulated nodal account until the supplier delivers and the buyer confirms
                receipt. Protects buyers from advance payment fraud — the supplier receives funds only
                after successful delivery. Protects suppliers from buyers who place orders and
                disappear — payment is already committed. All transactions on VyaparSethu are covered
                by Protected Payment by default on first-time supplier relationships.
              </p>
            </div>
          </div>

          {/* FAQ section */}
          <div className="mb-12 bg-[#001f3f] border border-[#D4AF37]/20 rounded-2xl p-8">
            <h2 className="text-white font-bold text-xl mb-6">Glossary — Frequently Asked Questions</h2>
            <div className="space-y-5">
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">What is the difference between an RFQ and a Purchase Order?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  An RFQ (Requirement) is sent to multiple suppliers asking for their price and terms
                  — it is a request, not a commitment. A Purchase Order is issued to one selected
                  supplier after you have chosen their quote — it is a legally binding commitment to
                  buy at the agreed price and terms.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">What is the difference between a Manufacturer, Supplier, and Distributor?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  A Manufacturer makes the product from raw materials or components. A Supplier is a
                  broad term for any entity in the supply chain that provides goods — it can be a
                  manufacturer, trader, or importer. A Distributor buys in bulk from manufacturers
                  and resells to smaller buyers, typically covering a specific geography. For the best
                  B2B prices, buy directly from the manufacturer when possible.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">What is the difference between FOB and EXW?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  EXW (Ex-Works) means the buyer collects goods from the supplier&apos;s premises and
                  bears all onward cost and risk. FOB (Free on Board) means the supplier delivers
                  goods to the ship at the origin port — from that point, the buyer takes
                  responsibility. For domestic Indian trade, EXW is most common. For exports, FOB is
                  the standard baseline.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">How do I verify a supplier before placing an order?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Verify the supplier&apos;s GSTIN on the government GST portal (search.gst.gov.in) to
                  confirm their legal name and active registration. Check their Udyam Registration if
                  they claim MSME status. Request sample invoices to verify GST invoice format
                  compliance. On VyaparSethu, GST and Udyam verification is done automatically
                  during supplier onboarding — every verified supplier carries a trust badge on their
                  profile.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">What does &ldquo;Net 30&rdquo; mean in a B2B invoice?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Net 30 means the buyer must pay the invoice within 30 days of the invoice date or
                  goods receipt (whichever is specified). Other common terms are Net 15, Net 45, and
                  Net 60. For MSME suppliers, the maximum credit period under the MSMED Act is 45
                  days. Always confirm payment terms in writing on the Purchase Order before the
                  supplier begins production or delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Categories */}
          {byCategory.map(({ cat, terms }) => (
            <section key={cat} className="mb-10">
              <h2 className="text-white font-semibold text-sm uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-800" />
                {cat}
                <span className="h-px flex-1 bg-slate-800" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {terms.map(term => (
                  <Link key={term.slug} href={`/glossary/${term.slug}`}
                    className="group bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 hover:border-[#D4AF37]/30 rounded-xl p-5 transition-all">
                    <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {term.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{term.shortDef}</p>
                    <span className="inline-block mt-3 text-xs text-[#D4AF37]/60 group-hover:text-[#D4AF37]">Read definition →</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {/* CTA */}
          <div className="mt-12 bg-[#001f3f] border border-[#D4AF37]/20 rounded-2xl p-8 text-center">
            <h2 className="text-white font-bold text-xl mb-3">Ready to trade smarter?</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-lg mx-auto">
              Post a Requirement and get 3+ verified supplier quotes within 24 hours — with Protected Payment on every deal.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/rfq/create"
                className="inline-flex items-center justify-center bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
                Post a Requirement — Free
              </Link>
              <Link href="/supplier/registration"
                className="inline-flex items-center justify-center border border-slate-600 hover:border-[#D4AF37]/50 text-slate-300 hover:text-white px-6 py-3 rounded-lg text-sm transition-colors">
                Register as Supplier
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
