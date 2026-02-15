'use client';

import { Award, Star, Eye, Heart } from 'lucide-react';

export default function SupplierShowcasePage() {
  const showcaseItems = [
    {
      id: 1,
      supplier: 'TechManufacturing Co.',
      product: 'Industrial IoT Sensors',
      rating: 4.8,
      views: 1240,
      likes: 89,
      category: 'Electronics',
      featured: true,
    },
    {
      id: 2,
      supplier: 'GreenEnergy Solutions',
      product: 'Solar Panel Systems',
      rating: 4.9,
      views: 2150,
      likes: 156,
      category: 'Energy',
      featured: false,
    },
    {
      id: 3,
      supplier: 'AutoParts Premium',
      product: 'Electric Vehicle Components',
      rating: 4.7,
      views: 980,
      likes: 67,
      category: 'Automotive',
      featured: true,
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center'>
              <span>⭐</span>
              Supplier Showcase
            </h2>
            <p className='text-gray-600'>
              Premium supplier portfolio and product showcase platform
            </p>
          </div>
          <div className='bg-yellow-50 rounded-lg p-4'>
            <div className='text-2xl font-bold text-yellow-600'>156</div>
            <div className='text-sm text-yellow-700'>Featured Products</div>
          </div>
        </div>
      </div>
      {/* Showcase Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {[
          { title: 'Total Showcases', value: '1,247', icon: Star, color: 'yellow' },
          { title: 'Featured Suppliers', value: '89', icon: Award, color: 'purple' },
          { title: 'Total Views', value: '45.2K', icon: Eye, color: 'blue' },
          { title: 'Engagement Rate', value: '92%', icon: Heart, color: 'red' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>{stat.title}</p>
                  <p className='text-2xl font-bold text-gray-900'>{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 text-${stat.color}-600`} />
              </div>
            </div>
          );
        })}
      </div>
      {/* Search and Filters */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='flex flex-col sm:flex-row gap-4 mb-6'>
          <div className='flex-1 relative'>
            <span>🔍</span>
            <input
              type='text'
              placeholder='Search showcase products...'
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent'
            />
          </div>
          <button className='px-4 py-2 border border-gray-300 rounded-lg flex items-center hover:bg-gray-50'>
            <span>🔽</span>
            Filter by Category
          </button>
          <button className='px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700'>
            Add to Showcase
          </button>
        </div>
      </div>
      {/* Showcase Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {showcaseItems.map(item => (
          <div
            key={item.id}
            className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow'
          >
            {item.featured && (
              <div className='bg-yellow-500 text-white text-xs font-medium px-2 py-1'>
                ⭐ FEATURED
              </div>
            )}
            <div className='h-48 bg-gray-200 flex items-center justify-center'>
              <span>⭐</span>
            </div>
            <div className='p-6'>
              <h3 className='font-semibold text-gray-900 mb-1'>{item.product}</h3>
              <p className='text-sm text-gray-600 mb-2'>{item.supplier}</p>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center'>
                  <span>⭐</span>
                  <span className='text-sm font-medium'>{item.rating}</span>
                </div>
                <span className='text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded'>
                  {item.category}
                </span>
              </div>
              <div className='flex items-center justify-between text-sm text-gray-500'>
                <div className='flex items-center'>
                  <span>👁️</span>
                  {item.views}
                </div>
                <div className='flex items-center'>
                  <span>❤️</span>
                  {item.likes}
                </div>
                <button className='text-blue-600 hover:text-blue-800'>
                  <span>📤</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Showcase Benefits */}
      <div className='bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200'>
        <h3 className='text-lg font-semibold text-gray-900 mb-3'>Showcase Benefits</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='flex items-start space-x-3'>
            <Award className='w-6 h-6 text-yellow-600 mt-1' />
            <div>
              <h4 className='font-medium text-gray-900'>Premium Visibility</h4>
              <p className='text-sm text-gray-600'>Featured placement for top suppliers</p>
            </div>
          </div>
          <div className='flex items-start space-x-3'>
            <span>👤</span>
            <div>
              <h4 className='font-medium text-gray-900'>Buyer Engagement</h4>
              <p className='text-sm text-gray-600'>Direct connection with verified buyers</p>
            </div>
          </div>
          <div className='flex items-start space-x-3'>
            <span>⭐</span>
            <div>
              <h4 className='font-medium text-gray-900'>Performance Analytics</h4>
              <p className='text-sm text-gray-600'>Detailed showcase performance metrics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
