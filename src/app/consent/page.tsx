import { Metadata } from 'next';
import LegalPage from '@/src/components/legal/LegalPage';
import { LEGAL_ENTITY, POLICY_LAST_UPDATED, CONSENT_TEXT_VERSION } from '../config/legal';

export const metadata: Metadata = {
  title: `Consent Notice | ${LEGAL_ENTITY.platform}`,
};

export default function ConsentNoticePage() {
  return (
    <LegalPage title="Consent Notice" lastUpdated={POLICY_LAST_UPDATED}>

      <p>
        This Consent Notice explains exactly what you are agreeing to when you tick the consent
        checkboxes on {LEGAL_ENTITY.platform}. It is issued under the{' '}
        <strong>Digital Personal Data Protection Act 2023 (DPDP Act)</strong>, which requires
        that consent be <strong>free, informed, specific, and unambiguous</strong>.
        Consent text version: <code>{CONSENT_TEXT_VERSION}</code>.
      </p>

      <h2>What We Ask Consent For</h2>

      <h3>1. Account Registration (Mandatory)</h3>
      <p>
        When you create an account, you consent to:
      </p>
      <ul>
        <li>Processing your mobile number to send OTP for authentication.</li>
        <li>Storing your name, company, email, and location to create your business profile.</li>
        <li>Displaying your business profile to buyers searching in your category.</li>
        <li>Our <a href="/terms">Terms &amp; Conditions</a> and <a href="/privacy">Privacy Policy</a>.</li>
      </ul>
      <p>
        <em>Without this consent, you cannot use the platform.</em>
      </p>

      <h3>2. Posting a Quotation Requirement (Per-post)</h3>
      <p>When you post a Requirement, you consent to:</p>
      <ul>
        <li>Publishing the Requirement content (product, quantity, budget, location) to matched verified suppliers.</li>
        <li>
          <strong>Voice / Video Requirements specifically:</strong> You consent to the audio or video stream
          being processed by Groq's Whisper v3 AI for transcription. The raw audio/video is not stored.
          If your voice or face appears, this is biometric-adjacent personal data and you acknowledge
          the associated processing solely for the purpose of converting your spoken Requirement to text.
        </li>
        <li>Retention of the structured Requirement data for up to 2 years.</li>
      </ul>

      <h3>3. Profile Claim (Suppliers with pre-built profiles)</h3>
      <p>When you claim a pre-built profile, you consent to:</p>
      <ul>
        <li>Verifying that you are the authorised representative of the listed business.</li>
        <li>Replacing pre-built public-data fields with your own verified information.</li>
        <li>WhatsApp message(s) sent to initiate the claim process (see §4).</li>
      </ul>

      <h3>4. WhatsApp Outreach (Optional)</h3>
      <p>
        If you receive a WhatsApp message inviting you to claim your business profile or respond
        to a Requirement, this message is sent on the basis of legitimate business interest.
        By responding positively or clicking the claim link, you provide explicit consent to:
      </p>
      <ul>
        <li>Receiving future trade-relevant WhatsApp notifications from {LEGAL_ENTITY.platform}.</li>
      </ul>
      <p>
        You may opt out at any time by replying STOP or emailing {LEGAL_ENTITY.grievanceEmail}.
      </p>

      <h3>5. Optional Analytics Cookies</h3>
      <p>
        Via the Cookie Consent Banner, you may separately consent to analytics cookies that help us
        understand how the platform is used. These are not set until you explicitly accept them.
        See our <a href="/cookies">Cookie Policy</a>.
      </p>

      <h2>What We Do NOT Use Your Data For</h2>
      <ul>
        <li>We do not sell your personal data to any third party.</li>
        <li>We do not use your data to build advertising profiles for external ad platforms.</li>
        <li>We do not process biometric data from voice/video beyond the immediate transcription.</li>
        <li>We do not transfer your data outside India except to the processors listed in our{' '}
          <a href="/privacy">Privacy Policy</a> (Groq, Vercel, Neon) for the stated purpose only.</li>
      </ul>

      <h2>Withdrawing Consent</h2>
      <p>
        You may withdraw any consent at any time by visiting our{' '}
        <a href="/data-deletion">Data Deletion page</a> or emailing {LEGAL_ENTITY.grievanceEmail}.
        Withdrawal does not affect the lawfulness of processing carried out before withdrawal.
        Withdrawing mandatory consent will result in account deactivation.
      </p>

      <h2>Contact</h2>
      <p>
        For consent-related queries: {LEGAL_ENTITY.grievanceEmail} — Grievance Officer:{' '}
        {LEGAL_ENTITY.proprietor}, {LEGAL_ENTITY.name}.
      </p>

    </LegalPage>
  );
}
