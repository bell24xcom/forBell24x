'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';

interface SearchBarProps {
  onSearch?: (query: string, category: string, location: string) => void;
  className?: string;
}

export default function SearchBar({ onSearch, className = '' }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Use the API hook instead of static data
  const { categories, loading, error } = useCategories();

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery, selectedCategory, location);
    }
    console.log('Search:', { query: searchQuery, category: selectedCategory, location });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {/* Search Input */}
          <div className='relative md:col-span-2'>
            <div className='relative'>
              <span>🔍</span>
              <input
                type='text'
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyPress={handleKeyPress}
                placeholder='What are you looking for?'
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
              />
            </div>

            {/* Search Suggestions */}
            {showSuggestions && searchQuery && (
              <div className='absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-y-auto'>
                {categories
                  .filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 5)
                  .map(category => (
                    <div
                      key={category.id}
                      className='px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0'
                      onClick={() => {
                        setSearchQuery(category.name);
                        setSelectedCategory(category.id.toString());
                        setShowSuggestions(false);
                      }}
                    >
                      <div className='font-medium text-gray-900'>{category.name}</div>
                    </div>
                  ))}
                {categories.filter(cat =>
                  cat.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <div className='px-4 py-3 text-gray-500'>No categories found</div>
                )}
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div className='relative'>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white'
              disabled={loading}
            >
              <option value=''>All Categories</option>
              {loading ? (
                <option disabled>Loading categories...</option>
              ) : error ? (
                <option disabled>Error loading categories</option>
              ) : (
                categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Location Input */}
          <div className='relative'>
            <div className='relative'>
              <span>📍</span>
              <input
                type='text'
                value={location}
                onChange={e => setLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='Location'
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className='mt-4 flex justify-center'>
          <button
            onClick={handleSearch}
            disabled={loading}
            className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2'
          >
            <span>🔍</span>
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className='mt-2 text-xs text-gray-500'>
            API Status:{' '}
            {loading ? 'Loading...' : error ? 'Error' : `${categories.length} categories loaded`}
          </div>
        )}
      </div>
    </div>
  );
}
