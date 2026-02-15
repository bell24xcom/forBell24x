#!/usr/bin/env node

/**
 * Bell24H Homepage & Authentication Testing Script
 * Tests the enhanced homepage, login, and registration pages
 */

import axios from 'axios';
import chalk from 'chalk';

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 30000;

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let testResults = [];

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  switch (type) {
    case 'success':
      console.log(chalk.green(`✅ ${message}`));
      break;
    case 'error':
      console.log(chalk.red(`❌ ${message}`));
      break;
    case 'warning':
      console.log(chalk.yellow(`⚠️  ${message}`));
      break;
    case 'info':
      console.log(chalk.blue(`ℹ️  ${message}`));
      break;
    default:
      console.log(`📝 ${message}`);
  }
};

const runTest = async (testName, testFunction) => {
  totalTests++;
  const isInitialLoadTest = testName.toLowerCase().includes('load');
  const timeout = isInitialLoadTest ? 60000 : TEST_TIMEOUT; // 60s for initial load, 30s for others
  try {
    await Promise.race([
      testFunction(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Test timed out')), timeout))
    ]);
    passedTests++;
    testResults.push({ name: testName, status: 'PASSED' });
    log(`${testName} - PASSED`, 'success');
  } catch (error) {
    failedTests++;
    testResults.push({ name: testName, status: 'FAILED', error: error.message });
    log(`${testName} - FAILED: ${error.message}`, 'error');
  }
};

const checkResponseTime = (startTime, maxTime = 3000) => {
  const responseTime = Date.now() - startTime;
  if (responseTime > maxTime) {
    throw new Error(`Response time ${responseTime}ms exceeds maximum ${maxTime}ms`);
  }
  return responseTime;
};

// Test functions
const testHomepageLoad = async () => {
  const startTime = Date.now();
  const response = await axios.get(`${BASE_URL}/`, { timeout: 60000 });
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  const responseTime = checkResponseTime(startTime);
  
  // Check for key homepage elements
  const content = response.data;
  const requiredElements = [
    'Bell24H',
    'The Future of B2B Procurement',
    'Voice & Video RFQ System',
    'Secure Escrow Payments',
    'Get Started Free',
    'Watch Demo'
  ];
  
  for (const element of requiredElements) {
    if (!content.includes(element)) {
      throw new Error(`Missing required element: ${element}`);
    }
  }
  
  log(`Homepage loaded in ${responseTime}ms`, 'success');
};

const testHomepageNavigation = async () => {
  const response = await axios.get(`${BASE_URL}/`, { timeout: TEST_TIMEOUT });
  const content = response.data;
  
  // Check navigation links
  const navLinks = ['#features', '#pricing', '#about', '/login', '/register'];
  
  for (const link of navLinks) {
    if (!content.includes(link)) {
      throw new Error(`Missing navigation link: ${link}`);
    }
  }
};

const testHomepageHeroSection = async () => {
  const response = await axios.get(`${BASE_URL}/`, { timeout: TEST_TIMEOUT });
  const content = response.data;
  
  // Check hero section elements
  const heroElements = [
    'bg-gradient-to-br from-blue-900',
    'text-5xl md:text-7xl',
    'bg-orange-500',
    'animate-pulse'
  ];
  
  for (const element of heroElements) {
    if (!content.includes(element)) {
      throw new Error(`Missing hero section element: ${element}`);
    }
  }
};

const testHomepageFeatures = async () => {
  const response = await axios.get(`${BASE_URL}/`, { timeout: TEST_TIMEOUT });
  const content = response.data;
  
  // Check features section
  const features = [
    'Voice-Based RFQ',
    'Video RFQ System',
    'AI Explainability',
    'Secure Escrow',
    'Real-time Analytics',
    'Global Marketplace'
  ];
  
  for (const feature of features) {
    if (!content.includes(feature)) {
      throw new Error(`Missing feature: ${feature}`);
    }
  }
};

const testHomepageTestimonials = async () => {
  const response = await axios.get(`${BASE_URL}/`, { timeout: TEST_TIMEOUT });
  const content = response.data;
  
  // Check testimonials section
  const testimonialElements = [
    'Trusted by Leading Businesses',
    'Sarah Johnson',
    'Rajesh Kumar',
    'Maria Garcia'
  ];
  
  for (const element of testimonialElements) {
    if (!content.includes(element)) {
      throw new Error(`Missing testimonial element: ${element}`);
    }
  }
};

const testHomepagePricing = async () => {
  const response = await axios.get(`${BASE_URL}/`, { timeout: TEST_TIMEOUT });
  const content = response.data;
  
  // Check pricing section
  const pricingElements = [
    'Simple, Transparent Pricing',
    'Free',
    'Pro',
    'Enterprise',
    '₹0',
    '₹8,000',
    '₹50,000'
  ];
  
  for (const element of pricingElements) {
    if (!content.includes(element)) {
      throw new Error(`Missing pricing element: ${element}`);
    }
  }
};

const testLoginPageLoad = async () => {
  const startTime = Date.now();
  const response = await axios.get(`${BASE_URL}/login`, { timeout: 60000 });
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  const responseTime = checkResponseTime(startTime);
  
  // Check for login page elements
  const content = response.data;
  const requiredElements = [
    'Welcome back',
    'Sign in to your account',
    'Email Address',
    'Password',
    'Remember me',
    'Forgot password?',
    'Sign In',
    'Continue with Google',
    'Continue with LinkedIn'
  ];
  
  for (const element of requiredElements) {
    if (!content.includes(element)) {
      throw new Error(`Missing login element: ${element}`);
    }
  }
  
  log(`Login page loaded in ${responseTime}ms`, 'success');
};

const testLoginFormValidation = async () => {
  // Test empty form submission
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {}, { timeout: TEST_TIMEOUT });
    throw new Error('Empty form should not be accepted');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // Expected validation error
      log('Login form validation working correctly', 'success');
    } else {
      throw new Error('Login form validation not working as expected');
    }
  }
};

