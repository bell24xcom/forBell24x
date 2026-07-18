import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FLAGS } from '@/src/lib/feature-flags';
import { INDUSTRIAL_CLUSTERS, listClusterSlugs } from '@/src/data/industrial-clusters';
import { getClusterPulse } from '@/src/lib/bom/business-pulse';
import { getProductRecord } from '@/src/data/product-intelligence-catalog';
import { getIndustryRecord } from '@/src/data/industry-intelligence-catalog';
import type { PulseSummary } from '@/src/lib/bom/business-pulse';

interface Props { params: { slug: string } }

export const revalidate = 3600;

export async function generateStaticParams() {
  return listClusterSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cluster = INDUSTRIAL_CLUSTERS[params.slug];
  if (!cluster) return { title: 'Not Found' };
  const title = `${cluster.name} — Industrial Cluster Intelligence | VyaparSethu`;
  return {
    title: { absolute: title },
    description: cluster.description,
    alternates: { canonical: `https://www.vyaparsethu.com/industrial-cluster/${params.slug}` },
  };
}

function highlights(summary: PulseSummary): { label: string; icon: string }[] {
  const items: { label: string; icon: string }[] = [];
  if (summary.newCompanies > 0) items.push({ label: 'New companies', icon: '🟢' });
  if (summary.newProducts > 0) items.push({ label: 'New products', icon: '📦' });
  if (summary.newRfqs > 0) items.push({ label: 'Requirements posted', icon: '📋' });
  if (summary.quotes > 0) items.push({ label: 'Quotes flowing', icon: '💬' });
  if (summary.dealsClosed > 0) items.push({ label: 'Deals closing', icon: '🤝' });
  if (summary.exporters > 0) items.push({ label: 'Export activity', icon: '🚢' });
  if (summary.factoryExpansions > 0) items.push({ label: 'Factory expansion', icon: '🏭' });
  return items;
}

export default async function IndustrialClusterPage({ params }: Props) {
  if (!FLAGS.INTELLIGENCE_ENABLED) {
    notFound();
  }

  const cluster = INDUSTRIAL_CLUSTERS[params.slug];
  if (!cluster) notFound();

  const pulse = await getClusterPulse(params.slug, 7);
  const activity = highlights(pulse.summary);
  const clusterProducts = await Promise.all(cluster.relatedProductSlugs.map(slug => getProductRecord(slug)));
  const clusterIndustries = await Promise.all(cluster.relatedIndustrySlugs.map(slug => getIndustryRecord(slug)));

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 flex-wrap">
          <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
          <Link href="/industrial-cluster" className="hover:text-slate-300">Industrial Clusters</Link><span>/</span>
          <span className="text-slate-300">{cluster.name}</span>
        </nav>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-1.5 text-xs text-cyan-300 font-medium mb-4">
            {cluster.country} · {cluster.state ?? 'Industrial Cluster'}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{cluster.name}</h1>
          <p className="text-slate-400 text-lg max-w-3xl">{cluster.description}</p>
        </div>

        <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-6 mb-10">
          <h2 className="text-white font-semibold mb-2">Cluster Intelligence</h2>
          <p className="text-slate-300 text-sm leading-relaxed">{cluster.clusterNote}</p>
        </div>

        <section className="mb-12">
          <h2 className="text-white font-semibold text-lg mb-5">Business Pulse — This Week</h2>
          {activity.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {activity.map(h => (
                <div key={h.label} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-xl">{h.icon}</span>
                  <span className="text-slate-200 text-sm">{h.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm bg-slate-800/30 border border-slate-700/40 rounded-xl p-6">
              Cluster pulse is building — verified suppliers onboarding in {cluster.city ?? cluster.name}.
            </p>
          )}
          {pulse.trendingCategories.length > 0 && (
            <div className="mt-4">
              <p className="text-slate-500 text-xs mb-2">Trending categories</p>
              <div className="flex flex-wrap gap-2">
                {pulse.trendingCategories.map(c => (
                  <span key={c} className="text-xs px-3 py-1 rounded-full border border-slate-600 text-slate-300">{c}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        {cluster.relatedProductSlugs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-white font-semibold text-lg mb-5">Key Products in this Cluster</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {cluster.relatedProductSlugs.map((slug, i) => {
                const p = clusterProducts[i];
                if (!p) return null;
                return (
                  <Link
                    key={slug}
                    href={`/product-intelligence/${slug}`}
                    className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-[#D4AF37]/40 transition-colors"
                  >
                    <h3 className="text-white font-medium text-sm">{p.name}</h3>
                    <p className="text-slate-400 text-xs mt-2 line-clamp-2">{p.description}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {cluster.relatedIndustrySlugs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-white font-semibold text-lg mb-5">Industries</h2>
            <div className="space-y-3">
              {cluster.relatedIndustrySlugs.map((slug, i) => {
                const ind = clusterIndustries[i];
                if (!ind) return null;
                return (
                  <div key={slug} className="bg-slate-800/30 border border-slate-700/40 rounded-lg px-4 py-3">
                    <p className="text-white text-sm font-medium">{ind.name}</p>
                    <p className="text-slate-400 text-xs mt-1">{ind.description.slice(0, 120)}…</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="flex flex-wrap gap-3">
          {cluster.areaKey && (
            <Link href={`/location/${cluster.areaKey}`} className="text-sm text-cyan-400 hover:text-cyan-300">
              View Location Pulse →
            </Link>
          )}
          {cluster.areaKey && (
            <Link href={`/suppliers/${cluster.areaKey}`} className="text-sm text-[#D4AF37] hover:opacity-80">
              Browse suppliers →
            </Link>
          )}
          <Link href="/rfq/create" className="text-sm text-slate-300 hover:text-white">
            Post a Requirement →
          </Link>
        </div>
      </div>
    </div>
  );
}
