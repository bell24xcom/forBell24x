'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SearchResult {
  id: string;
  name: string;
  description?: string;
  category?: string;
  type: 'supplier' | 'product';
  location?: string;
  rating?: number;
  verified?: boolean;
  price?: number;
  productCount?: number;
  supplier?: {
    name: string;
    verified: boolean;
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, selectedCategory]);

  const performSearch = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        q: query,
        ...(selectedCategory !== 'All Categories' && { category: selectedCategory }),
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
      } else {
        setError(data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'All Categories',
    'Chemicals & Materials',
    'Automotive Parts',
    'Pharmaceuticals',
    'Food & Beverage',
    'Construction',
    'Energy & Power',
    'Healthcare',
    'Aerospace',
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <Link href='/' className='text-2xl font-bold text-blue-600'>
              Bell24H
            </Link>
            <div className='flex items-center space-x-4'>
              <Link
                href='/login'
                className='text-blue-600 hover:text-blue-800 px-4 py-2 transition-colors'
              >
                Login
              </Link>
              <Link
                href='/register'
                className='bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors'
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Results */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Search Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Search Results for "{query}"</h1>
          <p className='text-gray-600'>
            {loading ? 'Searching...' : `${results.length} results found`}
          </p>
        </div>

        {/* Filters */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6'>
          <div className='flex items-center space-x-4'>
            <label className='text-sm font-medium text-gray-700'>Filter by Category:</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className='border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Searching...</p>
          </div>
        ) : error ? (
          <div className='bg-red-50 border border-red-200 rounded-md p-4'>
            <p className='text-red-800'>{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className='text-center py-12'>
            <div className='text-6xl mb-4'>🔍</div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>No results found</h3>
            <p className='text-gray-600'>
              Try adjusting your search terms or browse our categories
            </p>
            <Link
              href='/'
              className='mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700'
            >
              Browse Categories
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {results.map(result => (
              <div
                key={result.id}
                className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-gray-900 mb-1'>{result.name}</h3>
                    {result.category && (
                      <span className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2'>
                        {result.category}
                      </span>
                    )}
                  </div>
                  <div className='flex items-center space-x-1'>
                    {result.type === 'supplier' && result.verified && (
                      <span className='text-green-600' title='Verified Supplier'>
                        ✓
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        result.type === 'supplier'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {result.type}
                    </span>
                  </div>
                </div>

                {result.description && (
                  <p className='text-gray-600 text-sm mb-3 line-clamp-2'>{result.description}</p>
                )}

                <div className='space-y-2 text-sm text-gray-500'>
                  {result.location && (
                    <div className='flex items-center'>
                      <span className='mr-2'>📍</span>
                      {result.location}
                    </div>
                  )}

                  {result.type === 'supplier' && result.productCount !== undefined && (
                    <div className='flex items-center'>
                      <span className='mr-2'>📦</span>
                      {result.productCount} products
                    </div>
                  )}

                  {result.type === 'product' && result.price !== undefined && (
                    <div className='flex items-center'>
                      <span className='mr-2'>💰</span>${result.price}
                    </div>
                  )}

                  {result.type === 'product' && result.supplier && (
                    <div className='flex items-center'>
                      <span className='mr-2'>🏭</span>
                      {result.supplier.name}
                      {result.supplier.verified && <span className='ml-1 text-green-600'>✓</span>}
                    </div>
                  )}
                </div>

                <div className='mt-4 pt-4 border-t border-gray-100'>
                  <button className='w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium'>
                    {result.type === 'supplier' ? 'View Supplier' : 'View Product'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Loading search...</p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
