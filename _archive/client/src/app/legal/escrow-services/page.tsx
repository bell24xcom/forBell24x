'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Building2, Globe, FileText, Users, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';

export default function EscrowServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Escrow Services" />
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Escrow Services Framework</h1>
            <p className="text-xl text-gray-600">
              Secure payment protection for B2B transactions with MSME focus
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Service Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">B2B Marketplace Escrow</h3>
                  <p className="text-gray-600 mb-4">
                    Our platform facilitates secure transactions between verified buyers and suppliers, 
                    with particular focus on MSME interstate commerce and export transactions.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Verified buyer-supplier matching</li>
                    <li>• Secure fund holding during fulfillment</li>
                    <li>• Automated release upon confirmation</li>
                    <li>• Dispute resolution framework</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Escrow Mechanism</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">1</span>
                      </div>
                      <span className="text-gray-600">Buyer deposits funds into escrow</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">2</span>
                      </div>
                      <span className="text-gray-600">Funds held during fulfillment (7-30 days)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">3</span>
                      </div>
                      <span className="text-gray-600">Release triggered by delivery confirmation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">4</span>
                      </div>
                      <span className="text-gray-600">Dispute resolution: 48-72 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-green-600" />
                Regulatory Compliance Framework
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Applicable Regulations</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Reserve Bank of India Guidelines on Prepaid Payment Instruments</li>
                    <li>• Payment and Settlement Systems Act, 2007</li>
                    <li>• Foreign Exchange Management Act (FEMA) for export transactions</li>
                    <li>• MSME Development Act, 2006</li>
                    <li>• Prevention of Money Laundering Act compliance</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">KYC/AML Compliance</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Mandatory business verification for all participants</li>
                    <li>• Transaction monitoring and reporting</li>
                    <li>• Real-time fraud detection algorithms</li>
                    <li>• Suspicious transaction reporting</li>
                    <li>• Regular compliance audits</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-600" />
                MSME Special Provisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Reduced Fees</h3>
                  <p className="text-2xl font-bold text-green-600">0.5% - 1%</p>
                  <p className="text-gray-600">For registered MSMEs</p>
                </div>
                <div className="text-center border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Priority Processing</h3>
                  <p className="text-2xl font-bold text-blue-600">24 Hours</p>
                  <p className="text-gray-600">Fast-track for MSMEs</p>
                </div>
                <div className="text-center border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Government Integration</h3>
                  <p className="text-2xl font-bold text-purple-600">Udyam</p>
                  <p className="text-gray-600">Registration support</p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-3">Interstate Commerce Support</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                  <li>• GST compliant invoicing</li>
                  <li>• E-way bill integration</li>
                  <li>• Multi-state tax handling</li>
                  <li>• Regional language support</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-orange-600" />
                Export Facilitation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Export Documentation</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Letter of Credit handling</li>
                    <li>• Export invoice processing</li>
                    <li>• FIRC generation support</li>
                    <li>• DGFT integration readiness</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Foreign Exchange Management</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Multi-currency escrow accounts</li>
                    <li>• FEMA compliant operations</li>
                    <li>• Forward contract facilitation</li>
                    <li>• Exchange rate protection options</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-red-600" />
                Risk Management Framework
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Risk Mitigation</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Maximum transaction limits</li>
                    <li>• Graduated trust scoring system</li>
                    <li>• Mandatory insurance for high-value transactions</li>
                    <li>• AI-powered fraud detection</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Dispute Resolution</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Three-tier resolution system</li>
                    <li>• Independent arbitration option</li>
                    <li>• Maximum resolution time: 7 business days</li>
                    <li>• Automated escalation protocols</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-indigo-600" />
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">API Requirements</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• REST API architecture</li>
                    <li>• OAuth 2.0 authentication</li>
                    <li>• TLS 1.2+ encryption</li>
                    <li>• Real-time webhook notifications</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Integration Capabilities</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Account creation and management</li>
                    <li>• Transaction initiation and tracking</li>
                    <li>• Balance inquiries</li>
                    <li>• Settlement instructions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Terms & Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Fee Structure</h3>
                  <p className="text-gray-600 mb-2">Escrow service fee: 0.5% - 1.5% of transaction value</p>
                  <p className="text-gray-600">Minimum fee: As per financial institution guidelines</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Security Standards</h3>
                  <p className="text-gray-600 mb-2">PCI DSS compliance</p>
                  <p className="text-gray-600">ISO 27001 certification</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Reporting</h3>
                  <p className="text-gray-600 mb-2">Monthly transaction reports</p>
                  <p className="text-gray-600">Annual compliance certificate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Partnership Application Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Required Documentation</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Company Registration Certificate</li>
                    <li>GST Certificate and PAN Card</li>
                    <li>Bank Statements (6 months)</li>
                    <li>Business Plan and Technical API Documentation</li>
                    <li>Escrow Service Proposal</li>
                    <li>Compliance certificates and audit reports</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Application Timeline</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Initial response: 7-10 business days</li>
                    <li>Technical evaluation: 15-20 days</li>
                    <li>Compliance review: 20-30 days</li>
                    <li>Final approval: 30-45 days</li>
                  </ul>
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
                For escrow services partnership inquiries and technical documentation:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Partnership Inquiries</h4>
                  <p>Email: partnerships@bell24h.com</p>
                  <p>Phone: +91-XXX-XXXX-XXX</p>
                </div>
                <div>
                  <h4 className="font-semibold">Technical Documentation</h4>
                  <p>Email: api@bell24h.com</p>
                  <p>Portal: bell24h.com/developer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
