import { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/src/data/blog-posts';

export const metadata: Metadata = {
  title: 'Blog — B2B Procurement Guides for Indian MSMEs',
  description: 'Practical guides on supplier sourcing, GST compliance, trade credit, protected payment, and building smarter supply chains in India.',
  keywords: ['B2B procurement India', 'supplier sourcing guide', 'MSME procurement tips', 'GST compliance B2B'],
  openGraph: {
    title: 'VyaparSethu Blog — B2B Procurement Guides for Indian MSMEs',
    description: 'Practical guides on supplier sourcing, GST compliance, trade credit, and building smarter supply chains in India.',
    url: 'https://www.vyaparsethu.com/blog',
    siteName: 'VyaparSethu',
  },
  alternates: { canonical: 'https://www.vyaparsethu.com/blog' },
};

const CATEGORY_COLOURS: Record<string, string> = {
  'Procurement Tips': 'text-blue-400 bg-blue-400/10',
  'Compliance':       'text-amber-400 bg-amber-400/10',
  'Product':          'text-emerald-400 bg-emerald-400/10',
  'Payments':         'text-purple-400 bg-purple-400/10',
  'Category Guide':   'text-[#D4AF37] bg-[#D4AF37]/10',
  'Finance':          'text-rose-400 bg-rose-400/10',
};

export default function BlogPage() {
  const sorted = [...BLOG_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const featured = sorted[0];
  const rest = sorted.slice(1);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-4xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-3">VyaparSethu Blog</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Practical guides on B2B sourcing, GST compliance, trade credit, and building fraud-proof supply chains in India.
          </p>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {BLOG_CATEGORIES.map(cat => (
            <span key={cat} className={`text-xs font-medium px-3 py-1 rounded-full ${CATEGORY_COLOURS[cat] ?? 'text-slate-400 bg-slate-700/50'}`}>
              {cat}
            </span>
          ))}
        </div>

        {/* Featured post */}
        <Link href={`/blog/${featured.slug}`} className="block mb-10 bg-[#001f3f] border border-[#D4AF37]/20 rounded-2xl p-8 hover:border-[#D4AF37]/40 transition-colors group">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLOURS[featured.category] ?? 'text-slate-400 bg-slate-700/50'}`}>
              {featured.category}
            </span>
            <span className="text-xs text-slate-500">{featured.readTime} read</span>
            <span className="text-xs text-[#D4AF37]/70 font-medium">Latest</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-[#D4AF37] transition-colors">
            {featured.title}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">{featured.excerpt}</p>
          <span className="inline-flex items-center gap-1 mt-4 text-sm text-[#D4AF37] font-medium">Read article →</span>
        </Link>

        {/* Grid */}
        <div className="space-y-6">
          {rest.map(post => (
            <article key={post.slug} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/60 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLOURS[post.category] ?? 'text-slate-400 bg-slate-700/50'}`}>
                  {post.category}
                </span>
                <span className="text-xs text-slate-500">{post.readTime} read</span>
                <span className="text-xs text-slate-400">
                  {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-base font-semibold text-white mb-2 group-hover:text-[#D4AF37] transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-sm text-[#D4AF37] hover:text-[#c4a030] font-medium transition-colors">
                Read article →
              </Link>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-8 text-center">
          <h3 className="text-white font-semibold text-lg mb-2">Ready to simplify your sourcing?</h3>
          <p className="text-slate-400 text-sm mb-5">Post your first Requirement in 90 seconds — voice, video, or text. Verified Suppliers quote within 24 hours.</p>
          <Link href="/rfq/create" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg transition-colors text-sm">
            Post a Requirement — Free
          </Link>
        </div>
      </div>
    </div>
  );
}
