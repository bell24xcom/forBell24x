import Link from 'next/link';

const comparisonRows = [
  { feature: 'Supplier Verification', vs: 'GST + Udyam verified', indiamart: 'Self-reported only', tradeindia: 'Self-reported only' },
  { feature: 'Payment Protection', vs: 'Razorpay Protected', indiamart: 'None', tradeindia: 'None' },
  { feature: 'Lead Reselling', vs: 'Never', indiamart: 'Yes — multiple suppliers', tradeindia: 'Yes' },
  { feature: 'Trust Score', vs: 'Trade Confidence Score', indiamart: 'Not available', tradeindia: 'Not available' },
  { feature: 'Buyer Fees', vs: 'Zero', indiamart: 'Hidden costs', tradeindia: 'Paid' },
  { feature: 'Supplier Cost', vs: 'Free (Phase 1)', indiamart: '₹15,000–80,000/yr', tradeindia: 'Paid' },
  { feature: 'Speak Requirement', vs: 'Beta — Coming Soon', indiamart: 'Not available', tradeindia: 'Not available' },
  { feature: 'WhatsApp Alerts', vs: 'Yes', indiamart: 'Email only', tradeindia: 'Email only' },
];

const cards = [
  {
    icon: '🛡',
    headline: 'Tired of 50 leads, 3 real buyers?',
    body: 'VyaparSethu sends Requirements only to GST-verified businesses. No fake inquiries. No time-wasters.',
    link: '/founding-suppliers',
    linkText: 'Join as Founding Supplier →',
  },
  {
    icon: '🔒',
    headline: 'Paid advance, supplier vanished?',
    body: "VyaparSethu holds your payment via Razorpay until you confirm delivery. Your money is never at risk.",
    link: '/how-payment-works',
    linkText: 'How Payment Works →',
  },
  {
    icon: '★',
    headline: 'Join as a Founding Supplier',
    body: 'One of our first 100 verified suppliers. Free forever. Priority listing. Permanent Founding Member badge.',
    link: '/founding-suppliers',
    linkText: 'Claim Your Spot →',
  },
];

export default function WhyVyaparSethu() {
  return (
    <section className="py-14 px-4 bg-[#0a1128] border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
          Why Buyers and Suppliers Choose VyaparSethu
        </h2>

        {/* Comparison table */}
        <p className="text-xs text-slate-400 italic mb-1 sm:hidden text-center">← Scroll to compare →</p>
        <div className="overflow-x-auto rounded-xl border border-slate-700/40 mb-3">
          <table className="w-full min-w-[540px] text-sm">
            <thead>
              <tr className="bg-[#001f3f] border-b border-slate-700/60">
                <th className="text-left text-[#D4AF37] font-semibold px-4 py-3 text-xs uppercase tracking-wider">Feature</th>
                <th className="text-left text-[#D4AF37] font-semibold px-4 py-3 text-xs uppercase tracking-wider">VyaparSethu</th>
                <th className="text-left text-slate-300 font-medium px-4 py-3 text-xs uppercase tracking-wider">IndiaMART</th>
                <th className="text-left text-slate-300 font-medium px-4 py-3 text-xs uppercase tracking-wider">TradeIndia</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? 'bg-slate-800/25' : 'bg-slate-800/10'}>
                  <td className="px-4 py-2.5 text-slate-300 text-xs font-medium">{row.feature}</td>
                  <td className="px-4 py-2.5 text-white text-xs font-semibold">{row.vs}</td>
                  <td className="px-4 py-2.5 text-slate-300 text-xs">{row.indiamart}</td>
                  <td className="px-4 py-2.5 text-slate-300 text-xs">{row.tradeindia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-slate-400 text-xs italic mb-10">
          * Competitor pricing based on publicly available information. Verify on their respective websites.
        </p>

        {/* 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {cards.map(card => (
            <div key={card.headline} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-6 flex flex-col">
              <div className="text-[#D4AF37] text-3xl mb-3">{card.icon}</div>
              <h3 className="text-white font-bold text-sm mb-2">{card.headline}</h3>
              <p className="text-slate-400 text-xs leading-relaxed flex-1 mb-4">{card.body}</p>
              <Link href={card.link} className="text-[#D4AF37] text-xs font-semibold hover:underline">
                {card.linkText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
