import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GST Invoice Value Calculator & Tax Invoice Breakdown | VyaparSethu',
  description:
    'Calculate CGST, SGST, IGST, taxable amount, and total invoice value for B2B tax invoices under GST in India. Free online calculator for MSMEs and buyers.',
  keywords: [
    'tax invoice under gst',
    'gst invoice',
    'what is invoice value in gst',
    'gst calculator india',
    'taxable amount calculator',
    'b2b tax invoice format',
  ],
  alternates: {
    canonical: 'https://www.vyaparsethu.com/tools/gst-calculator',
  },
  openGraph: {
    title: 'B2B GST Calculator — India | VyaparSethu',
    description:
      'Calculate CGST, SGST, IGST and total invoice value for any B2B tax invoice. Instant breakdown for Indian MSMEs.',
    url: 'https://www.vyaparsethu.com/tools/gst-calculator',
    type: 'website',
  },
};

export default function GSTCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is invoice value in GST?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Invoice value in GST represents the total monetary amount charged on a tax invoice, including the base taxable value plus the applicable CGST, SGST, or IGST amounts.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the mandatory fields on a tax invoice under GST?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A valid GST tax invoice must include the Supplier GSTIN, Buyer GSTIN, consecutive invoice number, invoice date, HSN/SAC code, taxable value, GST rate breakdown (CGST/SGST or IGST), and place of supply.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is GST calculated on a tax invoice?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For intra-state sales, GST is split equally between CGST and SGST (e.g., 9% + 9% for an 18% slab). For inter-state sales, the full rate is charged as IGST (18%).',
        },
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.vyaparsethu.com' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.vyaparsethu.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'GST Calculator', item: 'https://www.vyaparsethu.com/tools/gst-calculator' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
