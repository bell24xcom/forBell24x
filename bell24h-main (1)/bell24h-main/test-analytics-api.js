/**
 * Test script for Analytics API
 * 
 * This script tests the Analytics API endpoints to ensure they are working correctly
 * and providing accurate data for the dashboard visualizations.
 */

const axios = require('axios');

// Base URL for the API
const API_BASE_URL = 'http://localhost:8080';
let authToken = null;

// Test User Credentials
const TEST_USER = {
  username: 'testuser',
  password: 'password123'
};

/**
 * Login to get authentication token
 */
async function login() {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/login`, TEST_USER);
    authToken = response.data.token;
    console.log('Successfully logged in.');
    return true;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test the dashboard overview endpoint
 */
async function testDashboardOverview() {
  try {
    console.log('\n=== Testing Dashboard Overview API ===');
    const response = await axios.get(`${API_BASE_URL}/api/analytics/overview`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('Overview data successfully retrieved:');
    console.log('Active RFQs:', response.data.activeRfqs);
    console.log('Total Bids:', response.data.totalBids);
    console.log('Contract Value:', response.data.contractValue);
    console.log('Active Suppliers:', response.data.activeSuppliers);
    console.log('Trend Data Available:', !!response.data.trendData);
    
    return true;
  } catch (error) {
    console.error('Dashboard overview test failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test the RFQ performance endpoint
 */
async function testRfqPerformance() {
  try {
    console.log('\n=== Testing RFQ Performance API ===');
    const response = await axios.get(`${API_BASE_URL}/api/analytics/rfq-performance`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('RFQ performance data successfully retrieved:');
    console.log('RFQ Performance Score:', response.data.rfqPerformanceScore);
    console.log('Bid Rate:', response.data.bidRate);
    console.log('Average Bids per RFQ:', response.data.averageBidsPerRfq);
    console.log('Award Rate:', response.data.awardRate);
    console.log('Status Overview Items:', response.data.rfqStatusOverview.length);
    console.log('Categories:', response.data.rfqCategories.length);
    console.log('RFQ Type Performance Items:', response.data.rfqTypePerformance.length);
    
    return true;
  } catch (error) {
    console.error('RFQ performance test failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test the product performance endpoint
 */
async function testProductPerformance() {
  try {
    console.log('\n=== Testing Product Performance API ===');
    const response = await axios.get(`${API_BASE_URL}/api/analytics/product-performance`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('Product performance data successfully retrieved:');
    console.log('Total Products:', response.data.totalProducts);
    console.log('Product Performance Data Points:', response.data.productPerformance.length);
    console.log('Top Products Count:', response.data.topProducts.length);
    console.log('Category Distribution Items:', response.data.categoryDistribution.length);
    console.log('Performance Metrics Available:', !!response.data.performanceMetrics);
    
    if (response.data.performanceMetrics) {
      console.log('Avg Views Per Product:', response.data.performanceMetrics.avgViewsPerProduct);
      console.log('Conversion Rate:', response.data.performanceMetrics.conversionRate);
      console.log('Products With No Views:', response.data.performanceMetrics.productsWithNoViews);
    }
    
    return true;
  } catch (error) {
    console.error('Product performance test failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test the market analysis endpoint
 */
async function testMarketAnalysis() {
  try {
    console.log('\n=== Testing Market Analysis API ===');
    const response = await axios.get(`${API_BASE_URL}/api/analytics/market`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('Market analysis data successfully retrieved:');
    console.log('Market Trends:', response.data.marketTrends.length);
    console.log('Regional Comparison Items:', response.data.regionalComparison.length);
    console.log('Supply Chain Risks Items:', response.data.supplyChainRisks.length);
    console.log('Market Insights Available:', !!response.data.marketInsights);
    
    // Test with category filter
    const category = 'Electronics';
    const filteredResponse = await axios.get(`${API_BASE_URL}/api/analytics/market?category=${category}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log(`\nMarket analysis for category '${category}' successfully retrieved:`);
    console.log('Market Trends:', filteredResponse.data.marketTrends.length);
    console.log('Regional Comparison Items:', filteredResponse.data.regionalComparison.length);
    console.log('Supply Chain Risks Items:', filteredResponse.data.supplyChainRisks.length);
    
    return true;
  } catch (error) {
    console.error('Market analysis test failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test the activity endpoint
 */
async function testActivity() {
  try {
    console.log('\n=== Testing Activity API ===');
    const response = await axios.get(`${API_BASE_URL}/api/analytics/activity`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('Activity data successfully retrieved:');
    console.log('Total Activities:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('Sample Activity:');
      console.log('Type:', response.data[0].type);
      console.log('Object ID:', response.data[0].objectId);
      console.log('Timestamp:', response.data[0].timestamp);
    }
    
    // Test with limit parameter
    const limit = 2;
    const limitedResponse = await axios.get(`${API_BASE_URL}/api/analytics/activity?limit=${limit}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log(`\nActivity with limit ${limit} successfully retrieved:`);
    console.log('Total Activities:', limitedResponse.data.length);
    
    return true;
  } catch (error) {
    console.error('Activity test failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('Starting Analytics API tests...');
  
  const isLoggedIn = await login();
  if (!isLoggedIn) {
    console.error('Cannot proceed with tests. Login failed.');
    return;
  }
  
  let successCount = 0;
  let testCount = 0;
  
  // Run dashboard overview test
  testCount++;
  const overviewSuccess = await testDashboardOverview();
  if (overviewSuccess) successCount++;
  
  // Run RFQ performance test
  testCount++;
  const rfqSuccess = await testRfqPerformance();
  if (rfqSuccess) successCount++;
  
  // Run product performance test
  testCount++;
  const productSuccess = await testProductPerformance();
  if (productSuccess) successCount++;
  
  // Run market analysis test
  testCount++;
  const marketSuccess = await testMarketAnalysis();
  if (marketSuccess) successCount++;
  
  // Run activity test
  testCount++;
  const activitySuccess = await testActivity();
  if (activitySuccess) successCount++;
  
  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Tests passed: ${successCount}/${testCount}`);
  console.log(`Success rate: ${Math.round((successCount / testCount) * 100)}%`);
  
  if (successCount === testCount) {
    console.log('All tests passed successfully!');
  } else {
    console.log('Some tests failed. Check the logs above for details.');
  }
}

// Run the tests
runTests().catch(err => {
  console.error('Error running tests:', err);
});