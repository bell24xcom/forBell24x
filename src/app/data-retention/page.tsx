import { Metadata } from 'next';
import LegalPage from '@/src/components/legal/LegalPage';
import { LEGAL_ENTITY, POLICY_LAST_UPDATED } from '@/src/config/legal';

export const metadata: Metadata = {
  title: `Data Retention Policy | ${LEGAL_ENTITY.platform}`,
};

const retentionTable = [
  { category: 'User account (active)',         retention: 'Retained while account is active',  basis: 'Contract performance' },
  { category: 'User account (deleted)',         retention: '30 days post-deletion, then purged', basis: 'Operational (recovery window)' },
  { category: 'Transaction & deal records',    retention: '7 years',                            basis: 'GST / Income Tax Act compliance' },
  { category: 'Quotation Requirements (RFQs)', retention: '2 years from posting',               basis: 'Contract + business records' },
  { category: 'Voice/video (raw)',              retention: 'Not stored — processed in memory only', basis: 'Privacy by design' },
  { category: 'Transcribed Requirement text',  retention: '2 years (same as RFQ)',               basis: 'Contract' },
  { category: 'Quotes submitted',              retention: '2 years',                             basis: 'Contract performance' },
  { category: 'OTP verification records',      retention: '30 days',                            basis: 'Security (abuse prevention)' },
  { category: 'Consent events log',            retention: 'Minimum 1 year (no auto-purge)',      basis: 'DPDP Act compliance obligation' },
  { category: 'Erasure request log',           retention: 'Minimum 1 year (no auto-purge)',      basis: 'DPDP Act compliance obligation' },
  { category: 'Data access log (admin)',       retention: 'Minimum 1 year (no auto-purge)',      basis: 'Audit / accountability' },
  { category: 'Outreach consent log',         retention: 'Minimum 1 year (no auto-purge)',       basis: 'DPDP Act compliance obligation' },
  { category: 'Pre-built profiles (unclaimed)', retention: 'Reviewed for deletion at 3 years',  basis: 'Legitimate interest — periodic review' },
  { category: 'Error & security logs',         retention: '90 days rolling',                    basis: 'Security operations' },
  { category: 'Payment records (Razorpay)',    retention: 'Per Razorpay\'s own policy',          basis: 'Third-party processor obligation' },
];

export default function DataRetentionPage() {
  return (
    <LegalPage title="Data Retention Policy" lastUpdated={POLICY_LAST_UPDATED}>

      <p>
        This policy describes how long {LEGAL_ENTITY.platform} retains different categories of personal
        and business data, and the legal basis for each retention period. It is supplementary to our{' '}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>Retention Schedule</h2>
      <div className="not-prose overflow-x-auto">
        <table className="w-full text-sm border border-slate-700 rounded-lg overflow-hidden mb-6">
          <thead className="bg-slate-800">
            <tr>
              <th className="text-left px-4 py-2 text-slate-300">Data Category</th>
              <th className="text-left px-4 py-2 text-slate-300">Retention Period</th>
              <th className="text-left px-4 py-2 text-slate-300">Legal Basis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {retentionTable.map((row) => (
              <tr key={row.category} className="bg-slate-900/40">
                <td className="px-4 py-2 text-white font-medium">{row.category}</td>
                <td className="px-4 py-2 text-slate-300">{row.retention}</td>
                <td className="px-4 py-2 text-slate-400">{row.basis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Deletion on Request</h2>
      <p>
        You may request early deletion of your personal data via our{' '}
        <a href="/data-deletion">Data Deletion page</a>. Deletion requests are processed within
        30 days. Note that:
      </p>
      <ul>
        <li>Transaction and financial records required for statutory compliance (7 years) cannot be deleted earlier.</li>
        <li>Compliance logs (consent events, erasure request records) are retained for audit obligations.</li>
        <li>Anonymised aggregated statistics (e.g., category demand trends) that cannot be re-linked to you are not subject to erasure.</li>
      </ul>

      <h2>Voice and Video — Privacy by Design</h2>
      <p>
        Raw audio and video files recorded for Speak Requirements and Video Requirements are processed
        exclusively in memory by the transcription service and are never written to our storage.
        This design choice ensures we hold no biometric or facial data. Only the resulting text
        (product, quantity, location, budget) is stored.
      </p>

      <h2>Pre-Built Profiles</h2>
      <p>
        Supplier profiles pre-built from public business data are retained to facilitate genuine
        trade matching. Unclaimed profiles that have received no buyer interest and no claim attempt
        are reviewed for deletion at the 3-year mark. Any business can request earlier deletion by
        contacting {LEGAL_ENTITY.grievanceEmail}.
      </p>

      <h2>Compliance Log Retention</h2>
      <p>
        Consent events, erasure request records, outreach consent logs, and data access logs are
        retained for a minimum of one year with no automated purge. This is a deliberate design
        decision to ensure we can demonstrate compliance with the DPDP Act 2023 if required by a
        regulator or in response to a grievance.
      </p>

    </LegalPage>
  );
}
