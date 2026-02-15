'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Supplier {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviews: number;
  orders: number;
  responseTime: string;
  aiMatchScore: number;
  verified: boolean;
  ecgcApproved: boolean;
  featured: boolean;
  description: string;
  specialties: string[];
  certifications: string[];
  employees: string;
  revenue: string;
  establishedYear: number;
  logo: string;
  priceRange: string;
  successRate: string;
}

export default function BuyerSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);

  // Mock suppliers data
  const mockSuppliers: Supplier[] = [
    {
      id: '1',
      name: 'TechSupply Pro',
      category: 'Electronics',
      location: 'Mumbai, Maharashtra',
      rating: 4.8,
      reviews: 234,
      orders: 2340,
      responseTime: '<2hrs',
      aiMatchScore: 98.7,
      verified: true,
      ecgcApproved: true,
      featured: true,
      description: 'Leading electronics component supplier with 15+ years experience in PCB manufacturing and component sourcing',
      specialties: ['PCB Manufacturing', 'Component Sourcing', 'Assembly Services'],
      certifications: ['ISO 9001', 'ECGC Approved', 'BELL24H Verified'],
      employees: '500-1000',
      revenue: '₹50-100Cr',
      establishedYear: 2008,
      logo: '🏭',
      priceRange: '₹1K - ₹1L',
      successRate: '98.5%',
    },
    {
      id: '2',
      name: 'TextileCraft Industries',
      category: 'Textiles',
      location: 'Bangalore, Karnataka',
      rating: 4.7,
      reviews: 189,
      orders: 1890,
      responseTime: '<1hr',
      aiMatchScore: 95.2,
      verified: true,
      ecgcApproved: true,
      featured: true,
      description: 'Premium textile manufacturer specializing in sustainable garment production and fabric innovation',
      specialties: ['Fabric Sourcing', 'Garment Manufacturing', 'Dyeing Services'],
      certifications: ['GOTS Certified', 'ECGC Approved', 'BELL24H Verified'],
      employees: '200-500',
      revenue: '₹25-50Cr',
      establishedYear: 2012,
      logo: '🧵',
      priceRange: '₹500 - ₹5K',
      successRate: '96.8%',
    },
    {
      id: '3',
      name: 'AutoParts Solutions',
      category: 'Automotive',
      location: 'Chennai, Tamil Nadu',
      rating: 4.9,
      reviews: 312,
      orders: 3120,
      responseTime: '<3hrs',
      aiMatchScore: 97.3,
      verified: true,
      ecgcApproved: true,
      featured: true,
      description: 'Comprehensive automotive parts supplier with expertise in OEM and aftermarket solutions',
      specialties: ['Engine Parts', 'Brake Systems', 'Electrical Components'],
      certifications: ['ISO 14001', 'ECGC Approved', 'BELL24H Verified'],
      employees: '1000-2000',
      revenue: '₹100-200Cr',
      establishedYear: 2005,
      logo: '🚗',
      priceRange: '₹2K - ₹50K',
      successRate: '99.1%',
    },
    {
      id: '4',
      name: 'ChemCorp Industries',
      category: 'Chemicals',
      location: 'Ahmedabad, Gujarat',
      rating: 4.6,
      reviews: 156,
      orders: 1560,
      responseTime: '<4hrs',
      aiMatchScore: 93.8,
      verified: true,
      ecgcApproved: true,
      featured: false,
      description: 'Specialized chemical manufacturer providing industrial and specialty chemicals',
      specialties: ['Industrial Chemicals', 'Specialty Chemicals', 'Custom Formulations'],
      certifications: ['ISO 9001', 'ECGC Approved', 'BELL24H Verified'],
      employees: '300-500',
      revenue: '₹30-60Cr',
      establishedYear: 2010,
      logo: '🧪',
      priceRange: '₹5K - ₹1L',
      successRate: '95.2%',
    },
    {
      id: '5',
      name: 'MachineryMax Pro',
      category: 'Machinery',
      location: 'Pune, Maharashtra',
      rating: 4.5,
      reviews: 98,
      orders: 980,
      responseTime: '<6hrs',
      aiMatchScore: 91.4,
      verified: true,
      ecgcApproved: true,
      featured: false,
      description: 'Heavy machinery and industrial equipment supplier with custom fabrication capabilities',
      specialties: ['CNC Machines', 'Industrial Equipment', 'Custom Fabrication'],
      certifications: ['CE Certified', 'ECGC Approved', 'BELL24H Verified'],
      employees: '150-300',
      revenue: '₹20-40Cr',
      establishedYear: 2015,
      logo: '⚙️',
      priceRange: '₹50K - ₹50L',
      successRate: '94.7%',
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSuppliers(mockSuppliers);
      setFilteredSuppliers(mockSuppliers);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Filter suppliers based on search and filters
    let filtered = suppliers;

    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(supplier => supplier.category === selectedCategory);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(supplier => supplier.location.includes(selectedLocation));
    }

    // Sort suppliers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'aiMatch':
          return b.aiMatchScore - a.aiMatchScore;
        case 'orders':
          return b.orders - a.orders;
        case 'responseTime':
          return a.responseTime.localeCompare(b.responseTime);
        default:
          return 0;
      }
    });

    setFilteredSuppliers(filtered);
  }, [suppliers, searchTerm, selectedCategory, selectedLocation, sortBy]);

  const categories = ['all', 'Electronics', 'Textiles', 'Automotive', 'Chemicals', 'Machinery'];
  const locations = ['all', 'Mumbai', 'Bangalore', 'Chennai', 'Ahmedabad', 'Pune'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/supplier/dashboard" 
            className="text-amber-600 hover:text-amber-700 mb-4 inline-flex items-center"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Suppliers</h1>
          <p className="text-gray-600">
            Discover verified suppliers with AI-powered matching and real-time ratings
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Suppliers</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, category, or description..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort and View Options */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="rating">Rating</option>
                <option value="aiMatch">AI Match Score</option>
                <option value="orders">Total Orders</option>
                <option value="responseTime">Response Time</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}
              >
                📱
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}
              >
                📋
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found <span className="font-semibold text-amber-600">{filteredSuppliers.length}</span> suppliers
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Suppliers Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{supplier.logo}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                        <p className="text-sm text-gray-600">{supplier.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {supplier.verified && <span className="text-blue-500">✅</span>}
                      {supplier.ecgcApproved && <span className="text-green-500">🏦</span>}
                      {supplier.featured && <span className="text-amber-500">⭐</span>}
                    </div>
                  </div>

                  {/* AI Match Score */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">AI Match Score</span>
                      <span className="text-lg font-bold text-blue-600">{supplier.aiMatchScore}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${supplier.aiMatchScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold">{supplier.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500">{supplier.reviews} reviews</p>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{supplier.successRate}</div>
                      <p className="text-xs text-gray-500">Success Rate</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{supplier.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Location:</span>
                      <span className="font-medium">{supplier.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Response Time:</span>
                      <span className="font-medium text-green-600">{supplier.responseTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Established:</span>
                      <span className="font-medium">{supplier.establishedYear}</span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.specialties.slice(0, 2).map((specialty, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                          {specialty}
                        </span>
                      ))}
                      {supplier.specialties.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                          +{supplier.specialties.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/buyer/suppliers/${supplier.id}`}
                      className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors text-center"
                    >
                      View Details
                    </Link>
                    <button className="px-4 py-2 border border-amber-600 text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors">
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{supplier.logo}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                      <p className="text-sm text-gray-600">{supplier.category} • {supplier.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold">{supplier.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500">{supplier.reviews} reviews</p>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{supplier.aiMatchScore}%</div>
                      <p className="text-xs text-gray-500">AI Match</p>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{supplier.successRate}</div>
                      <p className="text-xs text-gray-500">Success</p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/buyer/suppliers/${supplier.id}`}
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                      >
                        View Details
                      </Link>
                      <button className="px-4 py-2 border border-amber-600 text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors">
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No suppliers found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters to find more suppliers.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLocation('all');
              }}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
