import Link from 'next/link';

export default function FAQPage() {
  const faqs = [
    {
      q: "What is Bell24h?",
      a: "Bell24h is India's leading B2B marketplace connecting buyers with verified suppliers across 450+ categories. Post RFQs, get quotes, and complete transactions securely with our ICICI Bank escrow system."
    },
    {
      q: "How do I post an RFQ?",
      a: "Simply click 'Post RFQ' in the navigation, describe your requirements using text, voice, or video. Our NVIDIA AI will extract details and match you with relevant suppliers within 24 hours."
    },
    {
      q: "Is RFQ posting free?",
      a: "Yes! Posting RFQs on Bell24h is 100% FREE. You only pay platform fees when you successfully complete a deal with a supplier."
    },
    {
      q: "How does the escrow system work?",
      a: "For transactions above ₹50,000, we offer escrow service (1.5% fee). Your payment is held securely until you receive and approve the goods. This protects both buyers and suppliers."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major payment methods through Razorpay: UPI, credit/debit cards, net banking, and digital wallets (Paytm, PhonePe, Google Pay)."
    },
    {
      q: "How are suppliers verified?",
      a: "All suppliers undergo verification including GST certificate, Udyam Aadhar, trade license, and business documents. Our AI trust scoring system provides additional credibility analysis."
    },
    {
      q: "Can I use voice or video to post RFQ?",
      a: "Yes! Bell24h supports voice and video RFQs. Our NVIDIA AI (DeepSeek V3.2 for text, MiniMax M2.1 for video) transcribes and extracts structured data from your recording."
    },
    {
      q: "What are platform fees?",
      a: "Platform fees vary by plan: Free (3% on deals), Pro (1.5%), Enterprise (negotiable). Fees are only charged on successful completed transactions."
    },
    {
      q: "How long does it take to get quotes?",
      a: "Most RFQs receive 3-10 quotes within 24-48 hours. Premium 'Featured RFQ' boosts get quotes even faster (within 6-12 hours)."
    },
    {
      q: "What if I'm not satisfied with quotes?",
      a: "You can reject quotes, request modifications, or negotiate directly with suppliers. There's no obligation to accept any quote."
    },
    {
      q: "How do I contact suppliers?",
      a: "After receiving quotes, use our built-in messaging system to communicate with suppliers. You can unlock full contact details for ₹50 per lead (Free plan) or get unlimited contacts (Pro plan)."
    },
    {
      q: "What categories do you cover?",
      a: "We cover 450+ categories including Textiles, Pharmaceuticals, Agricultural Products, Machinery, IT Services, Chemicals, Construction, Metals & Steel, and more."
    },
    {
      q: "Is there a mobile app?",
      a: "Currently Bell24h is web-based and mobile-responsive. Our mobile app for iOS and Android is launching soon. Register to get early access."
    },
    {
      q: "How do I track my RFQs?",
      a: "All your RFQs, quotes, and deals are available in your Dashboard. You'll receive SMS/WhatsApp notifications for new quotes and updates."
    },
    {
      q: "What if there's a dispute?",
      a: "For escrow transactions, we offer mediation services. Report disputes within 48 hours with evidence (photos, videos). Our team reviews and mediates within 7-14 days."
    },
    {
      q: "Can I cancel an RFQ?",
      a: "Yes, you can close/delete your RFQ at any time from your dashboard. No charges apply for cancelling RFQs."
    },
    {
      q: "How do I upgrade to Pro plan?",
      a: "Go to your Dashboard → Subscription → Upgrade to Pro. Pro includes unlimited RFQs, unlimited lead unlocks, priority support, and reduced platform fees (1.5%)."
    },
    {
      q: "Do you charge GST?",
      a: "Yes, all platform fees and subscription charges are subject to 18% GST as per Indian tax laws. GST invoices are issued for all transactions."
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-slate-400 text-lg">Everything you need to know about Bell24h B2B marketplace</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-slate-700 last:border-0 pb-6 last:pb-0">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center space-y-4">
          <p className="text-slate-400">Didn't find what you're looking for?</p>
          <div className="flex gap-4 justify-center">
            <Link href="/help" className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              Contact Support
            </Link>
            <Link href="/rfq/create" className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              Post RFQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
