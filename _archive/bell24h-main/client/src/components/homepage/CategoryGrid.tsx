'use client';

import { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import { ALL_50_CATEGORIES, type Category } from '@/data/all-50-categories';
import { getMockRFQsByCategory } from '@/data/mockRFQs';

export default function CategoryGrid() {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter categories by search
  const filteredCategories = ALL_50_CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayCategories = expanded ? filteredCategories : filteredCategories.slice(0, 12);

  return (
    <div className="bg-gray-900/80 backdrop-blur border border-white/10 rounded-lg shadow-lg p-6 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-white">Browse by Category</h3>
        <span className="text-xs text-gray-400">
          {ALL_50_CATEGORIES.length} total
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-white/10 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Categories List */}
      <div className="space-y-1 max-h-[600px] overflow-y-auto">
        {displayCategories.map((category) => {
          const rfqCount = getMockRFQsByCategory(category.id).length;
          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl flex-shrink-0">{category.icon || '📦'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {rfqCount} RFQs • {category.supplierCount?.toLocaleString() || 0} suppliers
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0" />
            </Link>
          );
        })}
      </div>

      {/* Expand/Collapse */}
      {filteredCategories.length > 12 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2"
        >
          {expanded ? `Show Less` : `View All ${filteredCategories.length} Categories`}
        </button>
      )}

      {/* Filters */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-sm mb-3 text-gray-900 dark:text-white">Filter RFQs</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" 
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Voice RFQ Only</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" 
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Video RFQ Only</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" 
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Verified Only</span>
          </label>
        </div>
      </div>
    </div>
  );
}

