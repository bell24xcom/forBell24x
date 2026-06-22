import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Free B2B Tools — HSN Lookup, GST Calculator & More | VyaparSethu',
  description: 'Free tools for Indian B2B buyers and suppliers: HSN code lookup with GST rates, B2B GST calculator (CGST/SGST/IGST), packaging cost estimator, and more.',
  keywords: ['HSN code lookup India', 'GST calculator India B2B', 'B2B tools India', 'packaging cost calculator', 'trade tools India'],
  openGraph: { title: 'Free B2B Trade Tools — VyaparSethu', description: 'Free tools for Indian B2B sourcing: HSN lookup, GST calculator, and more.', url: 'https://www.vyaparsethu.com/tools', siteName: 'VyaparSethu' },
  alternates: { canonical: 'https://www.vyaparsethu.com/tools' },
};

const TOOLS = [
  {
    href: '/tools/hsn-lookup',
    title: 'HSN Code Lookup',
    description: 'Search 70+ HSN codes by product name or code number. Includes GST rate, product category, and common examples. Covers Steel, Packaging, Chemicals, Textiles, Machinery.',
    tags: ['HSN', 'GST', 'Compliance'],
    icon: '🔍',
    badge: 'Most Used',
  },
  {
    href: '/tools/gst-calculator',
    title: 'B2B GST Calculator',
    description: 'Calculate CGST + SGST or IGST for any B2B invoice. Supports GST-inclusive and GST-exclusive modes. Quick-select by product category. Instant ITC note.',
    tags: ['GST', 'Invoice', 'Compliance'],
    icon: '🧮',
    badge: null,
  },
  {
    href: '/tools/packaging-calculator',
    title: 'Packaging Cost Estimator',
    description: 'Estimate total corrugated box or HDPE bag costs for a shipment. Input dimensions, quantity, and material grade — get per-unit and bulk order cost with GST.',
    tags: ['Packaging', 'Cost', 'Calculator'],
    icon: '📦',
    badge: 'New',
  },
];

const COMING_SOON = [
  { title: 'GSTIN Verification', description: 'Verify any supplier GSTIN — active status, filing history, business name, and state.', icon: '✅' },
  { title: 'Freight Cost Estimator', description: 'Estimate road freight cost between any two Indian cities by weight and volume.', icon: '🚚' },
  { title: 'HS Code to Export Duty', description: 'Look up import duty and export policy for any HS code under India\'s Foreign Trade Policy.', icon: '🌐' },
  { title: 'LC (Letter of Credit) Guide', description: 'Interactive LC type selector and documentary requirements checklist for B2B trade finance.', icon: '🏦' },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-5xl mx-auto px-4 py-14">

        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
          <span className="text-slate-300">Tools</span>
        </nav>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 text-xs text-[#D4AF37] font-medium mb-4">
            Free for all users
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">B2B Trade Tools</h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-4">Free calculators and lookup tools for Indian B2B buyers and suppliers. No signup required.</p>
          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed mb-3">
            Indian B2B transactions involve multiple compliance layers: GST invoicing with the correct
            CGST/SGST or IGST split, HSN code classification for every product line, and packaging cost
            estimation before finalising shipment quantities. Errors at any of these steps cause invoice
            rejections, delayed ITC claims, and disputes with suppliers.
          </p>
          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            The tools below help buyers and suppliers on VyaparSethu — and any Indian MSME — get these
            calculations right the first time. Use the HSN Code Lookup before raising a purchase order,
            run the GST Calculator to confirm your invoice breakup, and use the Packaging Cost Estimator
            to price corrugated or HDPE shipments accurately before submitting a quote.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {TOOLS.map(tool => (
            <Link key={tool.href} href={tool.href}
              className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:border-[#D4AF37]/40 transition-all hover:bg-slate-800/60">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{tool.icon}</span>
                {tool.badge && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tool.badge === 'New' ? 'text-emerald-400 bg-emerald-400/10' : 'text-[#D4AF37] bg-[#D4AF37]/10'}`}>
                    {tool.badge}
                  </span>
                )}
              </div>
              <h2 className="text-white font-bold text-base mb-2 group-hover:text-[#D4AF37] transition-colors">{tool.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{tool.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {tool.tags.map(tag => (
                  <span key={tag} className="text-xs text-slate-500 bg-slate-700/50 px-2.5 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-white font-semibold text-lg mb-5">Coming Soon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMING_SOON.map(tool => (
              <div key={tool.title} className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-5 opacity-70">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{tool.icon}</span>
                  <h3 className="text-slate-300 font-medium text-sm">{tool.title}</h3>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-2xl p-8">
          <h2 className="text-white font-bold text-xl mb-3">Ready to Source Smarter?</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-xl">Post your Requirement in 90 seconds using our Speak Requirement feature. Verified suppliers quote within 24 hours. Protected Payment keeps your funds safe.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/rfq/create" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
              Post a Requirement — Free
            </Link>
            <Link href="/voice-rfq" className="inline-block border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-6 py-3 rounded-lg text-sm transition-colors">
              🎤 Speak Requirement
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
