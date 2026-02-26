'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Plus, Settings, FileText, Receipt, Mail } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/supplier/dashboard', icon: Home },
  { label: 'Products', href: '/supplier/products/showcase', icon: Package },
  { label: 'Add Product', href: '/supplier/products/add', icon: Plus },
  { label: 'Manage Products', href: '/supplier/products/manage', icon: Settings },
  { label: 'Edit Profile', href: '/supplier/profile/edit', icon: FileText },
  { label: 'GST Verification', href: '/supplier/gst', icon: Receipt },
  { label: 'Leads', href: '/supplier/leads', icon: Mail },
];

export default function SupplierNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
