export function SupplierJsonLd({ supplier }: { supplier: any }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://bell24h.com/suppliers/${supplier.slug}`,
    name: supplier.company_name,
    description: supplier.business_description || `${supplier.company_name} - ${supplier.business_type} in ${supplier.city}`,
    
    // Address
    address: {
      '@type': 'PostalAddress',
      streetAddress: supplier.address,
      addressLocality: supplier.city,
      addressRegion: supplier.state,
      postalCode: supplier.pincode,
      addressCountry: 'IN',
    },
    
    // Geo coordinates
    ...(supplier.latitude && supplier.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: supplier.latitude,
        longitude: supplier.longitude,
      },
    }),
    
    // Contact
    telephone: supplier.phone,
    email: supplier.email,
    url: supplier.website,
    
    // Business details
    foundingDate: supplier.establishment_year,
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: supplier.employee_count,
    },
    
    // Category
    category: supplier.category?.name,
    
    // Products/Services
    makesOffer: supplier.products?.map((product: any) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Product',
        name: product.product_name,
        description: product.description,
      },
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: product.price_range,
        priceCurrency: 'INR',
      },
      availability: 'https://schema.org/InStock',
    })),
    
    // Ratings from Google Maps
    ...(supplier.google_rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: supplier.google_rating,
        reviewCount: supplier.google_reviews_count || 0,
      },
    }),
    
    // Bell24H specific
    identifier: {
      '@type': 'PropertyValue',
      name: 'bell24h_id',
      value: supplier.id,
    },
    
    // Verification status
    ...(supplier.is_verified && {
      award: 'Bell24H Verified Supplier',
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
