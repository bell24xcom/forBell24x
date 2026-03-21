import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy - Bell24h',
  description: 'Shipping and delivery policy for Bell24h B2B marketplace. Bell24h is a marketplace facilitator — understand how delivery works between buyers and suppliers.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Shipping & Delivery Policy</h1>
        <p className="text-slate-400 text-sm mb-8">Last updated: March 2026</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Understanding Bell24h as a Marketplace</h2>
            <p>
              Bell24h is a B2B procurement intelligence platform that connects industrial buyers with verified
              suppliers across India. Bell24h is a marketplace facilitator — we do not manufacture, stock,
              or directly ship any physical goods. All transactions for physical goods occur directly between
              buyers (procurement teams, businesses) and suppliers (manufacturers, distributors, traders).
            </p>
            <p className="mt-3">
              By using Bell24h, you acknowledge and agree that Bell24h's role is limited to facilitating
              the connection between buyers and suppliers. All shipping, logistics, and delivery arrangements
              for physical goods are the sole responsibility of the buyer and supplier involved in the transaction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Physical Goods — Supplier Responsibility</h2>
            <p>
              When a buyer accepts a quote from a supplier on Bell24h for physical goods (raw materials,
              manufactured components, industrial supplies, etc.), the following applies:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong className="text-white">Shipping arrangements</strong> are negotiated directly between
                the buyer and supplier as part of the quote and order confirmation process.
              </li>
              <li>
                <strong className="text-white">Delivery timelines</strong> are set by the supplier and agreed
                upon by the buyer before the order is confirmed. Bell24h is not responsible for any delays,
                losses, or damages during transit.
              </li>
              <li>
                <strong className="text-white">Shipping costs</strong> may be included in the quoted price
                (CIF — Cost, Insurance & Freight) or charged separately (Ex-Works / FOR). This is determined
                by the supplier's quote terms.
              </li>
              <li>
                <strong className="text-white">Logistics partners</strong> are chosen by the supplier unless
                otherwise agreed. Common logistics providers in India include DTDC, Blue Dart, Delhivery,
                FedEx India, Maersk, and road transport services.
              </li>
              <li>
                <strong className="text-white">Risk of loss</strong> transfers from supplier to buyer at the
                point of handover to the logistics provider unless the quote specifies otherwise (e.g., door delivery).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Digital Services — Instant Delivery</h2>
            <p>
              Bell24h offers digital products and subscription services that are delivered electronically.
              These include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong className="text-white">Supplier Subscription Plans</strong> (Starter ₹999/month,
                Growth ₹2,999/month, Enterprise ₹7,999/month) — Access is activated immediately upon
                successful payment confirmation from Razorpay. No physical delivery involved.
              </li>
              <li>
                <strong className="text-white">Premium Buyer Features</strong> — Unlocked instantly upon
                payment. No physical delivery involved.
              </li>
              <li>
                <strong className="text-white">Featured Listings</strong> — Go live on the platform within
                1 business hour of payment confirmation. No physical delivery involved.
              </li>
            </ul>
            <p className="mt-3">
              For all digital services, a payment confirmation and access details will be sent to your
              registered email address and/or mobile number within 30 minutes of successful payment.
              If you do not receive confirmation within this time, please contact our support team.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Delivery Timelines for Physical Goods</h2>
            <p>
              Bell24h does not guarantee any specific delivery timelines for physical goods, as these depend
              entirely on the supplier and their logistics arrangements. As a general guideline for India:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong className="text-white">Same city / local delivery:</strong> 1–3 business days</li>
              <li><strong className="text-white">Inter-city within same state:</strong> 3–7 business days</li>
              <li><strong className="text-white">Inter-state delivery:</strong> 5–14 business days</li>
              <li><strong className="text-white">Remote / Northeast India:</strong> 10–21 business days</li>
              <li><strong className="text-white">Custom manufacturing / made-to-order:</strong> As per the production timeline specified in the supplier's quote</li>
            </ul>
            <p className="mt-3 text-slate-400 text-sm">
              Note: These are indicative timelines only. Buyers should confirm actual delivery timelines
              with the supplier before finalising the order.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Tracking and Proof of Delivery</h2>
            <p>
              Suppliers are encouraged to provide tracking information to buyers once an order is dispatched.
              Bell24h's platform includes a messaging system that buyers and suppliers can use to share
              shipment details, tracking numbers, and dispatch confirmations.
            </p>
            <p className="mt-3">
              Bell24h does not have access to third-party courier tracking systems. Buyers should use the
              courier company's own tracking portal using the tracking number provided by the supplier.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Shipping Disputes and Bell24h Mediation</h2>
            <p>
              In the event of a shipping dispute (damaged goods, missing shipment, wrong quantity, non-delivery),
              Bell24h provides a mediation service to help resolve issues between buyers and suppliers.
              To raise a shipping dispute:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mt-3">
              <li>Contact the supplier directly through the Bell24h messaging system first.</li>
              <li>If unresolved within 48 hours, raise a dispute ticket at bell24h.helpline@gmail.com with your order ID, supplier details, and evidence (photos, courier receipt).</li>
              <li>Bell24h will contact the supplier on your behalf and attempt to facilitate a resolution within 5–7 business days.</li>
              <li>If the issue remains unresolved, Bell24h may, at its sole discretion, initiate a refund or credit as per our Refund Policy.</li>
            </ol>
            <p className="mt-3 text-slate-400 text-sm">
              Bell24h is not liable for losses arising from supplier shipping failures, but we will make
              reasonable efforts to facilitate resolution.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Returns and Reverse Logistics</h2>
            <p>
              Return and replacement policies for physical goods are set by individual suppliers and should
              be confirmed with the supplier before placing an order. Bell24h does not manage reverse logistics
              for physical goods.
            </p>
            <p className="mt-3">
              For digital services and subscriptions, please refer to our{' '}
              <a href="/refund" className="text-blue-400 hover:text-blue-300">Refund Policy</a> for
              information about cancellations and refunds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. GST and Invoicing</h2>
            <p>
              For physical goods ordered through Bell24h, GST invoicing is the responsibility of the supplier.
              Buyers should request a GST invoice from the supplier at the time of order confirmation.
            </p>
            <p className="mt-3">
              For Bell24h subscription and digital service purchases, a GST invoice will be issued by
              Bell24h Technologies and sent to your registered email address within 2 business days of payment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Contact Us</h2>
            <p>
              For questions about this Shipping & Delivery Policy, or for shipping-related disputes
              requiring mediation, please contact us:
            </p>
            <div className="mt-3 space-y-1">
              <p><strong className="text-white">Email:</strong>{' '}
                <a href="mailto:bell24h.helpline@gmail.com" className="text-blue-400 hover:text-blue-300">
                  bell24h.helpline@gmail.com
                </a>
              </p>
              <p><strong className="text-white">Support Hours:</strong> Monday–Saturday, 10:00 AM – 6:00 PM IST</p>
              <p><strong className="text-white">Response Time:</strong> Within 24 hours on business days</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
