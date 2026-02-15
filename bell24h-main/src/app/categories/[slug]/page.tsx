import Link from 'next/link'
import { ALL_50_CATEGORIES, getCategoryBySlug } from '@/data/all-50-categories'

export async function generateStaticParams() {
  return ALL_50_CATEGORIES.map((c) => ({ slug: c.slug }))
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = getCategoryBySlug(params.slug)
  if (!category) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Category not found</h1>
          <Link href="/categories" className="text-blue-600 underline">Back to categories</Link>
        </div>
      </main>
    )
  }
  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/categories" className="text-blue-600 underline">← All categories</Link>
        <h1 className="text-4xl font-black mt-4">{category.icon} {category.name}</h1>
        <p className="text-gray-600 mt-2">{category.description}</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Estimated RFQs</div>
            <div className="text-3xl font-bold">{category.rfqCount ?? '100+'}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-500">Slug</div>
            <div className="text-xl font-semibold">{category.slug}</div>
          </div>
        </div>
      </section>
    </main>
  )
}

