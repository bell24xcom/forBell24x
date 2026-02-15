'use client';

import React from 'react';
import MinimalSidebar from './MinimalSidebar';
import MinimalHeader from './MinimalHeader';

interface MinimalLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
}

export default function MinimalLayout({
  children,
  title = 'Bell24H Enterprise Platform',
  showHeader = true,
}: MinimalLayoutProps) {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Fixed Left Sidebar - 240px width */}
      <MinimalSidebar />

      {/* Main Content Area - Offset by sidebar width */}
      <div className='lg:ml-60 min-h-screen'>
        {/* Optional Header */}
        {showHeader && <MinimalHeader title={title} />}

        {/* Page Content */}
        <main className='min-h-screen'>{children}</main>
      </div>
    </div>
  );
}
