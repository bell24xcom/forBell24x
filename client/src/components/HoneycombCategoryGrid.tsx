'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_CATEGORIES, TRENDING_CATEGORIES, Category } from '../data/categories';

interface HoneycombCategoryGridProps {
  onCategorySelect?: (category: Category) => void;
  maxVisible?: number;
  showTrendingOnly?: boolean;
}

export default function HoneycombCategoryGrid({
  onCategorySelect,
  maxVisible = 19,
  showTrendingOnly = false,
}: HoneycombCategoryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const categories = showTrendingOnly ? TRENDING_CATEGORIES : ALL_CATEGORIES;
  const displayCategories = categories.slice(0, maxVisible);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    onCategorySelect?.(category);
  };

  // Honeycomb positioning logic
  const getHexPosition = (index: number) => {
    const hexRadius = 90; // Distance between hex centers
    const rows = [1, 2, 3, 4, 3, 4, 2]; // Honeycomb pattern
    let currentIndex = 0;

    for (let row = 0; row < rows.length; row++) {
      const hexesInRow = rows[row];
      if (index < currentIndex + hexesInRow) {
        const posInRow = index - currentIndex;
        const offsetX = row % 2 === 0 ? 0 : hexRadius / 2;
        const x = (posInRow - (hexesInRow - 1) / 2) * hexRadius + offsetX;
        const y = (row - (rows.length - 1) / 2) * (hexRadius * 0.866);
        return { x, y };
      }
      currentIndex += hexesInRow;
    }

    // Fallback for additional items
    return { x: 0, y: 0 };
  };

  return (
    <div className='relative w-full max-w-6xl mx-auto py-16'>
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-center mb-12'
      >
        <h2 className='text-3xl font-bold text-gray-900 mb-4'>
          {showTrendingOnly ? 'Trending Categories' : 'Explore Categories'}
        </h2>
        <p className='text-lg text-gray-600'>
          Discover suppliers across {categories.length}+ specialized industries
        </p>
      </motion.div>

      {/* Honeycomb Grid */}
      <div className='relative h-[600px] flex items-center justify-center'>
        <svg width='800' height='600' viewBox='-400 -300 800 600' className='overflow-visible'>
          {displayCategories.map((category, index) => {
            const { x, y } = getHexPosition(index);
            const isHovered = hoveredCategory === category.id;
            const isSelected = selectedCategory?.id === category.id;

            return (
              <g key={category.id} transform={`translate(${x}, ${y})`}>
                {/* Hexagon Background */}
                <motion.polygon
                  points='0,-50 43.3,-25 43.3,25 0,50 -43.3,25 -43.3,-25'
                  className={`cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'fill-blue-600 stroke-blue-700'
                      : isHovered
                      ? 'fill-blue-100 stroke-blue-400'
                      : 'fill-white stroke-gray-300'
                  }`}
                  strokeWidth='2'
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  whileHover={{ scale: 1.1 }}
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => handleCategoryClick(category)}
                />

                {/* Category Icon */}
                <motion.text
                  x='0'
                  y='-10'
                  textAnchor='middle'
                  className='text-2xl pointer-events-none select-none'
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.3 }}
                >
                  {category.icon}
                </motion.text>

                {/* Category Name */}
                <motion.text
                  x='0'
                  y='15'
                  textAnchor='middle'
                  className={`text-xs font-semibold pointer-events-none select-none ${
                    isSelected ? 'fill-white' : 'fill-gray-800'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 + 0.3, duration: 0.3 }}
                >
                  <tspan x='0' dy='0'>
                    {category.name.split(' ')[0]}
                  </tspan>
                  <tspan x='0' dy='12'>
                    {category.name.split(' ').slice(1).join(' ')}
                  </tspan>
                </motion.text>

                {/* Supplier Count */}
                <motion.text
                  x='0'
                  y='35'
                  textAnchor='middle'
                  className={`text-xs font-bold pointer-events-none select-none ${
                    isSelected ? 'fill-blue-200' : 'fill-blue-600'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 + 0.4, duration: 0.3 }}
                >
                  {category.supplierCount}
                </motion.text>

                {/* Trending Badge */}
                {category.trending && (
                  <motion.g
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.5, duration: 0.3 }}
                  >
                    <circle cx='35' cy='-35' r='8' fill='#f59e0b' />
                    <text
                      x='35'
                      y='-32'
                      textAnchor='middle'
                      className='text-xs fill-white font-bold'
                    >
                      🔥
                    </text>
                  </motion.g>
                )}

                {/* Hover Glow Effect */}
                {isHovered && (
                  <motion.polygon
                    points='0,-55 47.3,-27.5 47.3,27.5 0,55 -47.3,27.5 -47.3,-27.5'
                    fill='none'
                    stroke='url(#glowGradient)'
                    strokeWidth='3'
                    className='pointer-events-none'
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  />
                )}
              </g>
            );
          })}

          {/* Gradient Definitions */}
          <defs>
            <radialGradient id='glowGradient' cx='50%' cy='50%' r='50%'>
              <stop offset='0%' stopColor='#3b82f6' stopOpacity='0.8' />
              <stop offset='100%' stopColor='#1d4ed8' stopOpacity='0.2' />
            </radialGradient>
          </defs>
        </svg>

        {/* Center Logo/Bell */}
        <motion.div
          className='absolute inset-0 flex items-center justify-center pointer-events-none'
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className='w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl'>
            <span className='text-2xl text-white font-bold'>🔔</span>
          </div>
        </motion.div>
      </div>

      {/* Category Details Panel */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className='mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-6'
          >
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center gap-4'>
                <div className='text-4xl'>{selectedCategory.icon}</div>
                <div>
                  <h3 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                    {selectedCategory.name}
                    {selectedCategory.trending && (
                      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800'>
                        <span>📈</span>
                        Trending
                      </span>
                    )}
                  </h3>
                  <p className='text-gray-600 mt-1'>{selectedCategory.description}</p>
                  <p className='text-blue-600 font-semibold mt-2'>
                    {selectedCategory.supplierCount} verified suppliers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className='text-gray-400 hover:text-gray-600 text-xl'
              >
                ×
              </button>
            </div>

            {/* Subcategories */}
            <div>
              <h4 className='font-semibold text-gray-900 mb-3'>Popular Subcategories</h4>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                {selectedCategory.subcategories.slice(0, 6).map((sub, index) => (
                  <motion.button
                    key={sub}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='text-left p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors group'
                  >
                    <span className='text-sm font-medium'>{sub}</span>
                    <span>→</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className='mt-6 pt-4 border-t border-gray-200'>
              <button className='w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors'>
                Explore {selectedCategory.name} Suppliers
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View All Categories Button */}
      {maxVisible < ALL_CATEGORIES.length && (
        <motion.div
          className='text-center mt-8'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <button className='inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors'>
            View All {ALL_CATEGORIES.length} Categories
            <span>→</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
