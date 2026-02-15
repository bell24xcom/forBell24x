'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_CATEGORIES, getCategoriesBySearch, Category } from '../data/categories';

interface SearchSuggestion {
  type: 'category' | 'product' | 'supplier' | 'location';
  title: string;
  subtitle?: string;
  icon: string;
  category?: Category;
}

interface PremiumSearchInterfaceProps {
  onSearch?: (query: string, category?: string, location?: string) => void;
  className?: string;
}

export default function PremiumSearchInterface({
  onSearch,
  className = '',
}: PremiumSearchInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Trending searches data
  const trendingSearches = [
    'Electronics Components',
    'Steel Sheets',
    'Industrial Machinery',
    'Chemical Supplies',
    'Textile Fabrics',
    'Automotive Parts',
    'Solar Panels',
    'Packaging Materials',
  ];

  // Popular locations
  const popularLocations = [
    'Mumbai, Maharashtra',
    'Delhi, NCR',
    'Bangalore, Karnataka',
    'Chennai, Tamil Nadu',
    'Pune, Maharashtra',
    'Ahmedabad, Gujarat',
    'Hyderabad, Telangana',
    'Kolkata, West Bengal',
  ];

  // Generate suggestions based on search query
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const newSuggestions: SearchSuggestion[] = [];

    // Category suggestions
    const matchingCategories = getCategoriesBySearch(searchQuery);
    matchingCategories.slice(0, 3).forEach(category => {
      newSuggestions.push({
        type: 'category',
        title: category.name,
        subtitle: `${category.supplierCount} suppliers`,
        icon: category.icon,
        category,
      });
    });

    // Product suggestions (mock data)
    const productSuggestions = [
      { title: `${searchQuery} Components`, subtitle: 'Electronic Parts', icon: '⚡' },
      { title: `${searchQuery} Equipment`, subtitle: 'Industrial Machinery', icon: '⚙️' },
      { title: `${searchQuery} Materials`, subtitle: 'Raw Materials', icon: '🧱' },
    ];

    productSuggestions.slice(0, 2).forEach(product => {
      newSuggestions.push({
        type: 'product',
        title: product.title,
        subtitle: product.subtitle,
        icon: product.icon,
      });
    });

    // Supplier suggestions (mock data)
    newSuggestions.push({
      type: 'supplier',
      title: `Suppliers for "${searchQuery}"`,
      subtitle: 'Verified suppliers',
      icon: '🏢',
    });

    setSuggestions(newSuggestions);
  }, [searchQuery]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bell24h-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = (query?: string, category?: string, location?: string) => {
    const finalQuery = query || searchQuery;
    const finalCategory = category || selectedCategory;
    const finalLocation = location || selectedLocation;

    if (finalQuery.trim()) {
      // Save to recent searches
      const updated = [finalQuery, ...recentSearches.filter(s => s !== finalQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('bell24h-recent-searches', JSON.stringify(updated));

      onSearch?.(finalQuery, finalCategory, finalLocation);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.title);
    if (suggestion.category) {
      setSelectedCategory(suggestion.category.id);
    }
    handleSearch(suggestion.title);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('bell24h-recent-searches');
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* Main Search Container */}
      <motion.div
        className={`relative bg-white rounded-2xl shadow-2xl border-2 transition-all duration-300 ${
          isSearchFocused ? 'border-blue-500 shadow-blue-100' : 'border-gray-200'
        }`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className='flex items-center p-2'>
          {/* Search Icon */}
          <div className='pl-4 pr-2'>
            <span>🔍</span>
          </div>

          {/* Search Input */}
          <input
            ref={searchInputRef}
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => {
              setIsSearchFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsSearchFocused(false);
                setShowSuggestions(false);
              }, 200);
            }}
            placeholder='Search for products, suppliers, or categories...'
            className='flex-1 py-4 px-2 text-lg bg-transparent border-none outline-none placeholder-gray-500'
          />

          {/* Category Dropdown */}
          <div className='border-l border-gray-200 pl-4'>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className='py-2 px-3 bg-transparent border-none outline-none text-gray-700 cursor-pointer'
            >
              <option value=''>All Categories</option>
              {ALL_CATEGORIES.slice(0, 15).map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Input */}
          <div className='border-l border-gray-200 pl-4'>
            <div className='flex items-center'>
              <span>📍</span>
              <input
                type='text'
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                placeholder='Location'
                className='py-2 px-2 w-32 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400'
              />
            </div>
          </div>

          {/* Search Button */}
          <motion.button
            onClick={() => handleSearch()}
            className='ml-4 mr-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Search
          </motion.button>
        </div>

        {/* Real-time Metrics */}
        <div className='px-6 pb-4'>
          <div className='flex items-center justify-between text-sm text-gray-600'>
            <div className='flex items-center gap-6'>
              <span>50+ categories</span>
              <span>300+ subcategories</span>
              <span>500K+ suppliers</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <span>All suppliers verified</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className='absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden'
          >
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className='p-4'>
                <h4 className='text-sm font-semibold text-gray-700 mb-3'>Suggestions</h4>
                <div className='space-y-2'>
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={`${suggestion.type}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className='w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left'
                    >
                      <span className='text-lg'>{suggestion.icon}</span>
                      <div>
                        <div className='font-medium text-gray-900'>{suggestion.title}</div>
                        {suggestion.subtitle && (
                          <div className='text-sm text-gray-500'>{suggestion.subtitle}</div>
                        )}
                      </div>
                      <span>→</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            {searchQuery.length < 2 && (
              <div className='p-4 border-t border-gray-100'>
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                    <span>📈</span>
                    Trending Searches
                  </h4>
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  {trendingSearches.slice(0, 6).map((search, index) => (
                    <motion.button
                      key={search}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleSearch(search)}
                      className='flex items-center gap-2 p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-left'
                    >
                      <span>📈</span>
                      {search}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && searchQuery.length < 2 && (
              <div className='p-4 border-t border-gray-100'>
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                    <span>🕐</span>
                    Recent Searches
                  </h4>
                  <button
                    onClick={clearRecentSearches}
                    className='text-xs text-gray-500 hover:text-gray-700'
                  >
                    Clear
                  </button>
                </div>
                <div className='space-y-1'>
                  {recentSearches.map((search, index) => (
                    <motion.button
                      key={search}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSearch(search)}
                      className='w-full flex items-center gap-3 p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-left'
                    >
                      <span>🕐</span>
                      {search}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Locations */}
            {!selectedLocation && searchQuery.length < 2 && (
              <div className='p-4 border-t border-gray-100'>
                <h4 className='text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2'>
                  <span>📍</span>
                  Popular Locations
                </h4>
                <div className='grid grid-cols-2 gap-2'>
                  {popularLocations.slice(0, 6).map((location, index) => (
                    <motion.button
                      key={location}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedLocation(location)}
                      className='flex items-center gap-2 p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-left'
                    >
                      <span>📍</span>
                      {location}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
