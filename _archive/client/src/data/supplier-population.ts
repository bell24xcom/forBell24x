/**
 * Bell24H Supplier Population System
 *
 * Populates the marketplace with comprehensive supplier data
 * Generates 2,000+ realistic suppliers across all 50 categories
 */

import {
  SupplierProfile,
  generateAllSuppliers,
  generateDemoSuppliers,
  generateSuppliersForCategory,
} from './supplier-generator';
import { ALL_CATEGORIES } from './categories';

// Store for generated suppliers
let generatedSuppliers: SupplierProfile[] = [];
let suppliersByCategory: Record<string, SupplierProfile[]> = {};
let isPopulated = false;

// Population statistics
interface PopulationStats {
  totalSuppliers: number;
  totalCategories: number;
  totalSubcategories: number;
  averageSuppliersPerCategory: number;
  suppliersByType: Record<string, number>;
  suppliersByState: Record<string, number>;
  topRatedSuppliers: SupplierProfile[];
  populationTime: number;
}

/**
 * Populate marketplace with all suppliers
 */
export const populateAllSuppliers = (): PopulationStats => {
  console.log('🚀 Starting Bell24H supplier population...');
  const startTime = Date.now();

  // Generate all suppliers
  generatedSuppliers = generateAllSuppliers();

  // Organize by category
  suppliersByCategory = {};
  ALL_CATEGORIES.forEach(category => {
    suppliersByCategory[category.name] = generatedSuppliers.filter(supplier =>
      supplier.categories.includes(category.name)
    );
  });

  isPopulated = true;
  const endTime = Date.now();
  const populationTime = endTime - startTime;

  // Calculate statistics
  const stats = calculatePopulationStats(populationTime);

  console.log('✅ Supplier population completed!');
  console.log(
    `📊 Generated ${stats.totalSuppliers} suppliers across ${stats.totalCategories} categories`
  );
  console.log(`⏱️ Population time: ${populationTime}ms`);

  return stats;
};

/**
 * Populate marketplace with demo suppliers (first 5 categories)
 */
export const populateDemoSuppliers = (): PopulationStats => {
  console.log('🚀 Starting Bell24H demo supplier population...');
  const startTime = Date.now();

  // Generate demo suppliers
  generatedSuppliers = generateDemoSuppliers();

  // Organize by category
  suppliersByCategory = {};
  ALL_CATEGORIES.slice(0, 5).forEach(category => {
    suppliersByCategory[category.name] = generatedSuppliers.filter(supplier =>
      supplier.categories.includes(category.name)
    );
  });

  isPopulated = true;
  const endTime = Date.now();
  const populationTime = endTime - startTime;

  // Calculate statistics
  const stats = calculatePopulationStats(populationTime);

  console.log('✅ Demo supplier population completed!');
  console.log(
    `📊 Generated ${stats.totalSuppliers} suppliers across ${stats.totalCategories} categories`
  );
  console.log(`⏱️ Population time: ${populationTime}ms`);

  return stats;
};

/**
 * Calculate population statistics
 */
const calculatePopulationStats = (populationTime: number): PopulationStats => {
  const suppliersByType: Record<string, number> = {};
  const suppliersByState: Record<string, number> = {};

  generatedSuppliers.forEach(supplier => {
    // Count by type
    suppliersByType[supplier.companyType] = (suppliersByType[supplier.companyType] || 0) + 1;

    // Count by state
    suppliersByState[supplier.address.state] = (suppliersByState[supplier.address.state] || 0) + 1;
  });

  // Get top-rated suppliers
  const topRatedSuppliers = generatedSuppliers
    .sort((a, b) => b.bellMantraRating - a.bellMantraRating)
    .slice(0, 10);

  const activeCategories = Object.keys(suppliersByCategory).length;
  const totalSubcategories = generatedSuppliers.reduce(
    (sum, supplier) => sum + supplier.subcategories.length,
    0
  );

  return {
    totalSuppliers: generatedSuppliers.length,
    totalCategories: activeCategories,
    totalSubcategories,
    averageSuppliersPerCategory: Math.round(generatedSuppliers.length / activeCategories),
    suppliersByType,
    suppliersByState,
    topRatedSuppliers,
    populationTime,
  };
};

