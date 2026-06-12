import { Metadata } from 'next';
import LegalPage from '@/src/components/legal/LegalPage';
import { LEGAL_ENTITY, POLICY_LAST_UPDATED } from '../../config/legal';

export const metadata: Metadata = {
  title: `Cookie Policy | ${LEGAL_ENTITY.platform}`,
};

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated={POLICY_LAST_UPDATED}>

      <p>
        This Cookie Policy explains how {LEGAL_ENTITY.platform} uses cookies and similar local
        storage technologies on <strong>{LEGAL_ENTITY.domain}</strong>.
      </p>

      <h2>What Are Cookies?</h2>
      <p>
        Cookies are small data files placed on your device when you visit a website. We also use
        browser <code>localStorage</code> for similar purposes. Some cookies are essential for the
        platform to function; others are optional and set only with your consent.
      </p>

      <h2>Cookie Categories</h2>

      <h3>1. Essential (Always Active)</h3>
      <p>These are required for core platform functionality and cannot be disabled.</p>
      <ul>
        <li><strong>auth-token / admin-token</strong> — Keeps you logged in. Expires with the browser session or after 8 hours.</li>
        <li><strong>otp-state</strong> — Tracks OTP verification flow. Expires after 10 minutes.</li>
        <li><strong>vyaparsethu_cookie_consent_v1</strong> — Stores your cookie preference. Expires after 1 year.</li>
      </ul>

      <h3>2. Analytics (Optional — Consent Required)</h3>
      <p>
        Set only after you click "Accept All" or enable Analytics in Cookie Settings. Helps us
        understand how buyers and suppliers navigate the platform. No data is sent to external
        advertising networks.
      </p>

      <h3>3. Marketing (Optional — Consent Required)</h3>
      <p>
        Personalises trade-category outreach using first-party signals only. We do not use
        third-party advertising cookies (Google Ads, Meta Pixel, etc.).
      </p>

      <h2>Managing Your Preferences</h2>
      <p>
        When you first visit {LEGAL_ENTITY.domain}, a Cookie Consent Banner lets you choose:
        Accept All, Reject Optional, or Customize. Change your selection at any time via the
        <strong> Cookie Settings</strong> link in the footer.
      </p>

      <h2>Third-Party Cookies</h2>
      <p>
        The Razorpay payment widget may set its own session cookies during checkout.
        These are governed by Razorpay's privacy policy. No advertising-network cookies
        are set by {LEGAL_ENTITY.platform}.
      </p>

      <h2>Contact</h2>
      <p>
        Cookie queries: <a href={`mailto:${LEGAL_ENTITY.grievanceEmail}`}>{LEGAL_ENTITY.grievanceEmail}</a>.
      </p>

    </LegalPage>
  );
}
