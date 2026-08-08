import Link from 'next/link';
import { SITE_URL } from '@/lib/site-url';
import { listClusterSlugs, INDUSTRIAL_CLUSTERS } from '@/src/data/industrial-clusters';

export const metadata = {
  title: { absolute: 'Industrial Clusters — Business Intelligence | VyaparSethu' },
  description: 'Explore India\'s industrial clusters with live Business Pulse, product intelligence, and verified supplier networks.',
  // Missing previously — page silently inherited the root layout's
  // `alternates.canonical: '/'`, i.e. self-declared the homepage as its
  // canonical despite being a distinct, sitemapped page. Verified live 8 Aug
  // 2026.
  alternates: { canonical: `${SITE_URL}/industrial-cluster` },
};

export default function IndustrialClusterIndexPage() {
  const slugs = listClusterSlugs();

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-4">Industrial Cluster Intelligence</h1>
        <p className="text-slate-400 mb-10 max-w-2xl">
          Each cluster has its own economic pulse — companies, products, requirements, and export activity.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {slugs.map(slug => {
            const c = INDUSTRIAL_CLUSTERS[slug];
            return (
              <Link
                key={slug}
                href={`/industrial-cluster/${slug}`}
                className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/40 transition-colors"
              >
                <h2 className="text-white font-semibold">{c.name}</h2>
                <p className="text-slate-500 text-xs mt-1">{c.country}{c.state ? ` · ${c.state}` : ''}</p>
                <p className="text-slate-400 text-sm mt-3 line-clamp-2">{c.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
