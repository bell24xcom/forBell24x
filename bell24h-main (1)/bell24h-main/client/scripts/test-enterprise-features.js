#!/usr/bin/env node

/**
 * Bell24H Enterprise Features Test Script
 * Comprehensive testing of wallet, escrow, and invoice discounting systems
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retries: 3,
  parallel: true,
};

// Test data
const TEST_DATA = {
  gstNumber: '27AAPFU0939F1Z5',
  userId: 'USER-001',
  buyerId: 'BUYER-001',
  sellerId: 'SELLER-001',
  walletId: 'WAL-001',
  invoiceNumber: 'INV-2024-001',
  amount: 750000, // ₹7.5L for escrow testing
  currency: 'INR',
};

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  details: [],
};

/**
 * Utility Functions
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function logTestResult(testName, success, details = null) {
  testResults.total++;
  if (success) {
    testResults.passed++;
    log(`PASS: ${testName}`, 'success');
  } else {
    testResults.failed++;
    log(`FAIL: ${testName}`, 'error');
  }

  if (details) {
    testResults.details.push({ testName, success, details });
  }
}

async function makeRequest(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: TEST_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status || 500,
    };
  }
}

/**
 * Wallet System Tests
 */
async function testWalletCreation() {
  log('Testing wallet creation with GST verification...');

  const response = await makeRequest('/api/wallet/create', 'POST', {
    gstNumber: TEST_DATA.gstNumber,
    userId: TEST_DATA.userId,
    businessDetails: {
      name: 'Test Business',
      type: 'Proprietorship',
      address: 'Test Address',
    },
  });

  const success =
    response.success && response.data?.success && response.data?.data?.status === 'active';

  logTestResult('Wallet Creation', success, response);
  return success;
}

async function testWalletTransactions() {
  log('Testing wallet transaction processing...');

  const response = await makeRequest('/api/wallet/transactions', 'POST', {
    walletId: TEST_DATA.walletId,
    amount: 100000,
    currency: 'INR',
    type: 'credit',
    description: 'Test transaction',
    isInternational: false,
  });

  const success =
    response.success && response.data?.success && response.data?.data?.status === 'completed';

  logTestResult('Wallet Transactions', success, response);
  return success;
}

async function testWalletHistory() {
  log('Testing wallet transaction history...');

  const response = await makeRequest(`/api/wallet/transactions?walletId=${TEST_DATA.walletId}`);

  const success =
    response.success && response.data?.success && Array.isArray(response.data?.data?.transactions);

  logTestResult('Wallet History', success, response);
  return success;
}

/**
 * Escrow System Tests
 */
async function testEscrowValidation() {
  log('Testing escrow validation for ₹5L+ transactions...');

  const response = await makeRequest('/api/escrow/validate', 'POST', {
    amount: TEST_DATA.amount,
    currency: TEST_DATA.currency,
    buyerId: TEST_DATA.buyerId,
    sellerId: TEST_DATA.sellerId,
    termsAccepted: true,
  });

  const success =
    response.success && response.data?.success && response.data?.data?.escrowRequired === true;

  logTestResult('Escrow Validation', success, response);
  return success;
}

async function testEscrowBelowThreshold() {
  log('Testing escrow validation for transactions below ₹5L...');

  const response = await makeRequest('/api/escrow/validate', 'POST', {
    amount: 250000, // ₹2.5L - below threshold
    currency: 'INR',
    buyerId: TEST_DATA.buyerId,
    sellerId: TEST_DATA.sellerId,
    termsAccepted: false,
  });

  const success =
    response.success && response.data?.success && response.data?.data?.escrowRequired === false;

  logTestResult('Escrow Below Threshold', success, response);
  return success;
}

/**
 * Invoice Discounting Tests
 */
async function testInvoiceVerification() {
  log('Testing invoice verification with GST portal...');

  const response = await makeRequest('/api/invoice/verify', 'POST', {
    invoiceNumber: TEST_DATA.invoiceNumber,
    gstNumber: TEST_DATA.gstNumber,
    buyerGstNumber: '27AAPFU0939F1Z6',
    amount: 500000,
    currency: 'INR',
    issueDate: '2024-01-15T10:30:00Z',
    dueDate: '2024-02-15T10:30:00Z',
    documents: ['invoice.pdf', 'purchase_order.pdf'],
  });

  const success =
    response.success && response.data?.success && response.data?.data?.invoiceVerified === true;

  logTestResult('Invoice Verification', success, response);
  return success;
}

