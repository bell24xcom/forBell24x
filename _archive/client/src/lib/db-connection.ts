import { PrismaClient } from '@prisma/client'

// Global variable to store the Prisma instance
declare global {
  var __db: PrismaClient | undefined
}

// Connection pool configuration for Railway PostgreSQL
const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Optimize connection pool for Railway PostgreSQL
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  }).$extends({
    query: {
      $allOperations: async ({ operation, model, args, query }) => {
        const start = Date.now()
        try {
          const result = await query(args)
          const end = Date.now()
          
          // Log slow queries for optimization
          if (end - start > 1000) {
            console.warn(`Slow query detected: ${model}.${operation} took ${end - start}ms`)
          }
          
          return result
        } catch (error) {
          console.error(`Database error in ${model}.${operation}:`, error)
          throw error
        }
      },
    },
  })
}

// Singleton pattern for Prisma client to prevent connection leaks
export const db = globalThis.__db ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__db = db
}

// Connection health check function
export async function checkDatabaseHealth() {
  try {
    await db.$queryRaw`SELECT 1 as health_check`
    return { status: 'healthy', timestamp: new Date().toISOString() }
  } catch (error) {
    console.error('Database health check failed:', error)
    return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Graceful shutdown function
export async function closeDatabaseConnection() {
  try {
    await db.$disconnect()
    console.log('Database connection closed gracefully')
  } catch (error) {
    console.error('Error closing database connection:', error)
  }
}

// Connection monitoring for Railway PostgreSQL
export class ConnectionMonitor {
  private static instance: ConnectionMonitor
  private connectionCount = 0
  private lastCheck = Date.now()

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor()
    }
    return ConnectionMonitor.instance
  }

  async monitorConnections() {
    try {
      // Check active connections
      const result = await db.$queryRaw<Array<{ count: number }>>`
        SELECT count(*) as count 
        FROM pg_stat_activity 
        WHERE state = 'active' AND datname = current_database()
      `
      
      const activeConnections = result[0]?.count || 0
      
      // Railway PostgreSQL typically has a 60 connection limit
      if (activeConnections > 45) {
        console.warn(`High connection count detected: ${activeConnections}/60`)
        // Trigger connection cleanup if needed
        await this.cleanupIdleConnections()
      }
      
      this.connectionCount = activeConnections
      this.lastCheck = Date.now()
      
      return {
        activeConnections,
        maxConnections: 60, // Railway PostgreSQL limit
        utilization: (activeConnections / 60) * 100,
        lastCheck: new Date(this.lastCheck).toISOString()
      }
    } catch (error) {
      console.error('Connection monitoring failed:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  private async cleanupIdleConnections() {
    try {
      // Kill idle connections older than 5 minutes
      await db.$executeRaw`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE state = 'idle'
        AND state_change < NOW() - INTERVAL '5 minutes'
        AND datname = current_database()
        AND pid != pg_backend_pid()
      `
      console.log('Cleaned up idle database connections')
    } catch (error) {
      console.error('Failed to cleanup idle connections:', error)
    }
  }
}

// Auto-cleanup for Vercel serverless functions
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await closeDatabaseConnection()
  })
  
  process.on('SIGINT', async () => {
    await closeDatabaseConnection()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    await closeDatabaseConnection()
    process.exit(0)
  })
}

// Export configured database instance
export default db 
