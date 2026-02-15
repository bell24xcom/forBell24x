'use client';


import Link from 'next/link';
import { useState } from 'react';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='md:hidden'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        data-testid='mobile-menu-btn'
        className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
      >
        {isOpen ? <span>❌</span> : <span>☰</span>}
      </button>

      {isOpen && (
        <div
          className='absolute top-16 left-0 right-0 bg-white shadow-lg border-t z-50'
          data-testid='mobile-menu'
        >
          <div className='px-4 py-6 space-y-4'>
            <Link
              href='/categories'
              className='block text-gray-600 hover:text-blue-600 font-medium'
            >
              Categories
            </Link>
            <Link
              href='/marketplace'
              className='block text-gray-600 hover:text-blue-600 font-medium'
            >
              Marketplace
            </Link>
            <Link href='/pricing' className='block text-gray-600 hover:text-blue-600 font-medium'>
              Pricing
            </Link>
            <Link
              href='/auth/login'
              className='block bg-blue-600 text-white px-4 py-2 rounded-lg text-center'
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
