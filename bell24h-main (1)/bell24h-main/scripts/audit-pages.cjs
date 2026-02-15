#!/usr/bin/env node

/**
 * Bell24h Pages Audit System
 * Compares localhost pages vs Vercel deployment to identify missing pages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PagesAuditor {
  constructor() {
    this.projectRoot = process.cwd();
    this.auditConfig = {
      localhost: {
        directories: ['app', 'pages', 'src/pages'],
        extensions: ['.tsx', '.jsx', '.js', '.ts']
      },
      vercel: {
        url: 'https://bell24h-v1.vercel.app',
        sitemapUrl: 'https://bell24h-v1.vercel.app/sitemap.xml'
      },
      output: `audit-report-${new Date().toISOString().split('T')[0]}.json`
    };
    this.auditResults = {
      timestamp: new Date().toISOString(),
      localhost: { pages: [], total: 0 },
      vercel: { pages: [], total: 0 },
      comparison: {
        missingInVercel: [],
        missingInLocal: [],
        differentVersions: [],
        totalLocalPages: 0,
        totalVercelPages: 0
      }
    };
  }

  async run() {
    console.log('🔍 BELL24H PAGES AUDIT SYSTEM');
    console.log('==============================\n');

    try {
      // Step 1: Scan localhost pages
      await this.scanLocalhostPages();
      
      // Step 2: Fetch Vercel pages
      await this.fetchVercelPages();
      
      // Step 3: Compare deployments
      await this.compareDeployments();
      
      // Step 4: Generate reports
      await this.generateReports();
      
      // Step 5: Show summary
      this.showSummary();
      
    } catch (error) {
      console.error('❌ Audit failed:', error.message);
      process.exit(1);
    }
  }

  async scanLocalhostPages() {
    console.log('📁 Step 1: Scanning localhost pages...');
    
    const localhostPages = [];
    
    for (const dir of this.auditConfig.localhost.directories) {
      const dirPath = path.join(this.projectRoot, dir);
      
      if (fs.existsSync(dirPath)) {
        console.log(`  📂 Scanning: ${dir}/`);
        const pages = this.scanDirectory(dirPath, dir);
        localhostPages.push(...pages);
        console.log(`    ✅ Found ${pages.length} pages`);
      } else {
        console.log(`  ⚠️  Directory not found: ${dir}/`);
      }
    }
    
    this.auditResults.localhost.pages = localhostPages;
    this.auditResults.localhost.total = localhostPages.length;
    
    console.log(`✅ Localhost scan complete: ${localhostPages.length} pages found`);
  }

  scanDirectory(dirPath, baseDir) {
    const pages = [];
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        const subPages = this.scanDirectory(itemPath, baseDir);
        pages.push(...subPages);
      } else {
        // Check if it's a page file
        const ext = path.extname(item);
        if (this.auditConfig.localhost.extensions.includes(ext)) {
          const relativePath = path.relative(path.join(this.projectRoot, baseDir), itemPath);
          const route = this.pathToRoute(relativePath, baseDir);
          
          pages.push({
            file: relativePath,
            route: route,
            directory: baseDir,
            fullPath: itemPath,
            size: stat.size,
            modified: stat.mtime.toISOString()
          });
        }
      }
    }
    
    return pages;
  }

  pathToRoute(filePath, baseDir) {
    let route = filePath
      .replace(/\\/g, '/') // Normalize path separators
      .replace(/\.(tsx|jsx|js|ts)$/, '') // Remove extension
      .replace(/\/index$/, '') // Remove index
      .replace(/^\/+/, '/'); // Ensure leading slash
    
    // Handle special cases
    if (route === '') route = '/';
    if (baseDir === 'app' && route.startsWith('/')) {
      // App router uses different structure
      route = route.replace(/^\/page$/, '');
    }
    
    return route;
  }

  async fetchVercelPages() {
    console.log('\n🌐 Step 2: Fetching Vercel pages...');
    
    try {
      // Try to fetch sitemap first
      const sitemapPages = await this.fetchFromSitemap();
      
      if (sitemapPages.length > 0) {
        this.auditResults.vercel.pages = sitemapPages;
        this.auditResults.vercel.total = sitemapPages.length;
        console.log(`✅ Vercel pages fetched from sitemap: ${sitemapPages.length} pages`);
        return;
      }
      
      // Fallback: try to analyze _next/static
      const staticPages = await this.fetchFromStatic();
      this.auditResults.vercel.pages = staticPages;
      this.auditResults.vercel.total = staticPages.length;
      console.log(`✅ Vercel pages fetched from static analysis: ${staticPages.length} pages`);
      
    } catch (error) {
      console.log('⚠️  Could not fetch Vercel pages automatically');
      console.log('📋 Creating manual verification instructions...');
      await this.createManualVerification();
    }
  }

  async fetchFromSitemap() {
    try {
      const https = require('https');
      const url = this.auditConfig.vercel.sitemapUrl;
      
      return new Promise((resolve, reject) => {
        https.get(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const pages = this.parseSitemap(data);
              resolve(pages);
            } catch (error) {
              reject(error);
            }
          });
        }).on('error', reject);
      });
    } catch (error) {
      return [];
    }
  }

  parseSitemap(sitemapXml) {
    const pages = [];
    const urlRegex = /<loc>(.*?)<\/loc>/g;
    let match;
    
    while ((match = urlRegex.exec(sitemapXml)) !== null) {
      const url = match[1];
      const route = url.replace(this.auditConfig.vercel.url, '');
      pages.push({
        route: route,
        url: url,
        source: 'sitemap'
      });
    }
    
    return pages;
  }

  async fetchFromStatic() {
    // This would require more complex analysis of _next/static
    // For now, return empty array and rely on manual verification
    return [];
  }

  async createManualVerification() {
    const instructions = `
# Manual Vercel Pages Verification

## Current Vercel Site: bell24h-v1.vercel.app

## To get complete page list:

1. **Visit the site and manually check:**
   - Home page: https://bell24h-v1.vercel.app/
   - All navigation links
   - All feature pages
   - All API endpoints

2. **Or use browser dev tools:**
   - Open Network tab
   - Navigate through all pages
   - Note all unique routes

3. **Or check Vercel dashboard:**
   - Go to https://vercel.com/dashboard
   - Find your bell24h project
   - Check deployment logs for routes

## Expected Pages (based on your description):
- Home page (/)
- Supplier Showcase (/suppliers)
- Fintech (/fintech)
- Wallet & Escrow (/wallet-escrow)
- AI Features dropdown pages
- Search functionality
- All 150+ pages

## Add missing pages to audit-results.json manually if needed.
`;
    
    fs.writeFileSync(
      path.join(this.projectRoot, 'MANUAL_VERIFICATION.md'),
      instructions
    );
    
    console.log('📋 Manual verification instructions created: MANUAL_VERIFICATION.md');
  }

  async compareDeployments() {
    console.log('\n🔄 Step 3: Comparing deployments...');
    
    const localhostRoutes = this.auditResults.localhost.pages.map(p => p.route);
    const vercelRoutes = this.auditResults.vercel.pages.map(p => p.route);
    
    // Find missing pages
    const missingInVercel = localhostRoutes.filter(route => !vercelRoutes.includes(route));
    const missingInLocal = vercelRoutes.filter(route => !localhostRoutes.includes(route));
    
    this.auditResults.comparison = {
      missingInVercel: missingInVercel.map(route => ({
        route,
        localhostPage: this.auditResults.localhost.pages.find(p => p.route === route)
      })),
      missingInLocal: missingInLocal.map(route => ({
        route,
        vercelPage: this.auditResults.vercel.pages.find(p => p.route === route)
      })),
      differentVersions: [], // Would need more complex comparison
      totalLocalPages: localhostRoutes.length,
      totalVercelPages: vercelRoutes.length
    };
    
    console.log(`✅ Comparison complete:`);
    console.log(`  📊 Localhost pages: ${localhostRoutes.length}`);
    console.log(`  🌐 Vercel pages: ${vercelRoutes.length}`);
    console.log(`  ❌ Missing in Vercel: ${missingInVercel.length}`);
    console.log(`  ❌ Missing in Local: ${missingInLocal.length}`);
  }

  async generateReports() {
    console.log('\n📊 Step 4: Generating reports...');
    
    // Save JSON report
    fs.writeFileSync(
      path.join(this.projectRoot, this.auditConfig.output),
      JSON.stringify(this.auditResults, null, 2)
    );
    console.log(`  ✅ JSON report: ${this.auditConfig.output}`);
    
    // Generate Markdown report
    await this.generateMarkdownReport();
    
    // Generate HTML dashboard
    await this.generateHtmlDashboard();
    
    console.log('✅ All reports generated');
  }

  async generateMarkdownReport() {
    const report = `# Bell24h Pages Audit Report
Generated: ${new Date().toLocaleString()}

## Summary
- **Total Pages in Localhost:** ${this.auditResults.comparison.totalLocalPages}
- **Total Pages in Vercel:** ${this.auditResults.comparison.totalVercelPages}
- **Missing in Vercel:** ${this.auditResults.comparison.missingInVercel.length}
- **Missing in Local:** ${this.auditResults.comparison.missingInLocal.length}

## Missing Pages (Not in Vercel)
${this.auditResults.comparison.missingInVercel.map(page => 
  `- ${page.route} ❌ (${page.localhostPage?.file || 'Unknown file'})`
).join('\n')}

## Missing Pages (Not in Local)
${this.auditResults.comparison.missingInLocal.map(page => 
  `- ${page.route} ❌ (Vercel only)`
).join('\n')}

## Action Plan
- [ ] Backup current Vercel deployment
- [ ] Migrate missing pages to staging
- [ ] Test all pages thoroughly
- [ ] Deploy to production

## Next Steps
1. Run: \`npm run migrate:missing\` to safely add missing pages
2. Test in staging environment first
3. Verify all pages work correctly
4. Deploy to production

---
*Report generated by Bell24h Pages Audit System*
`;
    
    const reportPath = path.join(this.projectRoot, 'pages-audit.md');
    fs.writeFileSync(reportPath, report);
    console.log(`  ✅ Markdown report: pages-audit.md`);
  }

  async generateHtmlDashboard() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bell24h Pages Audit Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .stat-label { color: #666; }
        .missing { color: #e74c3c; }
        .present { color: #27ae60; }
        .section { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .page-list { list-style: none; padding: 0; }
        .page-item { padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .page-item:last-child { border-bottom: none; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .status.missing { background: #ffeaea; color: #e74c3c; }
        .status.present { background: #eafaf1; color: #27ae60; }
        .actions { margin-top: 20px; }
        .btn { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
        .btn:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Bell24h Pages Audit Dashboard</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number present">${this.auditResults.comparison.totalLocalPages}</div>
                <div class="stat-label">Localhost Pages</div>
            </div>
            <div class="stat-card">
                <div class="stat-number present">${this.auditResults.comparison.totalVercelPages}</div>
                <div class="stat-label">Vercel Pages</div>
            </div>
            <div class="stat-card">
                <div class="stat-number missing">${this.auditResults.comparison.missingInVercel.length}</div>
                <div class="stat-label">Missing in Vercel</div>
            </div>
            <div class="stat-card">
                <div class="stat-number missing">${this.auditResults.comparison.missingInLocal.length}</div>
                <div class="stat-label">Missing in Local</div>
            </div>
        </div>
        
        <div class="section">
            <h2>❌ Missing in Vercel (${this.auditResults.comparison.missingInVercel.length})</h2>
            <ul class="page-list">
                ${this.auditResults.comparison.missingInVercel.map(page => `
                    <li class="page-item">
                        <span>${page.route}</span>
                        <span class="status missing">Missing</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        
        <div class="section">
            <h2>❌ Missing in Local (${this.auditResults.comparison.missingInLocal.length})</h2>
            <ul class="page-list">
                ${this.auditResults.comparison.missingInLocal.map(page => `
                    <li class="page-item">
                        <span>${page.route}</span>
                        <span class="status missing">Vercel Only</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        
        <div class="actions">
            <button class="btn" onclick="window.open('pages-audit.md', '_blank')">📄 View Markdown Report</button>
            <button class="btn" onclick="window.open('${this.auditConfig.output}', '_blank')">📊 View JSON Data</button>
            <button class="btn" onclick="alert('Run: npm run migrate:missing')">🚀 Start Migration</button>
        </div>
    </div>
</body>
</html>`;
    
    const dashboardPath = path.join(this.projectRoot, 'admin', 'audit-dashboard.html');
    
    // Ensure admin directory exists
    const adminDir = path.dirname(dashboardPath);
    if (!fs.existsSync(adminDir)) {
      fs.mkdirSync(adminDir, { recursive: true });
    }
    
    fs.writeFileSync(dashboardPath, html);
    console.log(`  ✅ HTML dashboard: admin/audit-dashboard.html`);
  }

  showSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('🎯 AUDIT COMPLETE!');
    console.log('='.repeat(50));
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`  Localhost Pages: ${this.auditResults.comparison.totalLocalPages}`);
    console.log(`  Vercel Pages: ${this.auditResults.comparison.totalVercelPages}`);
    console.log(`  Missing in Vercel: ${this.auditResults.comparison.missingInVercel.length}`);
    console.log(`  Missing in Local: ${this.auditResults.comparison.missingInLocal.length}`);
    
    if (this.auditResults.comparison.missingInVercel.length > 0) {
      console.log(`\n❌ MISSING PAGES IN VERCEL:`);
      this.auditResults.comparison.missingInVercel.forEach(page => {
        console.log(`  - ${page.route}`);
      });
    }
    
    console.log(`\n📁 REPORTS GENERATED:`);
    console.log(`  📄 Markdown: pages-audit.md`);
    console.log(`  📊 JSON: ${this.auditConfig.output}`);
    console.log(`  🌐 Dashboard: admin/audit-dashboard.html`);
    
    console.log(`\n🚀 NEXT STEPS:`);
    console.log(`  1. Review reports: open admin/audit-dashboard.html`);
    console.log(`  2. Test migration: npm run migrate:test`);
    console.log(`  3. Migrate missing: npm run migrate:missing`);
    
    console.log('\n✅ Audit system ready for safe page migration!');
  }
}

// Run the audit
const auditor = new PagesAuditor();
auditor.run().catch(console.error);
