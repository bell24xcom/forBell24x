'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Grid, List, TrendingUp, Users, Package, ShoppingCart } from 'lucide-react'

interface MockOrder {
  title: string
  description: string
  value: number
  currency: string
  status: 'completed' | 'in_progress' | 'pending'
  buyer: string
  supplier: string
}

interface Category {
  name: string
  description: string
  icon: string
  supplierCount: number
  productCount: number
  rfqCount: number
  mockOrderCount: number
  trending: boolean
  subcategories: string[]
  mockOrders: MockOrder[]
}

interface CategoriesData {
  categories: Category[]
  totalCategories: number
  totalSubcategories: number
  totalMockOrders: number
  trendingCategories: number
  createdAt: string
}

export default function CategoriesSimplePage() {
  const [categoriesData, setCategoriesData] = useState<CategoriesData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load categories data
    fetch('/data/categories-data.json')
      .then(res => res.json())
      .then(data => {
        setCategoriesData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading categories:', err)
        setLoading(false)
      })
  }, [])

  const filteredCategories = categoriesData?.categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading categories...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Bell24h Categories
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Explore 50+ categories with verified suppliers and mock orders
          </p>
          
          {/* Stats */}
          {categoriesData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-center mb-2">
                  <Package className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{categoriesData.totalCategories}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{categoriesData.totalSubcategories}</div>
                <div className="text-sm text-gray-600">Subcategories</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-center mb-2">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{categoriesData.totalMockOrders}</div>
                <div className="text-sm text-gray-600">Mock Orders</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{categoriesData.trendingCategories}</div>
                <div className="text-sm text-gray-600">Trending</div>
              </div>
            </div>
          )}
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-2"
            >
              <Grid className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </div>

        {/* Categories Grid/List */}
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      {category.trending && (
                        <Badge className="bg-orange-100 text-orange-800 mt-1">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-2">{category.description}</p>
              </CardHeader>
              
              <CardContent>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{category.supplierCount.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Suppliers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{category.productCount.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{category.rfqCount.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">RFQs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{category.mockOrderCount.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Orders</div>
                  </div>
                </div>

                {/* Subcategories */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Subcategories:</h4>
                  <div className="flex flex-wrap gap-1">
                    {category.subcategories.slice(0, 4).map((sub, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {sub}
                      </Badge>
                    ))}
                    {category.subcategories.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{category.subcategories.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Mock Orders */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Orders:</h4>
                  <div className="space-y-2">
                    {category.mockOrders.map((order, idx) => (
                      <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="text-sm font-medium text-gray-900 truncate">{order.title}</h5>
                          <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{order.description}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-green-600">
                            {formatCurrency(order.value, order.currency)}
                          </span>
                          <span className="text-gray-500">
                            {order.buyer} → {order.supplier}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  )
}
