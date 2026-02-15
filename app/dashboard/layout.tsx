'use client';

import {
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
  Square,
  Star,
  TrendingUp,
  Truck,
  Video,
  Wallet,
  CreditCard,
  Users,
  ShoppingCart,
  Leaf,
  Building2,
  DollarSign,
  PieChart,
  Activity,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigationItems = [
  // Main Navigation
  { name: 'Dashboard', href: '/dashboard', icon: Home, category: 'main' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, category: 'main' },
  { name: 'Procurement', href: '/dashboard/procurement', icon: ShoppingCart, category: 'main' },
  
  // Financial Services
  { name: 'Wallet & Payments', href: '/wallet', icon: Wallet, category: 'financial' },
  { name: 'Escrow Services', href: '/escrow', icon: Shield, category: 'financial' },
  { name: 'Dynamic Pricing', href: '/pricing', icon: DollarSign, category: 'financial' },
  
  // AI Features
  { name: 'AI Smart Matching', href: '/smart-matching', icon: Brain, category: 'ai' },
  { name: 'Voice RFQ', href: '/voice-rfq', icon: Mic, category: 'ai' },
  { name: 'Video RFQ', href: '/video-rfq', icon: Video, category: 'ai' },
  { name: 'AI Negotiations', href: '/negotiation', icon: MessageCircle, category: 'ai' },
  
  // Business Features
  { name: 'RFQ Management', href: '/rfq', icon: FileText, category: 'business' },
  { name: 'Supplier Showcase', href: '/suppliers', icon: Users, category: 'business' },
  { name: 'Products', href: '/products', icon: Square, category: 'business' },
  { name: 'Trading Platform', href: '/trading', icon: Building2, category: 'business' },
  { name: 'Logistics Hub', href: '/logistics', icon: Truck, category: 'business' },
  { name: 'ESG Dashboard', href: '/esg', icon: Leaf, category: 'business' },
  
  // Analytics & Reports
  { name: 'Predictive Analytics', href: '/dashboard/predictive-analytics', icon: TrendingUp, category: 'analytics' },
  { name: 'Supplier Risk', href: '/dashboard/supplier-risk', icon: Shield, category: 'analytics' },
  { name: 'Reports & Analytics', href: '/dashboard/reports', icon: FileBarChart, category: 'analytics' },
  { name: 'Business Planning', href: '/dashboard/planning', icon: PieChart, category: 'analytics' },
  
  // System
  { name: 'AI Chatbot', href: '/dashboard/chatbot', icon: MessageCircle, category: 'system' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, category: 'system' },
  { name: 'Help & Support', href: '/dashboard/help', icon: HelpCircle, category: 'system' },
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
            {/* Main Navigation */}
            <div>
              <h3 className='px-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2'>
                Main
              </h3>
              <div className='space-y-1'>
                {getCategoryItems('main').map(item => {
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

            {/* Financial Services */}
            <div>
              <h3 className='px-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2'>
                Financial Services
              </h3>
              <div className='space-y-1'>
                {getCategoryItems('financial').map(item => {
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

            {/* AI Features */}
            <div>
              <h3 className='px-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2'>
                AI Features
              </h3>
              <div className='space-y-1'>
                {getCategoryItems('ai').map(item => {
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

            {/* Business Features */}
            <div>
              <h3 className='px-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2'>
                Business
              </h3>
              <div className='space-y-1'>
                {getCategoryItems('business').map(item => {
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

            {/* Analytics */}
            <div>
              <h3 className='px-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2'>
                Analytics
              </h3>
              <div className='space-y-1'>
                {getCategoryItems('analytics').map(item => {
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

            {/* System */}
            <div>
              <h3 className='px-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2'>
                System
              </h3>
              <div className='space-y-1'>
                {getCategoryItems('system').map(item => {
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
