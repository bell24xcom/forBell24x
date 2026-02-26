import Link from 'next/link';

export default function HowToSellPage() {
  const steps = [
    {
      number: "1",
      title: "Register as Supplier",
      description: "Create your supplier account with business details. Complete verification with GST certificate, Udyam Aadhar, and trade license for premium visibility.",
      tips: ["Use business email for registration", "Upload clear GST certificate copy", "Add product catalog photos", "Get verified within 24 hours"]
    },
    {
      number: "2",
      title: "Browse RFQs & Find Leads",
      description: "Search RFQs by category, location, and budget. Free plan gives 5 RFQ unlocks/month. Pro plan offers unlimited browsing and lead unlocks.",
      tips: ["Set up category alerts for relevant RFQs", "Filter by budget range matching your pricing", "Check buyer ratings before quoting", "Respond quickly to new RFQs (within 24 hours)"]
    },
    {
      number: "3",
      title: "Submit Competitive Quotes",
      description: "Submit detailed quotes with pricing, delivery timeline, terms, and product specifications. Add photos, certifications, and past work samples.",
      tips: ["Price competitively but realistically", "Highlight your USP (quality, certifications, fast delivery)", "Offer bulk discounts for large orders", "Be transparent about all terms and conditions"]
    },
    {
      number: "4",
      title: "Negotiate & Close Deal",
      description: "Communicate with buyers via platform messaging. Clarify requirements, negotiate terms, and finalize the deal once buyer accepts your quote.",
      tips: ["Respond to buyer messages within 2-4 hours", "Be professional and courteous", "Offer samples for first-time buyers", "Use escrow for high-value orders to build trust"]
    },
    {
      number: "5",
      title: "Fulfill Order & Get Paid",
      description: "Deliver goods as per agreed timeline and terms. Once buyer confirms receipt and quality, payment is released (instantly for non-escrow, within 2-3 days for escrow).",
      tips: ["Pack goods securely with proper labeling", "Share tracking details proactively", "Keep buyer updated on delivery status", "Request review/rating after successful delivery"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">How to Sell on Bell24h</h1>
          <p className="text-slate-300 text-lg">Your complete guide to growing your B2B business with verified buyers across India</p>
        </div>

        <div className="space-y-8">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shrink-0">
                  {step.number}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">{step.description}</p>

                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-green-400 mb-2">💡 Pro Tips:</h3>
                    <ul className="space-y-1 text-sm text-slate-300">
                      {step.tips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Start Selling Today</h2>
          <p className="text-slate-300 mb-6 text-center max-w-2xl mx-auto">
            Join 50,000+ verified suppliers on Bell24h. Get instant access to buyer RFQs across 450+ categories. Free plan available with 5 leads/month.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">Free</div>
              <div className="text-slate-300 text-sm">5 RFQ unlocks/month</div>
              <div className="text-slate-400 text-xs mt-1">3% platform fee</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center border-2 border-green-500/50">
              <div className="text-3xl font-bold text-green-400 mb-2">Pro</div>
              <div className="text-slate-300 text-sm">Unlimited RFQ access</div>
              <div className="text-slate-400 text-xs mt-1">1.5% platform fee</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">Enterprise</div>
              <div className="text-slate-300 text-sm">Custom solutions</div>
              <div className="text-slate-400 text-xs mt-1">Negotiable fees</div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Register as Supplier
            </Link>
            <Link href="/pricing" className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-8 py-3 rounded-lg transition-colors">
              View Pricing
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/help" className="text-blue-400 hover:text-blue-300">
            ← Back to Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
