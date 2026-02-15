'use client';

import {
  BarChart3,
  Brain,
  Building2,
  FileText,
  Leaf,
  Mic,
  Settings,
  Shield,
  ShoppingCart,
  TrendingUp,
  Truck,
  User,
  Video,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  category?: 'main' | 'enterprise' | 'system';
}

const sidebarItems: SidebarItem[] = [
  // Main Navigation
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: BarChart3, category: 'main' },
  {
    id: 'procurement',
    label: 'Procurement',
    href: '/procurement',
    icon: ShoppingCart,
    category: 'main',
  },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: TrendingUp, category: 'main' },

  // Enterprise Features
  { id: 'voice-rfq', label: 'Voice RFQ', href: '/voice-rfq', icon: Mic, category: 'enterprise' },
  { id: 'video-rfq', label: 'Video RFQ', href: '/video-rfq', icon: Video, category: 'enterprise' },
  {
    id: 'smart-matching',
    label: 'Smart Matching',
    href: '/smart-matching',
    icon: Brain,
    category: 'enterprise',
  },
  {
    id: 'trading',
    label: 'Trading Platform',
    href: '/trading',
    icon: Building2,
    category: 'enterprise',
  },
  { id: 'esg', label: 'ESG Dashboard', href: '/esg', icon: Leaf, category: 'enterprise' },
  { id: 'escrow', label: 'Escrow Services', href: '/escrow', icon: Shield, category: 'enterprise' },
  {
    id: 'wallet',
    label: 'Wallet Management',
    href: '/finance',
    icon: Wallet,
    category: 'enterprise',
  },
  {
    id: 'logistics',
    label: 'Logistics Hub',
    href: '/logistics',
    icon: Truck,
    category: 'enterprise',
  },

  // System Features
  { id: 'reports', label: 'Reports', href: '/reports', icon: FileText, category: 'system' },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings, category: 'system' },
  { id: 'profile', label: 'Profile', href: '/profile', icon: User, category: 'system' },
];

interface MinimalSidebarProps {
  className?: string;
}

export default function MinimalSidebar({ className = '' }: MinimalSidebarProps) {
  const pathname = usePathname();
  const {
    data: session,
  } = () => ({
    data: { user: { id: 'user', email: 'user@company.com', name: 'Business User' } },
    status: 'authenticated',
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname?.startsWith(href) || false;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className='h-full bg-gray-900 text-white flex flex-col'>
      {/* Header Section - No duplicate logo */}
      <div className='flex-shrink-0 p-4 border-b border-gray-800'>
        <div className='flex items-center justify-center'>
          <span className='text-lg font-semibold text-gray-300'>Dashboard</span>
        </div>
      </div>

      {/* **FIXED: Scrollable Navigation Container** */}
      <div className='flex-1 overflow-y-auto'>
        <nav className='px-2 py-4 space-y-6'>
          {/* Main Navigation */}
          <div>
            <h3 className='px-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2'>
              Main
            </h3>
            <div className='space-y-1'>
              {sidebarItems
                .filter(item => item.category === 'main')
                .map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className='mr-3 flex-shrink-0 h-4 w-4' />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* Enterprise Features */}
          <div>
            <h3 className='px-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2'>
              Enterprise
            </h3>
            <div className='space-y-1'>
              {sidebarItems
                .filter(item => item.category === 'enterprise')
                .map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className='mr-3 flex-shrink-0 h-4 w-4' />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* System Features */}
          <div>
            <h3 className='px-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2'>
              System
            </h3>
            <div className='space-y-1'>
              {sidebarItems
                .filter(item => item.category === 'system')
                .map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className='mr-3 flex-shrink-0 h-4 w-4' />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          </div>
        </nav>
      </div>

      {/* **ENHANCED: User Section & Logout - Fixed at bottom** */}
      <div className='flex-shrink-0 border-t border-gray-800'>
        {/* User Profile Section */}
        <div className='p-3 border-b border-gray-800'>
          <div className='flex items-center space-x-3'>
            <div className='w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center'>
              <span>👤</span>
            </div>
            <div className='flex-1 min-w-0'>
              <div className='text-sm font-medium text-white truncate'>
                {session?.user?.name || 'Business User'}
              </div>
              <div className='text-xs text-gray-400 truncate'>
                {session?.user?.email || 'user@company.com'}
              </div>
            </div>
          </div>
        </div>

        {/* **FIXED: Logout Button** */}
        <div className='p-3'>
          <button
            onClick={handleSignOut}
            className='w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors'
          >
            <span>🚪</span>
            Sign Out
          </button>
        </div>

        {/* Platform Version */}
        <div className='p-3 border-t border-gray-800'>
          <div className='text-xs text-gray-400'>
            <div className='font-medium'>Enterprise Platform</div>
            <div>v2.1.0</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className='lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md shadow-sm'
      >
        {isMobileMenuOpen ? <span>❌</span> : <span>☰</span>}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className='lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75'
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block fixed inset-y-0 left-0 w-60 ${className}`}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-60 z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
}
