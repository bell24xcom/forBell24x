'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function PrivacyPolicyPage() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading Privacy Policy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <Card className='shadow-xl'>
            <CardHeader className='text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white'>
              <CardTitle className='text-3xl font-bold'>Privacy Policy</CardTitle>
              <p className='text-blue-100'>Bell24H Global - Data Protection & Privacy</p>
              <Badge variant='secondary' className='mt-2'>
                Last Updated: July 2024
              </Badge>
            </CardHeader>

            <CardContent className='p-8 space-y-6'>
              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  1. Information We Collect
                </h2>
                <div className='space-y-3 text-gray-600'>
                  <p>
                    Bell24H collects information to provide better services to our users and improve
                    our B2B marketplace platform.
                  </p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>
                      <strong>Account Information:</strong> Name, email, company details, GST number
                    </li>
                    <li>
                      <strong>Transaction Data:</strong> Purchase history, payment information,
                      escrow details
                    </li>
                    <li>
                      <strong>Usage Analytics:</strong> Platform interactions, search queries, AI
                      feature usage
                    </li>
                    <li>
                      <strong>Communication Data:</strong> Messages, RFQ submissions, support
                      tickets
                    </li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  2. How We Use Your Information
                </h2>
                <div className='space-y-3 text-gray-600'>
                  <p>We use the collected information for the following purposes:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>Provide and maintain our B2B marketplace services</li>
                    <li>Process transactions and manage escrow accounts</li>
                    <li>Improve AI-powered search and recommendation systems</li>
                    <li>Send notifications about orders, payments, and platform updates</li>
                    <li>Ensure platform security and prevent fraud</li>
                    <li>Comply with legal and regulatory requirements</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  3. Data Security & Protection
                </h2>
                <div className='space-y-3 text-gray-600'>
                  <p>Bell24H implements comprehensive security measures to protect your data:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>End-to-end encryption for sensitive data transmission</li>
                    <li>Secure cloud infrastructure with regular security audits</li>
                    <li>Multi-factor authentication for account access</li>
                    <li>Regular backup and disaster recovery procedures</li>
                    <li>GDPR compliance and data protection standards</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  4. Data Sharing & Third Parties
                </h2>
                <div className='space-y-3 text-gray-600'>
                  <p>We may share your information with:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>
                      <strong>Payment Processors:</strong> RazorpayX, Stripe for transaction
                      processing
                    </li>
                    <li>
                      <strong>Logistics Partners:</strong> Shiprocket, Delhivery for order
                      fulfillment
                    </li>
                    <li>
                      <strong>AI Service Providers:</strong> OpenAI for AI-powered features
                    </li>
                    <li>
                      <strong>Legal Authorities:</strong> When required by law or regulation
                    </li>
                  </ul>
                  <p className='mt-4 p-4 bg-blue-50 rounded-lg'>
                    <strong>Note:</strong> We never sell your personal data to third parties for
                    marketing purposes.
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  5. Your Rights & Choices
                </h2>
                <div className='space-y-3 text-gray-600'>
                  <p>You have the following rights regarding your data:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>
                      <strong>Access:</strong> Request a copy of your personal data
                    </li>
                    <li>
                      <strong>Correction:</strong> Update or correct inaccurate information
                    </li>
                    <li>
                      <strong>Deletion:</strong> Request deletion of your account and data
                    </li>
                    <li>
                      <strong>Portability:</strong> Export your data in a machine-readable format
                    </li>
                    <li>
                      <strong>Objection:</strong> Opt-out of certain data processing activities
                    </li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>6. Cookies & Tracking</h2>
                <div className='space-y-3 text-gray-600'>
                  <p>We use cookies and similar technologies to:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>Remember your preferences and login status</li>
                    <li>Analyze platform usage and improve performance</li>
                    <li>Provide personalized content and recommendations</li>
                    <li>Ensure security and prevent fraud</li>
                  </ul>
                  <p className='mt-4 p-4 bg-yellow-50 rounded-lg'>
                    <strong>Cookie Settings:</strong> You can manage cookie preferences in your
                    browser settings.
                  </p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  7. International Data Transfers
                </h2>
                <div className='space-y-3 text-gray-600'>
                  <p>Bell24H operates globally and may transfer data across borders:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>Data centers located in secure, compliant facilities</li>
                    <li>Adequate safeguards for international transfers</li>
                    <li>Compliance with local data protection laws</li>
                    <li>Regular audits of international data handling</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>8. Children's Privacy</h2>
                <div className='space-y-3 text-gray-600'>
                  <p>Bell24H is a B2B platform designed for business users:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>We do not knowingly collect data from children under 18</li>
                    <li>All users must be 18 or older to create an account</li>
                    <li>Business verification processes ensure legitimate business users</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  9. Changes to This Policy
                </h2>
                <div className='space-y-3 text-gray-600'>
                  <p>We may update this Privacy Policy from time to time:</p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>Changes will be posted on this page with updated dates</li>
                    <li>Significant changes will be communicated via email</li>
                    <li>Continued use of the platform constitutes acceptance of changes</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  10. Contact Information
                </h2>
                <div className='space-y-3 text-gray-600'>
                  <p>For privacy-related questions or concerns:</p>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <p>
                      <strong>Email:</strong> privacy@bell24h.com
                    </p>
                    <p>
                      <strong>Phone:</strong> +91-1800-BELL24H
                    </p>
                    <p>
                      <strong>Address:</strong> Bell24H Global, Tech Park, Bangalore, India
                    </p>
                    <p>
                      <strong>Data Protection Officer:</strong> dpo@bell24h.com
                    </p>
                  </div>
                </div>
              </section>

              <div className='text-center pt-6'>
                <Button
                  onClick={() => window.history.back()}
                  className='bg-blue-600 hover:bg-blue-700'
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
