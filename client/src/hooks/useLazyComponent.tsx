import { useState, useEffect, ComponentType, LazyExoticComponent, lazy } from 'react';

type LazyComponent<T extends ComponentType<any>> =
  | LazyExoticComponent<T>
  | (() => Promise<{ default: T }>);

export function useLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: React.ReactNode = null
): [LazyExoticComponent<T> | null, boolean] {
  const [Component, setComponent] = useState<LazyExoticComponent<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
<<<<<<< HEAD
        const module = await importFn();
        if (isMounted) {
          const LazyComponent = lazy(() => Promise.resolve(module));
=======
        const moduleData = await importFn();
        if (isMounted) {
          const LazyComponent = lazy(() => Promise.resolve(moduleData));
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
          setComponent(LazyComponent);
        }
      } catch (error) {
        console.error('Failed to load component:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, [importFn]);

  return [Component, isLoading];
}
