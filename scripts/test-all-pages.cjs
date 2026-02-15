#!/usr/bin/env node

/**
 * Test All Pages Load Without Errors
 * Verifies that all 34 pages work correctly at localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

class PageTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.pagesToTest = [
      '/',
      '/marketplace',
      '/suppliers',
      '/rfq/create',
      '/register',
      '/login',
      '/categories/textiles-garments',
      '/categories/pharmaceuticals',
      '/categories/agricultural-products',
      '/categories/automotive-parts',
      '/categories/it-services',
      '/categories/gems-jewelry',
      '/categories/handicrafts',
      '/categories/machinery-equipment',
      '/categories/chemicals',
      '/categories/food-processing',
      '/categories/construction',
      '/categories/metals-steel',
      '/categories/plastics',
      '/categories/paper-packaging',
      '/categories/rubber',
      '/categories/ceramics',
      '/categories/glass',
      '/categories/wood',
      '/categories/leather',
      '/dashboard/ai-features',
      '/fintech',
      '/wallet',
      '/voice-rfq',
      '/about',
      '/contact',
      '/privacy',
      '/terms',
      '/help'
    ];
    this.testResults = [];
  }

  async run() {
    console.log('🧪 TESTING ALL PAGES');
    console.log('====================\n');

    try {
      // Step 1: Check if development server is running
      await this.checkServerRunning();
      
      // Step 2: Test all pages
      await this.testAllPages();
      
      // Step 3: Generate test report
      await this.generateTestReport();
      
      console.log('\n✅ PAGE TESTING COMPLETE!');
      
    } catch (error) {
      console.error('❌ Testing failed:', error.message);
      process.exit(1);
    }
  }

  async checkServerRunning() {
    console.log('🔍 Step 1: Checking if development server is running...');
    
    try {
      const response = await this.makeRequest('/');
      if (response.statusCode === 200) {
        console.log('✅ Development server is running at localhost:3000');
      } else {
        throw new Error(`Server responded with status ${response.statusCode}`);
      }
    } catch (error) {
      console.log('❌ Development server is not running');
      console.log('💡 Start the server with: npm run dev');
      throw new Error('Development server not running');
    }
  }

  async testAllPages() {
    console.log('\n🧪 Step 2: Testing all pages...');
    
    for (const page of this.pagesToTest) {
      await this.testPage(page);
    }
    
    const successful = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    
    console.log(`\n📊 Test Results:`);
    console.log(`  ✅ Successful: ${successful}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  📊 Total: ${this.testResults.length}`);
  }

  async testPage(page) {
    try {
      const response = await this.makeRequest(page);
      
      if (response.statusCode === 200) {
        console.log(`  ✅ ${page} - Working (${response.statusCode})`);
        this.testResults.push({
          page,
          success: true,
          statusCode: response.statusCode,
          responseTime: response.responseTime,
          error: null
        });
      } else {
        console.log(`  ⚠️  ${page} - Status ${response.statusCode}`);
        this.testResults.push({
          page,
          success: false,
          statusCode: response.statusCode,
          responseTime: response.responseTime,
          error: `HTTP ${response.statusCode}`
        });
      }
    } catch (error) {
      console.log(`  ❌ ${page} - Error: ${error.message}`);
      this.testResults.push({
        page,
        success: false,
        statusCode: null,
        responseTime: null,
        error: error.message
      });
    }
  }

  makeRequest(path) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const req = http.get(`${this.baseUrl}${path}`, (res) => {
        const responseTime = Date.now() - startTime;
        
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            responseTime,
            data: data.substring(0, 200) // First 200 chars
          });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async generateTestReport() {
    console.log('\n📊 Step 3: Generating test report...');
    
    const successful = this.testResults.filter(r => r.success);
    const failed = this.testResults.filter(r => !r.success);
    
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      totalPages: this.testResults.length,
      successful: successful.length,
      failed: failed.length,
      successRate: Math.round((successful.length / this.testResults.length) * 100),
      testResults: this.testResults,
      summary: {
        allPagesWorking: failed.length === 0,
        needsAttention: failed.length > 0,
        averageResponseTime: Math.round(
          successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length
        )
      }
    };
    
    // Save JSON report
    fs.writeFileSync(
      path.join(process.cwd(), 'page-test-report.json'),
      JSON.stringify(report, null, 2)
    );
    console.log('  ✅ JSON report: page-test-report.json');
    
    // Generate Markdown report
    const markdownReport = `# Page Test Report
Generated: ${new Date().toLocaleString()}

## Summary
- **Base URL:** ${report.baseUrl}
- **Total Pages Tested:** ${report.totalPages}
- **Successful:** ${report.successful} ✅
- **Failed:** ${report.failed} ❌
- **Success Rate:** ${report.successRate}%
- **Average Response Time:** ${report.summary.averageResponseTime}ms

## Test Results

### ✅ Working Pages (${report.successful})
${successful.map(r => `- ${r.page} (${r.statusCode}, ${r.responseTime}ms)`).join('\n')}

### ❌ Failed Pages (${report.failed})
${failed.length > 0 ? 
  failed.map(r => `- ${r.page} - ${r.error}`).join('\n') : 
  'None - all pages working!'
}

## Overall Status
${report.summary.allPagesWorking ? 
  '✅ **ALL PAGES WORKING** - Ready for development!' :
  '⚠️  **SOME PAGES FAILED** - Fix issues before development'
}

## Next Steps
${report.summary.allPagesWorking ? 
  'You can now proceed with adding new features safely.' :
  'Fix the failed pages before continuing development.'
}

---
*Report generated by Page Testing System*
`;
    
    fs.writeFileSync(
      path.join(process.cwd(), 'page-test-report.md'),
      markdownReport
    );
    console.log('  ✅ Markdown report: page-test-report.md');
  }
}

// Run the testing
const tester = new PageTester();
tester.run().catch(console.error);
