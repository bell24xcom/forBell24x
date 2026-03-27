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
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Categories', href: '/categories', icon: Square }, // PRESERVE
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Wallet & Payments', href: '/dashboard/wallet', icon: Wallet },
  { name: 'RFQ Management', href: '/dashboard/rfq', icon: FileText },
  { name: 'AI Matching', href: '/dashboard/ai-matching', icon: Brain },
  { name: 'Voice RFQ', href: '/dashboard/voice-rfq', icon: Mic },
  { name: 'Video RFQ', href: '/dashboard/video-rfq', icon: Video },
  { name: 'Predictive Analytics', href: '/dashboard/predictive-analytics', icon: BarChart3 },
  { name: 'Supplier Risk', href: '/dashboard/supplier-risk', icon: Shield },
  { name: 'Logistics Tracking', href: '/dashboard/logistics', icon: Truck },
  { name: 'Supplier Showcase', href: '/dashboard/showcase', icon: Star },
  { name: 'Reports & Analytics', href: '/dashboard/reports', icon: FileBarChart },
  { name: 'Business Planning', href: '/dashboard/planning', icon: TrendingUp },
  { name: 'AI Chatbot', href: '/dashboard/chatbot', icon: MessageCircle },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help & Support', href: '/dashboard/help', icon: HelpCircle },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className='min-h-screen bg-gray-50 flex'>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0 flex-shrink-0`}
      >
        {/* Sidebar Header */}
        <div className='flex items-center justify-between h-16 px-6 border-b border-gray-200'>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-gradient-to-r from-blue-600 to-amber-600 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>B24</span>
            </div>
            <span className='ml-2 text-xl font-bold text-gray-900'>Bell24H</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className='lg:hidden text-gray-500 hover:text-gray-700'
          >
            <span>❌</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className='mt-6 px-3'>
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className='w-5 h-5 mr-3' />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className='absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200'>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center'>
              <span>👤</span>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-900'>Enterprise User</p>
              <p className='text-xs text-gray-500'>Pro Plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden min-w-0'>
        {/* Top Header */}
        <header className='bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 flex-shrink-0'>
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
        <main className='flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6 w-full'>{children}</main>
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
