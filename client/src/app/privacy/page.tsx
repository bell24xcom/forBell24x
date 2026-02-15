'use client';

import { useEffect, useState } from 'react';

export default function PrivacyPage() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading Privacy Policy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span>🛡️</span>
            </div>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>Privacy Policy - BELL24H</h1>
            <p className='text-xl text-gray-600'>Last updated: July 13, 2024</p>
          </div>

          {/* Main Content */}
          <div className='bg-white rounded-2xl shadow-xl p-8'>
            <div className='prose prose-lg max-w-none'>
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>1. Introduction</h2>
                <p className='text-gray-700 mb-4'>
                  BELL24H Global ("we," "our," or "us") is committed to protecting your privacy.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your
                  information when you use our B2B marketplace platform.
                </p>
                <div className='bg-blue-50 rounded-lg p-4 mb-4'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <span>✅</span>
                    <span className='font-semibold text-blue-900'>GDPR Compliant</span>
                  </div>
                  <p className='text-blue-800 text-sm'>
                    We are fully compliant with the General Data Protection Regulation (GDPR) and
                    provide users with complete control over their personal data.
                  </p>
                </div>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  2. Information We Collect
                </h2>

                <h3 className='text-lg font-semibold text-gray-900 mb-3'>Personal Information</h3>
                <p className='text-gray-700 mb-4'>
                  We collect information you provide directly to us, such as:
                </p>
                <ul className='list-disc list-inside text-gray-700 space-y-2 mb-6'>
                  <li>Name, email address, and contact information</li>
                  <li>Company details and business information</li>
                  <li>Payment and billing information</li>
                  <li>Communication preferences and settings</li>
                </ul>

                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  Automatically Collected Information
                </h3>
                <p className='text-gray-700 mb-4'>
                  We automatically collect certain information when you use our platform:
                </p>
                <ul className='list-disc list-inside text-gray-700 space-y-2 mb-6'>
                  <li>Device information and IP addresses</li>
                  <li>Usage data and analytics</li>
                  <li>Cookies and similar technologies</li>
                  <li>Voice recordings (for Voice RFQ feature)</li>
                </ul>

                <div className='bg-green-50 rounded-lg p-4 mb-4'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <span>🔒</span>
                    <span className='font-semibold text-green-900'>Secure Data Collection</span>
                  </div>
                  <p className='text-green-800 text-sm'>
                    All data collection is performed using industry-standard encryption and security
                    protocols.
                  </p>
                </div>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  3. How We Use Your Information
                </h2>
                <p className='text-gray-700 mb-4'>
                  We use the collected information for the following purposes:
                </p>
                <ul className='list-disc list-inside text-gray-700 space-y-2 mb-6'>
                  <li>Provide and maintain our B2B marketplace services</li>
                  <li>Process transactions and payments</li>
                  <li>Match you with relevant suppliers and buyers</li>
                  <li>Improve our AI algorithms and platform functionality</li>
                  <li>Send important updates and notifications</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  4. Information Sharing and Disclosure
                </h2>
                <p className='text-gray-700 mb-4'>
                  We do not sell, trade, or rent your personal information to third parties. We may
                  share your information in the following circumstances:
                </p>
                <ul className='list-disc list-inside text-gray-700 space-y-2 mb-6'>
                  <li>With your explicit consent</li>
                  <li>To facilitate B2B transactions between users</li>
                  <li>With trusted service providers who assist in platform operations</li>
                  <li>To comply with legal requirements or protect our rights</li>
                  <li>In connection with business transfers or mergers</li>
                </ul>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>5. Data Security</h2>
                <p className='text-gray-700 mb-4'>
                  We implement comprehensive security measures to protect your information:
                </p>
                <div className='grid md:grid-cols-2 gap-4 mb-6'>
                  <div className='bg-gray-50 rounded-lg p-4'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <span>🔒</span>
                      <span className='font-semibold text-gray-900'>Encryption</span>
                    </div>
                    <p className='text-gray-700 text-sm'>
                      All data is encrypted using AES-256 encryption both in transit and at rest.
                    </p>
                  </div>

                  <div className='bg-gray-50 rounded-lg p-4'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <span>🛡️</span>
                      <span className='font-semibold text-gray-900'>Access Control</span>
                    </div>
                    <p className='text-gray-700 text-sm'>
                      Strict access controls and authentication protocols protect your data.
                    </p>
                  </div>

                  <div className='bg-gray-50 rounded-lg p-4'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <Database className='w-5 h-5 text-purple-600' />
                      <span className='font-semibold text-gray-900'>Secure Storage</span>
                    </div>
                    <p className='text-gray-700 text-sm'>
                      Data is stored in secure, redundant cloud infrastructure with regular backups.
                    </p>
                  </div>

                  <div className='bg-gray-50 rounded-lg p-4'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <span>👁️</span>
                      <span className='font-semibold text-gray-900'>Monitoring</span>
                    </div>
                    <p className='text-gray-700 text-sm'>
                      Continuous monitoring and threat detection systems protect against
                      unauthorized access.
                    </p>
                  </div>
                </div>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  6. Your Rights and Choices
                </h2>
                <p className='text-gray-700 mb-4'>
                  Under GDPR and other applicable laws, you have the following rights:
                </p>
                <ul className='list-disc list-inside text-gray-700 space-y-2 mb-6'>
                  <li>
                    <strong>Access:</strong> Request a copy of your personal data
                  </li>
                  <li>
                    <strong>Rectification:</strong> Correct inaccurate or incomplete data
                  </li>
                  <li>
                    <strong>Erasure:</strong> Request deletion of your personal data
                  </li>
                  <li>
                    <strong>Portability:</strong> Receive your data in a structured format
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to processing of your data
                  </li>
                  <li>
                    <strong>Restriction:</strong> Limit how we process your data
                  </li>
                </ul>

                <div className='bg-purple-50 rounded-lg p-4 mb-4'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <span>🌍</span>
                    <span className='font-semibold text-purple-900'>Global Privacy Rights</span>
                  </div>
                  <p className='text-purple-800 text-sm'>
                    We respect privacy rights worldwide and comply with local data protection laws
                    in all jurisdictions where we operate.
                  </p>
                </div>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  7. Cookies and Tracking Technologies
                </h2>
                <p className='text-gray-700 mb-4'>
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className='list-disc list-inside text-gray-700 space-y-2 mb-6'>
                  <li>
                    <strong>Essential Cookies:</strong> Required for platform functionality
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand usage patterns
                  </li>
                  <li>
                    <strong>Preference Cookies:</strong> Remember your settings and choices
                  </li>
                  <li>
                    <strong>Marketing Cookies:</strong> Provide relevant content and offers
                  </li>
                </ul>
                <p className='text-gray-700'>
                  You can control cookie preferences through your browser settings or our privacy
                  dashboard.
                </p>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  8. International Data Transfers
                </h2>
                <p className='text-gray-700 mb-4'>
                  As a global platform, your data may be transferred to and processed in countries
                  other than your own. We ensure appropriate safeguards are in place:
                </p>
                <ul className='list-disc list-inside text-gray-700 space-y-2 mb-6'>
                  <li>Standard Contractual Clauses (SCCs) for EU data transfers</li>
                  <li>Adequacy decisions where applicable</li>
                  <li>Certification schemes and codes of conduct</li>
                  <li>Regular privacy impact assessments</li>
                </ul>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>9. Data Retention</h2>
                <p className='text-gray-700 mb-4'>
                  We retain your personal data only as long as necessary to fulfill the purposes
                  outlined in this policy:
                </p>
                <ul className='list-disc list-inside text-gray-700 space-y-2 mb-6'>
                  <li>Account data: Until account deletion or 7 years after last activity</li>
                  <li>Transaction data: 10 years for tax and legal compliance</li>
                  <li>Communication data: 3 years for customer service purposes</li>
                  <li>Analytics data: 2 years for platform improvement</li>
                </ul>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  10. Children's Privacy
                </h2>
                <p className='text-gray-700 mb-4'>
                  Our platform is designed for business users and is not intended for children under
                  16. We do not knowingly collect personal information from children under 16.
                </p>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  11. Changes to This Policy
                </h2>
                <p className='text-gray-700 mb-4'>
                  We may update this Privacy Policy from time to time. We will notify you of any
                  material changes by:
                </p>
                <ul className='list-disc list-inside text-gray-700 space-y-2 mb-6'>
                  <li>Email notification to your registered email address</li>
                  <li>Prominent notice on our platform</li>
                  <li>Updated "Last updated" date at the top of this policy</li>
                </ul>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>12. Contact Us</h2>
                <p className='text-gray-700 mb-4'>
                  If you have any questions about this Privacy Policy or our data practices, please
                  contact us:
                </p>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <p className='text-gray-700'>
                    <strong>Data Protection Officer:</strong>
                    <br />
                    Email: dpo@bell24h.com
                    <br />
                    Phone: +1 (555) 123-4567
                    <br />
                    Address: BELL24H Global, 123 Business Street, Suite 100, New York, NY 10001
                  </p>
                </div>

                <div className='bg-yellow-50 rounded-lg p-4 mt-4'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <AlertCircle className='w-5 h-5 text-yellow-600' />
                    <span className='font-semibold text-yellow-900'>Privacy Complaints</span>
                  </div>
                  <p className='text-yellow-800 text-sm'>
                    You have the right to lodge a complaint with your local data protection
                    authority if you believe we have not addressed your privacy concerns adequately.
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className='text-center mt-8'>
            <div className='flex items-center justify-center space-x-4 text-sm text-gray-600'>
              <span>© 2024 BELL24H Global. All rights reserved.</span>
              <span>•</span>
              <a href='/terms' className='hover:text-blue-600'>
                Terms of Service
              </a>
              <span>•</span>
              <a href='/contact' className='hover:text-blue-600'>
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
