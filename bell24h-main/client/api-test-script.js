# 🧪 COMPREHENSIVE API TESTING SCRIPT
# Copy and paste this into your browser console (F12 → Console) on https://bell24h.com

console.log('🚀 Starting BELL24H API Tests...');
console.log('=====================================');

// Test configuration
const API_BASE = window.location.origin;
const tests = [];

// Helper function to test API endpoints
async function testAPI(name, endpoint, expectedStatus = 200) {
  try {
    console.log(`\n🔍 Testing ${name}...`);
    const response = await fetch(`${API_BASE}${endpoint}`);
    const data = await response.json();
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${name}: SUCCESS (${response.status})`);
      console.log('📊 Response:', data);
      tests.push({name, status: 'PASS', response: data});
    } else {
      console.log(`❌ ${name}: FAILED (${response.status})`);
      console.log('📊 Response:', data);
      tests.push({name, status: 'FAIL', response: data});
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
    tests.push({name, status: 'ERROR', error: error.message});
  }
}

// Run all API tests
async function runAllTests() {
  console.log('Starting comprehensive API testing...\n');
  
  // Core API endpoints
  await testAPI('Health Check', '/api/health');
  await testAPI('Suppliers API', '/api/suppliers');
  await testAPI('RFQ API', '/api/rfq');
  
  // Authentication APIs
  await testAPI('Auth Check Email', '/api/auth/check-email');
  await testAPI('Send OTP', '/api/auth/send-otp');
  
  // Analytics APIs
  await testAPI('Analytics RFQ Metrics', '/api/analytics/rfq-metrics');
  await testAPI('Analytics Supplier Performance', '/api/analytics/supplier-performance');
  await testAPI('Analytics Monthly Trends', '/api/analytics/monthly-trends');
  
  // AI APIs
  await testAPI('AI Match', '/api/ai/match');
  await testAPI('AI Match Suppliers', '/api/ai/match-suppliers');
  await testAPI('AI Explanations', '/api/ai/explanations');
  
  // Payment APIs
  await testAPI('Payments Create', '/api/payments/create');
  
  // Voice/Video APIs
  await testAPI('Voice Transcribe', '/api/voice/transcribe');
  await testAPI('Voice RFQ', '/api/voice/rfq');
  await testAPI('Video RFQ', '/api/video-rfq');
  
  // Admin APIs
  await testAPI('Admin Performance', '/api/admin/performance');
  await testAPI('Admin Generate Profile', '/api/admin/generate-profile');
  
  // N8N Integration APIs
  await testAPI('N8N Test Connection', '/api/n8n/test-connection');
  await testAPI('N8N Integration Workflows', '/api/n8n/integration/workflows');
  
  // Generate test summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  const passed = tests.filter(t => t.status === 'PASS').length;
  const failed = tests.filter(t => t.status === 'FAIL').length;
  const errors = tests.filter(t => t.status === 'ERROR').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🚨 Errors: ${errors}`);
  console.log(`📈 Total: ${tests.length}`);
  
  if (failed === 0 && errors === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Your APIs are working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the details above.');
  }
  
  return tests;
}

// Quick test function for individual endpoints
function quickTest(endpoint) {
  fetch(`${API_BASE}${endpoint}`)
    .then(r => r.json())
    .then(data => {
      console.log(`✅ ${endpoint}:`, data);
    })
    .catch(error => {
      console.log(`❌ ${endpoint}:`, error);
    });
}

// Export functions for manual testing
window.testAPI = testAPI;
window.quickTest = quickTest;
window.runAllTests = runAllTests;

console.log('\n🎯 Available functions:');
console.log('- runAllTests() - Run comprehensive API test suite');
console.log('- quickTest("/api/endpoint") - Test individual endpoint');
console.log('- testAPI("Name", "/api/endpoint") - Test with custom name');

console.log('\n🚀 Run "runAllTests()" to start comprehensive testing!');
