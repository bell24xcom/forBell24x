'use client';

import React from 'react';

interface MinimalHeaderProps {
  title?: string;
}

export default function MinimalHeader({ title = 'Bell24H Platform' }: MinimalHeaderProps) {
  return (
    <header className='bg-white border-b border-gray-200'>
      <div className='px-6 py-4'>
        <div className='flex items-center justify-between'>
          {/* Page Title */}
          <div>
            <h1 className='text-2xl font-semibold text-gray-900'>{title}</h1>
          </div>

          {/* Header Actions */}
          <div className='flex items-center space-x-4'>
            {/* Search */}
            <div className='relative'>
              <span>??</span>
              <input
                type='text'
                placeholder='Search...'
                className='pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            {/* Notifications */}
            <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
              <span>??</span>
            </button>

            {/* User Menu */}
            <button className='flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 transition-colors'>
              <span>??</span>
              <span className='text-sm font-medium'>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
