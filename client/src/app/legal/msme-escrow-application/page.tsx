'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Building2, Shield, CheckCircle, Upload, Download } from 'lucide-react';
import Header from '@/components/Header';

export default function MSMEEscrowApplicationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="MSME Escrow Application" />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">MSME Escrow Services Application</h1>
            <p className="text-xl text-gray-600">
              Specialized escrow services for Micro, Small & Medium Enterprises
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                MSME Escrow Service Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">What We Offer</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Secure payment protection for B2B transactions</li>
                    <li>• Interstate commerce facilitation</li>
                    <li>• Export-import payment security</li>
                    <li>• Reduced fee structure for MSMEs</li>
                    <li>• Priority processing and support</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Eligibility Criteria</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Registered MSME (Udyam certificate)</li>
                    <li>• Valid GST registration</li>
                    <li>• Minimum 6 months business operations</li>
                    <li>• Clean financial track record</li>
                    <li>• Compliance with regulatory requirements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                MSME Benefits & Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center border rounded-lg p-4">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg mb-2">Reduced Fees</h3>
                  <p className="text-2xl font-bold text-green-600">0.5% - 1%</p>
                  <p className="text-gray-600">Escrow service charges</p>
                </div>
                <div className="text-center border rounded-lg p-4">
                  <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg mb-2">Priority Support</h3>
                  <p className="text-2xl font-bold text-blue-600">24/7</p>
                  <p className="text-gray-600">Dedicated MSME support</p>
                </div>
                <div className="text-center border rounded-lg p-4">
                  <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg mb-2">Fast Processing</h3>
                  <p className="text-2xl font-bold text-purple-600">24-48hrs</p>
                  <p className="text-gray-600">Transaction processing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-orange-600" />
                Required Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Business Registration Documents</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Company Registration Certificate</li>
                      <li>• Partnership Deed (if applicable)</li>
                      <li>• LLP Agreement (if applicable)</li>
                      <li>• Memorandum of Association</li>
                      <li>• Articles of Association</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Tax & Compliance Documents</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• GST Registration Certificate</li>
                      <li>• PAN Card (Company & Directors)</li>
                      <li>• TAN Certificate</li>
                      <li>• Professional Tax Registration</li>
                      <li>• Shop & Establishment License</li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Financial Documents</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Bank Statements (6 months)</li>
                      <li>• Audited Financial Statements</li>
                      <li>• ITR Returns (3 years)</li>
                      <li>• Balance Sheet & P&L Statement</li>
                      <li>• Bank Account Details</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">MSME Specific Documents</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Udyam Aadhaar Certificate (Mandatory)</li>
                      <li>• Udyam Registration Certificate</li>
                      <li>• MSME Data Bank Registration</li>
                      <li>• Business Plan & Project Report</li>
                      <li>• Manufacturing License (if applicable)</li>
                      <li>• Export-Import Code (if applicable)</li>
                      <li>• URD Registration (for micro/mini sectors - No certificate required)</li>
                      <li>• Home Service Industry Registration (if applicable)</li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">KYC Documents</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Director/Partner ID Proof</li>
                      <li>• Director/Partner Address Proof</li>
                      <li>• Director/Partner PAN Card</li>
                      <li>• Board Resolution (if applicable)</li>
                      <li>• Authorized Signatory Letter</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Technical Documents</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Business Model Documentation</li>
                      <li>• Escrow Service Requirements</li>
                      <li>• API Integration Specifications</li>
                      <li>• Security & Compliance Plan</li>
                      <li>• Risk Management Framework</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Document Preparation</h3>
                    <p className="text-gray-600">Gather all required documents and ensure they are current and valid.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Application Submission</h3>
                    <p className="text-gray-600">Submit your application with all required documents through our secure portal.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Initial Review</h3>
                    <p className="text-gray-600">Our team will review your application and documents within 5-7 business days.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Due Diligence</h3>
                    <p className="text-gray-600">Comprehensive verification of business credentials, financial health, and compliance.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">5</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Approval & Onboarding</h3>
                    <p className="text-gray-600">Upon approval, complete the onboarding process and start using escrow services.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Initial Review</h3>
                  <p className="text-2xl font-bold text-blue-600">5-7 Days</p>
                  <p className="text-gray-600">Document verification</p>
                </div>
                <div className="text-center border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Due Diligence</h3>
                  <p className="text-2xl font-bold text-orange-600">10-15 Days</p>
                  <p className="text-gray-600">Business verification</p>
                </div>
                <div className="text-center border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Technical Review</h3>
                  <p className="text-2xl font-bold text-purple-600">5-7 Days</p>
                  <p className="text-gray-600">API integration</p>
                </div>
                <div className="text-center border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Final Approval</h3>
                  <p className="text-2xl font-bold text-green-600">3-5 Days</p>
                  <p className="text-gray-600">Onboarding</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  <strong>Total Processing Time: 23-34 business days</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>MSME Support Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Government Scheme Integration</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Integration with MSME Data Bank</li>
                    <li>• Support for government tenders</li>
                    <li>• Access to MSME loan schemes</li>
                    <li>• Export promotion programs</li>
                    <li>• Technology upgradation support</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Business Development Support</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Market access facilitation</li>
                    <li>• Buyer-supplier matching</li>
                    <li>• Trade finance assistance</li>
                    <li>• Digital transformation support</li>
                    <li>• Mentorship programs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Download Application Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">MSME Escrow Application Form</h4>
                      <p className="text-sm text-gray-600">Complete application form</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="h-6 w-6 text-green-600" />
                    <div>
                      <h4 className="font-semibold">Document Checklist</h4>
                      <p className="text-sm text-gray-600">Required documents list</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                For MSME escrow services inquiries and application support:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">MSME Support Team</h4>
                  <p>Email: msme@bell24h.com</p>
                  <p>Phone: +91-XXX-XXXX-XXX</p>
                  <p>Hours: 9 AM - 6 PM (Mon-Fri)</p>
                </div>
                <div>
                  <h4 className="font-semibold">Application Support</h4>
                  <p>Email: applications@bell24h.com</p>
                  <p>Phone: +91-XXX-XXXX-XXX</p>
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
