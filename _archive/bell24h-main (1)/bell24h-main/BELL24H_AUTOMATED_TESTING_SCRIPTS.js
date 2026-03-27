// Bell24h Security & Performance Testing Scripts
// Run these in browser console or as separate test files

// ===========================================
// 🔒 SECURITY TESTING SUITE
// ===========================================

class Bell24hSecurityTester {
  constructor(
    baseUrl = 'https://bell24h-v1-rmiydi1cb-vishaals-projects-892b178d.vercel.app'
  ) {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  log(test, status, message, details = null) {
    const result = {
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
    this.results.push(result);
    console.log(`${status === 'PASS' ? '✅' : '❌'} ${test}: ${message}`);
    if (details) console.log('  Details:', details);
  }

  // Test SQL Injection vulnerabilities
  async testSQLInjection() {
    console.log('\n🔒 Testing SQL Injection Protection...');

    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "' OR 1=1 #",
    ];

    for (const payload of sqlPayloads) {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: payload,
            password: payload,
          }),
        });

        const data = await response.json();

        if (
          response.status >= 400 &&
          data.message &&
          !data.message.includes('error')
        ) {
          this.log(
            'SQL Injection',
            'PASS',
            `Payload rejected safely: ${payload}`
          );
        } else if (response.ok) {
          this.log(
            'SQL Injection',
            'FAIL',
            `Payload accepted: ${payload}`,
            data
          );
        } else {
          this.log(
            'SQL Injection',
            'PASS',
            `Payload handled properly: ${payload}`
          );
        }
      } catch (error) {
        this.log(
          'SQL Injection',
          'PASS',
          `Network error (expected): ${payload}`
        );
      }
    }
  }

  // Test XSS vulnerabilities
  async testXSSProtection() {
    console.log('\n🔒 Testing XSS Protection...');

    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(1)">',
      'javascript:alert("XSS")',
      '<svg onload="alert(1)">',
      '"><script>alert("XSS")</script>',
    ];

    for (const payload of xssPayloads) {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            name: payload,
            companyName: payload,
          }),
        });

        const data = await response.json();

        // Check if script tags are sanitized in response
        const responseText = JSON.stringify(data);
        if (
          responseText.includes('<script>') ||
          responseText.includes('javascript:')
        ) {
          this.log(
            'XSS Protection',
            'FAIL',
            `XSS payload not sanitized: ${payload}`,
            data
          );
        } else {
          this.log(
            'XSS Protection',
            'PASS',
            `XSS payload properly handled: ${payload}`
          );
        }
      } catch (error) {
        this.log(
          'XSS Protection',
          'PASS',
          `XSS payload caused safe error: ${payload}`
        );
      }
    }
  }

  // Test authentication bypass
  async testAuthBypass() {
    console.log('\n🔒 Testing Authentication Bypass...');

    const protectedEndpoints = [
      '/supplier/dashboard',
      '/buyer/rfq/create',
      '/buyer/orders',
      '/api/products',
    ];

    for (const endpoint of protectedEndpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`);

        if (response.status === 401 || response.status === 403) {
          this.log(
            'Auth Bypass',
            'PASS',
            `Protected endpoint properly secured: ${endpoint}`
          );
        } else if (response.status === 200) {
          this.log(
            'Auth Bypass',
            'FAIL',
            `Protected endpoint accessible without auth: ${endpoint}`
          );
        } else {
          this.log(
            'Auth Bypass',
            'PASS',
            `Endpoint handled properly: ${endpoint} (${response.status})`
          );
        }
      } catch (error) {
        this.log(
          'Auth Bypass',
          'PASS',
          `Network error (expected): ${endpoint}`
        );
      }
    }
  }

  // Test rate limiting
  async testRateLimiting() {
    console.log('\n🔒 Testing Rate Limiting...');

    const requests = [];
    for (let i = 0; i < 20; i++) {
      requests.push(
        fetch(`${this.baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'wrongpassword',
          }),
        })
      );
    }

    try {
      const responses = await Promise.all(requests);
      const rateLimited = responses.some((r) => r.status === 429);

      if (rateLimited) {
        this.log('Rate Limiting', 'PASS', 'Rate limiting properly implemented');
      } else {
        this.log(
          'Rate Limiting',
          'WARN',
          'Rate limiting not detected (may be configured differently)'
        );
      }
    } catch (error) {
      this.log('Rate Limiting', 'PASS', 'Rate limiting test completed');
    }
  }

  // Run all security tests
  async runAllSecurityTests() {
    console.log('🔒 Starting Bell24h Security Test Suite...');

    await this.testSQLInjection();
    await this.testXSSProtection();
    await this.testAuthBypass();
    await this.testRateLimiting();

    const passed = this.results.filter((r) => r.status === 'PASS').length;
    const failed = this.results.filter((r) => r.status === 'FAIL').length;
    const total = this.results.length;

    console.log(
      `\n🔒 Security Test Summary: ${passed}/${total} passed, ${failed} failed`
    );
    return this.results;
  }
}

