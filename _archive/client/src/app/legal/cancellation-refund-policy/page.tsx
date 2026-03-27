'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Clock, Shield, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';

export default function CancellationRefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Cancellation & Refund Policy" />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Cancellation & Refund Policy</h1>
            <p className="text-xl text-gray-600">
              Fair and transparent cancellation and refund procedures for Bell24h
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-6 w-6 text-blue-600" />
                Cancellation Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 text-green-600">Free Cancellation</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Within 24 hours of order placement</li>
                    <li>• Before payment processing</li>
                    <li>• Before inventory allocation</li>
                    <li>• Before production begins</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 text-orange-600">Partial Cancellation</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 25% cancellation fee after 24 hours</li>
                    <li>• 50% cancellation fee after production starts</li>
                    <li>• 75% cancellation fee after shipping</li>
                    <li>• No cancellation after delivery</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-purple-600" />
                Cancellation Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">0-24h</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Immediate Cancellation</h3>
                    <p className="text-gray-600">100% refund, no questions asked</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">1-3d</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Pre-Production</h3>
                    <p className="text-gray-600">75% refund, minimal processing fee</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">3-7d</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Production Phase</h3>
                    <p className="text-gray-600">50% refund, production costs deducted</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">7d+</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Post-Production</h3>
                    <p className="text-gray-600">25% refund, shipping and production costs</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                Refund Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Processing Time</h3>
                  <p className="text-2xl font-bold text-blue-600">5-7 Days</p>
                  <p className="text-gray-600">Standard refund processing</p>
                </div>
                <div className="text-center border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Refund Methods</h3>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Original payment method</li>
                    <li>• Bank transfer</li>
                    <li>• UPI refund</li>
                    <li>• Wallet credit</li>
                  </ul>
                </div>
                <div className="text-center border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Refund Guarantee</h3>
                  <p className="text-2xl font-bold text-green-600">100%</p>
                  <p className="text-gray-600">Money-back guarantee</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                Refund Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Full Refund Scenarios</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Product defect or damage during transit</li>
                    <li>Wrong item delivered (supplier error)</li>
                    <li>Quality not matching specifications</li>
                    <li>Delivery delay beyond promised timeline</li>
                    <li>Non-delivery due to logistics issues</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Partial Refund Scenarios</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Minor quality issues (10-30% discount)</li>
                    <li>Delayed delivery (shipping cost refund)</li>
                    <li>Partial order fulfillment</li>
                    <li>Customer-initiated cancellation</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">No Refund Scenarios</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Product used or damaged by customer</li>
                    <li>Custom-made products after production</li>
                    <li>Perishable or time-sensitive items</li>
                    <li>Services already rendered</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Refund Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Step-by-Step Process</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                      <li>Submit refund request via portal</li>
                      <li>Provide order details and reason</li>
                      <li>Upload supporting documents/photos</li>
                      <li>Verification by support team (24-48 hours)</li>
                      <li>Approval and refund initiation</li>
                      <li>Refund processing (5-7 business days)</li>
                    </ol>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Required Documentation</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>Order confirmation number</li>
                      <li>Payment receipt/screenshot</li>
                      <li>Photos of defective items (if applicable)</li>
                      <li>Delivery receipt/proof</li>
                      <li>Bank account details for transfer</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-2">Level 1: Support</h3>
                    <p className="text-gray-600">Direct resolution through customer support team</p>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-2">Level 2: Escalation</h3>
                    <p className="text-gray-600">Senior management review and resolution</p>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-2">Level 3: Mediation</h3>
                    <p className="text-gray-600">Third-party mediation service</p>
                  </div>
                </div>
                <p className="text-gray-600 text-center">
                  All disputes are resolved within 15 business days of escalation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                For cancellation requests, refund inquiries, or dispute resolution:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Refund Support</h4>
                  <p>Phone: +91-XXX-XXXX-XXX</p>
                  <p>Email: refunds@bell24h.com</p>
                  <p>Portal: bell24h.com/refunds</p>
                </div>
                <div>
                  <h4 className="font-semibold">Dispute Resolution</h4>
                  <p>Phone: +91-XXX-XXXX-XXX</p>
                  <p>Email: disputes@bell24h.com</p>
                  <p>Response Time: 24 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
