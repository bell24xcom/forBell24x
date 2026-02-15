'use client';

import { useState, useEffect } from 'react';
import { RfqsApi, Configuration } from '../generated/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const config = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
});

const rfqsApi = new RfqsApi(config);

export default function RFQPage() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
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

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'closed', label: 'Closed' },
    { value: 'expired', label: 'Expired' }
  ];

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchRFQs = async (page = 1, search = '', status = 'all', category = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await rfqsApi.rfqsGet({
        page,
        limit: pagination.limit,
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        category: category !== 'all' ? category : undefined
      });
      
      setRfqs(response.data.rfqs);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching RFQs:', err);
      setError('Failed to fetch RFQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRFQs(1, searchTerm, selectedStatus, selectedCategory);
  };

  const handlePageChange = (newPage) => {
    fetchRFQs(newPage, searchTerm, selectedStatus, selectedCategory);
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Request for Quotations</h1>
            <p className="text-lg text-gray-600 mb-8">
              Browse and respond to RFQs from buyers
            </p>
            
            <form onSubmit={handleSearch} className="space-y-4 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search RFQs..."
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
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
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
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading RFQs</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchRFQs()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : rfqs.length > 0 ? (
              <>
                <div className="space-y-4">
                  {rfqs.map((rfq) => (
                    <div key={rfq.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
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
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No RFQs found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
}