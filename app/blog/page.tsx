import Link from 'next/link';

const POSTS = [
  {
    slug: 'how-to-write-effective-rfq',
    title: 'How to Write an Effective RFQ: A Complete Guide for Indian Manufacturers',
    excerpt: 'A well-written RFQ saves you days of back-and-forth with suppliers. Learn the 7 fields every RFQ must have, why budget transparency wins better quotes, and how Bell24h\'s AI fills in the gaps automatically.',
    date: '2026-03-10',
    category: 'Procurement Tips',
    readTime: '6 min read',
  },
  {
    slug: 'gst-compliance-b2b-buyers',
    title: 'GST Compliance for B2B Buyers: What Every Procurement Manager Must Know',
    excerpt: 'Input tax credit, reverse charge mechanism, e-invoicing — GST adds complexity to every B2B purchase. Here\'s a practical checklist to stay compliant and avoid notices from the department.',
    date: '2026-03-07',
    category: 'Compliance',
    readTime: '8 min read',
  },
  {
    slug: 'voice-rfq-indian-smes',
    title: 'Voice RFQ: How Indian SMEs Are Revolutionising Procurement',
    excerpt: 'Typing a detailed RFQ takes 20 minutes. Speaking it takes 90 seconds. Bell24h\'s Voice RFQ uses Groq Whisper to transcribe your requirement in real time — then AI extracts category, budget, and timeline automatically.',
    date: '2026-03-04',
    category: 'Product',
    readTime: '4 min read',
  },
  {
    slug: 'questions-to-ask-suppliers',
    title: 'Top 10 Questions to Ask a Supplier Before Accepting a Quote',
    excerpt: 'Price is just one number. Before you accept a quote, ask about lead time, MOQ, payment terms, GST registration, and quality certifications. This checklist has saved Bell24h buyers from 3 bad deals in our first month.',
    date: '2026-02-28',
    category: 'Procurement Tips',
    readTime: '5 min read',
  },
  {
    slug: 'escrow-b2b-transactions-india',
    title: 'Escrow for B2B Transactions: Why Secure Payments Matter in India',
    excerpt: 'B2B payment fraud costs Indian businesses ₹1,200 crore annually. Escrow holds the buyer\'s payment until delivery is confirmed — protecting both sides. Here\'s exactly how Bell24h\'s escrow pipeline works.',
    date: '2026-02-24',
    category: 'Payments',
    readTime: '7 min read',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Bell24h Blog</h1>
          <p className="text-slate-400 text-lg">
            Practical guides on B2B procurement, supplier sourcing, and building smarter supply chains in India.
          </p>
        </div>

        {/* Post grid */}
        <div className="space-y-8">
          {POSTS.map(post => (
            <article
              key={post.slug}
              className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/60 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-medium text-indigo-400 bg-indigo-400/10 px-2.5 py-1 rounded-full">
                  {post.category}
                </span>
                <span className="text-xs text-slate-500">{post.readTime}</span>
                <span className="text-xs text-slate-300">
                  {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>

              <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{post.excerpt}</p>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Read article →
              </Link>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-8 text-center">
          <h3 className="text-white font-semibold text-lg mb-2">Ready to simplify your procurement?</h3>
          <p className="text-slate-400 text-sm mb-5">Post your first RFQ in 90 seconds — voice, video, or text.</p>
          <Link
            href="/rfq/create"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
          >
            Post an RFQ — Free
          </Link>
        </div>
      </div>
    </div>
  );
}
