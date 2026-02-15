export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Services</h2>
        <p>Bell24h provides B2B marketplace and business services including supplier verification reports, RFQ writing assistance, and featured listings.</p>

        <h2 className="text-xl font-semibold">2. Payment Terms</h2>
        <ul className="list-disc pl-6">
          <li>All payments are in INR</li>
          <li>GST extra as applicable (18%)</li>
          <li>Payments are non-refundable once service is initiated</li>
          <li>Services delivered within 48-72 hours</li>
        </ul>

        <h2 className="text-xl font-semibold">3. Service Delivery</h2>
        <ul className="list-disc pl-6">
          <li>Verification Reports: PDF format via email</li>
          <li>RFQ Writing: Improved document via email</li>
          <li>Featured Listings: Live within 24 hours</li>
        </ul>

        <h2 className="text-xl font-semibold">4. Limitations</h2>
        <p>Bell24h provides information services only. We do not guarantee business outcomes or deal closures.</p>

        <h2 className="text-xl font-semibold">5. Dispute Resolution</h2>
        <p>Disputes subject to Maharashtra, India jurisdiction.</p>

        <h2 className="text-xl font-semibold">6. Contact Information</h2>
        <p>For legal matters: legal@bell24h.com</p>

        <p className="mt-6 text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      </section>
    </div>
  );
}