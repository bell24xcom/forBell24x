'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  FileText, 
  ShoppingCart,
  ArrowRight,
  Grid,
  List,
  BarChart3,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { ALL_50_CATEGORIES, getCategoryStatistics, getCategoryGroups } from '@/data/all-50-categories'
import Link from 'next/link'

interface CategoryCardProps {
  category: any
  viewMode: 'grid' | 'list'
  showMockOrders?: boolean
}

function CategoryCard({ category, viewMode, showMockOrders = true }: CategoryCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'pending': return <AlertCircle className="w-4 h-4" />
      default: return <XCircle className="w-4 h-4" />
    }
  }

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{category.icon}</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {formatNumber(category.supplierCount)} Suppliers
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    {formatNumber(category.rfqCount)} RFQs
                  </Badge>
                  {showMockOrders && (
                    <Badge variant="outline" className="text-xs">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      {formatNumber(category.mockOrderCount)} Orders
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {category.trending && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              )}
              <Button asChild variant="outline" size="sm">
                <Link href={`/categories/${category.slug}`}>
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
          
          {showMockOrders && category.mockOrders && category.mockOrders.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Mock Orders</h4>
              <div className="space-y-2">
                {category.mockOrders.slice(0, 2).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.title}</p>
                      <p className="text-xs text-gray-600">{order.buyer} → {order.supplier}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{formatNumber(order.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full hover:shadow-lg hover:scale-105 transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{category.icon}</div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {category.name}
              </CardTitle>
              {category.trending && (
                <Badge className="mt-1 bg-emerald-100 text-emerald-700 border-emerald-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              )}
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <Users className="w-4 h-4 mx-auto text-blue-600 mb-1" />
            <p className="text-xs text-gray-600">Suppliers</p>
            <p className="text-sm font-semibold text-gray-900">{formatNumber(category.supplierCount)}</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <FileText className="w-4 h-4 mx-auto text-green-600 mb-1" />
            <p className="text-xs text-gray-600">RFQs</p>
            <p className="text-sm font-semibold text-gray-900">{formatNumber(category.rfqCount)}</p>
          </div>
        </div>

        {showMockOrders && (
          <div className="text-center p-2 bg-purple-50 rounded-lg mb-4">
            <ShoppingCart className="w-4 h-4 mx-auto text-purple-600 mb-1" />
            <p className="text-xs text-gray-600">Mock Orders</p>
            <p className="text-sm font-semibold text-gray-900">{formatNumber(category.mockOrderCount)}</p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700">Subcategories ({category.subcategories.length})</p>
          <div className="flex flex-wrap gap-1">
            {category.subcategories.slice(0, 3).map((sub: any) => (
              <Badge key={sub.id} variant="outline" className="text-xs">
                {sub.name}
              </Badge>
            ))}
            {category.subcategories.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{category.subcategories.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <Button asChild className="w-full mt-4" size="sm">
          <Link href={`/categories/${category.slug}`}>
            View Category
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function CategoriesDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMockOrders, setShowMockOrders] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  const statistics = getCategoryStatistics()
  const categoryGroups = getCategoryGroups()

  const filteredCategories = useMemo(() => {
    let categories = ALL_50_CATEGORIES

    // Filter by search term
    if (searchTerm) {
      categories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.subcategories.some(sub => sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by tab
    switch (activeTab) {
      case 'trending':
        categories = categories.filter(cat => cat.trending)
        break
      case 'most-active':
        categories = categories.sort((a, b) => b.rfqCount - a.rfqCount).slice(0, 20)
        break
      case 'top-suppliers':
        categories = categories.sort((a, b) => b.supplierCount - a.supplierCount).slice(0, 20)
        break
      case 'most-ordered':
        categories = categories.sort((a, b) => b.mockOrderCount - a.mockOrderCount).slice(0, 20)
        break
      default:
        // Show all categories
        break
    }

    return categories
  }, [searchTerm, activeTab])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categories Dashboard</h1>
              <p className="text-gray-600 mt-1">Explore all 50 categories with mock order data</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalCategories}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalSuppliers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total RFQs</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalRFQs.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Mock Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalMockOrders.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showMockOrders"
                  checked={showMockOrders}
                  onChange={(e) => setShowMockOrders(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="showMockOrders" className="text-sm text-gray-700">
                  Show Mock Orders
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={activeTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Categories</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="most-active">Most Active</TabsTrigger>
            <TabsTrigger value="top-suppliers">Top Suppliers</TabsTrigger>
            <TabsTrigger value="most-ordered">Most Ordered</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'all' && 'All Categories'}
                {activeTab === 'trending' && 'Trending Categories'}
                {activeTab === 'most-active' && 'Most Active Categories'}
                {activeTab === 'top-suppliers' && 'Top Supplier Categories'}
                {activeTab === 'most-ordered' && 'Most Ordered Categories'}
              </h2>
              <p className="text-sm text-gray-600">
                Showing {filteredCategories.length} categories
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    viewMode={viewMode}
                    showMockOrders={showMockOrders}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    viewMode={viewMode}
                    showMockOrders={showMockOrders}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
