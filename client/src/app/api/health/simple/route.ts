import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/health/simple - Simplified health check for Vercel builds
 * This endpoint doesn't connect to external services to avoid build failures
 */
export async function GET(request: NextRequest) {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      message: 'Bell24h API is running',
      checks: {
        api: {
          healthy: true,
          message: 'API server is running'
        },
        build: {
          healthy: true,
          message: 'Build completed successfully'
        }
      }
    }
    
    return NextResponse.json(healthStatus, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
    
  } catch (error) {
    console.error('Simple health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  }
}
