'use client';
import { useState, useEffect, useMemo } from 'react';
import { ALL_50_CATEGORIES, getCategoryById } from '@/data/all-50-categories';

interface Product {
  id: string;
  name: string;
  supplier: string;
  category: string;
  subcategory: string;
  rating: number;
  reviews: number;
  price: string;
  minOrder: string;
  stock: string;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  features: string[];
  video?: string;
  trafficMetrics: {
    views: number;
    clicks: number;
    conversions: number;
  };
  supplierInfo: {
    name: string;
    rating: number;
    location: string;
    verified: boolean;
    image: string;
    responseTime: string;
    trafficTier: string;
  };
  createdAt: string;
  isFeatured: boolean;
}

interface FilterOptions {
  search: string;
  category: string;
  subcategory: string;
  supplier: string;
  priceRange: [number, number];
  rating: number;
  stockStatus: string;
  trafficTier: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function EnhancedProductShowcasePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'showcase'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: '',
    subcategory: '',
    supplier: '',
    priceRange: [0, 1000000],
    rating: 0,
    stockStatus: '',
    trafficTier: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Generate comprehensive mock products
  const generateMockProducts = (): Product[] => {
    const products: Product[] = [];
    const suppliers = [
      'TechCorp Solutions', 'Global Machinery Ltd.', 'ChemTech Industries', 'Textile Masters',
      'AutoParts Pro', 'SteelCorp Industries', 'ElectroMax Solutions', 'AgriTech Solutions',
      'PharmaCorp Ltd.', 'Construction Materials Co.', 'Fashion Forward', 'MetalWorks Inc.',
      'Precision Tools', 'Industrial Supplies', 'Quality Components', 'Advanced Materials'
    ];

    const locations = [
      'Mumbai, Maharashtra', 'Delhi, NCR', 'Bangalore, Karnataka', 'Chennai, Tamil Nadu',
      'Pune, Maharashtra', 'Ahmedabad, Gujarat', 'Hyderabad, Telangana', 'Kolkata, West Bengal'
    ];

    const trafficTiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
    const stockStatuses = ['In Stock', 'Low Stock', 'Out of Stock', 'Available on Order'];

    ALL_50_CATEGORIES.forEach(category => {
      category.subcategories.forEach(subcategory => {
        // Generate 3-5 products per subcategory
        const productCount = Math.floor(Math.random() * 3) + 3;
        
        for (let i = 0; i < productCount; i++) {
          const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
          const location = locations[Math.floor(Math.random() * locations.length)];
          const trafficTier = trafficTiers[Math.floor(Math.random() * trafficTiers.length)];
          const stockStatus = stockStatuses[Math.floor(Math.random() * stockStatuses.length)];
          
          const basePrice = Math.floor(Math.random() * 50000) + 1000;
          const trafficPrice = Math.floor(basePrice * (1 + Math.random() * 0.3));
          const msmePrice = Math.floor(basePrice * (0.9 + Math.random() * 0.1));

          products.push({
            id: `${category.slug}-${subcategory.slug}-${i + 1}`,
            name: `${subcategory.name} - ${category.name} Product ${i + 1}`,
            supplier,
            category: category.name,
            subcategory: subcategory.name,
            rating: 4.0 + Math.random() * 1.0,
            reviews: Math.floor(Math.random() * 200) + 10,
            price: `₹${basePrice.toLocaleString()}`,
            minOrder: `${Math.floor(Math.random() * 100) + 1} units`,
            stock: stockStatus,
            description: `High-quality ${subcategory.name.toLowerCase()} for ${category.name.toLowerCase()} applications. Manufactured with precision and attention to detail.`,
            specifications: {
              'Material': 'Premium Grade',
              'Dimensions': 'Custom Available',
              'Weight': `${Math.floor(Math.random() * 50) + 1} kg`,
              'Certification': 'ISO 9001:2015',
              'Warranty': '1 Year',
              'Color': 'Standard',
              'Finish': 'Professional'
            },
            features: [
              'High Quality',
              'Durable',
              'Easy to Use',
              'Cost Effective',
              'Reliable'
            ],
            images: ['🏭', '📦', '⚙️', '🔧'],
            video: Math.random() > 0.7 ? 'https://example.com/product-video.mp4' : undefined,
            trafficMetrics: {
              views: Math.floor(Math.random() * 2000) + 100,
              clicks: Math.floor(Math.random() * 200) + 10,
              conversions: Math.floor(Math.random() * 20) + 1
            },
            supplierInfo: {
              name: supplier,
              rating: 4.0 + Math.random() * 1.0,
              location,
              verified: Math.random() > 0.3,
              image: '🏢',
              responseTime: `${Math.floor(Math.random() * 24) + 1} hours`,
              trafficTier
            },
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            isFeatured: Math.random() > 0.8
          });
        }
      });
    });

    return products;
  };

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockProducts = generateMockProducts();
      setProducts(mockProducts);
      setLoading(false);
    };

    loadProducts();
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = !filters.search || 
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.supplier.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesSubcategory = !filters.subcategory || product.subcategory === filters.subcategory;
      const matchesSupplier = !filters.supplier || product.supplier === filters.supplier;
      const matchesRating = product.rating >= filters.rating;
      const matchesStock = !filters.stockStatus || product.stock === filters.stockStatus;
      const matchesTrafficTier = !filters.trafficTier || product.supplierInfo.trafficTier === filters.trafficTier;

      const price = parseInt(product.price.replace(/[₹,]/g, ''));
      const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];

      return matchesSearch && matchesCategory && matchesSubcategory && 
             matchesSupplier && matchesRating && matchesStock && 
             matchesTrafficTier && matchesPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = parseInt(a.price.replace(/[₹,]/g, ''));
          bValue = parseInt(b.price.replace(/[₹,]/g, ''));
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'views':
          aValue = a.trafficMetrics.views;
          bValue = b.trafficMetrics.views;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [products, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // Get unique values for filters
  const categories = [...new Set(products.map(p => p.category))];
  const subcategories = [...new Set(products.map(p => p.subcategory))];
  const suppliers = [...new Set(products.map(p => p.supplier))];
  const trafficTiers = [...new Set(products.map(p => p.supplierInfo.trafficTier))];
  const stockStatuses = [...new Set(products.map(p => p.stock))];

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleInquiry = (product: Product) => {
    alert(`Inquiry sent for ${product.name}!\nSupplier: ${product.supplier}\nPrice: ${product.price}`);
  };

  const handleAddToCart = (product: Product) => {
    alert(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Bell24H
              </div>
              <div className="text-sm text-slate-400 border-l border-slate-600 pl-4">
                Enhanced Product Showcase
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-slate-400 text-sm">
                {filteredAndSortedProducts.length} Products
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Advanced Filters */}
      <section className="py-6 bg-slate-800/20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-white bg-slate-700/50 placeholder-slate-400"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <select
                  className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none appearance-none bg-slate-700/50 text-white"
                  value={filters.category}
                  onChange={(e) => {
                    handleFilterChange('category', e.target.value);
                    handleFilterChange('subcategory', ''); // Reset subcategory when category changes
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* Subcategory Filter */}
                <select
                  className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none appearance-none bg-slate-700/50 text-white"
                  value={filters.subcategory}
                  onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                  disabled={!filters.category}
                >
                  <option value="">All Subcategories</option>
                  {subcategories
                    .filter(sub => !filters.category || products.some(p => p.category === filters.category && p.subcategory === sub))
                    .map(subcategory => (
                      <option key={subcategory} value={subcategory}>{subcategory}</option>
                    ))}
                </select>

                {/* Supplier Filter */}
                <select
                  className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none appearance-none bg-slate-700/50 text-white"
                  value={filters.supplier}
                  onChange={(e) => handleFilterChange('supplier', e.target.value)}
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map(supplier => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Price Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white"
                      value={filters.priceRange[0]}
                      onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white"
                      value={filters.priceRange[1]}
                      onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 1000000])}
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Min Rating</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white"
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                  >
                    <option value={0}>Any Rating</option>
                    <option value={3}>3+ Stars</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                  </select>
                </div>

                {/* Stock Status */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Stock Status</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white"
                    value={filters.stockStatus}
                    onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                  >
                    <option value="">Any Status</option>
                    {stockStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Traffic Tier */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Traffic Tier</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white"
                    value={filters.trafficTier}
                    onChange={(e) => handleFilterChange('trafficTier', e.target.value)}
                  >
                    <option value="">Any Tier</option>
                    {trafficTiers.map(tier => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Sort By</label>
                  <div className="flex space-x-2">
                    <select
                      className="flex-1 px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white"
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                      <option value="createdAt">Newest</option>
                      <option value="name">Name</option>
                      <option value="price">Price</option>
                      <option value="rating">Rating</option>
                      <option value="views">Views</option>
                    </select>
                    <button
                      className="px-3 py-2 border border-slate-600 rounded-lg bg-slate-700/50 text-white hover:bg-slate-600"
                      onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {filters.sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('showcase')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'showcase'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Showcase
                  </button>
                </div>

                <div className="text-slate-400 text-sm">
                  Page {currentPage} of {totalPages} ({filteredAndSortedProducts.length} products)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Display */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:bg-slate-700/50 transition-colors cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  {/* Product Image */}
                  <div className="relative mb-4">
                    <div className="w-full h-48 bg-slate-700 rounded-xl flex items-center justify-center text-6xl mb-2">
                      {product.images[0]}
                    </div>
                    <div className="flex space-x-2">
                      {product.images.slice(1, 4).map((img, index) => (
                        <div
                          key={index}
                          className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center text-2xl"
                        >
                          {img}
                        </div>
                      ))}
                    </div>
                    <button className="absolute top-2 right-2 p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg transition-colors">
                      <span>❤️</span>
                    </button>
                    {product.isFeatured && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs rounded-lg">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center space-x-4 text-slate-400 text-sm mb-2">
                      <span>{product.category}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <span>⭐</span>
                        <span>{product.rating.toFixed(1)}</span>
                        <span>({product.reviews})</span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm line-clamp-2">{product.description}</p>
                  </div>

                  {/* Price & Stock */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-amber-400">{product.price}</div>
                      <div className="text-slate-400 text-sm">Min: {product.minOrder}</div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        product.stock === 'In Stock'
                          ? 'bg-green-500/20 text-green-400'
                          : product.stock === 'Low Stock'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {product.stock}
                    </div>
                  </div>

                  {/* Traffic Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                    <div>
                      <div className="text-slate-400">Views</div>
                      <div className="text-white font-medium">{product.trafficMetrics.views}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Inquiries</div>
                      <div className="text-white font-medium">{product.trafficMetrics.clicks}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Conv. Rate</div>
                      <div className="text-white font-medium">
                        {((product.trafficMetrics.conversions / product.trafficMetrics.views) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Supplier Info */}
                  <div className="flex items-center space-x-3 mb-4 p-3 bg-slate-700/30 rounded-lg">
                    <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center text-lg">
                      {product.supplierInfo.image}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{product.supplierInfo.name}</div>
                      <div className="text-slate-400 text-xs">{product.supplierInfo.location}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {product.supplierInfo.verified && <span>✅</span>}
                      <span className={`px-2 py-1 text-xs rounded ${
                        product.supplierInfo.trafficTier === 'PLATINUM' ? 'bg-purple-500/20 text-purple-400' :
                        product.supplierInfo.trafficTier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-400' :
                        product.supplierInfo.trafficTier === 'SILVER' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {product.supplierInfo.trafficTier}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInquiry(product);
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all text-sm"
                    >
                      Get Quote
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      <span>🛒</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-4">
              {paginatedProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:bg-slate-700/50 transition-colors cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex items-start space-x-6">
                    <div className="w-32 h-32 bg-slate-700 rounded-xl flex items-center justify-center text-4xl">
                      {product.images[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
                          <div className="flex items-center space-x-4 text-slate-400 text-sm mb-2">
                            <span>{product.category}</span>
                            <span>•</span>
                            <span>{product.subcategory}</span>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <span>⭐</span>
                              <span>{product.rating.toFixed(1)}</span>
                              <span>({product.reviews})</span>
                            </div>
                          </div>
                          <p className="text-slate-300">{product.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-amber-400">{product.price}</div>
                          <div className="text-slate-400 text-sm">Min: {product.minOrder}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-slate-400 text-sm">Views</div>
                          <div className="text-white font-medium">{product.trafficMetrics.views}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-400 text-sm">Inquiries</div>
                          <div className="text-white font-medium">{product.trafficMetrics.clicks}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-400 text-sm">Conv. Rate</div>
                          <div className="text-white font-medium">
                            {((product.trafficMetrics.conversions / product.trafficMetrics.views) * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-400 text-sm">Stock</div>
                          <div className={`font-medium ${
                            product.stock === 'In Stock' ? 'text-green-400' :
                            product.stock === 'Low Stock' ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {product.stock}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center text-lg">
                            {product.supplierInfo.image}
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm">{product.supplierInfo.name}</div>
                            <div className="text-slate-400 text-xs">{product.supplierInfo.location}</div>
                          </div>
                          {product.supplierInfo.verified && <span>✅</span>}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInquiry(product);
                            }}
                            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all"
                          >
                            Get Quote
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                          >
                            <span>🛒</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Showcase view
            <div className="space-y-8">
              {paginatedProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 hover:bg-slate-700/50 transition-colors cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex items-center space-x-8">
                    <div className="w-48 h-48 bg-slate-700 rounded-2xl flex items-center justify-center text-8xl">
                      {product.images[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-3xl font-bold text-white mb-2">{product.name}</h3>
                          <div className="flex items-center space-x-6 text-slate-400 text-lg mb-3">
                            <span>{product.category}</span>
                            <span>•</span>
                            <span>{product.subcategory}</span>
                            <span>•</span>
                            <div className="flex items-center space-x-2">
                              <span>⭐</span>
                              <span>{product.rating.toFixed(1)}</span>
                              <span>({product.reviews} reviews)</span>
                            </div>
                          </div>
                          <p className="text-slate-300 text-lg mb-4">{product.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold text-amber-400 mb-2">{product.price}</div>
                          <div className="text-slate-400 text-lg">Min: {product.minOrder}</div>
                          <div
                            className={`inline-block px-4 py-2 rounded-lg text-sm font-medium mt-2 ${
                              product.stock === 'In Stock'
                                ? 'bg-green-500/20 text-green-400'
                                : product.stock === 'Low Stock'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {product.stock}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-6 gap-6 mb-6">
                        <div className="text-center">
                          <div className="text-slate-400 text-sm">Views</div>
                          <div className="text-white font-medium text-lg">{product.trafficMetrics.views}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-400 text-sm">Inquiries</div>
                          <div className="text-white font-medium text-lg">{product.trafficMetrics.clicks}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-400 text-sm">Conv. Rate</div>
                          <div className="text-white font-medium text-lg">
                            {((product.trafficMetrics.conversions / product.trafficMetrics.views) * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-400 text-sm">Response Time</div>
                          <div className="text-white font-medium text-lg">{product.supplierInfo.responseTime}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-400 text-sm">Traffic Tier</div>
                          <div className={`font-medium text-lg ${
                            product.supplierInfo.trafficTier === 'PLATINUM' ? 'text-purple-400' :
                            product.supplierInfo.trafficTier === 'GOLD' ? 'text-yellow-400' :
                            product.supplierInfo.trafficTier === 'SILVER' ? 'text-gray-400' :
                            'text-orange-400'
                          }`}>
                            {product.supplierInfo.trafficTier}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-400 text-sm">Verified</div>
                          <div className="text-white font-medium text-lg">
                            {product.supplierInfo.verified ? '✅ Yes' : '❌ No'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center text-2xl">
                            {product.supplierInfo.image}
                          </div>
                          <div>
                            <div className="text-white font-medium text-lg">{product.supplierInfo.name}</div>
                            <div className="text-slate-400">{product.supplierInfo.location}</div>
                          </div>
                          {product.supplierInfo.verified && <span className="text-2xl">✅</span>}
                        </div>
                        <div className="flex space-x-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInquiry(product);
                            }}
                            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all text-lg"
                          >
                            Get Quote
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-lg"
                          >
                            Add to Cart 🛒
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Product Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="w-full h-64 bg-slate-700 rounded-xl flex items-center justify-center text-8xl mb-4">
                    {selectedProduct.images[0]}
                  </div>
                  <div className="flex space-x-2">
                    {selectedProduct.images.slice(1).map((img, index) => (
                      <div
                        key={index}
                        className="w-20 h-20 bg-slate-700 rounded-lg flex items-center justify-center text-3xl"
                      >
                        {img}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-amber-400 mb-4">{selectedProduct.price}</div>
                  <div className="text-slate-400 mb-4">Min Order: {selectedProduct.minOrder}</div>
                  <div className="text-slate-300 mb-6">{selectedProduct.description}</div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Specifications</h3>
                      <div className="space-y-2">
                        {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-slate-400">{key}:</span>
                            <span className="text-white">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => handleInquiry(selectedProduct)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all"
                    >
                      Get Quote
                    </button>
                    <button
                      onClick={() => handleAddToCart(selectedProduct)}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      Add to Cart
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
