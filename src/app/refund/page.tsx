import { Metadata } from 'next';
import LegalPage from '@/src/components/legal/LegalPage';
import { LEGAL_ENTITY, POLICY_LAST_UPDATED } from '@/src/lib/legal';

// ── DRAFT — This page has not been reviewed by a qualified legal professional.
// Placeholders marked [LIKE THIS] must be confirmed before this page is binding.
// Do not remove this notice until legal review is complete.

export const metadata: Metadata = {
  title: `Refund & Cancellation Policy | ${LEGAL_ENTITY.platform}`,
  description: `Refund and cancellation terms for ${LEGAL_ENTITY.platform} subscription plans. Operated by ${LEGAL_ENTITY.name}.`,
};

export default function RefundPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy" lastUpdated={POLICY_LAST_UPDATED}>

      {/* ── DRAFT NOTICE ── */}
      <div style={{ background: '#7f1d1d', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
        <strong style={{ color: '#fca5a5' }}>⚠ DRAFT — NOT YET LEGALLY REVIEWED.</strong>
        <span style={{ color: '#fca5a5' }}> Placeholders in [brackets] must be confirmed by the operator before this policy is relied upon as binding. Obtain legal review before publishing.</span>
      </div>

      <p>
        This Refund and Cancellation Policy ("Policy") applies to all paid subscriptions and transactions
        processed through the <strong>{LEGAL_ENTITY.platform}</strong> platform operated by{' '}
        <strong>{LEGAL_ENTITY.name}</strong> (GSTIN: {LEGAL_ENTITY.gstin}). Payments on the platform are
        processed via <strong>Razorpay</strong> as the payment aggregator.
      </p>

      <h2>1. Subscription Cancellation</h2>
      <p>
        You may cancel your paid subscription at any time from your account dashboard. Cancellation takes
        effect at the end of the current billing period. You will retain access to paid features until the
        period ends.
      </p>
      <p>
        <strong>We do not offer prorated refunds for mid-period cancellations</strong> unless required by
        applicable Indian consumer-protection law or as stated in Section 2 below.
      </p>

      <h2>2. Eligibility for Refunds</h2>
      <p>Refunds are considered on a case-by-case basis under the following conditions:</p>
      <ul>
        <li>
          <strong>Technical non-delivery:</strong> If a paid feature was demonstrably unavailable for more
          than [DOWNTIME THRESHOLD — CONFIRM] consecutive hours due to a platform fault, a prorated credit
          or refund may be issued.
        </li>
        <li>
          <strong>Duplicate charge:</strong> If you were charged more than once for the same subscription
          period, the duplicate amount will be refunded in full.
        </li>
        <li>
          <strong>Unauthorized transaction:</strong> Report to <a href={`mailto:${LEGAL_ENTITY.grievanceEmail}`}>{LEGAL_ENTITY.grievanceEmail}</a>{' '}
          within [REPORT WINDOW — CONFIRM] days of the charge. We will investigate and, if confirmed unauthorized, process a full refund.
        </li>
      </ul>
      <p>
        Refunds are <strong>not</strong> issued for:
      </p>
      <ul>
        <li>Change of mind after purchase.</li>
        <li>Failure to use subscribed features during the billing period.</li>
        <li>Accounts suspended for violation of our Terms &amp; Conditions.</li>
      </ul>

      <h2>3. Refund Timeline</h2>
      <p>
        Approved refunds are processed within <strong>[REFUND WINDOW — CONFIRM: e.g. 7–10 business days]</strong>{' '}
        of approval. Refunds are credited to the original payment instrument (card, UPI, net banking) via
        Razorpay. VyaparSethu does not hold customer funds directly.
      </p>

      <h2>4. How to Request a Refund</h2>
      <p>
        Email <a href={`mailto:${LEGAL_ENTITY.grievanceEmail}`}>{LEGAL_ENTITY.grievanceEmail}</a> with:
      </p>
      <ol>
        <li>Your registered mobile number or email address.</li>
        <li>The Razorpay payment ID (visible in your payment confirmation email).</li>
        <li>A brief description of the reason for your refund request.</li>
      </ol>
      <p>
        We aim to acknowledge all refund requests within <strong>[ACKNOWLEDGEMENT SLA — CONFIRM]</strong>{' '}
        business days.
      </p>

      <h2>5. Platform Transaction Fees</h2>
      <p>
        Contact-unlock credits and any one-time transaction fees charged by the platform are
        non-refundable once consumed.
      </p>

      <h2>6. Dispute Resolution</h2>
      <p>
        If you are unsatisfied with a refund decision, you may escalate to the Grievance Officer at{' '}
        <a href={`mailto:${LEGAL_ENTITY.grievanceEmail}`}>{LEGAL_ENTITY.grievanceEmail}</a>.
        Unresolved disputes will be referred to [DISPUTE RESOLUTION MECHANISM — CONFIRM: e.g. arbitration
        under the Arbitration and Conciliation Act 1996, or consumer forum jurisdiction]. This Policy is
        governed by the laws of India.
      </p>

      <h2>7. Amendments</h2>
      <p>
        {LEGAL_ENTITY.name} reserves the right to amend this Policy at any time. Material changes will be
        communicated via email or a notice on the platform at least{' '}
        [NOTICE PERIOD — CONFIRM: e.g. 7 days] before they take effect.
      </p>

      <p>
        For any queries, contact us at{' '}
        <a href={`mailto:${LEGAL_ENTITY.grievanceEmail}`}>{LEGAL_ENTITY.grievanceEmail}</a>
        {' '}or write to us at: {LEGAL_ENTITY.address}.
      </p>

    </LegalPage>
  );
}
