#!/usr/bin/env node

/**
 * BELL24H PHASE 3 - Performance Testing Script
 * Automated testing for critical performance metrics
 */

const https = require('https');
const http = require('http');

class Phase3Tester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.results = {
      homepage: {},
      videoRfq: {},
      voiceRfq: {},
      dashboard: {},
      performance: {},
      issues: [],
    };
  }

  // Test page load time
  async testPageLoad(path, pageName) {
    return new Promise(resolve => {
      const startTime = Date.now();

      const req = http
        .get(`${this.baseUrl}${path}`, res => {
          const endTime = Date.now();
          const loadTime = endTime - startTime;

          console.log(`✅ ${pageName}: ${loadTime}ms`);

          const result = {
            path,
            loadTime,
            status: res.statusCode,
            success: res.statusCode === 200 && loadTime < 2000,
          };

          if (loadTime > 2000) {
            this.results.issues.push(`${pageName} load time: ${loadTime}ms (> 2000ms target)`);
          }

          resolve(result);
        })
        .on('error', err => {
          console.log(`❌ ${pageName}: Error - ${err.message}`);
          this.results.issues.push(`${pageName}: ${err.message}`);
          resolve({ path, error: err.message, success: false });
        });

      req.setTimeout(5000, () => {
        req.destroy();
        console.log(`❌ ${pageName}: Timeout (>5s)`);
        this.results.issues.push(`${pageName}: Timeout (>5s)`);
        resolve({ path, error: 'Timeout', success: false });
      });
    });
  }

  // Test critical pages
  async runCriticalPagesTest() {
    console.log('\n🚀 BELL24H PHASE 3 - CRITICAL PAGES TESTING\n');

    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/video-rfq', name: 'Video RFQ' },
      { path: '/voice-rfq', name: 'Voice RFQ' },
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/login', name: 'Login' },
      { path: '/register', name: 'Register' },
    ];

    for (const page of pages) {
      const result = await this.testPageLoad(page.path, page.name);
      this.results[page.name.toLowerCase().replace(' ', '')] = result;

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Generate testing report
  generateReport() {
    console.log('\n📊 PHASE 3 TESTING REPORT\n');
    console.log('='.repeat(50));

    // Performance Summary
    const allPages = Object.values(this.results).filter(r => r.loadTime);
    const avgLoadTime = allPages.reduce((sum, page) => sum + page.loadTime, 0) / allPages.length;
    const fastPages = allPages.filter(page => page.loadTime < 2000).length;

    console.log(`\n🎯 PERFORMANCE SUMMARY:`);
    console.log(`   Average Load Time: ${Math.round(avgLoadTime)}ms`);
    console.log(`   Pages < 2s: ${fastPages}/${allPages.length}`);
    console.log(
      `   Performance Target: ${fastPages === allPages.length ? '✅ PASSED' : '❌ NEEDS WORK'}`
    );

    // Issues Summary
    if (this.results.issues.length > 0) {
      console.log(`\n⚠️  ISSUES FOUND (${this.results.issues.length}):`);
      this.results.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    } else {
      console.log(`\n✅ NO CRITICAL ISSUES FOUND`);
    }

    // Next Steps
    console.log(`\n🚀 NEXT STEPS FOR PHASE 3:`);
    console.log(`   1. Open PHASE3_TESTING_CHECKLIST.md`);
    console.log(`   2. Begin systematic homepage testing`);
    console.log(`   3. Test Video RFQ integration thoroughly`);
    console.log(`   4. Verify mobile experience`);
    console.log(`   5. Document findings in checklist`);

    console.log('\n' + '='.repeat(50));
    console.log('📋 PHASE 3 TESTING READY - BEGIN SYSTEMATIC TESTING');
    console.log('='.repeat(50));
  }

  // Run complete test suite
  async runPhase3Tests() {
    try {
      await this.runCriticalPagesTest();
      this.generateReport();
    } catch (error) {
      console.error('Testing error:', error);
    }
  }
}

// Execute if called directly
if (require.main === module) {
  const tester = new Phase3Tester();
  tester.runPhase3Tests();
}

module.exports = Phase3Tester;
