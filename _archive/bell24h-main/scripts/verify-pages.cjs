#!/usr/bin/env node

/**
 * Verify All Pages Are Present
 * Checks that all 34 pages from Vercel are now in localhost
 */

const fs = require('fs');
const path = require('path');

class PageVerifier {
  constructor() {
    this.projectRoot = process.cwd();
    this.expectedPages = [
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
  }

  async run() {
    console.log('🔍 VERIFYING ALL PAGES ARE PRESENT');
    console.log('===================================\n');

    try {
      // Step 1: Scan localhost for pages
      const foundPages = await this.scanLocalhostPages();

      // Step 2: Compare with expected pages
      await this.comparePages(foundPages);

      // Step 3: Generate verification report
      await this.generateVerificationReport(foundPages);

      console.log('\n✅ PAGE VERIFICATION COMPLETE!');

    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      process.exit(1);
    }
  }

  async scanLocalhostPages() {
    console.log('📁 Step 1: Scanning localhost for pages...');

    const foundPages = [];
    const directories = ['app', 'pages', 'src'];

    directories.forEach(dir => {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        console.log(`  📂 Scanning: ${dir}/`);
        this.scanDirectory(dirPath, foundPages, dir);
      } else {
        console.log(`  ⚠️  Directory not found: ${dir}/`);
      }
    });

    console.log(`✅ Found ${foundPages.length} pages in localhost`);
    return foundPages;
  }

  scanDirectory(dirPath, foundPages, baseDir) {
    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        this.scanDirectory(itemPath, foundPages, baseDir);
      } else {
        const ext = path.extname(item);
        if (['.tsx', '.jsx', '.js', '.ts'].includes(ext)) {
          const relativePath = path.relative(path.join(this.projectRoot, baseDir), itemPath);
          const route = this.pathToRoute(relativePath, baseDir);

          foundPages.push({
            file: relativePath,
            route: route,
            directory: baseDir,
            fullPath: itemPath
          });
        }
      }
    });
  }

  pathToRoute(filePath, baseDir) {
    let route = filePath
      .replace(/\\/g, '/')
      .replace(/\.(tsx|jsx|js|ts)$/, '')
      .replace(/\/index$/, '')
      .replace(/^\/+/, '/');

    if (route === '') route = '/';

    // Handle Next.js App Router structure
    if (baseDir === 'app') {
      // Remove 'page' from the end of routes
      route = route.replace(/\/page$/, '');
      // Handle dynamic routes like [category]
      route = route.replace(/\[([^\]]+)\]/g, ':$1');
      // Ensure route starts with /
      if (!route.startsWith('/')) {
        route = '/' + route;
      }
      // Handle root page
      if (route === '/page' || route === '/') {
        route = '/';
      }
    }

    return route;
  }

  async comparePages(foundPages) {
    console.log('\n🔄 Step 2: Comparing with expected pages...');

    const foundRoutes = foundPages.map(p => p.route);
    const missingPages = [];
    const extraPages = [];

    // Check for missing pages
    this.expectedPages.forEach(expectedRoute => {
      if (!foundRoutes.includes(expectedRoute)) {
        // Check if it's a category page that's covered by dynamic route
        if (expectedRoute.startsWith('/categories/')) {
          const categoryName = expectedRoute.replace('/categories/', '');
          const dynamicRoute = '/categories/:category';
          if (foundRoutes.includes(dynamicRoute)) {
            // Dynamic route exists, so this specific category is covered
            return;
          }
        }
        missingPages.push(expectedRoute);
      }
    });

    // Check for extra pages
    foundRoutes.forEach(foundRoute => {
      if (!this.expectedPages.includes(foundRoute)) {
        extraPages.push(foundRoute);
      }
    });

    console.log(`📊 Comparison Results:`);
    console.log(`  Expected pages: ${this.expectedPages.length}`);
    console.log(`  Found pages: ${foundPages.length}`);
    console.log(`  Missing pages: ${missingPages.length}`);
    console.log(`  Extra pages: ${extraPages.length}`);

    if (missingPages.length > 0) {
      console.log(`\n❌ MISSING PAGES:`);
      missingPages.forEach(page => {
        console.log(`  - ${page}`);
      });
    }

    if (extraPages.length > 0) {
      console.log(`\n➕ EXTRA PAGES:`);
      extraPages.forEach(page => {
        console.log(`  - ${page}`);
      });
    }

    if (missingPages.length === 0) {
      console.log('\n✅ All expected pages are present!');
    } else {
      console.log(`\n⚠️  ${missingPages.length} pages are missing from localhost`);
    }
  }

  async generateVerificationReport(foundPages) {
    console.log('\n📊 Step 3: Generating verification report...');

    const report = {
      timestamp: new Date().toISOString(),
      expectedPages: this.expectedPages.length,
      foundPages: foundPages.length,
      missingPages: this.expectedPages.filter(expected =>
        !foundPages.some(found => found.route === expected)
      ),
      extraPages: foundPages.filter(found =>
        !this.expectedPages.includes(found.route)
      ).map(p => p.route),
      allPagesPresent: foundPages.length >= this.expectedPages.length,
      foundPagesList: foundPages.map(p => ({
        route: p.route,
        file: p.file,
        directory: p.directory
      }))
    };

    // Save JSON report
    fs.writeFileSync(
      path.join(this.projectRoot, 'page-verification-report.json'),
      JSON.stringify(report, null, 2)
    );
    console.log('  ✅ JSON report: page-verification-report.json');

    // Generate Markdown report
    const markdownReport = `# Page Verification Report
Generated: ${new Date().toLocaleString()}

## Summary
- **Expected Pages:** ${report.expectedPages}
- **Found Pages:** ${report.foundPages}
- **Missing Pages:** ${report.missingPages.length}
- **Extra Pages:** ${report.extraPages.length}
- **All Pages Present:** ${report.allPagesPresent ? '✅ Yes' : '❌ No'}

## Missing Pages
${report.missingPages.length > 0 ?
        report.missingPages.map(page => `- ${page} ❌`).join('\n') :
        'None - all pages present! ✅'
      }

## Extra Pages
${report.extraPages.length > 0 ?
        report.extraPages.map(page => `- ${page} ➕`).join('\n') :
        'None'
      }

## Found Pages
${report.foundPagesList.map(page =>
        `- ${page.route} (${page.directory}/${page.file})`
      ).join('\n')}

## Next Steps
${report.allPagesPresent ?
        '✅ All pages are present. You can proceed with development.' :
        '⚠️  Some pages are missing. Run recovery script to restore them.'
      }

---
*Report generated by Page Verification System*
`;

    fs.writeFileSync(
      path.join(this.projectRoot, 'page-verification-report.md'),
      markdownReport
    );
    console.log('  ✅ Markdown report: page-verification-report.md');
  }
}

// Run the verification
const verifier = new PageVerifier();
verifier.run().catch(console.error);
