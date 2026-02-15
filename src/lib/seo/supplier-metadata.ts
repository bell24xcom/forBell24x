import { Metadata } from 'next';

interface SupplierWithRelations {
  id: string;
  company_name: string;
  slug: string;
  business_description?: string;
  city?: string;
  state?: string;
  country?: string;
  business_type?: string;
  establishment_year?: number;
  is_verified: boolean;
  category?: {
    name: string;
    slug: string;
  };
  products?: Array<{
    product_name: string;
    description?: string;
  }>;
  ai_extracted_products?: string[];
  ai_extracted_services?: string[];
}

export function generateSupplierMetadata(supplier: SupplierWithRelations): Metadata {
  const productNames = supplier.products?.map(p => p.product_name).slice(0, 5) || [];
  const aiProducts = supplier.ai_extracted_products?.slice(0, 5) || [];
  const allProducts = [...new Set([...productNames, ...aiProducts])];
  
  const title = `${supplier.company_name} - ${supplier.category?.name || 'Supplier'} in ${supplier.city || 'India'} | Bell24H`;
  
  const description = supplier.business_description || 
    `${supplier.company_name} is a leading ${supplier.business_type || 'supplier'} of ${supplier.category?.name || 'products'} based in ${supplier.city}, ${supplier.state}. ${
      allProducts.length > 0 ? `Specializing in ${allProducts.join(', ')}.` : ''
    } Connect with verified suppliers on Bell24H B2B marketplace.`;

  const keywords = [
    supplier.company_name,
    supplier.category?.name,
    supplier.city,
    supplier.state,
    supplier.business_type,
    ...allProducts,
    'B2B supplier',
    'manufacturer',
    'wholesale',
    'India',
  ].filter(Boolean).join(', ');

  return {
    title,
    description,
    keywords,
    
    // OpenGraph
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `https://bell24h.com/suppliers/${supplier.slug}`,
      siteName: 'Bell24H',
      locale: 'en_IN',
      images: [
        {
          url: '/og-supplier-default.jpg',
          width: 1200,
          height: 630,
          alt: `${supplier.company_name} - B2B Supplier`,
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-supplier-default.jpg'],
    },
    
    // Additional Meta Tags
    other: {
      'business:contact_data:street_address': supplier.address || '',
      'business:contact_data:locality': supplier.city || '',
      'business:contact_data:region': supplier.state || '',
      'business:contact_data:country_name': supplier.country || 'India',
      'og:type': 'business.business',
      'og:latitude': supplier.latitude || '',
      'og:longitude': supplier.longitude || '',
    },
    
    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Verification Status
    verification: supplier.is_verified ? {
      other: {
        'bell24h-verified': 'true',
      },
    } : undefined,
  };
}
