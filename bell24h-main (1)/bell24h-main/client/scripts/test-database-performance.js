#!/usr/bin/env node

/**
 * Database Performance Testing Script
 * Tests database performance with 1000+ concurrent users simulation
 */

const { PrismaClient } = require('@prisma/client')
const { performance } = require('perf_hooks')

const prisma = new PrismaClient()

// Test configurations
const CONCURRENT_USERS = 1000
const REQUESTS_PER_USER = 10
const TOTAL_REQUESTS = CONCURRENT_USERS * REQUESTS_PER_USER

// Performance metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalTime: 0,
  averageResponseTime: 0,
  minResponseTime: Infinity,
  maxResponseTime: 0,
  errors: []
}

async function testDatabasePerformance() {
  console.log('🚀 Starting database performance testing...')
  console.log(`📊 Configuration:`)
  console.log(`  Concurrent Users: ${CONCURRENT_USERS}`)
  console.log(`  Requests per User: ${REQUESTS_PER_USER}`)
  console.log(`  Total Requests: ${TOTAL_REQUESTS}`)
  
  const startTime = performance.now()
  
  try {
    // Test 1: Category Queries
    console.log('\n📁 Testing category queries...')
    await testCategoryQueries()
    
    // Test 2: RFQ Queries
    console.log('\n📝 Testing RFQ queries...')
    await testRFQQueries()
    
    // Test 3: Company Queries
    console.log('\n🏢 Testing company queries...')
    await testCompanyQueries()
    
    // Test 4: Product Queries
    console.log('\n📦 Testing product queries...')
    await testProductQueries()
    
    // Test 5: Search Queries
    console.log('\n🔍 Testing search queries...')
    await testSearchQueries()
    
    // Test 6: Concurrent Load Test
    console.log('\n⚡ Testing concurrent load...')
    await testConcurrentLoad()
    
    const endTime = performance.now()
    metrics.totalTime = endTime - startTime
    metrics.averageResponseTime = metrics.totalTime / metrics.totalRequests
    
    // Generate performance report
    generatePerformanceReport()
    
  } catch (error) {
    console.error('❌ Performance testing failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function testCategoryQueries() {
  const tests = [
    {
      name: 'Get all categories',
      query: () => prisma.category.findMany({ where: { isActive: true } })
    },
    {
      name: 'Get trending categories',
      query: () => prisma.category.findMany({ where: { isTrending: true } })
    },
    {
      name: 'Get category with subcategories',
      query: () => prisma.category.findMany({ 
        include: { subcategories: true },
        where: { isActive: true }
      })
    },
    {
      name: 'Get category statistics',
      query: () => prisma.category.findMany({
        select: {
          id: true,
          name: true,
          supplierCount: true,
          rfqCount: true,
          productCount: true
        }
      })
    }
  ]
  
  for (const test of tests) {
    await runPerformanceTest(test.name, test.query, 100)
  }
}

async function testRFQQueries() {
  const tests = [
    {
      name: 'Get recent RFQs',
      query: () => prisma.rfq.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    },
    {
      name: 'Get RFQs by category',
      query: () => prisma.rfq.findMany({
        where: { category: 'Steel & Metals' },
        take: 20
      })
    },
    {
      name: 'Get RFQs with company info',
      query: () => prisma.rfq.findMany({
        include: { company: true },
        take: 20
      })
    },
    {
      name: 'Get voice RFQs',
      query: () => prisma.rfq.findMany({
        where: { rfqType: 'voice' },
        take: 20
      })
    }
  ]
  
  for (const test of tests) {
    await runPerformanceTest(test.name, test.query, 50)
  }
}

async function testCompanyQueries() {
  const tests = [
    {
      name: 'Get verified companies',
      query: () => prisma.company.findMany({
        where: { isVerified: true },
        take: 50
      })
    },
    {
      name: 'Get companies by category',
      query: () => prisma.company.findMany({
        where: { category: 'Electronics & Components' },
        take: 20
      })
    },
    {
      name: 'Get high-rated companies',
      query: () => prisma.company.findMany({
        where: { rating: { gte: 4.0 } },
        orderBy: { rating: 'desc' },
        take: 20
      })
    },
    {
      name: 'Get companies with products',
      query: () => prisma.company.findMany({
        include: { products: true },
        take: 10
      })
    }
  ]
  
  for (const test of tests) {
    await runPerformanceTest(test.name, test.query, 30)
  }
}

async function testProductQueries() {
  const tests = [
    {
      name: 'Get featured products',
      query: () => prisma.product.findMany({
        where: { isFeatured: true },
        take: 50
      })
    },
    {
      name: 'Get products by category',
      query: () => prisma.product.findMany({
        where: { category: 'Textiles & Apparel' },
        take: 20
      })
    },
    {
      name: 'Get products with company info',
      query: () => prisma.product.findMany({
        include: { company: true },
        take: 20
      })
    },
    {
      name: 'Get products in stock',
      query: () => prisma.product.findMany({
        where: { stock: { gt: 0 } },
        take: 50
      })
    }
  ]
  
  for (const test of tests) {
    await runPerformanceTest(test.name, test.query, 30)
  }
}

async function testSearchQueries() {
  const searchTerms = ['steel', 'textile', 'electronics', 'machinery', 'chemicals']
  
  for (const term of searchTerms) {
    const test = {
      name: `Search for "${term}"`,
      query: () => prisma.rfq.findMany({
        where: {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { category: { contains: term, mode: 'insensitive' } }
          ]
        },
        take: 20
      })
    }
    
    await runPerformanceTest(test.name, test.query, 20)
  }
}

async function testConcurrentLoad() {
  console.log(`  ⚡ Simulating ${CONCURRENT_USERS} concurrent users...`)
  
  const promises = []
  
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    const userPromise = simulateUserRequests(i)
    promises.push(userPromise)
  }
  
  const startTime = performance.now()
  await Promise.all(promises)
  const endTime = performance.now()
  
  console.log(`  ✅ Concurrent load test completed in ${(endTime - startTime).toFixed(2)}ms`)
}

