import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories - Bell24H B2B Marketplace',
  description:
    'Browse professional B2B categories with 500K+ suppliers across all major industries. Find electronics, textiles, machinery, chemicals, automotive parts and more.',
  keywords:
    'B2B categories, suppliers, electronics, textiles, machinery, chemicals, automotive, construction, medical equipment',
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>{children}</div>;
}
