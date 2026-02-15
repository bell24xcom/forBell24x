// scripts/load-test.js - Load testing for production readiness
const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS) || 50;
const TEST_DURATION = parseInt(process.env.TEST_DURATION) || 30000; // 30 seconds

class LoadTester {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: []
    };
    this.startTime = Date.now();
  }

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const url = new URL(path, BASE_URL);
      
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LoadTester/1.0'
        }
      };

      if (data) {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const client = url.protocol === 'https:' ? https : http;
      const req = client.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          this.results.totalRequests++;
          this.results.responseTimes.push(responseTime);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            this.results.successfulRequests++;
          } else {
            this.results.failedRequests++;
            this.results.errors.push({
              statusCode: res.statusCode,
              path,
              response: responseData.substring(0, 200)
            });
          }
          
          resolve({
            statusCode: res.statusCode,
            responseTime,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        });
      });

      req.on('error', (error) => {
        this.results.totalRequests++;
        this.results.failedRequests++;
        this.results.errors.push({
          error: error.message,
          path
        });
        resolve({ success: false, error: error.message });
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async testAuthentication() {
    console.log('🧪 Testing Authentication Flow...');
    
    const phone = `+9198765432${Math.floor(Math.random() * 100)}`;
    
    // Test OTP sending
    const otpResponse = await this.makeRequest('/api/auth/send-phone-otp', 'POST', {
      phone
    });
    
    if (otpResponse.success) {
      console.log('✅ OTP sending works');
      
      // Test OTP verification (with demo OTP)
      const verifyResponse = await this.makeRequest('/api/auth/verify-phone-otp', 'POST', {
        phone,
        otp: '123456' // Demo OTP
      });
      
      if (verifyResponse.success) {
        console.log('✅ OTP verification works');
        return true;
      } else {
        console.log('❌ OTP verification failed');
        return false;
      }
    } else {
      console.log('❌ OTP sending failed');
      return false;
    }
  }

  async testPayment() {
    console.log('💳 Testing Payment Flow...');
    
    const paymentResponse = await this.makeRequest('/api/payments/create-order', 'POST', {
      amount: 1000,
      currency: 'INR',
      description: 'Load Test Payment'
    });
    
    if (paymentResponse.success) {
      console.log('✅ Payment order creation works');
      return true;
    } else {
      console.log('❌ Payment order creation failed');
      return false;
    }
  }

  async runConcurrentTest() {
    console.log(`🚀 Starting load test with ${CONCURRENT_USERS} concurrent users...`);
    
    const promises = [];
    
    for (let i = 0; i < CONCURRENT_USERS; i++) {
      promises.push(this.testAuthentication());
      promises.push(this.testPayment());
      promises.push(this.makeRequest('/api/transactions'));
      promises.push(this.makeRequest('/'));
    }
    
    await Promise.all(promises);
  }

  generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    const avgResponseTime = this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length;
    const successRate = (this.results.successfulRequests / this.results.totalRequests) * 100;
    
    console.log('\n📊 LOAD TEST RESULTS');
    console.log('==================');
    console.log(`Duration: ${duration}ms`);
    console.log(`Total Requests: ${this.results.totalRequests}`);
    console.log(`Successful: ${this.results.successfulRequests}`);
    console.log(`Failed: ${this.results.failedRequests}`);
    console.log(`Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.results.errors.slice(0, 5).forEach((error, index) => {
        console.log(`${index + 1}. ${JSON.stringify(error)}`);
      });
    }
    
    // Performance assessment
    if (successRate >= 95 && avgResponseTime < 2000) {
      console.log('\n✅ EXCELLENT: Platform is production-ready!');
    } else if (successRate >= 90 && avgResponseTime < 3000) {
      console.log('\n⚠️  GOOD: Platform needs minor optimizations');
    } else {
      console.log('\n❌ POOR: Platform needs significant improvements');
    }
    
    return {
      successRate,
      avgResponseTime,
      totalRequests: this.results.totalRequests,
      errors: this.results.errors.length
    };
  }
}

async function runLoadTest() {
  console.log('🔧 Bell24h Load Testing Tool');
  console.log('============================');
  console.log(`Testing: ${BASE_URL}`);
  console.log(`Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`Duration: ${TEST_DURATION}ms\n`);
  
  const tester = new LoadTester();
  
  try {
    // Test individual components first
    await tester.testAuthentication();
    await tester.testPayment();
    
    // Run concurrent load test
    await tester.runConcurrentTest();
    
    // Generate report
    const report = tester.generateReport();
    
    // Exit with appropriate code
    process.exit(report.successRate >= 90 ? 0 : 1);
    
  } catch (error) {
    console.error('Load test failed:', error);
    process.exit(1);
  }
}

// Run the test
runLoadTest();
