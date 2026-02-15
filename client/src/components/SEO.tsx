import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export default function SEO({
  title = 'BELL24H - Unified B2B Marketplace | Buy & Sell with AI Matching',
  description = "India's leading B2B marketplace with AI-powered matching, ECGC protection, and unified buying/selling platform. Connect with 534,672+ verified businesses.",
  keywords = 'B2B marketplace, business trading, suppliers, buyers, AI matching, ECGC, India trade, manufacturing, electronics, textiles, machinery, automotive, construction, chemicals, agriculture, healthcare',
  ogImage = '/bell24h-og.jpg',
  url = 'https://bell24h.com',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'BELL24H Team',
  section,
  tags = ['B2B', 'marketplace', 'trading', 'suppliers', 'buyers'],
}: SEOProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BELL24H',
    description: description,
    url: url,
    logo: `${url}/logo.png`,
    sameAs: [
      'https://linkedin.com/company/bell24h',
      'https://twitter.com/bell24h',
      'https://facebook.com/bell24h',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-80-4567-8901',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Bell24H Tower, Tech Park',
      addressLocality: 'Bangalore',
      addressRegion: 'Karnataka',
      postalCode: '560001',
      addressCountry: 'IN',
    },
    foundingDate: '2024',
    numberOfEmployees: '500+',
    serviceArea: {
      '@type': 'Country',
      name: 'India',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'B2B Marketplace Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Supplier Directory',
            description: 'Access to 534,672+ verified suppliers',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'AI-Powered Matching',
            description: 'Smart supplier-buyer connections',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'ECGC Protection',
            description: 'Government-backed trade security',
          },
        },
      ],
    },
  };

  const articleStructuredData =
    type === 'article'
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description: description,
          image: ogImage,
          author: {
            '@type': 'Person',
            name: author,
          },
          publisher: {
            '@type': 'Organization',
            name: 'BELL24H',
            logo: {
              '@type': 'ImageObject',
              url: `${url}/logo.png`,
            },
          },
          datePublished: publishedTime,
          dateModified: modifiedTime,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
          },
        }
      : null;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <meta name='robots' content='index, follow' />
      <meta name='author' content={author} />
      <meta name='language' content='English' />
      <meta name='revisit-after' content='7 days' />

      {/* Canonical URL */}
      <link rel='canonical' href={url} />

      {/* Open Graph */}
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={ogImage} />
      <meta property='og:url' content={url} />
      <meta property='og:type' content={type} />
      <meta property='og:site_name' content='BELL24H' />
      <meta property='og:locale' content='en_US' />

      {/* Twitter Card */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={ogImage} />
      <meta name='twitter:site' content='@bell24h' />
      <meta name='twitter:creator' content='@bell24h' />

      {/* Favicon */}
      <link rel='icon' href='/favicon.ico' />
      <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
      <link rel='manifest' href='/site.webmanifest' />

      {/* Preconnect for Performance */}
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />

      {/* Google Fonts */}
      <link
        href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
        rel='stylesheet'
      />

      {/* Structured Data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {articleStructuredData && (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleStructuredData),
          }}
        />
      )}

      {/* Additional Meta Tags for B2B */}
      <meta name='business:contact_data:street_address' content='Bell24H Tower, Tech Park' />
      <meta name='business:contact_data:locality' content='Bangalore' />
      <meta name='business:contact_data:region' content='Karnataka' />
      <meta name='business:contact_data:postal_code' content='560001' />
      <meta name='business:contact_data:country_name' content='India' />
      <meta name='business:contact_data:phone_number' content='+91-80-4567-8901' />

      {/* Industry-specific tags */}
      <meta name='industry' content='B2B Marketplace' />
      <meta name='business_type' content='Technology Platform' />
      <meta
        name='target_audience'
        content='Manufacturers, Distributors, Retailers, Service Providers'
      />

      {/* Security Headers */}
      <meta httpEquiv='X-Content-Type-Options' content='nosniff' />
      <meta httpEquiv='X-Frame-Options' content='DENY' />
      <meta httpEquiv='X-XSS-Protection' content='1; mode=block' />

      {/* Mobile Optimization */}
      <meta name='theme-color' content='#2563eb' />
      <meta name='msapplication-TileColor' content='#2563eb' />
      <meta name='msapplication-config' content='/browserconfig.xml' />

      {/* PWA Manifest */}
      <link rel='manifest' href='/manifest.json' />

      {/* Verification Tags */}
      <meta name='google-site-verification' content='your-google-verification-code' />
      <meta name='msvalidate.01' content='your-bing-verification-code' />
      <meta name='yandex-verification' content='your-yandex-verification-code' />

      {/* Analytics (if enabled) */}
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
              `,
            }}
          />
        </>
      )}

      {/* Hotjar (if enabled) */}
      {process.env.NEXT_PUBLIC_HOTJAR_ID && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `,
          }}
        />
      )}
    </Head>
  );
}