async function testCreditAssessment() {
  log('Testing AI-powered credit assessment...');

  const response = await makeRequest('/api/invoice/verify', 'POST', {
    invoiceNumber: 'INV-2024-002',
    gstNumber: TEST_DATA.gstNumber,
    buyerGstNumber: '27AAPFU0939F1Z7',
    amount: 750000,
    currency: 'INR',
    issueDate: '2024-01-14T15:45:00Z',
    dueDate: '2024-02-20T15:45:00Z',
    documents: ['invoice.pdf', 'contract.pdf'],
  });

  const success =
    response.success &&
    response.data?.success &&
    response.data?.data?.creditAssessment?.creditScore &&
    response.data?.data?.fundingDetails?.discountRate;

  logTestResult('Credit Assessment', success, response);
  return success;
}

/**
 * Legal Documentation Tests
 */
async function testLegalNotifications() {
  log('Testing legal notification system...');

  const response = await makeRequest('/api/notifications/legal', 'POST', {
    userId: TEST_DATA.userId,
    notificationType: 'terms_accepted',
    documentType: 'wallet-terms',
    termsAccepted: true,
    emailAddress: 'test@bell24h.com',
    complianceStatus: {
      status: 'compliant',
      lastUpdated: new Date().toISOString(),
    },
  });

  const success =
    response.success && response.data?.success && response.data?.data?.acceptanceRecord;

  logTestResult('Legal Notifications', success, response);
  return success;
}

async function testNotificationHistory() {
  log('Testing notification history retrieval...');

  const response = await makeRequest(`/api/notifications/legal?userId=${TEST_DATA.userId}`);

  const success =
    response.success && response.data?.success && Array.isArray(response.data?.data?.notifications);

  logTestResult('Notification History', success, response);
  return success;
}

/**
 * Page Loading Tests
 */
async function testPageLoading() {
  const pages = [
    { name: 'Wallet Page', path: '/wallet' },
    { name: 'Escrow Page', path: '/escrow' },
    { name: 'Invoice Discounting Page', path: '/invoice-discounting' },
    { name: 'Wallet Terms Page', path: '/legal/wallet-terms' },
    { name: 'Escrow Agreement Page', path: '/legal/escrow-agreement' },
  ];

  log('Testing page loading and responsiveness...');

  for (const page of pages) {
    const response = await makeRequest(page.path);
    const success = response.success && response.status === 200;
    logTestResult(`${page.name} Loading`, success, { path: page.path, status: response.status });
  }
}

/**
 * Performance Tests
 */
async function testPerformance() {
  log('Testing API response times...');

  const endpoints = [
    '/api/wallet/create',
    '/api/escrow/validate',
    '/api/invoice/verify',
    '/api/notifications/legal',
  ];

  for (const endpoint of endpoints) {
    const startTime = Date.now();
    const response = await makeRequest(endpoint, 'POST', { test: true });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const success = responseTime < 3000; // 3 seconds threshold
    logTestResult(`${endpoint} Performance`, success, { responseTime: `${responseTime}ms` });
  }
}

/**
 * Main Test Runner
 */
async function runTests() {
  log('🚀 Starting Bell24H Enterprise Features Test Suite...', 'info');
  log(`Base URL: ${BASE_URL}`, 'info');
  log(`Test Configuration: ${JSON.stringify(TEST_CONFIG)}`, 'info');

  const startTime = Date.now();

  try {
    // Wallet System Tests
    await testWalletCreation();
    await testWalletTransactions();
    await testWalletHistory();

    // Escrow System Tests
    await testEscrowValidation();
    await testEscrowBelowThreshold();

    // Invoice Discounting Tests
    await testInvoiceVerification();
    await testCreditAssessment();

    // Legal Documentation Tests
    await testLegalNotifications();
    await testNotificationHistory();

    // Page Loading Tests
    await testPageLoading();

    // Performance Tests
    await testPerformance();
  } catch (error) {
    log(`Test suite error: ${error.message}`, 'error');
  }

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  // Generate Test Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 BELL24H ENTERPRISE FEATURES TEST REPORT');
  console.log('='.repeat(60));

  console.log(`\n⏱️  Total Test Time: ${totalTime}ms`);
  console.log(`📈 Test Results:`);
  console.log(`   Total Tests: ${testResults.total}`);
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(
    `   📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`
  );

  if (testResults.failed > 0) {
    console.log(`\n❌ Failed Tests:`);
    testResults.details
      .filter(detail => !detail.success)
      .forEach(detail => {
        console.log(`   • ${detail.testName}`);
        if (detail.details?.error) {
          console.log(`     Error: ${detail.details.error}`);
        }
      });
  }

  if (testResults.passed === testResults.total) {
    console.log('\n🎉 ALL TESTS PASSED! Enterprise features are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }

  console.log('\n' + '='.repeat(60));
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testResults,
  TEST_DATA,
  TEST_CONFIG,
};
