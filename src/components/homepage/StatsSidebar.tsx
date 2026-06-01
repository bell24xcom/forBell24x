'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  suppliers: number;
  rfqs: number;
  categories: number;
}

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n);

export default function StatsSidebar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => {
        if (d.success) setStats(d.stats);
      })
      .catch(() => {});
  }, []);

  const items = [
    { icon: Users,        value: stats ? fmt(stats.suppliers)  : '—', label: 'Verified Suppliers', color: 'text-blue-400',   bgColor: 'bg-blue-900/30' },
    { icon: TrendingUp,   value: stats ? fmt(stats.rfqs)       : '—', label: 'Active Requirements', color: 'text-purple-400', bgColor: 'bg-purple-900/30' },
    { icon: ShoppingCart, value: stats ? fmt(stats.categories) : '—', label: 'Categories',         color: 'text-green-400',  bgColor: 'bg-green-900/30' },
  ];

  return (
    <aside className="space-y-6">
      {/* Quick Stats */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-white">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Quick Stats
        </h3>
        <div className="space-y-3">
          {items.map((stat, idx) => (
            <div key={idx} className={`${stat.bgColor} rounded-lg p-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-sm text-slate-400">{stat.label}</span>
                </div>
                <span className={`font-bold text-lg ${stat.color}`}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Categories */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <h3 className="font-semibold text-lg mb-4 text-white">Featured Categories</h3>
        <div className="space-y-2">
          <Link href="/categories/steel-metals" className="block p-2 hover:bg-slate-700/50 rounded-lg transition text-sm text-slate-300 hover:text-white">
            🏭 Steel & Metals
          </Link>
          <Link href="/categories/electronics" className="block p-2 hover:bg-slate-700/50 rounded-lg transition text-sm text-slate-300 hover:text-white">
            ⚡ Electronics
          </Link>
          <Link href="/categories/textiles" className="block p-2 hover:bg-slate-700/50 rounded-lg transition text-sm text-slate-300 hover:text-white">
            👕 Textiles
          </Link>
          <Link href="/categories/chemicals" className="block p-2 hover:bg-slate-700/50 rounded-lg transition text-sm text-slate-300 hover:text-white">
            🧪 Chemicals
          </Link>
        </div>
        <Link href="/categories" className="block text-center text-sm text-blue-400 hover:text-blue-300 mt-4 font-medium">
          View All Categories →
        </Link>
      </div>
    </aside>
  );
}
