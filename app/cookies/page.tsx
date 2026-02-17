import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - Bell24h',
  description: 'Cookie policy for Bell24h B2B marketplace',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Cookie Policy</h1>

        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit our website. They help us provide
              a better user experience by remembering your preferences, keeping you signed in, and analyzing site usage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Cookies</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Essential Cookies:</strong> Required for the website to function properly, including authentication and security.</li>
              <li><strong className="text-white">Analytics Cookies:</strong> Help us understand how visitors interact with our website to improve user experience.</li>
              <li><strong className="text-white">Preference Cookies:</strong> Remember your settings and preferences for future visits.</li>
              <li><strong className="text-white">Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign effectiveness.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Managing Cookies</h2>
            <p>
              You can control and manage cookies through your browser settings. Please note that disabling certain
              cookies may affect the functionality of our website. Most browsers allow you to refuse or accept cookies,
              delete existing cookies, and set preferences for certain websites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Third-Party Cookies</h2>
            <p>
              We may use third-party services such as Google Analytics, payment processors, and social media
              integrations that set their own cookies. We do not control these cookies and recommend reviewing
              the respective privacy policies of these services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Contact Us</h2>
            <p>
              If you have questions about our cookie policy, please contact us at{' '}
              <a href="mailto:support@bell24h.com" className="text-blue-400 hover:text-blue-300">support@bell24h.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
