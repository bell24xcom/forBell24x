'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { all50Categories as ALL_50_CATEGORIES } from '@/src/data/all-50-categories';

export default function CategorySidebar() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = ALL_50_CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="space-y-5">
      {/* Categories List */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2 text-white">
          <Filter className="w-5 h-5 text-blue-400" />
          Categories
        </h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Category List */}
        <div className="max-h-96 overflow-y-auto space-y-1">
          {filteredCategories.slice(0, 20).map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/50 transition text-sm"
            >
              <span className="text-lg" aria-hidden>{cat.icon}</span>
              <span className="flex-1 text-slate-300 hover:text-white">{cat.name}</span>
            </Link>
          ))}
        </div>

        {filteredCategories.length > 20 && (
          <Link
            href="/categories"
            className="block text-center text-sm text-blue-400 hover:text-blue-300 mt-3 font-medium"
          >
            View All {ALL_50_CATEGORIES.length} Categories →
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <h2 className="font-semibold text-lg mb-3 text-white">Filters</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">RFQ Type</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" className="rounded" />
                <span>🎤 Voice RFQ</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" className="rounded" />
                <span>📹 Video RFQ</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" className="rounded" />
                <span>📝 Text RFQ</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Location</label>
            <select className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
              <option>All Locations</option>
              <option>Mumbai</option>
              <option>Delhi</option>
              <option>Bangalore</option>
              <option>Pune</option>
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
}
