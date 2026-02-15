// app/terms/page.tsx - Terms of Service for Razorpay Compliance
'use client';

import { FileText, Shield, CreditCard, Users, AlertTriangle, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-sm text-gray-600">Last Updated: September 11, 2025</p>
            <p className="text-sm text-gray-600">Effective Date: September 11, 2025</p>
          </div>

          <div className="prose max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Scale className="h-6 w-6 text-blue-600 mr-2" />
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700">
                By accessing or using Bell24h.com ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services. These Terms constitute a legally binding agreement between you and Bell24h Technologies Pvt Ltd.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                2. Description of Services
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Bell24h is a B2B marketplace platform that provides the following services:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Supplier verification and trust scoring</li>
                  <li>RFQ (Request for Quote) management and submission</li>
                  <li>Quote comparison and supplier matching</li>
                  <li>Secure payment processing and escrow services</li>
                  <li>Transaction management and dispute resolution</li>
                  <li>Communication tools for buyers and suppliers</li>
                  <li>Analytics and reporting features</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 text-blue-600 mr-2" />
                3. User Accounts and Registration
              </h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Account Creation</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>You must provide accurate and complete information during registration</li>
                  <li>You are responsible for maintaining the confidentiality of your account</li>
                  <li>You must be at least 18 years old to create an account</li>
                  <li>One person or entity may not maintain multiple accounts</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-800 mb-2">Account Security</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>You are responsible for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>We may suspend accounts that violate these Terms</li>
                  <li>Account verification may be required for certain services</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Obligations and Prohibited Activities</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">You agree to:</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Provide accurate and up-to-date information</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Respect intellectual property rights</li>
                  <li>Maintain professional conduct in all communications</li>
                  <li>Use the platform only for legitimate business purposes</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-800 mb-2">You agree NOT to:</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Post false, misleading, or fraudulent information</li>
                  <li>Engage in spam, harassment, or abusive behavior</li>
                  <li>Attempt to circumvent security measures</li>
                  <li>Use automated systems to access the platform</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Interfere with other users' use of the platform</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
                5. Payment Terms and Billing
              </h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Payment Processing</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>All payments are processed securely through Razorpay</li>
                  <li>Transaction fees apply as per our pricing policy</li>
                  <li>Payment methods include credit cards, debit cards, UPI, and net banking</li>
                  <li>Refunds are processed according to our refund policy</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-800 mb-2">Escrow Services</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Funds may be held in escrow for secure transactions</li>
                  <li>Escrow release is subject to delivery confirmation</li>
                  <li>Dispute resolution procedures apply to escrow transactions</li>
                  <li>Escrow fees are disclosed before transaction confirmation</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-800 mb-2">Wallet Services</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Digital wallet for convenient payments</li>
                  <li>Wallet balance is non-transferable and non-refundable</li>
                  <li>Minimum and maximum transaction limits apply</li>
                  <li>Wallet transactions are subject to verification</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  The Platform and its content, including but not limited to text, graphics, logos, and software, are owned by Bell24h and protected by intellectual property laws.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>You may not copy, modify, or distribute our content without permission</li>
                  <li>User-generated content remains your property</li>
                  <li>You grant us a license to use your content for platform operations</li>
                  <li>We respect third-party intellectual property rights</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, and protect your information. By using our services, you consent to the collection and use of information as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Dispute Resolution</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Internal Dispute Resolution</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>We provide dispute resolution services for platform transactions</li>
                  <li>Disputes must be reported within 30 days of transaction completion</li>
                  <li>Our decision on disputes is final and binding</li>
                  <li>Dispute resolution is free for platform users</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-800 mb-2">Legal Disputes</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Disputes are governed by Indian law</li>
                  <li>Jurisdiction lies with courts in India</li>
                  <li>Arbitration may be required for certain disputes</li>
                  <li>Class action waivers apply where legally permitted</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 text-blue-600 mr-2" />
                9. Limitation of Liability
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  To the maximum extent permitted by law, Bell24h shall not be liable for:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Indirect, incidental, or consequential damages</li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Damages resulting from third-party actions</li>
                  <li>Service interruptions or technical issues</li>
                  <li>User-generated content or third-party services</li>
                </ul>
                <p className="text-gray-700">
                  Our total liability shall not exceed the amount paid by you for the services in the 12 months preceding the claim.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Service Availability and Modifications</h2>
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>We strive to maintain service availability but cannot guarantee 100% uptime</li>
                  <li>We may modify or discontinue services with reasonable notice</li>
                  <li>Scheduled maintenance may cause temporary service interruptions</li>
                  <li>We reserve the right to update features and functionality</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Termination by You</h3>
                <p className="text-gray-700">
                  You may terminate your account at any time by contacting our support team. Upon termination, your access to the platform will cease immediately.
                </p>
                
                <h3 className="text-lg font-medium text-gray-800 mb-2">Termination by Us</h3>
                <p className="text-gray-700">
                  We may suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for other reasons at our discretion.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law and Jurisdiction</h2>
              <p className="text-gray-700">
                These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts in India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these Terms from time to time. We will notify you of any material changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Legal Department:</strong> legal@bell24h.com
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Support:</strong> support@bell24h.com
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Address:</strong> Bell24h Technologies Pvt Ltd, India
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> +91-XXXX-XXXX-XX
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}