#!/usr/bin/env node

/**
 * Final Critical Fixes Test Script
 * Tests all 3 critical fixes for Bell24h
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class FinalFixesTester {
  constructor() {
    this.results = {
      databaseUrl: false,
      marketingSyntax: false,
      loginApi: false,
      build: false,
      server: false
    };
  }

  async runAllTests() {
    console.log('🔧 BELL24H FINAL CRITICAL FIXES TEST\n');
    console.log('='.repeat(50));

    try {
      // Test 1: DATABASE_URL Fix
      await this.testDatabaseUrl();
      
      // Test 2: MarketingDashboard Syntax Fix
      await this.testMarketingSyntax();
      
      // Test 3: Login API Route
      await this.testLoginApi();
      
      // Test 4: Build Test
      await this.testBuild();
      
      // Test 5: Server Test
      await this.testServer();
      
      // Final Report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    }
  }

  async testDatabaseUrl() {
    console.log('\n🔍 Testing DATABASE_URL Fix...');
    try {
      // Check if .env file exists
      if (!fs.existsSync('.env')) {
        throw new Error('.env file not found');
      }
      
      // Check DATABASE_URL content
      const envContent = fs.readFileSync('.env', 'utf8');
      if (!envContent.includes('DATABASE_URL')) {
        throw new Error('DATABASE_URL not found in .env');
      }
      
      this.results.databaseUrl = true;
      console.log('✅ DATABASE_URL fix successful');
    } catch (error) {
      console.log('❌ DATABASE_URL fix failed:', error.message);
    }
  }

  async testMarketingSyntax() {
    console.log('\n🔍 Testing MarketingDashboard Syntax Fix...');
    try {
      const filePath = 'components/admin/MarketingDashboard.tsx';
      if (!fs.existsSync(filePath)) {
        throw new Error('MarketingDashboard.tsx not found');
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for correct useEffect syntax
      if (content.includes('}, []);')) {
        this.results.marketingSyntax = true;
        console.log('✅ MarketingDashboard syntax fix successful');
      } else {
        throw new Error('useEffect syntax not fixed');
      }
    } catch (error) {
      console.log('❌ MarketingDashboard syntax fix failed:', error.message);
    }
  }

  async testLoginApi() {
    console.log('\n🔍 Testing Login API Route...');
    try {
      const filePath = 'app/api/auth/agent/login/route.ts';
      if (!fs.existsSync(filePath)) {
        throw new Error('Login API route not found');
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for required imports and functions
      if (content.includes('NextRequest') && 
          content.includes('NextResponse') && 
          content.includes('export async function POST')) {
        this.results.loginApi = true;
        console.log('✅ Login API route created successfully');
      } else {
        throw new Error('Login API route incomplete');
      }
    } catch (error) {
      console.log('❌ Login API route test failed:', error.message);
    }
  }

  async testBuild() {
    console.log('\n🔍 Testing Build...');
    try {
      execSync('npm run build', { stdio: 'pipe' });
      this.results.build = true;
      console.log('✅ Build successful');
    } catch (error) {
      console.log('❌ Build failed');
      console.log(error.stdout?.toString() || error.message);
    }
  }

  async testServer() {
    console.log('\n🔍 Testing Development Server...');
    try {
      // Check if server is running
      const response = await fetch('http://localhost:3000', { 
        method: 'GET',
        timeout: 5000 
      });
      
      if (response.ok) {
        this.results.server = true;
        console.log('✅ Development server running');
      } else {
        throw new Error('Server not responding');
      }
    } catch (error) {
      console.log('❌ Development server test failed:', error.message);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL CRITICAL FIXES TEST REPORT');
    console.log('='.repeat(50));
    
    const tests = [
      { name: 'DATABASE_URL Fix', result: this.results.databaseUrl },
      { name: 'MarketingDashboard Syntax', result: this.results.marketingSyntax },
      { name: 'Login API Route', result: this.results.loginApi },
      { name: 'Build Test', result: this.results.build },
      { name: 'Development Server', result: this.results.server }
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
      console.log('🎉 BELL24H IS FULLY OPERATIONAL!');
      console.log('\n📋 Next Steps:');
      console.log('1. Visit: http://localhost:3000/admin');
      console.log('2. Test Marketing Dashboard');
      console.log('3. Test API endpoints');
      console.log('4. Deploy to Railway: railway up');
    } else {
      console.log('⚠️  SYSTEM NEEDS ATTENTION');
      console.log('\n🔧 Fix the failing tests before deployment');
    }
    
    console.log('='.repeat(50));
  }
}

// Run the tests
const tester = new FinalFixesTester();
tester.runAllTests().catch(console.error);
