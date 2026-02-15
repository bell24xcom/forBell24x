#!/usr/bin/env node

/**
 * Bell24H Test Setup Validation Script
 * Validates complete testing infrastructure and dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Validation results
let validationResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: [],
};

// Helper functions
const log = (message, color = 'white') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = message => log(`✅ ${message}`, 'green');
const logError = message => log(`❌ ${message}`, 'red');
const logWarning = message => log(`⚠️  ${message}`, 'yellow');
const logInfo = message => log(`ℹ️  ${message}`, 'blue');
const logHeader = message => log(`\n${colors.bold}📋 ${message}${colors.reset}`, 'cyan');

const recordResult = (type, message, details = '') => {
  validationResults[type]++;
  validationResults.details.push({ type, message, details });
};

// Validation functions
const validateNodeVersion = () => {
  logHeader('Node.js Version Validation');

  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);

    if (majorVersion >= 18) {
      logSuccess(`Node.js version ${nodeVersion} is supported`);
      recordResult('passed', 'Node.js version check');
    } else {
      logError(`Node.js version ${nodeVersion} is not supported. Minimum required: v18.0.0`);
      recordResult(
        'failed',
        'Node.js version check',
        `Current: ${nodeVersion}, Required: >=18.0.0`
      );
    }
  } catch (error) {
    logError(`Failed to check Node.js version: ${error.message}`);
    recordResult('failed', 'Node.js version check', error.message);
  }
};

const validatePackageJson = () => {
  logHeader('package.json Validation');

  try {
    const packageJsonPath = path.join(__dirname, '../package.json');

    if (!fs.existsSync(packageJsonPath)) {
      logError('package.json not found');
      recordResult('failed', 'package.json existence');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check required testing scripts
    const requiredScripts = [
      'test',
      'test:unit',
      'test:integration',
      'test:e2e',
      'test:comprehensive',
      'test:performance',
      'test:accessibility',
    ];

    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);

    if (missingScripts.length === 0) {
      logSuccess('All required test scripts are present');
      recordResult('passed', 'Required test scripts');
    } else {
      logError(`Missing test scripts: ${missingScripts.join(', ')}`);
      recordResult('failed', 'Required test scripts', `Missing: ${missingScripts.join(', ')}`);
    }

    logSuccess('package.json validation completed');
  } catch (error) {
    logError(`package.json validation failed: ${error.message}`);
    recordResult('failed', 'package.json validation', error.message);
  }
};

const validateTestingDependencies = () => {
  logHeader('Testing Dependencies Validation');

  const requiredDependencies = [
    '@testing-library/react',
    '@testing-library/jest-dom',
    '@testing-library/user-event',
    '@playwright/test',
    'jest',
    'jest-environment-jsdom',
  ];

  const optionalDependencies = [
    'jest-html-reporters',
    'jest-junit',
    'lighthouse',
    'axe-cli',
    'msw',
  ];

  try {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Check required dependencies
    const missingRequired = requiredDependencies.filter(dep => !allDeps[dep]);
    const missingOptional = optionalDependencies.filter(dep => !allDeps[dep]);

    if (missingRequired.length === 0) {
      logSuccess('All required testing dependencies are installed');
      recordResult('passed', 'Required testing dependencies');
    } else {
      logError(`Missing required dependencies: ${missingRequired.join(', ')}`);
      recordResult(
        'failed',
        'Required testing dependencies',
        `Missing: ${missingRequired.join(', ')}`
      );
    }

    if (missingOptional.length > 0) {
      logWarning(`Missing optional dependencies: ${missingOptional.join(', ')}`);
      recordResult(
        'warnings',
        'Optional testing dependencies',
        `Missing: ${missingOptional.join(', ')}`
      );
    } else {
      logSuccess('All optional testing dependencies are installed');
    }
  } catch (error) {
    logError(`Dependencies validation failed: ${error.message}`);
    recordResult('failed', 'Dependencies validation', error.message);
  }
};

const validateTestDirectories = () => {
  logHeader('Test Directory Structure Validation');

  const requiredDirectories = [
    '__tests__',
    '__tests__/unit',
    '__tests__/integration',
    '__tests__/components',
    '__tests__/e2e',
    '__tests__/config',
    '__tests__/utils',
    'test-results',
  ];

  requiredDirectories.forEach(dir => {
    const dirPath = path.join(__dirname, '../', dir);

    if (fs.existsSync(dirPath)) {
      logSuccess(`Directory exists: ${dir}`);
      recordResult('passed', `Directory: ${dir}`);
    } else {
      logWarning(`Directory missing: ${dir} (will be created)`);

      try {
        fs.mkdirSync(dirPath, { recursive: true });
        logSuccess(`Created directory: ${dir}`);
        recordResult('passed', `Directory created: ${dir}`);
      } catch (error) {
        logError(`Failed to create directory: ${dir}`);
        recordResult('failed', `Directory creation: ${dir}`, error.message);
      }
    }
  });
};

const validateConfigurationFiles = () => {
  logHeader('Configuration Files Validation');

  const configFiles = [
    {
      path: 'jest.config.js',
      required: true,
      description: 'Jest configuration',
    },
    {
      path: 'playwright.config.ts',
      required: true,
      description: 'Playwright configuration',
    },
    {
      path: '__tests__/config/setupTests.ts',
      required: true,
      description: 'Test setup configuration',
    },
    {
      path: 'tsconfig.json',
      required: true,
      description: 'TypeScript configuration',
    },
    {
      path: '.eslintrc.json',
      required: false,
      description: 'ESLint configuration',
    },
  ];

  configFiles.forEach(({ path: filePath, required, description }) => {
    const fullPath = path.join(__dirname, '../', filePath);

    if (fs.existsSync(fullPath)) {
      logSuccess(`${description} found: ${filePath}`);
      recordResult('passed', `Config file: ${filePath}`);
    } else if (required) {
      logError(`Required configuration missing: ${filePath}`);
      recordResult('failed', `Config file: ${filePath}`, 'File missing');
    } else {
      logWarning(`Optional configuration missing: ${filePath}`);
      recordResult('warnings', `Config file: ${filePath}`, 'Optional file missing');
    }
  });
};

const validateEnvironmentVariables = () => {
  logHeader('Environment Variables Validation');

  const requiredEnvVars = ['NODE_ENV'];

  const optionalEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'OPENAI_API_KEY',
  ];

  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      logSuccess(`Required environment variable set: ${envVar}`);
      recordResult('passed', `Env var: ${envVar}`);
    } else {
      logError(`Required environment variable missing: ${envVar}`);
      recordResult('failed', `Env var: ${envVar}`, 'Variable not set');
    }
  });

  optionalEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      logSuccess(`Optional environment variable set: ${envVar}`);
    } else {
      logWarning(`Optional environment variable not set: ${envVar}`);
      recordResult('warnings', `Env var: ${envVar}`, 'Optional variable not set');
    }
  });
};

const validateBrowserInstallation = () => {
  logHeader('Browser Installation Validation (Playwright)');

  try {
    execSync('npx playwright --version', { stdio: 'pipe' });
    logSuccess('Playwright is installed');
    recordResult('passed', 'Playwright installation');

    try {
      execSync('npx playwright install --dry-run', { stdio: 'pipe' });
      logSuccess('Playwright browsers are available');
      recordResult('passed', 'Playwright browsers');
    } catch (error) {
      logWarning('Playwright browsers may need installation');
      logInfo('Run: npx playwright install');
      recordResult('warnings', 'Playwright browsers', 'May need installation');
    }
  } catch (error) {
    logError('Playwright not found or not properly installed');
    recordResult('failed', 'Playwright installation', error.message);
  }
};

const validateTestFiles = () => {
  logHeader('Test Files Validation');

  const testDirectories = [
    '__tests__/unit',
    '__tests__/integration',
    '__tests__/components',
    '__tests__/e2e',
  ];

  let totalTestFiles = 0;

  testDirectories.forEach(dir => {
    const dirPath = path.join(__dirname, '../', dir);

    if (fs.existsSync(dirPath)) {
      const files = fs
        .readdirSync(dirPath, { recursive: true })
        .filter(file => file.toString().match(/\.(test|spec)\.(js|jsx|ts|tsx)$/));

      totalTestFiles += files.length;

      if (files.length > 0) {
        logSuccess(`Found ${files.length} test files in ${dir}`);
        recordResult('passed', `Test files in ${dir}`, `${files.length} files`);
      } else {
        logWarning(`No test files found in ${dir}`);
        recordResult('warnings', `Test files in ${dir}`, 'No test files');
      }
    }
  });

  if (totalTestFiles > 0) {
    logSuccess(`Total test files found: ${totalTestFiles}`);
    recordResult('passed', 'Total test files', `${totalTestFiles} files`);
  } else {
    logWarning('No test files found. Tests need to be created.');
    recordResult('warnings', 'Total test files', 'No test files found');
  }
};

const runBasicTests = () => {
  logHeader('Basic Test Execution Validation');

  try {
    logInfo('Running Jest configuration validation...');
    execSync('npx jest --showConfig', { stdio: 'pipe' });
    logSuccess('Jest configuration is valid');
    recordResult('passed', 'Jest configuration');
  } catch (error) {
    logError('Jest configuration has issues');
    recordResult('failed', 'Jest configuration', error.message);
  }

  try {
    logInfo('Running Playwright configuration validation...');
    execSync('npx playwright test --list', { stdio: 'pipe' });
    logSuccess('Playwright configuration is valid');
    recordResult('passed', 'Playwright configuration');
  } catch (error) {
    logError('Playwright configuration has issues');
    recordResult('failed', 'Playwright configuration', error.message);
  }
};

const generateReport = () => {
  logHeader('Test Setup Validation Report');

  const total = validationResults.passed + validationResults.failed + validationResults.warnings;
  const passRate = ((validationResults.passed / total) * 100).toFixed(1);

  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`📊 VALIDATION SUMMARY`, 'bold');
  log(`${'='.repeat(60)}`, 'cyan');
  log(`✅ Passed: ${validationResults.passed}`, 'green');
  log(`❌ Failed: ${validationResults.failed}`, 'red');
  log(`⚠️  Warnings: ${validationResults.warnings}`, 'yellow');
  log(`📈 Pass Rate: ${passRate}%`, validationResults.failed === 0 ? 'green' : 'yellow');
  log(`${'='.repeat(60)}`, 'cyan');

  // Generate detailed report file
  const reportPath = path.join(__dirname, '../test-results/validation-report.json');
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      passed: validationResults.passed,
      failed: validationResults.failed,
      warnings: validationResults.warnings,
      total,
      passRate: parseFloat(passRate),
    },
    details: validationResults.details,
    recommendations: generateRecommendations(),
  };

  try {
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    logSuccess(`Detailed report saved to: ${reportPath}`);
  } catch (error) {
    logError(`Failed to save report: ${error.message}`);
  }

  // Exit with appropriate code
  if (validationResults.failed > 0) {
    log('\n🚨 Critical issues found. Please fix before running tests.', 'red');
    process.exit(1);
  } else if (validationResults.warnings > 0) {
    log('\n⚠️  Some warnings detected. Consider addressing them for optimal testing.', 'yellow');
    process.exit(0);
  } else {
    log('\n🎉 All validations passed! Your test setup is ready.', 'green');
    process.exit(0);
  }
};

const generateRecommendations = () => {
  const recommendations = [];

  if (validationResults.failed > 0) {
    recommendations.push({
      priority: 'high',
      category: 'critical',
      message: 'Fix all failed validations before proceeding with testing',
      action: 'Review the failed items and install missing dependencies or fix configurations',
    });
  }

  if (validationResults.warnings > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'optimization',
      message: 'Address warnings to improve test coverage and reliability',
      action: 'Install optional dependencies and create missing test files',
    });
  }

  // Add specific recommendations based on validation results
  const hasNoTests = validationResults.details.some(detail =>
    detail.message.includes('No test files found')
  );

  if (hasNoTests) {
    recommendations.push({
      priority: 'high',
      category: 'test-creation',
      message: 'Create test files for comprehensive coverage',
      action: 'Use the Bell24H test generators to create component and page tests',
    });
  }

  return recommendations;
};

// Main execution
const main = () => {
  log(`${colors.bold}🚀 Bell24H Test Setup Validation${colors.reset}`, 'cyan');
  log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);

  validateNodeVersion();
  validatePackageJson();
  validateTestingDependencies();
  validateTestDirectories();
  validateConfigurationFiles();
  validateEnvironmentVariables();
  validateBrowserInstallation();
  validateTestFiles();
  runBasicTests();
  generateReport();
};

// Error handling
process.on('uncaughtException', error => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run validation
main();
