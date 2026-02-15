// test-runner.js
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  unitTests: true,
  integrationTests: true,
  e2eTests: true,
  thirdPartyTests: process.env.RUN_THIRD_PARTY_TESTS === 'true',
  performanceTests: process.env.RUN_PERFORMANCE_TESTS === 'true',
  securityTests: process.env.RUN_SECURITY_TESTS === 'true',
};

// Execute test command
function runTests(command, name) {
  console.log(`\n🧪 Running ${name}...\n`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`\n✅ ${name} completed successfully\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ ${name} failed\n`);
    if (process.env.CI) {
      process.exit(1);
    }
    return false;
  }
}

// Main test sequence
async function runTestSequence() {
  let allPassed = true;
  
  // Unit tests
  if (config.unitTests) {
    allPassed = runTests('jest --config jest.config.js', 'Unit Tests') && allPassed;
  }
  
  // Integration tests
  if (config.integrationTests) {
    allPassed = runTests('jest --config jest.integration.config.js', 'Integration Tests') && allPassed;
  }
  
  // E2E tests
  if (config.e2eTests) {
    allPassed = runTests('cypress run', 'End-to-End Tests') && allPassed;
  }
  
  // Third-party API tests (optional)
  if (config.thirdPartyTests) {
    allPassed = runTests('jest --config jest.thirdparty.config.js', 'Third-Party API Tests') && allPassed;
  }
  
  // Performance tests (optional)
  if (config.performanceTests) {
    allPassed = runTests('artillery run tests/performance/scenarios.yml', 'Performance Tests') && allPassed;
  }
  
  // Security tests (optional)
  if (config.securityTests) {
    allPassed = runTests('npm run security-scan', 'Security Tests') && allPassed;
  }
  
  if (allPassed) {
    console.log('\n✅✅✅ All tests passed successfully! ✅✅✅\n');
  } else {
    console.error('\n❌❌❌ Some tests failed! Check logs for details ❌❌❌\n');
    if (process.env.CI) {
      process.exit(1);
    }
  }
}

runTestSequence();
