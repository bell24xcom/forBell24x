import { Metadata } from 'next';
import LegalPage from '@/src/components/legal/LegalPage';
import { LEGAL_ENTITY, POLICY_LAST_UPDATED } from '@/src/lib/legal';

export const metadata: Metadata = {
  title: `Privacy Policy | ${LEGAL_ENTITY.platform}`,
  description: 'How VyaparSethu collects, uses, and protects your personal data under the Digital Personal Data Protection Act 2023.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated={POLICY_LAST_UPDATED}>

      <p>
        This Privacy Policy describes how <strong>{LEGAL_ENTITY.name}</strong> ("{LEGAL_ENTITY.platform}", "we", "us")
        collects, uses, stores, and discloses personal data when you use our B2B trade platform at{' '}
        <strong>{LEGAL_ENTITY.domain}</strong>. It is issued under the{' '}
        <strong>Digital Personal Data Protection Act 2023 (DPDP Act)</strong> and applies to all
        registered users, visitors, and business contacts of the platform.
      </p>

      <h2>1. Data Fiduciary</h2>
      <p>
        The Data Fiduciary (the entity that determines the purpose and means of processing your personal data) is:
      </p>
      <ul>
        <li><strong>Entity:</strong> {LEGAL_ENTITY.name} ({LEGAL_ENTITY.type})</li>
        <li><strong>Proprietor / Grievance Officer:</strong> {LEGAL_ENTITY.proprietor}</li>
        <li><strong>GSTIN:</strong> {LEGAL_ENTITY.gstin}</li>
        <li><strong>Address:</strong> {LEGAL_ENTITY.address}</li>
        <li><strong>Grievance Email:</strong> {LEGAL_ENTITY.grievanceEmail}</li>
      </ul>

      <h2>2. Personal Data We Collect</h2>
      <h3>2a. Data you provide directly</h3>
      <ul>
        <li><strong>Identity:</strong> Full name, company / firm name.</li>
        <li><strong>Contact:</strong> Mobile number (required for OTP login), email address.</li>
        <li><strong>Business verification:</strong> GST Identification Number (GSTIN), Udyam Registration Number.</li>
        <li><strong>Location:</strong> City / state for matching buyers and suppliers.</li>
        <li><strong>Profile:</strong> Product categories, business description.</li>
        <li><strong>Transaction data:</strong> Quotation requests, quotes submitted, deal and payment records.</li>
      </ul>

      <h3>2b. Pre-built supplier profiles from public business information</h3>
      <p>
        To help genuine buyers find suppliers quickly, some supplier profiles on {LEGAL_ENTITY.platform} are
        pre-built from <strong>publicly available business information</strong> (such as directories, trade
        registrations, and government databases) before a supplier has registered on the platform. These
        profiles contain only business contact and category data sourced from public records.
      </p>
      <p>
        If your business appears as a pre-built profile, you have the right to:
      </p>
      <ul>
        <li><strong>Claim the profile</strong> — verify ownership and take control of the listing.</li>
        <li><strong>Correct any inaccurate information</strong> — update or amend data after claiming.</li>
        <li><strong>Request deletion</strong> — submit an erasure request via our{' '}
          <a href="/data-deletion">Data Deletion page</a> or email {LEGAL_ENTITY.grievanceEmail}.</li>
      </ul>
      <p>
        We do not sell pre-built profile data. Access to contact details in pre-built profiles is restricted
        to verified buyers who have an active quotation requirement.
      </p>

      <h3>2c. User-generated content — Text, Voice, and Video Requirements</h3>
      <p>
        The platform lets buyers post Quotation Requirements in three formats:
      </p>
      <ul>
        <li>
          <strong>Text Requirement:</strong> Written description you submit directly. Stored as structured
          text in the requirements database and published to matched suppliers.
        </li>
        <li>
          <strong>Speak Requirement (Voice):</strong> An audio recording you make in-browser.
          The audio is transmitted to Groq's Whisper v3 transcription service for conversion to text.
          <strong> The raw audio file is not stored by us.</strong> Only the resulting
          structured text data (product, quantity, location, budget) is stored and published.
          Voice recordings may contain your voice, which is biometric-adjacent personal data.
          Groq's processing is governed by their privacy policy.
        </li>
        <li>
          <strong>Video Requirement:</strong> A short video recording you make in-browser.
          The video's audio track is transcribed by Groq Whisper v3 and structured data is extracted.
          <strong> The raw video file is not stored by us.</strong> If your video contains your
          face, this constitutes sensitive personal data. Only the extracted text data is stored.
          Please do not record sensitive personal information (Aadhaar, PAN, financial data) in
          voice or video requirements.
        </li>
      </ul>
      <p>
        All Requirement posts are published to matched suppliers on the platform once submitted.
        Public Requirements are visible to all suppliers in the relevant category. You can request
        removal of a Requirement by raising a deletion request or contacting us.
      </p>

      <h3>2d. Automatically collected data</h3>
      <ul>
        <li>IP address (stored as an irreversible hash for compliance logging; not linked to your identity).</li>
        <li>Browser type, device type, and session duration for platform improvement.</li>
        <li>Interaction logs: pages viewed, Requirements posted, quotes received.</li>
      </ul>

      <h2>3. How We Use Your Personal Data</h2>
      <ul>
        <li>Sending OTP for phone-based authentication.</li>
        <li>Matching your Quotation Requirements with relevant verified suppliers.</li>
        <li>Displaying your business profile to buyers searching in your product category.</li>
        <li>Processing payments via Razorpay (Protected Payment / Escrow).</li>
        <li>Calculating Trust Confidence Score™ from transaction and platform behaviour history.</li>
        <li>Sending platform notifications (WhatsApp and email) about requirements matching your category.</li>
        <li>Compliance, fraud prevention, and audit trail obligations.</li>
      </ul>

      <h2>4. WhatsApp Communications and Opt-In / Opt-Out</h2>
      <p>
        We may send WhatsApp messages to suppliers whose contact details appear in pre-built profiles or
        to registered users, to notify them of matching Quotation Requirements. These messages are sent
        on the basis of <strong>legitimate business interest</strong> (connecting businesses with relevant
        trade opportunities) and, where required, explicit opt-in consent.
      </p>
      <p>
        <strong>To opt out:</strong> Reply STOP to any WhatsApp message, or send an email to{' '}
        {LEGAL_ENTITY.grievanceEmail} with the subject "WhatsApp Opt-Out" and your mobile number.
        We will process opt-outs within 48 hours.
      </p>

      <h2>5. Third-Party Processors</h2>
      <table className="w-full text-sm border border-slate-700 rounded-lg overflow-hidden not-prose mb-6">
        <thead className="bg-slate-800">
          <tr>
            <th className="text-left px-4 py-2 text-slate-300">Processor</th>
            <th className="text-left px-4 py-2 text-slate-300">Purpose</th>
            <th className="text-left px-4 py-2 text-slate-300">Data Shared</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {[
            ['MSG91', 'OTP delivery via SMS', 'Mobile number'],
            ['Razorpay', 'Payment processing', 'Name, email, mobile, amount'],
            ['Groq', 'Voice/video transcription (Whisper v3)', 'Audio/video stream (not stored)'],
            ['Neon / Supabase', 'Database hosting (India-region preferred)', 'All stored personal data'],
            ['Vercel', 'Platform hosting (Edge CDN)', 'Request metadata, IP'],
          ].map(([p, purpose, data]) => (
            <tr key={p} className="bg-slate-900/40">
              <td className="px-4 py-2 text-white font-medium">{p}</td>
              <td className="px-4 py-2 text-slate-300">{purpose}</td>
              <td className="px-4 py-2 text-slate-400">{data}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        We do not sell, rent, or trade personal data to any third party for their marketing or commercial
        purposes. Data is shared with processors solely to deliver the platform's services.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        See our full <a href="/data-retention">Data Retention Policy</a>. In summary:
      </p>
      <ul>
        <li>Active accounts: retained while the account is active.</li>
        <li>Transaction and deal records: 7 years (as required for GST and tax compliance).</li>
        <li>Requirement posts (RFQs): 2 years from posting, unless deleted earlier by the user.</li>
        <li>OTP verification records: 30 days.</li>
        <li>Compliance logs (consent events, erasure requests, data access logs): minimum 1 year.</li>
        <li>Pre-built supplier profiles not claimed within 3 years: reviewed for deletion.</li>
      </ul>

      <h2>7. Your Rights under DPDP Act 2023</h2>
      <ul>
        <li><strong>Right to Access:</strong> Request a summary of personal data we hold about you.</li>
        <li><strong>Right to Correction:</strong> Correct inaccurate or incomplete data via your profile.</li>
        <li><strong>Right to Erasure:</strong> Request deletion of your personal data via our{' '}
          <a href="/data-deletion">Data Deletion page</a>.
        </li>
        <li><strong>Right to Grievance Redressal:</strong> Raise a complaint with the Grievance Officer
          at {LEGAL_ENTITY.grievanceEmail}. We will respond within 7 business days.</li>
        <li><strong>Right to Nominate:</strong> Nominate another individual to exercise these rights on your behalf in the event of your death or incapacity.</li>
        <li><strong>Right to Withdraw Consent:</strong> You may withdraw consent for optional processing at any time; this does not affect prior processing.</li>
      </ul>
      <p>
        To exercise any right, email {LEGAL_ENTITY.grievanceEmail} with your registered mobile number
        or email, and the specific action requested.
      </p>

      <h2>8. Security</h2>
      <p>
        We implement industry-standard security measures including HTTPS/TLS, hashed credentials,
        JWT-based session tokens, and row-level access controls on the database. No system is
        perfectly secure; if you suspect a data breach, notify us immediately at {LEGAL_ENTITY.grievanceEmail}.
      </p>

      <h2>9. Changes to this Policy</h2>
      <p>
        Material changes will be communicated via in-app notification and reflected in the
        "Last Updated" date above. Continued use of the platform after the effective date constitutes
        acknowledgement of the updated policy.
      </p>
    </LegalPage>
  );
}
