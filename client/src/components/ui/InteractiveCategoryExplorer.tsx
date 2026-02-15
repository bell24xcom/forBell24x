'use client';

import React, { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  supplierCount: number;
  color: string;
  bgImage: string;
  subcategories: {
    name: string;
    count: number;
    trending?: boolean;
  }[];
  description: string;
}

interface HexPosition {
  x: number;
  y: number;
  row: number;
  col: number;
}

export default function InteractiveCategoryExplorer() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);

  const categories: Category[] = [
    {
      id: 'steel-metal',
      name: 'Steel & Metal',
      icon: <Building2 className='h-6 w-6' />,
      supplierCount: 28547,
      color: 'from-gray-600 to-gray-800',
      bgImage: 'linear-gradient(135deg, rgba(107,114,128,0.1) 0%, rgba(75,85,99,0.1) 100%)',
      description: 'Raw materials and fabricated metal products',
      subcategories: [
        { name: 'Steel Products', count: 12500, trending: true },
        { name: 'Aluminum', count: 8500 },
        { name: 'Copper & Alloys', count: 4200 },
        { name: 'Metal Fabrication', count: 3347 },
      ],
    },
    {
      id: 'electronics',
      name: 'Electronics & Technology',
      icon: <Laptop className='h-6 w-6' />,
      supplierCount: 32156,
      color: 'from-blue-600 to-blue-800',
      bgImage: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(29,78,216,0.1) 100%)',
      description: 'Electronic components and technology solutions',
      subcategories: [
        { name: 'Semiconductors', count: 15000, trending: true },
        { name: 'Consumer Electronics', count: 9500 },
        { name: 'Industrial Electronics', count: 5200 },
        { name: 'Telecom Equipment', count: 2456 },
      ],
    },
    {
      id: 'chemicals',
      name: 'Chemicals & Pharmaceuticals',
      icon: <Droplets className='h-6 w-6' />,
      supplierCount: 18923,
      color: 'from-green-600 to-green-800',
      bgImage: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(21,128,61,0.1) 100%)',
      description: 'Industrial chemicals and pharmaceutical products',
      subcategories: [
        { name: 'Industrial Chemicals', count: 8500 },
        { name: 'Pharmaceutical APIs', count: 6200, trending: true },
        { name: 'Specialty Chemicals', count: 4223 },
      ],
    },
    {
      id: 'textiles',
      name: 'Textiles & Garments',
      icon: <Shirt className='h-6 w-6' />,
      supplierCount: 25341,
      color: 'from-purple-600 to-purple-800',
      bgImage: 'linear-gradient(135deg, rgba(147,51,234,0.1) 0%, rgba(107,33,168,0.1) 100%)',
      description: 'Textile materials and garment manufacturing',
      subcategories: [
        { name: 'Cotton Fabrics', count: 12000 },
        { name: 'Synthetic Textiles', count: 8500 },
        { name: 'Garment Manufacturing', count: 4841 },
      ],
    },
    {
      id: 'automotive',
      name: 'Automotive Parts',
      icon: <Car className='h-6 w-6' />,
      supplierCount: 21789,
      color: 'from-red-600 to-red-800',
      bgImage: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(185,28,28,0.1) 100%)',
      description: 'Vehicle components and automotive systems',
      subcategories: [
        { name: 'Engine Parts', count: 9500 },
        { name: 'Electrical Components', count: 7200, trending: true },
        { name: 'Body Parts', count: 5089 },
      ],
    },
    {
      id: 'machinery',
      name: 'Industrial Machinery',
      icon: <Cog className='h-6 w-6' />,
      supplierCount: 19654,
      color: 'from-yellow-600 to-yellow-800',
      bgImage: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(180,83,9,0.1) 100%)',
      description: 'Manufacturing and industrial equipment',
      subcategories: [
        { name: 'Manufacturing Equipment', count: 8500 },
        { name: 'Construction Machinery', count: 6200 },
        { name: 'Agricultural Machinery', count: 4954 },
      ],
    },
    {
      id: 'construction',
      name: 'Construction Materials',
      icon: <Building className='h-6 w-6' />,
      supplierCount: 17234,
      color: 'from-orange-600 to-orange-800',
      bgImage: 'linear-gradient(135deg, rgba(251,146,60,0.1) 0%, rgba(194,65,12,0.1) 100%)',
      description: 'Building materials and construction supplies',
      subcategories: [
        { name: 'Cement & Concrete', count: 7500 },
        { name: 'Steel Structures', count: 5200 },
        { name: 'Building Materials', count: 4534 },
      ],
    },
  ];

  // Calculate hexagon positions for honeycomb layout
  const getHexPositions = (count: number): HexPosition[] => {
    const positions: HexPosition[] = [];
    const hexWidth = 140;
    const hexHeight = 120;
    const cols = Math.ceil(Math.sqrt(count));

    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const offsetX = (row % 2) * (hexWidth / 2); // Offset every other row

      positions.push({
        x: col * hexWidth + offsetX,
        y: row * hexHeight * 0.75,
        row,
        col,
      });
    }

    return positions;
  };

  const hexPositions = getHexPositions(categories.length);

  const toggleSubcategories = (categoryId: string) => {
    setExpandedSubcategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className='w-full max-w-7xl mx-auto py-12'>
      <div className='text-center mb-12'>
        <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
          Interactive Category Explorer
        </h2>
        <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
          Explore our comprehensive marketplace ecosystem with intelligent category visualization
        </p>
      </div>

      {/* Honeycomb Grid */}
      <div className='relative'>
        <div
          className='relative mx-auto'
          style={{
            width: '800px',
            height: '600px',
            transform: 'scale(0.9)',
            transformOrigin: 'center',
          }}
        >
          {categories.map((category, index) => {
            const position = hexPositions[index];
            const isHovered = hoveredCategory === category.id;
            const isSelected = selectedCategory === category.id;

            return (
              <div
                key={category.id}
                className={`absolute cursor-pointer transition-all duration-300 ${
                  isHovered || isSelected ? 'z-20 scale-110' : 'z-10'
                }`}
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  width: '120px',
                  height: '140px',
                }}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => setSelectedCategory(category.id)}
              >
                {/* Hexagon Shape */}
                <div className='relative w-full h-full'>
                  {/* Hexagon Background */}
                  <div
                    className={`absolute inset-0 hexagon bg-gradient-to-br ${category.color} ${
                      isHovered || isSelected ? 'shadow-2xl' : 'shadow-lg'
                    } transition-all duration-300`}
                    style={{
                      background:
                        isHovered || isSelected
                          ? `linear-gradient(135deg, ${category.color.split(' ')[1]} 0%, ${
                              category.color.split(' ')[3]
                            } 100%)`
                          : category.bgImage,
                      filter: isHovered ? 'brightness(1.1)' : 'brightness(1)',
                    }}
                  />

                  {/* Hexagon Border */}
                  <div
                    className={`absolute inset-0 hexagon border-2 ${
                      isSelected ? 'border-white' : 'border-white/30'
                    } transition-all duration-300`}
                  />

                  {/* Content */}
                  <div className='absolute inset-0 flex flex-col items-center justify-center text-white p-4'>
                    <div
                      className={`transition-transform duration-300 ${
                        isHovered ? 'scale-125' : 'scale-100'
                      }`}
                    >
                      {category.icon}
                    </div>
                    <h3 className='text-sm font-bold text-center mt-2 leading-tight'>
                      {category.name}
                    </h3>
                    <div className='text-xs opacity-90 mt-1'>
                      {category.supplierCount.toLocaleString()}+
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  {isHovered && (
                    <div className='absolute inset-0 hexagon bg-white/20 animate-pulse' />
                  )}
                </div>

                {/* Expanded Information */}
                {isHovered && (
                  <div className='absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white rounded-xl shadow-xl p-4 w-64 z-30 border border-gray-200'>
                    <h4 className='font-bold text-gray-800 mb-2'>{category.name}</h4>
                    <p className='text-sm text-gray-600 mb-3'>{category.description}</p>
                    <div className='space-y-1'>
                      {category.subcategories.slice(0, 3).map((sub, subIndex) => (
                        <div key={subIndex} className='flex items-center justify-between text-xs'>
                          <span className='text-gray-700'>{sub.name}</span>
                          <div className='flex items-center space-x-1'>
                            {sub.trending && <span>📈</span>}
                            <span className='text-gray-500'>{sub.count.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleSubcategories(category.id);
                      }}
                      className='w-full mt-3 text-xs bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition'
                    >
                      View All Subcategories
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Category Details */}
      {selectedCategoryData && (
        <div className='mt-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200'>
          <div className='max-w-4xl mx-auto'>
            <div className='flex items-center space-x-4 mb-6'>
              <div
                className={`p-4 rounded-xl bg-gradient-to-br ${selectedCategoryData.color} text-white`}
              >
                {selectedCategoryData.icon}
              </div>
              <div>
                <h3 className='text-2xl font-bold text-gray-800'>{selectedCategoryData.name}</h3>
                <p className='text-gray-600'>{selectedCategoryData.description}</p>
                <div className='flex items-center space-x-4 mt-2 text-sm text-gray-500'>
                  <div className='flex items-center space-x-1'>
                    <span>👤</span>
                    <span>{selectedCategoryData.supplierCount.toLocaleString()}+ suppliers</span>
                  </div>
                  <div className='flex items-center space-x-1'>
                    <span>🌍</span>
                    <span>Global availability</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {selectedCategoryData.subcategories.map((subcategory, index) => (
                <div
                  key={index}
                  className='bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <h4 className='font-semibold text-gray-800'>{subcategory.name}</h4>
                    {subcategory.trending && (
                      <div className='flex items-center space-x-1 text-green-600'>
                        <span>📈</span>
                        <span className='text-xs font-medium'>Trending</span>
                      </div>
                    )}
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>
                      {subcategory.count.toLocaleString()} suppliers
                    </span>
                    <span>▶️</span>
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-6 flex justify-center'>
              <button
                onClick={() => setSelectedCategory(null)}
                className='px-6 py-2 bg-white text-gray-600 rounded-lg border border-gray-300 hover:bg-gray-50 transition'
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Statistics */}
      <div className='mt-12 grid grid-cols-2 md:grid-cols-4 gap-6'>
        <div className='text-center'>
          <div className='text-3xl font-bold text-blue-600'>7</div>
          <div className='text-sm text-gray-600'>Major Categories</div>
        </div>
        <div className='text-center'>
          <div className='text-3xl font-bold text-green-600'>25+</div>
          <div className='text-sm text-gray-600'>Subcategories</div>
        </div>
        <div className='text-center'>
          <div className='text-3xl font-bold text-purple-600'>163K+</div>
          <div className='text-sm text-gray-600'>Total Suppliers</div>
        </div>
        <div className='text-center'>
          <div className='text-3xl font-bold text-amber-600'>50+</div>
          <div className='text-sm text-gray-600'>Countries</div>
        </div>
      </div>

      {/* Hexagon CSS */}
      <style jsx>{`
        .hexagon {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
      `}</style>
    </div>
  );
}
