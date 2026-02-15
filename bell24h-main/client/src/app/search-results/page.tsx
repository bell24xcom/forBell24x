'use client';
import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';

export default function SearchResultsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filters, setFilters] = useState({
    rating: '',
    location: '',
    verified: false,
    responsive: false,
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<typeof mockResults>([]);

  // Mock search results
  const mockResults = [
    {
      id: 1,
      name: 'TechCorp Solutions',
      category: 'Electronics & Components',
      rating: 4.8,
      reviews: 156,
      location: 'Bangalore, Karnataka',
      verified: true,
      responsive: true,
      description:
        'Leading supplier of electronic components with 15+ years of experience. Specializes in IoT devices and industrial automation.',
      specialties: ['IoT Components', 'Industrial Automation', 'PCB Assembly'],
      certifications: ['ISO 9001', 'RoHS Compliant', 'CE Certified'],
      responseTime: '2 hours',
      minOrder: '₹10,000',
      image: '🏭',
    },
    {
      id: 2,
      name: 'Global Machinery Ltd.',
      category: 'Machinery & Equipment',
      rating: 4.6,
      reviews: 89,
      location: 'Mumbai, Maharashtra',
      verified: true,
      responsive: false,
      description:
        'Premium machinery supplier for manufacturing and industrial applications. Custom solutions available.',
      specialties: ['CNC Machines', 'Industrial Equipment', 'Custom Manufacturing'],
      certifications: ['ISO 14001', 'OHSAS 18001'],
      responseTime: '4 hours',
      minOrder: '₹50,000',
      image: '⚙️',
    },
    {
      id: 3,
      name: 'ChemTech Industries',
      category: 'Chemicals & Materials',
      rating: 4.9,
      reviews: 234,
      location: 'Ahmedabad, Gujarat',
      verified: true,
      responsive: true,
      description:
        'Specialized chemical supplier with state-of-the-art facilities and comprehensive quality control.',
      specialties: ['Industrial Chemicals', 'Laboratory Reagents', 'Specialty Materials'],
      certifications: ['ISO 9001', 'GMP Certified', 'FDA Approved'],
      responseTime: '1 hour',
      minOrder: '₹25,000',
      image: '🧪',
    },
    {
      id: 4,
      name: 'Textile Masters',
      category: 'Textiles & Apparel',
      rating: 4.7,
      reviews: 178,
      location: 'Surat, Gujarat',
      verified: true,
      responsive: true,
      description:
        'Premium textile supplier with sustainable practices and innovative fabric solutions.',
      specialties: ['Organic Cotton', 'Technical Textiles', 'Fashion Fabrics'],
      certifications: ['GOTS Certified', 'OEKO-TEX Standard 100'],
      responseTime: '3 hours',
      minOrder: '₹15,000',
      image: '🧵',
    },
    {
      id: 5,
      name: 'AutoParts Pro',
      category: 'Automotive & Parts',
      rating: 4.5,
      reviews: 112,
      location: 'Chennai, Tamil Nadu',
      verified: false,
      responsive: true,
      description:
        'Comprehensive automotive parts supplier with extensive inventory and fast delivery.',
      specialties: ['Engine Parts', 'Brake Systems', 'Electrical Components'],
      certifications: ['ISO 9001', 'IATF 16949'],
      responseTime: '6 hours',
      minOrder: '₹8,000',
      image: '🚗',
    },
  ];

  useEffect(() => {
    // Simulate search
    setLoading(true);
    setTimeout(() => {
      setResults(mockResults);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleContact = (supplier: any) => {
    alert(`Contacting ${supplier.name}...\nThis will open the supplier contact form.`);
  };

  const handleRFQ = (supplier: any) => {
    alert(`Creating RFQ for ${supplier.name}...\nThis will open the RFQ creation form.`);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      {/* Header */}
      <header className='bg-slate-800/50 backdrop-blur-sm border-b border-slate-700'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <div className='text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent'>
                Bell24H
              </div>
              <div className='text-sm text-slate-400 border-l border-slate-600 pl-4'>
                Search Results
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <button className='text-slate-400 hover:text-amber-400 transition-colors'>
                <span>👤</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <section className='py-6 bg-slate-800/20'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto'>
            <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6'>
              <div className='grid grid-cols-1 md:grid-cols-12 gap-4'>
                <div className='md:col-span-5'>
                  <div className='relative'>
                    <span>🔍</span>
                    <input
                      type='text'
                      placeholder='Search products, services, or suppliers...'
                      className='w-full pl-12 pr-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-white bg-slate-700/50 placeholder-slate-400'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className='md:col-span-4'>
                  <div className='relative'>
                    <select
                      className='w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none appearance-none bg-slate-700/50 text-white'
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                    >
                      <option value=''>All Categories</option>
                      <option value='electronics'>Electronics & Components</option>
                      <option value='machinery'>Machinery & Equipment</option>
                      <option value='chemicals'>Chemicals & Materials</option>
                      <option value='textiles'>Textiles & Apparel</option>
                      <option value='automotive'>Automotive & Parts</option>
                    </select>
                  </div>
                </div>

                <div className='md:col-span-3'>
                  <button className='w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 font-semibold text-lg transition-all duration-200 transform hover:scale-105'>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className='py-8'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-col lg:flex-row gap-8'>
            {/* Filters Sidebar */}
            <div className='lg:w-1/4'>
              <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 sticky top-8'>
                <div className='flex items-center space-x-2 mb-6'>
                  <span>🔽</span>
                  <h3 className='text-lg font-bold text-white'>Filters</h3>
                </div>

                {/* Rating Filter */}
                <div className='mb-6'>
                  <label className='block text-slate-300 mb-3 font-medium'>Minimum Rating</label>
                  <select
                    className='w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    value={filters.rating}
                    onChange={e => handleFilterChange('rating', e.target.value)}
                  >
                    <option value=''>Any Rating</option>
                    <option value='4.5'>4.5+ Stars</option>
                    <option value='4.0'>4.0+ Stars</option>
                    <option value='3.5'>3.5+ Stars</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div className='mb-6'>
                  <label className='block text-slate-300 mb-3 font-medium'>Location</label>
                  <select
                    className='w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                    value={filters.location}
                    onChange={e => handleFilterChange('location', e.target.value)}
                  >
                    <option value=''>Any Location</option>
                    <option value='bangalore'>Bangalore</option>
                    <option value='mumbai'>Mumbai</option>
                    <option value='ahmedabad'>Ahmedabad</option>
                    <option value='surat'>Surat</option>
                    <option value='chennai'>Chennai</option>
                  </select>
                </div>

                {/* Checkbox Filters */}
                <div className='space-y-3'>
                  <label className='flex items-center space-x-3 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={filters.verified}
                      onChange={e => handleFilterChange('verified', e.target.checked)}
                      className='w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 rounded focus:ring-amber-500'
                    />
                    <span className='text-slate-300'>Verified Suppliers Only</span>
                  </label>
                  <label className='flex items-center space-x-3 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={filters.responsive}
                      onChange={e => handleFilterChange('responsive', e.target.checked)}
                      className='w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 rounded focus:ring-amber-500'
                    />
                    <span className='text-slate-300'>Responsive Suppliers</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className='lg:w-3/4'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-white'>
                  {loading ? 'Searching...' : `${results.length} Suppliers Found`}
                </h2>
                <div className='text-slate-400'>
                  Showing results for "{searchTerm || 'all suppliers'}"
                </div>
              </div>

              {loading ? (
                <div className='space-y-4'>
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 animate-pulse'
                    >
                      <div className='flex items-center space-x-4'>
                        <div className='w-16 h-16 bg-slate-700 rounded-xl'></div>
                        <div className='flex-1'>
                          <div className='h-6 bg-slate-700 rounded mb-2'></div>
                          <div className='h-4 bg-slate-700 rounded w-3/4'></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='space-y-6'>
                  {results.map(supplier => (
                    <div
                      key={supplier.id}
                      className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:bg-slate-700/50 transition-colors'
                    >
                      <div className='flex items-start space-x-6'>
                        {/* Supplier Icon */}
                        <div className='flex-shrink-0'>
                          <div className='w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center text-3xl'>
                            {supplier.image}
                          </div>
                        </div>

                        {/* Supplier Info */}
                        <div className='flex-1'>
                          <div className='flex items-start justify-between mb-3'>
                            <div>
                              <div className='flex items-center space-x-3 mb-1'>
                                <h3 className='text-xl font-bold text-white'>{supplier.name}</h3>
                                {supplier.verified && (
                                  <div className='flex items-center space-x-1 text-green-400'>
                                    <span>✅</span>
                                    <span className='text-sm'>Verified</span>
                                  </div>
                                )}
                              </div>
                              <div className='flex items-center space-x-4 text-slate-400 text-sm mb-2'>
                                <span>{supplier.category}</span>
                                <span>•</span>
                                <div className='flex items-center space-x-1'>
                                  <span>⭐</span>
                                  <span>{supplier.rating}</span>
                                  <span>({supplier.reviews} reviews)</span>
                                </div>
                              </div>
                              <div className='flex items-center space-x-2 text-slate-400 text-sm'>
                                <span>📍</span>
                                <span>{supplier.location}</span>
                                {supplier.responsive && (
                                  <>
                                    <span>•</span>
                                    <div className='flex items-center space-x-1 text-green-400'>
                                      <span>🕐</span>
                                      <span>Responsive</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className='text-slate-300 mb-4'>{supplier.description}</p>

                          {/* Specialties */}
                          <div className='flex flex-wrap gap-2 mb-4'>
                            {supplier.specialties.map((specialty, index) => (
                              <span
                                key={index}
                                className='px-3 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-full'
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>

                          {/* Certifications */}
                          <div className='flex flex-wrap gap-2 mb-4'>
                            {supplier.certifications.map((cert, index) => (
                              <span
                                key={index}
                                className='px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded'
                              >
                                {cert}
                              </span>
                            ))}
                          </div>

                          {/* Stats */}
                          <div className='grid grid-cols-3 gap-4 mb-4'>
                            <div className='text-center'>
                              <div className='text-slate-400 text-sm'>Response Time</div>
                              <div className='text-white font-medium'>{supplier.responseTime}</div>
                            </div>
                            <div className='text-center'>
                              <div className='text-slate-400 text-sm'>Min Order</div>
                              <div className='text-white font-medium'>{supplier.minOrder}</div>
                            </div>
                            <div className='text-center'>
                              <div className='text-slate-400 text-sm'>Rating</div>
                              <div className='text-amber-400 font-medium'>{supplier.rating}/5</div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className='flex space-x-3'>
                            <button
                              onClick={() => handleContact(supplier)}
                              className='flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors'
                            >
                              <span>📞</span>
                              <span>Contact</span>
                            </button>
                            <button
                              onClick={() => handleRFQ(supplier)}
                              className='flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all'
                            >
                              <Award className='h-4 w-4' />
                              <span>Create RFQ</span>
                            </button>
                            <button className='flex items-center space-x-2 px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg transition-colors'>
                              <span>🌍</span>
                              <span>View Profile</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
