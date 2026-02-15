/**
 * Global SEO Manager
 *
 * Comprehensive SEO management system for Bell24H's global expansion
 * Handles meta tags, structured data, sitemaps, and international SEO
 */

import { GLOBAL_SEO_CONFIG, GLOBAL_META_TEMPLATES, CountrySEO } from '@/data/global-seo-config';
import { ALL_CATEGORIES } from '@/data/categories';

export class GlobalSEOManager {
  private country: CountrySEO;

  constructor(countryCode: string = 'IN') {
    this.country = GLOBAL_SEO_CONFIG[countryCode] || GLOBAL_SEO_CONFIG['IN'];
  }

  // Generate meta tags for any page
  generateMetaTags(pageData: {
    type: 'homepage' | 'category' | 'supplier' | 'search' | 'about';
    title?: string;
    description?: string;
    keywords?: string[];
    category?: string;
    supplierName?: string;
    city?: string;
    canonicalUrl?: string;
    noindex?: boolean;
  }) {
    const {
      type,
      title,
      description,
      keywords = [],
      category,
      supplierName,
      city,
      canonicalUrl,
      noindex = false,
    } = pageData;

    const metaTags = {
      title: title || this.generateTitle(type, { category, supplierName, city }),
      description: description || this.generateDescription(type, { category, supplierName, city }),
      keywords:
        keywords.length > 0 ? keywords.join(', ') : this.generateKeywords(type, { category }),
      canonical: canonicalUrl || `https://${this.country.domain}`,
      robots: noindex ? 'noindex, nofollow' : 'index, follow',
      language: this.country.language,
      region: this.country.code,
      currency: this.country.currency,
      businessHours: this.country.localBusinessHours,
    };

    return metaTags;
  }

  // Generate structured data for any page
  generateStructuredData(pageData: {
    type: 'homepage' | 'category' | 'supplier' | 'search' | 'product';
    data?: any;
  }) {
    const { type, data = {} } = pageData;

    const schemas = [];

    // Base organization schema
    schemas.push(this.generateOrganizationSchema());

    // Website schema
    schemas.push(this.generateWebsiteSchema());

    // Page-specific schemas
    switch (type) {
      case 'homepage':
        schemas.push(this.generateMarketplaceSchema());
        break;
      case 'category':
        schemas.push(this.generateCategorySchema(data));
        break;
      case 'supplier':
        schemas.push(this.generateSupplierSchema(data));
        break;
      case 'product':
        schemas.push(this.generateProductSchema(data));
        break;
    }

    return schemas;
  }

  // Generate hreflang tags
  generateHreflangTags(currentPath: string = '/') {
    return Object.values(GLOBAL_SEO_CONFIG).map(country => ({
      hreflang: country.hreflang,
      href: `https://${country.domain}${currentPath}`,
    }));
  }

  // Generate Open Graph tags
  generateOpenGraphTags(pageData: {
    title: string;
    description: string;
    url: string;
    image?: string;
    type?: string;
  }) {
    const { title, description, url, image, type = 'website' } = pageData;

    return {
      'og:type': type,
      'og:title': title,
      'og:description': description,
      'og:url': url,
      'og:site_name': `Bell24H ${this.country.name}`,
      'og:image': image || `https://${this.country.domain}/images/og-default.jpg`,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': title,
      'og:locale': this.country.hreflang,
      'og:updated_time': new Date().toISOString(),
    };
  }

  // Generate Twitter Card tags
  generateTwitterTags(pageData: { title: string; description: string; image?: string }) {
    const { title, description, image } = pageData;

    return {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image || `https://${this.country.domain}/images/twitter-default.jpg`,
      'twitter:site': '@bell24h',
      'twitter:creator': '@bell24h',
    };
  }

  // Generate complete SEO package for a page
  generateCompleteSEO(pageData: {
    type: 'homepage' | 'category' | 'supplier' | 'search' | 'about';
    path: string;
    title?: string;
    description?: string;
    keywords?: string[];
    category?: string;
    supplierName?: string;
    city?: string;
    image?: string;
    data?: any;
  }) {
    const { type, path, title, description, keywords, category, supplierName, city, image, data } =
      pageData;

    const metaTags = this.generateMetaTags({
      type,
      title,
      description,
      keywords,
      category,
      supplierName,
      city,
      canonicalUrl: `https://${this.country.domain}${path}`,
    });

    const structuredData = this.generateStructuredData({
      type:
        type === 'about'
          ? 'homepage'
          : (type as 'category' | 'search' | 'product' | 'supplier' | 'homepage'),
      data,
    });
    const hreflangTags = this.generateHreflangTags(path);
    const openGraphTags = this.generateOpenGraphTags({
      title: metaTags.title,
      description: metaTags.description,
      url: `https://${this.country.domain}${path}`,
      image,
    });
    const twitterTags = this.generateTwitterTags({
      title: metaTags.title,
      description: metaTags.description,
      image,
    });

    return {
      meta: metaTags,
      structuredData,
      hreflang: hreflangTags,
      openGraph: openGraphTags,
      twitter: twitterTags,
      country: this.country,
    };
  }

