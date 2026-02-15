'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  User, 
  ShoppingCart,
  BarChart3,
  Grid3X3,
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
  Shield,
  Scale
} from 'lucide-react'

export function EnhancedNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigationItems = [
    { name: 'Home', href: '/', icon: null },
    { name: 'Business Categories', href: '/business-categories', icon: Grid3X3 },
    { name: 'Categories', href: '/categories', icon: Grid3X3 },
    { name: 'Categories Dashboard', href: '/categories-dashboard', icon: BarChart3 },
    { name: 'RFQs', href: '/rfqs', icon: FileText },
    { name: 'Negotiations', href: '/negotiation', icon: MessageSquare },
    { name: 'Suppliers', href: '/suppliers', icon: Users },
    { name: 'Trading', href: '/trading', icon: TrendingUp },
    { name: 'Registration', href: '/registration', icon: Building2 },
  ]

  const legalPages = [
    { name: 'Terms of Service', href: '/legal/terms-of-service', icon: Scale },
    { name: 'Privacy Policy', href: '/legal/privacy-policy', icon: Shield },
    { name: 'Pricing Policy', href: '/legal/pricing-policy', icon: null },
    { name: 'Shipping Policy', href: '/legal/shipping-policy', icon: null },
    { name: 'Refund Policy', href: '/legal/cancellation-refund-policy', icon: null },
    { name: 'Escrow Services', href: '/legal/escrow-services', icon: Shield },
    { name: 'MSME Escrow Application', href: '/legal/msme-escrow-application', icon: Building2 },
    { name: 'MSME Registration', href: '/legal/msme-registration', icon: Building2 },
    { name: 'URD Information', href: '/legal/urd-information', icon: Building2 },
  ]

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Bell24h</span>
                <span className="text-xs text-gray-500 block">Verified B2B Platform</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors"
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.name}</span>
                {item.name === 'Categories Dashboard' && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                    New
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700">
              <User className="w-4 h-4 mr-2" />
              Login
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                  {item.name === 'Categories Dashboard' && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                      New
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
            <div className="px-2 pt-2 pb-3 border-t">
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default EnhancedNavigation
