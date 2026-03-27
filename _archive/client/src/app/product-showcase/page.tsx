'use client';
import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  supplier: string;
  category: string;
  rating: number;
  reviews: number;
  price: string;
  minOrder: string;
  stock: string;
  description: string;
  specifications: Record<string, string>;
  images: string[];
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
  };
}

export default function ProductShowcasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, showcase
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);

  const completeSpecs = {
    Accuracy: '',
    Range: '',
    Connectivity: '',
    Power: '',
    Protection: '',
    'Work Area': '',
    'Spindle Speed': '',
    Control: '',
    Coverage: '',
    'Drying Time': '',
    Temperature: '',
    Thickness: '',
    Certification: '',
    Weight: '',
    Width: '',
    Composition: '',
    Finish: '',
    Material: '',
    'Heat Treatment': '',
    Warranty: '',
    Standards: '',
  };

  // Mock product data with traffic criteria
  const mockProducts = [
    {
      id: 1,
      name: 'Industrial IoT Temperature Sensor',
      supplier: 'TechCorp Solutions',
      category: 'Electronics & Components',
      rating: 4.8,
      reviews: 156,
      price: '₹2,500',
      minOrder: '100 units',
      stock: 'In Stock',
      description:
        'High-precision wireless temperature sensor for industrial applications. Features include waterproof design, long-range connectivity, and real-time monitoring.',
      specifications: {
        ...completeSpecs,
        Accuracy: '±0.1°C',
        Range: '-40°C to +125°C',
        Connectivity: 'WiFi/LoRa',
        Power: '3.3V DC',
        Protection: 'IP67',
      },
      features: [
        'Waterproof',
        'Wireless',
        'Real-time Monitoring',
        'Long Battery Life',
        'Easy Installation',
      ],
      images: ['🏭', '📡', '🔋', '📊'],
      video: 'https://example.com/product-video.mp4',
      trafficMetrics: {
        views: 1250,
        clicks: 89,
        conversions: 9,
      },
      supplierInfo: {
        name: 'TechCorp Solutions',
        location: 'Bangalore, Karnataka',
        verified: true,
        rating: 4.8,
        responseTime: '2 hours',
        image: '🏭',
      },
    },
    {
      id: 2,
      name: 'CNC Precision Machining Center',
      supplier: 'Global Machinery Ltd.',
      category: 'Machinery & Equipment',
      rating: 4.6,
      reviews: 89,
      price: '₹15,00,000',
      minOrder: '1 unit',
      stock: 'Available on Order',
      description:
        'High-precision CNC machining center with advanced automation features. Suitable for complex manufacturing operations.',
      specifications: {
        ...completeSpecs,
        'Work Area': '800 x 600 x 500mm',
        'Spindle Speed': '24,000 RPM',
        Accuracy: '±0.01mm',
        Power: '15kW',
        Control: 'Fanuc 0i-MF',
      },
      features: [
        'High Precision',
        'Automation Ready',
        'Multi-axis',
        'Tool Changer',
        'Coolant System',
      ],
      images: ['⚙️', '🔧', '📐', '🎛️'],
      video: 'https://example.com/cnc-video.mp4',
      trafficMetrics: {
        views: 890,
        clicks: 45,
        conversions: 5,
      },
      supplierInfo: {
        name: 'Global Machinery Ltd.',
        location: 'Mumbai, Maharashtra',
        verified: true,
        rating: 4.6,
        responseTime: '4 hours',
        image: '⚙️',
      },
    },
    {
      id: 3,
      name: 'Industrial Grade Chemical Resistant Coating',
      supplier: 'ChemTech Industries',
      category: 'Chemicals & Materials',
      rating: 4.9,
      reviews: 234,
      price: '₹850/Liter',
      minOrder: '50 Liters',
      stock: 'In Stock',
      description:
        'Advanced chemical resistant coating for industrial applications. Provides excellent protection against acids, alkalis, and solvents.',
      specifications: {
        ...completeSpecs,
        Coverage: '8-10 sq.m/L',
        'Drying Time': '2-4 hours',
        Temperature: '-20°C to +150°C',
        Thickness: '200-300 microns',
        Certification: 'ISO 12944',
      },
      features: [
        'Chemical Resistant',
        'High Temperature',
        'Long Lasting',
        'Easy Application',
        'Environmentally Friendly',
      ],
      images: ['🧪', '🛡️', '🌡️', '♻️'],
      video: 'https://example.com/coating-video.mp4',
      trafficMetrics: {
        views: 2100,
        clicks: 167,
        conversions: 13,
      },
      supplierInfo: {
        name: 'ChemTech Industries',
        location: 'Ahmedabad, Gujarat',
        verified: true,
        rating: 4.9,
        responseTime: '1 hour',
        image: '🧪',
      },
    },
    {
      id: 4,
      name: 'Organic Cotton Fabric Collection',
      supplier: 'Textile Masters',
      category: 'Textiles & Apparel',
      rating: 4.7,
      reviews: 178,
      price: '₹180/meter',
      minOrder: '1000 meters',
      stock: 'In Stock',
      description:
        'Premium organic cotton fabric collection with sustainable manufacturing practices. Available in various weights and finishes.',
      specifications: {
        ...completeSpecs,
        Weight: '140-200 GSM',
        Width: '44-60 inches',
        Composition: '100% Organic Cotton',
        Finish: 'Soft, Breathable',
        Certification: 'GOTS Certified',
      },
      features: ['Organic', 'Sustainable', 'Breathable', 'Hypoallergenic', 'Eco-friendly'],
      images: ['🧵', '🌱', '👕', '🌿'],
      video: 'https://example.com/fabric-video.mp4',
      trafficMetrics: {
        views: 1800,
        clicks: 134,
        conversions: 10,
      },
      supplierInfo: {
        name: 'Textile Masters',
        location: 'Surat, Gujarat',
        verified: true,
        rating: 4.7,
        responseTime: '3 hours',
        image: '🧵',
      },
    },
    {
      id: 5,
      name: 'Automotive Brake System Components',
      supplier: 'AutoParts Pro',
      category: 'Automotive & Parts',
      rating: 4.5,
      reviews: 112,
      price: '₹1,200',
      minOrder: '50 units',
      stock: 'In Stock',
      description:
        'High-quality brake system components for automotive applications. Manufactured to OEM specifications.',
      specifications: {
        ...completeSpecs,
        Material: 'High-grade Steel',
        'Heat Treatment': 'Hardened & Tempered',
        Finish: 'Zinc Plated',
        Warranty: '2 Years',
        Standards: 'ISO 9001',
      },
      features: ['OEM Quality', 'Durable', 'Precision Made', 'Warranty', 'Easy Installation'],
      images: ['🚗', '🛑', '🔧', '⚡'],
      video: 'https://example.com/brake-video.mp4',
      trafficMetrics: {
        views: 950,
        clicks: 67,
        conversions: 6,
      },
      supplierInfo: {
        name: 'AutoParts Pro',
        location: 'Chennai, Tamil Nadu',
        verified: false,
        rating: 4.5,
        responseTime: '6 hours',
        image: '🚗',
      },
    },
  ];

  useEffect(() => {
    setProducts(mockProducts);
    setFeaturedProducts(mockProducts.filter(p => p.trafficMetrics.views > 1000));
    setSuppliers([...new Set(mockProducts.map(p => p.supplier))]);
  }, []);

  const handleInquiry = (product: Product) => {
    alert(
      `Inquiry sent for ${product.name}!\nSupplier: ${product.supplier}\nPrice: ${product.price}\nMin Order: ${product.minOrder}`
    );
  };

  const handleAddToCart = (product: Product) => {
    alert(`${product.name} added to cart!`);
  };

  const handleShare = (product: Product) => {
    alert(`Sharing ${product.name}...`);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSupplier = !selectedSupplier || product.supplier === selectedSupplier;

    return matchesSearch && matchesCategory && matchesSupplier;
  });

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
                Product Showcase
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='text-slate-400 text-sm'>{filteredProducts.length} Products</div>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Products Carousel */}
      {featuredProducts.length > 0 && (
        <section className='py-8 bg-slate-800/20'>
          <div className='container mx-auto px-4'>
            <h2 className='text-2xl font-bold text-white mb-6'>Featured Products</h2>
            <div className='relative'>
              <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8'>
                <div className='flex items-center space-x-6'>
                  <div className='w-32 h-32 bg-slate-700 rounded-xl flex items-center justify-center text-6xl'>
                    {featuredProducts[currentSlide]?.images[0]}
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-2xl font-bold text-white mb-2'>
                      {featuredProducts[currentSlide]?.name}
                    </h3>
                    <p className='text-slate-400 mb-4'>
                      {featuredProducts[currentSlide]?.description}
                    </p>
                    <div className='flex items-center space-x-4 mb-4'>
                      <div className='flex items-center space-x-1'>
                        <span>⭐</span>
                        <span className='text-white'>{featuredProducts[currentSlide]?.rating}</span>
                        <span className='text-slate-400'>
                          ({featuredProducts[currentSlide]?.reviews})
                        </span>
                      </div>
                      <span className='text-amber-400 font-bold text-xl'>
                        {featuredProducts[currentSlide]?.price}
                      </span>
                    </div>
                    <div className='flex space-x-3'>
                      <button
                        onClick={() => handleInquiry(featuredProducts[currentSlide])}
                        className='px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all'
                      >
                        Get Quote
                      </button>
                      <button
                        onClick={() => handleAddToCart(featuredProducts[currentSlide])}
                        className='px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors'
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
                <div className='flex justify-between items-center mt-6'>
                  <button
                    onClick={prevSlide}
                    className='p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors'
                  >
                    <span>←</span>
                  </button>
                  <div className='flex space-x-2'>
                    {featuredProducts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full ${
                          index === currentSlide ? 'bg-amber-400' : 'bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={nextSlide}
                    className='p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors'
                  >
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search & Filters */}
      <section className='py-6 bg-slate-800/20'>
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6'>
              <div className='grid grid-cols-1 md:grid-cols-12 gap-4'>
                <div className='md:col-span-4'>
                  <div className='relative'>
                    <span>🔍</span>
                    <input
                      type='text'
                      placeholder='Search products...'
                      className='w-full pl-12 pr-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-white bg-slate-700/50 placeholder-slate-400'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className='md:col-span-3'>
                  <select
                    className='w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none appearance-none bg-slate-700/50 text-white'
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                  >
                    <option value=''>All Categories</option>
                    <option value='Electronics & Components'>Electronics & Components</option>
                    <option value='Machinery & Equipment'>Machinery & Equipment</option>
                    <option value='Chemicals & Materials'>Chemicals & Materials</option>
                    <option value='Textiles & Apparel'>Textiles & Apparel</option>
                    <option value='Automotive & Parts'>Automotive & Parts</option>
                  </select>
                </div>

                <div className='md:col-span-3'>
                  <select
                    className='w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none appearance-none bg-slate-700/50 text-white'
                    value={selectedSupplier}
                    onChange={e => setSelectedSupplier(e.target.value)}
                  >
                    <option value=''>All Suppliers</option>
                    {suppliers.map(supplier => (
                      <option key={supplier} value={supplier}>
                        {supplier}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='md:col-span-2'>
                  <div className='flex space-x-2'>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-3 rounded-lg transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-3 rounded-lg transition-colors ${
                        viewMode === 'list'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid/List */}
      <section className='py-8'>
        <div className='container mx-auto px-4'>
          {viewMode === 'grid' ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:bg-slate-700/50 transition-colors'
                >
                  {/* Product Images */}
                  <div className='relative mb-4'>
                    <div className='w-full h-48 bg-slate-700 rounded-xl flex items-center justify-center text-6xl mb-2'>
                      {product.images[0]}
                    </div>
                    <div className='flex space-x-2'>
                      {product.images.slice(1, 4).map((img, index) => (
                        <div
                          key={index}
                          className='w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center text-2xl'
                        >
                          {img}
                        </div>
                      ))}
                    </div>
                    <button className='absolute top-2 right-2 p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg transition-colors'>
                      <span>❤️</span>
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className='mb-4'>
                    <h3 className='text-lg font-bold text-white mb-2'>{product.name}</h3>
                    <div className='flex items-center space-x-4 text-slate-400 text-sm mb-2'>
                      <span>{product.category}</span>
                      <span>•</span>
                      <div className='flex items-center space-x-1'>
                        <span>⭐</span>
                        <span>{product.rating}</span>
                        <span>({product.reviews})</span>
                      </div>
                    </div>
                    <p className='text-slate-300 text-sm line-clamp-2'>{product.description}</p>
                  </div>

                  {/* Price & Stock */}
                  <div className='flex items-center justify-between mb-4'>
                    <div>
                      <div className='text-2xl font-bold text-amber-400'>{product.price}</div>
                      <div className='text-slate-400 text-sm'>Min: {product.minOrder}</div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        product.stock === 'In Stock'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {product.stock}
                    </div>
                  </div>

                  {/* Traffic Metrics */}
                  <div className='grid grid-cols-3 gap-2 mb-4 text-center text-xs'>
                    <div>
                      <div className='text-slate-400'>Views</div>
                      <div className='text-white font-medium'>{product.trafficMetrics.views}</div>
                    </div>
                    <div>
                      <div className='text-slate-400'>Inquiries</div>
                      <div className='text-white font-medium'>{product.trafficMetrics.clicks}</div>
                    </div>
                    <div>
                      <div className='text-slate-400'>Conv. Rate</div>
                      <div className='text-white font-medium'>
                        {product.trafficMetrics.conversions}%
                      </div>
                    </div>
                  </div>

                  {/* Supplier Info */}
                  <div className='flex items-center space-x-3 mb-4 p-3 bg-slate-700/30 rounded-lg'>
                    <div className='w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center text-lg'>
                      {product.supplierInfo.image}
                    </div>
                    <div className='flex-1'>
                      <div className='text-white font-medium text-sm'>
                        {product.supplierInfo.name}
                      </div>
                      <div className='text-slate-400 text-xs'>{product.supplierInfo.location}</div>
                    </div>
                    {product.supplierInfo.verified && (
                      <span>✅</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className='flex space-x-2'>
                    <button
                      onClick={() => handleInquiry(product)}
                      className='flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all text-sm'
                    >
                      Get Quote
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className='px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors'
                    >
                      <span>🛒</span>
                    </button>
                    <button
                      onClick={() => handleShare(product)}
                      className='px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors'
                    >
                      <span>📤</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6'
                >
                  <div className='flex items-start space-x-6'>
                    <div className='w-32 h-32 bg-slate-700 rounded-xl flex items-center justify-center text-4xl'>
                      {product.images[0]}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <h3 className='text-xl font-bold text-white mb-1'>{product.name}</h3>
                          <div className='flex items-center space-x-4 text-slate-400 text-sm mb-2'>
                            <span>{product.category}</span>
                            <span>•</span>
                            <div className='flex items-center space-x-1'>
                              <span>⭐</span>
                              <span>{product.rating}</span>
                              <span>({product.reviews})</span>
                            </div>
                          </div>
                          <p className='text-slate-300'>{product.description}</p>
                        </div>
                        <div className='text-right'>
                          <div className='text-2xl font-bold text-amber-400'>{product.price}</div>
                          <div className='text-slate-400 text-sm'>Min: {product.minOrder}</div>
                        </div>
                      </div>

                      <div className='grid grid-cols-4 gap-4 mb-4'>
                        <div className='text-center'>
                          <div className='text-slate-400 text-sm'>Views</div>
                          <div className='text-white font-medium'>
                            {product.trafficMetrics.views}
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-slate-400 text-sm'>Inquiries</div>
                          <div className='text-white font-medium'>
                            {product.trafficMetrics.clicks}
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-slate-400 text-sm'>Conv. Rate</div>
                          <div className='text-white font-medium'>
                            {product.trafficMetrics.conversions}%
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                          <div className='w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center text-lg'>
                            {product.supplierInfo.image}
                          </div>
                          <div>
                            <div className='text-white font-medium text-sm'>
                              {product.supplierInfo.name}
                            </div>
                            <div className='text-slate-400 text-xs'>
                              {product.supplierInfo.location}
                            </div>
                          </div>
                          {product.supplierInfo.verified && (
                            <span>✅</span>
                          )}
                        </div>
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => handleInquiry(product)}
                            className='px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all'
                          >
                            Get Quote
                          </button>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className='px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors'
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
          )}
        </div>
      </section>
    </div>
  );
}
