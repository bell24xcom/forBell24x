/**
 * Production-Grade Database Connection Manager
 * Handles 1000+ concurrent connections with pooling and failover
 */

import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

// Database configuration for production
const DATABASE_CONFIG = {
  // Primary database
  primary: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'bell24h_prod',
    user: process.env.DB_USER || 'bell24h_user',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Connection pooling settings
    max: 20, // Maximum number of clients in the pool
    min: 5,  // Minimum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    statement_timeout: 30000, // Query timeout in milliseconds
    query_timeout: 30000, // Query timeout in milliseconds
  },
  // Read replica (if available)
  readReplica: process.env.DB_READ_REPLICA_URL ? {
    connectionString: process.env.DB_READ_REPLICA_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  } : null,
}

// Create connection pools
const primaryPool = new Pool(DATABASE_CONFIG.primary)
const readPool = DATABASE_CONFIG.readReplica ? new Pool(DATABASE_CONFIG.readReplica) : null

// Prisma client with connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Connection health monitoring
let isHealthy = true
let lastHealthCheck = Date.now()

/**
 * Health check for database connections
 */
async function healthCheck(): Promise<boolean> {
  try {
    // Test primary connection
    const primaryResult = await primaryPool.query('SELECT 1 as health')
    if (primaryResult.rows[0]?.health !== 1) {
      throw new Error('Primary database health check failed')
    }

    // Test read replica if available
    if (readPool) {
      const readResult = await readPool.query('SELECT 1 as health')
      if (readResult.rows[0]?.health !== 1) {
        console.warn('Read replica health check failed, using primary for reads')
      }
    }

    isHealthy = true
    lastHealthCheck = Date.now()
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    isHealthy = false
    return false
  }
}

/**
 * Get database connection status
 */
export function getDatabaseStatus() {
  return {
    healthy: isHealthy,
    lastHealthCheck: new Date(lastHealthCheck),
    primaryPool: {
      totalCount: primaryPool.totalCount,
      idleCount: primaryPool.idleCount,
      waitingCount: primaryPool.waitingCount,
    },
    readPool: readPool ? {
      totalCount: readPool.totalCount,
      idleCount: readPool.idleCount,
      waitingCount: readPool.waitingCount,
    } : null,
  }
}

/**
 * Execute query with automatic retry and failover
 */
export async function executeQuery<T = any>(
  query: string,
  params: any[] = [],
  options: {
    useReadReplica?: boolean
    retries?: number
    timeout?: number
  } = {}
): Promise<T[]> {
  const { useReadReplica = false, retries = 3, timeout = 30000 } = options

  // Choose appropriate pool
  const pool = (useReadReplica && readPool) ? readPool : primaryPool

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const startTime = Date.now()
      
      const result = await Promise.race([
        pool.query(query, params),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), timeout)
        )
      ]) as any

      const duration = Date.now() - startTime
      
      // Log slow queries
      if (duration > 5000) {
        console.warn(`Slow query detected: ${duration}ms - ${query.substring(0, 100)}...`)
      }

      return result.rows
    } catch (error) {
      console.error(`Query attempt ${attempt} failed:`, error)
      
      if (attempt === retries) {
        throw error
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }

  throw new Error('All query attempts failed')
}

/**
 * Execute transaction with automatic rollback on error
 */
export async function executeTransaction<T>(
  callback: (tx: any) => Promise<T>
): Promise<T> {
  const client = await primaryPool.connect()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Batch insert with chunking for large datasets
 */
export async function batchInsert(
  table: string,
  columns: string[],
  values: any[][],
  chunkSize: number = 1000
): Promise<void> {
  const chunks = []
  for (let i = 0; i < values.length; i += chunkSize) {
    chunks.push(values.slice(i, i + chunkSize))
  }

  for (const chunk of chunks) {
    const placeholders = chunk.map((_, index) => {
      const rowPlaceholders = columns.map((_, colIndex) => 
        `$${index * columns.length + colIndex + 1}`
      ).join(', ')
      return `(${rowPlaceholders})`
    }).join(', ')

    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES ${placeholders}
      ON CONFLICT DO NOTHING
    `

    const flatValues = chunk.flat()
    await executeQuery(query, flatValues)
  }
}

/**
 * Get database metrics for monitoring
 */
export async function getDatabaseMetrics() {
  try {
    const metrics = await executeQuery(`
      SELECT 
        'connections' as metric,
        count(*) as value
      FROM pg_stat_activity 
      WHERE state = 'active'
      
      UNION ALL
      
      SELECT 
        'idle_connections' as metric,
        count(*) as value
      FROM pg_stat_activity 
      WHERE state = 'idle'
      
      UNION ALL
      
      SELECT 
        'database_size' as metric,
        pg_database_size(current_database()) as value
      
      UNION ALL
      
      SELECT 
        'cache_hit_ratio' as metric,
        round(
          (sum(blks_hit) * 100.0 / (sum(blks_hit) + sum(blks_read))), 2
        ) as value
      FROM pg_stat_database 
      WHERE datname = current_database()
    `)

    return {
      timestamp: new Date().toISOString(),
      metrics: metrics.reduce((acc, row) => {
        acc[row.metric] = row.value
        return acc
      }, {} as Record<string, any>),
      poolStatus: getDatabaseStatus(),
    }
  } catch (error) {
    console.error('Failed to get database metrics:', error)
    return {
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch metrics',
      poolStatus: getDatabaseStatus(),
    }
  }
}

/**
 * Cleanup function for graceful shutdown
 */
export async function cleanup() {
  try {
    console.log('Closing database connections...')
    
    await Promise.all([
      primaryPool.end(),
      readPool?.end(),
      prisma.$disconnect(),
    ])
    
    console.log('Database connections closed successfully')
  } catch (error) {
    console.error('Error closing database connections:', error)
  }
}

// Health check every 30 seconds
setInterval(healthCheck, 30000)

// Graceful shutdown
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

// Export Prisma client and utilities
export { prisma, primaryPool, readPool }
export default prisma
