import { Request, Response } from 'express';
import { authenticate } from '../../../middleware/auth.js';
import { isAdmin } from '../../../middleware/auth.js';
import { prisma } from '../../../db/client.js';
import os from 'os';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply authentication and admin authorization
    await authenticate(req, res, () => {});
    isAdmin(req, res, () => {});

    // Get system metrics
    const systemMetrics = await getSystemMetrics();
    
    // Get application metrics
    const appMetrics = await getApplicationMetrics();
    
    // Determine overall system health
    const systemHealth = determineSystemHealth(systemMetrics, appMetrics);

    const healthData = {
      status: systemHealth.status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      metrics: {
        ...systemMetrics,
        ...appMetrics
      },
      checks: {
        database: await checkDatabaseHealth(),
        api: await checkAPIHealth(),
        memory: checkMemoryHealth(systemMetrics.memoryUsage),
        cpu: checkCPUHealth(systemMetrics.cpuUsage),
        disk: checkDiskHealth(systemMetrics.diskUsage)
      }
    };

    res.status(200).json(healthData);
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ 
      error: 'Failed to fetch system health',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function getSystemMetrics() {
  // Get system-level metrics
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

  const cpus = os.cpus();
  const cpuUsage = cpus.reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b);
    const idle = cpu.times.idle;
    return acc + ((total - idle) / total) * 100;
  }, 0) / cpus.length;

  // Mock disk usage (in production, you'd use a library like 'diskusage')
  const diskUsage = 45.2; // percentage

  return {
    memoryUsage: Math.round(memoryUsage * 100) / 100,
    cpuUsage: Math.round(cpuUsage * 100) / 100,
    diskUsage: Math.round(diskUsage * 100) / 100,
    loadAverage: os.loadavg(),
    uptime: os.uptime(),
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    totalMemory: totalMemory,
    freeMemory: freeMemory
  };
}

async function getApplicationMetrics() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Get application-level metrics
  const [
    totalUsers,
    activeUsers,
    totalRFQs,
    totalTransactions,
    errorCount
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        lastLoginAt: {
          gte: oneHourAgo
        }
      }
    }),
    prisma.rFQ.count(),
    prisma.transaction?.count() || Promise.resolve(0),
    // Mock error count (in production, this would come from error tracking)
    Promise.resolve(15)
  ]);

  // Calculate response time (mock data for now)
  const responseTime = 150 + Math.random() * 50; // ms

  // Calculate error rate
  const totalRequests = 1000; // mock total requests
  const errorRate = (errorCount / totalRequests) * 100;

  return {
    totalUsers,
    activeUsers,
    totalRFQs,
    totalTransactions,
    errorCount,
    errorRate: Math.round(errorRate * 100) / 100,
    responseTime: Math.round(responseTime),
    throughput: 1250 + Math.random() * 200 // requests per second
  };
}

function determineSystemHealth(systemMetrics: any, appMetrics: any) {
  let status = 'healthy';
  let issues: string[] = [];

  // Check memory usage
  if (systemMetrics.memoryUsage > 90) {
    status = 'critical';
    issues.push('High memory usage');
  } else if (systemMetrics.memoryUsage > 80) {
    if (status === 'healthy') status = 'degraded';
    issues.push('Elevated memory usage');
  }

  // Check CPU usage
  if (systemMetrics.cpuUsage > 90) {
    status = 'critical';
    issues.push('High CPU usage');
  } else if (systemMetrics.cpuUsage > 80) {
    if (status === 'healthy') status = 'degraded';
    issues.push('Elevated CPU usage');
  }

  // Check disk usage
  if (systemMetrics.diskUsage > 95) {
    status = 'critical';
    issues.push('Critical disk usage');
  } else if (systemMetrics.diskUsage > 85) {
    if (status === 'healthy') status = 'degraded';
    issues.push('High disk usage');
  }

  // Check error rate
  if (appMetrics.errorRate > 10) {
    status = 'critical';
    issues.push('High error rate');
  } else if (appMetrics.errorRate > 5) {
    if (status === 'healthy') status = 'degraded';
    issues.push('Elevated error rate');
  }

  // Check response time
  if (appMetrics.responseTime > 1000) {
    status = 'critical';
    issues.push('Slow response time');
  } else if (appMetrics.responseTime > 500) {
    if (status === 'healthy') status = 'degraded';
    issues.push('Elevated response time');
  }

  return {
    status,
    issues
  };
}

async function checkDatabaseHealth() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', message: 'Database connection successful' };
  } catch (error) {
    return { status: 'critical', message: 'Database connection failed' };
  }
}

async function checkAPIHealth() {
  try {
    // Test API endpoints
    const testEndpoints = [
      '/api/health',
      '/api/users',
      '/api/rfqs'
    ];

    const results = await Promise.allSettled(
      testEndpoints.map(endpoint => 
        fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}${endpoint}`)
      )
    );

    const failedEndpoints = results.filter(result => 
      result.status === 'rejected' || 
      (result.status === 'fulfilled' && !result.value.ok)
    );

    if (failedEndpoints.length === 0) {
      return { status: 'healthy', message: 'All API endpoints responding' };
    } else if (failedEndpoints.length < testEndpoints.length) {
      return { status: 'degraded', message: `${failedEndpoints.length} API endpoints failing` };
    } else {
      return { status: 'critical', message: 'All API endpoints failing' };
    }
  } catch (error) {
    return { status: 'critical', message: 'API health check failed' };
  }
}

function checkMemoryHealth(memoryUsage: number) {
  if (memoryUsage > 90) {
    return { status: 'critical', message: `Memory usage at ${memoryUsage}%` };
  } else if (memoryUsage > 80) {
    return { status: 'warning', message: `Memory usage at ${memoryUsage}%` };
  } else {
    return { status: 'healthy', message: `Memory usage at ${memoryUsage}%` };
  }
}

function checkCPUHealth(cpuUsage: number) {
  if (cpuUsage > 90) {
    return { status: 'critical', message: `CPU usage at ${cpuUsage}%` };
  } else if (cpuUsage > 80) {
    return { status: 'warning', message: `CPU usage at ${cpuUsage}%` };
  } else {
    return { status: 'healthy', message: `CPU usage at ${cpuUsage}%` };
  }
}

function checkDiskHealth(diskUsage: number) {
  if (diskUsage > 95) {
    return { status: 'critical', message: `Disk usage at ${diskUsage}%` };
  } else if (diskUsage > 85) {
    return { status: 'warning', message: `Disk usage at ${diskUsage}%` };
  } else {
    return { status: 'healthy', message: `Disk usage at ${diskUsage}%` };
  }
} 