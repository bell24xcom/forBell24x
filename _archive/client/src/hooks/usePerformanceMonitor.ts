import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  isOptimal: boolean;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    isOptimal: true,
  });

  useEffect(() => {
    // Monitor performance metrics
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();

      entries.forEach(entry => {
        if (entry.entryType === 'navigation') {
          const nav = entry as PerformanceNavigationTiming;
          setMetrics(prev => ({
            ...prev,
            loadTime: nav.loadEventEnd - nav.loadEventStart,
            isOptimal: nav.loadEventEnd - nav.loadEventStart < 3000,
          }));
        }

        if (entry.entryType === 'measure') {
          setMetrics(prev => ({
            ...prev,
            renderTime: entry.duration,
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'measure'] });

    // Monitor memory usage
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit,
      }));
    }

    return () => observer.disconnect();
  }, []);

  return metrics;
};
