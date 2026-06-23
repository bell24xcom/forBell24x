import { Metadata } from 'next';
import PrintButton from './PrintButton';

export const metadata: Metadata = {
  title: 'B2B Trade Glossary India 2026 — VyaparSethu',
  description: 'Printable B2B glossary of 15 essential trade terms for Indian SMEs — RFQ, MOQ, GST, HSN Code, Udyam, FOB, ITC, and more.',
  robots: { index: false, follow: false },
};

const terms = [
  {
    term: 'RFQ — Request for Quotation',
    definition: 'A Request for Quotation is a formal document sent by a buyer to multiple suppliers asking for price, delivery timeline, and payment terms before placing an order. A well-written RFQ includes the product name, specification, quantity, unit, delivery location, and required date. Suppliers respond with a Quotation. On VyaparSethu, an RFQ is called a "Requirement" and can be posted by voice, video, or text.',
  },
  {
    term: 'MOQ — Minimum Order Quantity',
    definition: 'The smallest quantity a supplier will accept in a single purchase order. MOQ exists because suppliers have fixed setup costs — a minimum run makes the order economical. MOQ varies widely by product: a packaging supplier may have MOQ of 500 boxes; a chemical supplier may have MOQ of 50 kg. Always confirm MOQ before shortlisting a supplier, especially for custom-manufactured products.',
  },
  {
    term: 'GST — Goods and Services Tax',
    definition: "India's unified indirect tax system introduced in July 2017, replacing VAT, excise duty, and service tax. B2B transactions between GST-registered businesses allow Input Tax Credit (ITC) — the tax paid on purchases can offset the tax collected on sales. Every B2B invoice must carry both parties' GSTIN, the HSN code, and the CGST + SGST (intra-state) or IGST (inter-state) split.",
  },
  {
    term: 'HSN Code — Harmonised System of Nomenclature',
    definition: "A 6–8 digit product classification code used on all GST invoices to determine the applicable tax rate. Getting the HSN code wrong means the wrong GST rate is applied, which can result in ITC rejection and audit notices. Businesses with turnover above ₹5 crore must use 6-digit HSN codes. Use VyaparSethu's free HSN Code Lookup tool to find the correct code for any product.",
  },
  {
    term: 'Udyam Registration',
    definition: "India's official MSME registration system, replacing Udyog Aadhaar from July 2020. Registration is free and paperless on udyamregistration.gov.in using Aadhaar and PAN. Registered businesses receive a Udyam Registration Number (URN) confirming their MSME status (Micro, Small, or Medium). Udyam-registered suppliers get priority in government procurement and protection under the MSMED Act's 45-day payment rule.",
  },
  {
    term: 'Purchase Order (PO)',
    definition: 'A legally binding commercial document issued by a buyer to a supplier confirming the agreed product, quantity, price, delivery date, and payment terms. Once the supplier acknowledges the PO, it becomes a contract. Always issue a written PO before the supplier begins production or ships goods — it protects both parties from disputes about price, specification, and delivery date.',
  },
  {
    term: 'Credit Period / Net 30',
    definition: '"Net 30" means payment is due within 30 days of the invoice or delivery date. Common credit periods in Indian B2B: Net 15, Net 30, Net 45, Net 60, Net 90. For MSME suppliers, the MSMED Act caps credit at 45 days — buyers who exceed this owe compound interest at 3× the RBI base rate.',
  },
  {
    term: 'Lead Time',
    definition: "The total time from order placement to delivery at the buyer's location, including manufacturing, quality checks, packaging, and shipping. For standard stock items: 1–5 days. For custom manufactured products: 2–8 weeks. For imported goods: 4–12 weeks. Always confirm lead time in the Purchase Order, especially for project-linked procurement with fixed deadlines.",
  },
  {
    term: 'FOB — Free on Board',
    definition: "An international trade term (Incoterm) specifying that the supplier's responsibility ends when goods are loaded onto the vessel at the specified origin port. From that point, the buyer bears the risk and cost of freight, insurance, and onward delivery. FOB is the standard baseline for international B2B trade.",
  },
  {
    term: 'EXW — Ex-Works',
    definition: "An Incoterm meaning the supplier makes goods available at their premises (factory or warehouse) and the buyer arranges all transport from that point — loading, freight, insurance, customs, and delivery. EXW is the most seller-friendly term: minimum obligation for the supplier. For domestic Indian B2B trade, this is the most common delivery term.",
  },
  {
    term: 'MSME — Micro, Small and Medium Enterprise',
    definition: "India's classification for businesses below prescribed investment and turnover limits: Micro (turnover ≤ ₹5 crore), Small (≤ ₹50 crore), Medium (≤ ₹250 crore). MSME status unlocks collateral-free bank lending under government schemes, 25% reservation in government tenders, and legal payment protection. Register free on udyamregistration.gov.in.",
  },
  {
    term: 'OEM — Original Equipment Manufacturer',
    definition: "A company that manufactures products or components sold under another brand's name. In B2B trade, \"OEM manufacturing\" means the buyer provides the design, specifications, and branding; the manufacturer produces to those exact requirements. OEM capability is a key supplier attribute for buyers who want private-label products.",
  },
  {
    term: 'Bill of Lading (B/L)',
    definition: 'A legal document issued by a carrier acknowledging receipt of goods for shipment. It serves three functions: receipt of goods, contract of carriage, and document of title. In international trade, the B/L is essential for customs clearance, insurance claims, and payment under Letters of Credit.',
  },
  {
    term: 'Input Tax Credit (ITC)',
    definition: 'The mechanism under GST that allows a registered buyer to claim a credit for the GST paid on purchases against the GST collected on sales. For example: if you pay ₹18,000 GST on raw materials and collect ₹25,000 GST on your products, you only remit ₹7,000 to the government. Valid only on GST-compliant invoices with correct GSTIN and HSN code.',
  },
  {
    term: 'Protected Payment',
    definition: "VyaparSethu's payment mechanism where buyer funds are held in a Razorpay-regulated RBI-approved nodal account after a deal is confirmed. Funds are released to the supplier only after the buyer confirms receipt and satisfaction with the goods. This eliminates advance payment fraud — the most common financial risk in first-time B2B supplier relationships in India.",
  },
];

