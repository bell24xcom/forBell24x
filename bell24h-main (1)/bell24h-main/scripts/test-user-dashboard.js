#!/usr/bin/env node

/**
 * Bell24H User Dashboard Testing Script
 * 
 * This script tests the user dashboard functionality for different user types,
 * subscription levels, and role combinations (buyer/supplier).
 */

import axios from 'axios';

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_USERS = {
  freeBuyer: { email: 'buyer@test.com', password: 'test123' },
  proBuyer: { email: 'pro.buyer@test.com', password: 'test123' },
  enterpriseBuyer: { email: 'enterprise.buyer@test.com', password: 'test123' },
  freeSupplier: { email: 'supplier@test.com', password: 'test123' },
  proSupplier: { email: 'pro.supplier@test.com', password: 'test123' },
  enterpriseSupplier: { email: 'enterprise.supplier@test.com', password: 'test123' },
  dualRole: { email: 'dual@test.com', password: 'test123' }, // Both buyer and supplier
  admin: { email: 'admin@bell24h.com', password: 'admin123' }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  header: (msg) => console.log(`\n🔍 ${msg}`),
  section: (msg) => console.log(`\n📋 ${msg}`)
};

let authTokens = {};

// Test runner
async function runTest(testName, testFunction) {
  testResults.total++;
  try {
    await testFunction();
    testResults.passed++;
    log.success(`${testName} - PASSED`);
    testResults.details.push({ name: testName, status: 'PASSED' });
  } catch (error) {
    testResults.failed++;
    log.error(`${testName} - FAILED: ${error.message}`);
    testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
  }
}

// Authentication Tests
async function testAuthentication() {
  log.header('Testing User Authentication');
  
  for (const [userType, credentials] of Object.entries(TEST_USERS)) {
    await runTest(`${userType} Login`, async () => {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, credentials);
      
      if (!response.data.token) {
        throw new Error('No token received');
      }
      
      authTokens[userType] = response.data.token;
      log.info(`${userType} token received: ${authTokens[userType].substring(0, 20)}...`);
    });

    await runTest(`${userType} Profile Access`, async () => {
      const response = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authTokens[userType]}` }
      });
      
      if (!response.data.id || !response.data.email) {
        throw new Error('Invalid user profile data');
      }
      
      log.info(`${userType} profile: ${response.data.email} (${response.data.role})`);
    });
  }
}

// Dashboard Access Tests
async function testDashboardAccess() {
  log.header('Testing Dashboard Access');
  
  for (const [userType, token] of Object.entries(authTokens)) {
    await runTest(`${userType} Dashboard Access`, async () => {
      const response = await axios.get(`${BASE_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data || !response.data.user) {
        throw new Error('Dashboard data not accessible');
      }
      
      log.info(`${userType} dashboard loaded successfully`);
    });
  }
}

// Subscription-Based Feature Tests
async function testSubscriptionFeatures() {
  log.header('Testing Subscription-Based Features');
  
  // Test Free Plan Features
  await runTest('Free Plan - Basic RFQ Access', async () => {
    const response = await axios.get(`${BASE_URL}/api/rfqs?limit=5`, {
      headers: { Authorization: `Bearer ${authTokens.freeBuyer}` }
    });
    
    if (!response.data.rfqs || response.data.rfqs.length === 0) {
      throw new Error('Free users should have access to basic RFQ listing');
    }
  });

  await runTest('Free Plan - Limited Analytics', async () => {
    const response = await axios.get(`${BASE_URL}/api/analytics/basic`, {
      headers: { Authorization: `Bearer ${authTokens.freeBuyer}` }
    });
    
    if (!response.data || !response.data.basicMetrics) {
      throw new Error('Free users should have access to basic analytics');
    }
  });

  // Test Pro Plan Features
  await runTest('Pro Plan - Advanced Analytics', async () => {
    const response = await axios.get(`${BASE_URL}/api/analytics/advanced`, {
      headers: { Authorization: `Bearer ${authTokens.proBuyer}` }
    });
    
    if (!response.data || !response.data.advancedMetrics) {
      throw new Error('Pro users should have access to advanced analytics');
    }
  });

  await runTest('Pro Plan - AI Explainability', async () => {
    const response = await axios.get(`${BASE_URL}/api/ai/explanations`, {
      headers: { Authorization: `Bearer ${authTokens.proBuyer}` }
    });
    
    if (!response.data || !response.data.explanations) {
      throw new Error('Pro users should have access to AI explanations');
    }
  });

  // Test Enterprise Plan Features
  await runTest('Enterprise Plan - Custom AI Models', async () => {
    const response = await axios.get(`${BASE_URL}/api/ai/custom-models`, {
      headers: { Authorization: `Bearer ${authTokens.enterpriseBuyer}` }
    });
    
    if (!response.data || !response.data.customModels) {
      throw new Error('Enterprise users should have access to custom AI models');
    }
  });

  await runTest('Enterprise Plan - API Access', async () => {
    const response = await axios.get(`${BASE_URL}/api/enterprise/api-keys`, {
      headers: { Authorization: `Bearer ${authTokens.enterpriseBuyer}` }
    });
    
    if (!response.data || !response.data.apiKeys) {
      throw new Error('Enterprise users should have API access');
    }
  });
}

