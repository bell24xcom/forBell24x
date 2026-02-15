import { ALL_50_CATEGORIES } from '@/data/all-50-categories';
import Link from 'next/link';

export default function CategoriesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-white">
      <h1 className="text-5xl font-black mb-10 text-cyan-400">Product Categories</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {ALL_50_CATEGORIES.map(cat => (
          <Link href={`/categories/${cat.slug}`} key={cat.id} className="rounded-xl bg-gray-900/80 border border-cyan-500/10 p-6 block mb-1 hover:bg-cyan-900/30 transition font-bold text-xl flex items-center gap-4 shadow-lg">
            <span className="text-3xl">{cat.icon}</span> <span>{cat.name}</span>
          </Link>
        ))}
      </div>
      <p className="mt-12 text-gray-400">Explore all 50+ product & service categories. BELL covers every corner of Indian business.</p>
    </div>
  );
}
