#!/usr/bin/env node

/**
 * REAL Testing Script
 * Actually tests the implementation
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testSetup() {
  console.log('🧪 Testing Bell24h setup...')
  
  const tests = []
  
  // Test 1: Database Connection
  try {
    await prisma.$connect()
    tests.push({ name: 'Database Connection', status: 'PASS' })
  } catch (error) {
    tests.push({ name: 'Database Connection', status: 'FAIL', error: error.message })
  }
  
  // Test 2: Environment Variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
  ]
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missingEnvVars.length === 0) {
    tests.push({ name: 'Environment Variables', status: 'PASS' })
  } else {
    tests.push({ 
      name: 'Environment Variables', 
      status: 'FAIL', 
      error: `Missing: ${missingEnvVars.join(', ')}` 
    })
  }
  
  // Test 3: Database Schema
  try {
    const userCount = await prisma.user.count()
    const companyCount = await prisma.company.count()
    tests.push({ 
      name: 'Database Schema', 
      status: 'PASS',
      details: `${userCount} users, ${companyCount} companies`
    })
  } catch (error) {
    tests.push({ name: 'Database Schema', status: 'FAIL', error: error.message })
  }
  
  // Test 4: Password Hashing
  try {
    const testPassword = 'test123'
    const hashed = await bcrypt.hash(testPassword, 12)
    const isValid = await bcrypt.compare(testPassword, hashed)
    
    if (isValid) {
      tests.push({ name: 'Password Hashing', status: 'PASS' })
    } else {
      tests.push({ name: 'Password Hashing', status: 'FAIL', error: 'Hash verification failed' })
    }
  } catch (error) {
    tests.push({ name: 'Password Hashing', status: 'FAIL', error: error.message })
  }
  
  // Test 5: API Routes (if server is running)
  try {
    const response = await fetch('http://localhost:3000/api/health')
    if (response.ok) {
      tests.push({ name: 'API Health Check', status: 'PASS' })
    } else {
      tests.push({ name: 'API Health Check', status: 'FAIL', error: `HTTP ${response.status}` })
    }
  } catch (error) {
    tests.push({ name: 'API Health Check', status: 'SKIP', error: 'Server not running' })
  }
  
  // Print Results
  console.log('\n📊 Test Results:')
  console.log('================')
  
  tests.forEach(test => {
    const status = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⏭️'
    console.log(`${status} ${test.name}: ${test.status}`)
    if (test.error) {
      console.log(`   Error: ${test.error}`)
    }
    if (test.details) {
      console.log(`   Details: ${test.details}`)
    }
  })
  
  const passed = tests.filter(t => t.status === 'PASS').length
  const total = tests.length
  
  console.log(`\n🎯 Score: ${passed}/${total} tests passed`)
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your setup is working correctly.')
  } else {
    console.log('⚠️ Some tests failed. Please fix the issues above.')
  }
  
  await prisma.$disconnect()
}

// Run tests
testSetup().catch(console.error)
