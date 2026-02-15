// Performance monitoring utility for Bell24H

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoads: [],
      apiCalls: [],
      errors: [],
      userInteractions: []
    }
    this.init()
  }

  init() {
    // Monitor page load performance
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.recordPageLoad()
      })

      // Monitor API calls
      this.interceptFetch()
      
      // Monitor errors
      window.addEventListener('error', (event) => {
        this.recordError('JavaScript Error', event.error)
      })

      window.addEventListener('unhandledrejection', (event) => {
        this.recordError('Unhandled Promise Rejection', event.reason)
      })
    }
  }

  recordPageLoad() {
    const navigation = performance.getEntriesByType('navigation')[0]
    const paint = performance.getEntriesByType('paint')
    
    const metrics = {
      timestamp: Date.now(),
      url: window.location.href,
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      totalTime: navigation.loadEventEnd - navigation.fetchStart
    }

    this.metrics.pageLoads.push(metrics)
    this.sendMetrics('pageLoad', metrics)
  }

  interceptFetch() {
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      const url = args[0]
      
      try {
        const response = await originalFetch(...args)
        const endTime = performance.now()
        
        this.recordApiCall({
          url: typeof url === 'string' ? url : url.url,
          method: args[1]?.method || 'GET',
          duration: endTime - startTime,
          status: response.status,
          timestamp: Date.now()
        })
        
        return response
      } catch (error) {
        const endTime = performance.now()
        this.recordApiCall({
          url: typeof url === 'string' ? url : url.url,
          method: args[1]?.method || 'GET',
          duration: endTime - startTime,
          status: 'error',
          error: error.message,
          timestamp: Date.now()
        })
        throw error
      }
    }
  }

  recordApiCall(data) {
    this.metrics.apiCalls.push(data)
    this.sendMetrics('apiCall', data)
  }

  recordError(type, error) {
    const errorData = {
      type,
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      url: window.location.href,
      timestamp: Date.now()
    }
    
    this.metrics.errors.push(errorData)
    this.sendMetrics('error', errorData)
  }

  recordUserInteraction(action, details = {}) {
    const interaction = {
      action,
      details,
      url: window.location.href,
      timestamp: Date.now()
    }
    
    this.metrics.userInteractions.push(interaction)
    this.sendMetrics('userInteraction', interaction)
  }

  sendMetrics(type, data) {
    // Send to analytics service (replace with your preferred service)
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Google Analytics, Mixpanel, or custom endpoint
      console.log(`[Performance] ${type}:`, data)
      
      // You can send to your analytics service here
      // this.sendToAnalytics(type, data)
    }
  }

  getMetrics() {
    return this.metrics
  }

  getPerformanceSummary() {
    const pageLoads = this.metrics.pageLoads
    const apiCalls = this.metrics.apiCalls
    const errors = this.metrics.errors

    return {
      totalPageLoads: pageLoads.length,
      averageLoadTime: pageLoads.length > 0 
        ? pageLoads.reduce((sum, p) => sum + p.loadTime, 0) / pageLoads.length 
        : 0,
      totalApiCalls: apiCalls.length,
      averageApiResponseTime: apiCalls.length > 0
        ? apiCalls.reduce((sum, a) => sum + a.duration, 0) / apiCalls.length
        : 0,
      errorCount: errors.length,
      lastError: errors[errors.length - 1] || null
    }
  }
}

// Create global instance
const performanceMonitor = new PerformanceMonitor()

export default performanceMonitor 
