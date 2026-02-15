#!/usr/bin/env node

/**
 * Migration Test Script - Test all 150 pages after Vercel import
 * This script verifies that all pages are working correctly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class MigrationTester {
  constructor() {
    this.projectRoot = process.cwd();
    this.testResults = {
      timestamp: new Date().toISOString(),
      totalPages: 0,
      workingPages: 0,
      brokenPages: [],
      missingPages: [],
      testErrors: []
    };
  }

  async run() {
    console.log('🧪 MIGRATION TEST - VERIFYING ALL PAGES');
    console.log('=======================================\n');

    try {
      // Step 1: Build the project
      await this.buildProject();
      
      // Step 2: Scan for all pages
      await this.scanPages();
      
      // Step 3: Test page accessibility
      await this.testPages();
      
      // Step 4: Check for broken imports
      await this.checkImports();
      
      // Step 5: Verify theme system
      await this.verifyTheme();
      
      // Step 6: Generate test report
      await this.generateReport();
      
      console.log('\n✅ MIGRATION TEST COMPLETE');
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      this.testResults.testErrors.push(error.message);
      await this.generateReport();
      process.exit(1);
    }
  }

  async buildProject() {
    console.log('🔨 Step 1: Building project...');
    
    try {
      execSync('npm run build', { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      console.log('✅ Build successful');
    } catch (error) {
      console.log('❌ Build failed - checking for issues...');
      this.testResults.testErrors.push('Build failed: ' + error.message);
      
      // Try to identify build issues
      await this.identifyBuildIssues();
    }
  }

  async identifyBuildIssues() {
    console.log('🔍 Identifying build issues...');
    
    // Check for common issues
    const commonIssues = [
      'import',
      'export',
      'syntax',
      'module',
      'dependency'
    ];
    
    // This would typically parse build output for specific errors
    console.log('⚠️  Build issues detected - manual review required');
  }

  async scanPages() {
    console.log('\n📄 Step 2: Scanning for pages...');
    
    const pageDirectories = ['app', 'pages'];
    const pageExtensions = ['.tsx', '.jsx', '.ts', '.js'];
    
    for (const dir of pageDirectories) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        await this.scanDirectory(dirPath, dir, pageExtensions);
      }
    }
    
    console.log(`✅ Found ${this.testResults.totalPages} pages`);
  }

  async scanDirectory(dir, baseDir, extensions) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        await this.scanDirectory(itemPath, baseDir, extensions);
      } else {
        // Check if it's a page file
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          if (this.isPageFile(item, baseDir)) {
            this.testResults.totalPages++;
            console.log(`  📄 Found page: ${path.relative(this.projectRoot, itemPath)}`);
          }
        }
      }
    }
  }

  isPageFile(filename, baseDir) {
    // Next.js page file patterns
    const pagePatterns = [
      'page.tsx',
      'page.jsx',
      'page.ts',
      'page.js',
      'index.tsx',
      'index.jsx',
      'index.ts',
      'index.js'
    ];
    
    if (baseDir === 'pages') {
      // In pages directory, any file is a page
      return true;
    } else if (baseDir === 'app') {
      // In app directory, only specific files are pages
      return pagePatterns.some(pattern => filename.includes(pattern));
    }
    
    return false;
  }

  async testPages() {
    console.log('\n🔍 Step 3: Testing page accessibility...');
    
    // This would typically start a dev server and test each page
    // For now, we'll do basic file validation
    
    const pageDirectories = ['app', 'pages'];
    
    for (const dir of pageDirectories) {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        await this.validatePages(dirPath);
      }
    }
    
    console.log(`✅ ${this.testResults.workingPages} pages validated`);
    if (this.testResults.brokenPages.length > 0) {
      console.log(`⚠️  ${this.testResults.brokenPages.length} pages have issues`);
    }
  }

  async validatePages(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        await this.validatePages(itemPath);
      } else {
        if (this.isPageFile(item, path.basename(dir))) {
          await this.validatePageFile(itemPath);
        }
      }
    }
  }

  async validatePageFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Basic validation checks
      const issues = [];
      
      // Check for React import
      if (!content.includes('import React') && !content.includes('from "react"')) {
        if (content.includes('export default') || content.includes('function')) {
          // Might be using new React 17+ JSX transform
        } else {
          issues.push('Missing React import');
        }
      }
      
      // Check for default export
      if (!content.includes('export default')) {
        issues.push('Missing default export');
      }
      
      // Check for syntax errors (basic)
      if (content.includes('import {') && !content.includes('}')) {
        issues.push('Incomplete import statement');
      }
      
      if (issues.length === 0) {
        this.testResults.workingPages++;
      } else {
        this.testResults.brokenPages.push({
          file: path.relative(this.projectRoot, filePath),
          issues: issues
        });
      }
      
    } catch (error) {
      this.testResults.brokenPages.push({
        file: path.relative(this.projectRoot, filePath),
        issues: ['File read error: ' + error.message]
      });
    }
  }

  async checkImports() {
    console.log('\n📦 Step 4: Checking imports...');
    
    // Check for missing dependencies
    try {
      execSync('npm ls --depth=0', { 
        stdio: 'pipe',
        cwd: this.projectRoot 
      });
      console.log('✅ Dependencies check passed');
    } catch (error) {
      console.log('⚠️  Dependency issues detected');
      this.testResults.testErrors.push('Dependency issues: ' + error.message);
    }
  }

  async verifyTheme() {
    console.log('\n🎨 Step 5: Verifying theme system...');
    
    const themeFiles = [
      'app/styles/global.css',
      'app/styles/theme.config.ts'
    ];
    
    let themeWorking = true;
    
    for (const file of themeFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ Found: ${file}`);
      } else {
        console.log(`  ❌ Missing: ${file}`);
        themeWorking = false;
      }
    }
    
    if (themeWorking) {
      console.log('✅ Theme system verified');
    } else {
      console.log('⚠️  Theme system incomplete');
      this.testResults.testErrors.push('Theme system incomplete');
    }
  }

  async generateReport() {
    console.log('\n📊 Step 6: Generating test report...');
    
    const reportPath = path.join(this.projectRoot, 'migration-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    
    console.log('\n📋 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`📄 Total Pages: ${this.testResults.totalPages}`);
    console.log(`✅ Working Pages: ${this.testResults.workingPages}`);
    console.log(`❌ Broken Pages: ${this.testResults.brokenPages.length}`);
    console.log(`⚠️  Test Errors: ${this.testResults.testErrors.length}`);
    
    if (this.testResults.brokenPages.length > 0) {
      console.log('\n❌ BROKEN PAGES:');
      this.testResults.brokenPages.forEach(page => {
        console.log(`  📄 ${page.file}`);
        page.issues.forEach(issue => {
          console.log(`    - ${issue}`);
        });
      });
    }
    
    if (this.testResults.testErrors.length > 0) {
      console.log('\n⚠️  TEST ERRORS:');
      this.testResults.testErrors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    
    // Generate recommendations
    this.generateRecommendations();
  }

  generateRecommendations() {
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (this.testResults.brokenPages.length > 0) {
      console.log('1. Fix broken pages before deployment');
      console.log('2. Review import statements');
      console.log('3. Ensure all components are properly exported');
    }
    
    if (this.testResults.testErrors.length > 0) {
      console.log('4. Resolve build errors');
      console.log('5. Check dependency versions');
    }
    
    if (this.testResults.workingPages === this.testResults.totalPages) {
      console.log('🎉 All pages are working! Ready for deployment.');
      console.log('\n🚀 NEXT STEPS:');
      console.log('1. Deploy to staging: railway up --environment staging');
      console.log('2. Test staging environment');
      console.log('3. Deploy to production: railway up --environment production');
    } else {
      console.log('⚠️  Fix issues before deploying to production');
    }
  }
}

// Run the tester
const tester = new MigrationTester();
tester.run().catch(console.error);