/**
 * Get all suppliers
 */
export const getAllSuppliers = (): SupplierProfile[] => {
  if (!isPopulated) {
    console.warn('⚠️  Suppliers not populated yet. Run populateAllSuppliers() first.');
    return [];
  }
  return generatedSuppliers;
};

/**
 * Get suppliers by category
 */
export const getSuppliersByCategory = (categoryName: string): SupplierProfile[] => {
  if (!isPopulated) {
    console.warn('⚠️  Suppliers not populated yet. Run populateAllSuppliers() first.');
    return [];
  }
  return suppliersByCategory[categoryName] || [];
};

/**
 * Get suppliers by subcategory
 */
export const getSuppliersBySubcategory = (subcategoryName: string): SupplierProfile[] => {
  if (!isPopulated) {
    console.warn('⚠️  Suppliers not populated yet. Run populateAllSuppliers() first.');
    return [];
  }
  return generatedSuppliers.filter(supplier => supplier.subcategories.includes(subcategoryName));
};

/**
 * Get suppliers by location
 */
export const getSuppliersByLocation = (state: string, city?: string): SupplierProfile[] => {
  if (!isPopulated) {
    console.warn('⚠️  Suppliers not populated yet. Run populateAllSuppliers() first.');
    return [];
  }

  return generatedSuppliers.filter(supplier => {
    const matchesState = supplier.address.state === state;
    const matchesCity = city ? supplier.address.city === city : true;
    return matchesState && matchesCity;
  });
};

/**
 * Get suppliers by company type
 */
export const getSuppliersByType = (companyType: string): SupplierProfile[] => {
  if (!isPopulated) {
    console.warn('⚠️  Suppliers not populated yet. Run populateAllSuppliers() first.');
    return [];
  }
  return generatedSuppliers.filter(supplier => supplier.companyType === companyType);
};

/**
 * Get top-rated suppliers
 */
export const getTopRatedSuppliers = (limit: number = 10): SupplierProfile[] => {
  if (!isPopulated) {
    console.warn('⚠️  Suppliers not populated yet. Run populateAllSuppliers() first.');
    return [];
  }

  return generatedSuppliers.sort((a, b) => b.bellMantraRating - a.bellMantraRating).slice(0, limit);
};

/**
 * Get suppliers by turnover range
 */
export const getSuppliersByTurnover = (
  minTurnover: string,
  maxTurnover: string
): SupplierProfile[] => {
  if (!isPopulated) {
    console.warn('⚠️  Suppliers not populated yet. Run populateAllSuppliers() first.');
    return [];
  }

  // Simple turnover filtering (can be enhanced with proper parsing)
  return generatedSuppliers.filter(supplier => {
    const turnover = supplier.annualTurnover;
    // Basic filtering logic - can be enhanced
    return turnover.includes('Crore') || turnover.includes('Lakh');
  });
};

/**
 * Search suppliers by name or keywords
 */
