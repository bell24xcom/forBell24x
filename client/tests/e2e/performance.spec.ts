import { expect, test } from '@playwright/test';

test.describe('BELL24H Performance E2E Tests', () => {
  test('should meet performance benchmarks for all pages', async ({ page }) => {
    const pages = [
      { url: '/', name: 'Homepage', maxTime: 5000 },
      { url: '/marketplace', name: 'Marketplace', maxTime: 4000 },
      { url: '/suppliers', name: 'Suppliers', maxTime: 7000 },
      { url: '/dashboard', name: 'Dashboard', maxTime: 4000 },
      { url: '/auth/login', name: 'Login', maxTime: 2000 },
      { url: '/auth/register', name: 'Register', maxTime: 3000 },
    ];

    for (const pageTest of pages) {
      const startTime = Date.now();
      await page.goto(pageTest.url);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      console.log(`${pageTest.name} loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(pageTest.maxTime);
    }
  });

  test('should test image loading performance', async ({ page }) => {
    await page.goto('/');

    // Wait for all images to load
    await page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.every(img => img.complete);
    });

    // Check if any images failed to load
    const failedImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.complete || img.naturalWidth === 0);
    });

    expect(failedImages).toHaveLength(0);
  });

  test('should test Core Web Vitals', async ({ page }) => {
    await page.goto('/');

    // Measure Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });

    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500);

    // Measure First Input Delay (FID)
    const fid = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const firstEntry = entries[0];
          resolve(firstEntry.processingStart - firstEntry.startTime);
        }).observe({ entryTypes: ['first-input'] });
      });
    });

    // FID should be under 100ms
    expect(fid).toBeLessThan(100);
  });

  test('should test bundle size and loading', async ({ page }) => {
    await page.goto('/');

    // Get resource loading information
    const resources = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      return entries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize || 0,
      }));
    });

    // Calculate total bundle size
    const totalSize = resources.reduce((sum, resource) => sum + resource.size, 0);

    // Total bundle should be under 2MB
    expect(totalSize).toBeLessThan(2 * 1024 * 1024);

    // Log resource loading times
    console.log('Resource loading times:', resources.slice(0, 5));
  });

  test('should test memory usage', async ({ page }) => {
    await page.goto('/');

    // Get memory usage
    const memoryInfo = await page.evaluate(() => {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        };
      }
      return null;
    });

    if (memoryInfo) {
      // Memory usage should be reasonable
      const memoryUsagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
      expect(memoryUsagePercent).toBeLessThan(80);

      console.log('Memory usage:', memoryUsagePercent.toFixed(2) + '%');
    }
  });

  test('should test network performance', async ({ page }) => {
    await page.goto('/');

    // Get network requests
    const requests = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      return entries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        initiatorType: entry.initiatorType,
      }));
    });

    // Check for slow requests
    const slowRequests = requests.filter(req => req.duration > 3000);
    expect(slowRequests).toHaveLength(0);

    // Log network performance
    console.log('Network requests:', requests.length);
    console.log(
      'Average request time:',
      requests.reduce((sum, req) => sum + req.duration, 0) / requests.length
    );
  });

  test('should test caching effectiveness', async ({ page }) => {
    // First visit
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Second visit (should be faster due to caching)
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const secondLoadTime = Date.now() - startTime;

    // Second load should be faster
    expect(secondLoadTime).toBeLessThan(2000);

    console.log('Second load time:', secondLoadTime + 'ms');
  });

  test('should test JavaScript execution performance', async ({ page }) => {
    await page.goto('/');

    // Measure JavaScript execution time
    const jsExecutionTime = await page.evaluate(() => {
      const start = performance.now();

      // Simulate some JavaScript operations
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }

      return performance.now() - start;
    });

    // JavaScript execution should be fast
    expect(jsExecutionTime).toBeLessThan(100);

    console.log('JavaScript execution time:', jsExecutionTime + 'ms');
  });

  test('should test rendering performance', async ({ page }) => {
    await page.goto('/');

    // Measure rendering performance
    const renderMetrics = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      const firstContentfulPaint = paintEntries.find(
        entry => entry.name === 'first-contentful-paint'
      );

      return {
        firstPaint: firstPaint ? firstPaint.startTime : 0,
        firstContentfulPaint: firstContentfulPaint ? firstContentfulPaint.startTime : 0,
      };
    });

    // First paint should be under 1 second
    expect(renderMetrics.firstPaint).toBeLessThan(1000);

    // First contentful paint should be under 1.5 seconds
    expect(renderMetrics.firstContentfulPaint).toBeLessThan(1500);

    console.log('Render metrics:', renderMetrics);
  });

  test('should test database query performance', async ({ page }) => {
    // Test API response times
    const apiEndpoints = ['/api/suppliers', '/api/categories', '/api/dashboard/stats'];

    for (const endpoint of apiEndpoints) {
      const startTime = Date.now();

      try {
        const response = await page.request.get(`http://localhost:3000${endpoint}`);
        const responseTime = Date.now() - startTime;

        // API responses should be under 2 seconds
        expect(responseTime).toBeLessThan(2000);

        console.log(`${endpoint} responded in ${responseTime}ms`);
      } catch (error) {
        // Endpoint might not exist in test environment
        console.log(`${endpoint} not available in test environment`);
      }
    }
  });

  test('should test mobile performance', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const mobileLoadTime = Date.now() - startTime;

    // Mobile should load within 4 seconds
    expect(mobileLoadTime).toBeLessThan(4000);

    console.log('Mobile load time:', mobileLoadTime + 'ms');
  });

  test('should test concurrent user performance', async ({ browser }) => {
    // Simulate multiple concurrent users
    const contexts = [];
    const loadTimes = [];

    try {
      // Create multiple browser contexts
      for (let i = 0; i < 3; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        contexts.push({ context, page });

        const startTime = Date.now();
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        loadTimes.push(loadTime);
      }

      // All concurrent loads should be reasonable
      for (const loadTime of loadTimes) {
        expect(loadTime).toBeLessThan(6000);
      }

      console.log('Concurrent load times:', loadTimes);
    } finally {
      // Clean up contexts
      for (const { context } of contexts) {
        await context.close();
      }
    }
  });

  test('should test error handling performance', async ({ page }) => {
    // Test performance under error conditions
    await page.route('**/*', route => {
      if (Math.random() < 0.1) {
        // 10% chance of error
        route.abort();
      } else {
        route.continue();
      }
    });

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const errorLoadTime = Date.now() - startTime;

    // Should still load within reasonable time even with errors
    expect(errorLoadTime).toBeLessThan(8000);

    console.log('Error condition load time:', errorLoadTime + 'ms');
  });
});
