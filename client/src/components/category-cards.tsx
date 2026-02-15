'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, FileText, ArrowRight } from 'lucide-react'

interface CategoryCardProps {
  category: {
    id: string
    name: string
    icon: string
    description: string
    supplierCount: string
    subcategories: string[]
    trending?: boolean
    rfqCount?: number
    productCount?: number
  }
  showStats?: boolean
  compact?: boolean
}

export function CategoryCard({ category, showStats = true, compact = false }: CategoryCardProps) {
  const formatNumber = (num: string | number) => {
    if (typeof num === 'number') {
      return num.toLocaleString()
    }
    return num
  }

  return (
    <Link href={`/categories/${category.id}`} className="group">
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
                  <Badge variant="secondary" className="mt-1 bg-emerald-100 text-emerald-700 border-emerald-200">
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
          {!compact && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {category.description}
            </p>
          )}
          
          {showStats && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Suppliers</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatNumber(category.supplierCount)}
                </span>
              </div>
              
              {category.rfqCount && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Active RFQs</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(category.rfqCount)}
                  </span>
                </div>
              )}
              
              {category.productCount && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span>Products</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(category.productCount)}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {!compact && category.subcategories.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Popular subcategories:</p>
              <div className="flex flex-wrap gap-1">
                {category.subcategories.slice(0, 3).map((subcategory, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {subcategory}
                  </Badge>
                ))}
                {category.subcategories.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{category.subcategories.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

interface CategoryGridProps {
  categories: CategoryCardProps['category'][]
  showStats?: boolean
  compact?: boolean
  columns?: 2 | 3 | 4 | 5 | 6
  maxItems?: number
}

export function CategoryGrid({ 
  categories, 
  showStats = true, 
  compact = false, 
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
        <CategoryCard
          key={category.id}
          category={category}
          showStats={showStats}
          compact={compact}
        />
      ))}
    </div>
  )
}

interface TrendingCategoriesProps {
  categories: CategoryCardProps['category'][]
  title?: string
  subtitle?: string
}

export function TrendingCategories({ 
  categories, 
  title = "Trending Categories",
  subtitle = "Most popular categories with active RFQs"
}: TrendingCategoriesProps) {
  const trendingCategories = categories.filter(cat => cat.trending)
  
  return (
    <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        <CategoryGrid 
          categories={trendingCategories} 
          showStats={true}
          compact={false}
          columns={4}
        />
        
        <div className="text-center mt-12">
          <Link 
            href="/categories"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 transition-all duration-300"
          >
            View All Categories
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CategoryCard