export const searchSuppliers = (query: string): SupplierProfile[] => {
  if (!isPopulated) {
    console.warn('⚠️  Suppliers not populated yet. Run populateAllSuppliers() first.');
    return [];
  }

  const lowerQuery = query.toLowerCase();

  return generatedSuppliers.filter(
    supplier =>
      supplier.companyName.toLowerCase().includes(lowerQuery) ||
      supplier.specialization.some(spec => spec.toLowerCase().includes(lowerQuery)) ||
      supplier.productRange.some(product => product.toLowerCase().includes(lowerQuery)) ||
      supplier.categories.some(cat => cat.toLowerCase().includes(lowerQuery)) ||
      supplier.subcategories.some(sub => sub.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get supplier by ID
 */
export const getSupplierById = (companyId: string): SupplierProfile | undefined => {
  if (!isPopulated) {
    console.warn('⚠️  Suppliers not populated yet. Run populateAllSuppliers() first.');
    return undefined;
  }
  return generatedSuppliers.find(supplier => supplier.companyId === companyId);
};

/**
 * Get marketplace statistics
 */
export const getMarketplaceStats = (): PopulationStats | null => {
  if (!isPopulated) {
    console.warn('⚠️  Suppliers not populated yet. Run populateAllSuppliers() first.');
    return null;
  }

  return calculatePopulationStats(0);
};

/**
 * Generate category-specific suppliers on demand
 */
export const generateCategorySuppliers = (categoryName: string): SupplierProfile[] => {
  console.log(`🔄 Generating suppliers for category: ${categoryName}`);

  const categorySuppliers = generateSuppliersForCategory(categoryName);

  // Add to existing suppliers if populated
  if (isPopulated) {
    generatedSuppliers.push(...categorySuppliers);
    suppliersByCategory[categoryName] = categorySuppliers;
  }

  console.log(`✅ Generated ${categorySuppliers.length} suppliers for ${categoryName}`);
  return categorySuppliers;
};

/**
 * Export suppliers to JSON format
 */
export const exportSuppliersToJSON = (): string => {
  if (!isPopulated) {
    console.warn('⚠️  Suppliers not populated yet. Run populateAllSuppliers() first.');
    return '[]';
  }

  const exportData = {
    metadata: {
      totalSuppliers: generatedSuppliers.length,
      exportDate: new Date().toISOString(),
      version: '1.0',
    },
    suppliers: generatedSuppliers,
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Get category breakdown
 */
export const getCategoryBreakdown = (): Record<string, number> => {
  if (!isPopulated) {
    console.warn('⚠️  Suppliers not populated yet. Run populateAllSuppliers() first.');
    return {};
  }

  const breakdown: Record<string, number> = {};

  Object.keys(suppliersByCategory).forEach(category => {
    breakdown[category] = suppliersByCategory[category].length;
  });

  return breakdown;
};

/**
 * Generate random featured suppliers
 */
export const getFeaturedSuppliers = (count: number = 6): SupplierProfile[] => {
  if (!isPopulated) {
    console.warn('⚠️  Suppliers not populated yet. Run populateAllSuppliers() first.');
    return [];
  }

  // Get high-rated suppliers and randomize selection
  const highRatedSuppliers = generatedSuppliers.filter(
    supplier => supplier.bellMantraRating >= 8.0
  );

  const shuffled = [...highRatedSuppliers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

/**
 * Get suppliers with specific certifications
 */
export const getSuppliersByCertification = (certification: string): SupplierProfile[] => {
  if (!isPopulated) {
    console.warn('⚠️  Suppliers not populated yet. Run populateAllSuppliers() first.');
    return [];
  }

  return generatedSuppliers.filter(supplier => supplier.certifications.includes(certification));
};

/**
 * Get suppliers that export to specific countries
 */
export const getSuppliersByExportCountry = (country: string): SupplierProfile[] => {
  if (!isPopulated) {
    console.warn('⚠️  Suppliers not populated yet. Run populateAllSuppliers() first.');
    return [];
  }

  return generatedSuppliers.filter(supplier => supplier.exportCountries.includes(country));
};

// Export all functions and data
export { generatedSuppliers, suppliersByCategory, isPopulated };

// Default export for easy access
export default {
  populateAllSuppliers,
  populateDemoSuppliers,
  getAllSuppliers,
  getSuppliersByCategory,
  getSuppliersBySubcategory,
  getSuppliersByLocation,
  getSuppliersByType,
  getTopRatedSuppliers,
  searchSuppliers,
  getSupplierById,
  getMarketplaceStats,
  generateCategorySuppliers,
  exportSuppliersToJSON,
  getCategoryBreakdown,
  getFeaturedSuppliers,
  getSuppliersByCertification,
  getSuppliersByExportCountry,
};
