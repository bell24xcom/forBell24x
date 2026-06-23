import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Protected Payment — How It Works | VyaparSethu',
  description: 'VyaparSethu uses Razorpay-protected payments to keep your money safe until delivery is confirmed. No advance payment fraud. No buyer defaults.',
  openGraph: {
    title: 'Protected Payment — How It Works | VyaparSethu',
    description: 'Razorpay holds your payment in an RBI-regulated nodal account until delivery is confirmed.',
    url: `${SITE_URL}/how-payment-works`,
    siteName: 'VyaparSethu',
  },
  alternates: { canonical: `${SITE_URL}/how-payment-works` },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'How Payment Works', item: `${SITE_URL}/how-payment-works` },
  ],
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does VyaparSethu hold my payment?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. All funds are held by Razorpay in an RBI-regulated nodal account. VyaparSethu never directly holds customer funds.' },
    },
    {
      '@type': 'Question',
      name: 'What if the supplier does not deliver?',
      acceptedAnswer: { '@type': 'Answer', text: 'Payment remains held until the buyer confirms delivery. If goods are not delivered, the buyer can raise a dispute and receive a full refund after review by our team.' },
    },
    {
      '@type': 'Question',
      name: 'Is Protected Payment mandatory?',
      acceptedAnswer: { '@type': 'Answer', text: 'Protected Payment is required for first-time transactions between a buyer and supplier on VyaparSethu. After 3 successful transactions, both parties can negotiate direct payment terms.' },
    },
    {
      '@type': 'Question',
      name: 'What payment methods are supported?',
      acceptedAnswer: { '@type': 'Answer', text: 'UPI, debit card, credit card, and net banking via Razorpay. All major Indian banks and UPI apps are supported.' },
    },
  ],
};

const paymentSteps = [
  {
    n: '1', title: 'Buyer Deposits Payment',
    body: 'When a buyer accepts a quotation, they deposit the agreed amount via Razorpay — UPI, card, or net banking. Funds are held in an RBI-regulated nodal account. Not with VyaparSethu. Not with the supplier.',
  },
  {
    n: '2', title: 'Supplier Sees Payment Confirmed',
    body: 'The supplier receives confirmation that payment is secured before shipping. No more "pay me after delivery" risk. No more chasing buyers for invoices.',
  },
  {
    n: '3', title: 'Supplier Ships with Confidence',
    body: 'With payment confirmed, the supplier ships the goods as agreed. Delivery timeline and updates are shared via WhatsApp.',
  },
  {
    n: '4', title: 'Buyer Confirms Delivery',
    body: 'When goods arrive, the buyer inspects and confirms delivery on VyaparSethu. This confirmation releases the payment.',
  },
  {
    n: '5', title: 'Supplier Gets Paid Automatically',
    body: "Razorpay releases funds to the supplier's registered bank account within 1-2 working days of buyer confirmation. No manual follow-up needed.",
  },
];

export default function HowPaymentWorksPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="min-h-screen bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-4 py-16">

          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
            <Link href="/how-it-works" className="hover:text-slate-300">How It Works</Link><span>/</span>
            <span className="text-slate-400">Protected Payment</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-1.5 text-xs text-[#D4AF37] font-medium mb-5">
            🔒 Razorpay-Protected · RBI-Regulated Nodal Account
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug">
            Protected Payment — Your Money Is Safe Until Delivery
          </h1>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed">
            The biggest risk in Indian B2B trade is payment fraud. Suppliers lose lakhs when buyers refuse to pay after delivery. Buyers lose lakhs when suppliers take advance payment and disappear. VyaparSethu eliminates both risks with Razorpay-protected payments.
          </p>

          {/* How it works */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-8">How Protected Payment Works</h2>
            <div className="space-y-6">
              {paymentSteps.map(step => (
                <div key={step.n} className="flex gap-5">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#001f3f] font-bold text-sm">{step.n}</div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dispute */}
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-6">What If Something Goes Wrong?</h2>
            <div className="space-y-5">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-3">If Buyer Raises a Dispute</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  The buyer can raise a dispute within 48 hours of delivery if goods are wrong, short, or poor quality. Payment is held while our team reviews evidence from both parties. Resolution within 5 working days. If the dispute is valid, the buyer receives a full refund.
                </p>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-3">If Buyer Does Not Confirm</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  If the buyer neither confirms delivery nor raises a dispute within 7 days of the confirmed delivery date, payment is automatically released to the supplier. Buyers cannot indefinitely hold supplier payments.
                </p>
              </div>
            </div>
          </section>

          {/* Safety */}
          <section className="mb-14 bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Is My Money Safe?</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Funds are held by Razorpay — India&apos;s largest payment gateway — in an RBI-regulated nodal account. VyaparSethu never directly holds customer funds. This is the same payment infrastructure used by major Indian e-commerce and fintech platforms.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: 'Payment Partner', value: 'Razorpay' },
                { label: 'Account Type', value: 'RBI-regulated nodal account' },
                { label: 'Dispute Window', value: '48 hours after delivery' },
                { label: 'Auto-release', value: '7 days if no action' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[#D4AF37] text-xs font-semibold">{item.label}</p>
                  <p className="text-white text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {faqLd.mainEntity.map(item => (
                <div key={item.name} className="border-b border-slate-800 pb-5">
                  <h3 className="text-white font-semibold text-sm mb-2">{item.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link href="/rfq/create" className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
              Post a Requirement — Free →
            </Link>
            <Link href="/how-it-works" className="inline-block border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-6 py-3 rounded-lg text-sm transition-colors">
              ← How It Works
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
