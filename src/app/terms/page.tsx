import { Metadata } from 'next';
import LegalPage from '@/src/components/legal/LegalPage';
import { LEGAL_ENTITY, POLICY_LAST_UPDATED } from '@/src/lib/legal';

export const metadata: Metadata = {
  title: `Terms & Conditions | ${LEGAL_ENTITY.platform}`,
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" lastUpdated={POLICY_LAST_UPDATED}>

      <p>
        These Terms and Conditions ("Terms") govern your use of the {LEGAL_ENTITY.platform} platform
        operated by <strong>{LEGAL_ENTITY.name}</strong>. By registering or using the platform you
        agree to these Terms in full.
      </p>

      <h2>1. Platform Description</h2>
      <p>
        {LEGAL_ENTITY.platform} is a B2B trade network that enables buyers to post Quotation Requirements
        (via text, voice, or video) and receive quotes from verified suppliers. The platform provides
        matching, communication, and Protected Payment infrastructure. We are not a party to any
        transaction between buyers and suppliers.
      </p>

      <h2>2. Eligibility and Account</h2>
      <ul>
        <li>You must be 18 years of age or older and authorised to represent your business.</li>
        <li>You must provide accurate information during registration and keep it updated.</li>
        <li>Each mobile number may maintain one account. Duplicate accounts will be merged or removed.</li>
        <li>You are responsible for all activity under your account.</li>
      </ul>

      <h2>3. User-Generated Content</h2>
      <p>
        When you post a Text, Speak (Voice), or Video Requirement, you grant {LEGAL_ENTITY.platform}
        a non-exclusive, royalty-free licence to display, transmit, and match that content with
        relevant suppliers on the platform. You represent that:
      </p>
      <ul>
        <li>The content is accurate and relates to a genuine business requirement.</li>
        <li>You have the authority to make the inquiry on behalf of your business.</li>
        <li>The content does not include personal data of third parties without their consent.</li>
        <li>The content does not violate applicable law, intellectual property rights, or our prohibited activities policy.</li>
      </ul>
      <p>
        Voice and Video Requirements are processed by third-party AI transcription (Groq Whisper v3).
        Raw audio and video are not stored by us. See our <a href="/privacy">Privacy Policy</a> for details.
      </p>

      <h2>4. Supplier Profiles and Pre-Built Listings</h2>
      <p>
        Some supplier profiles are pre-built from publicly available business information. If you are
        a business whose profile appears on the platform, you may claim, correct, or request deletion
        of that profile at any time. See <a href="/data-deletion">Data Deletion</a>.
      </p>

      <h2>5. Payments and Protected Payment</h2>
      <ul>
        <li>Payments are processed via Razorpay, a third-party payment gateway. We do not directly hold buyer funds.</li>
        <li>The "Protected Payment" feature holds funds in escrow until both parties confirm delivery.</li>
        <li>Platform fees (if applicable) are deducted at the time of deal confirmation.</li>
        <li>Dispute resolution follows our <a href="/refund-policy">Refund & Cancellation Policy</a>.</li>
        <li>We comply with RBI guidelines; Trade Account balances are maintained through licensed nodal partners and are not our proprietary wallets.</li>
      </ul>

      <h2>6. Prohibited Activities</h2>
      <p>You must not:</p>
      <ul>
        <li>Post false, misleading, or fraudulent requirements or quotes.</li>
        <li>Spam or contact other users outside the platform for commercial solicitation.</li>
        <li>Reverse-engineer, scrape, or automate access to the platform.</li>
        <li>Upload malicious code, attempt unauthorised access, or conduct denial-of-service attacks.</li>
        <li>Violate any applicable Indian or international law.</li>
      </ul>
      <p>
        Violations may result in immediate account suspension and reporting to relevant authorities.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        All platform IP (branding, code, matching algorithms, Trust Confidence Score™ methodology) is
        owned by {LEGAL_ENTITY.name}. You may not reproduce or use our trademarks without written consent.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        {LEGAL_ENTITY.platform} is a marketplace facilitator. We are not liable for the quality,
        delivery, or legality of goods and services transacted between buyers and suppliers. Our
        aggregate liability for any claim shall not exceed the platform fees paid by you in the
        12 months preceding the claim.
      </p>

      <h2>9. Governing Law and Dispute Resolution</h2>
      <p>
        These Terms are governed by the laws of India. Disputes shall first be attempted to be
        resolved through our grievance mechanism (email {LEGAL_ENTITY.grievanceEmail}).
        If unresolved, disputes shall be subject to the exclusive jurisdiction of courts at
        Thane, Maharashtra.
      </p>

      <h2>10. Grievance Redressal</h2>
      <p>
        Grievance Officer: <strong>{LEGAL_ENTITY.proprietor}</strong>, {LEGAL_ENTITY.name}.
        Email: {LEGAL_ENTITY.grievanceEmail}. We aim to acknowledge grievances within 48 hours and
        resolve them within 30 days.
      </p>

      <h2>11. Amendments</h2>
      <p>
        We may update these Terms at any time. Material changes will be notified via the platform
        or email. Continued use after the effective date constitutes acceptance.
      </p>

    </LegalPage>
  );
}
