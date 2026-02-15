'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface GlobalNavigationProps {
  showBackButton?: boolean;
  backUrl?: string;
  backText?: string;
}

export default function GlobalNavigation({
  showBackButton = true,
  backUrl = '/',
  backText = 'Back to Home',
}: GlobalNavigationProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <nav className='bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center space-x-4'>
            {showBackButton && !isHomePage && (
              <Link
                href={backUrl}
                className='flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors'
              >
                <span>←</span>
                <span className='text-sm font-medium'>{backText}</span>
              </Link>
            )}

            <div className={showBackButton && !isHomePage ? 'border-l border-gray-300 pl-4' : ''}>
              <Link
                href='/'
                className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all'
                data-testid='bell24h-logo'
              >
                BELL24H
              </Link>
            </div>
          </div>

          <div className='flex items-center space-x-6'>
            <Link
              href='/categories'
              className='text-gray-600 hover:text-blue-600 font-medium text-sm'
              data-testid='categories-nav-link'
            >
              Categories
            </Link>
            <Link
              href='/suppliers'
              className='text-gray-600 hover:text-blue-600 font-medium text-sm'
              data-testid='suppliers-nav-link'
            >
              Suppliers
            </Link>
            <Link
              href='/traffic'
              className='text-gray-600 hover:text-blue-600 font-medium text-sm'
              data-testid='traffic-nav-link'
            >
              Traffic
            </Link>
            <Link
              href='/pricing'
              className='text-gray-600 hover:text-blue-600 font-medium text-sm'
              data-testid='pricing-nav-link'
            >
              Pricing
            </Link>
            <Link
              href='/contact'
              className='bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700'
              data-testid='contact-sales-nav-link'
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
