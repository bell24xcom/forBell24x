'use client';

import React from 'react';

interface MinimalLayoutProps {
  children: React.ReactNode;
}

export default function MinimalLayout({ children }: MinimalLayoutProps) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}

