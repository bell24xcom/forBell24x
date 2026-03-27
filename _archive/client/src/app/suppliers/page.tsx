<<<<<<< HEAD
'use client';

import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import { useMemo, useState } from 'react';

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('rating');

  const suppliers = [
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
    },
    {
      id: 4,
      name: 'AutoParts Express',
      category: 'Automotive',
      location: 'Chennai, Tamil Nadu',
      rating: 4.6,
      reviews: 298,
      orders: 2980,
      responseTime: '<4hrs',
      aiMatchScore: 92.8,
      verified: true,
      ecgcApproved: true,
      featured: true,
      description:
        'Automotive parts supplier with extensive inventory and quick delivery across India',
      specialties: ['Engine Parts', 'Brake Systems', 'Electrical Components'],
      certifications: ['TS 16949', 'ECGC Approved', 'BELL24H Verified'],
      employees: '300-500',
      revenue: '₹75-100Cr',
      establishedYear: 2010,
      logo: '🚗',
      priceRange: '₹100 - ₹50K',
      successRate: '91.7%',
    },
    {
      id: 5,
      name: 'BuildMate Construction',
      category: 'Construction',
      location: 'Delhi, NCR',
      rating: 4.5,
      reviews: 167,
      orders: 1340,
      responseTime: '<5hrs',
      aiMatchScore: 89.4,
      verified: true,
      ecgcApproved: false,
      featured: false,
      description:
        'Construction materials supplier offering quality building supplies and infrastructure solutions',
      specialties: ['Cement & Concrete', 'Steel & Rebar', 'Building Materials'],
      certifications: ['BIS Certified', 'Green Building', 'BELL24H Verified'],
      employees: '50-100',
      revenue: '₹5-10Cr',
      establishedYear: 2018,
      logo: '🏗️',
      priceRange: '₹500 - ₹25K',
      successRate: '89.3%',
    },
    {
      id: 6,
      name: 'ChemCorp Industries',
      category: 'Chemicals',
      location: 'Ahmedabad, Gujarat',
      rating: 4.4,
      reviews: 145,
      orders: 1120,
      responseTime: '<6hrs',
      aiMatchScore: 88.7,
      verified: true,
      ecgcApproved: true,
      featured: false,
      description:
        'Chemical manufacturing company specializing in industrial chemicals and plastic materials',
      specialties: ['Industrial Chemicals', 'Plastic Resins', 'Specialty Coatings'],
      certifications: ['ISO 45001', 'ECGC Approved', 'BELL24H Verified'],
      employees: '150-300',
      revenue: '₹30-50Cr',
      establishedYear: 2009,
      logo: '🧪',
      priceRange: '₹1K - ₹100K',
      successRate: '87.9%',
    },
  ];

  const filteredAndSortedSuppliers = useMemo(() => {
    let filtered = suppliers.filter(supplier => {
      const matchesSearch =
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || supplier.category === selectedCategory;
      const matchesLocation =
        selectedLocation === 'all' || supplier.location.includes(selectedLocation);
      return matchesSearch && matchesCategory && matchesLocation;
    });

    // Sort suppliers
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'orders':
          return b.orders - a.orders;
        case 'aiMatch':
          return b.aiMatchScore - a.aiMatchScore;
        case 'responseTime':
          return a.responseTime.localeCompare(b.responseTime);
        default:
          return 0;
      }
    });
  }, [suppliers, searchTerm, selectedCategory, selectedLocation, sortBy]);

  return (
    <div className='min-h-screen bg-gray-50'>
      <PageHeader
        title="Business Partners Directory"
        subtitle="534,672+ verified business partners • AI-powered matching • ECGC protection"
        showBackButton={true}
        showHomeButton={true}
        showDashboardButton={true}
        customActions={
          <Link
            href='/auth/register'
            className='bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700'
          >
            Join Marketplace
          </Link>
        }
      />

      <section className='bg-gradient-to-br from-blue-50 to-purple-50 py-16'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>

            {/* STATS */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 max-w-4xl mx-auto'>
              <div className='bg-white p-6 rounded-xl shadow-lg text-center'>
                <div className='text-3xl font-bold text-blue-600 mb-2'>534,672</div>
                <div className='text-gray-600'>Business Partners</div>
              </div>
              <div className='bg-white p-6 rounded-xl shadow-lg text-center'>
                <div className='text-3xl font-bold text-green-600 mb-2'>98.7%</div>
                <div className='text-gray-600'>Verification Rate</div>
              </div>
              <div className='bg-white p-6 rounded-xl shadow-lg text-center'>
                <div className='text-3xl font-bold text-purple-600 mb-2'>2.5hrs</div>
                <div className='text-gray-600'>Avg Response</div>
              </div>
              <div className='bg-white p-6 rounded-xl shadow-lg text-center'>
                <div className='text-3xl font-bold text-orange-600 mb-2'>847</div>
                <div className='text-gray-600'>ECGC Approved</div>
              </div>
            </div>

            {/* SEARCH & FILTERS */}
            <div className='max-w-6xl mx-auto'>
              <div className='grid grid-cols-1 md:grid-cols-12 gap-4 mb-6'>
                <div className='md:col-span-4'>
                  <div className='relative'>
                    <span>🔍</span>
                    <input
                      type='text'
                      placeholder='Search business partners...'
                      className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className='md:col-span-2'>
                  <select
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                  >
                    <option value='all'>All Categories</option>
                    <option value='Electronics'>Electronics</option>
                    <option value='Textiles'>Textiles</option>
                    <option value='Machinery'>Machinery</option>
                    <option value='Automotive'>Automotive</option>
                    <option value='Construction'>Construction</option>
                    <option value='Chemicals'>Chemicals</option>
                  </select>
                </div>

                <div className='md:col-span-2'>
                  <select
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    value={selectedLocation}
                    onChange={e => setSelectedLocation(e.target.value)}
                  >
                    <option value='all'>All Locations</option>
                    <option value='Mumbai'>Mumbai</option>
                    <option value='Bangalore'>Bangalore</option>
                    <option value='Delhi'>Delhi NCR</option>
                    <option value='Chennai'>Chennai</option>
                    <option value='Pune'>Pune</option>
                    <option value='Ahmedabad'>Ahmedabad</option>
                  </select>
                </div>

                <div className='md:col-span-2'>
                  <select
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    <option value='rating'>Sort by Rating</option>
                    <option value='orders'>Sort by Orders</option>
                    <option value='aiMatch'>Sort by AI Match</option>
                    <option value='responseTime'>Sort by Response Time</option>
                  </select>
                </div>

                <div className='md:col-span-2'>
                  <div className='flex border border-gray-300 rounded-lg overflow-hidden'>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 p-3 ${
                        viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                      }`}
                    >
                      <span>▦</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 p-3 ${
                        viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                      }`}
                    >
                      <span>☰</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPLIERS GRID/LIST */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <div className='mb-6 flex justify-between items-center'>
            <div className='text-gray-600'>
              Showing {filteredAndSortedSuppliers.length} business partners
            </div>
            <div className='flex items-center space-x-2 text-sm text-gray-600'>
              <span>👁️</span>
              <span>AI-powered matching enabled</span>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {filteredAndSortedSuppliers.map(supplier => (
                <div
                  key={supplier.id}
                  className='bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:scale-105 border border-gray-100'
                >
                  <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center space-x-4'>
                      <div className='text-4xl'>{supplier.logo}</div>
                      <div>
                        <h3 className='font-bold text-xl text-gray-900'>{supplier.name}</h3>
                        <p className='text-blue-600 font-medium'>{supplier.category}</p>
                      </div>
                    </div>

                    <div className='flex flex-col items-end space-y-1'>
                      {supplier.verified && <span>✅</span>}
                      {supplier.ecgcApproved && <span>🛡️</span>}
                      {supplier.featured && (
                        <span className='bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold'>
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <p className='text-gray-600 mb-4 text-sm line-clamp-2'>{supplier.description}</p>

                  <div className='grid grid-cols-2 gap-4 mb-6'>
                    <div className='text-center'>
                      <div className='font-bold text-green-600'>{supplier.aiMatchScore}%</div>
                      <div className='text-xs text-gray-500'>AI Match</div>
                    </div>
                    <div className='text-center'>
                      <div className='font-bold text-blue-600 flex items-center justify-center'>
                        <span>⭐</span>
                        {supplier.rating}
                      </div>
                      <div className='text-xs text-gray-500'>{supplier.reviews} reviews</div>
                    </div>
                  </div>

                  <div className='space-y-2 mb-6'>
                    <div className='flex items-center text-gray-600 text-sm'>
                      <span>📍</span>
                      <span>{supplier.location}</span>
                    </div>
                    <div className='flex items-center text-gray-600 text-sm'>
                      <span>🕐</span>
                      <span>Response: {supplier.responseTime}</span>
                    </div>
                    <div className='flex items-center text-gray-600 text-sm'>
                      <span>👤</span>
                      <span>{supplier.employees} employees</span>
                    </div>
                  </div>

                  <div className='mb-4'>
                    <div className='text-xs text-gray-500 mb-2'>Specialties:</div>
                    <div className='flex flex-wrap gap-1'>
                      {supplier.specialties.slice(0, 2).map((specialty, index) => (
                        <span
                          key={index}
                          className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'
                        >
                          {specialty}
                        </span>
                      ))}
                      {supplier.specialties.length > 2 && (
                        <span className='text-xs text-gray-500'>
                          +{supplier.specialties.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <button className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors'>
                      Connect & Trade
                    </button>
                    <Link
                      href={`/suppliers/${supplier.id}`}
                      className='w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors block text-center'
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='space-y-6'>
              {filteredAndSortedSuppliers.map(supplier => (
                <div
                  key={supplier.id}
                  className='bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all border border-gray-100'
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex items-center space-x-6 flex-1'>
                      <div className='text-6xl'>{supplier.logo}</div>

                      <div className='flex-1'>
                        <div className='flex items-center space-x-3 mb-2'>
                          <h3 className='text-2xl font-bold text-gray-900'>{supplier.name}</h3>
                          {supplier.verified && <span>✅</span>}
                          {supplier.ecgcApproved && <span>🛡️</span>}
                          {supplier.featured && (
                            <span className='bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold'>
                              Featured
                            </span>
                          )}
                        </div>

                        <p className='text-blue-600 font-medium mb-2'>{supplier.category}</p>
                        <p className='text-gray-600 mb-4'>{supplier.description}</p>

                        <div className='grid grid-cols-5 gap-6 mb-4'>
                          <div>
                            <div className='font-bold text-green-600 flex items-center'>
                              <span>📊</span>
                              {supplier.aiMatchScore}%
                            </div>
                            <div className='text-sm text-gray-500'>AI Match Score</div>
                          </div>
                          <div>
                            <div className='font-bold text-blue-600 flex items-center'>
                              <span>⭐</span>
                              {supplier.rating}
                            </div>
                            <div className='text-sm text-gray-500'>{supplier.reviews} reviews</div>
                          </div>
                          <div>
                            <div className='font-bold text-purple-600'>{supplier.orders}</div>
                            <div className='text-sm text-gray-500'>Completed orders</div>
                          </div>
                          <div>
                            <div className='font-bold text-orange-600'>{supplier.responseTime}</div>
                            <div className='text-sm text-gray-500'>Response time</div>
                          </div>
                          <div>
                            <div className='font-bold text-red-600'>{supplier.successRate}</div>
                            <div className='text-sm text-gray-500'>Success rate</div>
                          </div>
                        </div>

                        <div className='flex items-center space-x-6 text-gray-600 text-sm mb-4'>
                          <div className='flex items-center'>
                            <span>📍</span>
                            <span>{supplier.location}</span>
                          </div>
                          <div className='flex items-center'>
                            <span>👤</span>
                            <span>{supplier.employees} employees</span>
                          </div>
                          <div>Revenue: {supplier.revenue}</div>
                          <div>Est. {supplier.establishedYear}</div>
                        </div>

                        <div className='mb-4'>
                          <div className='text-sm font-medium text-gray-700 mb-2'>Specialties:</div>
                          <div className='flex flex-wrap gap-2'>
                            {supplier.specialties.map((specialty, index) => (
                              <span
                                key={index}
                                className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className='text-sm font-medium text-gray-700 mb-2'>
                            Certifications:
                          </div>
                          <div className='flex flex-wrap gap-2'>
                            {supplier.certifications.map((cert, index) => (
                              <span
                                key={index}
                                className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm'
                              >
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='ml-6 flex flex-col space-y-3'>
                      <button className='bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors'>
                        Connect & Trade
                      </button>
                      <Link
                        href={`/suppliers/${supplier.id}`}
                        className='border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors text-center'
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredAndSortedSuppliers.length === 0 && (
            <div className='text-center py-16'>
              <div className='text-gray-400 mb-4'>
                <span>🔍</span>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                No business partners found
              </h3>
              <p className='text-gray-600'>Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </section>
=======
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';

async function SuppliersList() {
  // Fetch unclaimed suppliers
  let suppliers = [];
  try {
    suppliers = await prisma.scrapedCompany.findMany({
      where: {
        claimStatus: 'UNCLAIMED',
      },
      select: {
        id: true,
        name: true,
        category: true,
        city: true,
        state: true,
        trustScore: true,
      },
      take: 50,
      orderBy: {
        trustScore: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    // Return empty array on error
    suppliers = [];
  }

  return (
    <>
      {suppliers.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <Link
              key={supplier.id}
              href={`/suppliers/${supplier.id}`}
              className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:border-cyan-500/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2 text-cyan-300 hover:text-cyan-400 transition-colors">
                    {supplier.name}
                  </h2>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-mono bg-cyan-600/20 px-3 py-1 rounded text-cyan-300 border border-cyan-500/30">
                      {supplier.category || 'Business'}
                    </span>
                    <span className="text-sm bg-gray-800 text-gray-300 px-3 py-1 rounded border border-gray-700">
                      {supplier.city || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-300 text-lg">
                    {'★'.repeat(Math.min(5, Math.floor((supplier.trustScore || 0) / 20)))}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {(supplier.trustScore || 0) / 10}/5
                  </span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                  Unclaimed
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Click to view profile and claim
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No suppliers found. Check back later!
          </p>
        </div>
      )}
    </>
  );
}

export default async function SuppliersPage() {

  return (
    <div className="min-h-screen bg-[#0a1128] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-black mb-4 text-cyan-400">
            Featured Suppliers
          </h1>
          <p className="text-xl text-gray-300">
            Discover verified suppliers ready to work with you
          </p>
        </div>

        <Suspense fallback={
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            <p className="text-gray-400 text-lg mt-4">Loading suppliers...</p>
          </div>
        }>
          <SuppliersList />
        </Suspense>

        <div className="mt-12 text-center">
          <p className="text-gray-400">
            Verified suppliers are manually screened by BELL for quality, reliability, and compliance.
          </p>
        </div>
      </div>
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
    </div>
  );
}
