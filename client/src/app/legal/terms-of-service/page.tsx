'use client';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
          </div>
        </div>
      </div>
      
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-gray-600 mb-6">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 mb-4">
                  By accessing and using Bell24h ("the Platform"), you accept and agree to be bound by
                  the terms and provision of this agreement. If you do not agree to abide by the
                  above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. Description of Service
                </h2>
                <p className="text-gray-700 mb-4">
                  Bell24h is an AI-powered B2B marketplace that connects buyers and suppliers in
                  India. Our services include:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Supplier discovery and verification</li>
                  <li>RFQ (Request for Quotation) management</li>
                  <li>AI-powered matching and recommendations</li>
                  <li>Financial health scoring and analysis</li>
                  <li>Payment processing and escrow services</li>
                  <li>Document management and KYC verification</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. User Accounts and Registration
                </h2>
                <p className="text-gray-700 mb-4">
                  To access certain features of the Platform, you must register for an account. You
                  agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Supplier Verification and KYC
                </h2>
                <p className="text-gray-700 mb-4">
                  Suppliers on Bell24h must complete Know Your Customer (KYC) verification:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Upload valid GST registration certificate</li>
                  <li>Provide PAN card and company registration documents</li>
                  <li>Submit bank statements for financial verification</li>
                  <li>Undergo AI-powered financial health assessment</li>
                  <li>Maintain compliance with Indian business regulations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Payment Terms and Escrow
                </h2>
                <p className="text-gray-700 mb-4">
                  Bell24h provides secure payment processing through escrow services:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>All payments are held in escrow until order completion</li>
                  <li>Funds are released only after buyer confirmation</li>
                  <li>Transaction fees apply as per our pricing structure</li>
                  <li>Refunds are processed according to our refund policy</li>
                  <li>We comply with all applicable financial regulations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. AI Services and Data Usage
                </h2>
                <p className="text-gray-700 mb-4">
                  Bell24h uses artificial intelligence to enhance user experience:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>AI-powered supplier matching and recommendations</li>
                  <li>Financial health scoring and risk assessment</li>
                  <li>Market intelligence and demand forecasting</li>
                  <li>Automated document processing and verification</li>
                  <li>24/7 AI customer support and assistance</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  By using our AI services, you consent to the processing of your data for these
                  purposes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  7. Prohibited Activities
                </h2>
                <p className="text-gray-700 mb-4">Users are prohibited from:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Providing false or misleading information</li>
                  <li>Engaging in fraudulent or deceptive practices</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Attempting to gain unauthorized access to the Platform</li>
                  <li>Interfering with the proper functioning of the service</li>
                  <li>Using the Platform for illegal or unauthorized purposes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
                <p className="text-gray-700 mb-4">
                  The Platform and its original content, features, and functionality are owned by
                  Bell24h and are protected by international copyright, trademark, patent, trade
                  secret, and other intellectual property laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-700 mb-4">
                  Bell24h shall not be liable for any indirect, incidental, special, consequential, or
                  punitive damages, including without limitation, loss of profits, data, use,
                  goodwill, or other intangible losses, resulting from your use of the Platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Dispute Resolution</h2>
                <p className="text-gray-700 mb-4">
                  Any disputes arising from the use of Bell24h shall be resolved through:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Initial mediation through our customer support</li>
                  <li>Arbitration in accordance with Indian law</li>
                  <li>Jurisdiction in the courts of Mumbai, India</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
                <p className="text-gray-700 mb-4">
                  We may terminate or suspend your account and bar access to the Platform immediately,
                  without prior notice or liability, under our sole discretion, for any reason
                  whatsoever and without limitation, including but not limited to a breach of the
                  Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
                <p className="text-gray-700 mb-4">
                  We reserve the right to modify or replace these Terms at any time. If a revision is
                  material, we will provide at least 30 days notice prior to any new terms taking
                  effect.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> legal@bell24h.com
                    <br />
                    <strong>Address:</strong> Bell24h Technologies Pvt Ltd
                    <br />
                    Mumbai, Maharashtra, India
                    <br />
                    <strong>Phone:</strong> +91-XXXXXXXXXX
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}