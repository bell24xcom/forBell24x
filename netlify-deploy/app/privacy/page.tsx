export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Data Collection</h2>
        <p>We collect: Name, Email, Phone, Company Name, Business Requirements, and payment information for service delivery.</p>

        <h2 className="text-xl font-semibold">2. Data Usage</h2>
        <p>Your data is used only for service delivery, business communication, and improving our services.</p>

        <h2 className="text-xl font-semibold">3. Data Sharing</h2>
        <p>We do not sell or share your personal data with third parties except for service delivery partners (suppliers, verification agencies).</p>

        <h2 className="text-xl font-semibold">4. Data Security</h2>
        <p>We use industry-standard security measures including SSL encryption and secure payment processing to protect your data.</p>

        <h2 className="text-xl font-semibold">5. Data Retention</h2>
        <p>We retain your data for 3 years after last service delivery for legal and business purposes.</p>

        <h2 className="text-xl font-semibold">6. Your Rights</h2>
        <p>You can request data deletion, correction, or access by emailing privacy@bell24h.com</p>

        <h2 className="text-xl font-semibold">7. Contact</h2>
        <p>Email: privacy@bell24h.com<br />
          Phone: +91-XXXXXXXXXX</p>

        <p className="mt-6 text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      </section>
    </div>
  );
}