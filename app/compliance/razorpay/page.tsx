'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RazorpayCompliance() {
  return (
    <>
      <style jsx>{`
        .compliance-page {
          min-height: 100vh;
          background: white;
        }
        
        .hero-section {
          background: #1a237e;
          color: white;
          padding: 80px 0;
          text-align: center;
        }
        
        .hero-section h1 {
          font-size: 48px;
          margin-bottom: 20px;
          font-weight: bold;
        }
        
        .hero-section p {
          font-size: 20px;
          opacity: 0.9;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .content-section {
          padding: 60px 0;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .section {
          margin-bottom: 60px;
        }
        
        .section h2 {
          font-size: 32px;
          color: #1a237e;
          margin-bottom: 30px;
          font-weight: bold;
        }
        
        .section h3 {
          font-size: 24px;
          color: #333;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        .section p {
          font-size: 16px;
          color: #666;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        
        .section ul {
          margin-bottom: 20px;
        }
        
        .section li {
          font-size: 16px;
          color: #666;
          margin-bottom: 10px;
          padding-left: 20px;
          position: relative;
        }
        
        .section li:before {
          content: '✅';
          position: absolute;
          left: 0;
        }
        
        .payment-methods {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-top: 30px;
        }
        
        .payment-method {
          background: #f5f5f5;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          border: 2px solid #e1e5e9;
          transition: border-color 0.3s;
        }
        
        .payment-method:hover {
          border-color: #1a237e;
        }
        
        .payment-method h3 {
          color: #1a237e;
          margin-bottom: 15px;
        }
        
        .payment-method p {
          color: #666;
          font-size: 14px;
        }
        
        .certificates {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
          margin-top: 30px;
        }
        
        .certificate {
          background: #f5f5f5;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          border: 2px solid #e1e5e9;
        }
        
        .certificate-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        
        .certificate h3 {
          color: #1a237e;
          margin-bottom: 10px;
        }
        
        .certificate p {
          color: #666;
          font-size: 14px;
        }
        
        .security-features {
          background: #f5f5f5;
          padding: 40px;
          border-radius: 12px;
          margin: 40px 0;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-top: 30px;
        }
        
        .feature {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
        }
        
        .feature-icon {
          font-size: 24px;
        }
        
        .feature-text {
          font-size: 16px;
          color: #333;
          font-weight: 500;
        }
        
        .cta-section {
          background: #1a237e;
          color: white;
          padding: 60px 0;
          text-align: center;
          margin-top: 60px;
        }
        
        .cta-section h2 {
          color: white;
          margin-bottom: 20px;
        }
        
        .cta-section p {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 30px;
          font-size: 18px;
        }
        
        .cta-button {
          background: #ff6f00;
          color: white;
          padding: 15px 40px;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
          text-decoration: none;
          display: inline-block;
        }
        
        .cta-button:hover {
          background: #e65100;
        }
        
        @media (max-width: 768px) {
          .hero-section h1 {
            font-size: 36px;
          }
          
          .payment-methods {
            grid-template-columns: 1fr;
          }
          
          .certificates {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <Header />

      <div className="compliance-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <h1>Razorpay Payment Gateway Compliance</h1>
            <p>
              Secure, reliable, and compliant payment processing powered by India's most trusted payment gateway
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="content-section">
          <div className="container">
            {/* Payment Security */}
            <section className="section">
              <h2>Payment Security & Compliance</h2>
              <div className="security-features">
                <h3>Enterprise-Grade Security</h3>
                <div className="features-grid">
                  <div className="feature">
                    <div className="feature-icon">🔒</div>
                    <div className="feature-text">PCI DSS Level 1 Compliant</div>
                  </div>
                  <div className="feature">
                    <div className="feature-icon">🛡️</div>
                    <div className="feature-text">256-bit SSL Encryption</div>
                  </div>
                  <div className="feature">
                    <div className="feature-icon">🔐</div>
                    <div className="feature-text">Two-Factor Authentication</div>
                  </div>
                  <div className="feature">
                    <div className="feature-icon">🚨</div>
                    <div className="feature-text">Real-time Fraud Detection</div>
                  </div>
                </div>
              </div>
              
              <h3>Regulatory Compliance</h3>
              <ul>
                <li>RBI Licensed Payment Aggregator</li>
                <li>ISO 27001:2013 Certified</li>
                <li>SOC 2 Type II Compliant</li>
                <li>GDPR Compliant Data Protection</li>
                <li>Indian Data Localization Compliant</li>
              </ul>
            </section>

            {/* Accepted Payment Methods */}
            <section className="section">
              <h2>Accepted Payment Methods</h2>
              <p>We support all major payment methods to ensure seamless transactions for your business needs.</p>
              
              <div className="payment-methods">
                <div className="payment-method">
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>💳</div>
                  <h3>Credit & Debit Cards</h3>
                  <p>Visa, Mastercard, Rupay, American Express</p>
                </div>
                
                <div className="payment-method">
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📱</div>
                  <h3>UPI Payments</h3>
                  <p>Google Pay, PhonePe, Paytm, BHIM, Razorpay UPI</p>
                </div>
                
                <div className="payment-method">
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>💰</div>
                  <h3>Digital Wallets</h3>
                  <p>Paytm, Amazon Pay, Mobikwik, JioMoney</p>
                </div>
                
                <div className="payment-method">
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏦</div>
                  <h3>Net Banking</h3>
                  <p>50+ Banks Supported Across India</p>
                </div>
                
                <div className="payment-method">
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏪</div>
                  <h3>EMI Options</h3>
                  <p>No Cost EMI, Credit Card EMI, Buy Now Pay Later</p>
                </div>
                
                <div className="payment-method">
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏧</div>
                  <h3>Cash on Delivery</h3>
                  <p>Available for select products and locations</p>
                </div>
              </div>
            </section>

            {/* Refund Policy */}
            <section className="section">
              <h2>Refund Policy</h2>
              <h3>Processing Times</h3>
              <ul>
                <li>Credit/Debit Cards: 5-7 business days</li>
                <li>UPI Payments: 1-3 business days</li>
                <li>Net Banking: 3-5 business days</li>
                <li>Digital Wallets: 2-4 business days</li>
              </ul>
              
              <h3>Refund Conditions</h3>
              <ul>
                <li>Full refund within 7 days of purchase (if applicable)</li>
                <li>Partial refund for defective or incorrect products</li>
                <li>Processing fee may apply for certain payment methods</li>
                <li>Refund amount credited to original payment method</li>
              </ul>
            </section>

            {/* Compliance Certificates */}
            <section className="section">
              <h2>Compliance Certificates</h2>
              <p>Our partnership with Razorpay ensures we meet the highest standards of security and compliance.</p>
              
              <div className="certificates">
                <div className="certificate">
                  <div className="certificate-icon">🏆</div>
                  <h3>PCI DSS Level 1</h3>
                  <p>Highest level of payment card security certification</p>
                </div>
                
                <div className="certificate">
                  <div className="certificate-icon">📋</div>
                  <h3>ISO 27001</h3>
                  <p>Information security management system certified</p>
                </div>
                
                <div className="certificate">
                  <div className="certificate-icon">🔍</div>
                  <h3>SOC 2 Type II</h3>
                  <p>Audited security, availability, and confidentiality controls</p>
                </div>
                
                <div className="certificate">
                  <div className="certificate-icon">🏛️</div>
                  <h3>RBI Licensed</h3>
                  <p>Authorized Payment Aggregator by Reserve Bank of India</p>
                </div>
              </div>
            </section>

            {/* Data Protection */}
            <section className="section">
              <h2>Data Protection & Privacy</h2>
              <h3>Data Security Measures</h3>
              <ul>
                <li>End-to-end encryption for all transactions</li>
                <li>Tokenization of sensitive payment data</li>
                <li>Regular security audits and penetration testing</li>
                <li>24/7 fraud monitoring and prevention</li>
                <li>Secure data centers with physical security controls</li>
              </ul>
              
              <h3>Privacy Compliance</h3>
              <ul>
                <li>GDPR compliant data processing</li>
                <li>Indian Data Localization as per RBI guidelines</li>
                <li>Minimal data collection and storage</li>
                <li>Regular data purging and anonymization</li>
                <li>User consent management for data processing</li>
              </ul>
            </section>

            {/* Support */}
            <section className="section">
              <h2>Payment Support</h2>
              <h3>24/7 Customer Support</h3>
              <ul>
                <li>Round-the-clock payment assistance</li>
                <li>Multi-language support (English, Hindi, Regional languages)</li>
                <li>Live chat and phone support</li>
                <li>Email support with quick response times</li>
                <li>Comprehensive FAQ and help documentation</li>
              </ul>
              
              <h3>Transaction Monitoring</h3>
              <ul>
                <li>Real-time transaction status updates</li>
                <li>Automated fraud detection and prevention</li>
                <li>Dispute resolution and chargeback management</li>
                <li>Detailed transaction history and reporting</li>
                <li>API integration for seamless payment processing</li>
              </ul>
            </section>
          </div>
        </div>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <h2>Ready to Experience Secure Payments?</h2>
            <p>
              Join thousands of businesses already using our secure payment gateway for their transactions.
            </p>
            <a href="/auth/login" className="cta-button">
              Get Started Now
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
