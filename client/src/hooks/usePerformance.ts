import { useEffect, useRef } from 'react';
import { measureComponentRender, measureUserTiming } from '../utils/performance';

interface PerformanceMetrics {
  renderTime: number;
  userTiming: { [key: string]: number };
}

export const usePerformance = (componentName: string) => {
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    userTiming: {},
  });

  useEffect(() => {
    const renderTimer = measureComponentRender(componentName);

    return () => {
      metricsRef.current.renderTime = renderTimer.end();
    };
  }, [componentName]);

  const measureTiming = (markName: string) => {
    const timer = measureUserTiming(markName);
    return {
      end: (measureName: string) => {
        const duration = timer.end(measureName);
        metricsRef.current.userTiming[measureName] = duration;
        return duration;
      },
    };
  };

  const getMetrics = () => {
    return {
      ...metricsRef.current,
      componentName,
    };
  };

  return {
    measureTiming,
    getMetrics,
  };
};

export default usePerformance;
