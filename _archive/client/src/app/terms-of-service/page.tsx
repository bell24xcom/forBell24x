'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';

export default function TermsOfServicePage() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading Terms of Service...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-100'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <Card className='shadow-xl'>
            <CardHeader className='text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white'>
              <CardTitle className='text-3xl font-bold'>Terms of Service</CardTitle>
              <p className='text-green-100'>Bell24H Global - Platform Terms & Conditions</p>
              <Badge variant='secondary' className='mt-2'>
                Effective: July 2024
              </Badge>
            </CardHeader>

            <CardContent className='p-8 space-y-6'>
              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  1. Acceptance of Terms
                </h2>
                <div className='space-y-3 text-gray-600'>
                  <p>
                    By accessing and using Bell24H's B2B marketplace platform, you agree to be bound
                    by these Terms of Service. If you do not agree to these terms, please do not use
                    our services.
                  </p>
                  <p>
                    These terms apply to all users, including buyers, sellers, and service providers
                    on the Bell24H platform.
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>2. Platform Services</h2>
                <div className='space-y-3 text-gray-600'>
                  <p>Bell24H provides the following services:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>
                      <strong>B2B Marketplace:</strong> Connect buyers and sellers for business
                      transactions
                    </li>
                    <li>
                      <strong>AI-Powered Search:</strong> Advanced product discovery and matching
                    </li>
                    <li>
                      <strong>Escrow Services:</strong> Secure payment processing and dispute
                      resolution
                    </li>
                    <li>
                      <strong>Logistics Integration:</strong> Shipping and delivery coordination
                    </li>
                    <li>
                      <strong>Analytics Dashboard:</strong> Business insights and performance
                      metrics
                    </li>
                    <li>
                      <strong>Voice RFQ:</strong> Voice-enabled request for quotation system
                    </li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  3. User Registration & Verification
                </h2>
                <div className='space-y-3 text-gray-600'>
                  <p>To use Bell24H services, you must:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>Be at least 18 years old and have legal capacity</li>
                    <li>Provide accurate and complete business information</li>
                    <li>Verify your business identity and GST registration</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Notify us immediately of any unauthorized access</li>
                  </ul>
                  <p className='mt-4 p-4 bg-blue-50 rounded-lg'>
                    <strong>Business Verification:</strong> All businesses must complete KYC
                    verification before accessing premium features.
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>4. Transaction Terms</h2>
                <div className='space-y-3 text-gray-600'>
                  <p>All transactions on Bell24H are subject to:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>
                      <strong>Escrow Protection:</strong> Payments held securely until order
                      completion
                    </li>
                    <li>
                      <strong>Quality Standards:</strong> Products must meet advertised
                      specifications
                    </li>
                    <li>
                      <strong>Delivery Terms:</strong> Agreed shipping timelines and conditions
                    </li>
                    <li>
                      <strong>Return Policy:</strong> 7-day return window for defective items
                    </li>
                    <li>
                      <strong>Dispute Resolution:</strong> Bell24H mediation for transaction
                      conflicts
                    </li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>5. Payment & Fees</h2>
                <div className='space-y-3 text-gray-600'>
                  <p>Payment terms and fee structure:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>
                      <strong>Transaction Fees:</strong> 2.5% on successful transactions
                    </li>
                    <li>
                      <strong>Escrow Fees:</strong> 1% for payment protection services
                    </li>
                    <li>
                      <strong>Premium Features:</strong> Monthly subscription for advanced tools
                    </li>
                    <li>
                      <strong>Payment Methods:</strong> UPI, cards, net banking, and digital wallets
                    </li>
                    <li>
                      <strong>Tax Compliance:</strong> All applicable GST and taxes included
                    </li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  6. Prohibited Activities
                </h2>
                <div className='space-y-3 text-gray-600'>
                  <p>Users are prohibited from:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>Posting false or misleading product information</li>
                    <li>Engaging in price manipulation or collusion</li>
                    <li>Violating intellectual property rights</li>
                    <li>Attempting to circumvent payment systems</li>
                    <li>Using the platform for illegal activities</li>
                    <li>Spamming or harassing other users</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  7. Intellectual Property
                </h2>
                <div className='space-y-3 text-gray-600'>
                  <p>Intellectual property rights:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>Bell24H retains rights to platform technology and branding</li>
                    <li>Users retain rights to their product content and data</li>
                    <li>AI-generated insights are shared between parties</li>
                    <li>Unauthorized use of platform content is prohibited</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>8. Data & Privacy</h2>
                <div className='space-y-3 text-gray-600'>
                  <p>Data handling and privacy:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>User data is protected under our Privacy Policy</li>
                    <li>AI systems process data for service improvement</li>
                    <li>Business analytics are shared with account holders</li>
                    <li>Data retention follows legal requirements</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  9. Service Availability
                </h2>
                <div className='space-y-3 text-gray-600'>
                  <p>Platform availability and maintenance:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>Platform aims for 99.9% uptime availability</li>
                    <li>Scheduled maintenance with advance notice</li>
                    <li>Emergency updates may occur without notice</li>
                    <li>Service interruptions are communicated via email</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  10. Limitation of Liability
                </h2>
                <div className='space-y-3 text-gray-600'>
                  <p>Bell24H's liability is limited to:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>Direct damages up to the transaction amount</li>
                    <li>Escrow protection for verified transactions</li>
                    <li>Platform security and data protection</li>
                    <li>AI system accuracy within stated parameters</li>
                  </ul>
                  <p className='mt-4 p-4 bg-yellow-50 rounded-lg'>
                    <strong>Disclaimer:</strong> Bell24H is not liable for indirect, consequential,
                    or punitive damages.
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>11. Termination</h2>
                <div className='space-y-3 text-gray-600'>
                  <p>Account termination conditions:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>Users may terminate accounts with 30 days notice</li>
                    <li>Bell24H may suspend accounts for policy violations</li>
                    <li>Outstanding transactions must be completed</li>
                    <li>Data retention follows legal requirements</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>12. Governing Law</h2>
                <div className='space-y-3 text-gray-600'>
                  <p>Legal jurisdiction and dispute resolution:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>Terms governed by Indian law</li>
                    <li>Disputes resolved through arbitration in Bangalore</li>
                    <li>Class action waivers apply</li>
                    <li>Severability clause for invalid provisions</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  13. Contact Information
                </h2>
                <div className='space-y-3 text-gray-600'>
                  <p>For questions about these terms:</p>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <p>
                      <strong>Email:</strong> legal@bell24h.com
                    </p>
                    <p>
                      <strong>Phone:</strong> +91-1800-BELL24H
                    </p>
                    <p>
                      <strong>Address:</strong> Bell24H Global, Tech Park, Bangalore, India
                    </p>
                    <p>
                      <strong>Legal Team:</strong> legal@bell24h.com
                    </p>
                  </div>
                </div>
              </section>

              <div className='text-center pt-6'>
                <Button
                  onClick={() => window.history.back()}
                  className='bg-green-600 hover:bg-green-700'
                >
                  Back to Previous Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
