<<<<<<< HEAD
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

// ✅ CRITICAL: generateStaticParams for all 51 categories
// TEMPORARILY DISABLED - Missing Supabase environment variables
// export async function generateStaticParams() {
//   const supabase = createServerComponentClient({ cookies })
//   
//   const { data: categories } = await supabase
//     .from('categories')
//     .select('slug')
//     .eq('is_active', true)

//   if (!categories) {
//     console.warn('No categories found for static generation')
//     return []
//   }

//   console.log(`📊 Generating static params for ${categories.length} categories`)
//   
//   return categories.map((category) => ({
//     slug: category.slug,
//   }))
// }

// Metadata generation for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!category) {
    return {
      title: 'Category Not Found - Bell24h',
      description: 'The requested category could not be found.'
    }
  }

  return {
    title: `${category.name} - Bell24h B2B Marketplace`,
    description: category.description || `Browse ${category.name} products and suppliers on Bell24h - India's AI-powered B2B marketplace`,
    openGraph: {
      title: `${category.name} - Bell24h`,
      description: category.description || `Browse ${category.name} products and suppliers`,
      url: `https://bell24h-v1.vercel.app/categories/${params.slug}`,
    }
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  // Fetch category with subcategories
  const { data: category } = await supabase
    .from('categories')
    .select(`
      *,
      subcategories!inner(
        id,
        name,
        slug,
        description,
        is_active
      )
    `)
    .eq('slug', params.slug)
    .eq('is_active', true)
    .eq('subcategories.is_active', true)
    .single()

  // Handle 404 for non-existent categories
  if (!category) {
    console.log(`Category not found: ${params.slug}`)
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href="/categories" className="text-gray-500 hover:text-gray-700 text-sm">
                  Categories
            </Link>
              </li>
              <li className="flex items-center">
                <svg className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-900 font-medium text-sm">{category.name}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                {category.description}
              </p>
            )}
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>{category.subcategories?.length || 0} subcategories</span>
              <span>•</span>
              <span>AI-powered supplier matching</span>
                  </div>
                </div>
              </div>
            </div>

      {/* Subcategories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {category.subcategories && category.subcategories.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Explore {category.name} Subcategories
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.subcategories.map((subcategory: any) => (
                <Link
                  key={subcategory.id}
                  href={`/categories/${params.slug}/${subcategory.slug}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-300"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                      {subcategory.name}
                    </h3>
                    {subcategory.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {subcategory.description}
                      </p>
                    )}
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      <span>View products</span>
                      <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  </Link>
                ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🏗️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Subcategories Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              We're adding subcategories for {category.name}. Check back soon!
            </p>
                <Link 
              href="/categories"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse All Categories
                </Link>
          </div>
        )}
      </div>
    </div>
  )
}


=======
import { ALL_50_CATEGORIES } from '@/data/all-50-categories';
import { notFound } from 'next/navigation';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = ALL_50_CATEGORIES.find(c => c.slug === params.slug);
  if (!category) return notFound();
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-white">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-5xl">{category.icon}</span>
        <h1 className="text-4xl font-black text-cyan-400">{category.name}</h1>
      </div>
      <p className="mb-6 text-xl text-gray-300">{category.description || 'Explore suppliers, buyers, and products in this category.'}</p>
      {category.subcategories?.length ? (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-cyan-300 mb-2">Top subcategories</h2>
          <ul className="list-inside list-disc ml-4">
            {category.subcategories.map((sub, i) => (
              <li key={i}>{sub}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-8 bg-gray-900/70 rounded-xl border border-cyan-400/10 p-6">
        <h3 className="text-lg font-bold mb-3 text-cyan-200">Featured products/services (Demo)</h3>
        <ul className="space-y-2">
          <li>• Premium Supplier A</li>
          <li>• Top Buyer B</li>
          <li>• Trending: Voice/Video-enabled products</li>
        </ul>
      </div>
    </div>
  );
}
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
