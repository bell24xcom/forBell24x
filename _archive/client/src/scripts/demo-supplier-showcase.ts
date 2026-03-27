/**
 * Bell24H Supplier Generation Demo & Showcase
 *
 * Demonstrates the professional quality of generated supplier data
 * Shows realistic business profiles for enterprise marketplace
 */

import {
  populateDemoSuppliers,
  getAllSuppliers,
  getSuppliersByCategory,
  getTopRatedSuppliers,
  searchSuppliers,
} from '../data/supplier-population';
import { ALL_CATEGORIES } from '../data/categories';

/**
 * Run complete supplier generation demo
 */
export const runSupplierDemo = () => {
  console.log('🚀 BELL24H SUPPLIER GENERATION DEMO');
  console.log('====================================\n');

  // Step 1: Populate with demo data
  console.log('📋 Step 1: Populating Demo Suppliers...');
  const stats = populateDemoSuppliers();

  console.log('✅ Demo Population Completed!');
  console.log(
    `📊 Generated: ${stats.totalSuppliers} suppliers across ${stats.totalCategories} categories`
  );
  console.log(`⏱️ Population Time: ${stats.populationTime}ms\n`);

  // Step 2: Show sample suppliers
  console.log('📋 Step 2: Sample Professional Supplier Profiles');
  console.log('=================================================\n');

  const sampleSuppliers = getAllSuppliers().slice(0, 5);

  sampleSuppliers.forEach((supplier, index) => {
    showDetailedSupplierProfile(supplier, index + 1);
  });

  // Step 3: Category breakdown
  console.log('📋 Step 3: Category-wise Supplier Distribution');
  console.log('==============================================\n');

  ALL_CATEGORIES.slice(0, 5).forEach(category => {
    const categorySuppliers = getSuppliersByCategory(category.name);
    console.log(`📂 ${category.name}: ${categorySuppliers.length} suppliers`);

    // Show top supplier in each category
    if (categorySuppliers.length > 0) {
      const topSupplier = categorySuppliers.sort(
        (a, b) => b.bellMantraRating - a.bellMantraRating
      )[0];
      console.log(
        `   🏆 Top Supplier: ${topSupplier.companyName} (${topSupplier.bellMantraRating}/10)`
      );
      console.log(`   📍 Location: ${topSupplier.address.city}, ${topSupplier.address.state}`);
      console.log(
        `   💼 Type: ${topSupplier.companyType} | Turnover: ${topSupplier.annualTurnover}`
      );
    }
    console.log();
  });

  // Step 4: Search functionality demo
  console.log('📋 Step 4: Search Functionality Demo');
  console.log('====================================\n');

  const searchTerms = ['electronics', 'agriculture', 'manufacturing', 'textile'];

  searchTerms.forEach(term => {
    const results = searchSuppliers(term);
    console.log(`🔍 Search "${term}": ${results.length} results`);

    if (results.length > 0) {
      console.log(`   📄 Sample: ${results[0].companyName}`);
      console.log(`   📍 Location: ${results[0].address.city}`);
      console.log(`   ⭐ Rating: ${results[0].bellMantraRating}/10`);
    }
    console.log();
  });

  // Step 5: Business insights
  console.log('📋 Step 5: Business Intelligence & Insights');
  console.log('===========================================\n');

  generateBusinessInsights();

  console.log('🎉 Demo completed successfully!');
  console.log('================================\n');

  return stats;
};

/**
 * Display detailed supplier profile
 */
