/**
 * Performance monitoring utilities
 */

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
}

export interface PerformanceObserver {
  observe: (target: Element) => void;
  disconnect: () => void;
}

/**
 * Measure render time of a component
 */
export const measureRenderTime = (callback: () => void): number => {
  const start = performance.now();
  callback();
  const end = performance.now();
  return end - start;
};

/**
 * Get memory usage information
 */
export const getMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
  }
  return 0;
};

/**
 * Get CPU usage (mock implementation)
 */
export const getCpuUsage = (): number => {
  // Mock CPU usage - in real implementation, this would use Web Workers or Performance API
  return Math.random() * 100;
};

/**
 * Measure network latency
 */
export const measureNetworkLatency = async (url: string): Promise<number> => {
  const start = performance.now();
  try {
    await fetch(url, { method: 'HEAD' });
    const end = performance.now();
    return end - start;
  } catch {
    return -1; // Error
  }
};

/**
 * Create a performance observer for monitoring
 */
export const createPerformanceObserver = (
  callback: (metrics: PerformanceMetrics) => void
): PerformanceObserver => {
  let isObserving = false;

  const observer = {
    observe: (target: Element) => {
      if (isObserving) return;

      isObserving = true;

      // Mock performance monitoring
      const interval = setInterval(() => {
        const metrics: PerformanceMetrics = {
          renderTime: measureRenderTime(() => {}),
          memoryUsage: getMemoryUsage(),
          cpuUsage: getCpuUsage(),
          networkLatency: 0, // Would be measured separately
        };

        callback(metrics);
      }, 1000);

      // Store interval for cleanup
      (observer as any)._interval = interval;
    },

    disconnect: () => {
      isObserving = false;
      if ((observer as any)._interval) {
        clearInterval((observer as any)._interval);
      }
    },
  };

  return observer;
};

/**
 * Get comprehensive performance metrics
 */
export const getPerformanceMetrics = (): PerformanceMetrics => {
  return {
    renderTime: measureRenderTime(() => {}),
    memoryUsage: getMemoryUsage(),
    cpuUsage: getCpuUsage(),
    networkLatency: 0,
  };
};

/**
 * Performance monitoring class
 */
export class PerformanceMonitor {
  private observers: PerformanceObserver[] = [];
  private metrics: PerformanceMetrics[] = [];

  startMonitoring(target: Element, callback?: (metrics: PerformanceMetrics) => void) {
    const observer = createPerformanceObserver(metrics => {
      this.metrics.push(metrics);
      callback?.(metrics);
    });

    observer.observe(target);
    this.observers.push(observer);
  }

  stopMonitoring() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        renderTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        networkLatency: 0,
      };
    }

    const sum = this.metrics.reduce(
      (acc, metric) => ({
        renderTime: acc.renderTime + metric.renderTime,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        cpuUsage: acc.cpuUsage + metric.cpuUsage,
        networkLatency: acc.networkLatency + metric.networkLatency,
      }),
      { renderTime: 0, memoryUsage: 0, cpuUsage: 0, networkLatency: 0 }
    );

    const count = this.metrics.length;
    return {
      renderTime: sum.renderTime / count,
      memoryUsage: sum.memoryUsage / count,
      cpuUsage: sum.cpuUsage / count,
      networkLatency: sum.networkLatency / count,
    };
  }
}

export default PerformanceMonitor;

/**
 * Measure component render time
 */
export const measureComponentRender = (componentName: string): { end: () => number } => {
  const start = performance.now();
  return {
    end: () => {
      const end = performance.now();
      const duration = end - start;
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
      }
      return duration;
    },
  };
};

/**
 * Measure user timing
 */
export const measureUserTiming = (markName: string) => {
  const start = performance.now();
  performance.mark(`${markName}-start`);
  return {
    end: (measureName: string) => {
      const end = performance.now();
      performance.mark(`${markName}-end`);
      performance.measure(measureName, `${markName}-start`, `${markName}-end`);
      return end - start;
    },
  };
};
