#!/usr/bin/env node

/**
 * Database Load Test Utility
 * Tests database connection pooling under concurrent load
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Neon free tier limit
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: { rejectUnauthorized: false }
});

const CONCURRENT_CONNECTIONS = 100;
const TEST_DURATION_MS = 30000; // 30 seconds

class DatabaseLoadTester {
  constructor() {
    this.results = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      errors: []
    };
    this.startTime = Date.now();
  }

  async runLoadTest() {
    console.log('🧪 Starting Database Load Test...\n');
    console.log(`📊 Configuration:`);
    console.log(`   - Concurrent Connections: ${CONCURRENT_CONNECTIONS}`);
    console.log(`   - Test Duration: ${TEST_DURATION_MS / 1000} seconds`);
    console.log(`   - Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}\n`);

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }

    // Test basic connection first
    await this.testBasicConnection();

    // Run concurrent load test
    await this.runConcurrentTest();

    // Generate report
    this.generateReport();
  }

  async testBasicConnection() {
    console.log('🔍 Testing basic database connection...');
    
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
      client.release();
      
      console.log(`   ✅ Connected successfully`);
      console.log(`   📅 Current time: ${result.rows[0].current_time}`);
      console.log(`   🐘 PostgreSQL version: ${result.rows[0].postgres_version.split(' ')[0]}\n`);
    } catch (error) {
      console.error(`   ❌ Connection failed: ${error.message}\n`);
      process.exit(1);
    }
  }

  async runConcurrentTest() {
    console.log('🚀 Running concurrent load test...');
    
    const promises = [];
    const startTime = Date.now();

    // Create concurrent connection promises
    for (let i = 0; i < CONCURRENT_CONNECTIONS; i++) {
      promises.push(this.executeQuery(i));
    }

    // Wait for all queries to complete or timeout
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve('timeout'), TEST_DURATION_MS);
    });

    try {
      await Promise.race([
        Promise.allSettled(promises),
        timeoutPromise
      ]);
    } catch (error) {
      console.error(`   ❌ Load test error: ${error.message}`);
    }

    const endTime = Date.now();
    console.log(`   ⏱️  Test completed in ${(endTime - startTime) / 1000} seconds\n`);
  }

  async executeQuery(connectionId) {
    let client;
    const queryStartTime = Date.now();

    try {
      // Get connection from pool
      client = await pool.connect();
      
      // Execute test query
      const result = await client.query(`
        SELECT 
          NOW() as timestamp,
          $1 as connection_id,
          pg_backend_pid() as process_id,
          current_database() as database_name
      `, [connectionId]);

      const queryEndTime = Date.now();
      const responseTime = queryEndTime - queryStartTime;

      // Update results
      this.results.totalQueries++;
      this.results.successfulQueries++;
      this.results.averageResponseTime = 
        (this.results.averageResponseTime * (this.results.successfulQueries - 1) + responseTime) / 
        this.results.successfulQueries;
      this.results.maxResponseTime = Math.max(this.results.maxResponseTime, responseTime);
      this.results.minResponseTime = Math.min(this.results.minResponseTime, responseTime);

      if (connectionId % 10 === 0) {
        console.log(`   ✅ Connection ${connectionId}: ${responseTime}ms`);
      }

    } catch (error) {
      const queryEndTime = Date.now();
      const responseTime = queryEndTime - queryStartTime;

      this.results.totalQueries++;
      this.results.failedQueries++;
      this.results.errors.push({
        connectionId,
        error: error.message,
        responseTime
      });

      console.log(`   ❌ Connection ${connectionId} failed: ${error.message}`);
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  generateReport() {
    console.log('📊 LOAD TEST RESULTS');
    console.log('='.repeat(50));
    
    console.log(`\n📈 Query Statistics:`);
    console.log(`   Total Queries: ${this.results.totalQueries}`);
    console.log(`   Successful: ${this.results.successfulQueries} (${this.getSuccessRate()}%)`);
    console.log(`   Failed: ${this.results.failedQueries} (${this.getFailureRate()}%)`);
    
    console.log(`\n⏱️  Response Times:`);
    console.log(`   Average: ${Math.round(this.results.averageResponseTime)}ms`);
    console.log(`   Minimum: ${this.results.minResponseTime === Infinity ? 'N/A' : this.results.minResponseTime + 'ms'}`);
    console.log(`   Maximum: ${this.results.maxResponseTime}ms`);
    
    console.log(`\n🔧 Connection Pool Status:`);
    console.log(`   Pool Size: ${pool.options.max}`);
    console.log(`   Idle Timeout: ${pool.options.idleTimeoutMillis}ms`);
    console.log(`   Connection Timeout: ${pool.options.connectionTimeoutMillis}ms`);

    if (this.results.errors.length > 0) {
      console.log(`\n❌ Errors (${this.results.errors.length}):`);
      this.results.errors.slice(0, 5).forEach((error, index) => {
        console.log(`   ${index + 1}. Connection ${error.connectionId}: ${error.error}`);
      });
      if (this.results.errors.length > 5) {
        console.log(`   ... and ${this.results.errors.length - 5} more errors`);
      }
    }

    console.log(`\n🎯 Performance Assessment:`);
    this.assessPerformance();

    console.log('\n' + '='.repeat(50));
  }

  getSuccessRate() {
    if (this.results.totalQueries === 0) return 0;
    return Math.round((this.results.successfulQueries / this.results.totalQueries) * 100);
  }

  getFailureRate() {
    if (this.results.totalQueries === 0) return 0;
    return Math.round((this.results.failedQueries / this.results.totalQueries) * 100);
  }

  assessPerformance() {
    const successRate = this.getSuccessRate();
    const avgResponseTime = this.results.averageResponseTime;

    if (successRate >= 95 && avgResponseTime <= 1000) {
      console.log('   ✅ EXCELLENT: Ready for production load');
    } else if (successRate >= 90 && avgResponseTime <= 2000) {
      console.log('   ⚠️  GOOD: Suitable for moderate load');
    } else if (successRate >= 80 && avgResponseTime <= 5000) {
      console.log('   ⚠️  FAIR: Needs optimization for high load');
    } else {
      console.log('   ❌ POOR: Requires immediate attention');
    }

    // Specific recommendations
    if (this.results.failedQueries > 0) {
      console.log('   💡 Consider increasing connection pool size');
    }
    if (avgResponseTime > 2000) {
      console.log('   💡 Consider optimizing database queries');
    }
    if (successRate < 90) {
      console.log('   💡 Check database server resources and network');
    }
  }

  async cleanup() {
    await pool.end();
  }
}

// Run the load test
async function main() {
  const tester = new DatabaseLoadTester();
  
  try {
    await tester.runLoadTest();
  } catch (error) {
    console.error('❌ Load test failed:', error.message);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Load test interrupted');
  await pool.end();
  process.exit(0);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DatabaseLoadTester;
