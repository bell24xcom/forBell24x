import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

export async function GET() {
  try {
    if (!DATABASE_URL) {
      return NextResponse.json(
        { 
          status: 'unhealthy', 
          error: 'Database URL not configured',
          timestamp: new Date().toISOString()
        }, 
        { status: 500 }
      );
    }

    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });

    // Test database connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();
    await pool.end();

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      dbTime: result.rows[0].current_time
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Database connection failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
