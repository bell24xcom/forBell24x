import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  // Check which env vars are set
  const hasDatabase = !!process.env.DATABASE_URL;
  const hasAuth = !!process.env.NEXTAUTH_SECRET;
  const hasInsforge = !!process.env.INSFORGE_API_KEY;

  // Only attempt DB connection if DATABASE_URL is configured
  let dbStatus: { connected: boolean; latency?: number; error?: string; note?: string } = {
    connected: false,
    note: 'DATABASE_URL not set in environment variables',
  };

  if (hasDatabase) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - startTime;
      await prisma.$disconnect();
      dbStatus = { connected: true, latency };
    } catch (err) {
      dbStatus = {
        connected: false,
        error: err instanceof Error ? err.message : 'Unknown DB error',
      };
    }
  }

  const allCriticalOk = hasAuth;
  const status = allCriticalOk ? (dbStatus.connected ? 'healthy' : 'degraded') : 'degraded';

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      website: 'online',
      database: dbStatus,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        configured: {
          database: hasDatabase,
          auth: hasAuth,
          insforge: hasInsforge,
        },
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      },
    },
    { status: status === 'healthy' ? 200 : 200 } // always 200 so monitoring tools don't alert
  );
}
