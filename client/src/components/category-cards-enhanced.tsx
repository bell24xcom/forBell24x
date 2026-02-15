'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Users, 
  FileText, 
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Star,
  Calendar,
  MapPin
} from 'lucide-react'

interface MockOrder {
  id: string
  title: string
  description: string
  value: number
  currency: string
  status: 'completed' | 'in_progress' | 'pending'
  buyer: string
  supplier: string
  category: string
  subcategory: string
  createdAt: string
  completedAt?: string
}

interface CategoryCardProps {
  category: {
    id: string
    name: string
    slug: string
    icon: string
    description: string
    supplierCount: number
    productCount: number
    rfqCount: number
    mockOrderCount: number
    trending?: boolean
    isActive?: boolean
    subcategories: Array<{
      id: string
      name: string
      slug: string
      description: string
      supplierCount: number
      productCount: number
      rfqCount: number
      mockOrderCount: number
    }>
    mockOrders?: MockOrder[]
  }
  showStats?: boolean
  showMockOrders?: boolean
  compact?: boolean
  variant?: 'default' | 'detailed' | 'minimal'
}

export function EnhancedCategoryCard({ 
  category, 
  showStats = true, 
  showMockOrders = true,
  compact = false,
  variant = 'default'
}: CategoryCardProps) {
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (value: number, currency: string) => {
    if (currency === 'INR') {
      if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
      if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
      if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
      return `₹${value}`
    }
    return `${currency} ${value.toLocaleString()}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200'
      case 'in_progress': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3" />
      case 'in_progress': return <Clock className="w-3 h-3" />
      case 'pending': return <AlertCircle className="w-3 h-3" />
      default: return <XCircle className="w-3 h-3" />
    }
  }

  if (variant === 'minimal') {
    return (
      <Link href={`/categories/${category.slug}`} className="group">
        <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{category.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">{formatNumber(category.supplierCount)} suppliers</p>
              </div>
              {category.trending && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  if (variant === 'detailed') {
    return (
      <Card className="h-full hover:shadow-lg transition-all duration-300 group">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{category.icon}</div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {category.name}
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                {category.trending && (
                  <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-emerald-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/categories/${category.slug}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Link>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 mx-auto text-blue-600 mb-2" />
              <p className="text-xs text-gray-600">Suppliers</p>
              <p className="text-lg font-bold text-gray-900">{formatNumber(category.supplierCount)}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <FileText className="w-5 h-5 mx-auto text-green-600 mb-2" />
              <p className="text-xs text-gray-600">RFQs</p>
              <p className="text-lg font-bold text-gray-900">{formatNumber(category.rfqCount)}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <ShoppingCart className="w-5 h-5 mx-auto text-purple-600 mb-2" />
              <p className="text-xs text-gray-600">Products</p>
              <p className="text-lg font-bold text-gray-900">{formatNumber(category.productCount)}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Star className="w-5 h-5 mx-auto text-orange-600 mb-2" />
              <p className="text-xs text-gray-600">Orders</p>
              <p className="text-lg font-bold text-gray-900">{formatNumber(category.mockOrderCount)}</p>
            </div>
          </div>

          {/* Subcategories */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Subcategories ({category.subcategories.length})</h4>
            <div className="grid grid-cols-2 gap-2">
              {category.subcategories.slice(0, 6).map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{sub.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {formatNumber(sub.supplierCount)}
                  </Badge>
                </div>
              ))}
              {category.subcategories.length > 6 && (
                <div className="flex items-center justify-center p-2 bg-gray-100 rounded-lg">
                  <span className="text-sm text-gray-600">
                    +{category.subcategories.length - 6} more
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mock Orders */}
          {showMockOrders && category.mockOrders && category.mockOrders.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Mock Orders</h4>
              <div className="space-y-3">
                {category.mockOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-900 line-clamp-1">{order.title}</h5>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{order.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{order.buyer} → {order.supplier}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.value, order.currency)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      {order.completedAt && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Completed {new Date(order.completedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button asChild className="w-full" size="sm">
            <Link href={`/categories/${category.slug}`}>
              Explore Category
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Link href={`/categories/${category.slug}`} className="group">
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50">
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
          
          {showStats && (
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
          )}

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
              {category.subcategories.slice(0, 3).map((sub) => (
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

          <Button className="w-full mt-4" size="sm">
            View Category
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}

interface CategoryGridProps {
  categories: CategoryCardProps['category'][]
  showStats?: boolean
  showMockOrders?: boolean
  compact?: boolean
  variant?: 'default' | 'detailed' | 'minimal'
  columns?: 2 | 3 | 4 | 5 | 6
  maxItems?: number
}

export function EnhancedCategoryGrid({ 
  categories, 
  showStats = true, 
  showMockOrders = true,
  compact = false,
  variant = 'default',
  columns = 4,
  maxItems 
}: CategoryGridProps) {
  const displayCategories = maxItems ? categories.slice(0, maxItems) : categories
  
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  }
  
  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {displayCategories.map((category) => (
        <EnhancedCategoryCard
          key={category.id}
          category={category}
          showStats={showStats}
          showMockOrders={showMockOrders}
          compact={compact}
          variant={variant}
        />
      ))}
    </div>
  )
}

interface TrendingCategoriesProps {
  categories: CategoryCardProps['category'][]
  showStats?: boolean
  showMockOrders?: boolean
  maxItems?: number
}

export function TrendingCategories({ 
  categories, 
  showStats = true, 
  showMockOrders = true,
  maxItems = 6
}: TrendingCategoriesProps) {
  const trendingCategories = categories.filter(cat => cat.trending).slice(0, maxItems)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Trending Categories</h2>
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
          <TrendingUp className="w-4 h-4 mr-1" />
          {trendingCategories.length} Categories
        </Badge>
      </div>
      
      <EnhancedCategoryGrid
        categories={trendingCategories}
        showStats={showStats}
        showMockOrders={showMockOrders}
        columns={3}
      />
    </div>
  )
}
