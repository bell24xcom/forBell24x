/**
 * Production Performance Monitoring System
 * Tracks metrics for 1000+ concurrent users
 */

import { NextRequest, NextResponse } from 'next/server'

// Performance metrics interface
interface PerformanceMetrics {
  timestamp: number
  requestId: string
  method: string
  url: string
  statusCode: number
  responseTime: number
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage: NodeJS.CpuUsage
  userAgent: string
  ip: string
}

// Monitoring configuration
const MONITORING_CONFIG = {
  enabled: process.env.NODE_ENV === 'production',
  sampleRate: 0.1, // Sample 10% of requests
  maxMetrics: 10000, // Keep last 10k metrics in memory
  alertThresholds: {
    responseTime: 5000, // 5 seconds
    memoryUsage: 0.9, // 90% of available memory
    errorRate: 0.05, // 5% error rate
  },
}

// In-memory metrics storage (in production, use Redis or database)
let metrics: PerformanceMetrics[] = []
let errorCount = 0
let totalRequests = 0

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  return forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
}

/**
 * Record performance metrics
 */
export function recordMetrics(
  request: NextRequest,
  response: NextResponse,
  startTime: number
) {
  if (!MONITORING_CONFIG.enabled) return

  // Sample rate check
  if (Math.random() > MONITORING_CONFIG.sampleRate) return

  const endTime = Date.now()
  const responseTime = endTime - startTime

  const metric: PerformanceMetrics = {
    timestamp: endTime,
    requestId: generateRequestId(),
    method: request.method,
    url: request.nextUrl.pathname,
    statusCode: response.status,
    responseTime,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    userAgent: request.headers.get('user-agent') || 'unknown',
    ip: getClientIP(request),
  }

  // Add to metrics array
  metrics.push(metric)

  // Keep only recent metrics
  if (metrics.length > MONITORING_CONFIG.maxMetrics) {
    metrics = metrics.slice(-MONITORING_CONFIG.maxMetrics)
  }

  // Update counters
  totalRequests++
  if (response.status >= 400) {
    errorCount++
  }

  // Check for alerts
  checkAlerts(metric)
}

/**
 * Check for performance alerts
 */
function checkAlerts(metric: PerformanceMetrics) {
  const alerts = []

  // Response time alert
  if (metric.responseTime > MONITORING_CONFIG.alertThresholds.responseTime) {
    alerts.push({
      type: 'slow_response',
      message: `Slow response detected: ${metric.responseTime}ms for ${metric.url}`,
      severity: 'warning',
      metric,
    })
  }

  // Memory usage alert
  const memoryUsagePercent = metric.memoryUsage.heapUsed / metric.memoryUsage.heapTotal
  if (memoryUsagePercent > MONITORING_CONFIG.alertThresholds.memoryUsage) {
    alerts.push({
      type: 'high_memory',
      message: `High memory usage: ${(memoryUsagePercent * 100).toFixed(2)}%`,
      severity: 'critical',
      metric,
    })
  }

  // Error rate alert
  const errorRate = errorCount / totalRequests
  if (errorRate > MONITORING_CONFIG.alertThresholds.errorRate) {
    alerts.push({
      type: 'high_error_rate',
      message: `High error rate: ${(errorRate * 100).toFixed(2)}%`,
      severity: 'critical',
      metric,
    })
  }

  // Send alerts (in production, send to monitoring service)
  alerts.forEach(alert => {
    console.warn(`[ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`)
    // TODO: Send to Sentry, DataDog, or other monitoring service
  })
}

/**
 * Get performance statistics
 */
export function getPerformanceStats() {
  if (metrics.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    }
  }

  const recentMetrics = metrics.slice(-1000) // Last 1000 requests
  const responseTimes = recentMetrics.map(m => m.responseTime)
  const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length

  return {
    totalRequests,
    averageResponseTime: Math.round(averageResponseTime),
    errorRate: totalRequests > 0 ? errorCount / totalRequests : 0,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    recentMetrics: recentMetrics.length,
  }
}

/**
 * Get detailed metrics for analysis
 */
export function getDetailedMetrics() {
  return {
    metrics: metrics.slice(-100), // Last 100 metrics
    stats: getPerformanceStats(),
    config: MONITORING_CONFIG,
  }
}

/**
 * Clear old metrics
 */
export function clearOldMetrics() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000)
  metrics = metrics.filter(m => m.timestamp > oneHourAgo)
}

/**
 * Health check endpoint
 */
export function healthCheck() {
  const stats = getPerformanceStats()
  
  const isHealthy = 
    stats.averageResponseTime < MONITORING_CONFIG.alertThresholds.responseTime &&
    stats.errorRate < MONITORING_CONFIG.alertThresholds.errorRate

  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    stats,
  }
}

// Clear old metrics every hour
setInterval(clearOldMetrics, 60 * 60 * 1000)
