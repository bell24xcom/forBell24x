import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-white mb-4">Terms & Conditions</h1>
          <p className="text-slate-400 mb-8">Last Updated: February 26, 2026</p>

          <div className="space-y-8 text-slate-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction and Acceptance</h2>
              <p className="mb-4">
                Welcome to Bell24h ("Platform," "we," "us," or "our"), a Business-to-Business (B2B) marketplace operated by DIGITEX STUDIO.
                By accessing or using www.bell24h.com, you ("User," "you," or "your") agree to comply with and be bound by these Terms and Conditions ("Terms").
              </p>
              <p className="mb-4">
                If you do not agree to these Terms, you must not access or use the Platform. These Terms constitute a legally binding agreement between you and DIGITEX STUDIO.
              </p>
              <p className="mb-4">
                <strong className="text-white">Jurisdiction:</strong> These Terms are governed by the laws of India. All disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra, India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Definitions</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Buyer:</strong> A registered user seeking products or services through RFQs (Request for Quotations).</li>
                <li><strong className="text-white">Supplier:</strong> A registered user offering products or services and submitting quotes in response to RFQs.</li>
                <li><strong className="text-white">RFQ:</strong> Request for Quotation submitted by Buyers describing their product/service requirements.</li>
                <li><strong className="text-white">Quote:</strong> Supplier's response to an RFQ, including price, quantity, timeline, and terms.</li>
                <li><strong className="text-white">Deal:</strong> A confirmed transaction between Buyer and Supplier following RFQ-Quote acceptance.</li>
                <li><strong className="text-white">Escrow:</strong> A secure payment holding service where funds are held by Bell24h until delivery confirmation.</li>
                <li><strong className="text-white">Credits:</strong> Platform currency used to unlock leads, access premium features, or pay platform fees.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Eligibility and Account Registration</h2>
              <p className="mb-4">
                <strong className="text-white">3.1 Eligibility:</strong> You must be (i) at least 18 years of age, (ii) a registered business entity or authorized representative thereof,
                and (iii) legally capable of entering into binding contracts under Indian law.
              </p>
              <p className="mb-4">
                <strong className="text-white">3.2 Account Creation:</strong> You must provide accurate and complete information during registration, including business name,
                contact details, GST number (if applicable), and Udyam Aadhar number (for MSME benefits). You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              <p className="mb-4">
                <strong className="text-white">3.3 OTP Verification:</strong> We use MSG91 for mobile number verification via One-Time Password (OTP). By registering, you consent to receive
                OTP messages and transactional SMS/WhatsApp notifications related to your account and RFQ activity.
              </p>
              <p className="mb-4">
                <strong className="text-white">3.4 Business Verification:</strong> To increase trust score and access premium features, you may be required to submit business verification
                documents such as GST certificate, trade license, or company incorporation certificate. Verified suppliers receive priority visibility.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Platform Services</h2>
              <p className="mb-4">
                <strong className="text-white">4.1 RFQ Posting (Buyers):</strong> Buyers can post RFQs describing product/service requirements. RFQs must contain accurate information including
                quantity, specifications, budget range, delivery location, and timeline. Bell24h reserves the right to reject or remove RFQs that violate these Terms or contain prohibited items.
              </p>
              <p className="mb-4">
                <strong className="text-white">4.2 Quote Submission (Suppliers):</strong> Suppliers can browse RFQs and submit competitive quotes. Quotes must be genuine, realistic, and honor
                the terms stated therein for at least 7 days unless otherwise specified.
              </p>
              <p className="mb-4">
                <strong className="text-white">4.3 AI-Powered Features:</strong> The Platform uses NVIDIA-powered AI models (DeepSeek V3.2 for text, MiniMax M2.1 for video) to transcribe voice/video
                RFQs and extract structured data. By using voice or video RFQ features, you consent to AI processing of your content. AI-generated outputs are provided for convenience and may require manual review.
              </p>
              <p className="mb-4">
                <strong className="text-white">4.4 Communication:</strong> Direct communication between Buyers and Suppliers is facilitated via the Platform's messaging system. Users must not share external
                contact details in initial messages to circumvent platform fees. Repeat violations may result in account suspension.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Payments and Financial Terms</h2>
              <p className="mb-4">
                <strong className="text-white">5.1 Payment Gateway:</strong> Bell24h uses Razorpay as its authorized payment gateway. All transactions are subject to Razorpay's terms and conditions.
                We support UPI, credit/debit cards, net banking, and wallets.
              </p>
              <p className="mb-4">
                <strong className="text-white">5.2 Platform Fees:</strong> Bell24h charges a service fee on successful deals. Fee structure varies by plan (Free, Pro, Enterprise).
                Current fees are displayed at www.bell24h.com/pricing. Fees are non-refundable unless explicitly stated in the Refund Policy.
              </p>
              <p className="mb-4">
                <strong className="text-white">5.3 Escrow Service:</strong> For transactions above ₹50,000, Bell24h offers optional Escrow service. Buyer deposits payment with Bell24h,
                funds are released to Supplier upon Buyer's delivery confirmation. Escrow fees apply (1.5% of transaction value). Disputes during escrow are resolved per Section 9.
              </p>
              <p className="mb-4">
                <strong className="text-white">5.4 GST Compliance:</strong> All platform fees are subject to 18% GST as per Indian tax laws. Invoices with GST details will be issued for all paid transactions.
              </p>
              <p className="mb-4">
                <strong className="text-white">5.5 Credits System:</strong> Users can purchase Credits to unlock leads or access premium features. Credit prices are displayed at purchase time.
                Credits are valid for 12 months from purchase date and are non-transferable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. User Conduct and Prohibited Activities</h2>
              <p className="mb-4">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Post false, misleading, or fraudulent RFQs or Quotes</li>
                <li>Engage in price manipulation, bid rigging, or collusion</li>
                <li>Use the Platform for illegal products or services (weapons, drugs, counterfeit goods, etc.)</li>
                <li>Harass, abuse, or threaten other users</li>
                <li>Scrape, crawl, or extract Platform data using automated tools</li>
                <li>Create multiple accounts to manipulate rankings or reviews</li>
                <li>Share external contact details to avoid platform fees during initial negotiation</li>
                <li>Violate any Indian laws including IT Act 2000, Consumer Protection Act 2019, or RBI payment guidelines</li>
              </ul>
              <p className="mt-4">
                Violation of these prohibitions may result in immediate account suspension, forfeiture of credits, and legal action where applicable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property Rights</h2>
              <p className="mb-4">
                <strong className="text-white">7.1 Platform IP:</strong> All content, features, functionality, and design of Bell24h (including logos, trademarks, software, UI/UX) are owned by
                DIGITEX STUDIO and protected by Indian and international copyright, trademark, and intellectual property laws.
              </p>
              <p className="mb-4">
                <strong className="text-white">7.2 User Content:</strong> By posting RFQs, Quotes, or other content, you grant Bell24h a non-exclusive, worldwide, royalty-free license to use,
                reproduce, display, and distribute your content solely for operating and promoting the Platform. You retain ownership of your original content.
              </p>
              <p className="mb-4">
                <strong className="text-white">7.3 Third-Party Trademarks:</strong> Product names, brands, or trademarks mentioned in RFQs/Quotes remain the property of their respective owners.
                Use of third-party trademarks is for identification purposes only and does not imply endorsement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Deal Completion and Performance</h2>
              <p className="mb-4">
                <strong className="text-white">8.1 Binding Agreement:</strong> Once a Buyer accepts a Supplier's Quote, it constitutes a binding agreement between Buyer and Supplier.
                Bell24h is NOT a party to this contract and is not liable for non-performance by either party.
              </p>
              <p className="mb-4">
                <strong className="text-white">8.2 Deal Tracking:</strong> Bell24h tracks deal status for analytics and commission calculation. Users are expected to update deal status
                (In Progress, Completed, or Cancelled). For deals completed outside the platform, users must mark the status accordingly.
              </p>
              <p className="mb-4">
                <strong className="text-white">8.3 Follow-Up:</strong> Bell24h may send automated follow-ups (7 days post-acceptance) asking Buyers to confirm deal completion. Confirmed
                completions contribute to Supplier reputation scores.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Dispute Resolution</h2>
              <p className="mb-4">
                <strong className="text-white">9.1 Internal Resolution:</strong> Users are encouraged to resolve disputes amicably through Platform messaging. Bell24h offers mediation services
                for disputes involving Escrow payments or reported fraud.
              </p>
              <p className="mb-4">
                <strong className="text-white">9.2 Arbitration:</strong> Disputes that cannot be resolved internally shall be submitted to binding arbitration under the Arbitration and
                Conciliation Act, 1996. Arbitration shall take place in Mumbai, Maharashtra, India. Arbitrator's decision is final and binding.
              </p>
              <p className="mb-4">
                <strong className="text-white">9.3 Legal Action:</strong> Bell24h reserves the right to take legal action against users engaging in fraud, financial misconduct, or violations
                resulting in damages. Users agree to reimburse Bell24h for legal costs incurred due to their violations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Limitation of Liability and Disclaimers</h2>
              <p className="mb-4">
                <strong className="text-white">10.1 Platform as Facilitator:</strong> Bell24h is a technology platform connecting Buyers and Suppliers. We do NOT manufacture, sell, or guarantee
                products/services listed. Bell24h is NOT liable for the quality, safety, legality, or delivery of products/services exchanged through the Platform.
              </p>
              <p className="mb-4">
                <strong className="text-white">10.2 No Warranties:</strong> The Platform is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, express or implied, including but not
                limited to merchantability, fitness for a particular purpose, or non-infringement.
              </p>
              <p className="mb-4">
                <strong className="text-white">10.3 Limitation of Damages:</strong> To the maximum extent permitted by law, Bell24h and its affiliates shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses,
                resulting from: (i) your use or inability to use the Platform; (ii) unauthorized access to your account; (iii) user conduct or content; (iv) deal disputes between Buyers and Suppliers.
              </p>
              <p className="mb-4">
                <strong className="text-white">10.4 Maximum Liability:</strong> Bell24h's total liability for any claims arising from use of the Platform shall not exceed ₹10,000 or the amount of fees
                paid by you in the 12 months preceding the claim, whichever is greater.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Termination and Account Suspension</h2>
              <p className="mb-4">
                <strong className="text-white">11.1 Termination by User:</strong> You may terminate your account at any time by contacting support@bell24h.com. Unused Credits will be forfeited upon termination.
              </p>
              <p className="mb-4">
                <strong className="text-white">11.2 Termination by Bell24h:</strong> We reserve the right to suspend or terminate your account immediately, without prior notice, for violations of these Terms,
                suspicious activity, fraudulent behavior, or at our sole discretion. Repeated violations or serious misconduct may result in permanent ban.
              </p>
              <p className="mb-4">
                <strong className="text-white">11.3 Effect of Termination:</strong> Upon termination: (i) access to the Platform is revoked; (ii) ongoing deals remain binding between Buyer and Supplier;
                (iii) outstanding platform fees remain payable; (iv) data may be retained per our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Amendments to Terms</h2>
              <p className="mb-4">
                Bell24h reserves the right to modify these Terms at any time. Updated Terms will be posted on this page with a revised "Last Updated" date. Material changes will be notified via email or
                in-app notification. Continued use of the Platform after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Compliance with Indian Laws</h2>
              <p className="mb-4">
                Bell24h operates in full compliance with Indian laws including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Information Technology Act, 2000:</strong> Governs electronic transactions and data protection</li>
                <li><strong className="text-white">Consumer Protection Act, 2019:</strong> Protects buyer rights in e-commerce</li>
                <li><strong className="text-white">Reserve Bank of India (RBI) Guidelines:</strong> Regulates digital payments and escrow services</li>
                <li><strong className="text-white">GST Act, 2017:</strong> Governs taxation on platform fees and transactions</li>
                <li><strong className="text-white">Digital Personal Data Protection Act, 2023:</strong> Governs collection and processing of personal data</li>
              </ul>
              <p className="mt-4">
                Users must comply with all applicable laws in their jurisdiction when using the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Contact Information</h2>
              <p className="mb-4">
                For questions, concerns, or legal inquiries regarding these Terms, please contact:
              </p>
              <div className="bg-slate-900 rounded-lg p-6 space-y-2">
                <p><strong className="text-white">Company Name:</strong> DIGITEX STUDIO (Bell24h)</p>
                <p><strong className="text-white">Registered Address:</strong> Mumbai, Maharashtra, India</p>
                <p><strong className="text-white">Email:</strong> legal@bell24h.com</p>
                <p><strong className="text-white">Support:</strong> support@bell24h.com</p>
                <p><strong className="text-white">Phone:</strong> +91-9004962871</p>
                <p><strong className="text-white">Business Hours:</strong> Monday-Saturday, 10:00 AM - 7:00 PM IST</p>
              </div>
            </section>

            <section className="mt-12 pt-8 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                By using Bell24h, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                If you do not agree, you must discontinue use of the Platform immediately.
              </p>
            </section>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-3 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
