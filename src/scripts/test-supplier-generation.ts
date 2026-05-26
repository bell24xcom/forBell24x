/**
 * Bell24h Supplier Generation Test Suite
 *
 * Tests and demonstrates the comprehensive supplier generation system
 * Validates data quality and system performance
 */

import {
  populateAllSuppliers,
  populateDemoSuppliers,
  getAllSuppliers,
  getSuppliersByCategory,
  getMarketplaceStats,
  getTopRatedSuppliers,
  searchSuppliers,
} from '../data/supplier-population';
import { ALL_CATEGORIES } from '../data/categories';

// Test configuration
const TEST_CONFIG = {
  runFullPopulation: false, // Set to true to test full population (takes longer)
  runDemoPopulation: true, // Quick demo test
  validateDataQuality: true,
  showSampleData: true,
  testSearchFunctions: true,
};

/**
 * Main test function
 */
export const runSupplierGenerationTests = async () => {
  console.log('🚀 Bell24h Supplier Generation Test Suite Starting...\n');

  try {
    // Test 1: Demo Population
    if (TEST_CONFIG.runDemoPopulation) {
      console.log('📋 TEST 1: Demo Supplier Population');
      console.log('=====================================');

      const demoStats = populateDemoSuppliers();
      console.log('✅ Demo population completed successfully!');
      console.log(
        `📊 Stats: ${demoStats.totalSuppliers} suppliers, ${demoStats.totalCategories} categories`
      );
      console.log(`⏱️ Time: ${demoStats.populationTime}ms\n`);
    }

    // Test 2: Full Population (optional)
    if (TEST_CONFIG.runFullPopulation) {
      console.log('📋 TEST 2: Full Supplier Population');
      console.log('===================================');

      const fullStats = populateAllSuppliers();
      console.log('✅ Full population completed successfully!');
      console.log(
        `📊 Stats: ${fullStats.totalSuppliers} suppliers, ${fullStats.totalCategories} categories`
      );
      console.log(`⏱️ Time: ${fullStats.populationTime}ms\n`);
    }

    // Test 3: Data Quality Validation
    if (TEST_CONFIG.validateDataQuality) {
      console.log('📋 TEST 3: Data Quality Validation');
      console.log('==================================');

      const allSuppliers = getAllSuppliers();
      const validationResults = validateSupplierData(allSuppliers);

      if (validationResults.isValid) {
        console.log('✅ All data quality checks passed!');
      } else {
        console.log('❌ Data quality issues found:');
        validationResults.issues.forEach(issue => console.log(`  - ${issue}`));
      }
      console.log(`📊 Validated ${allSuppliers.length} suppliers\n`);
    }

    // Test 4: Sample Data Display
    if (TEST_CONFIG.showSampleData) {
      console.log('📋 TEST 4: Sample Data Display');
      console.log('==============================');

      const sampleSuppliers = getAllSuppliers().slice(0, 3);
      sampleSuppliers.forEach((supplier, index) => {
        console.log(`\n📄 Sample Supplier ${index + 1}:`);
        console.log(`  Company: ${supplier.companyName}`);
        console.log(`  Type: ${supplier.companyType}`);
        console.log(`  Location: ${supplier.address.city}, ${supplier.address.state}`);
        console.log(`  Categories: ${supplier.categories.join(', ')}`);
        console.log(`  Subcategories: ${supplier.subcategories.join(', ')}`);
        console.log(`  Turnover: ${supplier.annualTurnover}`);
        console.log(`  Rating: ${supplier.bellMantraRating}/10`);
        console.log(`  GST: ${supplier.gstNumber}`);
        console.log(
          `  Contact: ${supplier.contactPerson.name} (${supplier.contactPerson.designation})`
        );
        console.log(`  Phone: ${supplier.contactPerson.phone}`);
        console.log(`  Email: ${supplier.contactPerson.email}`);
      });
      console.log('\n');
    }

    // Test 5: Search Functions
    if (TEST_CONFIG.testSearchFunctions) {
      console.log('📋 TEST 5: Search Functions Test');
      console.log('================================');

      // Test category search
      const agricultureSuppliers = getSuppliersByCategory('Agriculture');
      console.log(`✅ Agriculture suppliers: ${agricultureSuppliers.length}`);

      // Test top-rated suppliers
      const topRated = getTopRatedSuppliers(5);
      console.log(`✅ Top 5 rated suppliers: ${topRated.length}`);
      console.log(`   Highest rating: ${topRated[0]?.bellMantraRating}/10`);

      // Test search functionality
      const searchResults = searchSuppliers('electronics');
      console.log(`✅ Search 'electronics': ${searchResults.length} results`);

      console.log('\n');
    }

    // Test 6: Marketplace Statistics
    console.log('📋 TEST 6: Marketplace Statistics');
    console.log('=================================');

    const stats = getMarketplaceStats();
    if (stats) {
      console.log('✅ Marketplace Statistics Generated:');
      console.log(`  📊 Total Suppliers: ${stats.totalSuppliers}`);
      console.log(`  📂 Total Categories: ${stats.totalCategories}`);
      console.log(`  📋 Total Subcategories: ${stats.totalSubcategories}`);
      console.log(`  📈 Average Suppliers per Category: ${stats.averageSuppliersPerCategory}`);

      console.log('\n  🏭 Suppliers by Type:');
      Object.entries(stats.suppliersByType).forEach(([type, count]) => {
        console.log(`    ${type}: ${count}`);
      });

      console.log('\n  🌍 Top States by Suppliers:');
      Object.entries(stats.suppliersByState)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([state, count]) => {
          console.log(`    ${state}: ${count}`);
        });

      console.log('\n  🏆 Top Rated Suppliers:');
      stats.topRatedSuppliers.slice(0, 3).forEach((supplier, index) => {
        console.log(`    ${index + 1}. ${supplier.companyName} (${supplier.bellMantraRating}/10)`);
      });
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('====================================');
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
};

/**
 * Validate supplier data quality
 */
const validateSupplierData = (suppliers: any[]): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];

  suppliers.forEach((supplier, index) => {
    // Check required fields
    if (!supplier.companyName) {
      issues.push(`Supplier ${index + 1}: Missing company name`);
    }

    if (!supplier.companyId) {
      issues.push(`Supplier ${index + 1}: Missing company ID`);
    }

    if (!supplier.gstNumber || supplier.gstNumber.length !== 15) {
      issues.push(`Supplier ${index + 1}: Invalid GST number format`);
    }

    if (!supplier.contactPerson?.email || !supplier.contactPerson.email.includes('@')) {
      issues.push(`Supplier ${index + 1}: Invalid email format`);
    }

    if (!supplier.contactPerson?.phone || !supplier.contactPerson.phone.startsWith('+91')) {
      issues.push(`Supplier ${index + 1}: Invalid phone format`);
    }

    if (!supplier.address?.city || !supplier.address?.state) {
      issues.push(`Supplier ${index + 1}: Missing address information`);
    }

    if (!supplier.categories || supplier.categories.length === 0) {
      issues.push(`Supplier ${index + 1}: Missing categories`);
    }

    if (!supplier.subcategories || supplier.subcategories.length === 0) {
      issues.push(`Supplier ${index + 1}: Missing subcategories`);
    }

    if (
      !supplier.bellMantraRating ||
      supplier.bellMantraRating < 1 ||
      supplier.bellMantraRating > 10
    ) {
      issues.push(`Supplier ${index + 1}: Invalid Bell Mantra rating`);
    }

    if (!supplier.certifications || supplier.certifications.length === 0) {
      issues.push(`Supplier ${index + 1}: Missing certifications`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
  };
};

/**
 * Performance test
 */
export const runPerformanceTest = () => {
  console.log('📋 Performance Test Starting...\n');

  // Test population performance
  console.log('⏱️ Testing population performance...');
  const startTime = Date.now();

  populateDemoSuppliers();

  const endTime = Date.now();
  const populationTime = endTime - startTime;

  console.log(`✅ Population completed in ${populationTime}ms`);

  // Test search performance
  console.log('⏱️ Testing search performance...');
  const searchStartTime = Date.now();

  const searchResults = searchSuppliers('manufacturing');

  const searchEndTime = Date.now();
  const searchTime = searchEndTime - searchStartTime;

  console.log(`✅ Search completed in ${searchTime}ms (${searchResults.length} results)`);

  // Test category filtering performance
  console.log('⏱️ Testing category filtering performance...');
  const filterStartTime = Date.now();

  const categoryResults = getSuppliersByCategory('Electronics');

  const filterEndTime = Date.now();
  const filterTime = filterEndTime - filterStartTime;

  console.log(
    `✅ Category filtering completed in ${filterTime}ms (${categoryResults.length} results)`
  );

  console.log('\n🎉 Performance test completed!');
};

/**
 * Generate sample report
 */
export const generateSampleReport = () => {
  console.log('📋 Generating Sample Business Report...\n');

  const suppliers = getAllSuppliers();
  const stats = getMarketplaceStats();

  if (!stats) {
    console.log('❌ No data available. Run population first.');
    return;
  }

  console.log('📊 BELL24H MARKETPLACE BUSINESS REPORT');
  console.log('=====================================');
  console.log(`📅 Generated: ${new Date().toLocaleDateString()}`);
  console.log(`📊 Total Suppliers: ${stats.totalSuppliers}`);
  console.log(`📂 Total Categories: ${stats.totalCategories}`);
  console.log(`📋 Total Subcategories: ${stats.totalSubcategories}\n`);

  console.log('🏭 SUPPLIER DISTRIBUTION BY TYPE:');
  Object.entries(stats.suppliersByType).forEach(([type, count]) => {
    const percentage = ((count / stats.totalSuppliers) * 100).toFixed(1);
    console.log(`  ${type}: ${count} (${percentage}%)`);
  });

  console.log('\n🌍 TOP MANUFACTURING STATES:');
  Object.entries(stats.suppliersByState)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .forEach(([state, count], index) => {
      console.log(`  ${index + 1}. ${state}: ${count} suppliers`);
    });

  console.log('\n🏆 TOP RATED SUPPLIERS:');
  stats.topRatedSuppliers.slice(0, 10).forEach((supplier, index) => {
    console.log(`  ${index + 1}. ${supplier.companyName}`);
    console.log(
      `     Rating: ${supplier.bellMantraRating}/10 | Location: ${supplier.address.city}`
    );
    console.log(`     Categories: ${supplier.categories.join(', ')}`);
  });

  console.log('\n📈 CATEGORY PERFORMANCE:');
  const categoryBreakdown = Object.entries(stats.suppliersByType);
  categoryBreakdown.forEach(([category, count]) => {
    console.log(`  ${category}: ${count} suppliers`);
  });

  console.log('\n✅ Business report generated successfully!');
};

// Export test functions
export default {
  runSupplierGenerationTests,
  runPerformanceTest,
  generateSampleReport,
};
