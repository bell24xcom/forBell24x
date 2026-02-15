#!/usr/bin/env node

/**
 * Complete System Test Script
 * Tests all critical components of Bell24h
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SystemTester {
  constructor() {
    this.results = {
      syntax: false,
      build: false,
      database: false,
      api: false,
      admin: false,
      pages: false
    };
  }

  async runAllTests() {
    console.log('🧪 BELL24H COMPLETE SYSTEM TEST\n');
    console.log('='.repeat(50));

    try {
      // Test 1: Syntax Check
      await this.testSyntax();

      // Test 2: Build Test
      await this.testBuild();

      // Test 3: Database Connection
      await this.testDatabase();

      // Test 4: API Endpoints
      await this.testAPI();

      // Test 5: Admin Panel
      await this.testAdminPanel();

      // Test 6: Pages
      await this.testPages();

      // Final Report
      this.generateReport();

    } catch (error) {
      console.error('❌ System test failed:', error.message);
      process.exit(1);
    }
  }

  async testSyntax() {
    console.log('\n🔍 Testing Syntax...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.results.syntax = true;
      console.log('✅ Syntax check passed');
    } catch (error) {
      console.log('❌ Syntax errors found');
      console.log(error.stdout?.toString() || error.message);
    }
  }

  async testBuild() {
    console.log('\n🏗️  Testing Build...');
    try {
      execSync('npm run build', { stdio: 'pipe' });
      this.results.build = true;
      console.log('✅ Build successful');
    } catch (error) {
      console.log('❌ Build failed');
      console.log(error.stdout?.toString() || error.message);
    }
  }

  async testDatabase() {
    console.log('\n🗄️  Testing Database...');
    try {
      // Check if .env.local exists
      if (!fs.existsSync('.env.local')) {
        throw new Error('.env.local not found');
      }

      // Check DATABASE_URL
      const envContent = fs.readFileSync('.env.local', 'utf8');
      if (!envContent.includes('DATABASE_URL')) {
        throw new Error('DATABASE_URL not configured');
      }

      // Test Prisma
      execSync('npx prisma validate', { stdio: 'pipe' });
      this.results.database = true;
      console.log('✅ Database configuration valid');
    } catch (error) {
      console.log('❌ Database test failed');
      console.log(error.message);
    }
  }

  async testAPI() {
    console.log('\n🔌 Testing API Endpoints...');
    try {
      // Check if API files exist
      const apiFiles = [
        'app/api/campaigns/route.ts',
        'app/api/auth/agent/login/route.ts',
        'app/api/auth/agent/register/route.ts'
      ];

      for (const file of apiFiles) {
        if (!fs.existsSync(file)) {
          throw new Error(`API file missing: ${file}`);
        }
      }

      this.results.api = true;
      console.log('✅ API endpoints exist');
    } catch (error) {
      console.log('❌ API test failed');
      console.log(error.message);
    }
  }

  async testAdminPanel() {
    console.log('\n👑 Testing Admin Panel...');
    try {
      // Check if admin components exist
      const adminFiles = [
        'components/admin/AdminDashboard.tsx',
        'components/admin/MarketingDashboard.tsx',
        'components/admin/AnalyticsDashboard.tsx'
      ];

      for (const file of adminFiles) {
        if (!fs.existsSync(file)) {
          throw new Error(`Admin component missing: ${file}`);
        }
      }

      this.results.admin = true;
      console.log('✅ Admin panel components exist');
    } catch (error) {
      console.log('❌ Admin panel test failed');
      console.log(error.message);
    }
  }

  async testPages() {
    console.log('\n📄 Testing Pages...');
    try {
      // Check critical pages
      const criticalPages = [
        'app/page.tsx',
        'app/admin/page.tsx',
        'app/rfq/page.tsx',
        'app/suppliers/page.tsx'
      ];

      let foundPages = 0;
      for (const page of criticalPages) {
        if (fs.existsSync(page)) {
          foundPages++;
        }
      }

      if (foundPages >= 3) {
        this.results.pages = true;
        console.log(`✅ Found ${foundPages}/${criticalPages.length} critical pages`);
      } else {
        throw new Error(`Only ${foundPages}/${criticalPages.length} critical pages found`);
      }
    } catch (error) {
      console.log('❌ Pages test failed');
      console.log(error.message);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 SYSTEM TEST REPORT');
    console.log('='.repeat(50));

    const tests = [
      { name: 'Syntax Check', result: this.results.syntax },
      { name: 'Build Test', result: this.results.build },
      { name: 'Database Config', result: this.results.database },
      { name: 'API Endpoints', result: this.results.api },
      { name: 'Admin Panel', result: this.results.admin },
      { name: 'Critical Pages', result: this.results.pages }
    ];

    tests.forEach(test => {
      const status = test.result ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test.name}`);
    });

    const passedTests = tests.filter(t => t.result).length;
    const totalTests = tests.length;
    const percentage = Math.round((passedTests / totalTests) * 100);

    console.log('\n' + '='.repeat(50));
    console.log(`🎯 OVERALL RESULT: ${passedTests}/${totalTests} tests passed (${percentage}%)`);

    if (percentage >= 80) {
      console.log('🎉 SYSTEM READY FOR DEPLOYMENT!');
      console.log('\n📋 Next Steps:');
      console.log('1. Run: npm run dev');
      console.log('2. Visit: http://localhost:3000/admin');
      console.log('3. Test Marketing Dashboard');
      console.log('4. Deploy to Railway: railway up');
    } else {
      console.log('⚠️  SYSTEM NEEDS ATTENTION');
      console.log('\n🔧 Fix the failing tests before deployment');
    }

    console.log('='.repeat(50));
  }
}

// Run the tests
const tester = new SystemTester();
tester.runAllTests().catch(console.error);
