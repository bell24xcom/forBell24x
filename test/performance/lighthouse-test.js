const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function runLighthouse(url, opts = {}, config = null) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  opts.port = chrome.port;

  const results = await lighthouse(url, opts, config);
  await chrome.kill();

  return results;
}

async function runPerformanceTests() {
  const urls = [
    'https://bell24h.com',
    'https://bell24h.com/dashboard',
    'https://bell24h.com/rfq/create',
    'https://bell24h.com/rfq/list',
    'https://bell24h.com/profile',
    'https://bell24h.com/settings',
  ];

  const results = {};

  for (const url of urls) {
    console.log(`Testing ${url}...`);
    
    const result = await runLighthouse(url, {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
    });

    results[url] = {
      performance: result.lhr.categories.performance.score * 100,
      accessibility: result.lhr.categories.accessibility.score * 100,
      bestPractices: result.lhr.categories['best-practices'].score * 100,
      seo: result.lhr.categories.seo.score * 100,
      metrics: {
        firstContentfulPaint: result.lhr.audits['first-contentful-paint'].numericValue,
        speedIndex: result.lhr.audits['speed-index'].numericValue,
        largestContentfulPaint: result.lhr.audits['largest-contentful-paint'].numericValue,
        timeToInteractive: result.lhr.audits['interactive'].numericValue,
        totalBlockingTime: result.lhr.audits['total-blocking-time'].numericValue,
        cumulativeLayoutShift: result.lhr.audits['cumulative-layout-shift'].numericValue,
      },
    };

    // Generate HTML report
    const reportHtml = result.report;
    const reportPath = path.join(__dirname, 'reports', `${url.replace(/[^a-z0-9]/gi, '_')}.html`);
    fs.writeFileSync(reportPath, reportHtml);
  }

  // Generate summary report
  const summary = {
    timestamp: new Date().toISOString(),
    results,
    averages: {
      performance: Object.values(results).reduce((sum, r) => sum + r.performance, 0) / urls.length,
      accessibility: Object.values(results).reduce((sum, r) => sum + r.accessibility, 0) / urls.length,
      bestPractices: Object.values(results).reduce((sum, r) => sum + r.bestPractices, 0) / urls.length,
      seo: Object.values(results).reduce((sum, r) => sum + r.seo, 0) / urls.length,
    },
  };

  fs.writeFileSync(
    path.join(__dirname, 'reports', 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  // Generate markdown report
  const markdownReport = generateMarkdownReport(summary);
  fs.writeFileSync(
    path.join(__dirname, 'reports', 'summary.md'),
    markdownReport
  );

  return summary;
}

function generateMarkdownReport(summary) {
  let report = `# Lighthouse Performance Report\n\n`;
  report += `Generated on: ${summary.timestamp}\n\n`;

  report += `## Overall Scores\n\n`;
  report += `| Metric | Score |\n`;
  report += `|--------|-------|\n`;
  report += `| Performance | ${summary.averages.performance.toFixed(1)} |\n`;
  report += `| Accessibility | ${summary.averages.accessibility.toFixed(1)} |\n`;
  report += `| Best Practices | ${summary.averages.bestPractices.toFixed(1)} |\n`;
  report += `| SEO | ${summary.averages.seo.toFixed(1)} |\n\n`;

  report += `## Detailed Results\n\n`;
  for (const [url, result] of Object.entries(summary.results)) {
    report += `### ${url}\n\n`;
    report += `| Metric | Score |\n`;
    report += `|--------|-------|\n`;
    report += `| Performance | ${result.performance.toFixed(1)} |\n`;
    report += `| Accessibility | ${result.accessibility.toFixed(1)} |\n`;
    report += `| Best Practices | ${result.bestPractices.toFixed(1)} |\n`;
    report += `| SEO | ${result.seo.toFixed(1)} |\n\n`;

    report += `#### Performance Metrics\n\n`;
    report += `| Metric | Value |\n`;
    report += `|--------|-------|\n`;
    report += `| First Contentful Paint | ${result.metrics.firstContentfulPaint.toFixed(0)}ms |\n`;
    report += `| Speed Index | ${result.metrics.speedIndex.toFixed(0)}ms |\n`;
    report += `| Largest Contentful Paint | ${result.metrics.largestContentfulPaint.toFixed(0)}ms |\n`;
    report += `| Time to Interactive | ${result.metrics.timeToInteractive.toFixed(0)}ms |\n`;
    report += `| Total Blocking Time | ${result.metrics.totalBlockingTime.toFixed(0)}ms |\n`;
    report += `| Cumulative Layout Shift | ${result.metrics.cumulativeLayoutShift.toFixed(2)} |\n\n`;
  }

  return report;
}

// Run tests
runPerformanceTests()
  .then(summary => {
    console.log('Performance testing completed!');
    console.log('Check the reports directory for detailed results.');
  })
  .catch(err => {
    console.error('Error running performance tests:', err);
    process.exit(1);
  }); 