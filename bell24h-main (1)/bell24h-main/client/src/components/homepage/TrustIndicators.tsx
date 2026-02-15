'use client';

import { TrendingUp, Users, ShoppingCart, Zap } from 'lucide-react';

export default function TrustIndicators() {
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
      label: 'Demo RFQs Available',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      icon: Zap,
      value: '24/7',
      label: 'AI-Powered Support',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <section className="bg-[#0a1128] border-b border-white/10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-shadow"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} dark:bg-gray-700 mb-3`}>
                  <Icon className={`w-6 h-6 ${stat.color} dark:text-gray-300`} />
                </div>
                <p className={`text-3xl font-bold ${stat.color} dark:text-white mb-1`}>
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

