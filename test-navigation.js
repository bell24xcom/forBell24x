const https = require('https');

// Test navigation and button functionality
const navigationTests = [
  // Homepage navigation links
  { url: 'https://bell24h-v1.vercel.app/', test: 'Homepage Navigation', expected: ['Login', 'Get Started', 'Categories', 'Suppliers'] },
  
  // Footer links
  { url: 'https://bell24h-v1.vercel.app/', test: 'Footer Links', expected: ['Privacy', 'Terms', 'Contact', 'About'] },
  
  // Dashboard navigation
  { url: 'https://bell24h-v1.vercel.app/dashboard', test: 'Dashboard Navigation', expected: ['Analytics', 'KYC', 'Wallet', 'Settings'] },
  
  // Categories page navigation
  { url: 'https://bell24h-v1.vercel.app/categories', test: 'Categories Navigation', expected: ['Back to Home', 'Suppliers', 'Pricing'] },
  
  // Admin navigation
  { url: 'https://bell24h-v1.vercel.app/admin', test: 'Admin Navigation', expected: ['Dashboard', 'Users', 'Suppliers', 'Analytics'] }
];

async function testPageContent(url, testName, expectedElements) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 15000
    };

    let data = '';
    const req = https.request(options, (res) => {
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const foundElements = expectedElements.filter(element => 
          data.includes(element) || data.toLowerCase().includes(element.toLowerCase())
        );
        
        resolve({
          test: testName,
          url: url,
          status: res.statusCode,
          expected: expectedElements,
          found: foundElements,
          success: res.statusCode === 200 && foundElements.length > 0,
          coverage: Math.round((foundElements.length / expectedElements.length) * 100)
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        test: testName,
        url: url,
        status: 'ERROR',
        expected: expectedElements,
        found: [],
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        test: testName,
        url: url,
        status: 'TIMEOUT',
        expected: expectedElements,
        found: [],
        success: false,
        error: 'Request timeout'
      });
    });

    req.setTimeout(15000);
    req.end();
  });
}

async function runNavigationAudit() {
  console.log('🧭 BELL24H NAVIGATION & FUNCTIONALITY AUDIT');
  console.log('============================================');
  console.log('Testing navigation elements and buttons...\n');

  const results = [];
  
  for (const test of navigationTests) {
    process.stdout.write(`Testing ${test.test}... `);
    const result = await testPageContent(test.url, test.test, test.expected);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.coverage}% coverage (${result.found.length}/${result.expected.length} elements)`);
    } else {
      console.log(`❌ ${result.status} ${result.error || ''}`);
    }
  }

  console.log('\n============================================');
  console.log('📊 NAVIGATION AUDIT SUMMARY');
  console.log('============================================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful Tests: ${successful.length}`);
  console.log(`❌ Failed Tests: ${failed.length}`);
  console.log(`📈 Success Rate: ${Math.round((successful.length / results.length) * 100)}%`);
  
  if (successful.length > 0) {
    console.log('\n✅ SUCCESSFUL NAVIGATION TESTS:');
    successful.forEach(test => {
      console.log(`  - ${test.test}: ${test.coverage}% coverage`);
      console.log(`    Found: ${test.found.join(', ')}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED NAVIGATION TESTS:');
    failed.forEach(test => {
      console.log(`  - ${test.test}: ${test.status} ${test.error || ''}`);
    });
  }
}

runNavigationAudit().catch(console.error);
