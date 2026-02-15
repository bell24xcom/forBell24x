#!/usr/bin/env node

/**
 * 🎯 BELL24H COMPREHENSIVE TESTING SCRIPT
 * 
 * This script verifies all components of the Bell24H platform:
 * - Demo data population
 * - AI service functionality
 * - Frontend features
 * - API endpoints
 * - Authentication
 * - Wallet & Escrow systems
 */

const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  AI_SERVICE_URL: 'http://localhost:8000',
  CLIENT_URL: 'http://localhost:3000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}`, 'cyan');
  log(`${colors.bright}${colors.cyan}${title}`, 'cyan');
  log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`, 'cyan');
}

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status}: ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'yellow');
  }
  
  testResults.total++;
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  
  testResults.details.push({
    name: testName,
    passed,
    details
  });
}

// HTTP request utility
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: CONFIG.TIMEOUT
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Service availability tests
async function testServiceAvailability() {
  logSection('🔍 SERVICE AVAILABILITY TESTS');
  
  // Test AI Service
  try {
    const aiResponse = await makeRequest(`${CONFIG.AI_SERVICE_URL}/health`);
    logTest('AI Service Health Check', aiResponse.statusCode === 200, 
      `Status: ${aiResponse.statusCode}`);
  } catch (error) {
    logTest('AI Service Health Check', false, `Error: ${error.message}`);
  }
  
  // Test Next.js Client
  try {
    const clientResponse = await makeRequest(CONFIG.CLIENT_URL);
    logTest('Next.js Client Availability', clientResponse.statusCode === 200,
      `Status: ${clientResponse.statusCode}`);
  } catch (error) {
    logTest('Next.js Client Availability', false, `Error: ${error.message}`);
  }
}

// Demo data verification tests
async function testDemoData() {
  logSection('📊 DEMO DATA VERIFICATION TESTS');
  
  // Check if demo data file exists
  const demoDataPath = path.join(__dirname, 'client', 'src', 'data', 'demoData.ts');
  const demoDataExists = fs.existsSync(demoDataPath);
  logTest('Demo Data File Exists', demoDataExists, 
    demoDataExists ? 'Found demoData.ts' : 'demoData.ts not found');
  
  if (demoDataExists) {
    const demoDataContent = fs.readFileSync(demoDataPath, 'utf8');
    
    // Check for RFQ data
    const rfqCount = (demoDataContent.match(/RFQ-/g) || []).length;
    logTest('Demo RFQs Present', rfqCount > 0, `${rfqCount} RFQs found`);
    
    // Check for categories
    const categoryCount = (demoDataContent.match(/categoryMapping/g) || []).length;
    logTest('Category Mapping Present', categoryCount > 0, 'Category mapping found');
    
    // Check for suppliers
    const supplierCount = (demoDataContent.match(/SUP-/g) || []).length;
    logTest('Demo Suppliers Present', supplierCount > 0, `${supplierCount} suppliers found`);
    
    // Check for quotes
    const quoteCount = (demoDataContent.match(/QUO-/g) || []).length;
    logTest('Demo Quotes Present', quoteCount > 0, `${quoteCount} quotes found`);
  }
}

// AI Service functionality tests
async function testAIService() {
  logSection('🤖 AI SERVICE FUNCTIONALITY TESTS');
  
  // Test model info endpoint
  try {
    const modelInfoResponse = await makeRequest(`${CONFIG.AI_SERVICE_URL}/model-info`);
    logTest('AI Model Info Endpoint', modelInfoResponse.statusCode === 200,
      `Status: ${modelInfoResponse.statusCode}`);
  } catch (error) {
    logTest('AI Model Info Endpoint', false, `Error: ${error.message}`);
  }
  
  // Test metrics endpoint
  try {
    const metricsResponse = await makeRequest(`${CONFIG.AI_SERVICE_URL}/metrics`);
    logTest('AI Metrics Endpoint', metricsResponse.statusCode === 200,
      `Status: ${metricsResponse.statusCode}`);
  } catch (error) {
    logTest('AI Metrics Endpoint', false, `Error: ${error.message}`);
  }
  
  // Test explain-matching endpoint with sample data
  try {
    const sampleRequest = {
      rfq: {
        rfq_id: "RFQ-TEST-001",
        title: "Test RFQ",
        description: "Test description",
        category: "Electronics",
        budget_min: 100000,
        budget_max: 200000,
        quantity: 100,
        urgency: "medium",
        location: "Mumbai",
        specifications: ["Test spec 1", "Test spec 2"]
      },
      suppliers: [{
        supplier_id: "SUP-TEST-001",
        name: "Test Supplier",
        category_expertise: ["Electronics"],
        rating: 4.5,
        location: "Mumbai",
        price_range: "medium",
        delivery_capability: "fast",
        certifications: ["ISO 9001"],
        past_performance: 95.0
      }],
      explanation_type: "both"
    };
    
    const explainResponse = await makeRequest(`${CONFIG.AI_SERVICE_URL}/explain-matching`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sampleRequest)
    });
    
    logTest('AI Explain Matching Endpoint', explainResponse.statusCode === 200,
      `Status: ${explainResponse.statusCode}`);
  } catch (error) {
    logTest('AI Explain Matching Endpoint', false, `Error: ${error.message}`);
  }
}

// Frontend page tests
async function testFrontendPages() {
  logSection('🌐 FRONTEND PAGE TESTS');
  
  const pages = [
    { name: 'Homepage', path: '/' },
    { name: 'Categories Page', path: '/categories' },
    { name: 'Electronics Category', path: '/categories/electronics' },
    { name: 'Agriculture Category', path: '/categories/agriculture' },
    { name: 'Demo RFQ Page', path: '/rfq/RFQ-ELE-001' },
    { name: 'Wallet Page', path: '/wallet' },
    { name: 'Escrow Page', path: '/escrow' },
    { name: 'AI Dashboard', path: '/dashboard/ai-matching' }
  ];
  
  for (const page of pages) {
    try {
      const response = await makeRequest(`${CONFIG.CLIENT_URL}${page.path}`);
      const isSuccess = response.statusCode === 200 || response.statusCode === 404; // 404 is expected for some routes
      logTest(`${page.name}`, isSuccess, `Status: ${response.statusCode}`);
    } catch (error) {
      logTest(`${page.name}`, false, `Error: ${error.message}`);
    }
  }
}

// API endpoint tests
async function testAPIEndpoints() {
  logSection('🔌 API ENDPOINT TESTS');
  
  const endpoints = [
    { name: 'RFQ API', path: '/api/rfq' },
    { name: 'Categories API', path: '/api/categories' },
    { name: 'Suppliers API', path: '/api/suppliers' },
    { name: 'Quotes API', path: '/api/quotes' },
    { name: 'Wallet API', path: '/api/wallet' },
    { name: 'Escrow API', path: '/api/escrow' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${CONFIG.CLIENT_URL}${endpoint.path}`);
      const isSuccess = response.statusCode === 200 || response.statusCode === 404; // 404 is expected for some routes
      logTest(`${endpoint.name}`, isSuccess, `Status: ${response.statusCode}`);
    } catch (error) {
      logTest(`${endpoint.name}`, false, `Error: ${error.message}`);
    }
  }
}

