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
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              Every Indian B2B buyer and supplier should understand these terms before their first transaction.
              Plain language, no jargon.
            </p>
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
