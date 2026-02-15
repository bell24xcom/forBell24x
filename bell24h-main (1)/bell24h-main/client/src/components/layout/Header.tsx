'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Search, Bell } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Only check auth on client side after mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        // Check for auth token
        const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
        const demoMode = localStorage.getItem('demoMode');
        
        if (token) {
          setIsAuthenticated(true);
          if (demoMode === 'true' || token.startsWith('demo_auth_token_')) {
            setUser({
              name: 'Demo User',
              email: 'demo@bell24h.com',
            });
          } else {
            setUser({
              name: 'User',
            });
          }
        }
      } catch (error) {
        // Silently fail - user is not authenticated
        setIsAuthenticated(false);
        setUser(null);
      }
    }
  }, []);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('demoMode');
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a1128]/95 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">B</span>
            </div>
            <span className="text-2xl font-black tracking-tight">
              Bell<span className="text-cyan-400">24H</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link href="/rfq/demo/all" className="text-gray-300 hover:text-cyan-400 transition font-medium">
              Demo RFQs
            </Link>
            <Link href="/rfq/create" className="text-gray-300 hover:text-cyan-400 transition font-medium">
              Post RFQ
            </Link>
            <Link href="/rfq" className="text-gray-300 hover:text-cyan-400 transition font-medium">
              Browse RFQs
            </Link>
            <Link href="/suppliers" className="text-gray-300 hover:text-cyan-400 transition font-medium">
              Suppliers
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-300" />
            </button>

            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {mounted && isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-300 text-sm">{user?.name || 'User'}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login-otp"
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-bold hover:scale-105 transition shadow-lg"
              >
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/rfq/demo/all"
                className="text-gray-300 hover:text-white transition px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Demo RFQs
              </Link>
              <Link
                href="/rfq/create"
                className="text-gray-300 hover:text-white transition px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Post RFQ
              </Link>
              <Link
                href="/rfq"
                className="text-gray-300 hover:text-white transition px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse RFQs
              </Link>
              <Link
                href="/suppliers"
                className="text-gray-300 hover:text-white transition px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Suppliers
              </Link>
              <div className="flex flex-col space-y-2 mt-4 px-2">
                {mounted && isAuthenticated ? (
                  <>
                    <span className="text-gray-300 text-sm py-2">{user?.name || 'User'}</span>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login-otp"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
