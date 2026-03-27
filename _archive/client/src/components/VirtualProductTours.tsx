'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string;
  location: string;
  rating: number;
  reviews: number;
  priceRange: string;
  image: string;
  specs: { [key: string]: string };
  features: string[];
  certifications: string[];
  deliveryTime: string;
  minOrder: string;
}

export default function VirtualProductTours() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [activeSpec, setActiveSpec] = useState<string | null>(null);

  const products: Product[] = [
    {
      id: '1',
      name: 'Industrial CNC Machine',
      category: 'Machinery',
      supplier: 'Mumbai Heavy Industries',
      location: 'Mumbai, Maharashtra',
      rating: 4.8,
      reviews: 127,
      priceRange: '₹15-25 Lakh',
      image: '🏭',
      specs: {
        'Spindle Speed': '12,000 RPM',
        'Work Area': '1200 x 800 x 600 mm',
        Precision: '±0.005 mm',
        Power: '15 kW',
        Weight: '3500 kg',
      },
      features: [
        'Automatic Tool Changer',
        'CNC Control System',
        'Coolant System',
        'Safety Interlocks',
      ],
      certifications: ['ISO 9001', 'CE Marking', 'BIS Certified'],
      deliveryTime: '45-60 days',
      minOrder: '1 unit',
    },
    {
      id: '2',
      name: 'Smart LED Display Module',
      category: 'Electronics',
      supplier: 'Chennai Electronics Corp',
      location: 'Chennai, Tamil Nadu',
      rating: 4.9,
      reviews: 234,
      priceRange: '₹8,000-15,000',
      image: '💡',
      specs: {
        Resolution: '1920 x 1080 px',
        Brightness: '5000 nits',
        'Refresh Rate': '60 Hz',
        'Power Consumption': '150W',
        'Operating Temp': '-20°C to +60°C',
      },
      features: ['Weather Resistant', 'Remote Control', 'Auto Brightness', 'Energy Efficient'],
      certifications: ['FCC', 'RoHS', 'Energy Star'],
      deliveryTime: '15-30 days',
      minOrder: '10 units',
    },
    {
      id: '3',
      name: 'Organic Cotton Fabric',
      category: 'Textiles',
      supplier: 'Gujarat Textile Mills',
      location: 'Ahmedabad, Gujarat',
      rating: 4.7,
      reviews: 89,
      priceRange: '₹250-400/meter',
      image: '🧵',
      specs: {
        GSM: '180-220',
        Width: '58-60 inches',
        Composition: '100% Organic Cotton',
        Weave: 'Plain/Twill',
        Shrinkage: '<3%',
      },
      features: ['GOTS Certified', 'Pre-shrunk', 'Colorfast', 'Eco-friendly'],
      certifications: ['GOTS', 'OEKO-TEX', 'Organic India'],
      deliveryTime: '10-20 days',
      minOrder: '500 meters',
    },
    {
      id: '4',
      name: 'Industrial Chemical Pump',
      category: 'Chemicals',
      supplier: 'Delhi Process Equipment',
      location: 'New Delhi',
      rating: 4.6,
      reviews: 156,
      priceRange: '₹50,000-1.2 Lakh',
      image: '⚗️',
      specs: {
        'Flow Rate': '50-500 LPM',
        Head: 'Up to 100 meters',
        Material: 'SS316L',
        Temperature: 'Up to 200°C',
        Pressure: 'Up to 16 bar',
      },
      features: ['Corrosion Resistant', 'Self-Priming', 'Explosion Proof', 'Easy Maintenance'],
      certifications: ['ATEX', 'ASME', 'API 610'],
      deliveryTime: '30-45 days',
      minOrder: '1 unit',
    },
  ];

  // Auto-rotate products
  useEffect(() => {
    if (!selectedProduct && isPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % products.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedProduct, isPlaying, products.length]);

  // Auto-rotate 3D view
  useEffect(() => {
    if (selectedProduct && isPlaying) {
      const interval = setInterval(() => {
        setRotation(prev => (prev + 1) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [selectedProduct, isPlaying]);

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % products.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + products.length) % products.length);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetView = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  return (
    <section className='bg-gradient-to-br from-gray-50 to-blue-50 py-20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-12'
        >
          <div className='inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full mb-4'>
            <span>👁️</span>
            <span className='text-sm font-semibold text-purple-700'>VIRTUAL EXPLORATION</span>
          </div>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            Immersive Product Tours
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Explore products in stunning detail with 360° views, interactive specifications, and
            direct supplier connections.
          </p>
        </motion.div>

        {!selectedProduct ? (
          // Product Carousel View
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='relative'>
            {/* Main Product Display */}
            <div className='relative overflow-hidden rounded-3xl bg-white shadow-2xl mb-8'>
              <div className='relative h-96 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'>
                <motion.div
                  key={currentIndex}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className='text-8xl'
                  style={{ transform: `rotate(${rotation * 0.5}deg)` }}
                >
                  {products[currentIndex].image}
                </motion.div>

                {/* Controls */}
                <div className='absolute top-4 right-4 flex gap-2'>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className='w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors'
                  >
                    {isPlaying ? <span>⏸️</span> : <span>▶️</span>}
                  </button>
                  <button
                    onClick={() => setSelectedProduct(products[currentIndex])}
                    className='w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors'
                  >
                    <Maximize className='w-5 h-5' />
                  </button>
                </div>

                {/* Navigation */}
                <button
                  onClick={handlePrev}
                  className='absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors'
                >
                  <span>←</span>
                </button>
                <button
                  onClick={handleNext}
                  className='absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors'
                >
                  <span>→</span>
                </button>
              </div>

              {/* Product Info */}
              <div className='p-6'>
                <div className='flex items-start justify-between mb-4'>
                  <div>
                    <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                      {products[currentIndex].name}
                    </h3>
                    <div className='flex items-center gap-4 text-sm text-gray-600 mb-2'>
                      <span className='bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium'>
                        {products[currentIndex].category}
                      </span>
                      <div className='flex items-center gap-1'>
                        <span>📍</span>
                        {products[currentIndex].location}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='flex items-center'>
                        {[...Array(5)].map((_, i) => (
                          <span>⭐</span>
                        ))}
                      </div>
                      <span className='text-sm text-gray-600'>
                        {products[currentIndex].rating} ({products[currentIndex].reviews} reviews)
                      </span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-2xl font-bold text-green-600 mb-1'>
                      {products[currentIndex].priceRange}
                    </div>
                    <div className='text-sm text-gray-600'>Price Range</div>
                  </div>
                </div>

                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                  <div className='bg-gray-50 rounded-lg p-3 text-center'>
                    <span>🕐</span>
                    <div className='text-sm font-medium text-gray-900'>
                      {products[currentIndex].deliveryTime}
                    </div>
                    <div className='text-xs text-gray-600'>Delivery</div>
                  </div>
                  <div className='bg-gray-50 rounded-lg p-3 text-center'>
                    <span>🛒</span>
                    <div className='text-sm font-medium text-gray-900'>
                      {products[currentIndex].minOrder}
                    </div>
                    <div className='text-xs text-gray-600'>Min Order</div>
                  </div>
                  <div className='bg-gray-50 rounded-lg p-3 text-center'>
                    <span>🛡️</span>
                    <div className='text-sm font-medium text-gray-900'>
                      {products[currentIndex].certifications.length}
                    </div>
                    <div className='text-xs text-gray-600'>Certifications</div>
                  </div>
                  <div className='bg-gray-50 rounded-lg p-3 text-center'>
                    <Info className='w-5 h-5 mx-auto mb-1 text-amber-600' />
                    <div className='text-sm font-medium text-gray-900'>
                      {Object.keys(products[currentIndex].specs).length}
                    </div>
                    <div className='text-xs text-gray-600'>Specifications</div>
                  </div>
                </div>

                <div className='flex gap-3'>
                  <button
                    onClick={() => setSelectedProduct(products[currentIndex])}
                    className='flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2'
                  >
                    <span>👁️</span>
                    Explore in 3D
                  </button>
                  <button className='bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2'>
                    <span>🛒</span>
                    Request Quote
                  </button>
                </div>
              </div>
            </div>

            {/* Product Thumbnails */}
            <div className='flex justify-center gap-4 overflow-x-auto pb-4'>
              {products.map((product, index) => (
                <motion.button
                  key={product.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    index === currentIndex
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-110'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: index === currentIndex ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {product.image}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          // Detailed Product View
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='bg-white rounded-3xl shadow-2xl overflow-hidden'
          >
            {/* Header */}
            <div className='bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6'>
              <div className='flex items-center justify-between'>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className='flex items-center gap-2 text-white hover:text-blue-100 transition-colors'
                >
                  <span>←</span>
                  Back to Gallery
                </button>
                <div className='flex items-center gap-2'>
                  <button className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors'>
                    <span>❤️</span>
                  </button>
                  <button className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors'>
                    <span>🔊</span>
                  </button>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 p-8'>
              {/* 3D Viewer */}
              <div className='space-y-4'>
                <div className='relative bg-gradient-to-br from-gray-100 to-blue-100 rounded-2xl h-96 flex items-center justify-center overflow-hidden'>
                  <motion.div
                    className='text-8xl cursor-grab active:cursor-grabbing'
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    }}
                    drag
                    dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                  >
                    {selectedProduct.image}
                  </motion.div>

                  {/* 3D Controls */}
                  <div className='absolute bottom-4 left-4 flex gap-2'>
                    <button
                      onClick={handleZoomIn}
                      className='w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg'
                    >
                      <ZoomIn className='w-5 h-5' />
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className='w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg'
                    >
                      <ZoomOut className='w-5 h-5' />
                    </button>
                    <button
                      onClick={resetView}
                      className='w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg'
                    >
                      <RotateCcw className='w-5 h-5' />
                    </button>
                  </div>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className='absolute bottom-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg'
                  >
                    {isPlaying ? <span>⏸️</span> : <span>▶️</span>}
                  </button>
                </div>

                {/* View Options */}
                <div className='flex gap-2'>
                  {['Front', 'Side', 'Top', 'Interior'].map(view => (
                    <button
                      key={view}
                      className='px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-blue-100 hover:text-blue-700 transition-colors'
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className='space-y-6'>
                <div>
                  <h2 className='text-3xl font-bold text-gray-900 mb-2'>{selectedProduct.name}</h2>
                  <p className='text-gray-600 mb-4'>by {selectedProduct.supplier}</p>
                  <div className='text-3xl font-bold text-green-600 mb-4'>
                    {selectedProduct.priceRange}
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>Technical Specifications</h3>
                  <div className='space-y-2'>
                    {Object.entries(selectedProduct.specs).map(([key, value]) => (
                      <motion.div
                        key={key}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          activeSpec === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveSpec(activeSpec === key ? null : key)}
                      >
                        <div className='flex justify-between items-center'>
                          <span className='font-medium text-gray-900'>{key}</span>
                          <span className='text-blue-600 font-bold'>{value}</span>
                        </div>
                        <AnimatePresence>
                          {activeSpec === key && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className='mt-2 text-sm text-gray-600'
                            >
                              Detailed information about {key.toLowerCase()} specification...
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Features & Certifications */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h4 className='font-bold text-gray-900 mb-3'>Key Features</h4>
                    <div className='space-y-2'>
                      {selectedProduct.features.map((feature, index) => (
                        <div key={index} className='flex items-center gap-2 text-sm'>
                          <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className='font-bold text-gray-900 mb-3'>Certifications</h4>
                    <div className='flex flex-wrap gap-2'>
                      {selectedProduct.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className='px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium'
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-3'>
                  <button className='flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all'>
                    Request Quote
                  </button>
                  <button className='bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-emerald-700 transition-colors'>
                    Contact Supplier
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
