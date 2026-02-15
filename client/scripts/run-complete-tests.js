#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BELL24H COMPREHENSIVE TESTING SUITE');
console.log('=====================================');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`\n${colors.cyan}🔄 ${description}...${colors.reset}`);
    const result = execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    log(`${colors.green}✅ ${description} completed successfully${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}❌ ${description} failed: ${error.message}${colors.reset}`);
    return false;
  }
}

function checkServerRunning() {
  try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', {
      encoding: 'utf8',
    });
    return response.trim() === '200';
  } catch (error) {
    return false;
  }
}

async function runCompleteTestSuite() {
  const results = {
    server: false,
    e2e: false,
    performance: false,
    build: false,
  };

  // Test 1: Check if server is running
  log('\n📋 Test 1: Checking Development Server...', 'blue');
  if (checkServerRunning()) {
    log('✅ Development server is running on http://localhost:3000', 'green');
    results.server = true;
  } else {
    log('❌ Development server is not running. Please start with: npm run dev', 'red');
    log('💡 Starting development server...', 'yellow');
    try {
      execSync('npm run dev', { stdio: 'pipe', detached: true });
      log('⏳ Waiting for server to start...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 10000));
      if (checkServerRunning()) {
        log('✅ Development server started successfully', 'green');
        results.server = true;
      } else {
        log('❌ Failed to start development server', 'red');
      }
    } catch (error) {
      log('❌ Failed to start development server', 'red');
    }
  }

  // Test 2: E2E Testing
  if (results.server) {
    log('\n📋 Test 2: Running E2E Tests...', 'blue');
    results.e2e = runCommand(
      'npx playwright test tests/e2e/complete-platform.spec.ts --reporter=html',
      'E2E Testing Suite'
    );
  }

  // Test 3: Performance Testing
  if (results.server) {
    log('\n📋 Test 3: Running Performance Tests...', 'blue');
    results.performance = runCommand(
      'node tests/performance/lighthouse.js',
      'Lighthouse Performance Test'
    );
  }

  // Test 4: Build Validation
  log('\n📋 Test 4: Testing Production Build...', 'blue');
  results.build = runCommand('npm run build', 'Production Build Test');

  // Test 5: Manual Testing Checklist
  log('\n📋 Test 5: Manual Testing Checklist', 'blue');
  log('✅ MANUAL TESTING CHECKLIST:', 'yellow');
  log('1. Homepage loads without hydration errors');
  log('2. Login works with demo credentials (demo@bell24h.com / password123)');
  log('3. Dashboard mode switching works (Buying/Selling)');
  log('4. Registration shows all 50+ categories');
  log('5. Navigation and route protection works');
  log('6. Mobile responsiveness confirmed');
  log('7. Performance under 5s load time');
  log('8. No console errors');

  // Summary
  log('\n📊 TEST RESULTS SUMMARY:', 'magenta');
  log('=====================================');
  log(
    `Server Running: ${results.server ? '✅ PASS' : '❌ FAIL'}`,
    results.server ? 'green' : 'red'
  );
  log(`E2E Tests: ${results.e2e ? '✅ PASS' : '❌ FAIL'}`, results.e2e ? 'green' : 'red');
  log(
    `Performance: ${results.performance ? '✅ PASS' : '❌ FAIL'}`,
    results.performance ? 'green' : 'red'
  );
  log(`Build Test: ${results.build ? '✅ PASS' : '❌ FAIL'}`, results.build ? 'green' : 'red');

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  const successRate = (passedTests / totalTests) * 100;

  log(
    `\n🎯 OVERALL SUCCESS RATE: ${successRate.toFixed(1)}% (${passedTests}/${totalTests})`,
    'magenta'
  );

  if (successRate >= 80) {
    log('\n🎉 BELL24H PLATFORM VALIDATION: EXCELLENT!', 'green');
    log('✅ Platform is production ready', 'green');
  } else if (successRate >= 60) {
    log('\n✅ BELL24H PLATFORM VALIDATION: GOOD', 'yellow');
    log('⚠️ Minor issues detected - review failed tests', 'yellow');
  } else {
    log('\n❌ BELL24H PLATFORM VALIDATION: NEEDS WORK', 'red');
    log('🔧 Critical issues detected - fix required tests', 'red');
  }

  // Expected Results
  log('\n🎯 EXPECTED RESULTS:', 'cyan');
  log('✅ All E2E tests passing (8/8)');
  log('✅ Performance score >80');
  log('✅ Build successful');
  log('✅ No hydration errors');
  log('✅ Authentication working');
  log('✅ Mobile responsive');

  log('\n🚀 BELL24H PLATFORM VALIDATION COMPLETE!', 'bright');
}

// Run the complete test suite
runCompleteTestSuite().catch(console.error);
