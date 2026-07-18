import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FLAGS } from '@/src/lib/feature-flags';
import { getProductRecord, listProductSlugs } from '@/src/data/product-intelligence-catalog';
import { buildProductIntelligenceMetadata, buildProductJsonLd } from '@/src/lib/product-intelligence/seo';
import { getProductClusters, getRelatedProducts } from '@/src/lib/product-intelligence/engine';

interface Props { params: { slug: string } }

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await listProductSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  return buildProductIntelligenceMetadata(params.slug);
}

export default async function ProductIntelligencePage({ params }: Props) {
  if (!FLAGS.INTELLIGENCE_ENABLED) {
    notFound();
  }

  const product = await getProductRecord(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(params.slug);
  const clusters = await getProductClusters(params.slug);
  const { productSchema, faqSchema, breadcrumb } = buildProductJsonLd(product);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <nav className="text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/product-intelligence" className="hover:text-slate-300">Product Intelligence</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-300">{product.name}</span>
          </nav>

          <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>
          <p className="text-slate-400 mb-8">{product.description}</p>

          <div className="grid sm:grid-cols-2 gap-4 mb-10 text-sm">
            {product.commercial.hsCode && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                <p className="text-slate-500 text-xs">HS Code</p>
                <p className="text-white">{product.commercial.hsCode}</p>
              </div>
            )}
            {product.commercial.moq && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                <p className="text-slate-500 text-xs">MOQ</p>
                <p className="text-white">{product.commercial.moq}</p>
              </div>
            )}
            {product.commercial.leadTime && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                <p className="text-slate-500 text-xs">Lead time</p>
                <p className="text-white">{product.commercial.leadTime}</p>
              </div>
            )}
            {product.commercial.priceRange && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                <p className="text-slate-500 text-xs">Price range</p>
                <p className="text-white">{product.commercial.priceRange}</p>
              </div>
            )}
          </div>

          {product.knowledge.faqs && product.knowledge.faqs.length > 0 && (
            <section className="mb-10">
              <h2 className="text-white font-semibold mb-4">FAQs</h2>
              <div className="space-y-4">
                {product.knowledge.faqs.map(f => (
                  <div key={f.q} className="border border-slate-700/50 rounded-lg p-4">
                    <p className="text-white text-sm font-medium">{f.q}</p>
                    <p className="text-slate-400 text-sm mt-2">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {clusters.length > 0 && (
            <section className="mb-10">
              <h2 className="text-white font-semibold mb-4">Industrial clusters</h2>
              <div className="flex flex-wrap gap-2">
                {clusters.map(c => c && (
                  <Link
                    key={c.slug}
                    href={`/industrial-cluster/${c.slug}`}
                    className="text-sm px-3 py-1.5 rounded-full border border-cyan-700/50 text-cyan-300 hover:bg-cyan-900/20"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section>
              <h2 className="text-white font-semibold mb-4">Related products</h2>
              <div className="flex flex-wrap gap-2">
                {related.map(p => (
                  <Link
                    key={p.slug}
                    href={`/product-intelligence/${p.slug}`}
                    className="text-sm px-3 py-1.5 rounded-full border border-[#D4AF37]/40 text-[#D4AF37]"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mt-12">
            <Link href="/rfq/create" className="inline-block bg-[#D4AF37] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm">
              Post a Requirement — Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
