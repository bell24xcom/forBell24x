'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from '@/components/EmergencySessionProvider';

interface MinimalHeaderProps {
  className?: string;
}

export default function MinimalHeader({ className = '' }: MinimalHeaderProps) {
  const { data: session, status } = () => ({ data: { user: { id: "user", email: "user@company.com", name: "Business User" } }, status: "authenticated" });
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileDropdownOpen(false);
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <div className='flex items-center justify-between h-16 px-6'>
        {/* Left Section - Logo for Mobile */}
        <div className='flex items-center lg:hidden'>
          <Link href='/' className='flex items-center space-x-2'>
            <div className='w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>🔔</span>
            </div>
            <span className='text-lg font-semibold text-gray-900'>Bell24H</span>
          </Link>
        </div>

        {/* Center Section - Search */}
        <div className='flex-1 max-w-lg mx-4'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <span>🔍</span>
            </div>
            <input
              type='text'
              placeholder='Search products, suppliers, RFQs...'
              className='block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
            />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className='flex items-center space-x-4'>
          {/* System Status */}
          <div className='hidden md:flex items-center space-x-2 text-sm text-gray-600'>
            <span>📊</span>
            <span>Online</span>
          </div>

          {/* Notifications */}
          <div className='relative'>
            <button
              onClick={toggleNotifications}
              className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
            >
              <span>🔔</span>
              <span className='absolute top-1 right-1 h-2 w-2 bg-blue-600 rounded-full'></span>
            </button>

            {isNotificationsOpen && (
              <div className='absolute right-0 mt-2 w-80 bg-white rounded-md shadow-sm border border-gray-200 z-50'>
                <div className='p-4 border-b border-gray-100'>
                  <h3 className='text-sm font-medium text-gray-900'>Notifications</h3>
                </div>
                <div className='max-h-64 overflow-y-auto'>
                  <div className='p-4 hover:bg-gray-50 border-b border-gray-100'>
                    <div className='text-sm text-gray-900 font-medium'>New RFQ Received</div>
                    <div className='text-xs text-gray-500 mt-1'>
                      Industrial equipment inquiry from Tata Steel
                    </div>
                    <div className='text-xs text-gray-400 mt-1'>2 minutes ago</div>
                  </div>
                  <div className='p-4 hover:bg-gray-50 border-b border-gray-100'>
                    <div className='text-sm text-gray-900 font-medium'>Trading Alert</div>
                    <div className='text-xs text-gray-500 mt-1'>Steel prices increased by 3.2%</div>
                    <div className='text-xs text-gray-400 mt-1'>15 minutes ago</div>
                  </div>
                  <div className='p-4 hover:bg-gray-50'>
                    <div className='text-sm text-gray-900 font-medium'>ESG Report Ready</div>
                    <div className='text-xs text-gray-500 mt-1'>
                      Monthly sustainability report available
                    </div>
                    <div className='text-xs text-gray-400 mt-1'>1 hour ago</div>
                  </div>
                </div>
                <div className='p-3 border-t border-gray-100'>
                  <Link
                    href='/notifications'
                    className='text-sm text-blue-600 hover:text-blue-700 font-medium'
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className='relative'>
            {status === 'loading' ? (
              <div className='w-8 h-8 bg-gray-200 rounded-full animate-pulse'></div>
            ) : session ? (
              <button
                onClick={toggleProfileDropdown}
                className='flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors'
              >
                <div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center'>
                  <span>👤</span>
                </div>
                <div className='hidden md:block text-left'>
                  <div className='text-sm font-medium text-gray-900'>
                    {session?.user?.name || 'User'}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {session?.user?.email || 'user@bell24h.com'}
                  </div>
                </div>
                <ChevronDown className='h-4 w-4 text-gray-400' />
              </button>
            ) : (
              <Link
                href='/auth/signin'
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm'
              >
                Sign In
              </Link>
            )}

            {isProfileDropdownOpen && session && (
              <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-sm border border-gray-200 z-50'>
                <div className='py-1'>
                  <Link
                    href='/profile'
                    className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                  >
                    <span>👤</span>
                    Profile
                  </Link>
                  <Link
                    href='/settings'
                    className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                  >
                    <span>⚙️</span>
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                  >
                    <span>🚪</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(isProfileDropdownOpen || isNotificationsOpen) && (
        <div
          className='fixed inset-0 z-30'
          onClick={() => {
            setIsProfileDropdownOpen(false);
            setIsNotificationsOpen(false);
          }}
        />
      )}
    </header>
  );
}
