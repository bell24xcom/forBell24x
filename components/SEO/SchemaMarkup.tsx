import { SITE_URL } from '@/lib/site-url';

export default function SchemaMarkup() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bell24h',
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.jpg`,
    description: "India's AI-powered B2B procurement marketplace. Post RFQs via voice, video, or text. 450+ categories.",
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Thane',
      addressLocality: 'Thane',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9004962871',
      contactType: 'customer service',
      email: 'bell24h.helpline@gmail.com',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [SITE_URL],
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bell24h',
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
