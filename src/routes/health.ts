import { Router } from 'express';
import { MonitoringService } from '../services/monitoring/MonitoringService';

const router = Router();
const monitoringService = MonitoringService.getInstance();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await monitoringService.checkHealth();
    res.status(healthStatus.status === 'healthy' ? 200 : 503).json(healthStatus);
  } catch (error) {
    monitoringService.captureException(error as Error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Failed to check system health',
    });
  }
});

// Metrics endpoint for Prometheus
router.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.end('# Metrics endpoint is handled by Prometheus exporter');
});

// Detailed system status
router.get('/status', async (req, res) => {
  try {
    const healthStatus = await monitoringService.checkHealth();
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
    };

    res.json({
      health: healthStatus,
      system: systemInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    monitoringService.captureException(error as Error);
    res.status(500).json({
      error: 'Failed to get system status',
    });
  }
});

export default router; 