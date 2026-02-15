#!/usr/bin/env node

// MCP Page Analyzer - Identifies missing pages and provides recommendations
const fs = require('fs');
const path = require('path');

console.log('🔍 MCP Page Analyzer - Analyzing Bell24h Codebase...\n');

// Define expected pages for a complete B2B marketplace
const expectedPages = [
  // Core pages
  'home', 'about', 'contact', 'pricing', 'help', 'terms', 'privacy',
  
  // Authentication
  'login', 'register', 'forgot-password', 'reset-password',
  
  // Dashboard
  'dashboard', 'dashboard-analytics', 'dashboard-orders', 'dashboard-messages',
  
  // Suppliers
  'suppliers', 'suppliers-verified', 'suppliers-manufacturers', 
  'suppliers-exporters', 'suppliers-wholesalers', 'supplier-profile',
  
  // Products
  'products', 'products-search', 'products-categories', 'products-compare',
  'product-details', 'product-listing',
  
  // RFQ System
  'rfq', 'rfq-create', 'rfq-compare', 'rfq-history', 'rfq-details',
  
  // Voice RFQ
  'voice-rfq', 'voice-rfq-history', 'voice-rfq-settings',
  
  // Marketplace
  'marketplace', 'marketplace-categories', 'marketplace-suppliers',
  
  // User Management
  'profile', 'profile-settings', 'profile-company', 'profile-verification',
  
  // Billing & Payments
  'billing', 'billing-subscription', 'billing-payments', 'billing-history',
  
  // Support
  'support', 'support-tickets', 'support-faq', 'support-contact',
  
  // Admin
  'admin', 'admin-dashboard', 'admin-users', 'admin-analytics', 
  'admin-settings', 'admin-verification',
  
  // Messages & Notifications
  'messages', 'messages-inbox', 'messages-sent', 'notifications',
  
  // Reports & Analytics
  'reports', 'reports-sales', 'reports-suppliers', 'reports-buyers',
  
  // Integrations
  'integrations', 'integrations-api', 'integrations-webhooks',
  
  // Services
  'services', 'services-verification', 'services-logistics', 'services-payment',
  
  // Compliance
  'compliance', 'compliance-gst', 'compliance-tax', 'compliance-legal'
];

// Scan for existing pages
function scanExistingPages() {
  const appDir = path.join(process.cwd(), 'app');
  const existingPages = new Set();
  
  function scanDirectory(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (item === 'api' || item === 'globals.css' || item === 'layout.tsx') {
          continue; // Skip API routes and config files
        }
        
        const pageName = prefix ? `${prefix}-${item}` : item;
        existingPages.add(pageName);
        scanDirectory(fullPath, pageName);
      } else if (item === 'page.tsx') {
        const pageName = prefix || 'home';
        existingPages.add(pageName);
      }
    }
  }
  
  scanDirectory(appDir);
  return Array.from(existingPages);
}

// Analyze the codebase
function analyzeCodebase() {
  const existingPages = scanExistingPages();
  const missingPages = expectedPages.filter(page => !existingPages.includes(page));
  
  // Categorize pages
  const categories = {
    'Core Pages': ['home', 'about', 'contact', 'pricing', 'help', 'terms', 'privacy'],
    'Authentication': ['login', 'register', 'forgot-password', 'reset-password'],
    'Dashboard': ['dashboard', 'dashboard-analytics', 'dashboard-orders', 'dashboard-messages'],
    'Suppliers': ['suppliers', 'suppliers-verified', 'suppliers-manufacturers', 'suppliers-exporters', 'suppliers-wholesalers'],
    'Products': ['products', 'products-search', 'products-categories', 'products-compare'],
    'RFQ System': ['rfq', 'rfq-create', 'rfq-compare', 'rfq-history'],
    'Voice RFQ': ['voice-rfq', 'voice-rfq-history', 'voice-rfq-settings'],
    'Marketplace': ['marketplace', 'marketplace-categories', 'marketplace-suppliers'],
    'User Management': ['profile', 'profile-settings', 'profile-company'],
    'Billing': ['billing', 'billing-subscription', 'billing-payments'],
    'Support': ['support', 'support-tickets', 'support-faq'],
    'Admin': ['admin', 'admin-dashboard', 'admin-users', 'admin-analytics'],
    'Messages': ['messages', 'messages-inbox', 'messages-sent', 'notifications'],
    'Reports': ['reports', 'reports-sales', 'reports-suppliers'],
    'Integrations': ['integrations', 'integrations-api'],
    'Services': ['services', 'services-verification', 'services-logistics'],
    'Compliance': ['compliance', 'compliance-gst', 'compliance-tax']
  };
  
  // Count pages by category
  const categoryStats = {};
  for (const [category, pages] of Object.entries(categories)) {
    const existing = pages.filter(page => existingPages.includes(page));
    const missing = pages.filter(page => missingPages.includes(page));
    categoryStats[category] = { existing: existing.length, missing: missing.length, total: pages.length };
  }
  
  return {
    existingPages,
    missingPages,
    categoryStats,
    totalExpected: expectedPages.length,
    totalExisting: existingPages.length,
    totalMissing: missingPages.length,
    completionRate: Math.round((existingPages.length / expectedPages.length) * 100)
  };
}

