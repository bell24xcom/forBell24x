'use client';

import Link from 'next/link';
import { GLOSSARY_TERMS } from '@/src/data/glossary';
import { BLOG_POSTS } from '@/src/data/blog-posts';
import { TRUST_PAGES, TOOL_PAGES, SITE_CANONICAL } from '@/src/data/seo-dashboard';

function PageTable({ title, pages }: { title: string; pages: typeof TRUST_PAGES }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-700/50">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 uppercase tracking-wide border-b border-slate-700/50">
              <th className="px-4 py-2 text-left font-medium">Page</th>
              <th className="px-4 py-2 text-center font-medium">Sitemap</th>
              <th className="px-4 py-2 text-center font-medium">Meta</th>
              <th className="px-4 py-2 text-center font-medium">Breadcrumbs</th>
              <th className="px-4 py-2 text-center font-medium">Header</th>
              <th className="px-4 py-2 text-center font-medium">Footer</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(p => (
              <tr key={p.path} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="px-4 py-2.5">
                  <Link href={p.path} target="_blank" className="text-indigo-400 hover:text-indigo-300 font-medium">
                    {p.label}
                  </Link>
                  <span className="text-slate-600 ml-2 font-mono">{p.path}</span>
                </td>
                {(['inSitemap', 'hasMetadata', 'hasBreadcrumbs', 'headerLinked', 'footerLinked'] as const).map(key => (
                  <td key={key} className="px-4 py-2.5 text-center">
                    {p[key] ? <span className="text-emerald-400">✓</span> : <span className="text-slate-600">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SeoContentPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Trust pages', value: TRUST_PAGES.length },
          { label: 'Tools', value: TOOL_PAGES.length },
          { label: 'Glossary terms', value: GLOSSARY_TERMS.length },
          { label: 'Blog posts', value: BLOG_POSTS.length },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-slate-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <PageTable title="Trust & benefit pages" pages={TRUST_PAGES} />
      <PageTable title="SEO tools" pages={TOOL_PAGES} />

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-700/50 flex justify-between items-center">
          <h3 className="text-white font-semibold text-sm">Glossary ({GLOSSARY_TERMS.length} terms)</h3>
          <Link href="/glossary" target="_blank" className="text-xs text-indigo-400">View hub ↗</Link>
        </div>
        <div className="p-4 flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {GLOSSARY_TERMS.map(t => (
            <Link
              key={t.slug}
              href={`/glossary/${t.slug}`}
              target="_blank"
              className="text-xs px-2 py-1 rounded bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700/50"
            >
              {t.slug}
            </Link>
          ))}
        </div>
        <p className="px-5 pb-4 text-slate-600 text-xs">
          Driving GSC impressions: gst-invoice, trade-credit. All terms have metadata + FAQ schema.
        </p>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-700/50 flex justify-between items-center">
          <h3 className="text-white font-semibold text-sm">Blog ({BLOG_POSTS.length} posts)</h3>
          <Link href="/blog" target="_blank" className="text-xs text-indigo-400">View blog ↗</Link>
        </div>
        <ul className="divide-y divide-slate-700/30 max-h-64 overflow-y-auto">
          {BLOG_POSTS.slice(0, 20).map(post => (
            <li key={post.slug} className="px-5 py-2.5 flex items-center justify-between gap-4 hover:bg-slate-800/30">
              <Link href={`/blog/${post.slug}`} target="_blank" className="text-sm text-slate-300 hover:text-white truncate">
                {post.title}
              </Link>
              <span className="text-slate-600 text-xs shrink-0">{post.category}</span>
            </li>
          ))}
        </ul>
        {BLOG_POSTS.length > 20 && (
          <p className="px-5 py-3 text-slate-600 text-xs">+ {BLOG_POSTS.length - 20} more in sitemap</p>
        )}
      </div>

      <p className="text-slate-600 text-xs">Public URLs: {SITE_CANONICAL}</p>
    </div>
  );
}
