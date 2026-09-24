'use client';

import { useState } from 'react';

export interface SupplierCard {
  id: string;
  name: string | null;
  company: string | null;
  location: string | null;
  isVerified: boolean;
  trustScore: number;
  categories: string[];
}

export interface SuppliersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const PAGE_SIZE = 24;

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'steel', label: 'Steel & Metals' },
  { value: 'textiles', label: 'Textiles' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'machinery', label: 'Machinery' },
  { value: 'chemicals', label: 'Chemicals' },
];

interface Props {
  initialSuppliers: SupplierCard[];
  initialPagination: SuppliersPagination;
}

/**
 * SEO fix (Task 2, SEO_PHASE_2_SSR_AND_SITEMAP): the interactive search/filter
 * UI that used to own the ENTIRE page (including the initial fetch) now only
 * owns interactive re-filtering. It is seeded with the server-rendered first
 * page so the first-byte HTML always has real supplier data — no useEffect
 * fetch runs on mount, and this component's own SSR pass (it is still
 * server-rendered once, like any client component, before hydration) emits
 * the seeded list directly into the HTML. Base ?page=N browsing is handled
 * by real <Link> pagination in page.tsx (crawlable); this component's own
 * Previous/Next only appears once the user has actively searched or filtered,
 * since those result sets aren't individually indexed pages.
 */
export default function SuppliersClient({ initialSuppliers, initialPagination }: Props) {
  const [suppliers, setSuppliers] = useState<SupplierCard[]>(initialSuppliers);
  const [pagination, setPagination] = useState<SuppliersPagination>(initialPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFiltered, setIsFiltered] = useState(false);

  const fetchSuppliers = async (page = 1, search = '', category = 'all') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: String(PAGE_SIZE),
      });

      if (search) params.append('search', search);
      if (category && category !== 'all') params.append('category', category);

      const response = await fetch(`/api/suppliers?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch suppliers');

      const data = await response.json();

      setSuppliers(
        (data.suppliers || []).map((s: Record<string, unknown>) => ({
          id: s.id,
          name: (s.name as string | null) ?? null,
          company: (s.company as string | null) ?? null,
          location: (s.location as string | null) ?? null,
          isVerified: !!s.isVerified,
          trustScore: (s.trustScore as number) ?? 0,
          categories: [],
        }))
      );
      setPagination(
        data.pagination || {
          page: 1,
          limit: PAGE_SIZE,
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        }
      );
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to load suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFiltered(true);
    fetchSuppliers(1, searchTerm, selectedCategory);
  };

  const handlePageChange = (newPage: number) => {
    fetchSuppliers(newPage, searchTerm, selectedCategory);
  };

  const resetToBase = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setIsFiltered(false);
    setSuppliers(initialSuppliers);
    setPagination(initialPagination);
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by category"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
        {isFiltered && (
          <button
            type="button"
            onClick={resetToBase}
            className="px-6 py-3 border border-gray-300 text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Suppliers</h3>
          <p className="text-slate-300 mb-4">{error}</p>
          <button
            onClick={() => fetchSuppliers(1, searchTerm, selectedCategory)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : suppliers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-gray-900 border border-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {supplier.company || supplier.name || 'Verified Supplier'}
                    </h3>
                    {supplier.company && supplier.name && (
                      <p className="text-gray-300">{supplier.name}</p>
                    )}
                  </div>
                  {supplier.isVerified && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {supplier.location && (
                    <p className="text-sm text-gray-300">
                      <span className="font-medium">Location:</span> {supplier.location}
                    </p>
                  )}
                  {supplier.categories.length > 0 && (
                    <p className="text-sm text-gray-300">
                      <span className="font-medium">Category:</span> {supplier.categories.join(', ')}
                    </p>
                  )}
                </div>

                <a
                  href={`/supplier/${supplier.id}`}
                  className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium min-h-[44px] flex items-center justify-center"
                >
                  View Profile
                </a>
              </div>
            ))}
          </div>

          {isFiltered && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-900"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-slate-300">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-900"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-6">🏭</div>
          <h3 className="text-2xl font-bold text-white mb-3">No suppliers matched your search</h3>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            Try a different search term or category, or browse the full directory.
          </p>
          {isFiltered && (
            <button
              onClick={resetToBase}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Back to All Suppliers
            </button>
          )}
        </div>
      )}
    </div>
  );
}
