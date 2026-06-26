'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/admin/seo', label: 'Overview', icon: '📊' },
  { href: '/admin/seo/lighthouse', label: 'Lighthouse', icon: '⚡' },
  { href: '/admin/seo/search-console', label: 'Search Console', icon: '🔍' },
  { href: '/admin/seo/crawl', label: 'Link Crawler', icon: '🕷️' },
  { href: '/admin/seo/on-page', label: 'On-Page', icon: '📐' },
  { href: '/admin/seo/indexing', label: 'Indexing', icon: '🗂️' },
  { href: '/admin/seo/content', label: 'Content', icon: '📄' },
  { href: '/admin/seo/ai-visibility', label: 'AI Visibility', icon: '🤖' },
  { href: '/admin/seo/content-ideas', label: 'Content Ideas', icon: '📝' },
  { href: '/admin/seo/category-ranks', label: 'Category Ranks', icon: '🏷️' },
  { href: '/admin/seo/analyze', label: 'AI Analyze', icon: '🔬' },
  { href: '/admin/seo/gap-report', label: 'Gap Report', icon: '📋' },
  { href: '/admin/seo/tools', label: 'SEO Tools', icon: '🧰' },
  { href: '/admin/seo/opportunities', label: 'Opportunities', icon: '💡' },
  { href: '/admin/seo/rankings', label: 'Rankings', icon: '📈' },
  { href: '/admin/seo/competitors', label: 'Competitors', icon: '🎯' },
  { href: '/admin/seo/checklist', label: 'Checklist', icon: '✅' },
  { href: '/admin/seo/backlinks', label: 'Backlinks', icon: '⭐' },
  { href: '/admin/directories/submit', label: 'Submit guides', icon: '📋' },
  { href: '/admin/directories', label: 'Directories', icon: '🔗' },
];

export default function SeoAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-white">SEO Cockpit</h1>
        <p className="text-slate-400 text-sm mt-1">
          VyaparSethu search visibility — Lighthouse, GSC, indexing, content inventory
        </p>
      </div>

      <nav className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-3">
        {TABS.map(tab => {
          const active =
            pathname === tab.href ||
            (tab.href !== '/admin/seo' &&
              tab.href !== '/admin/directories' &&
              pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
