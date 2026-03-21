import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - Bell24h',
  description: 'Cookie policy for Bell24h B2B marketplace platform. Learn how we use cookies to improve your experience.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Cookie Policy</h1>
        <p className="text-slate-400 text-sm mb-8">Last updated: March 2026</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are stored on your device (computer, tablet, or mobile phone)
              when you visit a website. They are widely used by website owners to make their websites work,
              or to work more efficiently, as well as to provide reporting information.
            </p>
            <p className="mt-3">
              Cookies set by the website owner (in this case, Bell24h Technologies) are called "first-party cookies."
              Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies
              enable third-party features or functionality to be provided on or through the website (e.g., payment
              processing, analytics, and interactive content).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Types of Cookies We Use</h2>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">2.1 Essential / Strictly Necessary Cookies</h3>
            <p>
              These cookies are required for the operation of our website. They include, for example, cookies
              that enable you to log into secure areas of our website, use a shopping cart, or make use of
              e-billing services. Without these cookies, the services you have asked for cannot be provided.
              These cookies cannot be switched off in our systems.
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong className="text-white">auth-token:</strong> Stores your authentication session for secure login (expires in 7 days)</li>
              <li><strong className="text-white">bell24h_user:</strong> Stores your basic user preferences and role (buyer/supplier)</li>
              <li><strong className="text-white">CSRF token:</strong> Protects against cross-site request forgery attacks</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">2.2 Performance / Analytics Cookies</h3>
            <p>
              These cookies allow us to count visits and traffic sources so we can measure and improve the
              performance of our site. They help us know which pages are the most and least popular and see
              how visitors move around the site. All information these cookies collect is aggregated and therefore
              anonymous.
            </p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">2.3 Functionality Cookies</h3>
            <p>
              These are used to recognise you when you return to our website. This enables us to personalise
              our content for you, greet you by name, and remember your preferences (for example, your choice
              of language or region). The information these cookies collect may be anonymised.
            </p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">2.4 Targeting / Marketing Cookies</h3>
            <p>
              These cookies record your visit to our website, the pages you have visited, and the links you have
              followed. We will use this information to make our website and the advertising displayed on it more
              relevant to your interests. We may also share this information with third parties for this purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Third-Party Cookies</h2>
            <p>
              In addition to our own cookies, we may also use various third-party cookies to report usage
              statistics of the service, deliver advertisements on and through the service, and so on.
            </p>
            <p className="mt-3">The third-party services we use that may set cookies include:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong className="text-white">Razorpay:</strong> Our payment processor sets cookies to process
                payments securely and prevent fraud. Razorpay's cookie policy is available at razorpay.com.
              </li>
              <li>
                <strong className="text-white">Google Analytics:</strong> Used for website analytics. Google's
                privacy policy is available at policies.google.com/privacy.
              </li>
              <li>
                <strong className="text-white">Cloudflare:</strong> Our CDN and security provider sets cookies
                for security and performance optimisation.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. How Long Do Cookies Last</h2>
            <p>
              Cookies can remain on your computer or mobile device for different periods of time. Some cookies
              are "session cookies," meaning that they exist only while your browser is open. Session cookies
              are deleted automatically when you close your browser.
            </p>
            <p className="mt-3">
              Other cookies are "persistent cookies," meaning that they survive after your browser is closed.
              Most persistent cookies are automatically deleted after a defined period (which can vary from a
              few minutes to several years). Bell24h authentication cookies expire after 7 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Managing and Controlling Cookies</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie
              rights by setting your preferences in the Cookie Consent Manager. You can also set or amend your
              web browser controls to accept or refuse cookies.
            </p>
            <p className="mt-3">
              The means by which you can refuse cookies through your web browser controls vary from browser
              to browser. You should visit your browser's help menu for more information. The following links
              provide information about cookie management in common browsers:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Google Chrome: Settings → Privacy and security → Cookies and other site data</li>
              <li>Mozilla Firefox: Options → Privacy & Security → Cookies and Site Data</li>
              <li>Safari: Preferences → Privacy → Manage Website Data</li>
              <li>Microsoft Edge: Settings → Cookies and site permissions</li>
            </ul>
            <p className="mt-3">
              Please note that if you choose to refuse cookies, you may not be able to use the full
              functionality of our website, including the ability to log in, submit RFQs, or make payments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Cookies and Your Personal Data</h2>
            <p>
              Where we use cookies that process personal data about you, such processing will take place
              on the legal basis of our legitimate interest in ensuring the security and functionality of
              our platform, or with your consent where required by law. Please see our{' '}
              <a href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a> for
              further details about how we process your personal data and your rights in connection with it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Updates to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time in order to reflect, for example, changes
              to the cookies we use or for other operational, legal or regulatory reasons. Please therefore
              re-visit this Cookie Policy regularly to stay informed about our use of cookies and related
              technologies.
            </p>
            <p className="mt-3">
              The date at the top of this Cookie Policy indicates when it was last updated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies or other technologies, please contact us:
            </p>
            <div className="mt-3 space-y-1">
              <p><strong className="text-white">Email:</strong>{' '}
                <a href="mailto:bell24h.helpline@gmail.com" className="text-blue-400 hover:text-blue-300">
                  bell24h.helpline@gmail.com
                </a>
              </p>
              <p><strong className="text-white">Website:</strong>{' '}
                <a href="https://www.bell24h.com" className="text-blue-400 hover:text-blue-300">
                  www.bell24h.com
                </a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
