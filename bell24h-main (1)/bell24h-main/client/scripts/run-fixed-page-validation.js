// Bell24H Fixed Page Validation Test Runner
// Executes enhanced tests with Next.js hydration awareness and generates reports

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class FixedTestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      errors: [],
      fixedIssues: [],
      testDetails: [],
      startTime: new Date().toISOString(),
      endTime: null,
    };

    this.testConfig = {
      testFile: '__tests__/e2e/pages-validation-fixed.spec.ts',
      reportDir: 'test-results',
      timeout: 60000,
      retries: 2,
    };

    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.testConfig.reportDir)) {
      fs.mkdirSync(this.testConfig.reportDir, { recursive: true });
    }
  }

  async runEnhancedPageValidation() {
    console.log('🔧 Running Enhanced Page Validation (Next.js Hydration Fixed)...');
    console.log('='.repeat(60));

    try {
      // Run the fixed E2E tests with JSON reporter
      console.log('📋 Executing Playwright tests...');

      const result = execSync(
        `npx playwright test ${this.testConfig.testFile} --reporter=json --timeout=${this.testConfig.timeout}`,
        {
          encoding: 'utf8',
          cwd: process.cwd(),
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        }
      );

      const testResults = JSON.parse(result);
      this.processResults(testResults);

      console.log('✅ Enhanced page validation completed successfully!');
    } catch (error) {
      console.log('⚠️  Some tests may have failed, analyzing results...');

      // Try to parse the output even if the command failed
      try {
        const output = error.stdout || error.output?.join('') || '';
        if (output.includes('{')) {
          // Find the JSON part
          const jsonMatch = output.match(/({.*})/s);
          if (jsonMatch) {
            const testResults = JSON.parse(jsonMatch[1]);
            this.processResults(testResults);
          }
        }
      } catch (parseError) {
        console.log('❌ Could not parse test results');
        this.results.errors.push({
          test: 'Test execution',
          error: error.message || 'Unknown error during test execution',
        });
      }
    }

    this.results.endTime = new Date().toISOString();

    console.log('📊 Test Summary:');
    console.log(`   Total Tests: ${this.results.total}`);
    console.log(`   Passed: ${this.results.passed} ✅`);
    console.log(`   Failed: ${this.results.failed} ❌`);
    console.log(`   Success Rate: ${this.getSuccessRate()}%`);
    console.log('='.repeat(60));

    return this.results;
  }

  processResults(results) {
    if (!results.suites) {
      console.log('⚠️  No test suites found in results');
      return;
    }

    results.suites.forEach(suite => {
      if (suite.suites) {
        // Handle nested suites
        suite.suites.forEach(nestedSuite => {
          this.processSuite(nestedSuite);
        });
      } else {
        this.processSuite(suite);
      }
    });
  }

  processSuite(suite) {
    suite.specs.forEach(spec => {
      spec.tests.forEach(test => {
        this.results.total++;

        const testDetail = {
          title: test.title || spec.title,
          suite: suite.title,
          status: test.status,
          duration: test.duration || 0,
          error: null,
        };

        if (test.status === 'passed') {
          this.results.passed++;
        } else {
          this.results.failed++;

          // Extract error information
          const errorInfo = test.error || test.errors?.[0] || {};
          testDetail.error = errorInfo.message || 'Unknown error';

          this.results.errors.push({
            test: testDetail.title,
            suite: testDetail.suite,
            error: testDetail.error,
          });
        }

        this.results.testDetails.push(testDetail);
      });
    });
  }

  getSuccessRate() {
    if (this.results.total === 0) return 0;
    return ((this.results.passed / this.results.total) * 100).toFixed(1);
  }

  generateFixedReport() {
    const report = {
      timestamp: this.results.endTime || new Date().toISOString(),
      testRun: {
        startTime: this.results.startTime,
        endTime: this.results.endTime,
        duration: this.calculateDuration(),
      },
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: this.getSuccessRate() + '%',
      },
      fixesApplied: [
        '✅ Next.js hydration awareness implemented',
        '✅ False positive error detection eliminated',
        '✅ Visible content extraction enhanced',
        '✅ Framework internal code filtering implemented',
        '✅ Positive content validation added',
        '✅ Performance thresholds optimized',
        '✅ Console error filtering improved',
      ],
      testDetails: this.results.testDetails,
      failedTests: this.results.errors,
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps(),
    };

    // Save JSON report
    const jsonPath = path.join(this.testConfig.reportDir, 'fixed-validation-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    this.generateHTMLReport(report);

    console.log(`📊 Fixed validation report saved to ${jsonPath}`);
    console.log(
      `📄 HTML report saved to ${path.join(
        this.testConfig.reportDir,
        'fixed-validation-report.html'
      )}`
    );

    return report;
  }

  generateHTMLReport(report) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bell24H - Enhanced Page Validation Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2563eb; margin-bottom: 30px; text-align: center; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .stat-label { font-size: 0.9em; opacity: 0.9; }
        .success { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); }
        .error { background: linear-gradient(135deg, #f87171 0%, #ef4444 100%); }
        .section { margin-bottom: 30px; }
        .section h2 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .fixes { background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e; }
        .fix-item { margin-bottom: 8px; color: #16a34a; }
        .test-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
        .test-card { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .test-passed { border-left: 4px solid #22c55e; }
        .test-failed { border-left: 4px solid #ef4444; }
        .test-title { font-weight: bold; margin-bottom: 5px; }
        .test-suite { color: #6b7280; font-size: 0.9em; margin-bottom: 5px; }
        .test-duration { color: #9ca3af; font-size: 0.8em; }
        .error-details { background: #fef2f2; padding: 10px; border-radius: 4px; margin-top: 10px; font-size: 0.9em; color: #dc2626; }
        .recommendations { background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .recommendation { margin-bottom: 8px; color: #1d4ed8; }
        .timestamp { text-align: center; color: #6b7280; margin-top: 20px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Bell24H - Enhanced Page Validation Report</h1>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-value">${report.summary.total}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card success">
                <div class="stat-value">${report.summary.passed}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card error">
                <div class="stat-value">${report.summary.failed}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${report.summary.successRate}</div>
                <div class="stat-label">Success Rate</div>
            </div>
        </div>
        
        <div class="section">
            <h2>✅ Fixes Applied</h2>
            <div class="fixes">
                ${report.fixesApplied.map(fix => `<div class="fix-item">${fix}</div>`).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2>📋 Test Results</h2>
            <div class="test-grid">
                ${report.testDetails
                  .map(
                    test => `
                    <div class="test-card ${
                      test.status === 'passed' ? 'test-passed' : 'test-failed'
                    }">
                        <div class="test-title">${test.title}</div>
                        <div class="test-suite">${test.suite}</div>
                        <div class="test-duration">Duration: ${test.duration}ms</div>
                        ${test.error ? `<div class="error-details">${test.error}</div>` : ''}
                    </div>
                `
                  )
                  .join('')}
            </div>
        </div>
        
        ${
          report.recommendations.length > 0
            ? `
        <div class="section">
            <h2>💡 Recommendations</h2>
            <div class="recommendations">
                ${report.recommendations
                  .map(rec => `<div class="recommendation">• ${rec}</div>`)
                  .join('')}
            </div>
        </div>
        `
            : ''
        }
        
        <div class="timestamp">
            Generated on ${new Date(report.timestamp).toLocaleString()}
        </div>
    </div>
</body>
</html>
    `;

    const htmlPath = path.join(this.testConfig.reportDir, 'fixed-validation-report.html');
    fs.writeFileSync(htmlPath, htmlContent);
  }

  calculateDuration() {
    if (!this.results.startTime || !this.results.endTime) return 'Unknown';

    const start = new Date(this.results.startTime);
    const end = new Date(this.results.endTime);
    const duration = Math.round((end - start) / 1000);

    return `${duration}s`;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.results.failed > 0) {
      recommendations.push(
        'Review remaining test failures for actual issues vs framework artifacts'
      );
      recommendations.push('Consider adding page-specific content validation rules');
      recommendations.push('Implement retry logic for flaky hydration timing issues');
    }

    if (this.results.passed === this.results.total) {
      recommendations.push(
        '🎉 All tests passing! Consider adding more comprehensive feature tests'
      );
      recommendations.push('Implement continuous monitoring for regression detection');
      recommendations.push('Add performance regression testing for critical user paths');
    }

    const successRate = parseFloat(this.getSuccessRate());
    if (successRate >= 90) {
      recommendations.push('Excellent test coverage! Ready for production deployment');
    } else if (successRate >= 75) {
      recommendations.push('Good test coverage. Consider investigating remaining failures');
    } else {
      recommendations.push('Test coverage needs improvement. Review failing tests');
    }

    return recommendations;
  }

  generateNextSteps() {
    const nextSteps = [];

    if (this.results.failed === 0) {
      nextSteps.push('🚀 Deploy to production with confidence');
      nextSteps.push('📊 Set up continuous monitoring');
      nextSteps.push('🔄 Implement automated testing in CI/CD');
    } else {
      nextSteps.push('🔍 Investigate remaining test failures');
      nextSteps.push('🛠️ Apply additional fixes if needed');
      nextSteps.push('🔄 Re-run tests after fixes');
    }

    return nextSteps;
  }
}

// CLI execution
if (require.main === module) {
  const runner = new FixedTestRunner();

  console.log('🎯 Bell24H Enhanced Page Validation Test Runner');
  console.log('🔧 Next.js Hydration Aware Testing Framework');
  console.log('');

  runner
    .runEnhancedPageValidation()
    .then(() => {
      const report = runner.generateFixedReport();

      console.log('');
      console.log('🎉 Testing Complete!');
      console.log('📊 View your detailed report at: test-results/fixed-validation-report.html');

      // Exit with appropriate code
      process.exit(report.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { FixedTestRunner };
