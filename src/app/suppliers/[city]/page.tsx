import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CITIES, CATEGORY_META } from '@/src/data/city-category-seo';

interface Props { params: { city: string } }

export async function generateStaticParams() {
  return Object.keys(CITIES).map(city => ({ city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = CITIES[params.city];
  if (!city) return { title: 'Not Found' };
  const seoTitle = `B2B Suppliers in ${city.name} | VyaparSethu`;
  const description = `Find verified B2B suppliers and manufacturers in ${city.fullName}. ${city.description} Post your Requirement free on VyaparSethu.`;
  return {
    title: { absolute: seoTitle }, description,
    keywords: [`suppliers in ${city.name}`, `${city.name} manufacturers`, `B2B sourcing ${city.name}`, `industrial suppliers ${city.name} ${city.state}`],
    openGraph: { title: seoTitle, description, url: `https://www.vyaparsethu.com/suppliers/${params.city}`, siteName: 'VyaparSethu' },
    alternates: { canonical: `https://www.vyaparsethu.com/suppliers/${params.city}` },
  };
}

export default function CityPage({ params }: Props) {
  const city = CITIES[params.city];
  if (!city) notFound();

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vyaparsethu.com' },
      { '@type': 'ListItem', position: 2, name: 'Suppliers', item: 'https://www.vyaparsethu.com/suppliers' },
      { '@type': 'ListItem', position: 3, name: city.fullName, item: `https://www.vyaparsethu.com/suppliers/${params.city}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <Link href="/suppliers" className="hover:text-slate-300">Suppliers</Link><span>/</span>
            <span className="text-slate-300">{city.fullName}</span>
          </nav>

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 text-xs text-[#D4AF37] font-medium mb-4">
              {city.state} · Industrial Cluster
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{city.fullName} — B2B Supplier Hub</h1>
            <p className="text-slate-400 text-lg max-w-3xl">{city.description}</p>
          </div>

          <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-6 mb-10">
            <h2 className="text-white font-semibold mb-2">Cluster Overview</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{city.clusterNote}</p>
          </div>

          <h2 className="text-white font-semibold text-lg mb-5">Top Categories in {city.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {city.categories.map(catSlug => {
              const cat = CATEGORY_META[catSlug];
              if (!cat) return null;
              return (
                <Link key={catSlug} href={`/suppliers/${params.city}/${catSlug}`}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-[#D4AF37]/40 transition-colors group">
                  <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-[#D4AF37] transition-colors">{cat.name} Suppliers in {city.name}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{cat.description}</p>
                  <span className="inline-flex items-center gap-1 mt-3 text-xs text-[#D4AF37]">Browse suppliers →</span>
                </Link>
              );
            })}
          </div>

          <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-2xl p-8">
            <h2 className="text-white font-bold text-xl mb-3">Source from {city.name} Suppliers — Free</h2>
            <p className="text-slate-400 text-sm mb-6">Post your Requirement and get 3+ competitive quotes from verified {city.name} suppliers within 24 hours. Protected Payment ensures your funds are safe until delivery.</p>
            <Link href="/rfq/create" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
              Post a Requirement — Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
