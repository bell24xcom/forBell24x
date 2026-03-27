'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SearchSuggestion {
  type: 'product' | 'category' | 'location' | 'trending';
  title: string;
  count?: string;
  location?: string;
}

interface Category {
  id: string;
  name: string;
  supplierCount: number;
  subcategories: string[];
}

export default function UltraPremiumSearch() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const categories: Category[] = [
    {
      id: 'electronics',
      name: 'Electronics & Technology',
      supplierCount: 32156,
      subcategories: ['Semiconductors', 'Consumer Electronics', 'Industrial Electronics'],
    },
    {
      id: 'steel-metal',
      name: 'Steel & Metal',
      supplierCount: 28547,
      subcategories: ['Steel Products', 'Aluminum', 'Copper', 'Metal Fabrication'],
    },
    {
      id: 'textiles',
      name: 'Textiles & Garments',
      supplierCount: 25341,
      subcategories: ['Cotton Fabrics', 'Synthetic Textiles', 'Garment Manufacturing'],
    },
    {
      id: 'automotive',
      name: 'Automotive Parts',
      supplierCount: 21789,
      subcategories: ['Engine Parts', 'Electrical Components', 'Body Parts'],
    },
    {
      id: 'machinery',
      name: 'Industrial Machinery',
      supplierCount: 19654,
      subcategories: [
        'Manufacturing Equipment',
        'Construction Machinery',
        'Agricultural Machinery',
      ],
    },
    {
      id: 'chemicals',
      name: 'Chemicals & Pharmaceuticals',
      supplierCount: 18923,
      subcategories: ['Industrial Chemicals', 'Pharmaceutical APIs', 'Specialty Chemicals'],
    },
    {
      id: 'construction',
      name: 'Construction Materials',
      supplierCount: 17234,
      subcategories: ['Cement', 'Steel Structures', 'Building Materials'],
    },
    {
      id: 'agriculture',
      name: 'Agricultural Products',
      supplierCount: 15876,
      subcategories: ['Seeds', 'Fertilizers', 'Agricultural Equipment'],
    },
    {
      id: 'packaging',
      name: 'Packaging Materials',
      supplierCount: 14123,
      subcategories: ['Corrugated Boxes', 'Plastic Packaging', 'Labels'],
    },
    {
      id: 'furniture',
      name: 'Furniture & Interiors',
      supplierCount: 13567,
      subcategories: ['Office Furniture', 'Home Furniture', 'Interior Design'],
    },
  ];

  const trendingSearches = [
    'Electronics Components',
    'Steel Raw Materials',
    'Textile Machinery',
    'Chemical Processing Equipment',
    'Construction Materials',
    'Industrial Automation',
  ];

  const locations = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Pune',
    'Ahmedabad',
    'Hyderabad',
    'Surat',
    'Coimbatore',
  ];

  // Generate smart suggestions based on query
  useEffect(() => {
    if (query.length > 1) {
      const newSuggestions: SearchSuggestion[] = [];

      // Product suggestions
      if (query.toLowerCase().includes('steel')) {
        newSuggestions.push({
          type: 'product',
          title: 'Steel Pipes & Tubes',
          count: '15,000+ suppliers',
        });
        newSuggestions.push({
          type: 'product',
          title: 'Stainless Steel Sheets',
          count: '8,500+ suppliers',
        });
      }

      if (query.toLowerCase().includes('electronics')) {
        newSuggestions.push({
          type: 'product',
          title: 'Electronic Components',
          count: '25,000+ suppliers',
        });
        newSuggestions.push({
          type: 'product',
          title: 'Circuit Boards',
          count: '12,000+ suppliers',
        });
      }

      // Category suggestions
      categories.forEach(category => {
        if (category.name.toLowerCase().includes(query.toLowerCase())) {
          newSuggestions.push({
            type: 'category',
            title: category.name,
            count: `${category.supplierCount.toLocaleString()}+ suppliers`,
          });
        }
      });

      // Location suggestions
      locations.forEach(loc => {
        if (loc.toLowerCase().includes(query.toLowerCase())) {
          newSuggestions.push({
            type: 'location',
            title: `${query} in ${loc}`,
            location: loc,
          });
        }
      });

      setSuggestions(newSuggestions.slice(0, 6));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    console.log('Searching for:', { query, selectedCategory, location });
    // Here you would implement the actual search functionality
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className='w-full max-w-6xl mx-auto' ref={searchRef}>
      {/* Main Search Interface */}
      <div className='bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-2'>
        <div className='flex flex-col lg:flex-row gap-2'>
          {/* Text Search Input */}
          <div className='flex-1 relative'>
            <div className='relative'>
              <span>🔍</span>
              <input
                type='text'
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='Search products, services, or suppliers...'
                className='w-full pl-12 pr-4 py-4 bg-transparent border-0 text-gray-800 placeholder-gray-500 focus:outline-none text-lg'
              />
            </div>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className='absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden'>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setQuery(suggestion.title);
                      setShowSuggestions(false);
                    }}
                    className='flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0'
                  >
                    <div className='flex-shrink-0'>
                      {suggestion.type === 'product' && (
                        <span>🔍</span>
                      )}
                      {suggestion.type === 'category' && (
                        <span>📈</span>
                      )}
                      {suggestion.type === 'location' && (
                        <span>📍</span>
                      )}
                    </div>
                    <div className='flex-1'>
                      <div className='font-medium text-gray-800'>{suggestion.title}</div>
                      {suggestion.count && (
                        <div className='text-sm text-gray-500'>{suggestion.count}</div>
                      )}
                    </div>
                    <span>→</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div className='relative lg:w-80'>
            <button
              onClick={() => setShowCategories(!showCategories)}
              className='w-full flex items-center justify-between px-4 py-4 bg-gray-50/80 hover:bg-gray-100/80 rounded-lg transition text-left'
            >
              <div className='flex items-center space-x-2'>
                <span>📈</span>
                <span className='text-gray-700'>
                  {selectedCategoryData ? selectedCategoryData.name : 'All Categories'}
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform ${
                  showCategories ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Category Dropdown Menu */}
            {showCategories && (
              <div className='absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto'>
                <div
                  onClick={() => {
                    setSelectedCategory('');
                    setShowCategories(false);
                  }}
                  className='flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100'
                >
                  <span className='font-medium text-gray-800'>All Categories</span>
                  <span className='text-sm text-gray-500'>500K+ suppliers</span>
                </div>
                {categories.map(category => (
                  <div
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setShowCategories(false);
                    }}
                    className='px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0'
                  >
                    <div className='flex items-center justify-between mb-1'>
                      <span className='font-medium text-gray-800'>{category.name}</span>
                      <span className='text-sm text-blue-600 font-semibold'>
                        {category.supplierCount.toLocaleString()}+
                      </span>
                    </div>
                    <div className='text-xs text-gray-500'>
                      {category.subcategories.join(' • ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location Input */}
          <div className='relative lg:w-64'>
            <span>📍</span>
            <input
              type='text'
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder='Location (Optional)'
              className='w-full pl-10 pr-4 py-4 bg-gray-50/80 hover:bg-gray-100/80 rounded-lg border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition'
            />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className='px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition shadow-lg group'
          >
            <div className='flex items-center space-x-2'>
              <span>🔍</span>
              <span>Search</span>
              <span>→</span>
            </div>
          </button>
        </div>
      </div>

      {/* Search Metrics & Trending */}
      <div className='mt-6 flex flex-col lg:flex-row justify-between items-center text-sm text-gray-600'>
        <div className='flex items-center space-x-6 mb-4 lg:mb-0'>
          <div className='flex items-center space-x-2'>
            <span>🌍</span>
            <span>50 categories • 300+ subcategories • 500K+ suppliers</span>
          </div>
          <div className='flex items-center space-x-2'>
            <span>⭐</span>
            <span>✓ All suppliers verified</span>
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          <span className='text-gray-500'>Trending:</span>
          <div className='flex flex-wrap gap-2'>
            {trendingSearches.slice(0, 3).map((trend, index) => (
              <button
                key={index}
                onClick={() => setQuery(trend)}
                className='px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium transition'
              >
                {trend}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Search Statistics */}
      <div className='mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20'>
          <div className='text-2xl font-bold text-blue-600'>50</div>
          <div className='text-xs text-gray-600'>Categories</div>
        </div>
        <div className='bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20'>
          <div className='text-2xl font-bold text-green-600'>300+</div>
          <div className='text-xs text-gray-600'>Subcategories</div>
        </div>
        <div className='bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20'>
          <div className='text-2xl font-bold text-purple-600'>500K+</div>
          <div className='text-xs text-gray-600'>Suppliers</div>
        </div>
        <div className='bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20'>
          <div className='text-2xl font-bold text-amber-600'>50+</div>
          <div className='text-xs text-gray-600'>Countries</div>
        </div>
      </div>
    </div>
  );
}
