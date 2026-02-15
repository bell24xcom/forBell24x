#!/usr/bin/env node

/**
 * Bell24H Admin System Testing Script
 * 
 * This script tests all admin functionality to ensure the system is ready for production.
 * Run this script after setting up the admin system to verify everything works correctly.
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bell24h.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

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

let authToken = null;

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
  log.header('Testing Authentication System');
  
  await runTest('Admin Login', async () => {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (!response.data.token) {
      throw new Error('No token received');
    }
    
    authToken = response.data.token;
    log.info(`Token received: ${authToken.substring(0, 20)}...`);
  });

  await runTest('Token Validation', async () => {
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.role !== 'admin') {
      throw new Error('User is not an admin');
    }
  });
}

// Dashboard Tests
async function testDashboard() {
  log.header('Testing Dashboard Endpoints');
  
  await runTest('Dashboard Metrics', async () => {
    const response = await axios.get(`${BASE_URL}/api/admin/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const requiredFields = ['totalUsers', 'totalRFQs', 'revenue', 'systemHealth'];
    for (const field of requiredFields) {
      if (response.data[field] === undefined) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  });
}

// Analytics Tests
async function testAnalytics() {
  log.header('Testing Analytics System');
  
  await runTest('Analytics Data', async () => {
    const response = await axios.get(`${BASE_URL}/api/admin/analytics?timeRange=30d`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const requiredSections = ['userEngagement', 'businessMetrics', 'performanceMetrics'];
    for (const section of requiredSections) {
      if (!response.data[section]) {
        throw new Error(`Missing analytics section: ${section}`);
      }
    }
  });
}

// Monitoring Tests
async function testMonitoring() {
  log.header('Testing System Monitoring');
  
  await runTest('System Health', async () => {
    const response = await axios.get(`${BASE_URL}/api/admin/monitoring/health`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.status || !response.data.metrics) {
      throw new Error('Invalid health response structure');
    }
    
    log.info(`System Status: ${response.data.status}`);
    log.info(`CPU Usage: ${response.data.metrics.cpuUsage}%`);
    log.info(`Memory Usage: ${response.data.metrics.memoryUsage}%`);
  });
}

// RFQ Management Tests
async function testRFQManagement() {
  log.header('Testing RFQ Management');
  
  await runTest('RFQ List', async () => {
    const response = await axios.get(`${BASE_URL}/api/admin/rfqs?page=1&pageSize=10`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.rfqs || !Array.isArray(response.data.rfqs)) {
      throw new Error('Invalid RFQ response structure');
    }
  });

  await runTest('RFQ Statistics', async () => {
    const response = await axios.get(`${BASE_URL}/api/admin/rfqs/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const requiredStats = ['total', 'pending', 'approved', 'rejected'];
    for (const stat of requiredStats) {
      if (response.data[stat] === undefined) {
        throw new Error(`Missing RFQ stat: ${stat}`);
      }
    }
  });
}

// User Management Tests
async function testUserManagement() {
  log.header('Testing User Management');
  
  await runTest('User List', async () => {
    const response = await axios.get(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (!response.data.users || !Array.isArray(response.data.users)) {
      throw new Error('Invalid user response structure');
    }
  });
}

// Security Tests
async function testSecurity() {
  log.header('Testing Security Features');
  
  await runTest('Unauthorized Access', async () => {
    try {
      await axios.get(`${BASE_URL}/api/admin/dashboard/metrics`);
      throw new Error('Should have been blocked without token');
    } catch (error) {
      if (error.response?.status !== 401) {
        throw new Error('Expected 401 status for unauthorized access');
      }
    }
  });

  await runTest('Invalid Token', async () => {
    try {
      await axios.get(`${BASE_URL}/api/admin/dashboard/metrics`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      throw new Error('Should have been blocked with invalid token');
    } catch (error) {
      if (error.response?.status !== 401) {
        throw new Error('Expected 401 status for invalid token');
      }
    }
  });
}

// Frontend Tests
async function testFrontend() {
  log.header('Testing Frontend Accessibility');
  
  const frontendUrls = [
    '/admin',
    '/admin/analytics',
    '/admin/monitoring',
    '/admin/rfqs',
    '/admin/security',
    '/admin/users'
  ];

  for (const url of frontendUrls) {
    await runTest(`Frontend: ${url}`, async () => {
      const response = await axios.get(`${BASE_URL}${url}`);
      if (response.status !== 200) {
        throw new Error(`Frontend page ${url} not accessible`);
      }
    });
  }
}

// Performance Tests
async function testPerformance() {
  log.header('Testing Performance');
  
  await runTest('API Response Time', async () => {
    const startTime = Date.now();
    await axios.get(`${BASE_URL}/api/admin/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const responseTime = Date.now() - startTime;
    
    if (responseTime > 2000) {
      throw new Error(`API response too slow: ${responseTime}ms`);
    }
    
    log.info(`API Response Time: ${responseTime}ms`);
  });
}

// Database Tests
async function testDatabase() {
  log.header('Testing Database Connectivity');
  
  await runTest('Database Connection', async () => {
    const response = await axios.get(`${BASE_URL}/api/health`);
    if (response.data.status !== 'healthy') {
      throw new Error('Database connection failed');
    }
  });
}

// Main test runner
async function runAllTests() {
  log.header('🚀 Starting Bell24H Admin System Tests');
  log.info(`Base URL: ${BASE_URL}`);
  log.info(`Admin Email: ${ADMIN_EMAIL}`);
  
  try {
    await testAuthentication();
    await testDashboard();
    await testAnalytics();
    await testMonitoring();
    await testRFQManagement();
    await testUserManagement();
    await testSecurity();
    await testFrontend();
    await testPerformance();
    await testDatabase();
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
    log.success('\n🎉 All tests passed! Admin system is ready for production.');
  } else {
    log.warning('\n⚠️  Some tests failed. Please review and fix issues before production.');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testResults }; 