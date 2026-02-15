"use client";

import { useState } from 'react';
import { ChevronRight, Search, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { ALL_50_CATEGORIES } from '@/data/all-50-categories';

export default function CategoryGrid() {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const displayedCategories = expanded ? ALL_50_CATEGORIES : ALL_50_CATEGORIES.slice(0, 12);
  const filteredCategories = displayedCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-6">
            <TrendingUp className="w-4 h-4" />
            Browse Categories
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">Find What You Need</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">Explore 50+ categories with thousands of verified suppliers</p>
        </div>
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-16 pr-6 py-5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredCategories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`} className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100 hover:border-blue-500">
              <div className="text-6xl mb-6 transform group-hover:scale-125 transition-transform duration-300">{category.icon}</div>
              <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{category.name}</h3>
              <p className="text-gray-600 mb-6 line-clamp-2">{category.description}</p>
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                <div className="text-sm text-gray-600"><span className="font-bold text-blue-600">{category.rfqCount || '100+'}</span> RFQs</div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
              </div>
            </Link>
          ))}
        </div>
        {!searchTerm && filteredCategories.length > 0 && (
          <div className="text-center">
            <button onClick={() => setExpanded(!expanded)} className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-xl font-bold shadow-xl hover:bg-blue-700 hover:shadow-2xl transform hover:scale-105 transition-all text-lg">
              {expanded ? 'Show Less' : `View All ${ALL_50_CATEGORIES.length} Categories`}
              <ChevronRight className={`w-6 h-6 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          </div>
        )}
        <div className="mt-24 bg-blue-600 rounded-2xl p-12 md:p-16 text-center">
          <h3 className="text-3xl md:text-5xl font-black text-white mb-6">Can't Find Your Category?</h3>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto">Post your RFQ anyway! Our AI will match you with the right suppliers.</p>
          <div className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-600 rounded-xl font-bold shadow-2xl">Post RFQ Now</div>
        </div>
      </div>
    </section>
  );
}
