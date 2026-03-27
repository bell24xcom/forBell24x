'use client';

import React, { useState, useEffect } from 'react';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';
import ProductShowcaseGrid from '@/components/suppliers/ProductShowcaseGrid';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function ProductShowcasePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [supplierId] = useState('current-supplier-id'); // TODO: Get from auth context
  const [isOwner] = useState(true); // TODO: Check from auth context

  useEffect(() => {
    // TODO: Fetch products from API
    // Use existing API: /api/supplier/products
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/supplier/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading products...</div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Showcase</h1>
            <p className="text-gray-600 mt-1">Manage and showcase your products to buyers</p>
          </div>
          <Link
            href="/supplier/products/manage"
            className="flex items-center gap-2 px-4 py-2 bg-[#0070f3] text-white rounded-lg hover:bg-[#0051cc] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>

        {/* Use existing ProductShowcaseGrid component */}
        <ProductShowcaseGrid
          products={products}
          supplierId={supplierId}
          isOwner={isOwner}
          categoryPlaceholder="Product"
        />
      </div>
    </UserDashboardLayout>
  );
}

