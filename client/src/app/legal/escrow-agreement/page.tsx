'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function EscrowAgreementPage() {
  const [acceptedSections, setAcceptedSections] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(false);

  const handleAcceptSection = (sectionId: string) => {
    const newAccepted = new Set(acceptedSections);
    newAccepted.add(sectionId);
    setAcceptedSections(newAccepted);
  };

  const handleAcceptAll = () => {
    setAcceptedSections(
      new Set(['escrow-process', 'fund-holding', 'dispute-resolution', 'international-compliance'])
    );
  };

  const sections = [
    {
      id: 'escrow-process',
      title: 'Escrow Process and Activation',
      content: `
        <h3>1. Escrow Activation Criteria</h3>
        <p>• Escrow is automatically activated for transactions ≥ ₹5,00,000</p>
        <p>• Below ₹5 lakh: Direct payment without escrow protection</p>
        <p>• Cross-border transactions: Equivalent amount in foreign currency</p>
        <p>• Terms acceptance is mandatory before escrow activation</p>
        
        <h3>2. Three-Party Agreement</h3>
        <p>• Buyer: Initiates payment and approves fund release</p>
        <p>• Seller: Delivers goods/services and requests payment</p>
        <p>• Bell24H: Acts as neutral escrow agent and fund holder</p>
        <p>• All parties must accept terms before escrow activation</p>
        
        <h3>3. Fund Holding Process</h3>
        <p>• Buyer transfers funds to Bell24H escrow account</p>
        <p>• Funds are held securely in RBI-regulated accounts</p>
        <p>• Seller receives confirmation of fund holding</p>
        <p>• Real-time status updates for all parties</p>
      `,
    },
    {
      id: 'fund-holding',
      title: 'Fund Holding and Release Terms',
      content: `
        <h3>1. Fund Holding Period</h3>
        <p>• Minimum holding period: 48 hours (dispute window)</p>
        <p>• Maximum holding period: 7 days (auto-release)</p>
        <p>• Manual release available after 48 hours</p>
        <p>• Emergency release for verified emergencies</p>
        
        <h3>2. Release Mechanisms</h3>
        <p>• Manual Release: Buyer approval required</p>
        <p>• Auto Release: After 7 days if no disputes</p>
        <p>• Emergency Release: For verified emergencies</p>
        <p>• Partial Release: Available for milestone-based projects</p>
        
        <h3>3. Fund Distribution</h3>
        <p>• Primary beneficiary: Seller (upon approval)</p>
        <p>• Escrow fees: Deducted from transaction amount</p>
        <p>• Refund to buyer: In case of disputes or cancellation</p>
        <p>• Processing time: 24-48 hours for fund release</p>
      `,
    },
    {
      id: 'dispute-resolution',
      title: 'Dispute Resolution Mechanism',
      content: `
        <h3>1. Dispute Window</h3>
        <p>• 48-hour dispute window after fund holding</p>
        <p>• Disputes must be raised with supporting documentation</p>
        <p>• Automatic fund hold during dispute resolution</p>
        <p>• Neutral mediation by Bell24H compliance team</p>
        
        <h3>2. Dispute Categories</h3>
        <p>• Quality Issues: Product/service not as specified</p>
        <p>• Delivery Issues: Delayed or incomplete delivery</p>
        <p>• Payment Issues: Discrepancies in amount or terms</p>
        <p>• Compliance Issues: Regulatory or legal violations</p>
        
        <h3>3. Resolution Process</h3>
        <p>• Initial review: 24 hours for dispute assessment</p>
        <p>• Mediation period: 5-7 days for resolution</p>
        <p>• Final decision: Based on evidence and compliance</p>
        <p>• Appeal process: Available for complex cases</p>
      `,
    },
    {
      id: 'international-compliance',
      title: 'International Transaction Compliance',
      content: `
        <h3>1. Cross-Border Escrow</h3>
        <p>• Available for international MSME transactions</p>
        <p>• Multi-currency support (USD, EUR, GBP, AED)</p>
        <p>• Forex rate locking at transaction initiation</p>
        <p>• Compliance with destination country regulations</p>
        
        <h3>2. Regulatory Compliance</h3>
        <p>• FEMA compliance for all international transactions</p>
        <p>• RBI reporting for transactions above $50,000</p>
        <p>• Anti-money laundering (AML) monitoring</p>
        <p>• Know Your Customer (KYC) verification</p>
        
        <h3>3. Documentation Requirements</h3>
        <p>• Commercial invoice and packing list</p>
        <p>• Bill of lading or airway bill</p>
        <p>• Certificate of origin (if applicable)</p>
        <p>• Import/export licenses (if required)</p>
      `,
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/escrow'
                className='p-2 text-gray-600 hover:text-blue-600 transition-colors'
              >
                <span>←</span>
              </Link>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>Escrow Agreement</h1>
                <p className='text-gray-600 mt-1'>Three-party escrow terms and conditions</p>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className='p-2 text-gray-600 hover:text-blue-600 transition-colors'
              >
                {showDetails ? <span>👁️</span> : <span>👁️</span>}
              </button>
              <button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'>
                <span>⬇️</span>
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Important Notice */}
          <div className='bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8'>
            <div className='flex items-start space-x-3'>
              <span>🛡️</span>
              <div>
                <h3 className='text-lg font-semibold text-blue-800 mb-2'>
                  Escrow Protection Notice
                </h3>
                <p className='text-blue-700 mb-4'>
                  This escrow agreement provides secure protection for high-value transactions. By
                  accepting these terms, you agree to the three-party escrow process, fund holding
                  mechanisms, and dispute resolution procedures.
                </p>
                <div className='flex items-center space-x-4'>
                  <button
                    onClick={handleAcceptAll}
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    Accept All Terms
                  </button>
                  <span className='text-sm text-blue-600'>
                    {acceptedSections.size} of {sections.length} sections accepted
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
              <div className='flex items-center space-x-3 mb-4'>
                <span>🔒</span>
                <div>
                  <h3 className='font-semibold text-gray-900'>Secure Fund Holding</h3>
                  <p className='text-sm text-gray-500'>RBI-regulated accounts</p>
                </div>
              </div>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>• 48-hour dispute window</li>
                <li>• 7-day auto-release</li>
                <li>• Manual release option</li>
                <li>• Emergency release available</li>
              </ul>
            </div>

            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
              <div className='flex items-center space-x-3 mb-4'>
                <span>👤</span>
                <div>
                  <h3 className='font-semibold text-gray-900'>Three-Party Protection</h3>
                  <p className='text-sm text-gray-500'>Buyer, Seller, Bell24H</p>
                </div>
              </div>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>• Neutral escrow agent</li>
                <li>• Fair dispute resolution</li>
                <li>• Transparent process</li>
                <li>• Real-time updates</li>
              </ul>
            </div>

            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
              <div className='flex items-center space-x-3 mb-4'>
                <span>📅</span>
                <div>
                  <h3 className='font-semibold text-gray-900'>Timeline Protection</h3>
                  <p className='text-sm text-gray-500'>Clear deadlines</p>
                </div>
              </div>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li>• ₹5L+ threshold</li>
                <li>• 48h dispute window</li>
                <li>• 7-day auto-release</li>
                <li>• 24h processing time</li>
              </ul>
            </div>
          </div>

          {/* Terms Sections */}
          <div className='space-y-6'>
            {sections.map(section => (
              <div
                key={section.id}
                className='bg-white rounded-xl shadow-sm border border-gray-200'
              >
                <div className='p-6 border-b border-gray-200'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <span>📄</span>
                      <h2 className='text-xl font-semibold text-gray-900'>{section.title}</h2>
                    </div>
                    <div className='flex items-center space-x-3'>
                      {acceptedSections.has(section.id) ? (
                        <div className='flex items-center space-x-2 text-green-600'>
                          <span>✅</span>
                          <span className='text-sm font-medium'>Accepted</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAcceptSection(section.id)}
                          className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                        >
                          Accept Section
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className='p-6'>
                  <div
                    className='prose prose-gray max-w-none'
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />

                  {showDetails && (
                    <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
                      <h4 className='font-semibold text-gray-900 mb-2'>Legal Details</h4>
                      <ul className='text-sm text-gray-600 space-y-1'>
                        <li>• Governed by Indian Contract Act, 1872</li>
                        <li>• Disputes resolved through arbitration in Mumbai</li>
                        <li>• Terms binding on all three parties</li>
                        <li>• Contact escrow@bell24h.com for support</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Compliance Status */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 mt-8'>
            <div className='p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>Compliance Status</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium'>RBI Compliant</div>
                    <div className='text-sm text-gray-500'>Payment regulations</div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium'>FEMA Compliant</div>
                    <div className='text-sm text-gray-500'>Foreign exchange</div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium'>PCI DSS Certified</div>
                    <div className='text-sm text-gray-500'>Data security</div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium'>AML Compliant</div>
                    <div className='text-sm text-gray-500'>Anti-money laundering</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className='bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8'>
            <h3 className='text-lg font-semibold text-blue-900 mb-4'>Escrow Support</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
              <div>
                <div className='font-medium text-blue-900'>Escrow Support</div>
                <div className='text-blue-700'>escrow@bell24h.com</div>
                <div className='text-blue-600'>+91-1800-123-4570</div>
              </div>
              <div>
                <div className='font-medium text-blue-900'>Dispute Resolution</div>
                <div className='text-blue-700'>disputes@bell24h.com</div>
                <div className='text-blue-600'>+91-1800-123-4571</div>
              </div>
              <div>
                <div className='font-medium text-blue-900'>Compliance Team</div>
                <div className='text-blue-700'>compliance@bell24h.com</div>
                <div className='text-blue-600'>+91-1800-123-4572</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
