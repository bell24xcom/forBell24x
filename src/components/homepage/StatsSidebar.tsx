'use client';

import { TrendingUp, Users, ShoppingCart, MapPin, Star } from 'lucide-react';
import Link from 'next/link';

export default function StatsSidebar() {
  const stats = [
    {
      icon: Users,
      value: '10,000+',
      label: 'Verified Suppliers',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: ShoppingCart,
      value: '₹500Cr+',
      label: 'Transaction Value',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: TrendingUp,
      value: '2,500+',
      label: 'Active RFQs',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: MapPin,
      value: '100+',
      label: 'Cities',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const topSuppliers = [
    { name: 'ABC Steel Works', rating: 4.9, category: 'Steel & Metals' },
    { name: 'XYZ Textiles Ltd', rating: 4.8, category: 'Textiles' },
    { name: 'DEF Electronics', rating: 4.9, category: 'Electronics' },
    { name: 'GHI Chemicals', rating: 4.7, category: 'Chemicals' },
  ];

  return (
    <aside className="space-y-6">
      {/* Quick Stats */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Quick Stats
        </h3>
        <div className="space-y-3">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${stat.bgColor} rounded-lg p-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-sm text-gray-600">{stat.label}</span>
                </div>
                <span className={`font-bold text-lg ${stat.color}`}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Suppliers */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Top Suppliers</h3>
        <div className="space-y-3">
          {topSuppliers.map((supplier, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition">
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">{supplier.name}</div>
                <div className="text-xs text-gray-500">{supplier.category}</div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-gray-700">{supplier.rating}</span>
              </div>
            </div>
          ))}
        </div>
        <Link href="/suppliers" className="block text-center text-sm text-blue-600 hover:text-blue-700 mt-4 font-medium">
          View All Suppliers →
        </Link>
      </div>

      {/* Featured Categories */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Featured Categories</h3>
        <div className="space-y-2">
          <Link href="/categories/steel-metals" className="block p-2 hover:bg-gray-50 rounded-lg transition text-sm">
            🏭 Steel & Metals
          </Link>
          <Link href="/categories/electronics" className="block p-2 hover:bg-gray-50 rounded-lg transition text-sm">
            ⚡ Electronics
          </Link>
          <Link href="/categories/textiles" className="block p-2 hover:bg-gray-50 rounded-lg transition text-sm">
            👕 Textiles
          </Link>
          <Link href="/categories/chemicals" className="block p-2 hover:bg-gray-50 rounded-lg transition text-sm">
            🧪 Chemicals
          </Link>
        </div>
        <Link href="/categories" className="block text-center text-sm text-blue-600 hover:text-blue-700 mt-4 font-medium">
          View All Categories →
        </Link>
      </div>
    </aside>
  );
}

