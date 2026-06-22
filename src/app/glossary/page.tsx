import { Metadata } from 'next';
import Link from 'next/link';
import { GLOSSARY_TERMS, GLOSSARY_CATEGORIES } from '@/src/data/glossary';

export const metadata: Metadata = {
  title: 'B2B Trade Glossary — MSME, HSN, GST, RFQ & More | VyaparSethu',
  description: 'Plain-language explanations of Indian B2B trade terms: MSME, HSN codes, GST invoices, RFQ, Purchase Orders, Escrow, Trade Credit, and more. For buyers and suppliers.',
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
              <h3 className="text-white font-semibold mb-2">GST — Goods and Services Tax</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                India&apos;s unified indirect tax system replacing VAT, excise, and service tax. B2B
                transactions between registered businesses allow input tax credit claims — meaning the
                tax you pay on purchases can be offset against the tax you collect on sales. Always
                confirm your supplier&apos;s GSTIN before placing a large order.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">Udyam Registration</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The Indian government&apos;s official MSME registration system replacing the old Udyog
                Aadhaar. Suppliers with a valid Udyam number are legally registered businesses. On
                VyaparSethu, we verify Udyam numbers against the government database before a supplier
                profile goes live.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">Credit Period</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The time a supplier allows a buyer to pay after receiving goods. Common credit periods
                in Indian B2B trade range from 15 to 90 days. Always confirm credit terms in writing
                before you place an order to avoid disputes later.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">Lead Time</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The total time between placing an order and receiving goods, including manufacturing,
                packaging, and shipping. Always confirm lead time before committing to a supplier,
                especially for custom-made products.
              </p>
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