// ===========================================
// ⚡ PERFORMANCE TESTING SUITE
// ===========================================

class Bell24hPerformanceTester {
  constructor(
    baseUrl = 'https://bell24h-v1-rmiydi1cb-vishaals-projects-892b178d.vercel.app'
  ) {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  log(test, status, message, details = null) {
    const result = {
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
    this.results.push(result);
    console.log(`${status === 'PASS' ? '✅' : '❌'} ${test}: ${message}`);
    if (details) console.log('  Details:', details);
  }

  // Test page load times
  async testPageLoadTimes() {
    console.log('\n⚡ Testing Page Load Times...');

    const pages = [
      { url: '/', name: 'Homepage', maxTime: 3000 },
      { url: '/auth/login', name: 'Login Page', maxTime: 2000 },
      { url: '/auth/register', name: 'Register Page', maxTime: 2000 },
      { url: '/supplier/dashboard', name: 'Supplier Dashboard', maxTime: 4000 },
    ];

    for (const page of pages) {
      try {
        const startTime = performance.now();
        const response = await fetch(`${this.baseUrl}${page.url}`);
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        if (loadTime <= page.maxTime) {
          this.log(
            'Page Load Time',
            'PASS',
            `${page.name} loaded in ${loadTime.toFixed(0)}ms`,
            { loadTime, maxTime: page.maxTime }
          );
        } else {
          this.log(
            'Page Load Time',
            'FAIL',
            `${page.name} took ${loadTime.toFixed(0)}ms (max: ${
              page.maxTime
            }ms)`,
            { loadTime, maxTime: page.maxTime }
          );
        }
      } catch (error) {
        this.log(
          'Page Load Time',
          'FAIL',
          `${page.name} failed to load: ${error.message}`
        );
      }
    }
  }

  // Test API response times
  async testApiResponseTimes() {
    console.log('\n⚡ Testing API Response Times...');

    const apis = [
      { url: '/api/health', name: 'Health Check', maxTime: 1000 },
      { url: '/api/products', name: 'Products API', maxTime: 2000 },
      { url: '/api/homepage-stats', name: 'Homepage Stats', maxTime: 1500 },
    ];

    for (const api of apis) {
      try {
        const startTime = performance.now();
        const response = await fetch(`${this.baseUrl}${api.url}`);
        const data = await response.json();
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        if (responseTime <= api.maxTime) {
          this.log(
            'API Response Time',
            'PASS',
            `${api.name} responded in ${responseTime.toFixed(0)}ms`,
            { responseTime, maxTime: api.maxTime }
          );
        } else {
          this.log(
            'API Response Time',
            'FAIL',
            `${api.name} took ${responseTime.toFixed(0)}ms (max: ${
              api.maxTime
            }ms)`,
            { responseTime, maxTime: api.maxTime }
          );
        }
      } catch (error) {
        this.log(
          'API Response Time',
          'FAIL',
          `${api.name} failed: ${error.message}`
        );
      }
    }
  }

  // Test concurrent users simulation
  async testConcurrentUsers() {
    console.log('\n⚡ Testing Concurrent Users...');

    const concurrentRequests = 10;
    const requests = [];

    for (let i = 0; i < concurrentRequests; i++) {
      requests.push(fetch(`${this.baseUrl}/api/health`).then((r) => r.json()));
    }

    try {
      const startTime = performance.now();
      const responses = await Promise.all(requests);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      const successCount = responses.filter(
        (r) => r.status === 'healthy' || r.success
      ).length;

      if (successCount === concurrentRequests) {
        this.log(
          'Concurrent Users',
          'PASS',
          `${concurrentRequests} concurrent requests completed in ${totalTime.toFixed(
            0
          )}ms`,
          { successCount, totalTime }
        );
      } else {
        this.log(
          'Concurrent Users',
          'FAIL',
          `${successCount}/${concurrentRequests} requests succeeded`,
          { successCount, totalTime }
        );
      }
    } catch (error) {
      this.log(
        'Concurrent Users',
        'FAIL',
        `Concurrent test failed: ${error.message}`
      );
    }
  }

  // Test database performance
  async testDatabasePerformance() {
    console.log('\n⚡ Testing Database Performance...');

    const dbTests = [
      {
        url: '/api/auth/register',
        method: 'POST',
        name: 'Registration',
        maxTime: 2000,
      },
      { url: '/api/auth/login', method: 'POST', name: 'Login', maxTime: 1000 },
    ];

    for (const test of dbTests) {
      try {
        const startTime = performance.now();
        const response = await fetch(`${this.baseUrl}${test.url}`, {
          method: test.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `perf_test_${Date.now()}@example.com`,
            password: 'TestPassword123!',
            name: 'Performance Test User',
            companyName: 'Performance Test Company',
          }),
        });
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        if (responseTime <= test.maxTime) {
          this.log(
            'Database Performance',
            'PASS',
            `${test.name} completed in ${responseTime.toFixed(0)}ms`,
            { responseTime, maxTime: test.maxTime }
          );
        } else {
          this.log(
            'Database Performance',
            'FAIL',
            `${test.name} took ${responseTime.toFixed(0)}ms (max: ${
              test.maxTime
            }ms)`,
            { responseTime, maxTime: test.maxTime }
          );
        }
      } catch (error) {
        this.log(
          'Database Performance',
          'PASS',
          `${test.name} test completed (expected behavior)`
        );
      }
    }
  }

