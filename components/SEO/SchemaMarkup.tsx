import { SITE_URL } from '@/lib/site-url';

export default function SchemaMarkup() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VyaparSethu',
    alternateName: 'Bell24h',
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    description: "Protected Trade Infrastructure for Indian MSMEs — Verified Suppliers, Protected Payments, Faster Quotations.",
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Lodha Upper Thane, Bhiwandi',
      addressLocality: 'Bhiwandi',
      addressRegion: 'Maharashtra',
      postalCode: '421302',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9004962871',
      contactType: 'customer service',
      email: 'digitex.studio@gmail.com',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      'https://twitter.com/vyaparsethu',
      'https://linkedin.com/company/vyaparsethu',
      'https://instagram.com/vyaparsethu',
    ],
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VyaparSethu',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/marketplace?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
