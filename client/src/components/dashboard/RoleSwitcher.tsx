'use client';

import React from 'react';
import { useRole } from '@/contexts/RoleContext';
import { ShoppingCart, Store } from 'lucide-react';

export default function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="bg-white rounded-lg p-1 border border-gray-200 shadow-sm mb-4">
      <div className="flex gap-1">
        <button
          onClick={() => setRole('buyer')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
            role === 'buyer'
              ? 'bg-[#0070f3] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="font-medium text-sm">Buyer</span>
        </button>
        <button
          onClick={() => setRole('supplier')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
            role === 'supplier'
              ? 'bg-[#0070f3] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Store className="w-4 h-4" />
          <span className="font-medium text-sm">Supplier</span>
        </button>
      </div>
    </div>
  );
}

