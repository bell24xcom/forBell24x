#!/usr/bin/env node

/**
 * Comprehensive Test Script for Bell24h
 * This script tests all critical functionality to ensure everything works
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: []
};

function logTest(testName, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error?.message || 'Unknown error' });
    console.log(`❌ ${testName}: ${error?.message || 'Failed'}`);
  }
}

async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    logTest('Database Connection', true);
    return true;
  } catch (error) {
    if (error.message.includes('Can\'t reach database server')) {
      logTest('Database Connection', false, new Error('PostgreSQL not running. Please start PostgreSQL and create the database.'));
    } else {
      logTest('Database Connection', false, error);
    }
    return false;
  }
}

async function testDatabaseSchema() {
  try {
    // Test if all required tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('User', 'Profile', 'Category', 'RFQ', 'Quote', 'Payment')
    `;
    
    const expectedTables = ['User', 'Profile', 'Category', 'RFQ', 'Quote', 'Payment'];
    const existingTables = tables.map(t => t.table_name);
    const missingTables = expectedTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length === 0) {
      logTest('Database Schema', true);
      return true;
    } else {
      logTest('Database Schema', false, new Error(`Missing tables: ${missingTables.join(', ')}`));
      return false;
    }
  } catch (error) {
    logTest('Database Schema', false, error);
    return false;
  }
}

async function testUserOperations() {
  try {
    // Test creating a user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'BUYER',
        profile: {
          create: {
            companyName: 'Test Company',
            industry: 'Technology',
            phoneNumber: '+1234567890',
            address: '123 Test St, Test City, TC 12345',
            isVerified: false
          }
        }
      }
    });
    
    // Test reading the user
    const foundUser = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: { profile: true }
    });
    
    // Test updating the user
    await prisma.user.update({
      where: { id: testUser.id },
      data: { name: 'Updated Test User' }
    });
    
    // Test deleting the user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    
    logTest('User CRUD Operations', true);
    return true;
  } catch (error) {
    logTest('User CRUD Operations', false, error);
    return false;
  }
}

async function testEnvironmentVariables() {
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length === 0) {
    logTest('Environment Variables', true);
    return true;
  } else {
    logTest('Environment Variables', false, new Error(`Missing variables: ${missingVars.join(', ')}`));
    return false;
  }
}

async function testFileStructure() {
  const requiredFiles = [
    'package.json',
    'prisma/schema.prisma',
    'lib/auth.js',
    '.env.local',
    'pages/api/auth/[...nextauth].js'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length === 0) {
    logTest('File Structure', true);
    return true;
  } else {
    logTest('File Structure', false, new Error(`Missing files: ${missingFiles.join(', ')}`));
    return false;
  }
}

async function testPackageJson() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const requiredDeps = [
      'next',
      'react',
      'react-dom',
      '@prisma/client',
      'next-auth',
      'bcryptjs'
    ];
    
    const missingDeps = requiredDeps.filter(dep => 
      !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
    );
    
    if (missingDeps.length === 0) {
      logTest('Package Dependencies', true);
      return true;
    } else {
      logTest('Package Dependencies', false, new Error(`Missing dependencies: ${missingDeps.join(', ')}`));
      return false;
    }
  } catch (error) {
    logTest('Package Dependencies', false, error);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Running Bell24h Setup Tests...\n');
  
  // Run all tests
  await testFileStructure();
  await testPackageJson();
  await testEnvironmentVariables();
  
  const dbConnected = await testDatabaseConnection();
  if (dbConnected) {
    await testDatabaseSchema();
    await testUserOperations();
  }
  
  // Print results
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.errors.forEach(error => {
      console.log(`  - ${error.test}: ${error.error}`);
    });
    
    console.log('\n🔧 Fix these issues and run the test again:');
    console.log('npm run test:setup');
  } else {
    console.log('\n🎉 All tests passed! Your Bell24h setup is ready.');
    console.log('\n🚀 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000');
    console.log('3. Test the authentication system');
  }
  
  await prisma.$disconnect();
}

// Run the tests
runAllTests().catch(console.error);
