'use client';
import Header from '@/components/Header';

export default function EscrowTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Escrow Terms of Service" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Escrow Terms of Service</h1>
          
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Escrow Services</h2>
            <p className="text-gray-600 mb-4">
              Bell24h provides escrow services to facilitate secure transactions between buyers and suppliers. 
              Our escrow service holds funds in trust until both parties fulfill their obligations.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. ICICI Bank Partnership</h2>
            <p className="text-gray-600 mb-4">
              Our escrow services are powered by ICICI Bank, ensuring secure fund management and compliance 
              with Indian banking regulations. All escrow accounts are maintained with ICICI Bank.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Payment Processing</h2>
            <p className="text-gray-600 mb-4">
              We support multiple payment gateways including Razorpay and Stripe for seamless fund transfers. 
              All transactions are processed securely and in compliance with PCI DSS standards.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Fund Release Process</h2>
            <p className="text-gray-600 mb-4">
              Funds are released to suppliers only after:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Buyer confirms receipt of goods/services</li>
              <li>Quality inspection is completed (if applicable)</li>
              <li>All documentation is verified</li>
              <li>Dispute resolution period has passed</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Dispute Resolution</h2>
            <p className="text-gray-600 mb-4">
              In case of disputes, funds will be held in escrow until resolution. We provide mediation 
              services and follow a structured dispute resolution process.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Fees and Charges</h2>
            <p className="text-gray-600 mb-4">
              Escrow service fees are 2.5% of transaction value, with a minimum of ₹500 and maximum of ₹25,000. 
              Payment gateway charges are additional and as per respective provider terms.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Compliance</h2>
            <p className="text-gray-600 mb-4">
              All escrow services comply with Indian banking regulations, RBI guidelines, and applicable 
              financial services laws. We maintain necessary licenses and certifications.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              For escrow-related queries, contact us at:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Email: escrow@bell24h.com</li>
              <li>Phone: +91-22-1234-5678</li>
              <li>Address: Bell24h Escrow Services, Mumbai, Maharashtra</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
