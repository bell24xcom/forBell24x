import Link from 'next/link';

export default function HelpPage() {
  const helpTopics = [
    {
      title: "Frequently Asked Questions",
      icon: "❓",
      description: "Get answers to common questions about Bell24h, RFQs, payments, and more",
      link: "/help/faq"
    },
    {
      title: "How to Buy",
      icon: "🛒",
      description: "Step-by-step guide for buyers: Post RFQ, review quotes, complete deals",
      link: "/help/how-to-buy"
    },
    {
      title: "How to Sell",
      icon: "💼",
      description: "Step-by-step guide for suppliers: Browse RFQs, submit quotes, win deals",
      link: "/help/how-to-sell"
    },
    {
      title: "Payments & Billing",
      icon: "💳",
      description: "Payment methods, escrow system, platform fees, refunds, and wallet",
      link: "/help/payment"
    },
    {
      title: "Safety & Security",
      icon: "🛡️",
      description: "Best practices, red flags to watch, dispute resolution, fraud prevention",
      link: "/help/safety"
    },
    {
      title: "Report an Issue",
      icon: "🚨",
      description: "Report bugs, payment issues, supplier problems, or security concerns",
      link: "/report-issue"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Help Center</h1>
          <p className="text-slate-300 text-lg">Everything you need to know about VyaparSethu B2B trade network</p>
        </div>

        {/* Help Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {helpTopics.map((topic, idx) => (
            <Link
              key={idx}
              href={topic.link}
              className="bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 rounded-2xl p-6 transition-all group"
            >
              <div className="text-4xl mb-4">{topic.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {topic.title}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {topic.description}
              </p>
              <div className="mt-4 text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                Learn more →
              </div>
            </Link>
          ))}
        </div>

        {/* Contact Support Section */}
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Still Need Help?</h2>
            <p className="text-slate-300">Our support team is available to assist you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="font-semibold text-white mb-1">Email Support</h3>
              <a href="mailto:digitex.studio@gmail.com" className="text-blue-400 hover:text-blue-300 text-sm">
                digitex.studio@gmail.com
              </a>
              <p className="text-slate-400 text-xs mt-2">Response within 24 hours</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="font-semibold text-white mb-1">Phone Support</h3>
              <a href="tel:+919004962871" className="text-blue-400 hover:text-blue-300 text-sm">
                +91-9004962871
              </a>
              <p className="text-slate-400 text-xs mt-2">Mon-Sat, 10 AM - 7 PM IST</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-white mb-1">Live Chat</h3>
              <p className="text-blue-400 text-sm">Coming Soon</p>
              <p className="text-slate-400 text-xs mt-2">24/7 instant support</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">For Buyers</h3>
            <ul className="space-y-2 text-slate-300">
              <li><Link href="/rfq/create" className="hover:text-blue-400 transition-colors">→ Post RFQ Free</Link></li>
              <li><Link href="/help/how-to-buy" className="hover:text-blue-400 transition-colors">→ How to Buy Guide</Link></li>
              <li><Link href="/help/payment" className="hover:text-blue-400 transition-colors">→ Payment Methods</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-400 transition-colors">→ View Pricing Plans</Link></li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">For Suppliers</h3>
            <ul className="space-y-2 text-slate-300">
              <li><Link href="/auth/register" className="hover:text-blue-400 transition-colors">→ Register as Supplier</Link></li>
              <li><Link href="/help/how-to-sell" className="hover:text-blue-400 transition-colors">→ How to Sell Guide</Link></li>
              <li><Link href="/services/verified-suppliers" className="hover:text-blue-400 transition-colors">→ Get Verified</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-400 transition-colors">→ Supplier Plans</Link></li>
            </ul>
          </div>
        </div>

        {/* Closing CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/rfq/create"
            className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c4a030] text-[#0B1F45] font-semibold px-8 py-4 rounded-xl transition-colors text-base"
          >
            Ready to start? Post your first RFQ →
          </Link>
        </div>
      </div>
    </div>
  );
}