// Role-Based Feature Tests
async function testRoleBasedFeatures() {
  log.header('Testing Role-Based Features');
  
  // Buyer Features
  await runTest('Buyer - RFQ Creation', async () => {
    const response = await axios.post(`${BASE_URL}/api/rfqs`, {
      title: 'Test RFQ',
      description: 'Test description',
      category: 'Electronics',
      budget: 10000
    }, {
      headers: { Authorization: `Bearer ${authTokens.freeBuyer}` }
    });
    
    if (!response.data || !response.data.id) {
      throw new Error('Buyers should be able to create RFQs');
    }
  });

  await runTest('Buyer - Supplier Search', async () => {
    const response = await axios.get(`${BASE_URL}/api/suppliers/search?q=electronics`, {
      headers: { Authorization: `Bearer ${authTokens.freeBuyer}` }
    });
    
    if (!response.data || !response.data.suppliers) {
      throw new Error('Buyers should be able to search suppliers');
    }
  });

  // Supplier Features
  await runTest('Supplier - Bid Submission', async () => {
    const response = await axios.post(`${BASE_URL}/api/bids`, {
      rfqId: 'test-rfq-id',
      amount: 9500,
      description: 'Test bid'
    }, {
      headers: { Authorization: `Bearer ${authTokens.freeSupplier}` }
    });
    
    if (!response.data || !response.data.id) {
      throw new Error('Suppliers should be able to submit bids');
    }
  });

  await runTest('Supplier - Product Showcase', async () => {
    const response = await axios.get(`${BASE_URL}/api/supplier/products`, {
      headers: { Authorization: `Bearer ${authTokens.freeSupplier}` }
    });
    
    if (!response.data || !response.data.products) {
      throw new Error('Suppliers should have product showcase access');
    }
  });

  // Dual Role Features
  await runTest('Dual Role - Buyer Features', async () => {
    const response = await axios.get(`${BASE_URL}/api/dashboard/buyer`, {
      headers: { Authorization: `Bearer ${authTokens.dualRole}` }
    });
    
    if (!response.data || !response.data.buyerMetrics) {
      throw new Error('Dual role users should have buyer dashboard access');
    }
  });

  await runTest('Dual Role - Supplier Features', async () => {
    const response = await axios.get(`${BASE_URL}/api/dashboard/supplier`, {
      headers: { Authorization: `Bearer ${authTokens.dualRole}` }
    });
    
    if (!response.data || !response.data.supplierMetrics) {
      throw new Error('Dual role users should have supplier dashboard access');
    }
  });
}

