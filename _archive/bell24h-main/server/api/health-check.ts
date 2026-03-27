/**
 * Health Check API for Bell24H
 * 
 * This API provides endpoints for checking the health of various services,
 * including the Neon PostgreSQL database connection.
 */

import express from 'express';
import { neon } from '@neondatabase/serverless';
import os from 'os';

const router = express.Router();

// Initialize Neon SQL client if DATABASE_URL is available
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

/**
 * GET /api/health-check
 * Returns health status of various services
 */
router.get('/', async (req, res) => {
  try {
    const healthData: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      host: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: {
          total: Math.round(os.totalmem() / (1024 * 1024)) + 'MB',
          free: Math.round(os.freemem() / (1024 * 1024)) + 'MB',
        }
      }
    };
    
    // Check database connection if available
    if (sql) {
      try {
        const dbResult = await sql`SELECT version()`;
        healthData.database = {
          status: 'connected',
          type: 'PostgreSQL (Neon)',
          version: dbResult[0].version
        };
      } catch (dbError) {
        healthData.database = {
          status: 'error',
          message: dbError instanceof Error ? dbError.message : 'Unknown database error'
        };
        healthData.status = 'degraded';
      }
    } else {
      healthData.database = {
        status: 'not_configured',
        message: 'DATABASE_URL not set'
      };
      healthData.status = 'degraded';
    }
    
    // Return appropriate status code based on overall health
    const statusCode = healthData.status === 'ok' ? 200 : 
                      healthData.status === 'degraded' ? 200 : 500;
    
    res.status(statusCode).json(healthData);
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ 
      status: 'error', 
      message: err instanceof Error ? err.message : 'Unknown error in health check'
    });
  }
});

/**
 * GET /api/health-check/db
 * Returns detailed database health information
 */
router.get('/db', async (req, res) => {
  try {
    if (!sql) {
      return res.status(503).json({
        status: 'not_configured',
        message: 'DATABASE_URL not set'
      });
    }
    
    // Get database version
    const versionResult = await sql`SELECT version()`;
    
    // Get database size
    const sizeResult = await sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `;
    
    // Get connection info
    const connectionResult = await sql`
      SELECT 
        count(*) as active_connections,
        current_database() as database_name,
        current_user as user_name
    `;
    
    // Get table counts
    const tableCountResult = await sql`
      SELECT count(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        type: 'PostgreSQL (Neon)',
        version: versionResult[0].version,
        size: sizeResult[0].size,
        connections: parseInt(connectionResult[0].active_connections),
        database: connectionResult[0].database_name,
        user: connectionResult[0].user_name,
        tables: parseInt(tableCountResult[0].table_count)
      }
    });
  } catch (err) {
    console.error('Database health check error:', err);
    res.status(500).json({ 
      status: 'error', 
      message: err instanceof Error ? err.message : 'Unknown database error'
    });
  }
});

/**
 * GET /api/health-check/memory
 * Returns detailed memory usage information
 */
router.get('/memory', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    memory: {
      rss: Math.round(memoryUsage.rss / (1024 * 1024)) + 'MB', // Resident Set Size
      heapTotal: Math.round(memoryUsage.heapTotal / (1024 * 1024)) + 'MB',
      heapUsed: Math.round(memoryUsage.heapUsed / (1024 * 1024)) + 'MB',
      external: Math.round(memoryUsage.external / (1024 * 1024)) + 'MB',
      system: {
        total: Math.round(os.totalmem() / (1024 * 1024)) + 'MB',
        free: Math.round(os.freemem() / (1024 * 1024)) + 'MB',
        used: Math.round((os.totalmem() - os.freemem()) / (1024 * 1024)) + 'MB',
        percentUsed: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100) + '%'
      }
    }
  });
});

export default router;
