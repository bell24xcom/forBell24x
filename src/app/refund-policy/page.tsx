import { Metadata } from 'next';
import LegalPage from '@/src/components/legal/LegalPage';
import { LEGAL_ENTITY, POLICY_LAST_UPDATED } from '@/src/lib/legal';

export const metadata: Metadata = {
  title: `Refund & Cancellation Policy | ${LEGAL_ENTITY.platform}`,
};

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy" lastUpdated={POLICY_LAST_UPDATED}>

      <p>
        This policy governs refunds and cancellations for transactions processed through{' '}
        {LEGAL_ENTITY.platform}'s Protected Payment (escrow) infrastructure, operated by{' '}
        <strong>{LEGAL_ENTITY.name}</strong>.
      </p>

      <h2>1. Subscription Plan Refunds</h2>
      <ul>
        <li>
          <strong>Pro plan (₹2,999/month):</strong> if you cancel within 7 days of the start of a
          billing period, you receive a full refund for that period.
        </li>
        <li>
          <strong>After 7 days:</strong> no refund is issued for that billing period, but you retain
          full access to Pro features until the end of the period you already paid for.
        </li>
        <li>
          The <strong>transaction fee (2%)</strong> charged on completed deals is non-refundable under
          any circumstances, as it covers payment processing and Protected Payment infrastructure costs
          already incurred at the time of the transaction.
        </li>
      </ul>
      <p>
        Unused credits purchased separately are refundable within 7 days of purchase if not yet spent,
        subject to a processing fee of ₹99 or 5% (whichever is lower).
      </p>

      <h2>2. Protected Payment (Escrow) Transactions</h2>
      <p>
        When a buyer confirms a deal through Protected Payment, funds are held by Razorpay's
        escrow-equivalent mechanism. Refund eligibility depends on the deal stage:
      </p>
      <ul>
        <li>
          <strong>Before supplier confirms order:</strong> Full refund to buyer, less any
          applicable payment gateway charges.
        </li>
        <li>
          <strong>After supplier confirms but before delivery:</strong> Refund subject to mutual
          agreement and/or dispute resolution (see §4).
        </li>
        <li>
          <strong>After buyer confirms receipt:</strong> Funds released to supplier. No refund
          except in cases of proven fraud or material misrepresentation.
        </li>
      </ul>

      <h2>3. Cancellation by Buyer</h2>
      <p>
        Buyers may cancel a deal before the supplier has confirmed production/dispatch. Cancellations
        after production begins may be subject to partial deduction for materials and work done,
        as agreed between buyer and supplier.
      </p>

      <h2>4. Dispute Resolution</h2>
      <p>
        If buyer and supplier cannot resolve a dispute directly, either party may raise a formal
        dispute by emailing <strong>{LEGAL_ENTITY.grievanceEmail}</strong> with the deal ID and
        a description of the issue. {LEGAL_ENTITY.platform} will act as a neutral facilitator
        and aim to resolve the dispute within 14 business days. Our decision in disputes is
        advisory; legally binding arbitration may be pursued per the Terms &amp; Conditions.
      </p>

      <h2>5. Refund Processing Time</h2>
      <p>
        Approved refunds are processed to the original payment method within 5–7 business days.
        Bank processing time may add 2–3 additional days depending on your bank.
      </p>

      <h2>6. Exclusions</h2>
      <ul>
        <li>Goods that have been delivered and accepted by the buyer.</li>
        <li>Custom or made-to-order goods once production has commenced.</li>
        <li>Perishable goods after shipment.</li>
        <li>Transactions where fraud or policy abuse is confirmed on the buyer's side.</li>
      </ul>

      <h2>7. Contact for Refunds</h2>
      <p>
        Email <a href={`mailto:${LEGAL_ENTITY.grievanceEmail}`}>{LEGAL_ENTITY.grievanceEmail}</a>{' '}
        with your registered mobile, deal ID, and the refund reason. Response time: within 48 hours.
      </p>

    </LegalPage>
  );
}
