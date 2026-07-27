'use client';

import { MapPin } from 'lucide-react';
import Link from 'next/link';

export default function StatsSidebar() {
  return (
    <aside className="space-y-6">
      {/* Launch status (replaces pre-launch seeded counts) */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-400/30 rounded-full text-cyan-300 text-xs font-bold mb-3">
          <MapPin className="w-3.5 h-3.5" />
          Live in Mumbai · Bhiwandi · Kalamboli
        </div>
        <p className="text-sm text-slate-400">
          Verified suppliers now accepting requirements across Maharashtra
        </p>
      </div>

      {/* Featured Categories */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <h3 className="font-semibold text-lg mb-4 text-white">Featured Categories</h3>
        <div className="space-y-2">
          <Link href="/categories/iron-steel" className="block p-2 hover:bg-slate-700/50 rounded-lg transition text-sm text-slate-300 hover:text-white">
            🏭 Iron & Steel
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