const testLoginWithInvalidCredentials = async () => {
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'invalid@test.com',
      password: 'wrongpassword'
    }, { timeout: TEST_TIMEOUT });
    throw new Error('Invalid credentials should not be accepted');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Expected authentication error
      log('Invalid credentials properly rejected', 'success');
    } else {
      throw new Error('Invalid credentials not properly handled');
    }
  }
};

const testRegisterPageLoad = async () => {
  const startTime = Date.now();
  const response = await axios.get(`${BASE_URL}/register`, { timeout: 60000 });
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  const responseTime = checkResponseTime(startTime);
  
  // Check for registration page elements
  const content = response.data;
  const requiredElements = [
    'Create your account',
    'Join thousands of businesses',
    'Step 1 of 4',
    'Basic Info',
    'Business Info',
    'Role & Plan',
    'Preferences'
  ];
  
  for (const element of requiredElements) {
    if (!content.includes(element)) {
      throw new Error(`Missing registration element: ${element}`);
    }
  }
  
  log(`Registration page loaded in ${responseTime}ms`, 'success');
};

const testRegisterFormSteps = async () => {
  const response = await axios.get(`${BASE_URL}/register`, { timeout: TEST_TIMEOUT });
  const content = response.data;
  
  // Check multi-step form elements
  const stepElements = [
    'currentStep',
    'validateStep',
    'nextStep',
    'prevStep'
  ];
  
  for (const element of stepElements) {
    if (!content.includes(element)) {
      throw new Error(`Missing step form element: ${element}`);
    }
  }
};

const testRegisterRoleSelection = async () => {
  const response = await axios.get(`${BASE_URL}/register`, { timeout: TEST_TIMEOUT });
  const content = response.data;
  
  // Check role selection options
  const roleOptions = [
    'Buying',
    'Selling',
    'Both',
    'buyer',
    'supplier',
    'both'
  ];
  
  for (const option of roleOptions) {
    if (!content.includes(option)) {
      throw new Error(`Missing role option: ${option}`);
    }
  }
};

const testRegisterSubscriptionPlans = async () => {
  const response = await axios.get(`${BASE_URL}/register`, { timeout: TEST_TIMEOUT });
  const content = response.data;
  
  // Check subscription plan options
  const planElements = [
    'Free',
    'Pro',
    'Enterprise',
    'Most Popular',
    '₹0',
    '₹8,000',
    '₹50,000'
  ];
  
  for (const element of planElements) {
    if (!content.includes(element)) {
      throw new Error(`Missing subscription plan element: ${element}`);
    }
  }
};

const testSocialLoginButtons = async () => {
  const loginResponse = await axios.get(`${BASE_URL}/login`, { timeout: TEST_TIMEOUT });
  const registerResponse = await axios.get(`${BASE_URL}/register`, { timeout: TEST_TIMEOUT });
  
  const loginContent = loginResponse.data;
  const registerContent = registerResponse.data;
  
  // Check social login buttons
  const socialButtons = [
    'Continue with Google',
    'Continue with LinkedIn',
    'Google',
    'LinkedIn'
  ];
  
  for (const button of socialButtons) {
    if (!loginContent.includes(button) || !registerContent.includes(button)) {
      throw new Error(`Missing social login button: ${button}`);
    }
  }
};

const testResponsiveDesign = async () => {
  const response = await axios.get(`${BASE_URL}/`, { timeout: TEST_TIMEOUT });
  const content = response.data;
  
  // Check for presence of media queries, a better sign of responsiveness
  const responsiveClasses = [
    '@media',
    'md:',
    'lg:'
  ];
  
  for (const className of responsiveClasses) {
    if (!content.includes(className)) {
      throw new Error(`Missing responsive class: ${className}`);
    }
  }
};

const testAnimations = async () => {
  const response = await axios.get(`${BASE_URL}/`, { timeout: TEST_TIMEOUT });
  const content = response.data;
  
  // Check for animation classes or library indicators
  const animationElements = [
    'motion', // Framer motion
    'animate', // General animation class
    'transition' // CSS transitions
  ];
  
  for (const element of animationElements) {
    if (!content.includes(element)) {
      throw new Error(`Missing animation element: ${element}`);
    }
  }
};

