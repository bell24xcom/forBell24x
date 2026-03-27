'use client';

import React from 'react';
<<<<<<< HEAD
import MinimalSidebar from '../MinimalSidebar';
import MinimalHeader from '../MinimalHeader';

interface MinimalLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function MinimalLayout({ children, className = '' }: MinimalLayoutProps) {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Sidebar */}
      <MinimalSidebar />

      {/* Main Content Area */}
      <div className='lg:ml-60'>
        {/* Header */}
        <MinimalHeader />

        {/* Page Content */}
        <main className={`p-6 ${className}`}>{children}</main>
      </div>
    </div>
  );
}
=======

interface MinimalLayoutProps {
  children: React.ReactNode;
}

export default function MinimalLayout({ children }: MinimalLayoutProps) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
