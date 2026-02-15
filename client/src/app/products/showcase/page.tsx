'use client';

import { downloadRFQReport } from '@/lib/napkin-pdf';
import { formatTrafficPrice } from '@/lib/traffic-pricing';
import { Eye, Grid, List, MessageSquare, Package, Search, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  images: string[];
  basePrice: number;
  trafficPrice: number;
  msmePrice?: number;
  category: string;
  subcategory?: string;
  views: number;
  impressions: number;
  rfqCount: number;
  user: {
    id: string;
    name: string;
    brandName?: string;
    logoUrl?: string;
    trafficTier: string;
    roles: string[];
  };
  createdAt: string;
}

interface FilterOptions {
  category: string;
  priceRange: [number, number];
  trafficTier: string;
  userRole: string;
  sortBy: string;
}

export default function ProductShowcasePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    priceRange: [0, 1000000],
    trafficTier: '',
    userRole: '',
    sortBy: 'newest',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Mock data for demonstration
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Steel Alloy',
      brand: 'SteelCorp',
      description:
        'High-quality steel alloy for industrial applications with excellent durability and strength characteristics.',
      images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400'],
      basePrice: 45000,
      trafficPrice: 52000,
      msmePrice: 44200,
      category: 'steel',
      views: 1247,
      impressions: 2156,
      rfqCount: 8,
      user: {
        id: 'user1',
        name: 'SteelCorp Industries',
        brandName: 'SteelCorp',
        logoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
        trafficTier: 'GOLD',
        roles: ['supplier', 'manufacturer'],
      },
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Industrial Aluminum Sheets',
      brand: 'AluTech',
      description:
        'Premium aluminum sheets offering lightweight properties with exceptional corrosion resistance.',
      images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400'],
      basePrice: 32000,
      trafficPrice: 38000,
      msmePrice: 32300,
      category: 'aluminum',
      views: 892,
      impressions: 1456,
      rfqCount: 5,
      user: {
        id: 'user2',
        name: 'AluTech Solutions',
        brandName: 'AluTech',
        logoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
        trafficTier: 'SILVER',
        roles: ['supplier'],
      },
      createdAt: '2024-01-14T14:20:00Z',
    },
    {
      id: '3',
      name: 'Copper Wire Manufacturing',
      brand: 'CopperMax',
      description:
        'Pure copper products with excellent electrical conductivity and thermal properties.',
      images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400'],
      basePrice: 28000,
      trafficPrice: 31500,
      msmePrice: 26775,
      category: 'copper',
      views: 1567,
      impressions: 2890,
      rfqCount: 12,
      user: {
        id: 'user3',
        name: 'CopperMax Industries',
        brandName: 'CopperMax',
        logoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
        trafficTier: 'PLATINUM',
        roles: ['supplier', 'manufacturer', 'msme'],
      },
      createdAt: '2024-01-13T09:15:00Z',
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesPrice =
      product.trafficPrice >= filters.priceRange[0] &&
      product.trafficPrice <= filters.priceRange[1];
    const matchesTier = !filters.trafficTier || product.user.trafficTier === filters.trafficTier;
    const matchesRole = !filters.userRole || product.user.roles.includes(filters.userRole);

    return matchesSearch && matchesCategory && matchesPrice && matchesTier && matchesRole;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.trafficPrice - b.trafficPrice;
      case 'price-high':
        return b.trafficPrice - a.trafficPrice;
      case 'popularity':
        return b.views - a.views;
      case 'traffic':
        return b.impressions - a.impressions;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCreateRFQ = (product: Product) => {
    // Navigate to RFQ creation with product pre-filled
    window.location.href = `/rfq/create?product=${product.id}`;
  };

  const handleDownloadReport = async (product: Product) => {
    try {
      // Generate and download product analysis report
      await downloadRFQReport(product.id);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const getTrafficTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM':
        return 'bg-purple-500';
      case 'GOLD':
        return 'bg-yellow-500';
      case 'SILVER':
        return 'bg-gray-500';
      case 'BRONZE':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getRoleBadges = (roles: string[]) => {
    return roles.map(role => {
      const colors = {
        supplier: 'bg-green-100 text-green-800',
        manufacturer: 'bg-orange-100 text-orange-800',
        msme: 'bg-purple-100 text-purple-800',
        buyer: 'bg-blue-100 text-blue-800',
      };
      return (
        <span
          key={role}
          className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}
        >
          {role}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading product showcase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>Product Showcase</h1>
          <p className='text-xl text-gray-600'>
            Discover products with AI-powered insights and traffic-based pricing
          </p>
        </div>

        {/* Search and Filters */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-8'>
          <div className='flex flex-col lg:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='text'
                  placeholder='Search products, brands, or categories...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
            </div>

            {/* Filters */}
            <div className='flex gap-4'>
              <select
                value={filters.category}
                onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className='px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>All Categories</option>
                <option value='steel'>Steel</option>
                <option value='aluminum'>Aluminum</option>
                <option value='copper'>Copper</option>
                <option value='machinery'>Machinery</option>
                <option value='electronics'>Electronics</option>
              </select>

              <select
                value={filters.trafficTier}
                onChange={e => setFilters(prev => ({ ...prev, trafficTier: e.target.value }))}
                className='px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>All Tiers</option>
                <option value='PLATINUM'>Platinum</option>
                <option value='GOLD'>Gold</option>
                <option value='SILVER'>Silver</option>
                <option value='BRONZE'>Bronze</option>
              </select>

              <select
                value={filters.sortBy}
                onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className='px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='newest'>Newest</option>
                <option value='price-low'>Price: Low to High</option>
                <option value='price-high'>Price: High to Low</option>
                <option value='popularity'>Most Popular</option>
                <option value='traffic'>Highest Traffic</option>
              </select>

              <div className='flex border border-gray-300 rounded-lg overflow-hidden'>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
                >
                  <Grid className='w-5 h-5' />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
                >
                  <List className='w-5 h-5' />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div
          className={`grid gap-6 ${
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          }`}
        >
          {sortedProducts.map(product => (
            <div
              key={product.id}
              className='bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 overflow-hidden'
            >
              {/* Product Image */}
              <div className='relative h-48 bg-gray-100'>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className='w-full h-full object-cover'
                />
                <div className='absolute top-2 left-2'>
                  <span
                    className={`${getTrafficTierColor(product.user.trafficTier)} text-white px-2 py-1 rounded-full text-xs font-medium`}
                  >
                    {product.user.trafficTier}
                  </span>
                </div>
                <div className='absolute top-2 right-2 flex gap-1'>
                  {getRoleBadges(product.user.roles)}
                </div>
              </div>

              {/* Product Info */}
              <div className='p-6'>
                <div className='flex items-center gap-3 mb-3'>
                  {product.user.logoUrl && (
                    <img
                      src={product.user.logoUrl}
                      alt={product.user.brandName}
                      className='w-8 h-8 rounded-full'
                    />
                  )}
                  <div>
                    <h3 className='font-semibold text-gray-900'>{product.name}</h3>
                    <p className='text-sm text-gray-600'>{product.user.brandName}</p>
                  </div>
                </div>

                <p className='text-gray-600 text-sm mb-4 line-clamp-2'>{product.description}</p>

                {/* Traffic-Based Pricing */}
                <div className='mb-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600'>Base Price</span>
                    <span className='text-sm text-gray-500 line-through'>
                      ₹{product.basePrice.toLocaleString()}
                    </span>
                  </div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600'>Traffic Price</span>
                    <span className='text-lg font-bold text-blue-600'>
                      {formatTrafficPrice(product.basePrice, product.trafficPrice)}
                    </span>
                  </div>
                  {product.msmePrice && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>MSME Price</span>
                      <span className='text-sm font-medium text-purple-600'>
                        ₹{product.msmePrice.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Traffic Stats */}
                <div className='grid grid-cols-3 gap-2 mb-4 text-xs text-gray-500'>
                  <div className='text-center'>
                    <Eye className='w-4 h-4 mx-auto mb-1' />
                    <div>{product.views}</div>
                    <div>Views</div>
                  </div>
                  <div className='text-center'>
                    <TrendingUp className='w-4 h-4 mx-auto mb-1' />
                    <div>{product.impressions}</div>
                    <div>Impressions</div>
                  </div>
                  <div className='text-center'>
                    <MessageSquare className='w-4 h-4 mx-auto mb-1' />
                    <div>{product.rfqCount}</div>
                    <div>RFQs</div>
                  </div>
                </div>

                {/* Actions */}
                <div className='flex gap-2'>
                  <button
                    onClick={() => handleProductClick(product)}
                    className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleCreateRFQ(product)}
                    className='flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors'
                  >
                    Create RFQ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {sortedProducts.length === 0 && (
          <div className='text-center py-12'>
            <Package className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>No products found</h3>
            <p className='text-gray-600'>Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && selectedProduct && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-start mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>{selectedProduct.name}</h2>
                <button
                  onClick={() => setShowProductModal(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  ✕
                </button>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Product Images */}
                <div>
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className='w-full h-64 object-cover rounded-lg'
                  />
                </div>

                {/* Product Details */}
                <div>
                  <div className='flex items-center gap-3 mb-4'>
                    {selectedProduct.user.logoUrl && (
                      <img
                        src={selectedProduct.user.logoUrl}
                        alt={selectedProduct.user.brandName}
                        className='w-12 h-12 rounded-full'
                      />
                    )}
                    <div>
                      <h3 className='font-semibold text-gray-900'>
                        {selectedProduct.user.brandName}
                      </h3>
                      <div className='flex gap-2 mt-1'>
                        {getRoleBadges(selectedProduct.user.roles)}
                      </div>
                    </div>
                  </div>

                  <p className='text-gray-600 mb-6'>{selectedProduct.description}</p>

                  {/* Pricing Details */}
                  <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                    <h4 className='font-semibold text-gray-900 mb-3'>Traffic-Based Pricing</h4>
                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span>Base Price:</span>
                        <span className='line-through'>
                          ₹{selectedProduct.basePrice.toLocaleString()}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Traffic Price:</span>
                        <span className='font-bold text-blue-600'>
                          {formatTrafficPrice(
                            selectedProduct.basePrice,
                            selectedProduct.trafficPrice
                          )}
                        </span>
                      </div>
                      {selectedProduct.msmePrice && (
                        <div className='flex justify-between'>
                          <span>MSME Price:</span>
                          <span className='font-medium text-purple-600'>
                            ₹{selectedProduct.msmePrice.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-3'>
                    <button
                      onClick={() => handleCreateRFQ(selectedProduct)}
                      className='flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors'
                    >
                      Create RFQ
                    </button>
                    <button
                      onClick={() => handleDownloadReport(selectedProduct)}
                      className='flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors'
                    >
                      Download Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
