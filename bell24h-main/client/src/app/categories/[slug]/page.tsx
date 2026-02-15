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
