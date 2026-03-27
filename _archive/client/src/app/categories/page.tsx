<<<<<<< HEAD
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search, Grid, List, ArrowLeft, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CategoriesPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Simplified categories data for better performance
  const categories = useMemo(
    () => [
      {
        name: 'Electronics & Components',
        icon: '⚡',
        count: '32,891',
        growth: '+15%',
        slug: 'electronics-and-components',
        description: 'Complete electronics ecosystem',
        successRate: '94.8%',
        featured: true,
        trending: true,
      },
      {
        name: 'Textiles & Garments',
        icon: '🧵',
        count: '28,456',
        growth: '+12%',
        slug: 'textiles-and-garments',
        description: 'End-to-end textile solutions',
        successRate: '92.5%',
        featured: true,
        trending: false,
      },
      {
        name: 'Machinery & Equipment',
        icon: '⚙️',
        count: '25,789',
        growth: '+18%',
        slug: 'machinery-and-equipment',
        description: 'Industrial machinery solutions',
        successRate: '96.2%',
        featured: true,
        trending: true,
      },
      {
        name: 'Automotive & Parts',
        icon: '🚗',
        count: '19,876',
        growth: '+8%',
        slug: 'automotive-and-parts',
        description: 'Complete automotive solutions',
        successRate: '91.3%',
        featured: false,
        trending: false,
      },
      {
        name: 'Chemicals & Materials',
        icon: '🧪',
        count: '15,432',
        growth: '+22%',
        slug: 'chemicals-and-materials',
        description: 'Industrial chemicals and raw materials',
        successRate: '89.7%',
        featured: false,
        trending: true,
      },
      {
        name: 'Food & Beverages',
        icon: '🍽️',
        count: '12,345',
        growth: '+6%',
        slug: 'food-and-beverages',
        description: 'Food processing and packaging',
        successRate: '93.1%',
        featured: false,
        trending: false,
      },
    ],
    []
  );

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = selectedFilter === 'all' || 
        (selectedFilter === 'featured' && category.featured) ||
        (selectedFilter === 'trending' && category.trending);
      return matchesSearch && matchesFilter;
    });
  }, [categories, searchTerm, selectedFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-blue-600">BELL24H</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/suppliers" className="text-gray-600 hover:text-blue-600 transition-colors">
                Suppliers
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                Pricing
              </Link>
              <Link href="/auth/login">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Compact */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header - Compact */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">All Business Categories</h2>
          <p className="text-gray-600">50+ categories • 534,672+ verified suppliers</p>
        </div>

        {/* Search and Filter - Compact */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
              >
                <option value="all">All Categories</option>
                <option value="featured">Featured</option>
                <option value="trending">Trending</option>
              </select>
              
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none border-r"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid - Compact */}
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredCategories.map((category) => (
            <Card key={category.slug} className="hover:shadow-lg transition-shadow duration-200 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{category.icon}</div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {category.featured && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {category.trending && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Suppliers</p>
                    <p className="font-semibold text-gray-900">{category.count}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Success Rate</p>
                    <p className="font-semibold text-green-600">{category.successRate}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Growth: {category.growth}</span>
                    <Link href={`/categories/${category.slug}`}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Explore
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
=======
import { ALL_50_CATEGORIES } from '@/data/all-50-categories';
import Link from 'next/link';

export default function CategoriesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-white">
      <h1 className="text-5xl font-black mb-10 text-cyan-400">Product Categories</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {ALL_50_CATEGORIES.map(cat => (
          <Link href={`/categories/${cat.slug}`} key={cat.id} className="rounded-xl bg-gray-900/80 border border-cyan-500/10 p-6 block mb-1 hover:bg-cyan-900/30 transition font-bold text-xl flex items-center gap-4 shadow-lg">
            <span className="text-3xl">{cat.icon}</span> <span>{cat.name}</span>
          </Link>
        ))}
      </div>
      <p className="mt-12 text-gray-400">Explore all 50+ product & service categories. BELL covers every corner of Indian business.</p>
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
    </div>
  );
}
