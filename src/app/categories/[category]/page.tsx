import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SITE_URL } from '@/lib/site-url';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export const revalidate = 300; // cache 5 minutes

async function getCategory(slug: string) {
  // Query the incoming slug directly. A previous SLUG_ALIASES map rewrote slugs
  // to a set of compound "seed" slugs (metals-alloys, chemicals-petrochemicals,
  // …) that no longer exist in the DB — every alias target was dead, so the map
  // only ever converted real, working slugs (chemicals, electronics, textiles,
  // agriculture, …) into 404s. Removed entirely: the current DB slugs match the
  // incoming request directly. The flexible findFirst below still handles
  // hyphen/underscore/case and name-contains variance.
  const resolvedSlug = slug;
  try {
    console.log('[Category Page] Fetching category with slug:', resolvedSlug);
    // Flexible slug matching: handle hyphens vs underscores, case differences, and aliases
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: { equals: resolvedSlug, mode: 'insensitive' } },
          { slug: { equals: resolvedSlug.replace(/-/g, '_'), mode: 'insensitive' } },
          { slug: { equals: resolvedSlug.replace(/_/g, '-'), mode: 'insensitive' } },
          { name: { contains: resolvedSlug.replace(/-/g, ' '), mode: 'insensitive' } },
          { name: { contains: resolvedSlug.replace(/_/g, ' '), mode: 'insensitive' } },
        ],
        isActive: true
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { priority: 'asc' },
          take: 20,
        },
        _count: {
          select: { rfqs: true },
        },
      },
    });

    if (!category) {
      console.error('[Category Page] Category not found for slug:', slug);
    } else {
      console.log('[Category Page] Category found:', category.name, '- Active:', category.isActive);
    }

    return category;
  } catch (error) {
    console.error('[Category Page] Error fetching category:', error);
    return null;
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategory(params.category);

  // Canonical points at the category's real DB slug so any variant request
  // collapses onto a single indexed URL instead of ranking as a duplicate.
  const canonicalSlug = category?.slug ?? params.category;

  return {
    // Bare title — the root layout template appends " | VyaparSethu".
    title: `${category?.name || 'Category'}`,
    description: category?.description || `Find suppliers and create RFQs for ${category?.name || 'this category'}`,
    alternates: { canonical: `${SITE_URL}/categories/${canonicalSlug}` },
  };
}

async function getCategoryRFQs(categoryId: number, categoryName: string) {
  try {
    return await prisma.rFQ.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { categoryId },
          { category: { equals: categoryName, mode: 'insensitive' } },
          { category: { contains: categoryName, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        description: true,
        quantity: true,
        location: true,
        createdAt: true,
      },
    });
  } catch (err) {
    console.error('[Category Page] RFQ query failed:', err);
    return [];
  }
}

function timeAgo(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hours ago`;
  return `${Math.floor(sec / 86400)} days ago`;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategory(params.category);

  if (!category || !category.isActive) {
    // Real 404, not a fallback UI rendered with an implicit 200 — a 200
    // response for "doesn't exist" content is exactly what triggers
    // Google's Soft 404 classification (page indexable per status code,
    // but content says otherwise).
    notFound();
  }

  const rfqs = await getCategoryRFQs(category.id, category.name);

  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Category Header */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            {category.icon && <span className="text-5xl mr-4">{category.icon}</span>}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{category.name}</h1>
              {category.description && (
                <p className="text-lg text-slate-300 mt-2">{category.description}</p>
              )}
              {category._count.rfqs > 0 && (
                <p className="text-sm text-slate-400 mt-2">
                  {category._count.rfqs} active RFQs in this category
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href="/rfq/create"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Create RFQ
            </Link>
            <Link
              href="/suppliers"
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Browse Suppliers
            </Link>
          </div>
        </div>

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6">Subcategories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.children.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/categories/${subcategory.slug}`}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/30 transition-all group"
                >
                  <div className="flex items-center mb-2">
                    {subcategory.icon && <span className="text-2xl mr-3">{subcategory.icon}</span>}
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {subcategory.name}
                    </h3>
                  </div>
                  {subcategory.description && (
                    <p className="text-sm text-slate-300 mb-2">
                      {subcategory.description.slice(0, 100)}
                      {subcategory.description.length > 100 ? '...' : ''}
                    </p>
                  )}
                  <span className="text-sm text-slate-400">
                    Explore →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Real RFQs in this Category */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            {rfqs.length > 0 ? `Active RFQs in ${category.name}` : `Be the first to source ${category.name}`}
          </h2>

          {rfqs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rfqs.map((rfq, i) => (
                <Link
                  key={rfq.id}
                  href={`/rfq/${rfq.id}`}
                  className="block bg-slate-700/50 border border-slate-600 hover:border-blue-500/50 p-5 rounded-lg transition-all"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-blue-400 font-bold">{i + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white truncate">{rfq.title}</h4>
                      <p className="text-xs text-slate-400">
                        {timeAgo(rfq.createdAt)}
                        {rfq.location ? ` · ${rfq.location}` : ''}
                      </p>
                    </div>
                  </div>
                  {rfq.description && (
                    <p className="text-sm text-slate-300 mb-3 line-clamp-2">{rfq.description}</p>
                  )}
                  {rfq.quantity && (
                    <p className="text-xs text-slate-400">Qty: {rfq.quantity}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-6">
              Be the first to post an RFQ in this category — suppliers are watching.
            </p>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/rfq/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-lg shadow-blue-500/25"
            >
              Post Your RFQ in {category.name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
