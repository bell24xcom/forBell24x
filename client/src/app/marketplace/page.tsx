'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Loading marketplace...</p>
          </div>
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'buying';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('rating');

  // Unified business partners data - same entities can buy and sell
  const businessPartners = [
    {
      id: 1,
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
      description:
        'Leading electronics component supplier with 15+ years experience in PCB manufacturing and component sourcing',
      specialties: ['PCB Manufacturing', 'Component Sourcing', 'Assembly Services'],
      certifications: ['ISO 9001', 'ECGC Approved', 'BELL24H Verified'],
      employees: '500-1000',
      revenue: '₹50-100Cr',
      establishedYear: 2008,
      logo: '🏭',
      priceRange: '₹1K - ₹1L',
      successRate: '98.5%',
      // Unified capabilities
      buyingNeeds: ['Raw Materials', 'Packaging', 'Logistics Services'],
      sellingProducts: ['PCB Boards', 'Electronic Components', 'Assembly Services'],
      tradeVolume: '₹2.5Cr/month',
      paymentTerms: 'Net 30',
    },
    {
      id: 2,
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
      description:
        'Premium textile manufacturer specializing in sustainable garment production and fabric innovation',
      specialties: ['Fabric Sourcing', 'Garment Manufacturing', 'Dyeing Services'],
      certifications: ['GOTS Certified', 'ECGC Approved', 'BELL24H Verified'],
      employees: '200-500',
      revenue: '₹25-50Cr',
      establishedYear: 2012,
      logo: '🧵',
      priceRange: '₹500 - ₹5K',
      successRate: '96.8%',
      buyingNeeds: ['Cotton Yarn', 'Dyes', 'Machinery Parts'],
      sellingProducts: ['Fabric Rolls', 'Finished Garments', 'Dyeing Services'],
      tradeVolume: '₹1.8Cr/month',
      paymentTerms: 'Net 45',
    },
    {
      id: 3,
      name: 'MachineTech Solutions',
      category: 'Machinery',
      location: 'Pune, Maharashtra',
      rating: 4.9,
      reviews: 156,
      orders: 1650,
      responseTime: '<3hrs',
      aiMatchScore: 97.3,
      verified: true,
      ecgcApproved: false,
      featured: false,
      description:
        'Industrial machinery specialist providing CNC equipment and manufacturing automation solutions',
      specialties: ['CNC Machines', 'Industrial Equipment', 'Automation'],
      certifications: ['ISO 14001', 'CE Certified', 'BELL24H Verified'],
      employees: '100-200',
      revenue: '₹10-25Cr',
      establishedYear: 2015,
      logo: '⚙️',
      priceRange: '₹10K - ₹10L',
      successRate: '94.2%',
      buyingNeeds: ['Steel Components', 'Electronics', 'Software Licenses'],
      sellingProducts: ['CNC Machines', 'Automation Systems', 'Maintenance Services'],
      tradeVolume: '₹1.2Cr/month',
      paymentTerms: 'Net 60',
    },
    {
      id: 4,
      name: 'ChemSupply Pro',
      category: 'Chemicals',
      location: 'Ahmedabad, Gujarat',
      rating: 4.6,
      reviews: 98,
      orders: 890,
      responseTime: '<4hrs',
      aiMatchScore: 93.8,
      verified: true,
      ecgcApproved: true,
      featured: false,
      description:
        'Chemical solutions provider for industrial and pharmaceutical applications with strict quality standards',
      specialties: ['Industrial Chemicals', 'Pharma Grade', 'Custom Formulations'],
      certifications: ['ISO 9001', 'GMP Certified', 'BELL24H Verified'],
      employees: '50-100',
      revenue: '₹5-10Cr',
      establishedYear: 2018,
      logo: '🧪',
      priceRange: '₹5K - ₹50K',
      successRate: '92.1%',
      buyingNeeds: ['Raw Chemicals', 'Packaging Materials', 'Lab Equipment'],
      sellingProducts: ['Industrial Chemicals', 'Pharma Chemicals', 'Custom Solutions'],
      tradeVolume: '₹80L/month',
      paymentTerms: 'Net 30',
    },
    {
      id: 5,
      name: 'AutoParts Hub',
      category: 'Automotive',
      location: 'Chennai, Tamil Nadu',
      rating: 4.5,
      reviews: 145,
      orders: 1230,
      responseTime: '<2hrs',
      aiMatchScore: 91.4,
      verified: true,
      ecgcApproved: false,
      featured: false,
      description:
        'Automotive parts supplier specializing in OEM and aftermarket components for all vehicle types',
      specialties: ['Engine Parts', 'Body Components', 'Electrical Systems'],
      certifications: ['ISO/TS 16949', 'OEM Approved', 'BELL24H Verified'],
      employees: '300-500',
      revenue: '₹20-40Cr',
      establishedYear: 2010,
      logo: '🚗',
      priceRange: '₹2K - ₹20K',
      successRate: '89.7%',
      buyingNeeds: ['Steel Alloys', 'Plastics', 'Electronics'],
      sellingProducts: ['Engine Parts', 'Body Panels', 'Electrical Components'],
      tradeVolume: '₹1.5Cr/month',
      paymentTerms: 'Net 45',
    },
  ];

  const getModeSpecificTitle = () => {
    return mode === 'buying' ? 'Find Suppliers' : 'Find Buyers';
  };

  const getModeSpecificDescription = () => {
    return mode === 'buying'
      ? 'Connect with verified suppliers across India'
      : 'Connect with verified buyers across India';
  };

  const getActionButtonText = () => {
    return mode === 'buying' ? 'Contact Supplier' : 'Contact Buyer';
  };

  // Filter and sort business partners
  const filteredPartners = useMemo(() => {
    let filtered = businessPartners;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        partner =>
          partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          partner.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          partner.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(partner => partner.category === selectedCategory);
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(partner => partner.location.includes(selectedLocation));
    }

    // Sort by selected criteria
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'orders':
        filtered.sort((a, b) => b.orders - a.orders);
        break;
      case 'aiMatchScore':
        filtered.sort((a, b) => b.aiMatchScore - a.aiMatchScore);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [searchTerm, selectedCategory, selectedLocation, sortBy]);

  const categories = ['all', 'Electronics', 'Textiles', 'Machinery', 'Chemicals', 'Automotive'];
  const locations = ['all', 'Mumbai', 'Bangalore', 'Pune', 'Ahmedabad', 'Chennai'];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-lg border-b border-gray-100'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/'
                className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
              >
                BELL24H
              </Link>
              <div className='border-l border-gray-300 pl-4'>
                <h1 className='text-2xl font-bold text-gray-900'>{getModeSpecificTitle()}</h1>
                <p className='text-gray-600'>{getModeSpecificDescription()}</p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2 bg-gray-100 rounded-lg p-1'>
                <Link
                  href='/marketplace?mode=buying'
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    mode === 'buying'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>🛒</span>
                  Buying
                </Link>
                <Link
                  href='/marketplace?mode=selling'
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    mode === 'selling'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>📦</span>
                  Selling
                </Link>
              </div>
              <Link
                href='/auth/register?type=business'
                className='bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700'
              >
                Join as Business
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='container mx-auto px-4 py-6'>
        <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {/* Search */}
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Search</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                  🔍
                </span>
                <input
                  type='text'
                  placeholder='Search suppliers, products, or categories...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Category</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
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
              <label className='block text-sm font-medium text-gray-700 mb-2'>Location</label>
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
              >
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View and Sort Controls */}
          <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-200'>
            <div className='flex items-center space-x-4'>
              <span className='text-sm font-medium text-gray-700'>Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className='px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='rating'>Rating</option>
                <option value='orders'>Orders</option>
                <option value='aiMatchScore'>AI Match Score</option>
                <option value='name'>Name</option>
              </select>
            </div>

            <div className='flex items-center space-x-2'>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span>⊞</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span>☰</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className='mb-4'>
          <p className='text-gray-600'>
            Showing {filteredPartners.length} of {businessPartners.length}{' '}
            {mode === 'buying' ? 'suppliers' : 'buyers'}
          </p>
        </div>

        {/* Business Partners Grid */}
        <div
          className={`grid gap-6 ${
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          }`}
        >
          {filteredPartners.map(partner => (
            <div
              key={partner.id}
              className='bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow'
            >
              {/* Partner Header */}
              <div className='p-6 border-b border-gray-100'>
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='text-3xl'>{partner.logo}</div>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900'>{partner.name}</h3>
                      <p className='text-sm text-gray-600'>{partner.category}</p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-1'>
                    {partner.verified && <span title='Verified'>✅</span>}
                    {partner.ecgcApproved && <span title='ECGC Approved'>🛡️</span>}
                    {partner.featured && <span title='Featured'>⭐</span>}
                  </div>
                </div>

                <p className='text-gray-600 text-sm mb-4'>{partner.description}</p>

                {/* Stats */}
                <div className='grid grid-cols-3 gap-4 text-center'>
                  <div>
                    <div className='text-lg font-bold text-blue-600'>{partner.rating}</div>
                    <div className='text-xs text-gray-500'>Rating</div>
                  </div>
                  <div>
                    <div className='text-lg font-bold text-green-600'>{partner.orders}</div>
                    <div className='text-xs text-gray-500'>Orders</div>
                  </div>
                  <div>
                    <div className='text-lg font-bold text-purple-600'>{partner.aiMatchScore}%</div>
                    <div className='text-xs text-gray-500'>AI Match</div>
                  </div>
                </div>
              </div>

              {/* Partner Details */}
              <div className='p-6'>
                <div className='space-y-3 mb-4'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Location:</span>
                    <span className='font-medium'>{partner.location}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Response Time:</span>
                    <span className='font-medium text-green-600'>{partner.responseTime}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Success Rate:</span>
                    <span className='font-medium text-green-600'>{partner.successRate}</span>
                  </div>
                </div>

                {/* Specialties */}
                <div className='mb-4'>
                  <h4 className='text-sm font-medium text-gray-700 mb-2'>Specialties:</h4>
                  <div className='flex flex-wrap gap-1'>
                    {partner.specialties.slice(0, 3).map((specialty, index) => (
                      <span
                        key={index}
                        className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={`/suppliers/${partner.id}`}
                  className='w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors block'
                >
                  {getActionButtonText()}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredPartners.length === 0 && (
          <div className='text-center py-12'>
            <div className='text-6xl mb-4'>🔍</div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>No results found</h3>
            <p className='text-gray-600'>Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