const testAccessibility = async () => {
  const response = await axios.get(`${BASE_URL}/`, { timeout: TEST_TIMEOUT });
  const content = response.data;
  
  // Check for key accessibility attributes
  const accessibilityElements = [
    '<label', // Forms should have labels
    'alt=', // Images should have alt text
    'role=' // Roles for semantic sections
  ];
  
  for (const element of accessibilityElements) {
    if (!content.includes(element)) {
      throw new Error(`Missing accessibility element: ${element}`);
    }
  }
};

const testSEO = async () => {
  const response = await axios.get(`${BASE_URL}/`, { timeout: TEST_TIMEOUT });
  const content = response.data;
  
  // Check SEO elements
  const seoElements = [
    '<title>',
    '<meta name="description"',
    '<link rel="canonical"'
  ];
  
  for (const element of seoElements) {
    if (!content.includes(element)) {
      throw new Error(`Missing SEO element: ${element}`);
    }
  }
};

const testPerformance = async () => {
  const startTime = Date.now();
  await axios.get(`${BASE_URL}/`, { timeout: 60000 });
  const responseTime = checkResponseTime(startTime, 3000); // Keep check at 3s, but allow initial request to take longer
  
  if (responseTime > 3000) {
    throw new Error(`Homepage subsequent load time ${responseTime}ms is too slow`);
  }
  
  log(`Homepage performance test passed: ${responseTime}ms`, 'success');
};

const testMobileOptimization = async () => {
  const response = await axios.get(`${BASE_URL}/`, { 
    timeout: TEST_TIMEOUT,
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    }
  });
  
  const content = response.data;
  
  // Check mobile-specific elements
  const mobileElements = [
    'viewport', // Essential for mobile
    'touch-action' // For touch interactions
  ];
  
  for (const element of mobileElements) {
    if (!content.includes(element)) {
      throw new Error(`Missing mobile optimization element: ${element}`);
    }
  }
};

// Main test runner
const runAllTests = async () => {
  console.log(chalk.cyan.bold('\n🚀 Starting Bell24H Homepage & Authentication Tests'));
  console.log(chalk.gray(`Base URL: ${BASE_URL}\n`));

  // Homepage Tests
  console.log(chalk.yellow.bold('\n📋 Testing Homepage'));
  await runTest('Homepage Load', testHomepageLoad);
  await runTest('Homepage Navigation', testHomepageNavigation);
  await runTest('Hero Section', testHomepageHeroSection);
  await runTest('Features Section', testHomepageFeatures);
  await runTest('Testimonials Section', testHomepageTestimonials);
  await runTest('Pricing Section', testHomepagePricing);
  await runTest('Responsive Design', testResponsiveDesign);
  await runTest('Animations', testAnimations);
  await runTest('Accessibility', testAccessibility);
  await runTest('SEO Elements', testSEO);
  await runTest('Performance', testPerformance);
  await runTest('Mobile Optimization', testMobileOptimization);

  // Login Tests
  console.log(chalk.yellow.bold('\n📋 Testing Login Page'));
  await runTest('Login Page Load', testLoginPageLoad);
  await runTest('Login Form Validation', testLoginFormValidation);
  await runTest('Invalid Credentials', testLoginWithInvalidCredentials);
  await runTest('Social Login Buttons', testSocialLoginButtons);

  // Registration Tests
  console.log(chalk.yellow.bold('\n📋 Testing Registration Page'));
  await runTest('Registration Page Load', testRegisterPageLoad);
  await runTest('Multi-step Form', testRegisterFormSteps);
  await runTest('Role Selection', testRegisterRoleSelection);
  await runTest('Subscription Plans', testRegisterSubscriptionPlans);

  // Print results
  console.log(chalk.cyan.bold('\n📊 Test Results Summary'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.white(`Total Tests: ${totalTests}`));
  console.log(chalk.green(`Passed: ${passedTests}`));
  console.log(chalk.red(`Failed: ${failedTests}`));
  console.log(chalk.blue(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`));

  if (failedTests > 0) {
    console.log(chalk.red.bold('\n❌ Failed Tests:'));
    testResults
      .filter(result => result.status === 'FAILED')
      .forEach(result => {
        console.log(chalk.red(`  • ${result.name}: ${result.error}`));
      });
  }

  console.log(chalk.gray('\n─'.repeat(50)));
  
  if (failedTests === 0) {
    console.log(chalk.green.bold('🎉 All tests passed! Homepage and authentication system is ready for production.'));
  } else {
    console.log(chalk.red.bold(`⚠️  ${failedTests} test(s) failed. Please review and fix the issues.`));
    process.exit(1);
  }
};

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:', promise, 'reason:', reason));
  process.exit(1);
});

// Run tests
runAllTests().catch(error => {
  console.error(chalk.red('Test runner error:', error.message));
  process.exit(1);
}); 