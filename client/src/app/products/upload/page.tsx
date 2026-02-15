'use client';

import React from 'react';
import ProductUpload from '@/components/ProductUpload';
import { useRouter } from 'next/navigation';

export default function ProductUploadPage() {
  const router = useRouter();

  const handleUploadComplete = (productId: string) => {
    // Redirect to product showcase or dashboard
    router.push(`/products/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <ProductUpload onUploadComplete={handleUploadComplete} />
      </div>
    </div>
  );
}
