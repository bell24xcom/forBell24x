import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CITIES, CATEGORY_META } from '@/src/data/city-category-seo';
import { getAreaPulse } from '@/src/lib/bom/business-pulse';
import { nearbyAreas } from '@/src/lib/bom/location';
import type { PulseSummary } from '@/src/lib/bom/business-pulse';

interface Props { params: { area: string } }

export const revalidate = 3600;

export async function generateStaticParams() {
  return Object.keys(CITIES).map(area => ({ area }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = CITIES[params.area];
  if (!city) return { title: 'Not Found' };
  const seoTitle = `Business Pulse — ${city.name} Industrial Cluster | VyaparSethu`;
  const description = `Live trade activity in ${city.fullName}. ${city.description} Source verified suppliers with Protected Payment on VyaparSethu.`;
  return {
    title: { absolute: seoTitle },
    description,
    keywords: [
      `${city.name} business activity`,
      `${city.name} industrial cluster`,
      `B2B trade ${city.name}`,
      `${city.name} suppliers`,
    ],
    openGraph: {
      title: seoTitle,
      description,
      url: `https://www.vyaparsethu.com/location/${params.area}`,
      siteName: 'VyaparSethu',
      images: [{ url: 'https://www.vyaparsethu.com/og-image.png', width: 1200, height: 630, alt: seoTitle }],
    },
    alternates: { canonical: `https://www.vyaparsethu.com/location/${params.area}` },
  };
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/** Only surface non-zero counts — brand rule: no public zeros. */
function activePulseHighlights(summary: PulseSummary): { label: string; icon: string }[] {
  const items: { label: string; icon: string }[] = [];
  if (summary.newCompanies > 0) items.push({ label: 'New companies joined', icon: '🟢' });
  if (summary.newProducts > 0) items.push({ label: 'Products listed', icon: '📦' });
  if (summary.newRfqs > 0) items.push({ label: 'Requirements posted', icon: '📋' });
  if (summary.quotes > 0) items.push({ label: 'Quotes received', icon: '💬' });
  if (summary.dealsClosed > 0) items.push({ label: 'Deals closed', icon: '🤝' });
  if (summary.payments > 0) items.push({ label: 'Protected payments', icon: '💳' });
  if (summary.exporters > 0) items.push({ label: 'Export activity', icon: '🚢' });
  if (summary.factoryExpansions > 0) items.push({ label: 'Factory expansions', icon: '🏭' });
  if (summary.verifications > 0) items.push({ label: 'Verifications completed', icon: '🏅' });
  return items;
}

export default async function LocationPulsePage({ params }: Props) {
  const city = CITIES[params.area];
  if (!city) notFound();

  const pulse = await getAreaPulse(params.area, 7);
  const neighbours = nearbyAreas(params.area);
  const highlights = activePulseHighlights(pulse.summary);

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vyaparsethu.com' },
      { '@type': 'ListItem', position: 2, name: 'Industrial Areas', item: 'https://www.vyaparsethu.com/location' },
      { '@type': 'ListItem', position: 3, name: city.fullName, item: `https://www.vyaparsethu.com/location/${params.area}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 flex-wrap">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <Link href="/location" className="hover:text-slate-300">Industrial Areas</Link><span>/</span>
            <span className="text-slate-300">{city.fullName}</span>
          </nav>

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/30 rounded-full px-4 py-1.5 text-xs text-[#10b981] font-medium mb-4">
              Business Pulse · {city.state}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {city.name} — Industrial Trade Pulse
            </h1>
            <p className="text-slate-400 text-lg max-w-3xl">{city.description}</p>
          </div>

          <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-6 mb-10">
            <h2 className="text-white font-semibold mb-2">Cluster Intelligence</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{city.clusterNote}</p>
          </div>

          <section className="mb-12">
            <h2 className="text-white font-semibold text-lg mb-5">This Week in {city.name}</h2>
            {pulse.hasActivity && highlights.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {highlights.map((h) => (
                  <div
                    key={h.label}
                    className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 flex items-start gap-3"
                  >
                    <span className="text-xl" aria-hidden>{h.icon}</span>
                    <p className="text-slate-200 text-sm font-medium">{h.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-6">
                <p className="text-slate-300 text-sm">
                  Business Pulse is building in {city.name}. Verified suppliers are onboarding —
                  reserve your category to be first in this cluster.
                </p>
              </div>
            )}
          </section>

          {pulse.feed.length > 0 && (
            <section className="mb-12">
              <h2 className="text-white font-semibold text-lg mb-5">Recent Activity</h2>
              <ul className="space-y-3">
                {pulse.feed.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 bg-slate-800/30 border border-slate-700/40 rounded-lg px-4 py-3"
                  >
                    <span className="text-lg shrink-0" aria-hidden>{item.icon}</span>
                    <span className="text-slate-200 text-sm flex-1">{item.label}</span>
                    {item.category && (
                      <span className="text-xs text-slate-500 hidden sm:inline">{item.category}</span>
                    )}
                    <span className="text-xs text-slate-500 shrink-0">{relativeTime(item.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <h2 className="text-white font-semibold text-lg mb-5">Top Categories in {city.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {city.categories.map(catSlug => {
              const cat = CATEGORY_META[catSlug];
              if (!cat) return null;
              return (
                <Link
                  key={catSlug}
                  href={`/suppliers/${params.area}/${catSlug}`}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-[#D4AF37]/40 transition-colors group"
                >
                  <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-[#D4AF37] transition-colors">
                    {cat.name} in {city.name}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{cat.description}</p>
                  <span className="inline-flex items-center gap-1 mt-3 text-xs text-[#D4AF37]">Browse suppliers →</span>
                </Link>
              );
            })}
          </div>

          {neighbours.length > 0 && (
            <section className="mb-12">
              <h2 className="text-white font-semibold text-lg mb-5">Nearby Industrial Corridors</h2>
              <div className="flex flex-wrap gap-3">
                {neighbours.map((n) => (
                  <Link
                    key={n.key}
                    href={`/location/${n.key}`}
                    className="text-sm px-4 py-2 rounded-full border border-slate-600 text-slate-300 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors"
                  >
                    {n.fullName}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-2xl p-8">
            <h2 className="text-white font-bold text-xl mb-3">Trade in {city.name} — Protected Payment</h2>
            <p className="text-slate-400 text-sm mb-6">
              Post your Requirement and get competitive quotes from verified {city.name} suppliers.
              Funds stay protected until both sides deliver.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/rfq/create"
                className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Post a Requirement — Free
              </Link>
              <Link
                href={`/suppliers/${params.area}`}
                className="inline-block border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Browse {city.name} Suppliers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
