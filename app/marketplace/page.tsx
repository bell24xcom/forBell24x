'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'steel', label: 'Steel & Metals' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'machinery', label: 'Machinery' },
    { value: 'chemicals', label: 'Chemicals' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'automotive', label: 'Automotive' }
  ];

  useEffect(() => {
    // Get search parameters from URL
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'all';
    
    setSearchQuery(query);
    setSelectedCategory(category);
    
    // Load initial data
    loadData(query, category);
  }, [searchParams]);

  const loadData = async (query = '', category = 'all') => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, suppliersRes, rfqsRes] = await Promise.all([
        fetch(`/api/products?search=${query}&category=${category}`),
        fetch(`/api/suppliers?search=${query}&category=${category}`),
        fetch(`/api/rfqs?search=${query}&category=${category}`)
      ]);

      const [productsData, suppliersData, rfqsData] = await Promise.all([
        productsRes.json(),
        suppliersRes.json(),
        rfqsRes.json()
      ]);

      setProducts(productsData.products || []);
      setSuppliers(suppliersData.suppliers || []);
      setRfqs(rfqsData.rfqs || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(searchQuery, selectedCategory);
  };

  const handlePopularSearch = (query: string) => {
    setSearchQuery(query);
    loadData(query, selectedCategory);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Marketplace</h1>
            <p className="text-lg text-gray-600 mb-8">
              Find products, suppliers, and RFQs all in one place
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search for products, suppliers, or RFQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
              </div>
            </form>

            {/* Popular Searches */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {['Steel Pipes', 'Textile Machinery', 'Electronics Components', 'Packaged Food', 'Auto Parts'].map((item) => (
                  <button
                    key={item}
                    onClick={() => handlePopularSearch(item)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('suppliers')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'suppliers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Suppliers ({suppliers.length})
              </button>
              <button
                onClick={() => setActiveTab('rfqs')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'rfqs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                RFQs ({rfqs.length})
              </button>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => loadData(searchQuery, selectedCategory)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Products Tab */}
                {activeTab === 'products' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product: any) => (
                      <div key={product.id} className="card p-6">
                        <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="text-gray-400 text-4xl">📦</div>
                          )}
                        </div>
                        
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
                    ))}
                  </div>
                )}

                {/* Suppliers Tab */}
                {activeTab === 'suppliers' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.map((supplier: any) => (
                      <div key={supplier.id} className="card p-6">
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
                )}

                {/* RFQs Tab */}
                {activeTab === 'rfqs' && (
                  <div className="space-y-4">
                    {rfqs.map((rfq: any) => (
                      <div key={rfq.id} className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{rfq.title}</h3>
                            <p className="text-gray-600 mb-2">{rfq.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>By: {rfq.buyer?.name || 'Unknown'}</span>
                              <span>Budget: ₹{rfq.budget?.toLocaleString() || 'N/A'}</span>
                              <span>Qty: {rfq.quantity}</span>
                              <span>Timeline: {rfq.timeline}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rfq.status)}`}>
                              {rfq.status}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(rfq.urgency)}`}>
                              {rfq.urgency}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {rfq.category}
                            </span>
                            <span>{rfq.responses || 0} responses</span>
                            <span>{rfq.views || 0} views</span>
                            <span>{new Date(rfq.createdAt).toLocaleDateString()}</span>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {((activeTab === 'products' && products.length === 0) ||
                  (activeTab === 'suppliers' && suppliers.length === 0) ||
                  (activeTab === 'rfqs' && rfqs.length === 0)) && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600">Try adjusting your search criteria</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    );
}