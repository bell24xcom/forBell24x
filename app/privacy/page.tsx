import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-slate-400 mb-8">Last Updated: February 26, 2026</p>

          <div className="space-y-8 text-slate-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="mb-4">
                Bell24h ("we," "us," or "our"), operated by DIGITEX STUDIO, is committed to protecting your privacy and ensuring the security of your personal information.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use www.bell24h.com ("Platform").
              </p>
              <p className="mb-4">
                This Policy complies with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Digital Personal Data Protection Act, 2023 (India)</strong> - Governs collection and processing of personal data</li>
                <li><strong className="text-white">Information Technology Act, 2000 and Rules</strong> - Establishes data protection standards</li>
                <li><strong className="text-white">General Data Protection Regulation (GDPR)</strong> - For users in the European Economic Area</li>
              </ul>
              <p className="mt-4">
                By using Bell24h, you consent to the data practices described in this Policy. If you do not agree, please discontinue use immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.1 Information You Provide Directly</h3>
              <p className="mb-4">When you register, post RFQs, submit quotes, or use our services, we collect:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Account Information:</strong> Name, email address, mobile number, company/business name, role (Buyer/Supplier)</li>
                <li><strong className="text-white">Business Verification:</strong> GST number, Udyam Aadhar number, trade license, company registration certificate (optional, for verified status)</li>
                <li><strong className="text-white">Profile Information:</strong> Business description, location/address, product categories, service areas, website URL, logo/avatar</li>
                <li><strong className="text-white">RFQ and Quote Data:</strong> Product requirements, specifications, quantities, budgets, delivery locations, timelines, attached documents/images</li>
                <li><strong className="text-white">Payment Information:</strong> For credit purchases or paid plans, payment data is processed by Razorpay (our payment gateway). We do NOT store full credit card numbers or CVV codes.</li>
                <li><strong className="text-white">Communication:</strong> Messages exchanged with other users, support tickets, feedback forms</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.2 Information Collected Automatically</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Device and Browser Information:</strong> IP address, browser type and version, operating system, device identifiers, screen resolution</li>
                <li><strong className="text-white">Usage Data:</strong> Pages visited, features used, time spent on pages, click patterns, search queries, RFQ views, quote submissions</li>
                <li><strong className="text-white">Location Data:</strong> Approximate location based on IP address (for regional content and supplier matching)</li>
                <li><strong className="text-white">Cookies and Tracking Technologies:</strong> We use cookies, web beacons, and similar technologies. See Section 8 for details.</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.3 Information from Third-Party Services</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">MSG91 (OTP Verification):</strong> Mobile number, OTP verification status, message delivery status</li>
                <li><strong className="text-white">Razorpay (Payments):</strong> Payment transaction details, payment method, transaction status</li>
                <li><strong className="text-white">NVIDIA AI (Voice/Video Processing):</strong> Audio/video content you upload for RFQ creation is processed by NVIDIA's AI models (DeepSeek V3.2, MiniMax M2.1) to extract structured data. We do not permanently store raw audio/video files beyond processing time.</li>
                <li><strong className="text-white">Cloudinary (Media Storage):</strong> Images and documents you upload are stored on Cloudinary's secure servers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use collected data for the following purposes:</p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.1 Platform Operations</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Create and manage user accounts</li>
                <li>Enable RFQ posting and quote submission</li>
                <li>Facilitate communication between Buyers and Suppliers</li>
                <li>Process payments, credits, and escrow transactions</li>
                <li>Match Buyers with relevant Suppliers based on categories, location, and requirements</li>
                <li>Track deal status and calculate platform fees/commissions</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.2 Service Improvement and Personalization</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Analyze user behavior to improve features and user experience</li>
                <li>Personalize content, recommendations, and search results</li>
                <li>Develop new features and AI models for better RFQ extraction</li>
                <li>Conduct A/B testing and performance analysis</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.3 Communication and Notifications</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Send transactional emails/SMS: OTP codes, deal confirmations, payment receipts</li>
                <li>Notify you of new quotes, messages, or RFQ matches (if notification settings enabled)</li>
                <li>Send service announcements, policy updates, or important account changes</li>
                <li>Respond to support inquiries and resolve disputes</li>
                <li>Send marketing communications (you can opt out - see Section 7)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.4 Legal and Security</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Prevent fraud, abuse, and unauthorized access</li>
                <li>Enforce our Terms and Conditions</li>
                <li>Comply with legal obligations, court orders, or government requests</li>
                <li>Protect the rights, property, and safety of Bell24h, users, and the public</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Information Sharing and Disclosure</h2>
              <p className="mb-4">
                We do NOT sell your personal information to third parties. However, we may share data in the following circumstances:
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.1 With Other Users</h3>
              <p className="mb-4">
                When you post an RFQ or submit a quote, certain information becomes visible to relevant users:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Buyers can see: Supplier company name, location, trust score, quote details</li>
                <li>Suppliers can see: RFQ requirements, Buyer location (city/state only), urgency level</li>
                <li>We do NOT share full contact details (phone/email) until a quote is accepted, to prevent circumventing platform fees</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.2 With Service Providers</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">MSG91:</strong> For OTP and transactional SMS/WhatsApp delivery</li>
                <li><strong className="text-white">Razorpay:</strong> For payment processing (they have their own privacy policy)</li>
                <li><strong className="text-white">NVIDIA:</strong> For AI-powered voice/video RFQ processing</li>
                <li><strong className="text-white">Cloudinary:</strong> For image and document storage</li>
                <li><strong className="text-white">n8n (Self-Hosted):</strong> For workflow automation (no external data sharing)</li>
                <li><strong className="text-white">Vercel:</strong> For hosting and deployment infrastructure</li>
              </ul>
              <p className="mt-4">
                All service providers are contractually obligated to protect your data and use it only for the specified purposes.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.3 For Legal Compliance</h3>
              <p className="mb-4">
                We may disclose information if required by law, legal process, court order, or government request, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Tax authorities (GST compliance)</li>
                <li>Law enforcement agencies (fraud investigations)</li>
                <li>Regulatory bodies (RBI, SEBI, etc.)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.4 Business Transfers</h3>
              <p className="mb-4">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity. You will be notified of any such change.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Encryption:</strong> All data transmitted between your browser and our servers is encrypted using TLS/SSL (HTTPS)</li>
                <li><strong className="text-white">Database Security:</strong> Data is stored in encrypted databases (Neon PostgreSQL) with access controls and regular backups</li>
                <li><strong className="text-white">Authentication:</strong> OTP-based login for enhanced security (no passwords to steal)</li>
                <li><strong className="text-white">Access Controls:</strong> Only authorized personnel can access personal data, and access is logged</li>
                <li><strong className="text-white">Regular Audits:</strong> Security audits and vulnerability assessments are conducted periodically</li>
              </ul>
              <p className="mt-4 text-yellow-400">
                ⚠️ <strong>Important:</strong> No method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Data Retention</h2>
              <p className="mb-4">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Policy, unless a longer retention period is required or permitted by law.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Active Accounts:</strong> Data retained while your account is active</li>
                <li><strong className="text-white">Deleted Accounts:</strong> Data is anonymized or deleted within 90 days of account deletion, except:</li>
                <ul className="list-disc list-inside space-y-1 ml-8 mt-2">
                  <li>Transaction records (retained for 7 years for tax/audit compliance)</li>
                  <li>Dispute/fraud records (retained for legal defense purposes)</li>
                  <li>Anonymized analytics data (retained indefinitely)</li>
                </ul>
                <li><strong className="text-white">Inactive Accounts:</strong> Accounts inactive for 3+ years may be archived or deleted after email notification</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights and Choices</h2>
              <p className="mb-4">
                Under Indian and international data protection laws, you have the following rights:
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">7.1 Access and Portability</h3>
              <p className="mb-4">
                You can request a copy of your personal data in a structured, machine-readable format. Contact privacy@bell24h.com.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">7.2 Correction and Update</h3>
              <p className="mb-4">
                You can update your profile information, business details, and preferences directly from your account settings.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">7.3 Deletion</h3>
              <p className="mb-4">
                You can request account deletion by emailing support@bell24h.com. Note: Transaction records will be retained for legal compliance.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">7.4 Marketing Opt-Out</h3>
              <p className="mb-4">
                You can unsubscribe from marketing emails using the "Unsubscribe" link in any email, or by adjusting notification preferences in your account settings.
                Note: You cannot opt out of transactional emails (OTPs, deal confirmations, payment receipts).
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">7.5 Object to Processing</h3>
              <p className="mb-4">
                You can object to certain data processing activities (e.g., profiling for marketing). Contact privacy@bell24h.com to exercise this right.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">7.6 Withdraw Consent</h3>
              <p className="mb-4">
                Where processing is based on consent (e.g., marketing communications), you can withdraw consent at any time without affecting prior processing legality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="mb-4">
                We use cookies and similar technologies to enhance your experience and analyze Platform usage.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">8.1 Types of Cookies We Use</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Essential Cookies:</strong> Required for login, authentication, and security. Cannot be disabled.</li>
                <li><strong className="text-white">Functional Cookies:</strong> Remember your preferences (language, location filters). Can be disabled in browser settings.</li>
                <li><strong className="text-white">Analytics Cookies:</strong> Track usage patterns to improve the Platform (using Google Analytics or similar). Can be disabled via cookie banner.</li>
                <li><strong className="text-white">Third-Party Cookies:</strong> Set by Razorpay (payment processing), MSG91 (notification delivery), and other service providers.</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">8.2 Managing Cookies</h3>
              <p className="mb-4">
                You can control cookies through your browser settings. However, disabling essential cookies may impair Platform functionality. Visit our Cookie Policy page for detailed information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Children's Privacy</h2>
              <p className="mb-4">
                Bell24h is intended for business users aged 18 and above. We do not knowingly collect personal information from individuals under 18.
                If we become aware of such collection, we will delete the data promptly. Parents or guardians who believe their child has provided information to us should contact privacy@bell24h.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. International Data Transfers</h2>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than India, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">United States:</strong> NVIDIA AI servers (for voice/video processing), Vercel hosting</li>
                <li><strong className="text-white">European Union:</strong> Cloudinary (media storage)</li>
              </ul>
              <p className="mt-4">
                We ensure that all international transfers comply with applicable data protection laws and that adequate safeguards (such as Standard Contractual Clauses) are in place.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to This Privacy Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy periodically to reflect changes in our practices, legal requirements, or Platform features. Updated policies will be posted on this page with
                a revised "Last Updated" date. Material changes will be communicated via email or in-app notification.
              </p>
              <p className="mb-4">
                Continued use of Bell24h after changes indicates acceptance of the updated Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us</h2>
              <p className="mb-4">
                For privacy-related questions, concerns, or requests to exercise your data rights, please contact:
              </p>
              <div className="bg-slate-900 rounded-lg p-6 space-y-2">
                <p><strong className="text-white">Data Protection Officer:</strong> DIGITEX STUDIO (Bell24h)</p>
                <p><strong className="text-white">Email:</strong> privacy@bell24h.com</p>
                <p><strong className="text-white">Support:</strong> support@bell24h.com</p>
                <p><strong className="text-white">Phone:</strong> +91-9004962871</p>
                <p><strong className="text-white">Address:</strong> Mumbai, Maharashtra, India</p>
                <p><strong className="text-white">Response Time:</strong> We aim to respond within 7 business days</p>
              </div>
            </section>

            <section className="mt-12 pt-8 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                By using Bell24h, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your
                personal information as described herein. If you do not agree, please discontinue use of the Platform.
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
