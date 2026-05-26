'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, Bell } from 'lucide-react';
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
      const stored = localStorage.getItem('bell24h_user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u && u.id) { setUser(u); setIsLoggedIn(true); }
        } catch {}
      }
    };

    // Listen for login/logout events from other tabs or the login page
    const onStorage = () => {
      const s = localStorage.getItem('bell24h_user');
      if (s) {
        try { const u = JSON.parse(s); if (u?.id) { setUser(u); setIsLoggedIn(true); } } catch {}
      } else {
        setUser(null); setIsLoggedIn(false);
      }
    };

    checkAuth();
    window.addEventListener('storage', onStorage);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
    setShowAuthModal(false);
    localStorage.setItem('bell24h_user', JSON.stringify(userData));
    router.push('/dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch { /* continue with client cleanup */ }

    // Clear all client-side auth state
    localStorage.removeItem('bell24h_user');
    localStorage.removeItem('user');
    sessionStorage.clear();

    // Aggressively clear cookie across all domain variants (fixes mobile Chrome)
    const exp = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = `auth-token=; ${exp}`;
    document.cookie = `auth-token=; ${exp} domain=bell24h.com;`;
    document.cookie = `auth-token=; ${exp} domain=.bell24h.com;`;
    document.cookie = `auth-token=; ${exp} domain=www.bell24h.com;`;

    setIsLoggedIn(false);
    setUser(null);

    // Hard redirect (not router.push) forces full reload on mobile
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
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
              {/* Nav Links — different for logged in vs logged out */}
              {isLoggedIn ? (
                <>
                  <Link href="/rfq/create" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Post RFQ</Link>
                  <Link href="/marketplace" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Marketplace</Link>
                  <Link href="/suppliers" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Suppliers</Link>
                </>
              ) : (
                <>
                  <Link href="/marketplace" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Marketplace</Link>
                  <Link href="/suppliers" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Suppliers</Link>
                  <Link href="/pricing" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Pricing</Link>
                </>
              )}

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
                <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Dashboard</Link>
                  <Link href="/notifications" className="relative text-slate-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Link>
                  <span className="text-slate-300 text-sm font-medium">{user?.name || user?.companyName || 'User'}</span>
                  <button onClick={handleLogout} className="text-slate-400 hover:text-white text-sm transition-colors">Logout</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/rfq/create"
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Post RFQ
                  </Link>
                  <button
                    onClick={handleLogin}
                    className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Login
                  </button>
                </div>
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

              <Link href="/marketplace" className="block text-slate-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Marketplace</Link>
              <Link href="/suppliers" className="block text-slate-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Suppliers</Link>
              {isLoggedIn ? (
                <>
                  <Link href="/rfq/create" className="block text-slate-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Post RFQ</Link>
                  <Link href="/dashboard" className="block text-slate-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left text-slate-300 hover:text-white transition-colors">
                    Logout ({user?.name || 'User'})
                  </button>
                </>
              ) : (
                <>
                  <Link href="/pricing" className="block text-slate-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                  <Link href="/rfq/create" className="block bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors text-center" onClick={() => setIsMenuOpen(false)}>Post RFQ</Link>
                  <button onClick={() => { handleLogin(); setIsMenuOpen(false); }} className="w-full border border-slate-600 text-slate-300 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    Login / Register
                  </button>
                </>
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
