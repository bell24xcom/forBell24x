import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 300; // cache 5 minutes

export const metadata: Metadata = {
  title: 'All Trade Categories',
  description: "Explore 450+ B2B trade categories — Metals, Textiles, Chemicals, Packaging, Electronics, Machinery and more. Find verified Indian suppliers on VyaparSethu. Post free.",
  alternates: { canonical: `${SITE_URL}/categories` },
  openGraph: {
    title: 'All Trade Categories | VyaparSethu',
    description: "Explore 450+ B2B trade categories — Metals, Textiles, Chemicals, Packaging, Electronics, Machinery and more. Find verified Indian suppliers on VyaparSethu. Post free.",
    url: `${SITE_URL}/categories`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'All Trade Categories | VyaparSethu' }],
  },
};

const FALLBACK_CATEGORIES = [
  { slug: 'textiles-garments', title: 'Textiles & Garments', icon: '👕', suppliers: 2400 },
  { slug: 'pharmaceuticals', title: 'Pharmaceuticals', icon: '💊', suppliers: 1800 },
  { slug: 'agricultural-products', title: 'Agricultural Products', icon: '🌾', suppliers: 3200 },
  { slug: 'automotive-parts', title: 'Automotive Parts', icon: '🚗', suppliers: 1500 },
  { slug: 'it-services', title: 'IT Services', icon: '💻', suppliers: 2100 },
  { slug: 'gems-jewelry', title: 'Gems & Jewelry', icon: '💎', suppliers: 900 },
  { slug: 'handicrafts', title: 'Handicrafts', icon: '🎨', suppliers: 1100 },
  { slug: 'machinery-equipment', title: 'Machinery & Equipment', icon: '⚙️', suppliers: 1700 },
  { slug: 'chemicals', title: 'Chemicals', icon: '🧪', suppliers: 1400 },
  { slug: 'food-processing', title: 'Food Processing', icon: '🍽️', suppliers: 2000 },
  { slug: 'construction', title: 'Construction', icon: '🏗️', suppliers: 2800 },
  { slug: 'metals-steel', title: 'Metals & Steel', icon: '🔩', suppliers: 1900 },
  { slug: 'plastics', title: 'Plastics', icon: '🔄', suppliers: 1300 },
  { slug: 'paper-packaging', title: 'Paper & Packaging', icon: '📦', suppliers: 1000 },
  { slug: 'rubber', title: 'Rubber', icon: '🛞', suppliers: 800 },
  { slug: 'ceramics', title: 'Ceramics', icon: '🏺', suppliers: 600 },
  { slug: 'glass', title: 'Glass', icon: '🪟', suppliers: 500 },
  { slug: 'wood', title: 'Wood', icon: '🪵', suppliers: 1200 },
  { slug: 'leather', title: 'Leather', icon: '👜', suppliers: 1600 },
];

type DisplayCategory = {
  slug: string;
  title: string;
  icon: string;
  suppliers: number;
};

async function getCategories(): Promise<DisplayCategory[]> {
  try {
    const dbCategories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null  // Only show parent/top-level categories
      },
      orderBy: { priority: 'asc' },
      select: { slug: true, name: true, icon: true, _count: { select: { rfqs: true } } },
    });

    if (dbCategories.length > 0) {
      return dbCategories.map(c => ({
        slug: c.slug,
        title: c.name,
        icon: c.icon || '📦',
        suppliers: c._count.rfqs, // use RFQ count as activity proxy until supplierCount column exists
      }));
    }
  } catch {
    // DB unavailable — fall through to hardcoded
  }

  return FALLBACK_CATEGORIES;
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const allCategories = await getCategories();
  const query = searchParams?.q?.toLowerCase().trim() ?? '';
  const categories = query
    ? allCategories.filter(
        (cat) =>
          cat.title.toLowerCase().includes(query) ||
          cat.slug.toLowerCase().includes(query)
      )
    : allCategories;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'All Categories', item: `${SITE_URL}/categories` },
    ],
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'B2B Trade Categories',
    itemListElement: categories.map((cat, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: cat.title,
      url: `${SITE_URL}/categories/${cat.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-3">All Trade Categories</h1>
          <p className="text-slate-400 max-w-2xl mx-auto mb-4">
            Browse {allCategories.length < 30 ? '450+' : `${allCategories.length}+`} product and service categories. Find verified suppliers across India.
          </p>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">
            VyaparSethu&apos;s B2B Trade Network covers every major industrial and commercial category active
            in Indian markets — from Metals &amp; Steel sourced in Kalamboli to Corrugated Packaging from
            Bhiwandi, Industrial Adhesives from Navi Mumbai, and Textiles &amp; Garments from Surat.
            Select a category below to browse verified suppliers, view active Requirements, and post your
            own Requirement free. Quotes arrive within 24 hours. All transactions include Protected Payment.
          </p>
        </div>

        {/* Search */}
        <form method="GET" action="/categories" className="mb-8 max-w-md mx-auto">
          <input
            type="text"
            name="q"
            defaultValue={searchParams?.q ?? ''}
            placeholder="Search categories..."
            aria-label="Search trade categories"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
          />
        </form>

        {categories.length === 0 && (
          <p className="text-center text-slate-400 mb-8">
            No categories match &ldquo;{searchParams?.q}&rdquo;.{' '}
            <Link href="/categories" className="text-blue-400 underline">Clear search</Link>
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 rounded-xl p-5 transition-all duration-200 group"
            >
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                {cat.title}
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                {cat.suppliers > 0 ? `${cat.suppliers.toLocaleString()}+ suppliers` : 'Be the first supplier →'}
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/rfq/create"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Post Your RFQ Free
          </Link>
        </div>
      </div>
    </div>
  );
}
