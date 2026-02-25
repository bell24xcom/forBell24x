import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-white mb-4">Refund & Cancellation Policy</h1>
          <p className="text-slate-400 mb-8">Last Updated: February 26, 2026</p>

          <div className="space-y-8 text-slate-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Overview</h2>
              <p className="mb-4">
                Bell24h ("we," "us," or "our"), operated by DIGITEX STUDIO, is committed to customer satisfaction. This Refund & Cancellation Policy outlines the circumstances
                under which refunds may be issued for various services on our Platform (www.bell24h.com).
              </p>
              <p className="mb-4">
                This Policy should be read in conjunction with our Terms & Conditions and Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. RFQ Posting Services</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.1 Free RFQ Posting</h3>
              <p className="mb-4">
                <strong className="text-white">Service:</strong> Posting RFQs (Request for Quotations) on Bell24h is FREE for all users.
              </p>
              <p className="mb-4">
                <strong className="text-white">Refund Applicability:</strong> Not applicable. Since the service is free, no refunds are offered for RFQ posting.
              </p>
              <p className="mb-4">
                <strong className="text-white">Cancellation:</strong> You may delete or close your RFQ at any time from your dashboard at no charge.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.2 Premium RFQ Features</h3>
              <p className="mb-4">
                <strong className="text-white">Service:</strong> Optional paid features such as "Featured RFQ" (priority listing) or "Extended Reach" (multi-category visibility).
              </p>
              <p className="mb-4">
                <strong className="text-white">Refund Applicability:</strong> Refunds are NOT available for premium RFQ features once the feature has been activated and your RFQ has received visibility.
              </p>
              <p className="mb-4">
                <strong className="text-white">Exception:</strong> If a technical error prevents the feature from functioning as advertised (e.g., Featured RFQ not displayed), contact support@bell24h.com within 48 hours for a full refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Subscription Plans (Free, Pro, Enterprise)</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.1 Free Plan</h3>
              <p className="mb-4">
                <strong className="text-white">Service:</strong> Basic access to Bell24h features at no cost.
              </p>
              <p className="mb-4">
                <strong className="text-white">Refund Applicability:</strong> Not applicable (no payment made).
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.2 Pro and Enterprise Plans</h3>
              <p className="mb-4">
                <strong className="text-white">Service:</strong> Paid subscription plans offering enhanced features (unlimited RFQs, priority support, advanced analytics, etc.).
              </p>
              <p className="mb-4">
                <strong className="text-white">Billing Cycle:</strong> Plans are billed monthly or annually based on your selection.
              </p>
              <p className="mb-4">
                <strong className="text-white">7-Day Money-Back Guarantee:</strong> If you are not satisfied with your Pro or Enterprise plan, you may request a full refund within 7 days of your initial purchase.
                To qualify:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Request must be made within 7 calendar days of purchase</li>
                <li>Applies only to NEW subscriptions (not renewals)</li>
                <li>You must not have used more than 50% of plan features (e.g., if your plan includes 100 credits, you must have at least 50 remaining)</li>
                <li>Contact support@bell24h.com with your transaction ID and reason for refund</li>
              </ul>
              <p className="mt-4">
                <strong className="text-white">After 7 Days:</strong> Refunds are NOT available. You may cancel your subscription at any time to prevent future renewals, but no refund will be issued for the current billing period.
              </p>
              <p className="mb-4">
                <strong className="text-white">Cancellation:</strong> To cancel your subscription, go to Account Settings {">"} Subscription {">"} Cancel Plan. Your access continues until the end of the current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Credit Purchases</h2>
              <p className="mb-4">
                <strong className="text-white">Service:</strong> Users can purchase Credits to unlock leads, access premium features, or pay platform fees.
              </p>
              <p className="mb-4">
                <strong className="text-white">Refund Applicability:</strong> Credits are NON-REFUNDABLE once purchased.
              </p>
              <p className="mb-4">
                <strong className="text-white">Exceptions:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Duplicate Purchase:</strong> If you are charged twice for the same credit purchase due to a payment gateway error, contact support@bell24h.com within 7 days with transaction proof for a refund.</li>
                <li><strong className="text-white">Unused Credits:</strong> Credits are valid for 12 months from purchase date. Expired credits cannot be refunded or reactivated.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Escrow Payments (Deal Transactions)</h2>
              <p className="mb-4">
                <strong className="text-white">Service:</strong> For transactions above ₹50,000, Bell24h offers optional Escrow service where Buyer's payment is held securely until delivery confirmation.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.1 Successful Delivery</h3>
              <p className="mb-4">
                Once the Buyer confirms delivery and satisfaction, escrow funds are released to the Supplier. No refund applies in this case.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.2 Disputed Transactions</h3>
              <p className="mb-4">
                If the Buyer reports issues with delivery or product quality within 48 hours of receipt, a dispute is raised:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Evidence Required:</strong> Buyer must provide photos, videos, or documents proving non-delivery or quality issues</li>
                <li><strong className="text-white">Mediation:</strong> Bell24h reviews evidence from both parties and mediates a resolution (partial refund, replacement, or full refund)</li>
                <li><strong className="text-white">Timeline:</strong> Disputes are resolved within 7-14 business days</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.3 Escrow Fees</h3>
              <p className="mb-4">
                <strong className="text-white">Escrow Service Fee (1.5% of transaction value) is NON-REFUNDABLE</strong>, even if the deal is cancelled or disputed, as the service (secure payment holding) has been rendered.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.4 Cancellation Before Delivery</h3>
              <p className="mb-4">
                If both Buyer and Supplier mutually agree to cancel the deal BEFORE goods are shipped, a full refund (minus escrow fee and payment gateway charges) is issued to the Buyer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Platform Fees and Commissions</h2>
              <p className="mb-4">
                <strong className="text-white">Service:</strong> Bell24h charges a service fee/commission on successful deals (% varies by plan and deal value).
              </p>
              <p className="mb-4">
                <strong className="text-white">Refund Applicability:</strong> Platform fees are NON-REFUNDABLE once a deal is marked as "Completed" or "In Progress."
              </p>
              <p className="mb-4">
                <strong className="text-white">Exception:</strong> If you were charged a platform fee in error (e.g., fee applied to a cancelled deal), contact support@bell24h.com with proof for investigation and potential refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Payment Gateway Charges</h2>
              <p className="mb-4">
                Razorpay (our payment gateway) charges processing fees on all transactions (typically 2-3% + GST). These fees are deducted by Razorpay and are NOT controlled by Bell24h.
                Payment gateway charges are NON-REFUNDABLE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Refund Request Process</h2>
              <p className="mb-4">
                To request a refund for eligible services:
              </p>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li><strong className="text-white">Contact Support:</strong> Email support@bell24h.com with the subject "Refund Request"</li>
                <li>
                  <strong className="text-white">Provide Details:</strong>
                  <ul className="list-disc list-inside space-y-1 ml-6 mt-2">
                    <li>Your registered email/phone number</li>
                    <li>Transaction ID or order number</li>
                    <li>Date of purchase</li>
                    <li>Reason for refund request</li>
                    <li>Supporting evidence (if applicable, e.g., screenshots of errors)</li>
                  </ul>
                </li>
                <li><strong className="text-white">Review Period:</strong> Our team will review your request within 3-5 business days</li>
                <li><strong className="text-white">Decision Notification:</strong> You will receive an email with the refund decision (approved, partial refund, or denied with reason)</li>
                <li><strong className="text-white">Refund Processing:</strong> If approved, refunds are processed to your original payment method within 7-10 business days</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Refund Timeline</h2>
              <p className="mb-4">
                Once a refund is approved:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Credit/Debit Card:</strong> 7-10 business days (depending on your bank)</li>
                <li><strong className="text-white">UPI/Net Banking:</strong> 5-7 business days</li>
                <li><strong className="text-white">Wallet (Paytm, PhonePe, etc.):</strong> 3-5 business days</li>
              </ul>
              <p className="mt-4">
                If you do not receive your refund within the stated timeline, contact your bank/payment provider first, then reach out to support@bell24h.com with proof of non-receipt.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Exceptions and Special Cases</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">10.1 Promotional Credits</h3>
              <p className="mb-4">
                Credits awarded through promotions, referrals, or loyalty programs are NON-REFUNDABLE and have NO cash value. They can only be used within the Platform.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">10.2 Account Suspension or Termination</h3>
              <p className="mb-4">
                If your account is suspended or terminated due to violation of our Terms & Conditions, no refunds will be issued for purchased credits, subscriptions, or platform fees.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">10.3 Technical Issues</h3>
              <p className="mb-4">
                If Bell24h experiences a platform outage or technical issue that prevents you from using paid services for more than 24 consecutive hours, you may request a pro-rated refund or credit extension.
                Contact support@bell24h.com with the date and time of the outage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to This Policy</h2>
              <p className="mb-4">
                Bell24h reserves the right to modify this Refund & Cancellation Policy at any time. Updated policies will be posted on this page with a revised "Last Updated" date.
                Material changes will be communicated via email.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Information</h2>
              <p className="mb-4">
                For refund inquiries, disputes, or questions about this policy, please contact:
              </p>
              <div className="bg-slate-900 rounded-lg p-6 space-y-2">
                <p><strong className="text-white">Company Name:</strong> DIGITEX STUDIO (Bell24h)</p>
                <p><strong className="text-white">Email:</strong> support@bell24h.com</p>
                <p><strong className="text-white">Phone:</strong> +91-9004962871</p>
                <p><strong className="text-white">Address:</strong> Mumbai, Maharashtra, India</p>
                <p><strong className="text-white">Business Hours:</strong> Monday-Saturday, 10:00 AM - 7:00 PM IST</p>
              </div>
            </section>

            <section className="mt-12 pt-8 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                By making a purchase on Bell24h, you acknowledge that you have read, understood, and agree to this Refund & Cancellation Policy.
              </p>
            </section>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-3 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
