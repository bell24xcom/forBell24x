'use client';

import { ArrowLeft, Home, Bell, FileText, Users, Settings, Search, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showDashboardButton?: boolean;
  customActions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  showHomeButton = true,
  showDashboardButton = true,
  customActions,
  className = '',
}) => {
  const router = useRouter();

  return (
    <div className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='flex items-center justify-between'>
          {/* Logo and Brand */}
          <Link href='/' className='flex items-center space-x-3 group'>
            <div className='flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors'>
              <Bell className='w-6 h-6 text-white' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors'>
                Bell24h
              </h1>
              <p className='text-xs text-gray-500'>AI-Powered B2B Marketplace</p>
            </div>
          </Link>

          {/* Navigation */}
          <div className='flex items-center space-x-2'>
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className='flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                aria-label='Go back'
              >
                <ArrowLeft className='w-4 h-4' />
                <span className='hidden sm:inline'>Back</span>
              </button>
            )}
            
            {showHomeButton && (
              <Link
                href='/'
                className='flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                aria-label='Go to home page'
              >
                <Home className='w-4 h-4' />
                <span className='hidden sm:inline'>Home</span>
              </Link>
            )}

            <Link
              href='/rfq'
              className='flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
              aria-label='Create RFQ'
            >
              <FileText className='w-4 h-4' />
              <span className='hidden sm:inline'>RFQ</span>
            </Link>

            <Link
              href='/suppliers'
              className='flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
              aria-label='Browse suppliers'
            >
              <Users className='w-4 h-4' />
              <span className='hidden sm:inline'>Suppliers</span>
            </Link>

            <Link
              href='/marketplace'
              className='flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
              aria-label='Browse marketplace'
            >
              <Search className='w-4 h-4' />
              <span className='hidden sm:inline'>Marketplace</span>
            </Link>

            {showDashboardButton && (
              <Link
                href='/dashboard'
                className='flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors'
                aria-label='Go to dashboard'
              >
                <Settings className='w-4 h-4' />
                <span className='hidden sm:inline'>Dashboard</span>
              </Link>
            )}

            {customActions}
          </div>
        </div>

        {/* Page Title and Subtitle */}
        {(title || subtitle) && (
          <div className='mt-4'>
            {title && (
              <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>{title}</h1>
            )}
            {subtitle && (
              <p className='mt-1 text-sm sm:text-base text-gray-600'>{subtitle}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