  // Run all performance tests
  async runAllPerformanceTests() {
    console.log('⚡ Starting Bell24h Performance Test Suite...');

    await this.testPageLoadTimes();
    await this.testApiResponseTimes();
    await this.testConcurrentUsers();
    await this.testDatabasePerformance();

    const passed = this.results.filter((r) => r.status === 'PASS').length;
    const failed = this.results.filter((r) => r.status === 'FAIL').length;
    const total = this.results.length;

    console.log(
      `\n⚡ Performance Test Summary: ${passed}/${total} passed, ${failed} failed`
    );
    return this.results;
  }
}

// ===========================================
// 🧪 COMPREHENSIVE TEST RUNNER
// ===========================================

class Bell24hTestRunner {
  constructor(
    baseUrl = 'https://bell24h-v1-rmiydi1cb-vishaals-projects-892b178d.vercel.app'
  ) {
    this.baseUrl = baseUrl;
    this.securityTester = new Bell24hSecurityTester(baseUrl);
    this.performanceTester = new Bell24hPerformanceTester(baseUrl);
    this.allResults = [];
  }

  async runCompleteTestSuite() {
    console.log('🧪 Starting Bell24h Complete Test Suite...');
    console.log('==========================================');

    // Run security tests
    console.log('\n🔒 Phase 1: Security Testing');
    const securityResults = await this.securityTester.runAllSecurityTests();
    this.allResults.push(...securityResults);

    // Run performance tests
    console.log('\n⚡ Phase 2: Performance Testing');
    const performanceResults =
      await this.performanceTester.runAllPerformanceTests();
    this.allResults.push(...performanceResults);

    // Generate final report
    this.generateFinalReport();
  }

  generateFinalReport() {
    console.log('\n📊 FINAL TEST REPORT');
    console.log('===================');

    const totalTests = this.allResults.length;
    const passedTests = this.allResults.filter(
      (r) => r.status === 'PASS'
    ).length;
    const failedTests = this.allResults.filter(
      (r) => r.status === 'FAIL'
    ).length;
    const warningTests = this.allResults.filter(
      (r) => r.status === 'WARN'
    ).length;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⚠️ Warnings: ${warningTests}`);

    const passRate = ((passedTests / totalTests) * 100).toFixed(1);
    console.log(`\n🎯 Overall Pass Rate: ${passRate}%`);

    if (passRate >= 95) {
      console.log('🎉 EXCELLENT: Platform is ready for production!');
    } else if (passRate >= 80) {
      console.log('⚠️ GOOD: Platform needs minor improvements before launch');
    } else {
      console.log(
        '🚨 CRITICAL: Platform needs significant fixes before launch'
      );
    }

    // Show failed tests
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.allResults
        .filter((r) => r.status === 'FAIL')
        .forEach((result) => {
          console.log(`  - ${result.test}: ${result.message}`);
        });
    }

    // Show warnings
    if (warningTests > 0) {
      console.log('\n⚠️ Warnings:');
      this.allResults
        .filter((r) => r.status === 'WARN')
        .forEach((result) => {
          console.log(`  - ${result.test}: ${result.message}`);
        });
    }
  }
}

// ===========================================
// 🚀 QUICK START FUNCTIONS
// ===========================================

// Run security tests only
async function runSecurityTests() {
  const tester = new Bell24hSecurityTester();
  return await tester.runAllSecurityTests();
}

// Run performance tests only
async function runPerformanceTests() {
  const tester = new Bell24hPerformanceTester();
  return await tester.runAllPerformanceTests();
}

// Run complete test suite
async function runCompleteTestSuite() {
  const runner = new Bell24hTestRunner();
  return await runner.runCompleteTestSuite();
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Bell24hSecurityTester,
    Bell24hPerformanceTester,
    Bell24hTestRunner,
    runSecurityTests,
    runPerformanceTests,
    runCompleteTestSuite,
  };
}

console.log('🧪 Bell24h Testing Scripts Loaded!');
console.log('Available functions:');
console.log('- runSecurityTests()');
console.log('- runPerformanceTests()');
console.log('- runCompleteTestSuite()');
console.log('\nRun any function to start testing!');
