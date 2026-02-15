'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Menu, 
  X, 
  User, 
  Wallet, 
  Settings,
  LogOut,
  Shield,
  Crown
} from 'lucide-react';

interface EnterpriseHeaderProps {
  title?: string;
  showUserMenu?: boolean;
}

export default function EnterpriseHeader({ title, showUserMenu = true }: EnterpriseHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  Bell24h
                </div>
                <div className="text-xs text-gray-500 -mt-1">
                  B2B Operating System
                </div>
              </div>
            </Link>
            
            {title && (
              <div className="hidden md:block">
                <div className="h-6 w-px bg-gray-300 mx-4" />
                <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/suppliers" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Suppliers
            </Link>
            <Link href="/rfq" className="text-gray-600 hover:text-indigo-600 transition-colors">
              RFQ
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-indigo-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* User Menu & Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Trust Badges */}
            <div className="hidden lg:flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                <Shield className="h-3 w-3" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                <Crown className="h-3 w-3" />
                <span>Verified</span>
              </div>
            </div>

            {/* User Menu */}
            {showUserMenu && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </Button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    <Link href="/dashboard/wallet" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Wallet className="h-4 w-4 mr-2" />
                      Wallet
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Login/Register Buttons */}
            <div className="flex items-center space-x-2">
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth/landing">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              <Link href="/suppliers" className="px-4 py-2 text-gray-600 hover:text-indigo-600">
                Suppliers
              </Link>
              <Link href="/rfq" className="px-4 py-2 text-gray-600 hover:text-indigo-600">
                RFQ
              </Link>
              <Link href="/pricing" className="px-4 py-2 text-gray-600 hover:text-indigo-600">
                Pricing
              </Link>
              <Link href="/about" className="px-4 py-2 text-gray-600 hover:text-indigo-600">
                About
              </Link>
              <Link href="/contact" className="px-4 py-2 text-gray-600 hover:text-indigo-600">
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
