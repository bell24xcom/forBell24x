'use client';

import { useEffect, useState } from 'react';

export default function TermsPage() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading Terms of Service...</p>
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
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>Terms of Service - BELL24H</h1>
            <p className='text-xl text-gray-600'>Last updated: July 13, 2024</p>
          </div>

          {/* Main Content */}
          <div className='bg-white rounded-2xl shadow-xl p-8'>
            <div className='prose prose-lg max-w-none'>
              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  1. Acceptance of Terms
                </h2>
                <p className='text-gray-700 mb-4'>
                  By accessing and using BELL24H Global ("the Platform"), you accept and agree to be
                  bound by the terms and provision of this agreement. If you do not agree to abide
                  by the above, please do not use this service.
                </p>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  2. Description of Service
                </h2>
                <p className='text-gray-700 mb-4'>
                  BELL24H Global is a B2B marketplace platform that connects buyers and suppliers.
                  Our services include:
                </p>
                <ul className='list-disc list-inside text-gray-700 space-y-2 mb-4'>
                  <li>AI-powered supplier matching and recommendations</li>
                  <li>Voice RFQ (Request for Quotation) processing</li>
                  <li>Real-time market analytics and insights</li>
                  <li>Secure payment processing and escrow services</li>
                  <li>Multi-language support and global reach</li>
                </ul>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>3. User Accounts</h2>
                <p className='text-gray-700 mb-4'>
                  To access certain features of the Platform, you must create an account. You are
                  responsible for:
                </p>
                <ul className='list-disc list-inside text-gray-700 space-y-2 mb-4'>
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and complete information</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>4. User Conduct</h2>
                <p className='text-gray-700 mb-4'>You agree not to use the Platform to:</p>
                <ul className='list-disc list-inside text-gray-700 space-y-2 mb-4'>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Upload or transmit malicious code or content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper functioning of the Platform</li>
                </ul>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  5. Privacy and Data Protection
                </h2>
                <p className='text-gray-700 mb-4'>
                  Your privacy is important to us. Our collection and use of personal information is
                  governed by our Privacy Policy, which is incorporated into these Terms by
                  reference.
                </p>
                <div className='bg-blue-50 rounded-lg p-4 mb-4'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <span>✅</span>
                    <span className='font-semibold text-blue-900'>GDPR Compliance</span>
                  </div>
                  <p className='text-blue-800 text-sm'>
                    We are fully compliant with GDPR regulations and provide users with control over
                    their personal data.
                  </p>
                </div>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  6. Intellectual Property
                </h2>
                <p className='text-gray-700 mb-4'>
                  The Platform and its original content, features, and functionality are owned by
                  BELL24H Global and are protected by international copyright, trademark, patent,
                  trade secret, and other intellectual property laws.
                </p>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>7. Payment Terms</h2>
                <p className='text-gray-700 mb-4'>
                  Payment processing is handled securely through our trusted partners. All
                  transactions are protected by industry-standard encryption and security measures.
                </p>
                <div className='bg-green-50 rounded-lg p-4 mb-4'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <span>🛡️</span>
                    <span className='font-semibold text-green-900'>Secure Payments</span>
                  </div>
                  <p className='text-green-800 text-sm'>
                    All payments are processed through PCI DSS compliant payment gateways with
                    256-bit SSL encryption.
                  </p>
                </div>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  8. Limitation of Liability
                </h2>
                <p className='text-gray-700 mb-4'>
                  BELL24H Global shall not be liable for any indirect, incidental, special,
                  consequential, or punitive damages, including without limitation, loss of profits,
                  data, use, goodwill, or other intangible losses.
                </p>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>9. Dispute Resolution</h2>
                <p className='text-gray-700 mb-4'>
                  Any disputes arising from these Terms or your use of the Platform shall be
                  resolved through binding arbitration in accordance with the rules of the
                  International Chamber of Commerce.
                </p>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>10. Changes to Terms</h2>
                <p className='text-gray-700 mb-4'>
                  We reserve the right to modify these Terms at any time. We will notify users of
                  any material changes via email or through the Platform. Your continued use of the
                  Platform after such modifications constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  11. Contact Information
                </h2>
                <p className='text-gray-700 mb-4'>
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <p className='text-gray-700'>
                    <strong>Email:</strong> legal@bell24h.com
                    <br />
                    <strong>Phone:</strong> +1 (555) 123-4567
                    <br />
                    <strong>Address:</strong> BELL24H Global, 123 Business Street, Suite 100, New
                    York, NY 10001
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
              <a href='/privacy' className='hover:text-blue-600'>
                Privacy Policy
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
