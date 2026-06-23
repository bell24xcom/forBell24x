import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, BLOG_POSTS } from '@/src/data/blog-posts';
import BlogCapture from '@/src/components/capture/BlogCapture';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return BLOG_POSTS.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: 'Post Not Found' };
  const titleStr = post.title.length > 45 ? post.title.slice(0, 42) + '...' : post.title;
  return {
    title: { absolute: `${titleStr} | VyaparSethu` },
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      url: `https://www.vyaparsethu.com/blog/${post.slug}`,
      siteName: 'VyaparSethu',
      ...(post.image && { images: [{ url: `https://www.vyaparsethu.com${post.image}`, width: 1200, height: 630, alt: post.title }] }),
    },
    alternates: { canonical: `https://www.vyaparsethu.com/blog/${post.slug}` },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter(p => p.category === post.category && p.slug !== post.slug).slice(0, 3);

  const parseCells = (row: string) => row.split('|').map(c => c.trim()).filter(Boolean);
  const isSeparatorRow = (row: string) => /^\|[\s\-:|]+\|$/.test(row.trim());

  const paragraphs = post.body.split('\n\n').map((block, i) => {
    const trimmed = block.trim();

    // Standalone bold heading: **Heading text** — whole block is one bold span
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      return (
        <h2 key={i} className="text-white font-bold text-lg mt-8 mb-3 leading-snug">
          {trimmed.slice(2, -2)}
        </h2>
      );
    }

    // Markdown table
    if (trimmed.includes('| ')) {
      const rows = trimmed.split('\n').filter(r => r.trim() && !isSeparatorRow(r));
      const [headerRow, ...bodyRows] = rows;
      return (
        <div key={i} className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {parseCells(headerRow).map((cell, j) => (
                  <th key={j} className="text-left text-xs text-[#D4AF37] font-semibold uppercase tracking-wider border-b border-slate-700 py-2 pr-6">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, j) => (
                <tr key={j} className="border-b border-slate-800/60">
                  {parseCells(row).map((cell, k) => (
                    <td key={k} className="text-slate-300 py-2.5 pr-6">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Checklist / bullet list
    if (trimmed.startsWith('- ') || trimmed.startsWith('- [ ]')) {
      const items = trimmed.split('\n').filter(Boolean);
      return (
        <ul key={i} className="list-disc list-inside space-y-1.5 text-slate-300 mb-4 ml-2">
          {items.map((item, j) => (
            <li key={j}>{item.replace(/^-\s(\[.\]\s)?/, '')}</li>
          ))}
        </ul>
      );
    }

    // Default: inline bold rendering
    const html = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>');
    return (
      <p key={i} className="text-slate-300 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: html }} />
    );
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'VyaparSethu' },
    publisher: {
      '@type': 'Organization',
      name: 'VyaparSethu',
      logo: { '@type': 'ImageObject', url: 'https://www.vyaparsethu.com/og-image.png' },
    },
    mainEntityOfPage: `https://www.vyaparsethu.com/blog/${post.slug}`,
    keywords: post.keywords.join(', '),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vyaparsethu.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.vyaparsethu.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://www.vyaparsethu.com/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-4 py-16">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-slate-400 truncate">{post.title.slice(0, 40)}…</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-full">
                {post.category}
              </span>
              <span className="text-xs text-slate-500">{post.readTime} read</span>
              <span className="text-xs text-slate-500">
                {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-4">{post.title}</h1>
            <p className="text-slate-400 text-lg leading-relaxed">{post.excerpt}</p>
          </header>

          {/* Body */}
          <article className="prose-invert max-w-none">
            {paragraphs.slice(0, Math.ceil(paragraphs.length * 0.45))}
            <BlogCapture category={post.category} />
            {paragraphs.slice(Math.ceil(paragraphs.length * 0.45))}
          </article>

          {/* CTA */}
          <div className="mt-12 bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-8">
            <h3 className="text-white font-semibold text-lg mb-2">Post your Requirement in 90 seconds</h3>
            <p className="text-slate-400 text-sm mb-5">
              Voice, video, or text. Verified Suppliers quote within 24 hours. Protected Payment ensures funds release only on delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/rfq/create" className="inline-flex items-center justify-center bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg transition-colors text-sm">
                Post a Requirement — Free
              </Link>
              <Link href="/supplier/browse-rfqs" className="inline-flex items-center justify-center border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm">
                Browse as Supplier
              </Link>
            </div>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-white font-semibold text-lg mb-5">More in {post.category}</h2>
              <div className="space-y-4">
                {related.map(r => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} className="block bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/60 transition-colors group">
                    <p className="text-sm text-slate-400 mb-1">{r.readTime} read</p>
                    <h3 className="text-white font-medium text-sm leading-snug group-hover:text-[#D4AF37] transition-colors">{r.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-10">
            <Link href="/blog" className="text-sm text-slate-400 hover:text-white transition-colors">← All articles</Link>
          </div>
        </div>
      </div>
    </>
  );
}
