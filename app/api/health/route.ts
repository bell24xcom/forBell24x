import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;
    
    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'MSG91_AUTH_KEY',
      'NEXTAUTH_SECRET'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    // Get system metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Check database tables
    const tableCounts = await Promise.all([
      prisma.user.count(),
      prisma.rfq.count(),
      prisma.quote.count(),
      prisma.transaction.count()
    ]);
    
    const health = {
      status: missingEnvVars.length === 0 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      database: {
        connected: true,
        latency: dbLatency,
        tables: {
          users: tableCounts[0],
          rfqs: tableCounts[1],
          quotes: tableCounts[2],
          transactions: tableCounts[3]
        }
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        missingEnvVars
      },
      features: {
        voiceRFQ: process.env.ENABLE_VOICE_RFQ === 'true',
        aiMatching: process.env.ENABLE_AI_MATCHING === 'true',
        escrowPayments: process.env.ENABLE_ESCROW_PAYMENTS === 'true',
        realTimeNotifications: process.env.ENABLE_REAL_TIME_NOTIFICATIONS === 'true'
      }
    };
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(health, { status: statusCode });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false
      }
    }, { status: 503 });
  } finally {
    await prisma.$disconnect();
  }
}
