'use client';

export default function PrivacyPolicyPage() {
  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white shadow-lg rounded-lg p-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-8'>Privacy Policy</h1>

          <div className='prose prose-lg max-w-none'>
            <p className='text-sm text-gray-600 mb-6'>
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-4'>1. Introduction</h2>
              <p className='text-gray-700 mb-4'>
                Bell24h Technologies Pvt Ltd ("we," "our," or "us") is committed to protecting your
                privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                your information when you use our AI-powered B2B marketplace platform.
              </p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                2. Information We Collect
              </h2>

              <h3 className='text-xl font-semibold text-gray-800 mb-3'>2.1 Personal Information</h3>
              <p className='text-gray-700 mb-4'>We collect the following personal information:</p>
              <ul className='list-disc pl-6 text-gray-700 mb-4'>
                <li>Name, email address, and phone number</li>
                <li>Company name, GST number, and business details</li>
                <li>Bank account information for payment processing</li>
                <li>KYC documents (GST certificate, PAN card, etc.)</li>
                <li>Profile information and preferences</li>
              </ul>

              <h3 className='text-xl font-semibold text-gray-800 mb-3'>2.2 Business Information</h3>
              <p className='text-gray-700 mb-4'>For suppliers and businesses, we collect:</p>
              <ul className='list-disc pl-6 text-gray-700 mb-4'>
                <li>Company registration details</li>
                <li>Financial statements and bank records</li>
                <li>Product catalogs and pricing information</li>
                <li>Transaction history and business metrics</li>
                <li>AI-generated financial health assessments</li>
              </ul>

              <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                2.3 Technical Information
              </h3>
              <p className='text-gray-700 mb-4'>We automatically collect:</p>
              <ul className='list-disc pl-6 text-gray-700 mb-4'>
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Usage patterns and platform interactions</li>
                <li>AI interaction data and preferences</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                3. How We Use Your Information
              </h2>

              <h3 className='text-xl font-semibold text-gray-800 mb-3'>3.1 Platform Services</h3>
              <ul className='list-disc pl-6 text-gray-700 mb-4'>
                <li>Provide and maintain our B2B marketplace</li>
                <li>Process transactions and payments</li>
                <li>Verify supplier credentials and KYC compliance</li>
                <li>Generate AI-powered recommendations</li>
                <li>Facilitate buyer-supplier connections</li>
              </ul>

              <h3 className='text-xl font-semibold text-gray-800 mb-3'>3.2 AI and Analytics</h3>
              <ul className='list-disc pl-6 text-gray-700 mb-4'>
                <li>Train and improve our AI algorithms</li>
                <li>Generate financial health scores</li>
                <li>Provide market intelligence and insights</li>
                <li>Personalize user experience and recommendations</li>
                <li>Analyze platform usage and performance</li>
              </ul>

              <h3 className='text-xl font-semibold text-gray-800 mb-3'>3.3 Communication</h3>
              <ul className='list-disc pl-6 text-gray-700 mb-4'>
                <li>Send transaction notifications</li>
                <li>Provide customer support</li>
                <li>Send marketing communications (with consent)</li>
                <li>Notify about platform updates and features</li>
                <li>Handle legal and compliance matters</li>
              </ul>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                4. Information Sharing and Disclosure
              </h2>

              <h3 className='text-xl font-semibold text-gray-800 mb-3'>4.1 With Your Consent</h3>
              <p className='text-gray-700 mb-4'>
                We may share your information with third parties when you explicitly consent to such
                sharing.
              </p>

              <h3 className='text-xl font-semibold text-gray-800 mb-3'>4.2 Service Providers</h3>
              <p className='text-gray-700 mb-4'>
                We share information with trusted service providers:
              </p>
              <ul className='list-disc pl-6 text-gray-700 mb-4'>
                <li>Payment processors (Razorpay, etc.)</li>
                <li>Cloud storage providers (AWS, Supabase)</li>
                <li>AI service providers (OpenAI, etc.)</li>
                <li>Email and communication services</li>
                <li>Analytics and monitoring tools</li>
              </ul>

              <h3 className='text-xl font-semibold text-gray-800 mb-3'>4.3 Legal Requirements</h3>
              <p className='text-gray-700 mb-4'>
                We may disclose information when required by law, court order, or government
                request, including for tax purposes, fraud prevention, and regulatory compliance.
              </p>

              <h3 className='text-xl font-semibold text-gray-800 mb-3'>4.4 Business Transfers</h3>
              <p className='text-gray-700 mb-4'>
                In the event of a merger, acquisition, or sale of assets, your information may be
                transferred as part of the business transaction.
              </p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-4'>5. Data Security</h2>
              <p className='text-gray-700 mb-4'>
                We implement comprehensive security measures to protect your information:
              </p>
              <ul className='list-disc pl-6 text-gray-700 mb-4'>
                <li>End-to-end encryption for sensitive data</li>
                <li>Secure cloud infrastructure with AWS/Supabase</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and authentication systems</li>
                <li>Compliance with Indian data protection regulations</li>
                <li>Regular backup and disaster recovery procedures</li>
              </ul>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                6. AI and Machine Learning
              </h2>
              <p className='text-gray-700 mb-4'>
                Our AI systems process your data to provide enhanced services:
              </p>
              <ul className='list-disc pl-6 text-gray-700 mb-4'>
                <li>
                  <strong>Financial Analysis:</strong> AI analyzes financial documents to generate
                  health scores
                </li>
                <li>
                  <strong>Supplier Matching:</strong> AI matches buyers with relevant suppliers
                </li>
                <li>
                  <strong>Market Intelligence:</strong> AI provides demand forecasting and pricing
                  insights
                </li>
                <li>
                  <strong>Document Processing:</strong> AI extracts and verifies information from
                  uploaded documents
                </li>
                <li>
                  <strong>Fraud Detection:</strong> AI identifies suspicious activities and
                  potential fraud
                </li>
              </ul>
              <p className='text-gray-700 mb-4'>
                By using our platform, you consent to the processing of your data by our AI systems
                for these purposes.
              </p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                7. Your Rights and Choices
              </h2>

              <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                7.1 Access and Correction
              </h3>
              <p className='text-gray-700 mb-4'>
                You have the right to access, correct, or update your personal information through
                your account settings.
              </p>

              <h3 className='text-xl font-semibold text-gray-800 mb-3'>7.2 Data Portability</h3>
              <p className='text-gray-700 mb-4'>
                You can request a copy of your data in a machine-readable format.
              </p>

              <h3 className='text-xl font-semibold text-gray-800 mb-3'>7.3 Deletion</h3>
              <p className='text-gray-700 mb-4'>
                You can request deletion of your account and associated data, subject to legal
                retention requirements.
              </p>

              <h3 className='text-xl font-semibold text-gray-800 mb-3'>
                7.4 Marketing Preferences
              </h3>
              <p className='text-gray-700 mb-4'>
                You can opt out of marketing communications while still receiving essential service
                notifications.
              </p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-4'>8. Data Retention</h2>
              <p className='text-gray-700 mb-4'>
                We retain your information for as long as necessary to:
              </p>
              <ul className='list-disc pl-6 text-gray-700 mb-4'>
                <li>Provide our services and maintain your account</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Improve our AI systems and services</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                9. International Data Transfers
              </h2>
              <p className='text-gray-700 mb-4'>
                Your data may be processed in countries other than India, including the United
                States and European Union. We ensure appropriate safeguards are in place to protect
                your data during international transfers.
              </p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-4'>10. Children's Privacy</h2>
              <p className='text-gray-700 mb-4'>
                Our platform is not intended for individuals under 18 years of age. We do not
                knowingly collect personal information from children under 18.
              </p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-4'>11. Third-Party Links</h2>
              <p className='text-gray-700 mb-4'>
                Our platform may contain links to third-party websites. We are not responsible for
                the privacy practices of these external sites. We encourage you to review their
                privacy policies.
              </p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                12. Changes to This Policy
              </h2>
              <p className='text-gray-700 mb-4'>
                We may update this Privacy Policy from time to time. We will notify you of any
                material changes by posting the new policy on our platform and updating the "Last
                updated" date.
              </p>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-4'>13. Contact Us</h2>
              <p className='text-gray-700 mb-4'>
                If you have any questions about this Privacy Policy or our data practices, please
                contact us:
              </p>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <p className='text-gray-700'>
                  <strong>Email:</strong> privacy@bell24h.com
                  <br />
                  <strong>Address:</strong> Bell24h Technologies Pvt Ltd
                  <br />
                  Mumbai, Maharashtra, India
                  <br />
                  <strong>Phone:</strong> +91-XXXXXXXXXX
                  <br />
                  <strong>Data Protection Officer:</strong> dpo@bell24h.com
                </p>
              </div>
            </section>

            <section className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                14. Compliance with Indian Law
              </h2>
              <p className='text-gray-700 mb-4'>
                This Privacy Policy complies with applicable Indian laws and regulations, including
                the Information Technology Act, 2000, and any future data protection laws that may
                be enacted in India.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
