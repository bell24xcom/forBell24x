'use client';

import { useState, useEffect } from 'react';
// Mock API functions
const mockSuppliersApi = {
  getSuppliers: async () => {
    // Mock data for demonstration
    return {
      data: [
        {
          id: '1',
          name: 'TechCorp India',
          category: 'Electronics',
          rating: 4.8,
          location: 'Mumbai',
          verified: true,
          products: 150,
          established: '2015'
        },
        {
          id: '2',
          name: 'SteelWorks Ltd',
          category: 'Manufacturing',
          rating: 4.6,
          location: 'Delhi',
          verified: true,
          products: 89,
          established: '2010'
        },
        {
          id: '3',
          name: 'ChemSolutions',
          category: 'Chemicals',
          rating: 4.4,
          location: 'Bangalore',
          verified: true,
          products: 67,
          established: '2018'
        }
      ]
    };
  }
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'steel', label: 'Steel & Metals' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'machinery', label: 'Machinery' },
    { value: 'chemicals', label: 'Chemicals' }
  ];

  const fetchSuppliers = async (page = 1, search = '', category = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mockSuppliersApi.getSuppliers();
      
      setSuppliers(response.data);
      setPagination({
        page: 1,
        limit: 10,
        total: response.data.length,
        totalPages: 1
      });
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSuppliers(1, searchTerm, selectedCategory);
  };

  const handlePageChange = (newPage) => {
    fetchSuppliers(newPage, searchTerm, selectedCategory);
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Verified Suppliers</h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect with verified suppliers across India
            </p>
            
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
                {categories.map(category => (
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
            </form>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Suppliers</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchSuppliers()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : suppliers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{supplier.company}</h3>
                          <p className="text-gray-600">{supplier.name}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          {supplier.verified && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
                              Verified
                            </span>
                          )}
                          <div className="flex items-center">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm text-gray-600 ml-1">{supplier.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Location:</span> {supplier.location}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Category:</span> {supplier.category}
                        </p>
                      </div>
                      
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrev}
                        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No suppliers found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
}