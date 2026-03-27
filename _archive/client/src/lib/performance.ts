<<<<<<< HEAD
// Performance monitoring utilities for Bell24H
export const measurePageLoad = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`🚀 Page load time: ${loadTime.toFixed(2)}ms`);

      // Core Web Vitals tracking
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        const metrics = {
          loadTime: loadTime,
          domContentLoaded:
            navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstByte: navigation.responseStart - navigation.requestStart,
          domInteractive: navigation.domInteractive - navigation.startTime,
          domComplete: navigation.domComplete - navigation.startTime,
        };

        console.log('📊 Performance Metrics:', metrics);

        // Alert if load time exceeds target
        if (loadTime > 3000) {
          console.warn('⚠️ Page load time exceeds 3 seconds:', loadTime);
        } else {
          console.log('✅ Page load time within target (<3s)');
        }

        // Report to analytics in production
        if (process.env.NODE_ENV === 'production') {
          // TODO: Send to analytics service
          reportToAnalytics('page_load', metrics);
        }
      }
    });
  }
};

export const measureComponentRender = (componentName: string) => {
  const start = performance.now();
  return () => {
    const end = performance.now();
    const renderTime = end - start;
    console.log(`⚡ ${componentName} render time: ${renderTime.toFixed(2)}ms`);

    if (renderTime > 100) {
      console.warn(`⚠️ Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }

    return renderTime;
  };
};

export const measureAPICall = (endpoint: string) => {
  const start = performance.now();
  return () => {
    const end = performance.now();
    const apiTime = end - start;
    console.log(`🔌 API ${endpoint} response time: ${apiTime.toFixed(2)}ms`);

    if (apiTime > 1000) {
      console.warn(`⚠️ Slow API response: ${endpoint} took ${apiTime.toFixed(2)}ms`);
    }

    return apiTime;
  };
};

export const measureBundleSize = () => {
  if (typeof window !== 'undefined') {
    // Monitor JavaScript bundle loading
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.name.includes('.js')) {
          const size = (entry as any).transferSize || 0;
          console.log(`📦 Bundle ${entry.name}: ${(size / 1024).toFixed(2)}KB`);

          if (size > 200 * 1024) {
            // 200KB threshold
            console.warn(
              `⚠️ Large bundle detected: ${entry.name} is ${(size / 1024).toFixed(2)}KB`
            );
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }
};

// Analytics reporting (placeholder)
const reportToAnalytics = (event: string, data: any) => {
  // In production, this would send to your analytics service
  console.log(`📈 Analytics Event: ${event}`, data);
};

// Core Web Vitals monitoring
export const initCoreWebVitals = () => {
  if (typeof window !== 'undefined') {
    // Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcp = lastEntry.startTime;
      console.log(`🎯 LCP: ${lcp.toFixed(2)}ms`);

      if (lcp > 2500) {
        console.warn('⚠️ LCP exceeds 2.5s threshold');
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID) monitoring
    const fidObserver = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        const fid = (entry as any).processingStart - entry.startTime;
        console.log(`⚡ FID: ${fid.toFixed(2)}ms`);

        if (fid > 100) {
          console.warn('⚠️ FID exceeds 100ms threshold');
        }
      });
    });

    fidObserver.observe({ entryTypes: ['first-input'] });
  }
};

// Initialize all performance monitoring
export const initPerformanceMonitoring = () => {
  measurePageLoad();
  measureBundleSize();
  initCoreWebVitals();
};
=======
// Performance monitoring and optimization utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric(entry.name, entry.startTime);
        }
      });
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    // Monitor LCP (Largest Contentful Paint)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (error) {
      console.warn('LCP Observer not supported:', error);
    }

    // Monitor FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('FID', (entry as any).processingStart - entry.startTime);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (error) {
      console.warn('FID Observer not supported:', error);
    }

    // Monitor CLS (Cumulative Layout Shift)
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            this.recordMetric('CLS', (entry as any).value);
        }
      }
    });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (error) {
      console.warn('CLS Observer not supported:', error);
    }
  }

  recordMetric(name: string, value: number) {
    this.metrics.set(name, value);
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(name, value);
    }
  }

  private sendToAnalytics(name: string, value: number) {
    // Send to your analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value,
        event_category: 'Performance',
      });
    }
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  getCoreWebVitals() {
    return {
      LCP: this.metrics.get('LCP') || 0,
      FID: this.metrics.get('FID') || 0,
      CLS: this.metrics.get('CLS') || 0,
      FCP: this.metrics.get('first-contentful-paint') || 0,
      TTFB: this.metrics.get('time-to-first-byte') || 0,
    };
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    recordMetric: monitor.recordMetric.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    getCoreWebVitals: monitor.getCoreWebVitals.bind(monitor),
  };
}

// Utility functions for performance optimization
export const performanceUtils = {
  // Debounce function for performance
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for performance
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Lazy load images
  lazyLoadImage(img: HTMLImageElement, src: string) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  },

  // Preload critical resources
  preloadResource(href: string, as: string) {
    if (typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  // Measure function execution time
  measureTime<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    PerformanceMonitor.getInstance().recordMetric(name, end - start);
    return result;
  },
};
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
