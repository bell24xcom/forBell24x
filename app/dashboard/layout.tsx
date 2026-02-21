'use client';

import {
  Activity,
  BarChart3,
  Brain,
  FileBarChart,
  FileText,
  HelpCircle,
  Home,
  MessageCircle,
  Mic,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  Users,
  Video,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigationItems = [
  // Main
  { name: 'Dashboard', href: '/dashboard', icon: Home, category: 'main' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, category: 'main' },

  // RFQ & Quotes
  { name: 'Post RFQ', href: '/rfq/create', icon: FileText, category: 'rfq' },
  { name: 'My RFQs', href: '/dashboard/rfqs', icon: ShoppingCart, category: 'rfq' },
  { name: 'Quotes Received', href: '/dashboard/quotes', icon: Star, category: 'rfq' },
  { name: 'Suppliers', href: '/suppliers', icon: Users, category: 'rfq' },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageCircle, category: 'rfq' },

  // AI Features
  { name: 'Voice RFQ', href: '/voice-rfq', icon: Mic, category: 'ai' },
  { name: 'Video RFQ', href: '/video-rfq', icon: Video, category: 'ai' },
  { name: 'AI Matching', href: '/smart-matching', icon: Brain, category: 'ai' },
  { name: 'Negotiations', href: '/negotiation', icon: Activity, category: 'ai' },

  // Financial
  { name: 'Wallet', href: '/wallet', icon: Wallet, category: 'financial' },
  { name: 'Escrow', href: '/escrow', icon: Shield, category: 'financial' },
  { name: 'Reports', href: '/dashboard/reports', icon: FileBarChart, category: 'financial' },

  // Account
  { name: 'Profile', href: '/profile', icon: Settings, category: 'account' },
  { name: 'Help & Support', href: '/help', icon: HelpCircle, category: 'account' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const getCategoryItems = (category: string) => {
    return navigationItems.filter(item => item.category === category);
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname?.startsWith(href) || false;
  };

  return (
    <div className='min-h-screen bg-gray-50 flex'>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Sidebar Header */}
        <div className='flex items-center justify-between h-16 px-6 border-b border-gray-800'>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-gradient-to-r from-blue-600 to-amber-600 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>B24</span>
            </div>
            <span className='ml-2 text-xl font-bold text-gray-100'>Bell24H</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className='lg:hidden text-gray-400 hover:text-white'
          >
            <span>❌</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className='flex-1 overflow-y-auto py-4'>
          <nav className='px-3 space-y-6'>
            {[
              { key: 'main', label: 'Main' },
              { key: 'rfq', label: 'RFQ & Procurement' },
              { key: 'ai', label: 'AI Features' },
              { key: 'financial', label: 'Financial' },
              { key: 'account', label: 'Account' },
            ].map(section => (
              <div key={section.key}>
                <h3 className='px-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2'>
                  {section.label}
                </h3>
                <div className='space-y-1'>
                  {getCategoryItems(section.key).map(item => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive(item.href)
                            ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className='mr-3 flex-shrink-0 h-4 w-4' />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className='border-t border-gray-800 p-4'>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center'>
              <span>👤</span>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-white'>Enterprise User</p>
              <p className='text-xs text-gray-400'>Pro Plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Top Header */}
        <header className='bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6'>
          <button
            onClick={() => setSidebarOpen(true)}
            className='lg:hidden text-gray-500 hover:text-gray-700'
          >
            <span>☰</span>
          </button>

          <div className='flex-1 flex justify-center lg:justify-start'>
            <h1 className='text-lg font-semibold text-gray-900'>
              {navigationItems.find(item => item.href === pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className='flex items-center space-x-4'>
            <button className='text-gray-500 hover:text-gray-700'>
              <span>🔔</span>
            </button>
            <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
              <span>👤</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className='flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6'>{children}</main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
