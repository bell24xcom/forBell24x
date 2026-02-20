import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  // Filter out noisy errors
  ignoreErrors: [
    'ResizeObserver loop',
    'Non-Error promise rejection',
    'Loading chunk',
    'ChunkLoadError',
  ],
});
