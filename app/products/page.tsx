'use client';

import { useState, useEffect } from 'react';
// Mock API functions
const mockProductsApi = {
  getProducts: async () => {
    // Mock data for demonstration
    return {
      data: [
        {
          id: '1',
          name: 'Industrial Steel Pipes',
          category: 'Steel & Metals',
          price: 2500,
          unit: 'per meter',
          supplier: 'SteelCorp India',
          rating: 4.8,
          location: 'Mumbai',
          verified: true,
          image: '/api/placeholder/300/200'
        },
        {
          id: '2',
          name: 'Electronic Components',
          category: 'Electronics',
          price: 150,
          unit: 'per piece',
          supplier: 'TechElectronics Ltd',
          rating: 4.6,
          location: 'Bangalore',
          verified: true,
          image: '/api/placeholder/300/200'
        },
        {
          id: '3',
          name: 'Chemical Solvents',
          category: 'Chemicals',
          price: 500,
          unit: 'per liter',
          supplier: 'ChemSolutions',
          rating: 4.4,
          location: 'Delhi',
          verified: true,
          image: '/api/placeholder/300/200'
        }
      ]
    };
  }
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
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

  const fetchProducts = async (page = 1, search = '', category = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mockProductsApi.getProducts();
      
      setProducts(response.data);
      setPagination({
        page: 1,
        limit: 10,
        total: response.data.length,
        totalPages: 1
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1, searchTerm, selectedCategory);
  };

  const handlePageChange = (newPage) => {
    fetchProducts(newPage, searchTerm, selectedCategory);
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Catalog</h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover products from verified suppliers
            </p>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Products</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchProducts()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400 text-4xl">📦</div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                          <span className="text-2xl font-bold text-blue-600">
                            ₹{product.price?.toLocaleString() || 'N/A'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            {product.category}
                          </span>
                          <div className="flex items-center">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm text-gray-600 ml-1">{product.supplier?.rating || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{product.supplier?.company || 'Unknown'}</p>
                            {product.supplier?.verified && (
                              <span className="text-xs text-green-600">✓ Verified</span>
                            )}
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
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
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
}