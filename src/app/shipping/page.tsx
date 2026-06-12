import { Metadata } from 'next';
import LegalPage from '@/src/components/legal/LegalPage';
import { LEGAL_ENTITY, POLICY_LAST_UPDATED } from '../config/legal';

export const metadata: Metadata = {
  title: `Shipping & Delivery Policy | ${LEGAL_ENTITY.platform}`,
};

export default function ShippingPolicyPage() {
  return (
    <LegalPage title="Shipping & Delivery Policy" lastUpdated={POLICY_LAST_UPDATED}>

      <p>
        {LEGAL_ENTITY.platform} is a <strong>digital B2B trade network</strong>. We do not
        manufacture, stock, or ship any physical goods. All logistics and delivery arrangements
        are made directly between the buyer and the supplier after a deal is confirmed on the platform.
      </p>

      <h2>1. Platform Role</h2>
      <p>
        Our role is limited to facilitating the discovery, quotation, and payment stages of a trade.
        Once a deal is confirmed and payment is secured via Protected Payment, the supplier is
        responsible for dispatching goods per the terms agreed in the accepted quote.
      </p>

      <h2>2. Delivery Terms</h2>
      <p>
        Delivery timelines, logistics arrangements, freight costs, and incoterms (e.g., ex-works,
        CIF, door delivery) are agreed between the buyer and supplier as part of the quotation.
        These terms are captured in the supplier's quote before acceptance.
      </p>

      <h2>3. Delivery Confirmation</h2>
      <p>
        Funds held in Protected Payment are released to the supplier once the buyer confirms
        receipt of goods in satisfactory condition on the platform. If a buyer does not confirm
        within the agreed timeline, the deal team may intervene per the dispute resolution process.
      </p>

      <h2>4. Digital Deliverables</h2>
      <p>
        For requirements fulfilled digitally (e.g., software, design, reports), delivery is
        confirmed when the buyer acknowledges receipt of the digital output.
      </p>

      <h2>5. Delivery Disputes</h2>
      <p>
        If goods are not delivered within the agreed timeline or are delivered in unsatisfactory
        condition, buyers may raise a dispute via our{' '}
        <a href="/refund-policy">Refund &amp; Cancellation Policy</a> process. Contact:{' '}
        <a href={`mailto:${LEGAL_ENTITY.grievanceEmail}`}>{LEGAL_ENTITY.grievanceEmail}</a>.
      </p>

      <h2>6. International Trade</h2>
      <p>
        {LEGAL_ENTITY.platform} currently facilitates primarily domestic Indian trade. For
        international transactions, buyers and suppliers are responsible for compliance with
        customs, import/export regulations, and applicable duties. We do not act as a customs
        agent or importer of record.
      </p>

    </LegalPage>
  );
}
