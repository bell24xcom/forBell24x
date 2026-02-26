import Link from 'next/link';

export default function GSTCompliancePage() {
  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">GST Compliance on Bell24h</h1>
          <p className="text-slate-300 text-lg">Seamless GST-compliant B2B transactions across India</p>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🇮🇳 Why GST Compliance Matters</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Bell24h is fully compliant with India's Goods and Services Tax (GST) Act, 2017. All transactions on our platform support GST-compliant
              invoicing, helping businesses meet their tax obligations while enjoying seamless B2B commerce.
            </p>
            <p className="text-slate-300 leading-relaxed">
              As a registered B2B marketplace, we ensure that all platform fees, subscription charges, and escrow services include proper GST
              documentation with GSTIN, HSN/SAC codes, and tax breakdowns.
            </p>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">✅ GST Features on Bell24h</h2>
            <div className="space-y-4 text-slate-300">
              <div className="flex items-start">
                <span className="text-green-400 mr-3 text-xl shrink-0">✓</span>
                <div>
                  <strong className="text-white">Supplier GST Verification:</strong> All registered suppliers provide their GST number during
                  onboarding. Buyers can verify GST authenticity before engaging in transactions.
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-400 mr-3 text-xl shrink-0">✓</span>
                <div>
                  <strong className="text-white">GST-Compliant Invoices:</strong> Suppliers can generate invoices with full GST details including
                  GSTIN, HSN codes, CGST/SGST/IGST breakdown, and tax rates.
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-400 mr-3 text-xl shrink-0">✓</span>
                <div>
                  <strong className="text-white">Platform Fee GST Invoices:</strong> Bell24h issues GST invoices for all platform fees, subscription
                  charges, and escrow services. Invoices include our GSTIN and 18% GST breakdown.
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-400 mr-3 text-xl shrink-0">✓</span>
                <div>
                  <strong className="text-white">HSN/SAC Code Support:</strong> Suppliers can specify HSN codes for goods and SAC codes for services
                  in their product listings and quotes.
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-400 mr-3 text-xl shrink-0">✓</span>
                <div>
                  <strong className="text-white">Inter-State & Intra-State Transactions:</strong> Automatic calculation of IGST (inter-state) or
                  CGST+SGST (intra-state) based on buyer and supplier locations.
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-400 mr-3 text-xl shrink-0">✓</span>
                <div>
                  <strong className="text-white">Input Tax Credit (ITC) Support:</strong> All invoices formatted to support ITC claims. Buyers receive
                  proper documentation for filing GST returns.
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">📋 GST Rates on Bell24h</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-slate-300">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-white">Service</th>
                    <th className="text-left py-3 px-4 text-white">GST Rate</th>
                    <th className="text-left py-3 px-4 text-white">SAC Code</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4">Platform Fees (Free/Pro/Enterprise)</td>
                    <td className="py-3 px-4">18%</td>
                    <td className="py-3 px-4">998314</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4">Escrow Service Charges</td>
                    <td className="py-3 px-4">18%</td>
                    <td className="py-3 px-4">997159</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4">Credit Purchases</td>
                    <td className="py-3 px-4">18%</td>
                    <td className="py-3 px-4">998314</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Subscription Plans</td>
                    <td className="py-3 px-4">18%</td>
                    <td className="py-3 px-4">998314</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-400 text-sm mt-4">
              Note: GST rates are as per current Indian tax laws and may change based on government notifications.
            </p>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🔍 How to Verify Supplier GST</h2>
            <ol className="list-decimal list-inside space-y-3 text-slate-300 ml-4">
              <li>
                Check the supplier profile for the <strong className="text-white">GST Verified</strong> badge
              </li>
              <li>
                View the supplier's GSTIN (15-digit GST identification number) on their profile
              </li>
              <li>
                Verify the GSTIN on the official GST portal:{' '}
                <a href="https://services.gst.gov.in/services/searchtp" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  services.gst.gov.in/services/searchtp
                </a>
              </li>
              <li>
                Request GST certificate copy before finalizing high-value deals
              </li>
              <li>
                Check if the supplier's registered business name matches their GST certificate
              </li>
            </ol>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">💡 Benefits of GST-Compliant Trading</h2>
            <ul className="space-y-2 text-slate-300 list-disc list-inside ml-4">
              <li>Claim Input Tax Credit (ITC) on all business purchases</li>
              <li>Build credibility with verified GST status</li>
              <li>Simplified tax filing with proper invoice documentation</li>
              <li>Seamless inter-state transactions with IGST support</li>
              <li>Compliance with government regulations avoids penalties</li>
              <li>Easier access to business loans and credit with GST records</li>
              <li>Transparent pricing with clear tax breakdowns</li>
            </ul>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">❓ Common GST Questions</h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="font-semibold text-white mb-1">Q: Do I need GST registration to use Bell24h?</h3>
                <p className="text-sm">
                  A: GST registration is not mandatory for using Bell24h, but verified suppliers with GST get priority visibility and higher trust scores.
                  Buyers can transact with or without GST, but registered businesses benefit from ITC claims.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Q: Will Bell24h issue GST invoices for platform fees?</h3>
                <p className="text-sm">
                  A: Yes, we issue GST-compliant invoices for all platform fees, subscriptions, and escrow charges. Invoices are available in your
                  Dashboard under Billing → Invoices.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Q: How do I update my GST details?</h3>
                <p className="text-sm">
                  A: Go to Dashboard → Profile → Business Details → Update GSTIN. Upload your GST certificate for verification. Changes reflect within 24-48 hours.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">📞 GST Support</h2>
            <p className="text-slate-300 mb-4">
              Need help with GST compliance, invoicing, or verification?
            </p>
            <div className="space-y-2 text-slate-300">
              <p><strong className="text-white">Email:</strong> <a href="mailto:compliance@bell24h.com" className="text-blue-400 hover:text-blue-300">compliance@bell24h.com</a></p>
              <p><strong className="text-white">Phone:</strong> +91-9004962871</p>
              <p><strong className="text-white">Support Hours:</strong> Monday-Saturday, 10:00 AM - 7:00 PM IST</p>
            </div>
          </section>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-3 rounded-lg transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
