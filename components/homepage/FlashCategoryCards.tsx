'use client';
import { useState, useEffect } from 'react';
import { ALL_50_CATEGORIES, getCategoryById } from '@/data/all-50-categories';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    totalSuppliers: number;
    totalProducts: number;
    avgRating: number;
    featured: boolean;
    subcategories: Array<{
      id: string;
      name: string;
      supplierCount: number;
      productCount: number;
    }>;
  };
  index: number;
  isVisible: boolean;
}

function CategoryCard({ category, index, isVisible }: CategoryCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const colorClasses = {
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    red: 'from-red-500 to-red-700',
    purple: 'from-purple-500 to-purple-700',
    pink: 'from-pink-500 to-pink-700',
    orange: 'from-orange-500 to-orange-700',
    yellow: 'from-yellow-500 to-yellow-700',
    gray: 'from-gray-500 to-gray-700',
    indigo: 'from-indigo-500 to-indigo-700',
    teal: 'from-teal-500 to-teal-700'
  };

  const bgColorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50',
    pink: 'bg-pink-50',
    orange: 'bg-orange-50',
    yellow: 'bg-yellow-50',
    gray: 'bg-gray-50',
    indigo: 'bg-indigo-50',
    teal: 'bg-teal-50'
  };

  const cardColor = colorClasses[category.color as keyof typeof colorClasses] || 'from-gray-500 to-gray-700';
  const bgColor = bgColorClasses[category.color as keyof typeof bgColorClasses] || 'bg-gray-50';

  return (
    <div
      className={`group perspective-1000 transform transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative w-full h-80 cursor-pointer transform-style-preserve-3d transition-transform duration-700 ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of Card */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-xl ${bgColor} border border-gray-200 overflow-hidden`}>
          <div className={`h-32 bg-gradient-to-r ${cardColor} flex items-center justify-center`}>
            <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
              {category.icon}
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
              {category.name}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {category.description}
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Suppliers:</span>
                <span className="font-semibold text-gray-900">{category.totalSuppliers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Products:</span>
                <span className="font-semibold text-gray-900">{category.totalProducts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rating:</span>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold text-gray-900">{category.avgRating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {category.featured && (
              <div className="absolute top-4 right-4 px-2 py-1 bg-amber-500 text-white text-xs rounded-full font-medium">
                Featured
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Click to flip</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Hover Effect Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${cardColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
        </div>

        {/* Back of Card */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl shadow-xl bg-gradient-to-br ${cardColor} text-white overflow-hidden`}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{category.name}</h3>
              <div className="text-4xl">{category.icon}</div>
            </div>

            <div className="flex-1">
              <h4 className="text-lg font-semibold mb-3">Top Subcategories</h4>
              <div className="space-y-2">
                {category.subcategories.slice(0, 4).map((subcategory, idx) => (
                  <div key={subcategory.id} className="flex justify-between items-center bg-white/10 rounded-lg p-2">
                    <span className="text-sm font-medium">{subcategory.name}</span>
                    <div className="flex items-center space-x-2 text-xs">
                      <span>{subcategory.supplierCount}</span>
                      <span className="text-white/70">suppliers</span>
                    </div>
                  </div>
                ))}
                {category.subcategories.length > 4 && (
                  <div className="text-center text-sm text-white/70">
                    +{category.subcategories.length - 4} more
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{category.totalSuppliers.toLocaleString()}</div>
                  <div className="text-xs text-white/80">Suppliers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{category.totalProducts.toLocaleString()}</div>
                  <div className="text-xs text-white/80">Products</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-white/70">Click to flip back</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                <div className="w-2 h-2 bg-white/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FlashCategoryCardsProps {
  limit?: number;
  showFeatured?: boolean;
  categoryFilter?: string;
}

export default function FlashCategoryCards({ 
  limit = 12, 
  showFeatured = false,
  categoryFilter = ''
}: FlashCategoryCardsProps) {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'suppliers' | 'products' | 'rating'>('suppliers');

  // Filter and sort categories
  const filteredCategories = ALL_50_CATEGORIES
    .filter(category => {
      const matchesSearch = !searchTerm || 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFeatured = !showFeatured || category.featured;
      
      const matchesFilter = !categoryFilter || 
        category.name.toLowerCase().includes(categoryFilter.toLowerCase()) ||
        category.subcategories.some(sub => 
          sub.name.toLowerCase().includes(categoryFilter.toLowerCase())
        );

      return matchesSearch && matchesFeatured && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'suppliers':
          return b.totalSuppliers - a.totalSuppliers;
        case 'products':
          return b.totalProducts - a.totalProducts;
        case 'rating':
          return b.avgRating - a.avgRating;
        default:
          return 0;
      }
    })
    .slice(0, limit);

  // Intersection Observer for animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('[data-category-card]');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [filteredCategories]);

  const totalSuppliers = ALL_50_CATEGORIES.reduce((sum, cat) => sum + cat.totalSuppliers, 0);
  const totalProducts = ALL_50_CATEGORIES.reduce((sum, cat) => sum + cat.totalProducts, 0);

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Our Categories
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Discover <span className="font-semibold text-blue-600">{totalSuppliers.toLocaleString()}+ verified suppliers</span> across{' '}
            <span className="font-semibold text-blue-600">{ALL_50_CATEGORIES.length} categories</span> with{' '}
            <span className="font-semibold text-blue-600">{totalProducts.toLocaleString()}+ products</span>
          </p>
          
          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search categories..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="suppliers">Sort by Suppliers</option>
              <option value="products">Sort by Products</option>
              <option value="rating">Sort by Rating</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>

          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Verified Suppliers
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Quality Assured
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              GST Compliant
            </div>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCategories.map((category, index) => (
            <div
              key={category.id}
              data-category-card
              data-index={index}
              className="transform transition-all duration-500 hover:scale-105"
            >
              <CategoryCard
                category={category}
                index={index}
                isVisible={visibleCards.has(index)}
              />
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {filteredCategories.length === limit && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              View All Categories
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{ALL_50_CATEGORIES.length}</div>
            <div className="text-gray-600">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{totalSuppliers.toLocaleString()}</div>
            <div className="text-gray-600">Suppliers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">{totalProducts.toLocaleString()}</div>
            <div className="text-gray-600">Products</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">4.5</div>
            <div className="text-gray-600">Avg Rating</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
