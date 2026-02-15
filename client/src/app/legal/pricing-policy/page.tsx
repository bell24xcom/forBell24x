'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, CreditCard, Shield, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';

export default function PricingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Pricing Policy" />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Pricing Policy</h1>
            <p className="text-xl text-gray-600">
              Transparent pricing for all Bell24h services
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                RFQ Processing Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Free RFQ Submission</h3>
                  <p className="text-gray-600 mb-4">Post your first 5 RFQs absolutely free</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      No setup fees
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Instant quotes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      24-hour response guarantee
                    </li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Premium RFQ Processing</h3>
                  <p className="text-gray-600 mb-4">₹500 per RFQ after free quota</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Priority matching
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      AI-powered negotiation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Escrow protection
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
                Payment Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Transaction Fee</h3>
                  <p className="text-2xl font-bold text-green-600">2.5%</p>
                  <p className="text-gray-600">Per successful transaction</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Escrow Fee</h3>
                  <p className="text-2xl font-bold text-blue-600">1%</p>
                  <p className="text-gray-600">Payment protection service</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Processing Time</h3>
                  <p className="text-2xl font-bold text-purple-600">24-48hrs</p>
                  <p className="text-gray-600">After order completion</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-600" />
                Security & Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Payment Security</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      PCI DSS compliant
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Razorpay integration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Encrypted transactions
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Buyer Protection</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      100% money-back guarantee
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Quality assurance
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Dispute resolution
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Bell24h reserves the right to update pricing with 30 days notice. 
                All pricing is in Indian Rupees (INR) and includes applicable taxes.
              </p>
              <p className="text-gray-600">
                For enterprise pricing and custom solutions, please contact our sales team.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
