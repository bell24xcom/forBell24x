'use client';
import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  User, 
  Lock,
  Eye,
  EyeOff,
  Download,
  Printer,
  Database,
  Search,
  Flag,
  Activity
} from 'lucide-react';

export default function AMLPolicyPage() {
  const [showFullPolicy, setShowFullPolicy] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const amlSections = [
    {
      title: "1. ANTI-MONEY LAUNDERING (AML) FRAMEWORK",
      content: `
        1.1. Policy Statement:
        Bell24h is committed to preventing money laundering and terrorist financing activities. 
        We comply with all applicable RBI regulations and guidelines for AML/CFT compliance.
        
        1.2. Regulatory Framework:
        • Prevention of Money Laundering Act, 2002 (PMLA)
        • RBI Master Direction on KYC
        • FIU-India reporting requirements
        • International AML/CFT standards
        
        1.3. Risk-Based Approach:
        • Customer risk assessment and categorization
        • Transaction monitoring and analysis
        • Enhanced due diligence for high-risk customers
        • Regular risk assessment and policy updates
      `
    },
    {
      title: "2. KNOW YOUR CUSTOMER (KYC) PROCEDURES",
      content: `
        2.1. Customer Identification:
        • Valid government-issued photo ID (Aadhaar, PAN, Passport)
        • Proof of address (utility bills, bank statements)
        • Recent photograph for verification
        • Contact information verification
        
        2.2. Enhanced Due Diligence (EDD):
        • High-value customers (transactions above ₹10 lakhs)
        • Politically Exposed Persons (PEPs)
        • Non-resident customers
        • High-risk jurisdictions
        
        2.3. Ongoing Monitoring:
        • Regular KYC updates and reviews
        • Transaction pattern analysis
        • Risk-based customer categorization
        • Periodic re-verification of customer information
      `
    },
    {
      title: "3. SUSPICIOUS TRANSACTION MONITORING",
      content: `
        3.1. Transaction Monitoring System:
        • Real-time transaction analysis
        • Automated suspicious activity detection
        • Manual review and investigation
        • Risk scoring and alert generation
        
        3.2. Suspicious Activity Indicators:
        • Unusual transaction patterns
        • High-value transactions without business purpose
        • Multiple small transactions to avoid reporting
        • Transactions with high-risk jurisdictions
        • Rapid movement of funds
        
        3.3. Reporting Requirements:
        • Suspicious Transaction Reports (STR) to FIU-India
        • Cash Transaction Reports (CTR) for cash transactions
        • Annual compliance reports to RBI
        • Internal reporting and escalation procedures
      `
    },
    {
      title: "4. CUSTOMER RISK ASSESSMENT",
      content: `
        4.1. Risk Categories:
        • Low Risk: Regular customers with verified identity
        • Medium Risk: High-value customers, business accounts
        • High Risk: PEPs, non-residents, high-risk jurisdictions
        
        4.2. Risk Factors:
        • Customer type and business nature
        • Geographic location and jurisdiction
        • Transaction patterns and volumes
        • Source of funds verification
        • Purpose of transactions
        
        4.3. Risk Mitigation:
        • Enhanced monitoring for high-risk customers
        • Additional documentation requirements
        • Regular review and re-assessment
        • Escalation procedures for suspicious activities
      `
    },
    {
      title: "5. TRANSACTION LIMITS AND MONITORING",
      content: `
        5.1. Transaction Limits:
        • Daily limit: ₹1,00,000 (₹1 lakh)
        • Monthly limit: ₹10,00,000 (₹10 lakhs)
        • Single transaction limit: ₹50,000
        • International transaction limits as per FEMA
        
        5.2. Monitoring Thresholds:
        • Real-time monitoring of all transactions
        • Enhanced scrutiny for transactions above ₹10,000
        • Mandatory documentation for transactions above ₹50,000
        • Special attention to international transactions
        
        5.3. Automated Alerts:
        • Unusual transaction patterns
        • Multiple failed login attempts
        • Rapid fund movements
        • Transactions with high-risk entities
      `
    },
    {
      title: "6. COMPLIANCE AND REPORTING",
      content: `
        6.1. Regulatory Reporting:
        • Monthly reports to RBI
        • Quarterly compliance reports
        • Annual AML/CFT assessment
        • FIU-India reporting as required
        
        6.2. Internal Reporting:
        • Daily transaction monitoring reports
        • Weekly suspicious activity summaries
        • Monthly compliance dashboard
        • Quarterly risk assessment reports
        
        6.3. Record Keeping:
        • Customer identification records: 10 years
        • Transaction records: 10 years
        • Suspicious transaction reports: 10 years
        • Compliance reports: 7 years
      `
    },
    {
      title: "7. EMPLOYEE TRAINING AND AWARENESS",
      content: `
        7.1. Training Programs:
        • Annual AML/CFT training for all employees
        • Specialized training for compliance team
        • Regular updates on regulatory changes
        • Case studies and practical examples
        
        7.2. Awareness Campaigns:
        • Internal communication on AML policies
        • Customer education on compliance requirements
        • Regular updates on suspicious activity indicators
        • Best practices and guidelines
        
        7.3. Certification and Testing:
        • Employee certification on AML procedures
        • Regular testing of AML knowledge
        • Performance evaluation and feedback
        • Continuous improvement programs
      `
    },
    {
      title: "8. TECHNOLOGY AND AUTOMATION",
      content: `
        8.1. Automated Systems:
        • Real-time transaction monitoring
        • Automated risk scoring and assessment
        • AI-powered suspicious activity detection
        • Automated reporting and compliance
        
        8.2. Data Analytics:
        • Transaction pattern analysis
        • Customer behavior modeling
        • Risk assessment algorithms
        • Predictive analytics for fraud detection
        
        8.3. System Integration:
        • Integration with banking systems
        • Real-time data sharing with regulators
        • Automated compliance reporting
        • Seamless customer experience
      `
    },
    {
      title: "9. INCIDENT MANAGEMENT AND RESPONSE",
      content: `
        9.1. Incident Detection:
        • Automated alert systems
        • Manual review and investigation
        • Customer reporting mechanisms
        • Regulatory notification procedures
        
        9.2. Response Procedures:
        • Immediate account freezing if required
        • Investigation and documentation
        • Regulatory reporting within timelines
        • Customer communication and support
        
        9.3. Recovery and Prevention:
        • Root cause analysis
        • Process improvement and updates
        • Enhanced monitoring and controls
        • Lessons learned and training updates
      `
    },
    {
      title: "10. THIRD-PARTY DUE DILIGENCE",
      content: `
        10.1. Vendor Assessment:
        • AML/CFT compliance of service providers
        • Risk assessment of third-party relationships
        • Regular review and monitoring
        • Contractual compliance requirements
        
        10.2. Partner Due Diligence:
        • Banking partners and payment processors
        • Technology service providers
        • Compliance service providers
        • International partners and correspondents
        
        10.3. Ongoing Monitoring:
        • Regular review of third-party compliance
        • Performance monitoring and evaluation
        • Risk assessment updates
        • Termination procedures if required
      `
    },
    {
      title: "11. COMPLIANCE OFFICER AND CONTACTS",
      content: `
        11.1. Compliance Officer:
        • Designated AML Compliance Officer
        • Direct reporting to Board of Directors
        • Independent authority and responsibility
        • Regular reporting and updates
        
        11.2. Contact Information:
        • AML Compliance: aml@bell24h.com
        • Compliance Officer: compliance@bell24h.com
        • Regulatory Reporting: reporting@bell24h.com
        • Emergency Contact: +91-1800-123-4567
        
        11.3. Escalation Procedures:
        • Immediate escalation for suspicious activities
        • 24/7 compliance hotline
        • Regulatory notification procedures
        • Internal escalation matrix
      `
    }
  ];

  const handleAcceptPolicy = () => {
    if (accepted) {
      // Store acceptance in localStorage
      localStorage.setItem('bell24h-aml-policy-accepted', 'true');
      localStorage.setItem('bell24h-aml-policy-accepted-date', new Date().toISOString());
      
      // Redirect to wallet or dashboard
      window.location.href = '/dashboard/wallet';
    }
  };

  const downloadPolicy = () => {
    const policyText = amlSections.map(section => 
      `${section.title}\n${section.content}\n`
    ).join('\n');
    
    const blob = new Blob([policyText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Bell24h-AML-Policy.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 rounded-lg">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bell24h AML Policy</h1>
              <h2 className="text-xl font-semibold text-red-600">Anti-Money Laundering & Counter-Terrorism Financing</h2>
              <p className="text-gray-600">RBI Compliant • FIU-India Reporting • Real-time Monitoring</p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">COMPLIANCE REQUIREMENT</h3>
            </div>
            <p className="text-red-700 mb-3">
              This AML Policy is mandatory for all Bell24h wallet users. We are legally required to 
              monitor transactions and report suspicious activities to regulatory authorities.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">RBI Compliant</span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">FIU-India Reporting</span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Real-time Monitoring</span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">KYC Required</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={downloadPolicy}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Policy
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Policy
            </button>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <button
              onClick={() => setShowFullPolicy(!showFullPolicy)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              {showFullPolicy ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showFullPolicy ? 'Hide Full Policy' : 'Show Full Policy'}
            </button>
          </div>

          {showFullPolicy && (
            <div className="space-y-8">
              {amlSections.map((section, index) => (
                <div key={index} className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-red-900 mb-4">Key AML Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-red-800 mb-2">Monitoring & Detection</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Real-time transaction monitoring</li>
                  <li>• Automated suspicious activity detection</li>
                  <li>• AI-powered risk assessment</li>
                  <li>• FIU-India reporting</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-800 mb-2">Compliance Requirements</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Mandatory KYC verification</li>
                  <li>• Transaction limits and monitoring</li>
                  <li>• 10-year record keeping</li>
                  <li>• Regular compliance reporting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Acceptance Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Accept AML Policy</h3>
          
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-gray-700">
                I have read, understood, and agree to the Bell24h AML Policy
              </span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAcceptPolicy}
              disabled={!accepted}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                accepted
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Accept & Continue
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              By accepting this AML policy, you acknowledge that you understand our compliance requirements 
              and agree to cooperate with all monitoring and reporting procedures as required by law.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
