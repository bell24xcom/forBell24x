'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">Bell24h</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/rfq" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Browse RFQs
            </Link>
            <Link href="/rfq/create" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Post RFQ
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Categories
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              How It Works
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Single Login Button - No buyer/supplier confusion */}
            <Link href="/auth/login-otp">
              <Button variant="outline" className="font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Login
              </Button>
            </Link>

            <Link href="/auth/register">
              <Button className="bg-blue-600 hover:bg-blue-700 font-medium">
                Sign Up Free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col gap-4">
              <Link
                href="/rfq"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse RFQs
              </Link>
              <Link
                href="/rfq/create"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Post RFQ
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/how-it-works"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-2 mt-4 px-2">
                <Link href="/auth/login-otp" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full font-medium">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 font-medium">
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Search Bar (appears on all pages) */}
      <div className="hidden md:block bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-3">
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for products, suppliers, or RFQs..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
