import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CITIES, CATEGORY_META, getAllCityCategoryPairs } from '@/src/data/city-category-seo';
import { prisma } from '@/lib/prisma';
import SeoRankComparisonPanel from '@/src/components/seo/SeoRankComparisonPanel';
import { getRankBySlug } from '@/src/lib/seo-category-keywords';

interface Props { params: { city: string; category: string } }

export async function generateStaticParams() {
  return getAllCityCategoryPairs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = CITIES[params.city];
  const cat  = CATEGORY_META[params.category];
  if (!city || !cat) return { title: 'Not Found' };

  const rawTitle    = `${cat.name} Suppliers in ${city.name}`;
  const seoTitle    = rawTitle.length > 45 ? rawTitle.slice(0, 42) + '...' : rawTitle;
  const description = `Find verified ${cat.name.toLowerCase()} suppliers in ${city.fullName}. ${city.description} Get 3+ quotes within 24 hours via VyaparSethu's Protected Payment platform.`;

  return {
    title: { absolute: `${seoTitle} | VyaparSethu` },
    description,
    keywords: [...cat.keywords, `suppliers in ${city.name}`, `${city.name} ${cat.name.toLowerCase()}`],
    openGraph: { title: seoTitle, description, url: `https://www.vyaparsethu.com/suppliers/${params.city}/${params.category}`, siteName: 'VyaparSethu' },
    alternates: { canonical: `https://www.vyaparsethu.com/suppliers/${params.city}/${params.category}` },
  };
}

export const revalidate = 3600;

export default async function CityCategory({ params }: Props) {
  const city = CITIES[params.city];
  const cat  = CATEGORY_META[params.category];
  if (!city || !cat) notFound();

  const seoRanks = (() => {
    const cityCat = getRankBySlug('city-category', params.category);
    return cityCat ? [cityCat] : [];
  })();
  const pagePath = `/suppliers/${params.city}/${params.category}`;

  // Pull verified suppliers in this city who match this category
  let suppliers: { id: string; company: string | null; location: string | null; trustScore: number | null }[] = [];
  try {
    suppliers = await prisma.user.findMany({
      where: {
        role: 'SUPPLIER',
        isActive: true,
        isClaimed: true,
        OR: [
          { location: { contains: city.name, mode: 'insensitive' } },
          { location: { contains: city.state, mode: 'insensitive' } },
        ],
      },
      select: { id: true, company: true, location: true, trustScore: true },
      orderBy: { trustScore: 'desc' },
      take: 12,
    });
  } catch { /* DB unavailable */ }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${cat.name} Suppliers in ${city.fullName}`,
    description: `Verified ${cat.name} suppliers and manufacturers in ${city.fullName}, ${city.state}`,
    url: `https://www.vyaparsethu.com/suppliers/${params.city}/${params.category}`,
    numberOfItems: suppliers.length || 10,
    itemListElement: suppliers.slice(0, 5).map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'LocalBusiness',
        name: s.company || 'Verified Supplier',
        url: `https://www.vyaparsethu.com/supplier/${s.id}`,
        address: { '@type': 'PostalAddress', addressLocality: s.location || city.name, addressRegion: city.state, addressCountry: 'IN' },
      },
    })),
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vyaparsethu.com' },
      { '@type': 'ListItem', position: 2, name: 'Suppliers', item: 'https://www.vyaparsethu.com/suppliers' },
      { '@type': 'ListItem', position: 3, name: city.fullName, item: `https://www.vyaparsethu.com/suppliers/${params.city}` },
      { '@type': 'ListItem', position: 4, name: cat.name, item: `https://www.vyaparsethu.com/suppliers/${params.city}/${params.category}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-5xl mx-auto px-4 py-12">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 flex-wrap">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <Link href="/suppliers" className="hover:text-slate-300">Suppliers</Link><span>/</span>
            <Link href={`/suppliers/${params.city}`} className="hover:text-slate-300">{city.fullName}</Link><span>/</span>
            <span className="text-slate-300">{cat.name}</span>
          </nav>

          {/* Hero */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 text-xs text-[#D4AF37] font-medium mb-4">
              {city.state} · Verified Cluster
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {cat.name} Suppliers in {city.fullName}
            </h1>
            <p className="text-slate-400 text-lg max-w-3xl leading-relaxed">{city.description}</p>
            {cat.hsn && (
              <p className="text-slate-500 text-sm mt-2">HSN Codes: <span className="text-slate-400 font-mono">{cat.hsn}</span></p>
            )}
          </div>

          {/* Cluster insight */}
          <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-6 mb-10">
            <h2 className="text-white font-semibold mb-2">About the {city.name} {cat.name} Cluster</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{city.clusterNote}</p>
            <p className="text-slate-400 text-sm mt-3">{cat.description}.</p>
          </div>

          {/* Supplier list or CTA */}
          {suppliers.length > 0 ? (
            <div className="mb-10">
              <h2 className="text-white font-semibold text-lg mb-5">
                {suppliers.length} Verified {cat.name} Suppliers in {city.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map(s => (
                  <Link key={s.id} href={`/supplier/${s.id}`}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-[#D4AF37]/40 transition-colors group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                        {(s.company || 'S').charAt(0)}
                      </div>
                      {s.trustScore && (
                        <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                          Score {s.trustScore}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-medium text-sm mb-1 group-hover:text-[#D4AF37] transition-colors">
                      {s.company || 'Verified Supplier'}
                    </h3>
                    <p className="text-slate-500 text-xs">{s.location || city.name}, {city.state}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 text-center mb-10">
              <p className="text-slate-400 mb-4">Be the first verified {cat.name.toLowerCase()} supplier in {city.name} on VyaparSethu.</p>
              <Link href="/supplier/registration" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
                Claim Your Supplier Profile — Free
              </Link>
            </div>
          )}

          {seoRanks.length > 0 && (
            <div className="mb-10">
              <SeoRankComparisonPanel
                ranks={seoRanks}
                title={`SEO: ${cat.name} in ${city.name} vs competitors`}
                pagePath={pagePath}
                adminLink
              />
            </div>
          )}

          {/* Post requirement CTA */}
          <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-2xl p-8">
            <h2 className="text-white font-bold text-xl mb-3">
              Get 3+ Quotes from {city.name} {cat.name} Suppliers in 24 Hours
            </h2>
            <p className="text-slate-400 text-sm mb-6 max-w-2xl">
              Post your Requirement free — specify grade, quantity, delivery location, and timeline.
              Verified Suppliers quote competitively. Protected Payment (escrow) ensures funds release only on delivery confirmation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/rfq/create?category=${params.category}&city=${city.name}`}
                className="inline-flex items-center justify-center bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
                Post a {cat.name} Requirement — Free
              </Link>
              <Link href="/voice-rfq"
                className="inline-flex items-center justify-center border border-slate-600 hover:border-[#D4AF37]/50 text-slate-300 hover:text-white px-6 py-3 rounded-lg text-sm transition-colors">
                🎤 Speak Your Requirement (90 sec)
              </Link>
            </div>
          </div>

          {/* SEO internal links */}
          <div className="mt-10 pt-8 border-t border-slate-800">
            <h3 className="text-slate-400 text-sm font-medium mb-4">Other supplier clusters</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(CITIES).filter(([slug]) => slug !== params.city).slice(0, 8).map(([slug, c]) => (
                <Link key={slug} href={`/suppliers/${slug}/${params.category}`}
                  className="text-xs text-slate-500 hover:text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-lg transition-colors">
                  {cat.name} in {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
