export default function SchemaMarkup() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bell24h',
    url: 'https://www.bell24h.com',
    logo: 'https://www.bell24h.com/og-image.jpg',
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
    sameAs: ['https://www.bell24h.com'],
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bell24h',
    url: 'https://www.bell24h.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.bell24h.com/marketplace?q={search_term_string}',
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
