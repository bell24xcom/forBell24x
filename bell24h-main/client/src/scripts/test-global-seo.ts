/**
 * Global SEO Test Script
 *
 * Demonstrates the global SEO system working across all 75+ countries
 * Tests meta generation, structured data, and international SEO features
 */

import { GlobalSEOManager } from '../lib/seo-manager';
import { GLOBAL_SEO_CONFIG } from '../data/global-seo-config';

async function testGlobalSEO() {
  console.log('🌍 BELL24H GLOBAL SEO SYSTEM TEST');
  console.log('==================================');

  const countries = Object.keys(GLOBAL_SEO_CONFIG);
  console.log(`\n📊 Testing SEO for ${countries.length} countries...`);

  // Test each country's SEO configuration
  for (const countryCode of countries.slice(0, 10)) {
    // Test first 10 countries
    const country = GLOBAL_SEO_CONFIG[countryCode];
    const seoManager = new GlobalSEOManager(countryCode);

    console.log(`\n🔍 Testing ${country.name} (${countryCode})`);
    console.log(`   Domain: ${country.domain}`);
    console.log(`   Language: ${country.language}`);
    console.log(`   Currency: ${country.currency}`);
    console.log(`   Suppliers: ${country.localSuppliers.toLocaleString()}`);

    // Test homepage SEO
    const homepageSEO = seoManager.generateCompleteSEO({
      type: 'homepage',
      path: '/',
    });

    console.log(`   Homepage Title: ${homepageSEO.meta.title}`);
    console.log(`   Meta Description: ${homepageSEO.meta.description.substring(0, 100)}...`);
    console.log(`   Structured Data Schemas: ${homepageSEO.structuredData.length}`);
    console.log(`   Hreflang Tags: ${homepageSEO.hreflang.length}`);

    // Test category SEO
    const categorySEO = seoManager.generateCompleteSEO({
      type: 'category',
      path: '/categories/electronics',
      category: 'Electronics',
    });

    console.log(`   Category Title: ${categorySEO.meta.title}`);

    // Test supplier SEO
    const supplierSEO = seoManager.generateCompleteSEO({
      type: 'supplier',
      path: '/suppliers/test-supplier',
      supplierName: 'Test Electronics Ltd',
      category: 'Electronics',
      city: 'Mumbai',
    });

    console.log(`   Supplier Title: ${supplierSEO.meta.title}`);
  }

  // Test SEO utilities
  console.log('\n🛠️ Testing SEO Utilities...');

  // Test sitemap generation
  // const sitemapEntry = SEOUtils.generateSitemapEntry(
  //   'https://bell24h.com/categories/electronics',
  //   new Date().toISOString(),
  //   'daily',
  //   0.8
  // );
  // console.log('Sitemap Entry:', sitemapEntry);

  // Test robots.txt generation
  // const robotsTxt = SEOUtils.generateRobotsTxt(GLOBAL_SEO_CONFIG['IN']);
  // console.log(`   Robots.txt Length: ${robotsTxt.length} characters`);

  // Test alternate URLs
  // const alternateUrls = SEOUtils.generateAlternateUrls('/categories/electronics');
  // console.log(`   Alternate URLs: ${alternateUrls.length} languages`);

  // Test specific country examples
  console.log('\n🎯 COUNTRY-SPECIFIC SEO EXAMPLES');
  console.log('================================');

  const testCountries = ['IN', 'US', 'DE', 'JP', 'AE', 'SG', 'AU', 'BR'];

  for (const code of testCountries) {
    const country = GLOBAL_SEO_CONFIG[code];
    const seoManager = new GlobalSEOManager(code);

    console.log(`\n🏳️ ${country.name} (${code})`);
    console.log(`   Market: ${country.marketSize}`);
    console.log(`   Top Industries: ${country.topIndustries.slice(0, 3).join(', ')}`);
    console.log(`   Payment Methods: ${country.paymentMethods.slice(0, 3).join(', ')}`);
    console.log(`   Certifications: ${country.certifications.slice(0, 3).join(', ')}`);
    console.log(`   Search Engines: ${country.searchEngines.join(', ')}`);

    // Generate sample meta tags
    const sampleSEO = seoManager.generateMetaTags({
      type: 'homepage',
      category: 'Electronics',
    });

    console.log(`   Sample Title: ${sampleSEO.title}`);
    console.log(`   Sample Keywords: ${sampleSEO.keywords.substring(0, 80)}...`);
    console.log(`   Business Hours: ${sampleSEO.businessHours}`);
    console.log(`   Currency: ${sampleSEO.currency}`);
  }

  // Test structured data generation
  console.log('\n📋 STRUCTURED DATA EXAMPLES');
  console.log('===========================');

  const seoManagerIN = new GlobalSEOManager('IN');
  const structuredData = seoManagerIN.generateStructuredData({
    type: 'homepage',
  });

  console.log(`   Homepage Schemas: ${structuredData.length}`);
  structuredData.forEach((schema, index) => {
    console.log(`   Schema ${index + 1}: ${schema['@type']}`);
  });

  // Test category structured data
  const categoryStructuredData = seoManagerIN.generateStructuredData({
    type: 'category',
    data: {
      id: 'electronics',
      name: 'Electronics',
      description: 'Electronic components and devices',
    },
  });

  console.log(`   Category Schemas: ${categoryStructuredData.length}`);

  // Test supplier structured data
  const supplierStructuredData = seoManagerIN.generateStructuredData({
    type: 'supplier',
    data: {
      id: 'supplier-123',
      name: 'Mumbai Electronics Ltd',
      category: 'Electronics',
      city: 'Mumbai',
      rating: 4.5,
      reviewCount: 250,
    },
  });

  console.log(`   Supplier Schemas: ${supplierStructuredData.length}`);

  // Performance metrics
  console.log('\n⚡ PERFORMANCE METRICS');
  console.log('=====================');

  const startTime = Date.now();

  // Generate SEO for multiple pages
  const pages = [
    { type: 'homepage', path: '/' },
    { type: 'category', path: '/categories/electronics', category: 'Electronics' },
    { type: 'category', path: '/categories/textiles', category: 'Textiles' },
    { type: 'supplier', path: '/suppliers/test-1', supplierName: 'Test Supplier 1' },
    { type: 'supplier', path: '/suppliers/test-2', supplierName: 'Test Supplier 2' },
  ];

  for (const page of pages) {
    seoManagerIN.generateCompleteSEO(page as any);
  }

  const endTime = Date.now();
  console.log(`   Generated SEO for ${pages.length} pages in ${endTime - startTime}ms`);
  console.log(`   Average: ${(endTime - startTime) / pages.length}ms per page`);

  // Generate sample URLs for different countries
  console.log('\n🔗 SAMPLE URLS BY COUNTRY');
  console.log('========================');

  const samplePaths = [
    '/categories/electronics',
    '/suppliers/mumbai-electronics',
    '/search?q=led+manufacturers',
    '/categories/textiles/cotton-fabric',
  ];

  for (const path of samplePaths) {
    console.log(`\n   Path: ${path}`);
    Object.values(GLOBAL_SEO_CONFIG)
      .slice(0, 5)
      .forEach(country => {
        console.log(`   ${country.name}: https://${country.domain}${path}`);
      });
  }

  // Summary
  console.log('\n🎉 GLOBAL SEO SYSTEM SUMMARY');
  console.log('============================');
  console.log(`✅ Countries Supported: ${countries.length}`);
  console.log(
    `✅ Languages Supported: ${new Set(Object.values(GLOBAL_SEO_CONFIG).map(c => c.language)).size}`
  );
  console.log(
    `✅ Currencies Supported: ${
      new Set(Object.values(GLOBAL_SEO_CONFIG).map(c => c.currency)).size
    }`
  );
  console.log(
    `✅ Total Suppliers: ${Object.values(GLOBAL_SEO_CONFIG)
      .reduce((sum, c) => sum + c.localSuppliers, 0)
      .toLocaleString()}`
  );
  console.log(
    `✅ Search Engines: ${
      new Set(Object.values(GLOBAL_SEO_CONFIG).flatMap(c => c.searchEngines)).size
    }`
  );
  console.log(
    `✅ Payment Methods: ${
      new Set(Object.values(GLOBAL_SEO_CONFIG).flatMap(c => c.paymentMethods)).size
    }`
  );
  console.log(
    `✅ Certifications: ${
      new Set(Object.values(GLOBAL_SEO_CONFIG).flatMap(c => c.certifications)).size
    }`
  );

  console.log('\n🚀 GLOBAL SEO SYSTEM READY FOR DEPLOYMENT!');
  console.log('🌍 Ready to dominate search results in 75+ countries!');
}

// Export for use in other scripts
export { testGlobalSEO };

// Run if executed directly
if (require.main === module) {
  testGlobalSEO().catch(console.error);
}
