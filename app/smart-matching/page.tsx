'use client';

import React, { useState } from 'react';
import { Sparkles, Search, Filter, Star, MapPin, Clock, CheckCircle } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  verified: boolean;
  products: number;
  established: string;
  priceRange: string;
  deliveryTime: string;
  matchScore: number;
  matchReasons: string[];
}

export default function SmartMatchingPage() {
  const [requirement, setRequirement] = useState({
    title: '',
    description: '',
    category: 'electronics',
    quantity: '',
    targetPrice: '',
    deadline: '',
    location: '',
    urgency: 'medium'
  });

  const [matches, setMatches] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'machinery', label: 'Machinery' },
    { value: 'chemicals', label: 'Chemicals' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'construction', label: 'Construction' },
    { value: 'textiles', label: 'Textiles' }
  ];

  const mockSuppliers: Supplier[] = [
    {
      id: '1',
      name: 'TechCorp India',
      category: 'Electronics',
      rating: 4.8,
      location: 'Mumbai',
      verified: true,
      products: 150,
      established: '2015',
      priceRange: '₹50K - ₹5L',
      deliveryTime: '2-3 weeks',
      matchScore: 95,
      matchReasons: ['Perfect category match', 'High rating', 'Same location', 'Verified supplier']
    },
    {
      id: '2',
      name: 'SteelWorks Ltd',
      category: 'Manufacturing',
      rating: 4.6,
      location: 'Delhi',
      verified: true,
      products: 89,
      established: '2010',
      priceRange: '₹1L - ₹10L',
      deliveryTime: '3-4 weeks',
      matchScore: 87,
      matchReasons: ['Category expertise', 'Good rating', 'Verified supplier']
    },
    {
      id: '3',
      name: 'ChemSolutions',
      category: 'Chemicals',
      rating: 4.4,
      location: 'Bangalore',
      verified: true,
      products: 67,
      established: '2018',
      priceRange: '₹25K - ₹2L',
      deliveryTime: '1-2 weeks',
      matchScore: 82,
      matchReasons: ['Category match', 'Fast delivery', 'Verified supplier']
    }
  ];

  const handleSearch = async () => {
    if (!requirement.title || !requirement.category) {
      alert('Please fill in the title and category');
      return;
    }

    setIsLoading(true);
    
    // Simulate AI matching delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Filter suppliers based on category and calculate match scores
    const filteredSuppliers = mockSuppliers
      .filter(supplier => supplier.category.toLowerCase() === requirement.category.toLowerCase())
      .map(supplier => ({
        ...supplier,
        matchScore: Math.floor(Math.random() * 20) + 80, // 80-100% match
        matchReasons: [
          'Perfect category match',
          'High rating',
          'Verified supplier',
          'Good delivery time'
        ]
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    setMatches(filteredSuppliers);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Smart Matching</h1>
              <p className="text-gray-600 mt-1">Find perfect suppliers using advanced AI</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="text-gray-600">98.5% Accuracy</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <Search className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Search Requirements</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product/Service Title *
                  </label>
                  <input
                    type="text"
                    value={requirement.title}
                    onChange={e => setRequirement(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Circuit Boards for Industrial Controllers"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={requirement.category}
                    onChange={e => setRequirement(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Select category"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={requirement.quantity}
                    onChange={e => setRequirement(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="e.g., 500 units"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Price
                  </label>
                  <input
                    type="text"
                    value={requirement.targetPrice}
                    onChange={e => setRequirement(prev => ({ ...prev, targetPrice: e.target.value }))}
                    placeholder="e.g., ₹2,50,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={requirement.location}
                    onChange={e => setRequirement(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Mumbai"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-3 pt-4">
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Finding Matches...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Find Smart Matches
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => window.location.href = '/video-rfq'}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <span>🎤</span>
                    Use Voice RFQ
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {matches.length > 0 || isLoading ? (
              <div className="space-y-6">
                {isLoading ? (
                  <div className="bg-white rounded-xl shadow-sm border p-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">AI is analyzing your requirements...</h3>
                      <p className="text-gray-600">Finding the best supplier matches using advanced algorithms</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Found {matches.length} Smart Matches
                      </h3>
                      <p className="text-gray-600">
                        AI-powered matching for: <strong>{requirement.title}</strong>
                      </p>
                    </div>

                    {matches.map((supplier) => (
                      <div key={supplier.id} className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-xl font-semibold text-gray-900">{supplier.name}</h4>
                              {supplier.verified && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>{supplier.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{supplier.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{supplier.deliveryTime}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {supplier.matchScore}%
                            </div>
                            <div className="text-sm text-gray-500">Match Score</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-600">Category</div>
                            <div className="font-medium">{supplier.category}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Price Range</div>
                            <div className="font-medium">{supplier.priceRange}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Products</div>
                            <div className="font-medium">{supplier.products} items</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-2">Why this match?</div>
                          <div className="flex flex-wrap gap-2">
                            {supplier.matchReasons.map((reason, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            Contact Supplier
                          </button>
                          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            View Profile
                          </button>
                          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Save
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    AI-Powered Smart Matching
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    Enter your requirements to find perfect suppliers using advanced AI algorithms.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="text-left">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <span>⚡</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">98.5% Accuracy</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Advanced AI ensures highly accurate supplier matching.
                      </p>
                    </div>

                    <div className="text-left">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <span>🔍</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">Smart Filtering</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Intelligent filtering for optimal supplier matches.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
