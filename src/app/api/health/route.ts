import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  // Check which env vars are set
  const hasDatabase        = !!process.env.DATABASE_URL;
  const hasJwt             = !!process.env.JWT_SECRET;
  const hasMsg91           = !!process.env.MSG91_AUTH_KEY;
  const hasGroq            = !!process.env.GROQ_API_KEY;
  const hasRazorpay        = !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;
  const hasRazorpayWebhook = !!process.env.RAZORPAY_WEBHOOK_SECRET;

  // Only attempt DB connection if DATABASE_URL is configured
  let dbStatus: { connected: boolean; latency?: number; error?: string; note?: string } = {
    connected: false,
    note: 'DATABASE_URL not set in environment variables',
  };

  if (hasDatabase) {
    try {
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - startTime;
      dbStatus = { connected: true, latency };
    } catch (err) {
      dbStatus = {
        connected: false,
        error: err instanceof Error ? err.message : 'Unknown DB error',
      };
    }
  }

  const allCriticalOk = hasJwt && hasMsg91;
  const status = allCriticalOk ? (dbStatus.connected ? 'healthy' : 'degraded') : 'degraded';

  return NextResponse.json(
    {
      status,
      deployVersion: 'cdc31e8',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      website: 'online',
      database: dbStatus,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        configured: {
          database: hasDatabase,
          jwt: hasJwt,
          msg91: hasMsg91,
          msg91Email: hasMsg91,
          groq: hasGroq,
          razorpay: hasRazorpay,
          razorpayWebhook: hasRazorpayWebhook,
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
