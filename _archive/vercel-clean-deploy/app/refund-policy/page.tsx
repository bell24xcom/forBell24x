// app/refund-policy/page.tsx - Refund Policy Page
'use client';

import { RefreshCw, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <RefreshCw className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Refund Policy</h1>
            <p className="text-sm text-gray-600">Last Updated: September 11, 2025</p>
          </div>

          <div className="prose max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Refund Eligibility</h2>
              <p className="text-gray-700 mb-4">
                Refunds are available under the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Service not delivered as promised</li>
                <li>Technical issues preventing service usage</li>
                <li>Duplicate payments made in error</li>
                <li>Service cancellation within 24 hours of purchase</li>
                <li>Fraudulent transactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Refund Process</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Submit Request</h3>
                    <p className="text-gray-600 text-sm">Contact support with transaction details and reason for refund</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Review Process</h3>
                    <p className="text-gray-600 text-sm">Our team reviews the request within 2-3 business days</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Refund Processing</h3>
                    <p className="text-gray-600 text-sm">Approved refunds are processed within 5-7 business days</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Refund Timeline</h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Processing Time:</strong> 2-3 business days for review</li>
                  <li><strong>Refund Time:</strong> 5-7 business days after approval</li>
                  <li><strong>Bank Processing:</strong> Additional 2-3 business days for bank processing</li>
                  <li><strong>Total Timeline:</strong> 7-13 business days from request to credit</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Non-Refundable Items</h2>
              <div className="bg-red-50 p-6 rounded-lg">
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Services already delivered and accepted</li>
                  <li>Platform fees and transaction charges</li>
                  <li>Digital products and downloads</li>
                  <li>Custom services tailored to specific requirements</li>
                  <li>Refunds requested after 30 days of service delivery</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contact Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Refund Requests:</strong> refunds@bell24h.com
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Support:</strong> support@bell24h.com
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
