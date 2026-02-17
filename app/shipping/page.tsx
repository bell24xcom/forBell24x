import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy - Bell24h',
  description: 'Shipping policy for Bell24h B2B marketplace',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Shipping Policy</h1>

        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Overview</h2>
            <p>
              Bell24h is a B2B marketplace platform that connects buyers with suppliers. As a marketplace facilitator,
              Bell24h does not directly handle the shipping of physical goods. Shipping arrangements are made directly
              between buyers and suppliers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Shipping Responsibility</h2>
            <p>
              Individual suppliers listed on Bell24h are responsible for their own shipping policies, including delivery
              timelines, shipping costs, and logistics partners. Buyers should confirm shipping details directly with
              suppliers before placing orders.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Digital Services</h2>
            <p>
              For digital services and subscriptions offered by Bell24h (such as premium membership plans), delivery
              is electronic and instant upon successful payment processing. No physical shipping is involved.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Disputes</h2>
            <p>
              For any shipping-related disputes between buyers and suppliers, Bell24h provides mediation support.
              Please contact our support team at <a href="mailto:support@bell24h.com" className="text-blue-400 hover:text-blue-300">support@bell24h.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Contact Us</h2>
            <p>
              If you have questions about this shipping policy, please contact us at{' '}
              <a href="mailto:support@bell24h.com" className="text-blue-400 hover:text-blue-300">support@bell24h.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
