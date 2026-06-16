export interface GlossaryTerm {
  slug: string;
  title: string;
  shortDef: string;
  category: string;
  body: string[];
  keywords: string[];
  relatedSlugs: string[];
  faqs: { q: string; a: string }[];
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    slug: 'msme',
    title: 'What is MSME?',
    shortDef: 'Micro, Small and Medium Enterprise — India\'s official classification for businesses below ₹250 crore turnover that unlocks priority credit, govt tenders, and subsidies.',
    category: 'Business Registration',
    body: [
      'MSME stands for Micro, Small and Medium Enterprise. The MSME Development Act 2006 and revised 2020 criteria classify businesses by investment in plant/machinery and annual turnover.',
      'The three tiers: **Micro** (investment ≤ ₹1 cr, turnover ≤ ₹5 cr), **Small** (investment ≤ ₹10 cr, turnover ≤ ₹50 cr), **Medium** (investment ≤ ₹50 cr, turnover ≤ ₹250 cr).',
      'Benefits include: priority lending under PSL norms, lower interest rates via CGTMSE (Credit Guarantee), 25% quota in government procurement, protection against delayed payments under MSME Samadhaan, and subsidies on ISO certification, patents, and quality standards.',
      'To claim MSME status, register on the Udyam Registration Portal (udyamregistration.gov.in). The certificate is free, paperless, and based on self-declaration linked to Aadhaar + PAN. No renewal required.',
      'On VyaparSethu, MSME status is verified during supplier onboarding. Verified MSMEs get a "MSME Verified" badge visible to all buyers, increasing quote acceptance rates by signalling legitimacy.',
    ],
    keywords: ['MSME meaning', 'MSME full form', 'MSME registration India', 'MSME benefits', 'micro small medium enterprise'],
    relatedSlugs: ['udyam-registration', 'gst', 'purchase-order'],
    faqs: [
      { q: 'What is the full form of MSME?', a: 'MSME stands for Micro, Small and Medium Enterprise, as defined under the MSMED Act 2006.' },
      { q: 'What is the turnover limit for MSME?', a: 'Micro: up to ₹5 crore. Small: up to ₹50 crore. Medium: up to ₹250 crore annual turnover.' },
      { q: 'Is GST registration mandatory for MSME?', a: 'Not automatically, but GST is required if turnover exceeds ₹40 lakh (₹20 lakh for services) or if you do inter-state supply.' },
      { q: 'Can a proprietorship be an MSME?', a: 'Yes. Sole proprietorships, partnerships, LLPs, private limited companies, and co-operatives can all register as MSMEs.' },
    ],
  },
  {
    slug: 'hsn-code',
    title: 'What is HSN Code?',
    shortDef: 'Harmonised System of Nomenclature — a 6–8 digit international product classification code used in GST invoices to determine the correct tax rate.',
    category: 'Taxation & Compliance',
    body: [
      'HSN stands for Harmonised System of Nomenclature, developed by the World Customs Organization (WCO). India adopted HSN for GST classification in 2017, extending the 6-digit international code to 8 digits for granular product identification.',
      'Under GST, HSN codes are mandatory on invoices based on turnover: businesses with turnover above ₹5 crore must use 6-digit HSN; ₹1.5–5 crore need 4 digits; below ₹1.5 crore are exempt (but it is best practice to include it).',
      'HSN codes directly determine the GST rate applied to a product. Example: HSN 7208 (flat-rolled steel products) attracts 18% GST; HSN 1001 (wheat) is exempt. Getting the HSN wrong means wrong tax rates, which can trigger GST audit notices.',
      'For B2B buyers posting a Requirement on VyaparSethu, including the HSN code in your requirement lets suppliers quote the exact product grade and GST-inclusive price, eliminating back-and-forth over tax classification.',
      'Use our free HSN Lookup tool at vyaparsethu.com/tools/hsn-lookup to find the correct code for any product using plain-language search.',
    ],
    keywords: ['HSN code meaning', 'HSN code for GST', 'how to find HSN code', 'HSN code list India', 'harmonised system of nomenclature'],
    relatedSlugs: ['gst', 'gst-invoice', 'pro-forma-invoice'],
    faqs: [
      { q: 'What is HSN code in GST?', a: 'HSN (Harmonised System of Nomenclature) is a product classification code used in GST invoices. It tells the tax authority which GST rate applies to the goods being sold.' },
      { q: 'How many digits is HSN code?', a: 'HSN codes in India are 8 digits. Businesses with turnover above ₹5 crore must use 6 digits on invoices; smaller businesses may use 4 digits.' },
      { q: 'Where can I find HSN code for my product?', a: 'Use the CBIC\'s HSN search on GST portal, or VyaparSethu\'s free HSN Lookup tool at vyaparsethu.com/tools/hsn-lookup.' },
      { q: 'What is the penalty for wrong HSN code?', a: 'Incorrect HSN codes can lead to wrong tax computation, GST notices, and penalties under Section 122 of the CGST Act.' },
    ],
  },
  {
    slug: 'gst',
    title: 'What is GST?',
    shortDef: 'Goods and Services Tax — India\'s unified indirect tax that replaced excise duty, VAT, and service tax in July 2017. Applies to all B2B transactions above ₹40 lakh turnover.',
    category: 'Taxation & Compliance',
    body: [
      'GST (Goods and Services Tax) is a destination-based, multi-stage tax levied on the supply of goods and services in India. It replaced over 17 indirect taxes (excise, VAT, CST, service tax, etc.) with a single, unified structure.',
      'GST has four main slabs: 0%, 5%, 12%, 18%, and 28%. Special rates apply to gold (3%) and rough diamonds (0.25%). B2B industrial goods mostly attract 12% or 18%.',
      'B2B transactions use Input Tax Credit (ITC): if you pay GST on a purchase, you can offset it against your GST liability on sales. This makes GST neutral for registered businesses in the supply chain, as only the final consumer bears the tax.',
      'GSTIN (GST Identification Number) is a 15-digit code. The first 2 digits are the state code, next 10 are PAN, followed by a sequential entity code. Always verify a supplier\'s GSTIN before making payment — use gstin.in or the GST portal.',
      'On VyaparSethu, suppliers\' GSTINs are verified during onboarding. All Quotations display GST-inclusive and exclusive breakdowns, so buyers can claim ITC accurately.',
    ],
    keywords: ['GST meaning', 'GST full form', 'GST in India', 'goods and services tax', 'GST rate B2B', 'GSTIN verification'],
    relatedSlugs: ['gst-invoice', 'hsn-code', 'msme'],
    faqs: [
      { q: 'What is GST in simple terms?', a: 'GST is India\'s single indirect tax on goods and services. It replaced old taxes like VAT and excise. Businesses collect GST from buyers and pay it to the government, but they get credit for GST they paid on their own purchases.' },
      { q: 'What is the GST rate for industrial goods?', a: 'Most industrial goods attract 18% GST. Specific categories vary — check the HSN code for the exact rate.' },
      { q: 'Is GST mandatory for small businesses?', a: 'GST registration is mandatory if annual turnover exceeds ₹40 lakh (₹20 lakh for services, ₹10 lakh in North-East states), or if you do inter-state supply.' },
      { q: 'What is Input Tax Credit in GST?', a: 'ITC allows a registered business to deduct the GST paid on purchases from the GST it collects on sales, so you only pay tax on the value you add.' },
    ],
  },
  {
    slug: 'rfq',
    title: 'What is RFQ (Request for Quotation)?',
    shortDef: 'A Request for Quotation is a formal document a buyer sends to suppliers asking for price, lead time, and terms — the first step in any B2B procurement. On VyaparSethu it\'s called a "Requirement".',
    category: 'Procurement',
    body: [
      'RFQ stands for Request for Quotation. It is a formal procurement document where a buyer specifies what they need — product, grade, quantity, delivery location, timeline, and packaging — and invites suppliers to respond with a Quotation (price + terms).',
      'A good RFQ includes: product name with specification/grade, quantity and unit (MT, pcs, kg), delivery location, required delivery date, payment terms preferred, quality certifications required (IS, BIS, ISO), and whether samples are needed.',
      'On VyaparSethu, buyers can post a Requirement via three modes: Text (type it), Speak (voice recording transcribed by AI in 90 seconds), or Video (upload a 60-second clip). All three create the same structured Requirement that verified suppliers can quote on.',
      'Suppliers on VyaparSethu receive matched Requirements in their category and respond with detailed Quotations within 24 hours. The buyer can compare all quotes, ask follow-up questions, and select the best offer — all within the platform.',
      'The Quotation → Deal → Protected Payment flow ensures that once a Quotation is accepted, the payment is held in escrow and released only on confirmed delivery, eliminating the risk of advance payment fraud common in Indian B2B trade.',
    ],
    keywords: ['RFQ meaning', 'request for quotation', 'how to write RFQ', 'RFQ vs PO', 'B2B procurement India', 'post requirement online'],
    relatedSlugs: ['purchase-order', 'pro-forma-invoice', 'escrow'],
    faqs: [
      { q: 'What is the difference between RFQ and PO?', a: 'An RFQ (Requirement) is sent to multiple suppliers asking for prices. A Purchase Order is issued to one supplier after you\'ve selected their quote — it\'s a binding contract to buy.' },
      { q: 'What should be included in an RFQ?', a: 'Product name, specification/grade, quantity, unit, delivery location, required delivery date, payment terms, quality standards, and whether samples are needed.' },
      { q: 'How long does it take to get quotes after posting an RFQ?', a: 'On VyaparSethu, verified suppliers respond within 24 hours. Most buyers receive 3+ quotes within 6–8 hours for common industrial categories.' },
      { q: 'Is posting a Requirement free?', a: 'Yes, posting a Requirement on VyaparSethu is free for all buyers. You only pay a small commission when a deal is completed.' },
    ],
  },
  {
    slug: 'udyam-registration',
    title: 'What is Udyam Registration?',
    shortDef: 'The official free digital certificate that classifies a business as Micro, Small, or Medium (MSME). Replaced the old Udyog Aadhaar system in July 2020.',
    category: 'Business Registration',
    body: [
      'Udyam Registration is the official government process to register a business as an MSME under the Ministry of MSME. It replaced the Udyog Aadhaar Memorandum (UAM) system from 1 July 2020.',
      'Registration is done on udyamregistration.gov.in. It is free, paperless, and based on self-declaration. You need only your Aadhaar number and PAN — no documents need to be uploaded. The system auto-verifies income tax and GST data.',
      'The Udyam Registration Certificate contains a unique Udyam Registration Number (URN) in the format UDYAM-MH-00-0000000. This number is used across all government schemes, bank applications, and tender bids.',
      'Key benefits: protection under MSMED Act (buyers must pay MSMEs within 45 days or pay compound interest at 3× RBI lending rate), eligibility for CGTMSE collateral-free loans up to ₹5 crore, and mandatory 25% govt procurement quota.',
      'VyaparSethu verifies Udyam Registration Numbers during supplier onboarding. Suppliers with verified Udyam certificates are tagged "MSME Verified" — buyers often shortlist them first for government-linked procurement.',
    ],
    keywords: ['Udyam registration', 'Udyam certificate download', 'MSME registration online', 'Udyog Aadhaar vs Udyam', 'Udyam registration number'],
    relatedSlugs: ['msme', 'gst', 'purchase-order'],
    faqs: [
      { q: 'Is Udyam registration free?', a: 'Yes, Udyam Registration is completely free on udyamregistration.gov.in. There are no government fees. Beware of third-party sites that charge for this free service.' },
      { q: 'Is Udyam registration mandatory?', a: 'It is not legally mandatory to run a business, but it is required to avail MSME-specific benefits like priority bank loans, government tender quotas, and MSMED payment protections.' },
      { q: 'What is the validity of Udyam registration?', a: 'Udyam Registration has no expiry. It is valid as long as the business exists and its turnover/investment remains within MSME limits.' },
      { q: 'Can I convert my old Udyog Aadhaar to Udyam?', a: 'Yes. Businesses registered under Udyog Aadhaar must migrate to Udyam Registration. Old UAM certificates are invalid for new MSME schemes after 31 March 2021.' },
    ],
  },
  {
    slug: 'purchase-order',
    title: 'What is a Purchase Order (PO)?',
    shortDef: 'A Purchase Order is a legally binding commercial document a buyer issues to a supplier confirming the agreed product, quantity, price, delivery date, and payment terms.',
    category: 'Procurement',
    body: [
      'A Purchase Order (PO) is a formal document issued by a buyer to a supplier, authorising a specific purchase. Once the supplier accepts it, the PO becomes a legally enforceable contract between both parties.',
      'A standard PO includes: PO number and date, buyer\'s name, address, and GSTIN, supplier\'s name, address, and GSTIN, line items (product, HSN code, quantity, unit, unit price), GST rate and amount, total value, delivery address, delivery date, and payment terms (Net 30, advance + balance, etc.).',
      'POs protect both sides: the buyer cannot claim a different price than what\'s on the PO; the supplier has a documented, enforceable order and can use the PO to raise a bank invoice discounting facility (a form of working capital finance).',
      'In Indian B2B trade, disputes over verbal orders are extremely common. A proper PO eliminates ambiguity. Under the MSMED Act, if an MSME supplier holds an accepted PO but the buyer delays payment beyond 45 days, the buyer owes compound interest at 3× RBI base rate.',
      'On VyaparSethu, when a buyer accepts a supplier\'s Quotation, the system auto-generates a structured Deal record that functions as a PO. Payment is then collected and held in Protected Payment (escrow) until delivery is confirmed.',
    ],
    keywords: ['purchase order meaning', 'PO in business', 'purchase order format India', 'PO vs invoice', 'how to write purchase order'],
    relatedSlugs: ['rfq', 'pro-forma-invoice', 'gst-invoice', 'escrow'],
    faqs: [
      { q: 'What is the difference between PO and invoice?', a: 'A PO is issued by the buyer before goods are dispatched — it authorises the purchase. An invoice is issued by the supplier after delivery — it requests payment.' },
      { q: 'Is a purchase order legally binding?', a: 'Yes, once the supplier accepts a PO (in writing or by acting on it — e.g., starting production), it becomes a binding contract.' },
      { q: 'Does a purchase order need to be on letterhead?', a: 'No legal requirement in India, but it should clearly identify both parties, the PO number, and the terms. A digital PO with e-signature is equally valid.' },
      { q: 'What is a blanket purchase order?', a: 'A blanket PO covers multiple deliveries over a period (e.g., 100 MT of steel to be delivered in 10 monthly lots). Useful for regular suppliers with ongoing supply contracts.' },
    ],
  },
  {
    slug: 'pro-forma-invoice',
    title: 'What is a Pro Forma Invoice?',
    shortDef: 'A preliminary invoice sent before goods are dispatched. It confirms price, quantity, and terms — used to get buyer approval and arrange advance payment or LC.',
    category: 'Procurement',
    body: [
      'A Pro Forma Invoice (PI) is a draft invoice sent by a supplier to a buyer before the actual sale. It is not a demand for payment — it\'s a commitment of what the supplier will supply, at what price, and on what terms.',
      'Pro forma invoices are commonly used when: the buyer needs an advance payment invoice to get internal approval or release payment from finance; the goods are being imported (customs uses it for valuation); or the buyer is arranging a Letter of Credit (LC).',
      'A pro forma invoice looks like a real invoice but is clearly marked "Pro Forma Invoice" or "Not a Tax Invoice." It does not need to comply with GST invoice format rules — it has no tax number, and GST is not yet charged.',
      'Once the buyer approves the pro forma and sends the advance payment (or opens an LC), the supplier ships the goods and issues the actual Tax Invoice (GST Invoice), which is the legal document for payment and ITC.',
      'On VyaparSethu, when a supplier submits a Quotation, it functions as a pro forma — the buyer can review, negotiate, and accept. On acceptance, the platform auto-generates a final invoice for the Protected Payment step.',
    ],
    keywords: ['pro forma invoice meaning', 'proforma invoice India', 'pro forma vs tax invoice', 'what is PI in business', 'pro forma invoice GST'],
    relatedSlugs: ['gst-invoice', 'purchase-order', 'rfq'],
    faqs: [
      { q: 'Is a pro forma invoice a legal document?', a: 'Not in the tax sense — it cannot be used to claim GST ITC. But it is contractually binding as a price and specification commitment from the supplier.' },
      { q: 'Does a pro forma invoice need GST?', a: 'No. GST is not charged on a pro forma invoice. It is only a pre-sale commitment. GST is charged on the final tax invoice after delivery.' },
      { q: 'When do I use a pro forma invoice vs purchase order?', a: 'Buyers issue POs to suppliers. Suppliers issue pro forma invoices to buyers. Both serve to document agreed terms before shipment — they complement each other.' },
      { q: 'Can a pro forma invoice be cancelled?', a: 'Yes. Since no tax has been charged and no legal payment obligation exists yet, either party can cancel or revise a pro forma by mutual agreement.' },
    ],
  },
  {
    slug: 'gst-invoice',
    title: 'What is a GST Invoice (Tax Invoice)?',
    shortDef: 'A tax invoice is the mandatory legal document issued by a GST-registered supplier at the time of supply. It enables the buyer to claim Input Tax Credit (ITC).',
    category: 'Taxation & Compliance',
    body: [
      'A GST Invoice (formally called a Tax Invoice) is issued by a GST-registered supplier when goods are sold or services are rendered. It is the primary document required for a B2B buyer to claim Input Tax Credit (ITC) on their GST return.',
      'Mandatory fields on a GST Tax Invoice: invoice number (consecutive, no gaps), invoice date, supplier\'s name, address, and GSTIN, buyer\'s name, address, and GSTIN (for B2B), HSN code for each item, quantity, unit, taxable value, GST rate, CGST/SGST or IGST amount, total value, and place of supply.',
      'For intra-state B2B supply, the invoice shows CGST (Central GST) and SGST (State GST) split equally. For inter-state supply, it shows IGST (Integrated GST) instead. The total tax burden is the same — only the split changes.',
      'Timing rules: for goods, a tax invoice must be issued at or before delivery. For services, within 30 days of supply. Missing these deadlines can result in GST notices and disallow the buyer\'s ITC claim.',
      'On VyaparSethu, all completed Deals auto-generate a GST-compliant invoice with the correct HSN code, CGST/SGST breakdown, and both parties\' GSTINs — reducing errors and ensuring buyer ITC eligibility.',
    ],
    keywords: ['GST invoice format', 'tax invoice India', 'GST tax invoice mandatory fields', 'ITC invoice requirements', 'CGST SGST invoice'],
    relatedSlugs: ['gst', 'hsn-code', 'pro-forma-invoice', 'purchase-order'],
    faqs: [
      { q: 'What is the difference between a GST invoice and a regular invoice?', a: 'A GST invoice (Tax Invoice) includes mandatory GST fields: GSTIN, HSN code, GST rate breakdown, and place of supply. A regular invoice lacks these and cannot be used to claim ITC.' },
      { q: 'Can I claim ITC on a GST invoice from an unregistered supplier?', a: 'No. ITC can only be claimed on invoices from GST-registered suppliers. Always verify the supplier\'s GSTIN on the GST portal before payment.' },
      { q: 'What is the time limit to issue a GST invoice for goods?', a: 'At or before delivery of goods. For movement of goods, an invoice must be raised before or at the time of removal from the supplier\'s premises.' },
      { q: 'Can a GST invoice be revised or cancelled?', a: 'A tax invoice cannot be deleted. To correct it, issue a credit note (if reducing value) or a debit note (if increasing value). Both must be reported in GSTR-1.' },
    ],
  },
  {
    slug: 'escrow',
    title: 'What is Escrow Payment (Protected Payment)?',
    shortDef: 'An escrow holds the buyer\'s payment with a neutral third party until the supplier delivers as agreed — eliminating advance payment fraud in B2B trade. VyaparSethu calls this "Protected Payment".',
    category: 'Payments & Finance',
    body: [
      'Escrow is a financial arrangement where the buyer\'s payment is held by a neutral third party (escrow agent) until both parties fulfil their contractual obligations. In B2B trade, the escrow is released to the supplier only after the buyer confirms delivery and quality.',
      'Advance payment fraud is one of the biggest risks in Indian B2B sourcing. A buyer pays 50–100% advance; the supplier disappears, delays, or delivers inferior goods. Escrow eliminates this risk — suppliers can only receive money after delivering.',
      'In VyaparSethu\'s Protected Payment system (powered by Razorpay + nodal account), funds flow: Buyer pays → funds held in nodal account → supplier ships + uploads delivery proof → buyer confirms receipt → funds released to supplier. Disputes are handled by VyaparSethu\'s resolution team.',
      'Escrow also benefits suppliers: a buyer who has already deposited into escrow is a committed buyer. It eliminates "ghost orders" where a buyer gets a quote, places an order verbally, then disappears — because the payment is already locked in.',
      'RBI regulations require escrow/payment aggregator services to use a nodal bank account (not held by the platform). VyaparSethu uses Razorpay\'s regulated payment infrastructure, ensuring funds are legally held and FEMA-compliant.',
    ],
    keywords: ['escrow meaning India', 'escrow payment B2B', 'advance payment protection', 'protected payment trade', 'B2B escrow service India'],
    relatedSlugs: ['purchase-order', 'rfq', 'trade-credit'],
    faqs: [
      { q: 'What is escrow in simple terms?', a: 'Escrow means a neutral party holds the buyer\'s money until the supplier delivers. The supplier can\'t take the money without delivering; the buyer can\'t take it back once committed to a deal.' },
      { q: 'Is escrow safe for B2B transactions in India?', a: 'Yes, when provided by an RBI-regulated payment aggregator using a nodal bank account. VyaparSethu uses Razorpay\'s regulated infrastructure for all Protected Payments.' },
      { q: 'What happens if there is a dispute in escrow?', a: 'VyaparSethu\'s resolution team reviews delivery proof, quality photos, and communication. Funds are released to the correct party based on the evidence. Unresolved disputes escalate to legal arbitration.' },
      { q: 'How much does Protected Payment cost?', a: 'VyaparSethu charges a small platform commission (typically 1–2%) on completed deals. There is no additional escrow fee beyond this commission.' },
    ],
  },
  {
    slug: 'trade-credit',
    title: 'What is Trade Credit?',
    shortDef: 'An arrangement where a supplier allows the buyer to pay 30–90 days after receiving goods — the most common form of short-term business financing in India.',
    category: 'Payments & Finance',
    body: [
      'Trade credit is the arrangement where a supplier delivers goods to a buyer but allows payment to be made after a defined period — typically 30, 45, 60, or 90 days. It\'s written as "Net 30", "Net 60", etc. on invoices. Trade credit is effectively free short-term financing for buyers.',
      'For suppliers, trade credit is a risk: the buyer may delay or default. Indian B2B trade has a chronic delayed-payment problem — average payment cycle for Indian MSMEs is 90+ days vs a 30-day global benchmark. The MSMED Act mandates a 45-day maximum for MSME suppliers.',
      'Suppliers mitigate trade credit risk through: credit insurance (e.g., ECGC, Euler Hermes), invoice discounting/factoring (sell the receivable to a financier at a small discount for immediate cash), post-dated cheques (PDC), and security cheques.',
      'Buyers should not treat trade credit as a right — especially with MSME suppliers. Habitual late payment damages supplier relationships, limits future supply capacity, and can trigger MSME Samadhaan complaints (which affect company credit score on MCA21).',
      'VyaparSethu recommends using Protected Payment for first-time supplier relationships. Once a relationship has 3+ successful deals, buyer and supplier can agree on direct payment terms (Net 30/60) and bypass escrow for those transactions.',
    ],
    keywords: ['trade credit meaning', 'trade credit India', 'Net 30 payment terms', 'buyer credit supplier', 'delayed payment MSME'],
    relatedSlugs: ['escrow', 'purchase-order', 'msme'],
    faqs: [
      { q: 'What is trade credit in simple terms?', a: 'Trade credit means a supplier lets you buy goods now and pay later — usually in 30 to 90 days. It\'s free short-term financing that helps businesses manage cash flow.' },
      { q: 'What is the difference between trade credit and bank credit?', a: 'Trade credit comes directly from your supplier, is usually interest-free (if paid on time), and has no formal application process. Bank credit is a loan from a financial institution with interest and formal documentation.' },
      { q: 'What happens if I don\'t pay my MSME supplier within 45 days?', a: 'Under the MSMED Act, if a registered MSME supplier is not paid within 45 days of acceptance, the buyer must pay compound interest at 3 times the RBI base rate. Repeated defaults can be reported to MSME Samadhaan.' },
      { q: 'Is trade credit common in Indian B2B?', a: 'Extremely common. Most established B2B relationships in India run on 60–90 day credit terms, especially in manufacturing and distribution sectors.' },
    ],
  },
  {
    slug: 'b2b-marketplace',
    title: 'What is a B2B Marketplace?',
    shortDef: 'An online platform where businesses buy from and sell to other businesses — with verified suppliers, structured quotations, and business-grade payment terms. Different from B2C (consumer) marketplaces.',
    category: 'Trade',
    body: [
      'A B2B (Business-to-Business) marketplace is an online platform that connects buyers and suppliers for commercial transactions. Unlike B2C platforms (Amazon, Flipkart), B2B marketplaces are designed for bulk orders, custom specifications, credit terms, and formal procurement processes.',
      'Core differences from B2C: prices are negotiated (not fixed), MOQs (minimum order quantities) apply, products need custom specifications, payment terms are Net 30/60/90, and relationships are long-term. A buyer places requirements; multiple suppliers compete with quotes.',
      'In India, IndiaMART is the largest B2B directory (not a true marketplace — it connects buyers and suppliers but does not handle quotes, payments, or fulfilment). VyaparSethu is a "closed marketplace" — transactions are verified, payments are protected, and suppliers are screened.',
      'The risk in open B2B directories (without verification) is high: fake suppliers, inflated prices, no accountability for delivery. VyaparSethu\'s model requires GSTIN + Udyam verification before a supplier can quote, and uses Protected Payment so buyers never lose money to undelivered orders.',
      'Key metrics to evaluate a B2B platform: supplier verification depth, average quotes per requirement, payment protection, dispute resolution track record, and category depth in your specific industry.',
    ],
    keywords: ['B2B marketplace India', 'B2B vs B2C', 'online B2B platform India', 'IndiaMART alternative', 'B2B sourcing platform'],
    relatedSlugs: ['rfq', 'escrow', 'purchase-order'],
    faqs: [
      { q: 'What is B2B vs B2C marketplace?', a: 'B2B (business-to-business) is where companies buy from companies — in bulk, with custom specs and payment terms. B2C (business-to-consumer) is where businesses sell to individual consumers, like Amazon.' },
      { q: 'What is the largest B2B marketplace in India?', a: 'IndiaMART is the largest B2B directory in India by registered users. VyaparSethu is a verified B2B marketplace focused on protected transactions and MSME supplier onboarding in industrial clusters.' },
      { q: 'Is it safe to buy from a B2B marketplace?', a: 'It depends on the platform. Platforms with verified suppliers and payment protection (escrow) are significantly safer than open directories where anyone can list without verification.' },
      { q: 'What types of products are traded on B2B marketplaces?', a: 'Industrial raw materials, packaging, machinery, chemicals, textiles, construction materials, agricultural commodities, and MRO (maintenance, repair, operations) supplies are the most common B2B categories.' },
    ],
  },
  {
    slug: 'letter-of-credit',
    title: 'What is a Letter of Credit (LC)?',
    shortDef: 'A bank-issued guarantee that a buyer\'s payment will be made to the seller on time and for the correct amount — the gold standard for international and large domestic B2B transactions.',
    category: 'Payments & Finance',
    body: [
      'A Letter of Credit (LC) is a document issued by a bank guaranteeing that a seller (supplier) will receive payment, provided they submit the correct shipping documents (bill of lading, packing list, certificate of origin, etc.) within the specified time.',
      'LCs are the primary payment instrument for international trade. In India, they are also used for large domestic industrial transactions (e.g., steel mills selling coils to pipe manufacturers), typically above ₹50 lakh.',
      'Types of LC: Sight LC (payment on document presentation), Usance LC (payment after 30/60/90 days — a deferred LC that acts like trade credit), Revolving LC (for repeat orders), Back-to-Back LC (supplier finances from buyer\'s LC), and Standby LC (a guarantee rather than a payment mechanism).',
      'The LC process: Buyer applies to their bank (issuing bank) → bank sends LC to supplier\'s bank (advising/confirming bank) → supplier ships goods → supplier submits documents to their bank → documents verified → payment released. Discrepancies in documents can delay payment.',
      'For domestic B2B on VyaparSethu, Protected Payment (escrow) serves the same purpose as an LC for smaller transactions — it guarantees the supplier gets paid on delivery without needing a bank intermediary.',
    ],
    keywords: ['letter of credit meaning', 'LC in business India', 'LC payment terms', 'sight LC usance LC', 'LC for domestic trade India'],
    relatedSlugs: ['escrow', 'pro-forma-invoice', 'trade-credit'],
    faqs: [
      { q: 'What is an LC in simple terms?', a: 'An LC is a bank\'s promise to pay the seller on the buyer\'s behalf, as long as the seller delivers the correct goods and submits the right documents. The bank, not the buyer, guarantees payment.' },
      { q: 'What is the difference between LC and escrow?', a: 'Both protect both parties. An LC is bank-issued and mainly used for international trade or large transactions. Escrow is platform-managed and faster for domestic SME transactions.' },
      { q: 'What is the cost of an LC?', a: 'Banks charge LC issuance fees of 0.25–1% per quarter on the LC value, plus amendment, negotiation, and discrepancy charges. Total cost for a 90-day LC is typically 1–2% of transaction value.' },
      { q: 'Is LC mandatory for imports?', a: 'Not mandatory, but most international sellers require an LC or advance payment from new buyers. Established importers may negotiate open account or documents against acceptance (DA) terms.' },
    ],
  },
];

export function getTermBySlug(slug: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find(t => t.slug === slug);
}

export function getRelatedTerms(slugs: string[]): GlossaryTerm[] {
  return slugs.map(s => GLOSSARY_TERMS.find(t => t.slug === s)).filter(Boolean) as GlossaryTerm[];
}

export const GLOSSARY_CATEGORIES = [
  'Business Registration',
  'Taxation & Compliance',
  'Procurement',
  'Payments & Finance',
  'Trade',
];
