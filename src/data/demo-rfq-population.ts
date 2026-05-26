// Bell24h Demo RFQ Population Script
// Populates the platform with comprehensive realistic RFQs

import {
  generateAllRFQs,
  generateQuickRFQs,
  GENERATE_COMPREHENSIVE_RFQS,
  RFQ,
  ALL_CATEGORIES_WITH_SUBCATEGORIES,
} from './rfq-generator';

// Demo RFQ Database
export let DEMO_RFQ_DATABASE: RFQ[] = [];

// Initialize with quick demo RFQs (for immediate testing)
export const initializeQuickDemo = () => {
  console.log('🚀 Initializing Quick Demo RFQs...');
  DEMO_RFQ_DATABASE = generateQuickRFQs(100); // Generate 100 quick RFQs
  console.log(`✅ Generated ${DEMO_RFQ_DATABASE.length} demo RFQs`);
  return DEMO_RFQ_DATABASE;
};

// Generate comprehensive RFQs for all categories
export const initializeComprehensiveDemo = () => {
  console.log('🚀 Initializing Comprehensive Demo RFQs...');
  const startTime = Date.now();

  DEMO_RFQ_DATABASE = generateAllRFQs(3); // 3 RFQs per subcategory

  const endTime = Date.now();
  const totalSubcategories = ALL_CATEGORIES_WITH_SUBCATEGORIES.reduce(
    (sum, cat) => sum + cat.subcategories.length,
    0
  );

  console.log(`✅ Generated ${DEMO_RFQ_DATABASE.length} comprehensive RFQs`);
  console.log(
    `📊 Coverage: ${ALL_CATEGORIES_WITH_SUBCATEGORIES.length} categories, ${totalSubcategories} subcategories`
  );
  console.log(`⏱️ Generation time: ${endTime - startTime}ms`);

  return DEMO_RFQ_DATABASE;
};

// Get RFQs by category
export const getRFQsByCategory = (category: string): RFQ[] => {
  return DEMO_RFQ_DATABASE.filter(rfq => rfq.category === category);
};

// Get RFQs by subcategory
export const getRFQsBySubcategory = (category: string, subcategory: string): RFQ[] => {
  return DEMO_RFQ_DATABASE.filter(
    rfq => rfq.category === category && rfq.subcategory === subcategory
  );
};

// Get recent RFQs (last 30 days)
export const getRecentRFQs = (limit: number = 20): RFQ[] => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return DEMO_RFQ_DATABASE.filter(rfq => new Date(rfq.created_date) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
    .slice(0, limit);
};

// Get high-value RFQs (for homepage showcase)
export const getHighValueRFQs = (limit: number = 10): RFQ[] => {
  return DEMO_RFQ_DATABASE.filter(rfq => rfq.urgency === 'High' && rfq.status === 'Active')
    .sort((a, b) => {
      // Sort by budget value (extract number from budget string)
      const budgetA = parseInt(a.budget.replace(/[^\d]/g, ''));
      const budgetB = parseInt(b.budget.replace(/[^\d]/g, ''));
      return budgetB - budgetA;
    })
    .slice(0, limit);
};

// Get RFQs by business type
export const getRFQsByBusinessType = (businessType: string): RFQ[] => {
  return DEMO_RFQ_DATABASE.filter(rfq => rfq.business_type === businessType);
};

// Search RFQs by keyword
export const searchRFQs = (keyword: string): RFQ[] => {
  const lowerKeyword = keyword.toLowerCase();
  return DEMO_RFQ_DATABASE.filter(
    rfq =>
      rfq.title.toLowerCase().includes(lowerKeyword) ||
      rfq.description.toLowerCase().includes(lowerKeyword) ||
      rfq.category.toLowerCase().includes(lowerKeyword) ||
      rfq.subcategory.toLowerCase().includes(lowerKeyword) ||
      rfq.tags.some(tag => tag.includes(lowerKeyword))
  );
};

// Get RFQ statistics
export const getRFQStatistics = () => {
  const stats = {
    total: DEMO_RFQ_DATABASE.length,
    active: DEMO_RFQ_DATABASE.filter(rfq => rfq.status === 'Active').length,
    high_urgency: DEMO_RFQ_DATABASE.filter(rfq => rfq.urgency === 'High').length,
    categories: [...new Set(DEMO_RFQ_DATABASE.map(rfq => rfq.category))].length,
    subcategories: [...new Set(DEMO_RFQ_DATABASE.map(rfq => rfq.subcategory))].length,
    business_types: [...new Set(DEMO_RFQ_DATABASE.map(rfq => rfq.business_type))].length,
    locations: [...new Set(DEMO_RFQ_DATABASE.map(rfq => rfq.location))].length,
    total_budget_value: calculateTotalBudgetValue(),
    average_budget: calculateAverageBudget(),
    recent_rfqs: getRecentRFQs(10).length,
  };

  return stats;
};

