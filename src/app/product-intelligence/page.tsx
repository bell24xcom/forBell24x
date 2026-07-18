import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FLAGS } from '@/src/lib/feature-flags';
import { listProductSlugs, getProductRecord } from '@/src/data/product-intelligence-catalog';

export const metadata = {
  title: { absolute: 'Product Intelligence — Business Knowledge Graph | VyaparSethu' },
  description: 'Structured product intelligence for B2B sourcing — manufacturing, HS codes, export markets, and cluster connections.',
};

export default async function ProductIntelligenceIndexPage() {
  if (!FLAGS.INTELLIGENCE_ENABLED) {
    notFound();
  }

  const slugs = await listProductSlugs();
  const products = await Promise.all(slugs.map(slug => getProductRecord(slug)));

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-4">Product Intelligence</h1>
        <p className="text-slate-400 mb-10">Every product is an intelligent entity — not just a category listing.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {products.map((p, i) => {
            const slug = slugs[i];
            if (!p) return null;
            return (
              <Link
                key={slug}
                href={`/product-intelligence/${slug}`}
                className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-[#D4AF37]/40"
              >
                <h2 className="text-white font-semibold">{p.name}</h2>
                <p className="text-slate-500 text-xs mt-1">{p.category}</p>
                <p className="text-slate-400 text-sm mt-2 line-clamp-2">{p.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