  // Private helper methods
  private generateTitle(type: string, data: any) {
    const templates = GLOBAL_META_TEMPLATES[type as keyof typeof GLOBAL_META_TEMPLATES];
    if (!templates) return `Bell24H ${this.country.name}`;

    let title = templates.title;
    title = title.replace('{country}', this.country.name);
    title = title.replace('{localSuppliers}', this.country.localSuppliers.toLocaleString());
    title = title.replace('{category}', data.category || 'Products');
    title = title.replace('{companyName}', data.supplierName || 'Company');
    title = title.replace('{city}', data.city || this.country.name);

    return title;
  }

  private generateDescription(type: string, data: any) {
    const templates = GLOBAL_META_TEMPLATES[type as keyof typeof GLOBAL_META_TEMPLATES];
    if (!templates) return `Leading B2B marketplace in ${this.country.name}`;

    let description = templates.description;
    description = description.replace('{country}', this.country.name);
    description = description.replace(
      '{localSuppliers}',
      this.country.localSuppliers.toLocaleString()
    );
    description = description.replace('{category}', data.category || 'products');
    description = description.replace(
      '{supplierCount}',
      Math.floor(this.country.localSuppliers / 10).toLocaleString()
    );
    description = description.replace('{topIndustry}', this.country.topIndustries[0]);
    description = description.replace('{companyName}', data.supplierName || 'Company');
    description = description.replace('{city}', data.city || this.country.name);
    description = description.replace('{rating}', '8.5');
    description = description.replace('{certifications}', this.country.certifications.join(', '));
    description = description.replace('{products}', data.category || 'products');

    return description;
  }

  private generateKeywords(type: string, data: any) {
    const baseKeywords = this.country.keywords;
    const categoryKeywords = data.category
      ? [`${data.category} ${this.country.name}`, `${data.category} suppliers`]
      : [];

    return [...baseKeywords, ...categoryKeywords, ...this.country.topIndustries].join(', ');
  }

  private generateOrganizationSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: `Bell24H ${this.country.name}`,
      url: `https://${this.country.domain}`,
      logo: `https://${this.country.domain}/logo.png`,
      description: `Leading B2B marketplace in ${
        this.country.name
      } with ${this.country.localSuppliers.toLocaleString()}+ verified suppliers`,
      foundingDate: '2023',
      address: {
        '@type': 'PostalAddress',
        addressCountry: this.country.code,
        addressLocality: this.country.name,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-80-4040-7000',
        contactType: 'Customer Service',
        areaServed: this.country.code,
        availableLanguage: this.country.language,
      },
      sameAs: [
        `https://www.facebook.com/bell24h`,
        `https://www.twitter.com/bell24h`,
        `https://www.linkedin.com/company/bell24h`,
      ],
    };
  }

  private generateWebsiteSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: `Bell24H ${this.country.name}`,
      url: `https://${this.country.domain}`,
      potentialAction: {
        '@type': 'SearchAction',
        target: `https://${this.country.domain}/search?q={search_term}`,
        'query-input': 'required name=search_term',
      },
    };
  }

  private generateMarketplaceSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `B2B Marketplace Services`,
      description: `Professional B2B marketplace connecting suppliers and buyers in ${this.country.name}`,
      provider: {
        '@type': 'Organization',
        name: `Bell24H ${this.country.name}`,
      },
    };
  }

  private generateCategorySchema(data: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${data.category || 'Products'} Suppliers in ${this.country.name}`,
      description: `Find verified ${data.category || 'product'} suppliers in ${this.country.name}`,
      numberOfItems: data.supplierCount || Math.floor(this.country.localSuppliers / 50),
    };
  }

  private generateSupplierSchema(data: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: data.companyName || 'Supplier',
      description: data.description || `Professional supplier in ${this.country.name}`,
      address: {
        '@type': 'PostalAddress',
        addressCountry: this.country.code,
        addressLocality: data.city || this.country.name,
      },
    };
  }

  private generateProductSchema(data: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.productName || 'Product',
      description: data.description || 'Quality product from verified supplier',
      manufacturer: {
        '@type': 'Organization',
        name: data.supplierName || 'Manufacturer',
      },
    };
  }
}
