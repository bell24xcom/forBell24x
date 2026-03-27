'use client';
import { Search, Bell, User, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function HeaderSearchCompact() {
  const { isAuthenticated, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-[#0a1128] border-b border-cyan-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🔔</span>
            </div>
            <span className="text-white font-bold text-lg">Bell24h</span>
          </Link>

          {/* Search Bar - Compact */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search suppliers, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1a2332] border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation & Auth */}
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/suppliers" className="text-gray-300 hover:text-white text-sm transition-colors">
                Suppliers
              </Link>
              <Link href="/categories" className="text-gray-300 hover:text-white text-sm transition-colors">
                Categories
              </Link>
              <Link href="/rfq" className="text-gray-300 hover:text-white text-sm transition-colors">
                RFQ
              </Link>
            </nav>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <button className="text-gray-300 hover:text-white relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </button>
                <Link href="/dashboard" className="flex items-center space-x-2 text-gray-300 hover:text-white">
                  <User className="h-5 w-5" />
                  <span className="text-sm">{user?.firstName || 'User'}</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login" className="text-gray-300 hover:text-white text-sm">
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-blue-600 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-cyan-500/20 py-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/suppliers" className="text-gray-300 hover:text-white text-sm" onClick={() => setIsMenuOpen(false)}>
                Suppliers
              </Link>
              <Link href="/categories" className="text-gray-300 hover:text-white text-sm" onClick={() => setIsMenuOpen(false)}>
                Categories
              </Link>
              <Link href="/rfq" className="text-gray-300 hover:text-white text-sm" onClick={() => setIsMenuOpen(false)}>
                RFQ
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}