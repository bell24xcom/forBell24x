'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProductsCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Mock data for categories
      const mockCategories = [
        {
          id: '1',
          name: 'Steel & Metals',
          description: 'Steel pipes, sheets, rods, and metal products',
          productCount: 1250,
          image: '/images/steel-category.jpg',
          subcategories: ['Steel Pipes', 'Steel Sheets', 'Steel Rods', 'Metal Components']
        },
        {
          id: '2',
          name: 'Textiles',
          description: 'Cotton, silk, polyester, and blended fabrics',
          productCount: 890,
          image: '/images/textiles-category.jpg',
          subcategories: ['Cotton Fabric', 'Silk Fabric', 'Polyester Fabric', 'Blended Fabric']
        },
        {
          id: '3',
          name: 'Electronics',
          description: 'Electronic components, devices, and accessories',
          productCount: 2100,
          image: '/images/electronics-category.jpg',
          subcategories: ['LED Bulbs', 'Electrical Components', 'Power Supplies', 'Cables & Wires']
        },
        {
          id: '4',
          name: 'Chemicals',
          description: 'Industrial and laboratory chemicals',
          productCount: 450,
          image: '/images/chemicals-category.jpg',
          subcategories: ['Raw Materials', 'Industrial Chemicals', 'Laboratory Chemicals', 'Specialty Chemicals']
        },
        {
          id: '5',
          name: 'Machinery',
          description: 'Industrial machinery and equipment',
          productCount: 680,
          image: '/images/machinery-category.jpg',
          subcategories: ['Industrial Machinery', 'Machine Parts', 'Tools & Equipment', 'Heavy Machinery']
        },
        {
          id: '6',
          name: 'Construction',
          description: 'Construction materials and supplies',
          productCount: 920,
          image: '/images/construction-category.jpg',
          subcategories: ['Cement', 'Bricks', 'Tiles', 'Construction Tools']
        }
      ];
      
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Categories</h1>
            <p className="text-lg text-gray-600 mb-8">
              Browse products by category to find exactly what you need
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = '/images/placeholder-category.jpg';
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Subcategories:</p>
                        <div className="flex flex-wrap gap-1">
                          {category.subcategories.map((sub, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {category.productCount.toLocaleString()} products
                        </span>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Browse Products
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}