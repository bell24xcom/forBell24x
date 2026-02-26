import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export const revalidate = 300; // cache 5 minutes

async function getCategory(slug: string) {
  try {
    console.log('[Category Page] Fetching category with slug:', slug);
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { priority: 'asc' },
          take: 12,
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

  return {
    title: `${category?.name || 'Category'} - Bell24h`,
    description: category?.description || `Find suppliers and create RFQs for ${category?.name || 'this category'}`
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategory(params.category);

  if (!category) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold text-white mb-4">Category Not Found</h1>
          <p className="text-lg text-slate-300 mb-8">
            The category "{params.category}" doesn't exist or has been moved.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/categories" className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              Browse All Categories
            </a>
            <a href="/rfq/create" className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              Post RFQ
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!category.isActive) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold text-white mb-4">Category Unavailable</h1>
          <p className="text-lg text-slate-300 mb-8">
            This category is currently not available. Please browse other categories or post your RFQ.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/categories" className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              Browse All Categories
            </a>
            <a href="/rfq/create" className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              Post RFQ
            </a>
          </div>
        </div>
      </div>
    );
  }

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
              <p className="text-sm text-slate-400 mt-2">
                {category._count.rfqs} active RFQs in this category
              </p>
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

        {/* Popular RFQs in this Category */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Popular Searches in {category.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-700/50 border border-slate-600 p-5 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-400 font-bold">{i}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Sample RFQ #{i}</h4>
                    <p className="text-xs text-slate-400">Posted 2 days ago</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-3">
                  Example RFQ for {category.name.toLowerCase()} products
                </p>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  View Details →
                </button>
              </div>
            ))}
          </div>

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