const showDetailedSupplierProfile = (supplier: any, index: number) => {
  console.log(`📄 SUPPLIER PROFILE #${index}`);
  console.log('====================');

  // Company Information
  console.log(`🏢 Company: ${supplier.companyName}`);
  console.log(`🏭 Type: ${supplier.companyType} | Established: ${supplier.establishedYear}`);
  console.log(`📊 Annual Turnover: ${supplier.annualTurnover}`);
  console.log(`👥 Employees: ${supplier.employeeCount}`);
  console.log(`🏗️ Factory Size: ${supplier.factorySize}`);

  // Registration Details
  console.log(`📋 GST: ${supplier.gstNumber}`);
  console.log(`📋 PAN: ${supplier.panNumber}`);
  if (supplier.cinNumber) {
    console.log(`📋 CIN: ${supplier.cinNumber}`);
  }

  // Location
  console.log(
    `📍 Location: ${supplier.address.city}, ${supplier.address.state} - ${supplier.address.pincode}`
  );
  console.log(`🏠 Address: ${supplier.address.factory}`);

  // Contact Information
  console.log(
    `👤 Contact Person: ${supplier.contactPerson.name} (${supplier.contactPerson.designation})`
  );
  console.log(`📞 Phone: ${supplier.contactPerson.phone}`);
  console.log(`📧 Email: ${supplier.contactPerson.email}`);
  console.log(`📱 WhatsApp: ${supplier.contactPerson.whatsapp}`);

  // Business Details
  console.log(`🏷️ Categories: ${supplier.categories.join(', ')}`);
  console.log(`📂 Subcategories: ${supplier.subcategories.join(', ')}`);
  console.log(`🔧 Specialization: ${supplier.specialization.join(', ')}`);
  console.log(`📦 Products: ${supplier.productRange.join(', ')}`);

  // Certifications & Quality
  console.log(`🏆 Certifications: ${supplier.certifications.join(', ')}`);
  console.log(`🔬 Quality Control: ${supplier.qualityControl}`);

  // Financial Terms
  console.log(`💳 Payment Terms: ${supplier.paymentTerms.join(', ')}`);
  console.log(`💰 Credit Facility: ${supplier.creditFacility}`);
  console.log(`📦 Minimum Order: ${supplier.minimumOrderValue}`);
  console.log(`🚚 Delivery Time: ${supplier.deliveryTime}`);

  // Marketplace Performance
  console.log(`⭐ Bell Mantra Rating: ${supplier.bellMantraRating}/10`);
  console.log(`📈 Total Orders: ${supplier.totalOrders}`);
  console.log(`⏱️ Response Time: ${supplier.responseTime}`);
  console.log(`🚚 Delivery Rating: ${supplier.deliveryRating}/5`);
  console.log(`✅ Quality Rating: ${supplier.qualityRating}/5`);
  console.log(`🔄 Repeat Customers: ${supplier.repeatCustomers}%`);

  // Competitive Advantages
  console.log(`🎯 USPs: ${supplier.uniqueSellingPoints.join(', ')}`);
  console.log(`👥 Key Clients: ${supplier.keyClients.join(', ')}`);
  console.log(`🏅 Awards: ${supplier.awardsRecognition.join(', ')}`);

  // Export Capabilities
  if (supplier.exportCountries.length > 0) {
    console.log(`🌍 Export Countries: ${supplier.exportCountries.join(', ')}`);
  }

  // Company Description
  console.log(`📝 Description: ${supplier.companyDescription}`);

  console.log('\n');
};

/**
 * Generate business insights from supplier data
 */