// Generate recommendations
function generateRecommendations(analysis) {
  const recommendations = [];
  
  // High priority missing pages
  const highPriority = ['suppliers-verified', 'products-search', 'rfq-create', 'dashboard-analytics'];
  const missingHighPriority = highPriority.filter(page => analysis.missingPages.includes(page));
  
  if (missingHighPriority.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      title: 'Critical Missing Pages',
      description: `Missing ${missingHighPriority.length} high-priority pages: ${missingHighPriority.join(', ')}`,
      action: 'Generate these pages immediately for core functionality'
    });
  }
  
  // Category completion
  const lowCompletionCategories = Object.entries(analysis.categoryStats)
    .filter(([_, stats]) => stats.completionRate < 50)
    .map(([category, stats]) => ({ category, rate: stats.completionRate }));
  
  if (lowCompletionCategories.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      title: 'Incomplete Categories',
      description: `Categories with <50% completion: ${lowCompletionCategories.map(c => `${c.category} (${c.rate}%)`).join(', ')}`,
      action: 'Focus on completing these categories first'
    });
  }
  
  // Overall completion
  if (analysis.completionRate < 70) {
    recommendations.push({
      priority: 'LOW',
      title: 'Overall Completion',
      description: `Only ${analysis.completionRate}% of expected pages exist`,
      action: 'Use MCP generators to create remaining pages'
    });
  }
  
  return recommendations;
}

// Main analysis
function main() {
  const analysis = analyzeCodebase();
  const recommendations = generateRecommendations(analysis);
  
  console.log('📊 ANALYSIS RESULTS:');
  console.log('==================');
  console.log(`✅ Existing Pages: ${analysis.totalExisting}`);
  console.log(`❌ Missing Pages: ${analysis.totalMissing}`);
  console.log(`📈 Completion Rate: ${analysis.completionRate}%`);
  console.log(`🎯 Total Expected: ${analysis.totalExpected}`);
  
  console.log('\n📋 MISSING PAGES BY CATEGORY:');
  console.log('==============================');
  for (const [category, stats] of Object.entries(analysis.categoryStats)) {
    if (stats.missing > 0) {
      console.log(`${category}: ${stats.existing}/${stats.total} (${Math.round((stats.existing/stats.total)*100)}% complete)`);
    }
  }
  
  console.log('\n🔍 MISSING PAGES LIST:');
  console.log('======================');
  analysis.missingPages.forEach((page, index) => {
    console.log(`${index + 1}. ${page}`);
  });
  
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('===================');
  recommendations.forEach((rec, index) => {
    console.log(`\n${index + 1}. [${rec.priority}] ${rec.title}`);
    console.log(`   ${rec.description}`);
    console.log(`   Action: ${rec.action}`);
  });
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('==============');
  console.log('1. Run: node mcp-working-generator.js b2b');
  console.log('2. Generate specific pages: node mcp-working-generator.js page [page-name]');
  console.log('3. Generate multiple pages: node mcp-working-generator.js multiple [page1] [page2] [page3]');
  
  console.log('\n✅ Analysis complete! Use the MCP generators to create missing pages.');
}

// Run the analysis
main();
