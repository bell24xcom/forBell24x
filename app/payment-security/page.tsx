'use client';

export default function PaymentSecurityPage() {
  return (
    <div className="page-container">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="page-title">
              Payment Security & Compliance
            </h1>
            <p className="page-subtitle">
              Your payments are protected by industry-leading security standards
            </p>
          </div>

          {/* Razorpay Compliance */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">Razorpay Security Standards</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="feature-title text-neutral-900 mb-4">Certifications</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="text-green-600 mr-3">✅</span>
                    <span>PCI DSS Level 1 Certified</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-3">✅</span>
                    <span>RBI Licensed Payment Aggregator</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-3">✅</span>
                    <span>ISO 27001 Certified</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-3">✅</span>
                    <span>SOC 2 Type II Compliant</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="feature-title text-neutral-900 mb-4">Security Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="text-green-600 mr-3">🔒</span>
                    <span>256-bit SSL Encryption</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-3">🛡️</span>
                    <span>Real-time Fraud Detection</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-3">🔐</span>
                    <span>Tokenized Payment Data</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-3">⚡</span>
                    <span>99.9% Uptime SLA</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Protection */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">Data Protection</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="feature-title text-neutral-900 mb-3">Payment Data Security</h3>
                <p className="feature-description">
                  Bell24h uses Razorpay's secure payment infrastructure. Your payment information is:
                </p>
                <ul className="list-disc list-inside space-y-2 text-neutral-600">
                  <li>Encrypted using industry-standard AES-256 encryption</li>
                  <li>Never stored on our servers - processed directly by Razorpay</li>
                  <li>Protected by PCI DSS Level 1 security standards</li>
                  <li>Monitored 24/7 for fraudulent activity</li>
                </ul>
              </div>
              
              <div>
                <h3 className="feature-title text-neutral-900 mb-3">Personal Information</h3>
                <p className="feature-description">
                  We collect only necessary information and protect it according to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-neutral-600">
                  <li>GDPR (General Data Protection Regulation)</li>
                  <li>India's Personal Data Protection Bill</li>
                  <li>RBI's data localization requirements</li>
                  <li>Our comprehensive Privacy Policy</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Test Mode Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-yellow-800 mb-6">Testing Environment</h2>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-6">
                <h3 className="feature-title text-neutral-900 mb-3">Test API Keys</h3>
                <p className="feature-description">
                  For development and testing, use these Razorpay test credentials:
                </p>
                <div className="bg-neutral-100 rounded-lg p-4 font-mono text-sm">
                  <div className="mb-2">
                    <span className="text-neutral-600">Key ID:</span> rzp_test_1DP5mmOlF5G5ag
                  </div>
                  <div>
                    <span className="text-neutral-600">Key Secret:</span> [Available in Razorpay Dashboard]
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="feature-title text-neutral-900 mb-3">Test Cards</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-2">Successful Payments</h4>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>4111 1111 1111 1111</li>
                      <li>5555 5555 5555 4444</li>
                      <li>4000 0000 0000 0002</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-2">Failed Payments</h4>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>4000 0000 0000 0002</li>
                      <li>4000 0000 0000 0069</li>
                      <li>4000 0000 0000 0119</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">Security Questions?</h2>
            <p className="text-neutral-600 mb-6">
              If you have any questions about payment security or need to report a security issue, please contact us:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Security Team</h3>
                <p className="text-neutral-600">security@bell24h.com</p>
                <p className="text-neutral-600">+91 98765 43210</p>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Support</h3>
                <p className="text-neutral-600">support@bell24h.com</p>
                <p className="text-neutral-600">24/7 Customer Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