// Dashboard Component Tests
async function testDashboardComponents() {
  log.header('Testing Dashboard Components');
  
  const components = [
    'overview',
    'analytics',
    'rfqs',
    'bids',
    'transactions',
    'notifications',
    'settings'
  ];

  for (const component of components) {
    for (const [userType, token] of Object.entries(authTokens)) {
      await runTest(`${userType} - ${component} Component`, async () => {
        const response = await axios.get(`${BASE_URL}/api/dashboard/${component}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.data) {
          throw new Error(`${component} component not accessible for ${userType}`);
        }
        
        log.info(`${userType} - ${component} component loaded`);
      });
    }
  }
}

// Subscription Upgrade/Downgrade Tests
async function testSubscriptionChanges() {
  log.header('Testing Subscription Changes');
  
  await runTest('Upgrade to Pro Plan', async () => {
    const response = await axios.post(`${BASE_URL}/api/subscription/upgrade`, {
      plan: 'pro',
      paymentMethod: 'card'
    }, {
      headers: { Authorization: `Bearer ${authTokens.freeBuyer}` }
    });
    
    if (!response.data || !response.data.subscription) {
      throw new Error('Subscription upgrade failed');
    }
  });

  await runTest('Downgrade to Free Plan', async () => {
    const response = await axios.post(`${BASE_URL}/api/subscription/downgrade`, {
      plan: 'free'
    }, {
      headers: { Authorization: `Bearer ${authTokens.proBuyer}` }
    });
    
    if (!response.data || !response.data.subscription) {
      throw new Error('Subscription downgrade failed');
    }
  });
}

// Feature Access Control Tests
async function testFeatureAccessControl() {
  log.header('Testing Feature Access Control');
  
  // Test that free users cannot access premium features
  await runTest('Free User - Premium Feature Blocked', async () => {
    try {
      await axios.get(`${BASE_URL}/api/ai/custom-models`, {
        headers: { Authorization: `Bearer ${authTokens.freeBuyer}` }
      });
      throw new Error('Free users should not have access to premium features');
    } catch (error) {
      if (error.response?.status === 403) {
        log.info('Free user correctly blocked from premium features');
      } else {
        throw error;
      }
    }
  });

  // Test that suppliers cannot access buyer-only features
  await runTest('Supplier - Buyer Feature Blocked', async () => {
    try {
      await axios.post(`${BASE_URL}/api/rfqs`, {
        title: 'Test RFQ',
        description: 'Test description'
      }, {
        headers: { Authorization: `Bearer ${authTokens.freeSupplier}` }
      });
      throw new Error('Suppliers should not be able to create RFQs');
    } catch (error) {
      if (error.response?.status === 403) {
        log.info('Supplier correctly blocked from buyer features');
      } else {
        throw error;
      }
    }
  });
}

// Performance Tests
async function testDashboardPerformance() {
  log.header('Testing Dashboard Performance');
  
  for (const [userType, token] of Object.entries(authTokens)) {
    await runTest(`${userType} Dashboard Response Time`, async () => {
      const startTime = Date.now();
      await axios.get(`${BASE_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const responseTime = Date.now() - startTime;
      
      if (responseTime > 3000) {
        throw new Error(`Dashboard response too slow: ${responseTime}ms`);
      }
      
      log.info(`${userType} dashboard response time: ${responseTime}ms`);
    });
  }
}

// Mobile Responsiveness Tests
async function testMobileResponsiveness() {
  log.header('Testing Mobile Responsiveness');
  
  const mobileUserAgents = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0'
  ];

  for (const userAgent of mobileUserAgents) {
    await runTest(`Mobile Dashboard - ${userAgent.includes('iPhone') ? 'iOS' : 'Android'}`, async () => {
      const response = await axios.get(`${BASE_URL}/api/dashboard`, {
        headers: { 
          Authorization: `Bearer ${authTokens.freeBuyer}`,
          'User-Agent': userAgent
        }
      });
      
      if (!response.data || !response.data.mobileOptimized) {
        throw new Error('Dashboard should be mobile optimized');
      }
      
      log.info(`Mobile dashboard works for ${userAgent.includes('iPhone') ? 'iOS' : 'Android'}`);
    });
  }
}

// Main test runner
async function runAllTests() {
  log.header('🚀 Starting Bell24H User Dashboard Tests');
  log.info(`Base URL: ${BASE_URL}`);
  log.info(`Testing ${Object.keys(TEST_USERS).length} user types`);
  
  try {
    await testAuthentication();
    await testDashboardAccess();
    await testSubscriptionFeatures();
    await testRoleBasedFeatures();
    await testDashboardComponents();
    await testSubscriptionChanges();
    await testFeatureAccessControl();
    await testDashboardPerformance();
    await testMobileResponsiveness();
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
  }

  // Print results
  log.header('📊 Test Results Summary');
  log.info(`Total Tests: ${testResults.total}`);
  log.success(`Passed: ${testResults.passed}`);
  log.error(`Failed: ${testResults.failed}`);
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  log.info(`Success Rate: ${successRate}%`);
  
  if (testResults.failed > 0) {
    log.warning('\nFailed Tests:');
    testResults.details
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        log.error(`  - ${test.name}: ${test.error}`);
      });
  }
  
  if (testResults.passed === testResults.total) {
    log.success('\n🎉 All user dashboard tests passed! System is ready for production.');
  } else {
    log.warning('\n⚠️  Some tests failed. Please review and fix issues before production.');
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests, testResults }; 