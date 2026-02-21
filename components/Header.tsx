'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import EnhancedAuthModal from './EnhancedAuthModal';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      }
    };

    checkAuth();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
    setShowAuthModal(false);
    localStorage.setItem('authToken', 'mock_jwt_token_' + Date.now());
    localStorage.setItem('userData', JSON.stringify(userData));
    router.push('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/categories?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 bg-[#0F172A] transition-all duration-300 ${
          isScrolled ? 'border-b border-slate-800 shadow-lg shadow-black/20' : 'border-b border-slate-800/50'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold text-white">BELL</span>
                <span className="text-lg font-bold text-blue-400">24H</span>
              </div>
            </Link>

            {/* Desktop: Nav + Search + Auth */}
            <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
              {/* Nav Links */}
              <Link
                href="/suppliers"
                className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
              >
                Suppliers
              </Link>
              <Link
                href="/categories"
                className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
              >
                Browse
              </Link>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 450+ categories..."
                  className="w-56 lg:w-72 h-9 pl-9 pr-3 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </form>

              {/* Auth */}
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">
                    {user?.name || 'User'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Login / Register
                </button>
              )}
            </div>

            {/* Mobile: Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-slate-800 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 450+ categories..."
                  className="w-full h-10 pl-9 pr-3 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </form>

              <Link
                href="/suppliers"
                className="block text-slate-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Suppliers
              </Link>
              <Link
                href="/categories"
                className="block text-slate-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Categories
              </Link>

              {isLoggedIn ? (
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-full text-left text-slate-300 hover:text-white transition-colors"
                >
                  Logout ({user?.name || 'User'})
                </button>
              ) : (
                <button
                  onClick={() => { handleLogin(); setIsMenuOpen(false); }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                  Login / Register
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      <EnhancedAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