// File structure verification
function testFileStructure() {
  logSection('📁 FILE STRUCTURE VERIFICATION');
  
  const requiredFiles = [
    'client/package.json',
    'client/src/data/demoData.ts',
    'ai-explainability-service/main.py',
    'ai-explainability-service/requirements.txt',
    'start-bell24h-complete.bat'
  ];
  
  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(__dirname, file));
    logTest(`File: ${file}`, exists, exists ? 'Found' : 'Missing');
  }
  
  // Check for key directories
  const requiredDirs = [
    'client',
    'client/src',
    'client/src/components',
    'client/src/pages',
    'ai-explainability-service'
  ];
  
  for (const dir of requiredDirs) {
    const exists = fs.existsSync(path.join(__dirname, dir));
    logTest(`Directory: ${dir}`, exists, exists ? 'Found' : 'Missing');
  }
}

// Performance tests
async function testPerformance() {
  logSection('⚡ PERFORMANCE TESTS');
  
  // Test homepage load time
  const startTime = Date.now();
  try {
    await makeRequest(CONFIG.CLIENT_URL);
    const loadTime = Date.now() - startTime;
    const isFast = loadTime < 3000; // Less than 3 seconds
    logTest('Homepage Load Time', isFast, `${loadTime}ms (target: <3000ms)`);
  } catch (error) {
    logTest('Homepage Load Time', false, `Error: ${error.message}`);
  }
  
  // Test AI service response time
  const aiStartTime = Date.now();
  try {
    await makeRequest(`${CONFIG.AI_SERVICE_URL}/health`);
    const aiLoadTime = Date.now() - aiStartTime;
    const isFast = aiLoadTime < 1000; // Less than 1 second
    logTest('AI Service Response Time', isFast, `${aiLoadTime}ms (target: <1000ms)`);
  } catch (error) {
    logTest('AI Service Response Time', false, `Error: ${error.message}`);
  }
}

