import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface SubcategoryPageProps {
  params: {
    slug: string
    subcategorySlug: string
  }
}

// ✅ TEMPORARILY DISABLED: generateStaticParams for all ~350 subcategories
// This will be re-enabled once Supabase environment variables are configured
/*
export async function generateStaticParams() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get all active categories with their subcategories
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      slug,
      subcategories!inner(slug)
    `)
    .eq('is_active', true)
    .eq('subcategories.is_active', true)

  if (!categories) {
    console.warn('No categories/subcategories found for static generation')
    return []
  }

  // Flatten to create all category/subcategory combinations
  const params = categories.flatMap(category => 
    category.subcategories.map(subcategory => ({
      slug: category.slug,
      subcategorySlug: subcategory.slug,
    }))
  )

  console.log(`📊 Generating static params for ${params.length} subcategories`)
  
  return params
}
*/

// Metadata generation for SEO
export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })

  // Get category and subcategory info
  const { data } = await supabase
    .from('subcategories')
    .select(`
      name,
      description,
      categories!inner(name, slug)
    `)
    .eq('slug', params.subcategorySlug)
    .eq('categories.slug', params.slug)
    .eq('is_active', true)
    .eq('categories.is_active', true)
    .single()

  if (!data) {
    return {
      title: 'Subcategory Not Found - Bell24h',
      description: 'The requested subcategory could not be found.'
    }
  }

  return {
    title: `${data.name} in ${data.categories[0]?.name || 'Category'} - Bell24h B2B Marketplace`,
    description: data.description || `Browse ${data.name} products and suppliers in ${data.categories[0]?.name || 'Category'} category on Bell24h`,
    openGraph: {
      title: `${data.name} - ${data.categories[0]?.name || 'Category'}`,
      description: data.description || `Browse ${data.name} products and suppliers`,
      url: `https://bell24h-v1.vercel.app/categories/${params.slug}/${params.subcategorySlug}`,
    }
  }
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const supabase = createServerComponentClient({ cookies })

  // Fetch category and subcategory details
  const { data: subcategoryData } = await supabase
    .from('subcategories')
    .select(`
      *,
      categories!inner(id, name, slug, description)
    `)
    .eq('slug', params.subcategorySlug)
    .eq('categories.slug', params.slug)
    .eq('is_active', true)
    .eq('categories.is_active', true)
    .single()

  // Handle 404 for non-existent subcategories
  if (!subcategoryData) {
    console.log(`Subcategory not found: ${params.slug}/${params.subcategorySlug}`)
    notFound()
  }

  const category = subcategoryData.categories
  const subcategory = subcategoryData

  // Fetch products for this subcategory (if products table exists)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('subcategory_id', subcategory.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">Home</Link>
              </li>
              <li className="flex items-center">
                <svg className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href="/categories" className="text-gray-500 hover:text-gray-700 text-sm">Categories</Link>
              </li>
              <li className="flex items-center">
                <svg className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href={`/categories/${params.slug}`} className="text-gray-500 hover:text-gray-700 text-sm">
                  {category.name}
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-900 font-medium text-sm">{subcategory.name}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Subcategory Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{subcategory.name}</h1>
            <p className="text-lg text-gray-600 mb-2">in {category.name}</p>
            {subcategory.description && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                {subcategory.description}
              </p>
            )}
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>{products?.length || 0} products available</span>
              <span>•</span>
              <span>AI-powered matching</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products && products.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {subcategory.name} Products
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-lg">📦</span>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    )}
                    {product.price && (
                      <p className="text-xl font-bold text-blue-600 mb-4">₹{product.price.toLocaleString()}</p>
                    )}
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Get Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Products Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              We're adding products for {subcategory.name}. Be the first to know when they're available!
            </p>
            <div className="space-y-4">
              <button className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                Get Notified
              </button>
              <div className="text-sm text-gray-500">
                <Link href={`/categories/${params.slug}`} className="text-blue-600 hover:text-blue-700">
                  ← Back to {category.name}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 