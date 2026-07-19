import Link from 'next/link';

export default function HowToBuyPage() {
  const steps = [
    {
      number: "1",
      title: "Register & Create Profile",
      description: "Sign up with your business email and phone number. Complete your buyer profile with GST number (optional) and business verification for better trust score.",
      tips: ["Use business email for faster verification", "Add company logo to build credibility", "Complete KYC for escrow eligibility"]
    },
    {
      number: "2",
      title: "Post RFQ (Request for Quotation)",
      description: "Describe what you need using text, voice, or video. Our NVIDIA AI will extract specifications and match you with verified suppliers.",
      tips: ["Be specific about quantity, quality, and timeline", "Upload product images or samples if available", "Set a realistic budget range to get accurate quotes", "Use voice/video RFQ for complex requirements"]
    },
    {
      number: "3",
      title: "Review Quotes from Suppliers",
      description: "Receive 3-10 competitive quotes within 24-48 hours. Compare prices, delivery timelines, supplier ratings, and terms.",
      tips: ["Check supplier verification status and ratings", "Use messaging to clarify doubts before accepting", "Negotiate for better terms or bulk discounts", "Request samples for high-value orders"]
    },
    {
      number: "4",
      title: "Accept Quote & Complete Deal",
      description: "Accept the best quote and proceed to payment. For orders above ₹50,000, use our escrow service for secure transactions.",
      tips: ["Use escrow (1.5% fee) for first-time suppliers", "Read terms carefully before payment", "Keep communication within platform initially", "Request invoice with GST details"]
    },
    {
      number: "5",
      title: "Track Delivery & Confirm Receipt",
      description: "Track your order status in dashboard. Once goods arrive, inspect quality and confirm delivery to release escrow payment to supplier.",
      tips: ["Inspect goods thoroughly before confirming", "Report issues within 48 hours for disputes", "Leave rating/review for the supplier", "Save invoice for tax records"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">How to Buy on VyaparSethu</h1>
          <p className="text-slate-300 text-lg">Your complete guide to sourcing products & services on India's #1 B2B marketplace</p>
        </div>

        <div className="space-y-8">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shrink-0">
                  {step.number}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">{step.description}</p>

                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-400 mb-2">💡 Pro Tips:</h3>
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

        <div className="mt-12 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Ready to Start Buying?</h2>
          <p className="text-slate-300 mb-6 text-center max-w-2xl mx-auto">
            Join 10,000+ businesses sourcing smarter with Bell24h. Post your first RFQ free and get competitive quotes from verified suppliers across India.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/rfq/create" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Post RFQ Free
            </Link>
            <Link href="/help/faq" className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-8 py-3 rounded-lg transition-colors">
              View FAQs
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
