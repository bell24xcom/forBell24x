import Link from 'next/link';

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Safety & Security Guidelines</h1>
          <p className="text-slate-300 text-lg">Stay safe while doing B2B transactions on Bell24h</p>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🛡️ How Bell24h Protects You</h2>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start">
                <span className="text-green-400 mr-3 text-xl shrink-0">✓</span>
                <div>
                  <strong className="text-white">Supplier Verification:</strong> All suppliers verified with GST, PAN, Udyam Aadhar, and business documents before approval.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3 text-xl shrink-0">✓</span>
                <div>
                  <strong className="text-white">Escrow Protection:</strong> For orders ₹50,000+, payments held securely until delivery confirmation. No risk of advance payment fraud.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3 text-xl shrink-0">✓</span>
                <div>
                  <strong className="text-white">AI Trust Scoring:</strong> Our AI analyzes supplier behavior, delivery history, and ratings to calculate trust scores.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3 text-xl shrink-0">✓</span>
                <div>
                  <strong className="text-white">Secure Payment Gateway:</strong> All transactions via Razorpay with PCI-DSS compliance and bank-grade encryption.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3 text-xl shrink-0">✓</span>
                <div>
                  <strong className="text-white">Dispute Resolution:</strong> Our mediation team resolves conflicts with evidence-based investigation within 7-14 days.
                </div>
              </li>
            </ul>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">⚠️ Red Flags to Watch For</h2>
            <div className="space-y-3 text-slate-300">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-red-400 mr-3 text-xl shrink-0">⚠</span>
                  <div>
                    <strong className="text-white">Urgent Payment Requests:</strong> Beware of suppliers asking for immediate payment outside the platform or via personal accounts.
                  </div>
                </div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-red-400 mr-3 text-xl shrink-0">⚠</span>
                  <div>
                    <strong className="text-white">Too-Good-To-Be-True Prices:</strong> Prices 30-50% below market rate may indicate counterfeit goods or fraud.
                  </div>
                </div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-red-400 mr-3 text-xl shrink-0">⚠</span>
                  <div>
                    <strong className="text-white">No Documentation:</strong> Legitimate suppliers always provide GST invoices, quality certificates, and proper paperwork.
                  </div>
                </div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-red-400 mr-3 text-xl shrink-0">⚠</span>
                  <div>
                    <strong className="text-white">Unverified Suppliers:</strong> Check verification badge. Avoid suppliers with 0 ratings or newly registered accounts for high-value orders.
                  </div>
                </div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-red-400 mr-3 text-xl shrink-0">⚠</span>
                  <div>
                    <strong className="text-white">Off-Platform Communication:</strong> Supplier insists on WhatsApp/phone before deal confirmation may be trying to avoid platform fees (and protection).
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">✅ Best Practices for Buyers</h2>
            <ul className="space-y-2 text-slate-300 list-disc list-inside ml-4">
              <li>Always use escrow for first-time suppliers or orders above ₹50,000</li>
              <li>Request samples before placing bulk orders</li>
              <li>Verify supplier GST number on official GST portal (gst.gov.in)</li>
              <li>Keep all communication within Bell24h platform initially</li>
              <li>Check supplier ratings, reviews, and delivery history</li>
              <li>Request quality certificates, test reports for critical products</li>
              <li>Insist on proper GST invoice with GSTIN and HSN codes</li>
              <li>Never share OTPs, passwords, or bank details via chat/call</li>
              <li>Inspect goods thoroughly before confirming delivery (for escrow)</li>
              <li>Report suspicious behavior immediately to bell24h.helpline@gmail.com</li>
            </ul>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">✅ Best Practices for Suppliers</h2>
            <ul className="space-y-2 text-slate-300 list-disc list-inside ml-4">
              <li>Complete business verification with GST, PAN, Udyam Aadhar</li>
              <li>Upload clear product photos, certifications, and company profile</li>
              <li>Respond to RFQs within 24 hours for better trust score</li>
              <li>Be transparent about product quality, delivery timelines, terms</li>
              <li>Never ask buyers to pay outside the platform</li>
              <li>Provide tracking details immediately after shipping</li>
              <li>Issue proper GST invoices with all compliance details</li>
              <li>Keep buyers updated on order status proactively</li>
              <li>Resolve disputes professionally with evidence (photos, documents)</li>
              <li>Build reputation with positive reviews and on-time deliveries</li>
            </ul>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🚨 What to Do If You're Scammed</h2>
            <ol className="list-decimal list-inside space-y-3 text-slate-300 ml-4">
              <li>
                <strong className="text-white">Immediately Report:</strong> Contact bell24h.helpline@gmail.com with transaction details, screenshots, and evidence
              </li>
              <li>
                <strong className="text-white">Stop Further Payment:</strong> Do not send any additional money. If using escrow, do not confirm delivery
              </li>
              <li>
                <strong className="text-white">Gather Evidence:</strong> Collect all communication, payment receipts, photos, videos proving fraud
              </li>
              <li>
                <strong className="text-white">File Complaint:</strong> For serious fraud, file police complaint and cybercrime report at cybercrime.gov.in
              </li>
              <li>
                <strong className="text-white">Bank Chargeback:</strong> Contact your bank immediately for unauthorized transactions or fraud
              </li>
            </ol>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">📞 Report Security Issues</h2>
            <div className="bg-slate-700/50 rounded-lg p-6">
              <p className="text-slate-300 mb-4">
                If you encounter fraud, suspicious behavior, or security vulnerabilities, contact us immediately:
              </p>
              <div className="space-y-2 text-slate-300">
                <p><strong className="text-white">Security Email:</strong> <a href="mailto:bell24h.helpline@gmail.com" className="text-blue-400 hover:text-blue-300">bell24h.helpline@gmail.com</a></p>
                <p><strong className="text-white">Support Email:</strong> <a href="mailto:bell24h.helpline@gmail.com" className="text-blue-400 hover:text-blue-300">bell24h.helpline@gmail.com</a></p>
                <p><strong className="text-white">Phone:</strong> +91-9004962871 (24/7 for emergencies)</p>
                <p className="text-sm text-slate-400 mt-4">All reports are confidential and investigated within 24-48 hours.</p>
              </div>
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
