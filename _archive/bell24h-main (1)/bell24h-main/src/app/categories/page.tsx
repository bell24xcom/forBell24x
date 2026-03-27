import Link from 'next/link'
import { ALL_50_CATEGORIES } from '@/data/all-50-categories'

export default function CategoriesIndex() {
  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-6">Categories</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ALL_50_CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/categories/${c.slug}`} className="border rounded-lg p-4 hover:border-blue-500">
              <div className="text-3xl">{c.icon}</div>
              <div className="font-semibold mt-2">{c.name}</div>
              <div className="text-sm text-gray-600">{c.description}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
