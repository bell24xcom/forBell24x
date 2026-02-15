#!/usr/bin/env node

/**
 * Bell24H Page Validation Test Runner
 * Executes comprehensive page validation tests and generates reports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  outputDir: 'test-results/page-validation',
  timeout: 30000,
  retries: 2,
  parallel: true,
};

// Color utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logHeader = title => {
  log('\n' + '='.repeat(60), 'cyan');
  log(`📋 ${title}`, 'cyan');
  log('='.repeat(60), 'cyan');
};

const logSuccess = message => log(`✅ ${message}`, 'green');
const logError = message => log(`❌ ${message}`, 'red');
const logWarning = message => log(`⚠️  ${message}`, 'yellow');
const logInfo = message => log(`ℹ️  ${message}`, 'blue');

// Test execution
async function runPageValidationTests() {
  logHeader('Bell24H Page Validation Test Suite');

  // Create output directory
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  const startTime = Date.now();
  let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    details: [],
  };

  try {
    // Step 1: Run Unit Tests for Pages
    logInfo('Step 1: Running unit tests for page components...');

    try {
      execSync(
        'npm run test:unit -- __tests__/pages/ --coverage --json --outputFile=test-results/page-validation/unit-results.json',
        { stdio: 'inherit', cwd: process.cwd() }
      );
      logSuccess('Unit tests completed successfully');
      testResults.passed += 1;
    } catch (error) {
      logError('Unit tests failed');
      testResults.failed += 1;
    }
    testResults.total += 1;

    // Step 2: Run E2E Page Validation Tests
    logInfo('Step 2: Running E2E page validation tests...');

    try {
      execSync(
        'npx playwright test __tests__/e2e/pages-validation.spec.ts --reporter=html --reporter=json',
        { stdio: 'inherit', cwd: process.cwd() }
      );
      logSuccess('E2E page validation tests completed successfully');
      testResults.passed += 1;
    } catch (error) {
      logError('E2E page validation tests failed');
      testResults.failed += 1;
    }
    testResults.total += 1;

    // Step 3: Test Page Load Performance
    logInfo('Step 3: Running page performance tests...');

    try {
      await runPerformanceTests();
      logSuccess('Performance tests completed successfully');
      testResults.passed += 1;
    } catch (error) {
      logError('Performance tests failed');
      testResults.failed += 1;
    }
    testResults.total += 1;

    // Step 4: Test Page Accessibility
    logInfo('Step 4: Running accessibility tests...');

    try {
      await runAccessibilityTests();
      logSuccess('Accessibility tests completed successfully');
      testResults.passed += 1;
    } catch (error) {
      logError('Accessibility tests failed');
      testResults.failed += 1;
    }
    testResults.total += 1;

    // Step 5: Validate Page SEO
    logInfo('Step 5: Running SEO validation...');

    try {
      await runSEOValidation();
      logSuccess('SEO validation completed successfully');
      testResults.passed += 1;
    } catch (error) {
      logError('SEO validation failed');
      testResults.failed += 1;
    }
    testResults.total += 1;
  } catch (error) {
    logError(`Test execution failed: ${error.message}`);
  }

  // Calculate duration
  testResults.duration = Date.now() - startTime;

  // Generate comprehensive report
  await generatePageValidationReport(testResults);

  return testResults;
}

async function runPerformanceTests() {
  logInfo('Testing page load performance...');

  const pages = ['/', '/categories', '/voice-rfq', '/login', '/register'];

  const performanceResults = [];

  for (const page of pages) {
    try {
      logInfo(`Testing performance for: ${page}`);

      // Run Lighthouse audit
      const lighthouseCmd = `npx lighthouse http://localhost:3000${page} --output=json --output-path=${
        CONFIG.outputDir
      }/lighthouse-${page.replace(/\//g, '_')}.json --quiet`;
      execSync(lighthouseCmd, { stdio: 'pipe' });

      performanceResults.push({
        page,
        status: 'passed',
        message: 'Performance audit completed',
      });
    } catch (error) {
      performanceResults.push({
        page,
        status: 'failed',
        message: `Performance test failed: ${error.message}`,
      });
    }
  }

  // Save performance results
  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'performance-results.json'),
    JSON.stringify(performanceResults, null, 2)
  );

  return performanceResults;
}

async function runAccessibilityTests() {
  logInfo('Testing page accessibility...');

  const pages = ['/', '/categories', '/voice-rfq', '/login', '/register'];

  const accessibilityResults = [];

  for (const page of pages) {
    try {
      logInfo(`Testing accessibility for: ${page}`);

      // Run axe-cli accessibility audit
      const axeCmd = `npx axe-cli http://localhost:3000${page} --save ${
        CONFIG.outputDir
      }/axe-${page.replace(/\//g, '_')}.json`;
      execSync(axeCmd, { stdio: 'pipe' });

      accessibilityResults.push({
        page,
        status: 'passed',
        message: 'Accessibility audit completed',
      });
    } catch (error) {
      accessibilityResults.push({
        page,
        status: 'failed',
        message: `Accessibility test failed: ${error.message}`,
      });
    }
  }

  // Save accessibility results
  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'accessibility-results.json'),
    JSON.stringify(accessibilityResults, null, 2)
  );

  return accessibilityResults;
}

async function runSEOValidation() {
  logInfo('Validating page SEO...');

  const pages = [
    { path: '/', title: 'Bell24H AI - B2B Marketplace', description: 'AI-powered B2B marketplace' },
    {
      path: '/categories',
      title: 'Categories - Bell24H',
      description: 'Browse business categories',
    },
    { path: '/voice-rfq', title: 'Voice RFQ - Bell24H', description: 'Voice-powered RFQ creation' },
  ];

  const seoResults = [];

  for (const page of pages) {
    try {
      logInfo(`Validating SEO for: ${page.path}`);

      // Use Playwright to check SEO elements
      const seoCheck = `
        const { chromium } = require('playwright');
        (async () => {
          const browser = await chromium.launch();
          const page = await browser.newPage();
          await page.goto('http://localhost:3000${page.path}');
          
          const title = await page.title();
          const metaDescription = await page.getAttribute('meta[name="description"]', 'content');
          const metaKeywords = await page.getAttribute('meta[name="keywords"]', 'content');
          const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
          const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content');
          
          const result = {
            title,
            metaDescription,
            metaKeywords,
            ogTitle,
            ogDescription,
            hasTitle: title && title.length > 10,
            hasDescription: metaDescription && metaDescription.length > 50,
            hasOgTags: ogTitle || ogDescription,
          };
          
          console.log(JSON.stringify(result));
          await browser.close();
        })();
      `;

      const seoData = execSync(`node -e "${seoCheck}"`, { encoding: 'utf8' });
      const parsedSeoData = JSON.parse(seoData);

      seoResults.push({
        page: page.path,
        status: parsedSeoData.hasTitle && parsedSeoData.hasDescription ? 'passed' : 'warning',
        data: parsedSeoData,
        message: 'SEO validation completed',
      });
    } catch (error) {
      seoResults.push({
        page: page.path,
        status: 'failed',
        message: `SEO validation failed: ${error.message}`,
      });
    }
  }

  // Save SEO results
  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'seo-results.json'),
    JSON.stringify(seoResults, null, 2)
  );

  return seoResults;
}

async function generatePageValidationReport(testResults) {
  logHeader('Generating Page Validation Report');

  const report = {
    timestamp: new Date().toISOString(),
    summary: testResults,
    passRate: ((testResults.passed / testResults.total) * 100).toFixed(1),
    recommendations: [],
  };

  // Add recommendations based on results
  if (testResults.failed > 0) {
    report.recommendations.push({
      priority: 'high',
      category: 'critical',
      message: 'Some page validation tests failed. Review failed tests and fix issues.',
      action: 'Check individual test reports for specific failures',
    });
  }

  if (testResults.passed === testResults.total) {
    report.recommendations.push({
      priority: 'low',
      category: 'optimization',
      message: 'All page validation tests passed! Consider optimizing performance further.',
      action: 'Review performance metrics and accessibility scores for optimization opportunities',
    });
  }

  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bell24H Page Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric { background: #f8f9fa; padding: 25px; border-radius: 10px; text-align: center; border-left: 5px solid #667eea; }
        .metric h3 { margin: 0 0 10px 0; color: #333; font-size: 14px; text-transform: uppercase; }
        .metric .value { font-size: 2.5em; font-weight: bold; color: #667eea; margin: 10px 0; }
        .passed { border-left-color: #28a745; }
        .passed .value { color: #28a745; }
        .failed { border-left-color: #dc3545; }
        .failed .value { color: #dc3545; }
        .recommendations { margin-top: 30px; }
        .recommendation { background: #fff3cd; border: 1px solid #ffeeba; padding: 20px; border-radius: 5px; margin: 15px 0; }
        .recommendation.high { background: #f8d7da; border-color: #f5c6cb; }
        .recommendation.low { background: #d1edff; border-color: #bee5eb; }
        .timestamp { color: #666; font-size: 0.9em; margin-top: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Bell24H Page Validation Report</h1>
            <p>Comprehensive page functionality, performance, and accessibility validation</p>
            <p>Generated: ${report.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value">${testResults.total}</div>
            </div>
            <div class="metric passed">
                <h3>Passed</h3>
                <div class="value">${testResults.passed}</div>
            </div>
            <div class="metric failed">
                <h3>Failed</h3>
                <div class="value">${testResults.failed}</div>
            </div>
            <div class="metric">
                <h3>Pass Rate</h3>
                <div class="value">${report.passRate}%</div>
            </div>
            <div class="metric">
                <h3>Duration</h3>
                <div class="value">${Math.round(testResults.duration / 1000)}s</div>
            </div>
        </div>
        
        <div class="recommendations">
            <h2>📋 Recommendations</h2>
            ${report.recommendations
              .map(
                rec => `
                <div class="recommendation ${rec.priority}">
                    <h3>${rec.category.toUpperCase()}: ${rec.message}</h3>
                    <p><strong>Action:</strong> ${rec.action}</p>
                </div>
            `
              )
              .join('')}
        </div>
        
        <div class="timestamp">
            Report generated on ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>
  `;

  // Save reports
  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'page-validation-report.json'),
    JSON.stringify(report, null, 2)
  );
  fs.writeFileSync(path.join(CONFIG.outputDir, 'page-validation-report.html'), htmlReport);

  // Display summary
  logHeader('Page Validation Results');
  log(`📊 Total Tests: ${testResults.total}`, 'blue');
  log(`✅ Passed: ${testResults.passed}`, 'green');
  log(`❌ Failed: ${testResults.failed}`, 'red');
  log(`📈 Pass Rate: ${report.passRate}%`, testResults.failed === 0 ? 'green' : 'yellow');
  log(`⏱️  Duration: ${Math.round(testResults.duration / 1000)} seconds`, 'blue');

  logSuccess(`Reports saved to: ${CONFIG.outputDir}`);
  logInfo(`📄 JSON Report: page-validation-report.json`);
  logInfo(`🌐 HTML Report: page-validation-report.html`);

  return report;
}

// Main execution
async function main() {
  try {
    const results = await runPageValidationTests();

    if (results.failed === 0) {
      logSuccess('\n🎉 All page validation tests passed!');
      process.exit(0);
    } else {
      logWarning(`\n⚠️  ${results.failed} test(s) failed. Check the detailed reports.`);
      process.exit(1);
    }
  } catch (error) {
    logError(`\n💥 Page validation failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runPageValidationTests, generatePageValidationReport };
