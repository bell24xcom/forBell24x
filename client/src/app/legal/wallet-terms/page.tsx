'use client';
import Header from '@/components/Header';

export default function WalletTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Wallet Terms of Service" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Wallet Terms of Service</h1>
          
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Digital Wallet Services</h2>
            <p className="text-gray-600 mb-4">
              Bell24h provides digital wallet services to facilitate secure and convenient transactions 
              between buyers and suppliers. Our wallet is powered by ICICI Bank and integrated with 
              Razorpay and Stripe payment gateways.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Account Setup</h2>
            <p className="text-gray-600 mb-4">
              To use our wallet services, you must:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Complete KYC verification as per RBI guidelines</li>
              <li>Provide valid bank account details</li>
              <li>Verify your mobile number and email address</li>
              <li>Accept these terms and conditions</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Wallet Features</h2>
            <p className="text-gray-600 mb-4">
              Our wallet provides:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Instant fund transfers between users</li>
              <li>Secure payment processing</li>
              <li>Transaction history and reporting</li>
              <li>Multi-currency support (INR, USD, EUR)</li>
              <li>Integration with escrow services</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Payment Gateway Integration</h2>
            <p className="text-gray-600 mb-4">
              We integrate with multiple payment gateways:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li><strong>Razorpay:</strong> For domestic payments and UPI</li>
              <li><strong>Stripe:</strong> For international payments</li>
              <li><strong>ICICI Bank:</strong> For escrow and banking services</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Security Measures</h2>
            <p className="text-gray-600 mb-4">
              We implement multiple security layers:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>End-to-end encryption for all transactions</li>
              <li>Two-factor authentication (2FA)</li>
              <li>PCI DSS compliance</li>
              <li>Regular security audits</li>
              <li>Fraud detection and prevention</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Transaction Limits</h2>
            <p className="text-gray-600 mb-4">
              Daily transaction limits are based on your verification level:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li><strong>Basic:</strong> ₹50,000 per day</li>
              <li><strong>Verified:</strong> ₹2,00,000 per day</li>
              <li><strong>Premium:</strong> ₹10,00,000 per day</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Fees and Charges</h2>
            <p className="text-gray-600 mb-4">
              Wallet transaction fees:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Domestic transfers: 0.5% (minimum ₹5)</li>
              <li>International transfers: 2.5% (minimum ₹50)</li>
              <li>Escrow transactions: 2.5% (minimum ₹500)</li>
              <li>Withdrawal to bank: ₹10 per transaction</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Dispute Resolution</h2>
            <p className="text-gray-600 mb-4">
              For wallet-related disputes, we provide:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>24/7 customer support</li>
              <li>Dispute resolution within 48 hours</li>
              <li>Refund processing for valid claims</li>
              <li>Escalation to banking partners if needed</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Regulatory Compliance</h2>
            <p className="text-gray-600 mb-4">
              Our wallet services comply with:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>RBI guidelines for digital payments</li>
              <li>Prepaid Payment Instrument (PPI) regulations</li>
              <li>Anti-Money Laundering (AML) policies</li>
              <li>Know Your Customer (KYC) requirements</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              For wallet-related queries, contact us at:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Email: wallet@bell24h.com</li>
              <li>Phone: +91-22-1234-5678</li>
              <li>Address: Bell24h Wallet Services, Mumbai, Maharashtra</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
