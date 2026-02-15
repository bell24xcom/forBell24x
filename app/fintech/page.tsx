import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fintech Services - Bell24h',
  description: 'Financial technology solutions for B2B transactions'
};

export default function FintechPage() {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">
          Fintech Services
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="feature-card">
            <div className="flex items-center mb-4">
              <div className="feature-icon">
                <span className="text-2xl">💳</span>
              </div>
              <h2 className="feature-title">Digital Payments</h2>
            </div>
            <p className="feature-description">
              Secure and instant payment processing for B2B transactions with multiple payment options
            </p>
            <ul className="text-sm text-neutral-600 space-y-1 mb-4">
              <li>• UPI, NEFT, RTGS</li>
              <li>• Credit/Debit Cards</li>
              <li>• Digital Wallets</li>
              <li>• International Transfers</li>
            </ul>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Learn More →
            </button>
          </div>

          <div className="feature-card">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🏦</span>
              </div>
              <h2 className="feature-title">Trade Finance</h2>
            </div>
            <p className="feature-description">
              Get financing solutions for your B2B transactions including letters of credit and trade loans
            </p>
            <ul className="text-sm text-neutral-600 space-y-1 mb-4">
              <li>• Letters of Credit</li>
              <li>• Trade Loans</li>
              <li>• Invoice Financing</li>
              <li>• Export Credit</li>
            </ul>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Apply Now →
            </button>
          </div>

          <div className="feature-card">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h2 className="feature-title">Escrow Services</h2>
            </div>
            <p className="feature-description">
              Secure your transactions with our escrow services that hold funds until delivery confirmation
            </p>
            <ul className="text-sm text-neutral-600 space-y-1 mb-4">
              <li>• Secure Fund Holding</li>
              <li>• Delivery Verification</li>
              <li>• Dispute Resolution</li>
              <li>• Refund Protection</li>
            </ul>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Get Started →
            </button>
          </div>

          <div className="feature-card">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="feature-title">Financial Analytics</h2>
            </div>
            <p className="feature-description">
              Track your financial performance with detailed analytics and reporting tools
            </p>
            <ul className="text-sm text-neutral-600 space-y-1 mb-4">
              <li>• Transaction History</li>
              <li>• Cash Flow Analysis</li>
              <li>• Profit/Loss Reports</li>
              <li>• Tax Documentation</li>
            </ul>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              View Analytics →
            </button>
          </div>

          <div className="feature-card">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h2 className="feature-title">Risk Management</h2>
            </div>
            <p className="feature-description">
              Protect your business with comprehensive risk assessment and fraud prevention
            </p>
            <ul className="text-sm text-neutral-600 space-y-1 mb-4">
              <li>• Credit Risk Assessment</li>
              <li>• Fraud Detection</li>
              <li>• Compliance Monitoring</li>
              <li>• Insurance Integration</li>
            </ul>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Assess Risk →
            </button>
          </div>

          <div className="feature-card">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h2 className="feature-title">International Trade</h2>
            </div>
            <p className="feature-description">
              Facilitate international B2B transactions with currency exchange and compliance tools
            </p>
            <ul className="text-sm text-neutral-600 space-y-1 mb-4">
              <li>• Multi-Currency Support</li>
              <li>• Forex Services</li>
              <li>• Compliance Tools</li>
              <li>• Cross-Border Payments</li>
            </ul>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Explore →
            </button>
          </div>
        </div>

        <div className="feature-card">
          <h2 className="feature-title mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">💳</div>
                <h3 className="font-semibold">Make Payment</h3>
                <p className="text-sm text-neutral-600">Pay suppliers instantly</p>
              </div>
            </button>

            <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">📋</div>
                <h3 className="font-semibold">View Invoices</h3>
                <p className="text-sm text-neutral-600">Manage your invoices</p>
              </div>
            </button>

            <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold">Financial Report</h3>
                <p className="text-sm text-neutral-600">Generate reports</p>
              </div>
            </button>

            <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">🔧</div>
                <h3 className="font-semibold">Settings</h3>
                <p className="text-sm text-neutral-600">Configure preferences</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
