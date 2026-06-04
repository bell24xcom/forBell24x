import Link from 'next/link';

export default function PaymentHelpPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Payment Methods & Help</h1>
          <p className="text-slate-300 text-lg">Secure payment options powered by Razorpay</p>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">💳 Accepted Payment Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">UPI</h3>
                <p className="text-sm">Google Pay, PhonePe, Paytm, BHIM, and all UPI apps. Instant processing with zero extra charges.</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Credit & Debit Cards</h3>
                <p className="text-sm">Visa, Mastercard, RuPay, American Express. Domestic and international cards accepted.</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Net Banking</h3>
                <p className="text-sm">All major Indian banks including SBI, HDFC, ICICI, Axis, PNB, and 50+ others.</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Wallets</h3>
                <p className="text-sm">Paytm, PhonePe, Amazon Pay, Mobikwik, and other digital wallets.</p>
              </div>
            </div>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🔒 Escrow Service (For Orders ₹50,000+)</h2>
            <div className="space-y-4 text-slate-300">
              <p className="leading-relaxed">
                <strong className="text-white">What is Escrow?</strong><br />
                Escrow is a secure payment holding service where your payment is held by Bell24h until you receive and approve the goods. This protects both buyers and suppliers.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">How Escrow Works:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Buyer accepts supplier quote for order ₹50,000+</li>
                  <li>Buyer pays via Razorpay → funds held in Bell24h escrow account</li>
                  <li>Supplier ships goods with tracking details</li>
                  <li>Buyer receives goods and confirms quality & quantity</li>
                  <li>Bell24h releases payment to supplier within 2-3 business days</li>
                </ol>
              </div>
              <p className="text-sm">
                <strong className="text-white">Escrow Fee:</strong> 1.5% of transaction value (charged to buyer). Non-refundable even if deal is cancelled, as the service (payment holding) has been rendered.
              </p>
            </div>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">💰 Platform Fees & Credits</h2>
            <div className="space-y-4 text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">Free Plan</div>
                  <div className="text-sm text-slate-400">3% platform fee</div>
                  <div className="text-xs text-slate-500 mt-2">Charged on completed deals</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center border-2 border-blue-500/50">
                  <div className="text-2xl font-bold text-blue-400 mb-1">Pro Plan</div>
                  <div className="text-sm text-slate-400">1.5% platform fee</div>
                  <div className="text-xs text-slate-500 mt-2">Monthly subscription</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">Enterprise</div>
                  <div className="text-sm text-slate-400">Negotiable</div>
                  <div className="text-xs text-slate-500 mt-2">Custom pricing</div>
                </div>
              </div>
              <p className="text-sm mt-4">
                <strong className="text-white">Credits:</strong> Purchase credits to unlock supplier leads (₹50/lead on Free plan). Credits valid for 12 months. Non-refundable once purchased.
              </p>
            </div>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🛡️ Payment Security</h2>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start">
                <span className="text-green-400 mr-2 text-xl">✓</span>
                <span><strong className="text-white">PCI-DSS Compliant:</strong> All payments processed through Razorpay with bank-grade encryption</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2 text-xl">✓</span>
                <span><strong className="text-white">TLS/SSL Encryption:</strong> All data transmitted securely over HTTPS</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2 text-xl">✓</span>
                <span><strong className="text-white">No Card Details Stored:</strong> We never store your card CVV or PIN</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2 text-xl">✓</span>
                <span><strong className="text-white">Refund Protection:</strong> Eligible refunds processed within 7-10 business days</span>
              </li>
            </ul>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">❓ Common Payment Questions</h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="font-semibold text-white mb-1">Q: Are payment gateway charges extra?</h3>
                <p className="text-sm">A: Razorpay charges 2-3% + GST on transactions. These are deducted by Razorpay and not controlled by Bell24h.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Q: When will I receive my refund?</h3>
                <p className="text-sm">A: Approved refunds are processed within 7-10 business days for cards, 5-7 days for UPI, 3-5 days for wallets.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Q: Is GST charged on platform fees?</h3>
                <p className="text-sm">A: Yes, all platform fees, subscriptions, and escrow charges are subject to 18% GST as per Indian tax laws.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Q: Can I pay in installments?</h3>
                <p className="text-sm">A: Currently, full payment is required. EMI options coming soon for high-value orders (₹1 lakh+).</p>
              </div>
            </div>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">📞 Payment Support</h2>
            <p className="text-slate-300 mb-4">
              Having issues with payment? Our support team is here to help:
            </p>
            <div className="space-y-2 text-slate-300">
              <p><strong className="text-white">Email:</strong> <a href="mailto:bell24h.helpline@gmail.com" className="text-blue-400 hover:text-blue-300">bell24h.helpline@gmail.com</a></p>
              <p><strong className="text-white">Phone:</strong> +91-9004962871</p>
              <p><strong className="text-white">Business Hours:</strong> Monday-Saturday, 10:00 AM - 7:00 PM IST</p>
            </div>
          </section>
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