async function simulateUserRequests(userId) {
  const requests = []
  
  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    const requestTypes = [
      () => prisma.category.findMany({ take: 10 }),
      () => prisma.rfq.findMany({ take: 5 }),
      () => prisma.company.findMany({ take: 5 }),
      () => prisma.product.findMany({ take: 5 })
    ]
    
    const randomRequest = requestTypes[Math.floor(Math.random() * requestTypes.length)]
    requests.push(randomRequest())
  }
  
  try {
    await Promise.all(requests)
    metrics.successfulRequests += REQUESTS_PER_USER
  } catch (error) {
    metrics.failedRequests += REQUESTS_PER_USER
    metrics.errors.push({ userId, error: error.message })
  }
  
  metrics.totalRequests += REQUESTS_PER_USER
}

async function runPerformanceTest(testName, query, iterations) {
  const times = []
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now()
    
    try {
      await query()
      const endTime = performance.now()
      const duration = endTime - startTime
      
      times.push(duration)
      metrics.successfulRequests++
      
      if (duration < metrics.minResponseTime) {
        metrics.minResponseTime = duration
      }
      if (duration > metrics.maxResponseTime) {
        metrics.maxResponseTime = duration
      }
      
    } catch (error) {
      metrics.failedRequests++
      metrics.errors.push({ test: testName, error: error.message })
    }
    
    metrics.totalRequests++
  }
  
  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length
  console.log(`    ✅ ${testName}: ${averageTime.toFixed(2)}ms avg (${iterations} iterations)`)
}

function generatePerformanceReport() {
  console.log('\n📊 PERFORMANCE TEST RESULTS')
  console.log('============================')
  console.log(`Total Requests: ${metrics.totalRequests}`)
  console.log(`Successful: ${metrics.successfulRequests}`)
  console.log(`Failed: ${metrics.failedRequests}`)
  console.log(`Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%`)
  console.log(`Total Time: ${metrics.totalTime.toFixed(2)}ms`)
  console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`)
  console.log(`Min Response Time: ${metrics.minResponseTime.toFixed(2)}ms`)
  console.log(`Max Response Time: ${metrics.maxResponseTime.toFixed(2)}ms`)
  console.log(`Requests per Second: ${(metrics.totalRequests / (metrics.totalTime / 1000)).toFixed(2)}`)
  
  if (metrics.errors.length > 0) {
    console.log(`\n❌ Errors (${metrics.errors.length}):`)
    metrics.errors.slice(0, 10).forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.test || `User ${error.userId}`}: ${error.error}`)
    })
    if (metrics.errors.length > 10) {
      console.log(`  ... and ${metrics.errors.length - 10} more errors`)
    }
  }
  
  // Performance assessment
  console.log('\n🎯 PERFORMANCE ASSESSMENT')
  console.log('=========================')
  
  if (metrics.averageResponseTime < 100) {
    console.log('✅ EXCELLENT: Average response time < 100ms')
  } else if (metrics.averageResponseTime < 500) {
    console.log('✅ GOOD: Average response time < 500ms')
  } else if (metrics.averageResponseTime < 1000) {
    console.log('⚠️  ACCEPTABLE: Average response time < 1000ms')
  } else {
    console.log('❌ POOR: Average response time > 1000ms')
  }
  
  if (metrics.successfulRequests / metrics.totalRequests > 0.99) {
    console.log('✅ EXCELLENT: Success rate > 99%')
  } else if (metrics.successfulRequests / metrics.totalRequests > 0.95) {
    console.log('✅ GOOD: Success rate > 95%')
  } else if (metrics.successfulRequests / metrics.totalRequests > 0.90) {
    console.log('⚠️  ACCEPTABLE: Success rate > 90%')
  } else {
    console.log('❌ POOR: Success rate < 90%')
  }
  
  const rps = metrics.totalRequests / (metrics.totalTime / 1000)
  if (rps > 1000) {
    console.log('✅ EXCELLENT: Can handle 1000+ RPS')
  } else if (rps > 500) {
    console.log('✅ GOOD: Can handle 500+ RPS')
  } else if (rps > 100) {
    console.log('⚠️  ACCEPTABLE: Can handle 100+ RPS')
  } else {
    console.log('❌ POOR: Cannot handle high load')
  }
  
  console.log('\n💡 RECOMMENDATIONS')
  console.log('==================')
  
  if (metrics.averageResponseTime > 500) {
    console.log('• Consider adding database indexes')
    console.log('• Implement query caching with Redis')
    console.log('• Optimize complex queries')
  }
  
  if (metrics.failedRequests > 0) {
    console.log('• Review error handling and retry logic')
    console.log('• Check database connection pooling')
    console.log('• Monitor database resource usage')
  }
  
  if (rps < 1000) {
    console.log('• Consider horizontal scaling')
    console.log('• Implement load balancing')
    console.log('• Use CDN for static content')
  }
}

// Run performance test if called directly
if (require.main === module) {
  testDatabasePerformance()
    .then(() => {
      console.log('\n🎉 Performance testing completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Performance testing failed:', error)
      process.exit(1)
    })
}

module.exports = { testDatabasePerformance }
