import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GLOSSARY_TERMS, getTermBySlug, getRelatedTerms } from '@/src/data/glossary';

interface Props { params: { term: string } }

export async function generateStaticParams() {
  return GLOSSARY_TERMS.map(t => ({ term: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const term = getTermBySlug(params.term);
  if (!term) return { title: 'Not Found' };

  const termLabel   = term.title.length > 35 ? term.title.slice(0, 32) + '...' : term.title;
  const title       = { absolute: `${termLabel} | VyaparSethu Glossary` };
  const description = term.shortDef;
  const canonical   = `https://www.vyaparsethu.com/glossary/${term.slug}`;

  return {
    title,
    description,
    keywords: term.keywords,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: 'VyaparSethu' },
  };
}

export const revalidate = 86400;

export default function GlossaryTermPage({ params }: Props) {
  const term = getTermBySlug(params.term);
  if (!term) notFound();

  const related = getRelatedTerms(term.relatedSlugs);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: term.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  const definedTermSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.title.replace('What is ', '').replace('?', '').trim(),
    description: term.shortDef,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'VyaparSethu B2B Trade Glossary',
      url: 'https://www.vyaparsethu.com/glossary',
    },
    url: `https://www.vyaparsethu.com/glossary/${term.slug}`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vyaparsethu.com' },
      { '@type': 'ListItem', position: 2, name: 'Glossary', item: 'https://www.vyaparsethu.com/glossary' },
      { '@type': 'ListItem', position: 3, name: term.title, item: `https://www.vyaparsethu.com/glossary/${term.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-4 py-12">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 flex-wrap">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span>/</span>
            <Link href="/glossary" className="hover:text-slate-300">Glossary</Link>
            <span>/</span>
            <span className="text-slate-300">{term.title.replace('What is ', '').replace('?', '')}</span>
          </nav>

          {/* Category chip */}
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 text-xs text-[#D4AF37] font-medium mb-4">
            {term.category}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
            {term.title}
          </h1>

          {/* Short definition highlight */}
          <div className="bg-[#001f3f] border-l-4 border-[#D4AF37] rounded-r-xl p-5 mb-10">
            <p className="text-slate-200 text-base leading-relaxed font-medium">{term.shortDef}</p>
          </div>

          {/* Body paragraphs */}
          <div className="space-y-5 mb-12">
            {term.body.map((para, i) => (
              <p key={i} className="text-slate-300 text-base leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: para
                    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#D4AF37] underline underline-offset-2">$1</a>'),
                }}
              />
            ))}
          </div>

          {/* FAQs */}
          <div className="mb-12">
            <h2 className="text-white font-bold text-xl mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {term.faqs.map((faq, i) => (
                <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                  <h3 className="text-white font-semibold text-sm mb-2">{faq.q}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related terms */}
          {related.length > 0 && (
            <div className="mb-10">
              <h2 className="text-white font-bold text-base mb-4">Related Terms</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {related.map(r => (
                  <Link key={r.slug} href={`/glossary/${r.slug}`}
                    className="group bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/50 hover:border-[#D4AF37]/30 rounded-xl p-4 transition-all">
                    <p className="text-white text-xs font-semibold mb-1 group-hover:text-[#D4AF37] transition-colors">{r.title}</p>
                    <p className="text-slate-500 text-[11px] leading-snug line-clamp-2">{r.shortDef}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-2xl p-8">
            <h2 className="text-white font-bold text-lg mb-2">
              Put this knowledge to work
            </h2>
            <p className="text-slate-400 text-sm mb-5">
              Post a Requirement — verified suppliers quote with proper GST invoices, HSN codes, and Protected Payment on every deal.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/rfq/create"
                className="inline-flex items-center justify-center bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
                Post a Requirement — Free
              </Link>
              <Link href="/glossary"
                className="inline-flex items-center justify-center border border-slate-600 hover:border-slate-400 text-slate-400 hover:text-white px-5 py-2.5 rounded-lg text-sm transition-colors">
                ← Back to Glossary
              </Link>
            </div>
          </div>

          {/* All terms footer nav */}
          <div className="mt-10 pt-8 border-t border-slate-800">
            <p className="text-slate-500 text-xs mb-3">Other terms in this glossary:</p>
            <div className="flex flex-wrap gap-2">
              {GLOSSARY_TERMS.filter(t => t.slug !== term.slug).map(t => (
                <Link key={t.slug} href={`/glossary/${t.slug}`}
                  className="text-xs text-slate-500 hover:text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-lg transition-colors">
                  {t.title.replace('What is ', '').replace('?', '')}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