export default function B2BGlossaryPrintPage() {
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: '#1a1a2e', background: '#ffffff', padding: '40px', maxWidth: '800px', margin: '0 auto', fontSize: '13px', lineHeight: '1.6' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body { margin: 0; }
            .print-hide { display: none !important; }
            .term-block { page-break-inside: avoid; }
          }
          @page { margin: 20mm; }
        `
      }} />

      <PrintButton />

      <div style={{ textAlign: 'center', marginBottom: '48px', paddingBottom: '32px', borderBottom: '3px solid #D4AF37' }}>
        <div style={{ fontSize: '28px', fontWeight: 800, color: '#0B1F45', letterSpacing: '-0.5px' }}>
          Vyapar<span style={{ color: '#D4AF37' }}>Sethu</span>
        </div>
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#0B1F45', marginTop: '8px' }}>
          B2B Trade Glossary India 2026
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          15 Essential Terms for Indian SMEs · Free Resource
        </div>
        <p style={{ fontSize: '12px', color: '#444', marginTop: '12px', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
          A plain-language reference for procurement managers, MSME buyers, and suppliers navigating India&apos;s B2B trade ecosystem.
        </p>
      </div>

      {terms.map((item, i) => (
        <div key={item.term}>
          <div className="term-block" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '4px', height: '20px', background: '#D4AF37', borderRadius: '2px', flexShrink: 0 }} />
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0B1F45', margin: 0 }}>{item.term}</h2>
            </div>
            <p style={{ color: '#333', fontSize: '12.5px', lineHeight: '1.65', paddingLeft: '14px', margin: 0 }}>
              {item.definition}
            </p>
          </div>
          {i < terms.length - 1 && <div style={{ height: '1px', background: '#eee', margin: '20px 0' }} />}
        </div>
      ))}

      <div style={{ marginTop: '48px', paddingTop: '16px', borderTop: '2px solid #D4AF37', fontSize: '11px', color: '#888', textAlign: 'center' }}>
        © 2026 VyaparSethu | vyaparsethu.com | Verified B2B Marketplace for Indian MSMEs<br />
        Operated by Digitex Studio · Bhiwandi, Maharashtra 421302 · GSTIN: 27AAAPP9753F2ZF
      </div>
    </div>
  );
}
