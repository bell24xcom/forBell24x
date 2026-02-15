// app/escrow/page.tsx - Escrow Services Page
'use client';

import { Shield, Lock, Clock, CheckCircle, AlertTriangle, CreditCard } from 'lucide-react';

export default function EscrowPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Secure Escrow Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Protect your B2B transactions with our secure escrow system. Funds are held safely until delivery confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* How It Works */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-2" />
              How Escrow Works
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Transaction Initiated</h3>
                  <p className="text-gray-600 text-sm">Buyer places order and funds are held in escrow</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Supplier Ships</h3>
                  <p className="text-gray-600 text-sm">Supplier ships goods and provides tracking information</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Delivery Confirmation</h3>
                  <p className="text-gray-600 text-sm">Buyer confirms receipt and quality of goods</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Funds Released</h3>
                  <p className="text-gray-600 text-sm">Payment is released to supplier automatically</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Lock className="h-6 w-6 text-blue-600 mr-2" />
              Benefits of Escrow
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Buyer Protection</h3>
                  <p className="text-gray-600 text-sm">Funds are safe until you receive and approve your order</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Supplier Guarantee</h3>
                  <p className="text-gray-600 text-sm">Payment is guaranteed once delivery is confirmed</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Dispute Resolution</h3>
                  <p className="text-gray-600 text-sm">Neutral mediation for transaction disputes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CreditCard className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Secure Payments</h3>
                  <p className="text-gray-600 text-sm">All transactions processed through secure payment gateways</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Escrow Features */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Escrow Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Time-based Release</h3>
              <p className="text-gray-600 text-sm">Automatic fund release after delivery confirmation period</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fraud Protection</h3>
              <p className="text-gray-600 text-sm">Advanced fraud detection and prevention systems</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Assurance</h3>
              <p className="text-gray-600 text-sm">Built-in quality checks and verification processes</p>
            </div>
          </div>
        </div>

        {/* Escrow Fees */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Escrow Fees</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Transaction Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Escrow Fee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Processing Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 px-4 text-gray-700">₹0 - ₹10,000</td>
                  <td className="py-3 px-4 text-gray-700">2.5%</td>
                  <td className="py-3 px-4 text-gray-700">1-2 business days</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">₹10,001 - ₹50,000</td>
                  <td className="py-3 px-4 text-gray-700">2.0%</td>
                  <td className="py-3 px-4 text-gray-700">1-2 business days</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">₹50,001 - ₹1,00,000</td>
                  <td className="py-3 px-4 text-gray-700">1.5%</td>
                  <td className="py-3 px-4 text-gray-700">2-3 business days</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Above ₹1,00,000</td>
                  <td className="py-3 px-4 text-gray-700">1.0%</td>
                  <td className="py-3 px-4 text-gray-700">3-5 business days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Use Escrow?</h2>
            <p className="text-gray-600 mb-6">
              Start your secure B2B transactions today with our escrow protection.
            </p>
            <div className="space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Start Transaction
              </button>
              <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