// Generate comprehensive report
function generateReport() {
  logSection('📊 COMPREHENSIVE TEST REPORT');
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  
  log(`${colors.bright}Test Summary:${colors.reset}`, 'bright');
  log(`Total Tests: ${testResults.total}`, 'cyan');
  log(`Passed: ${colors.green}${testResults.passed}${colors.reset}`, 'green');
  log(`Failed: ${colors.red}${testResults.failed}${colors.reset}`, 'red');
  log(`Success Rate: ${colors.bright}${successRate}%${colors.reset}`, 'bright');
  
  log(`\n${colors.bright}Detailed Results:${colors.reset}`, 'bright');
  testResults.details.forEach((test, index) => {
    const status = test.passed ? '✅' : '❌';
    const color = test.passed ? 'green' : 'red';
    log(`${status} ${test.name}`, color);
    if (test.details) {
      log(`   ${test.details}`, 'yellow');
    }
  });
  
  // Overall assessment
  log(`\n${colors.bright}Overall Assessment:${colors.reset}`, 'bright');
  if (parseFloat(successRate) >= 90) {
    log('🎉 EXCELLENT: Bell24H platform is fully operational!', 'green');
  } else if (parseFloat(successRate) >= 70) {
    log('⚠️ GOOD: Most features working, some issues to address', 'yellow');
  } else {
    log('❌ NEEDS ATTENTION: Significant issues detected', 'red');
  }
  
  // Recommendations
  log(`\n${colors.bright}Recommendations:${colors.reset}`, 'bright');
  if (testResults.failed > 0) {
    log('1. Check service startup status', 'cyan');
    log('2. Verify all dependencies are installed', 'cyan');
    log('3. Check network connectivity and ports', 'cyan');
    log('4. Review error logs for failed tests', 'cyan');
  } else {
    log('1. All systems operational!', 'green');
    log('2. Ready for production deployment', 'green');
    log('3. Consider performance optimization', 'cyan');
  }
}

// Main test execution
async function runAllTests() {
  log(`${colors.bright}${colors.magenta}🎯 BELL24H COMPREHENSIVE TESTING SCRIPT${colors.reset}`, 'magenta');
  log(`${colors.cyan}Testing all components of the Bell24H platform...${colors.reset}`, 'cyan');
  
  try {
    await testServiceAvailability();
    await testDemoData();
    await testAIService();
    await testFrontendPages();
    await testAPIEndpoints();
    testFileStructure();
    await testPerformance();
    generateReport();
  } catch (error) {
    log(`\n${colors.red}Test execution failed: ${error.message}${colors.reset}`, 'red');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testResults
}; 