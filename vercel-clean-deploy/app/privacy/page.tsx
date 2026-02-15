// app/privacy/page.tsx - Privacy Policy for Razorpay Compliance
'use client';

import { Shield, Lock, Eye, Database, Users, Phone, Mail } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-sm text-gray-600">Effective Date: September 11, 2025</p>
            <p className="text-sm text-gray-600">Last Updated: September 11, 2025</p>
          </div>

          <div className="prose max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="h-6 w-6 text-blue-600 mr-2" />
                1. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Personal Information</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Name, email address, and phone number</li>
                    <li>Company details and business information</li>
                    <li>Payment and billing information</li>
                    <li>Profile pictures and business documents</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Usage Information</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Platform usage patterns and preferences</li>
                    <li>RFQ submissions and quote requests</li>
                    <li>Transaction history and payment records</li>
                    <li>Communication logs and support interactions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Technical Information</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>IP address and device information</li>
                    <li>Browser type and operating system</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Location data (with your consent)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="h-6 w-6 text-blue-600 mr-2" />
                2. How We Use Your Information
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Service Provision</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Provide B2B marketplace services and features</li>
                    <li>Process transactions and manage payments</li>
                    <li>Facilitate supplier-buyer connections</li>
                    <li>Send important service notifications</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Communication</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Send OTP verification codes via SMS</li>
                    <li>Email updates about your account and transactions</li>
                    <li>Marketing communications (with your consent)</li>
                    <li>Customer support and service responses</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Platform Improvement</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Analyze usage patterns to improve our services</li>
                    <li>Develop new features and functionality</li>
                    <li>Conduct research and analytics</li>
                    <li>Prevent fraud and ensure platform security</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="h-6 w-6 text-blue-600 mr-2" />
                3. Data Security and Protection
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>SSL encryption for all data transmission</li>
                  <li>Secure payment processing through Razorpay</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication systems</li>
                  <li>Data backup and disaster recovery procedures</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                4. Information Sharing
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  We do not sell your personal information. We may share information in these circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>With service providers (Razorpay, MSG91, Neon.tech) for essential functions</li>
                  <li>When required by law or legal process</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>With your explicit consent</li>
                  <li>In case of business transfers or mergers</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights and Choices</h2>
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Essential cookies for platform functionality</li>
                  <li>Analytics cookies to understand usage patterns</li>
                  <li>Marketing cookies for personalized content</li>
                  <li>You can manage cookie preferences in your browser settings</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  We retain your information for as long as necessary to provide our services and comply with legal obligations:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Account information: Until account deletion</li>
                  <li>Transaction records: 7 years for tax compliance</li>
                  <li>Communication logs: 3 years</li>
                  <li>Marketing data: Until consent withdrawal</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Transfers</h2>
              <p className="text-gray-700">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700">
                Our services are not intended for children under 18. We do not knowingly collect personal information from children under 18. If we become aware of such collection, we will take steps to delete the information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="h-6 w-6 text-blue-600 mr-2" />
                Contact Information
              </h2>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Privacy Officer:</strong> privacy@bell24h.com
                </p>
                <p className="text-gray-700">
                  <strong>General Inquiries:</strong> support@bell24h.com
                </p>
                <p className="text-gray-700">
                  <strong>Data Protection:</strong> dpo@bell24h.com
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> Bell24h Technologies Pvt Ltd, India
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}