// Calculate total budget value from all RFQs
const calculateTotalBudgetValue = (): string => {
  let totalLakhs = 0;

  DEMO_RFQ_DATABASE.forEach(rfq => {
    const budgetStr = rfq.budget.toLowerCase();
    if (budgetStr.includes('crore') || budgetStr.includes('cr')) {
      const croreValue = parseInt(budgetStr.replace(/[^\d]/g, ''));
      totalLakhs += croreValue * 100; // Convert crore to lakhs
    } else if (budgetStr.includes('lakh') || budgetStr.includes('l')) {
      const lakhValue = parseInt(budgetStr.replace(/[^\d]/g, ''));
      totalLakhs += lakhValue;
    }
  });

  if (totalLakhs >= 100) {
    return `₹${(totalLakhs / 100).toFixed(1)} Crore`;
  } else {
    return `₹${totalLakhs} Lakh`;
  }
};

// Calculate average budget
const calculateAverageBudget = (): string => {
  const totalBudgets = DEMO_RFQ_DATABASE.length;
  if (totalBudgets === 0) return '₹0';

  let totalLakhs = 0;
  let validBudgets = 0;

  DEMO_RFQ_DATABASE.forEach(rfq => {
    const budgetStr = rfq.budget.toLowerCase();
    if (budgetStr.includes('crore') || budgetStr.includes('cr')) {
      const croreValue = parseInt(budgetStr.replace(/[^\d]/g, ''));
      totalLakhs += croreValue * 100;
      validBudgets++;
    } else if (budgetStr.includes('lakh') || budgetStr.includes('l')) {
      const lakhValue = parseInt(budgetStr.replace(/[^\d]/g, ''));
      totalLakhs += lakhValue;
      validBudgets++;
    }
  });

  if (validBudgets === 0) return '₹0';

  const averageLakhs = totalLakhs / validBudgets;
  if (averageLakhs >= 100) {
    return `₹${(averageLakhs / 100).toFixed(1)} Crore`;
  } else {
    return `₹${averageLakhs.toFixed(1)} Lakh`;
  }
};

// Sample RFQs for each major category (for immediate showcase)
export const getSampleRFQsByCategory = () => {
  const sampleCategories = [
    'Agriculture',
    'Electronics & Electrical',
    'Automobile',
    'Chemical',
    'Industrial Machinery',
    'Textiles, Yarn & Fabrics',
    'Food Products & Beverage',
    'Real Estate & Construction',
    'Packaging & Paper',
    'Business Services',
  ];

  const samples: Record<string, RFQ[]> = {};

  sampleCategories.forEach(category => {
    samples[category] = getRFQsByCategory(category).slice(0, 5); // 5 samples per category
  });

  return samples;
};

// Export functions for immediate use
export const POPULATE_DEMO_DATABASE = {
  quick: initializeQuickDemo,
  comprehensive: initializeComprehensiveDemo,
  getRFQs: () => DEMO_RFQ_DATABASE,
  getByCategory: getRFQsByCategory,
  getBySubcategory: getRFQsBySubcategory,
  getRecent: getRecentRFQs,
  getHighValue: getHighValueRFQs,
  search: searchRFQs,
  getStats: getRFQStatistics,
  getSamples: getSampleRFQsByCategory,
};

// Auto-initialize with quick demo (for immediate testing)
initializeQuickDemo();

// Function to showcase platform capabilities
export const showcasePlatformRFQs = () => {
  console.log('🎯 BELL24H PLATFORM SHOWCASE');
  console.log('============================');

  const stats = getRFQStatistics();
  console.log(`📊 Total RFQs: ${stats.total}`);
  console.log(`🔥 Active RFQs: ${stats.active}`);
  console.log(`⚡ High Priority: ${stats.high_urgency}`);
  console.log(`🏢 Categories: ${stats.categories}`);
  console.log(`📋 Subcategories: ${stats.subcategories}`);
  console.log(`💼 Business Types: ${stats.business_types}`);
  console.log(`🌍 Locations: ${stats.locations}`);
  console.log(`💰 Total Budget: ${stats.total_budget_value}`);
  console.log(`📈 Average Budget: ${stats.average_budget}`);

  console.log('\n🔥 HIGH VALUE RFQs:');
  getHighValueRFQs(5).forEach((rfq, index) => {
    console.log(`${index + 1}. ${rfq.title} - ${rfq.budget} (${rfq.location})`);
  });

  console.log('\n📈 RECENT ACTIVITY:');
  getRecentRFQs(5).forEach((rfq, index) => {
    console.log(`${index + 1}. ${rfq.title} - ${rfq.created_date} (${rfq.urgency})`);
  });

  console.log('\n🎯 PLATFORM READY FOR BUSINESS! 🚀');
};

// Initialize and showcase
showcasePlatformRFQs();