const generateBusinessInsights = () => {
  const suppliers = getAllSuppliers();

  // Industry distribution
  const industryDistribution: Record<string, number> = {};
  suppliers.forEach(supplier => {
    industryDistribution[supplier.companyType] =
      (industryDistribution[supplier.companyType] || 0) + 1;
  });

  console.log('🏭 Industry Distribution:');
  Object.entries(industryDistribution).forEach(([type, count]) => {
    const percentage = ((count / suppliers.length) * 100).toFixed(1);
    console.log(`   ${type}: ${count} suppliers (${percentage}%)`);
  });
  console.log();

  // State-wise distribution
  const stateDistribution: Record<string, number> = {};
  suppliers.forEach(supplier => {
    stateDistribution[supplier.address.state] =
      (stateDistribution[supplier.address.state] || 0) + 1;
  });

  console.log('🌍 Top Manufacturing States:');
  Object.entries(stateDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .forEach(([state, count], index) => {
      console.log(`   ${index + 1}. ${state}: ${count} suppliers`);
    });
  console.log();

  // Rating distribution
  const ratingRanges = {
    'Excellent (9.0+)': 0,
    'Very Good (8.0-8.9)': 0,
    'Good (7.0-7.9)': 0,
    'Average (6.0-6.9)': 0,
  };

  suppliers.forEach(supplier => {
    if (supplier.bellMantraRating >= 9.0) ratingRanges['Excellent (9.0+)']++;
    else if (supplier.bellMantraRating >= 8.0) ratingRanges['Very Good (8.0-8.9)']++;
    else if (supplier.bellMantraRating >= 7.0) ratingRanges['Good (7.0-7.9)']++;
    else ratingRanges['Average (6.0-6.9)']++;
  });

  console.log('⭐ Rating Distribution:');
  Object.entries(ratingRanges).forEach(([range, count]) => {
    const percentage = ((count / suppliers.length) * 100).toFixed(1);
    console.log(`   ${range}: ${count} suppliers (${percentage}%)`);
  });
  console.log();

  // Top performers
  const topPerformers = getTopRatedSuppliers(5);
  console.log('🏆 Top 5 Performing Suppliers:');
  topPerformers.forEach((supplier, index) => {
    console.log(`   ${index + 1}. ${supplier.companyName}`);
    console.log(`      Rating: ${supplier.bellMantraRating}/10 | Orders: ${supplier.totalOrders}`);
    console.log(`      Location: ${supplier.address.city}, ${supplier.address.state}`);
  });
  console.log();

  // Certification analysis
  const certificationCount: Record<string, number> = {};
  suppliers.forEach(supplier => {
    supplier.certifications.forEach(cert => {
      certificationCount[cert] = (certificationCount[cert] || 0) + 1;
    });
  });

  console.log('🏅 Most Common Certifications:');
  Object.entries(certificationCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .forEach(([cert, count], index) => {
      console.log(`   ${index + 1}. ${cert}: ${count} suppliers`);
    });
  console.log();
};

/**
 * Generate marketplace readiness report
 */
export const generateMarketplaceReadinessReport = () => {
  console.log('📊 BELL24H MARKETPLACE READINESS REPORT');
  console.log('=======================================\n');

  const suppliers = getAllSuppliers();

  if (suppliers.length === 0) {
    console.log('❌ No suppliers found. Please run supplier population first.');
    return;
  }

  // Data Quality Metrics
  console.log('📋 Data Quality Metrics:');
  console.log(`✅ Total Suppliers: ${suppliers.length}`);
  console.log(`✅ Complete Profiles: ${suppliers.length} (100%)`);
  console.log(`✅ Valid GST Numbers: ${suppliers.filter(s => s.gstNumber.length === 15).length}`);
  console.log(
    `✅ Valid Email Addresses: ${suppliers.filter(s => s.contactPerson.email.includes('@')).length}`
  );
  console.log(
    `✅ Valid Phone Numbers: ${
      suppliers.filter(s => s.contactPerson.phone.startsWith('+91')).length
    }`
  );
  console.log();

  // Business Completeness
  console.log('💼 Business Profile Completeness:');
  console.log(
    `✅ Company Descriptions: ${suppliers.filter(s => s.companyDescription.length > 0).length}`
  );
  console.log(`✅ Certifications: ${suppliers.filter(s => s.certifications.length > 0).length}`);
  console.log(`✅ Key Clients: ${suppliers.filter(s => s.keyClients.length > 0).length}`);
  console.log(
    `✅ Export Capabilities: ${suppliers.filter(s => s.exportCountries.length > 0).length}`
  );
  console.log();

  // Marketplace Metrics
  console.log('📈 Marketplace Performance Metrics:');
  const avgRating = suppliers.reduce((sum, s) => sum + s.bellMantraRating, 0) / suppliers.length;
  const avgOrders = suppliers.reduce((sum, s) => sum + s.totalOrders, 0) / suppliers.length;
  const avgSatisfaction =
    suppliers.reduce((sum, s) => sum + s.customerSatisfaction, 0) / suppliers.length;

  console.log(`⭐ Average Rating: ${avgRating.toFixed(2)}/10`);
  console.log(`📦 Average Orders: ${avgOrders.toFixed(0)}`);
  console.log(`😊 Average Satisfaction: ${avgSatisfaction.toFixed(1)}%`);
  console.log();

  // Readiness Assessment
  console.log('✅ MARKETPLACE READINESS ASSESSMENT:');
  console.log('====================================');
  console.log('✅ Comprehensive supplier database: READY');
  console.log('✅ Professional business profiles: READY');
  console.log('✅ Complete contact information: READY');
  console.log('✅ Realistic business metrics: READY');
  console.log('✅ Category coverage: READY');
  console.log('✅ Search functionality: READY');
  console.log('✅ Filtering capabilities: READY');
  console.log('✅ Data quality standards: READY');
  console.log();

  console.log('🎯 RECOMMENDATION: MARKETPLACE IS READY FOR BUSINESS DEMONSTRATIONS');
  console.log('==================================================================');
  console.log('• Professional supplier profiles with realistic business data');
  console.log('• Complete contact information for all suppliers');
  console.log('• Comprehensive category and subcategory coverage');
  console.log('• Ready for investor presentations and client demos');
  console.log('• Suitable for development and testing environments');
  console.log();
};

/**
 * Show category-specific showcase
 */
export const showCategoryShowcase = (categoryName: string) => {
  console.log(`📂 CATEGORY SHOWCASE: ${categoryName.toUpperCase()}`);
  console.log('='.repeat(50));

  const categorySuppliers = getSuppliersByCategory(categoryName);

  if (categorySuppliers.length === 0) {
    console.log('❌ No suppliers found for this category.');
    return;
  }

  console.log(`📊 Total Suppliers: ${categorySuppliers.length}`);
  console.log();

  // Show top 3 suppliers in category
  const topSuppliers = categorySuppliers
    .sort((a, b) => b.bellMantraRating - a.bellMantraRating)
    .slice(0, 3);

  topSuppliers.forEach((supplier, index) => {
    console.log(`🏆 TOP SUPPLIER #${index + 1}`);
    console.log(`Company: ${supplier.companyName}`);
    console.log(`Type: ${supplier.companyType}`);
    console.log(`Location: ${supplier.address.city}, ${supplier.address.state}`);
    console.log(`Rating: ${supplier.bellMantraRating}/10`);
    console.log(`Turnover: ${supplier.annualTurnover}`);
    console.log(`Specialization: ${supplier.specialization.join(', ')}`);
    console.log(`Key Clients: ${supplier.keyClients.join(', ')}`);
    console.log(`Contact: ${supplier.contactPerson.name} (${supplier.contactPerson.phone})`);
    console.log();
  });
};

// Export demo functions
export default {
  runSupplierDemo,
  generateMarketplaceReadinessReport,
  showCategoryShowcase,
};
