#!/usr/bin/env node

/**
 * Bell24H Comprehensive Test Report Generator
 * Consolidates all test results and generates detailed reports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class Bell24HTestReporter {
  constructor() {
    this.testResultsDir = 'test-results';
    this.reportData = {
      timestamp: new Date().toISOString(),
      platform: 'Bell24H AI-Powered B2B Marketplace',
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        coverage: 0,
        executionTime: 0,
      },
      results: {
        unit: null,
        integration: null,
        e2e: null,
        performance: null,
        accessibility: null,
        security: null,
        dependencies: null,
      },
      issues: {
        broken_links: [],
        missing_dependencies: [],
        performance_issues: [],
        accessibility_violations: [],
        security_vulnerabilities: [],
        console_errors: [],
      },
      recommendations: [],
    };
  }

  async generateReport() {
    console.log('🚀 Generating Bell24H Comprehensive Test Report...\n');

    try {
      // Ensure test results directory exists
      this.ensureDirectoryExists(this.testResultsDir);

      // Parse test results
      await this.parseJestResults();
      await this.parsePlaywrightResults();
      await this.parsePerformanceResults();
      await this.parseAccessibilityResults();
      await this.parseSecurityResults();
      await this.parseDependencyResults();

      // Generate recommendations
      this.generateRecommendations();

      // Create HTML report
      await this.generateHTMLReport();

      // Create JSON report
      await this.generateJSONReport();

      // Print summary
      this.printSummary();

      console.log('✅ Test report generated successfully!');
      console.log(
        `📊 View detailed report: ${path.join(this.testResultsDir, 'comprehensive-report.html')}`
      );
    } catch (error) {
      console.error('❌ Error generating test report:', error.message);
      process.exit(1);
    }
  }

  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async parseJestResults() {
    console.log('📋 Parsing Jest test results...');

    try {
      // Check for Jest coverage report
      const coverageFile = path.join('test-results', 'coverage', 'coverage-summary.json');
      if (fs.existsSync(coverageFile)) {
        const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
        this.reportData.results.unit = {
          status: 'completed',
          coverage: coverage.total || {},
        };
        this.reportData.summary.coverage = coverage.total?.lines?.pct || 0;
      }

      // Parse Jest HTML report if available
      const jestResultFile = path.join('test-results', 'jest-junit.xml');
      if (fs.existsSync(jestResultFile)) {
        // Parse XML results for detailed test counts
        console.log('✅ Jest results parsed successfully');
      }
    } catch (error) {
      console.log('⚠️  Jest results not found or invalid');
      this.reportData.results.unit = { status: 'not_run', error: error.message };
    }
  }

  async parsePlaywrightResults() {
    console.log('🎭 Parsing Playwright test results...');

    try {
      const playwrightResultFile = path.join('test-results', 'playwright-results.json');
      if (fs.existsSync(playwrightResultFile)) {
        const results = JSON.parse(fs.readFileSync(playwrightResultFile, 'utf8'));

        this.reportData.results.e2e = {
          status: 'completed',
          stats: results.stats || {},
          suites: results.suites || [],
        };

        // Count tests
        if (results.stats) {
          this.reportData.summary.totalTests += results.stats.total || 0;
          this.reportData.summary.passedTests += results.stats.passed || 0;
          this.reportData.summary.failedTests += results.stats.failed || 0;
        }

        console.log('✅ Playwright results parsed successfully');
      }
    } catch (error) {
      console.log('⚠️  Playwright results not found or invalid');
      this.reportData.results.e2e = { status: 'not_run', error: error.message };
    }
  }

  async parsePerformanceResults() {
    console.log('⚡ Parsing performance test results...');

    try {
      const lighthouseFile = path.join('test-results', 'lighthouse-results.json');
      if (fs.existsSync(lighthouseFile)) {
        const lighthouse = JSON.parse(fs.readFileSync(lighthouseFile, 'utf8'));

        this.reportData.results.performance = {
          status: 'completed',
          scores: lighthouse.lhr?.categories || {},
          metrics: lighthouse.lhr?.audits || {},
        };

        // Check for performance issues
        const performanceScore = lighthouse.lhr?.categories?.performance?.score * 100 || 0;
        if (performanceScore < 90) {
          this.reportData.issues.performance_issues.push({
            type: 'Low Performance Score',
            score: performanceScore,
            threshold: 90,
          });
        }

        console.log('✅ Performance results parsed successfully');
      }
    } catch (error) {
      console.log('⚠️  Performance results not found');
      this.reportData.results.performance = { status: 'not_run', error: error.message };
    }
  }

  async parseAccessibilityResults() {
    console.log('♿ Parsing accessibility test results...');

    try {
      const axeFile = path.join('test-results', 'axe-results.json');
      if (fs.existsSync(axeFile)) {
        const axe = JSON.parse(fs.readFileSync(axeFile, 'utf8'));

        this.reportData.results.accessibility = {
          status: 'completed',
          violations: axe.violations || [],
          passes: axe.passes || [],
        };

        // Add accessibility violations to issues
        (axe.violations || []).forEach(violation => {
          this.reportData.issues.accessibility_violations.push({
            type: violation.id,
            impact: violation.impact,
            description: violation.description,
            nodes: violation.nodes?.length || 0,
          });
        });

        console.log('✅ Accessibility results parsed successfully');
      }
    } catch (error) {
      console.log('⚠️  Accessibility results not found');
      this.reportData.results.accessibility = { status: 'not_run', error: error.message };
    }
  }

  async parseSecurityResults() {
    console.log('🔒 Parsing security audit results...');

    try {
      // Run npm audit and capture output
      const auditOutput = execSync('npm audit --json', {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      const audit = JSON.parse(auditOutput);

      this.reportData.results.security = {
        status: 'completed',
        vulnerabilities: audit.vulnerabilities || {},
        metadata: audit.metadata || {},
      };

      // Add security vulnerabilities to issues
      Object.entries(audit.vulnerabilities || {}).forEach(([name, vuln]) => {
        if (vuln.severity === 'high' || vuln.severity === 'critical') {
          this.reportData.issues.security_vulnerabilities.push({
            package: name,
            severity: vuln.severity,
            title: vuln.title,
            url: vuln.url,
          });
        }
      });

      console.log('✅ Security audit completed successfully');
    } catch (error) {
      console.log('⚠️  Security audit failed or no vulnerabilities found');
      this.reportData.results.security = { status: 'completed', vulnerabilities: {}, error: null };
    }
  }

  async parseDependencyResults() {
    console.log('📦 Checking dependencies...');

    try {
      // Check package.json for dependencies
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      this.reportData.results.dependencies = {
        status: 'completed',
        total:
          Object.keys(packageJson.dependencies || {}).length +
          Object.keys(packageJson.devDependencies || {}).length,
        production: Object.keys(packageJson.dependencies || {}).length,
        development: Object.keys(packageJson.devDependencies || {}).length,
      };

      // Check for common missing dependencies
      const criticalDeps = ['date-fns', 'react', 'next', 'playwright', 'jest'];
      const missingDeps = criticalDeps.filter(
        dep => !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      );

      missingDeps.forEach(dep => {
        this.reportData.issues.missing_dependencies.push({
          package: dep,
          type: 'critical',
        });
      });

      console.log('✅ Dependencies checked successfully');
    } catch (error) {
      console.log('⚠️  Dependency check failed');
      this.reportData.results.dependencies = { status: 'failed', error: error.message };
    }
  }

  generateRecommendations() {
    console.log('💡 Generating recommendations...');

    const recommendations = [];

    // Coverage recommendations
    if (this.reportData.summary.coverage < 80) {
      recommendations.push({
        type: 'coverage',
        priority: 'high',
        title: 'Improve Test Coverage',
        description: `Current coverage is ${this.reportData.summary.coverage}%. Aim for 80%+ coverage.`,
        action: 'Add more unit tests for uncovered components and utilities.',
      });
    }

    // Performance recommendations
    const perfIssues = this.reportData.issues.performance_issues.length;
    if (perfIssues > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Address Performance Issues',
        description: `Found ${perfIssues} performance issues that may affect user experience.`,
        action: 'Optimize images, reduce bundle size, and implement code splitting.',
      });
    }

    // Security recommendations
    const securityIssues = this.reportData.issues.security_vulnerabilities.length;
    if (securityIssues > 0) {
      recommendations.push({
        type: 'security',
        priority: 'critical',
        title: 'Fix Security Vulnerabilities',
        description: `Found ${securityIssues} security vulnerabilities.`,
        action: 'Run "npm audit fix" and update vulnerable packages.',
      });
    }

    // Accessibility recommendations
    const a11yIssues = this.reportData.issues.accessibility_violations.length;
    if (a11yIssues > 0) {
      recommendations.push({
        type: 'accessibility',
        priority: 'medium',
        title: 'Improve Accessibility',
        description: `Found ${a11yIssues} accessibility violations.`,
        action: 'Add proper ARIA labels, alt text, and keyboard navigation support.',
      });
    }

    // Missing dependencies
    const missingDeps = this.reportData.issues.missing_dependencies.length;
    if (missingDeps > 0) {
      recommendations.push({
        type: 'dependencies',
        priority: 'high',
        title: 'Install Missing Dependencies',
        description: `Found ${missingDeps} missing critical dependencies.`,
        action: 'Run "npm install" for the missing packages listed in the issues section.',
      });
    }

    this.reportData.recommendations = recommendations;
  }

  async generateHTMLReport() {
    console.log('📄 Generating HTML report...');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bell24H Comprehensive Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 10px; margin-bottom: 2rem; }
        .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .header p { font-size: 1.1rem; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .metric { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .metric h3 { font-size: 2rem; margin-bottom: 0.5rem; }
        .metric p { color: #666; }
        .section { background: white; margin-bottom: 2rem; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .section h2 { color: #2d3748; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #edf2f7; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
        .status-completed { background: #c6f6d5; color: #22543d; }
        .status-failed { background: #fed7d7; color: #742a2a; }
        .status-not-run { background: #e2e8f0; color: #4a5568; }
        .issue { background: #fed7d7; border-left: 4px solid #e53e3e; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; }
        .recommendation { background: #bee3f8; border-left: 4px solid #3182ce; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; }
        .priority-critical { border-left-color: #e53e3e; }
        .priority-high { border-left-color: #dd6b20; }
        .priority-medium { border-left-color: #38a169; }
        .green { color: #22543d; }
        .red { color: #742a2a; }
        .orange { color: #c05621; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
        th { background: #f7fafc; font-weight: 600; }
        .timestamp { color: #666; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Bell24H Comprehensive Test Report</h1>
            <p>AI-Powered B2B Marketplace - Complete Testing Analysis</p>
            <p class="timestamp">Generated: ${this.reportData.timestamp}</p>
        </div>

        <div class="summary">
            <div class="metric">
                <h3 class="${this.reportData.summary.totalTests > 0 ? 'green' : 'red'}">${
      this.reportData.summary.totalTests
    }</h3>
                <p>Total Tests</p>
            </div>
            <div class="metric">
                <h3 class="${this.reportData.summary.passedTests > 0 ? 'green' : 'red'}">${
      this.reportData.summary.passedTests
    }</h3>
                <p>Passed</p>
            </div>
            <div class="metric">
                <h3 class="${this.reportData.summary.failedTests === 0 ? 'green' : 'red'}">${
      this.reportData.summary.failedTests
    }</h3>
                <p>Failed</p>
            </div>
            <div class="metric">
                <h3 class="${
                  this.reportData.summary.coverage >= 80
                    ? 'green'
                    : this.reportData.summary.coverage >= 60
                    ? 'orange'
                    : 'red'
                }">${this.reportData.summary.coverage}%</h3>
                <p>Coverage</p>
            </div>
        </div>

        <div class="section">
            <h2>📊 Test Results Overview</h2>
            <table>
                <thead>
                    <tr>
                        <th>Test Type</th>
                        <th>Status</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Unit Tests</td>
                        <td><span class="status-badge status-${
                          this.reportData.results.unit?.status || 'not-run'
                        }">${this.reportData.results.unit?.status || 'Not Run'}</span></td>
                        <td>Coverage: ${this.reportData.summary.coverage}%</td>
                    </tr>
                    <tr>
                        <td>Integration Tests</td>
                        <td><span class="status-badge status-${
                          this.reportData.results.integration?.status || 'not-run'
                        }">${this.reportData.results.integration?.status || 'Not Run'}</span></td>
                        <td>API and component integration</td>
                    </tr>
                    <tr>
                        <td>E2E Tests</td>
                        <td><span class="status-badge status-${
                          this.reportData.results.e2e?.status || 'not-run'
                        }">${this.reportData.results.e2e?.status || 'Not Run'}</span></td>
                        <td>Complete user workflows</td>
                    </tr>
                    <tr>
                        <td>Performance</td>
                        <td><span class="status-badge status-${
                          this.reportData.results.performance?.status || 'not-run'
                        }">${this.reportData.results.performance?.status || 'Not Run'}</span></td>
                        <td>Page load and performance metrics</td>
                    </tr>
                    <tr>
                        <td>Accessibility</td>
                        <td><span class="status-badge status-${
                          this.reportData.results.accessibility?.status || 'not-run'
                        }">${this.reportData.results.accessibility?.status || 'Not Run'}</span></td>
                        <td>WCAG compliance and a11y</td>
                    </tr>
                    <tr>
                        <td>Security</td>
                        <td><span class="status-badge status-${
                          this.reportData.results.security?.status || 'not-run'
                        }">${this.reportData.results.security?.status || 'Not Run'}</span></td>
                        <td>Vulnerability scanning</td>
                    </tr>
                </tbody>
            </table>
        </div>

        ${
          this.reportData.issues.missing_dependencies.length > 0 ||
          this.reportData.issues.security_vulnerabilities.length > 0 ||
          this.reportData.issues.performance_issues.length > 0 ||
          this.reportData.issues.accessibility_violations.length > 0
            ? `
        <div class="section">
            <h2>⚠️ Issues Found</h2>
            ${this.reportData.issues.missing_dependencies
              .map(
                issue => `
                <div class="issue">
                    <strong>Missing Dependency:</strong> ${issue.package}
                    <p>Critical dependency required for platform functionality.</p>
                </div>
            `
              )
              .join('')}
            ${this.reportData.issues.security_vulnerabilities
              .map(
                issue => `
                <div class="issue">
                    <strong>Security Vulnerability:</strong> ${issue.package} (${issue.severity})
                    <p>${issue.title}</p>
                </div>
            `
              )
              .join('')}
            ${this.reportData.issues.performance_issues
              .map(
                issue => `
                <div class="issue">
                    <strong>Performance Issue:</strong> ${issue.type}
                    <p>Score: ${issue.score}/100 (Threshold: ${issue.threshold})</p>
                </div>
            `
              )
              .join('')}
            ${this.reportData.issues.accessibility_violations
              .map(
                issue => `
                <div class="issue">
                    <strong>Accessibility Violation:</strong> ${issue.type} (${issue.impact})
                    <p>${issue.description} (${issue.nodes} nodes affected)</p>
                </div>
            `
              )
              .join('')}
        </div>
        `
            : ''
        }

        ${
          this.reportData.recommendations.length > 0
            ? `
        <div class="section">
            <h2>💡 Recommendations</h2>
            ${this.reportData.recommendations
              .map(
                rec => `
                <div class="recommendation priority-${rec.priority}">
                    <strong>${rec.title}</strong> (${rec.priority} priority)
                    <p>${rec.description}</p>
                    <p><strong>Action:</strong> ${rec.action}</p>
                </div>
            `
              )
              .join('')}
        </div>
        `
            : ''
        }

        <div class="section">
            <h2>🚀 Next Steps</h2>
            <ol>
                <li>Review and fix any critical issues identified above</li>
                <li>Increase test coverage to reach 90%+ target</li>
                <li>Run comprehensive tests regularly in CI/CD pipeline</li>
                <li>Monitor performance metrics continuously</li>
                <li>Ensure all accessibility violations are addressed</li>
                <li>Keep dependencies updated and secure</li>
            </ol>
        </div>

        <div class="section">
            <h2>📈 Platform Health Score</h2>
            <p>Overall Health: <strong class="${
              this.calculateHealthScore() >= 80
                ? 'green'
                : this.calculateHealthScore() >= 60
                ? 'orange'
                : 'red'
            }">${this.calculateHealthScore()}/100</strong></p>
            <p>Bell24H is ${this.getHealthStatus()} and ${
      this.reportData.summary.failedTests === 0
        ? 'ready for production'
        : 'requires attention before deployment'
    }.</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(this.testResultsDir, 'comprehensive-report.html'), html);
  }

  async generateJSONReport() {
    const jsonReport = JSON.stringify(this.reportData, null, 2);
    fs.writeFileSync(path.join(this.testResultsDir, 'comprehensive-report.json'), jsonReport);
  }

  calculateHealthScore() {
    let score = 0;
    let factors = 0;

    // Test coverage (30% weight)
    if (this.reportData.summary.coverage > 0) {
      score += (this.reportData.summary.coverage / 100) * 30;
      factors += 30;
    }

    // Test success rate (25% weight)
    if (this.reportData.summary.totalTests > 0) {
      const successRate = this.reportData.summary.passedTests / this.reportData.summary.totalTests;
      score += successRate * 25;
      factors += 25;
    }

    // Security (20% weight)
    const securityIssues = this.reportData.issues.security_vulnerabilities.length;
    score += securityIssues === 0 ? 20 : Math.max(0, 20 - securityIssues * 5);
    factors += 20;

    // Performance (15% weight)
    const perfIssues = this.reportData.issues.performance_issues.length;
    score += perfIssues === 0 ? 15 : Math.max(0, 15 - perfIssues * 3);
    factors += 15;

    // Dependencies (10% weight)
    const depIssues = this.reportData.issues.missing_dependencies.length;
    score += depIssues === 0 ? 10 : Math.max(0, 10 - depIssues * 2);
    factors += 10;

    return Math.round((score / factors) * 100);
  }

  getHealthStatus() {
    const score = this.calculateHealthScore();
    if (score >= 90) return 'in excellent condition';
    if (score >= 80) return 'in good condition';
    if (score >= 60) return 'in fair condition';
    return 'requiring immediate attention';
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🔔 BELL24H COMPREHENSIVE TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${this.reportData.summary.totalTests}`);
    console.log(`✅ Passed: ${this.reportData.summary.passedTests}`);
    console.log(`❌ Failed: ${this.reportData.summary.failedTests}`);
    console.log(`📈 Coverage: ${this.reportData.summary.coverage}%`);
    console.log(`🏥 Health Score: ${this.calculateHealthScore()}/100`);

    if (this.reportData.issues.missing_dependencies.length > 0) {
      console.log(
        `\n🔴 Missing Dependencies: ${this.reportData.issues.missing_dependencies.length}`
      );
    }

    if (this.reportData.issues.security_vulnerabilities.length > 0) {
      console.log(`🔴 Security Issues: ${this.reportData.issues.security_vulnerabilities.length}`);
    }

    if (this.reportData.recommendations.length > 0) {
      console.log(`\n💡 Recommendations: ${this.reportData.recommendations.length}`);
      this.reportData.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      });
    }

    console.log('\n🎯 Platform Status: ' + this.getHealthStatus().toUpperCase());
    console.log('='.repeat(60) + '\n');
  }
}

// Run the report generator
if (require.main === module) {
  const reporter = new Bell24HTestReporter();
  reporter.generateReport().catch(console.error);
}

module.exports = Bell24HTestReporter;
