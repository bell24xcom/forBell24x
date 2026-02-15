import { Logger } from './logger';

// This file provides a unified monitoring interface that can work with
// different APM providers (New Relic, DataDog, etc.)

// Default to no-op implementations if APM is not configured
let apm = {
  startTransaction: (name: string, type?: string) => ({ end: () => {} }),
  endTransaction: () => {},
  startSegment: (name: string, recordSQL?: boolean) => ({ end: () => {} }),
  captureError: (error: Error) => {},
  addCustomAttribute: (key: string, value: any) => {},
  incrementMetric: (name: string, value?: number) => {},
  recordMetric: (name: string, value: number) => {},
  recordResponseTime: (name: string, responseTimeInMS: number) => {},
  getBrowserTimingHeader: () => '',
  isInitialized: false
};

// Initialize APM based on environment variables
export function initializeMonitoring() {
  const apmProvider = process.env.APM_PROVIDER?.toLowerCase();

  if (!apmProvider) {
    Logger.info('No APM provider configured. Monitoring disabled.');
    return;
  }

  try {
    if (apmProvider === 'newrelic') {
      // Initialize New Relic
      const newrelic = require('newrelic');
      
      apm = {
        startTransaction: (name, type) => newrelic.startTransaction(name, type),
        endTransaction: () => newrelic.endTransaction(),
        startSegment: (name, recordSQL) => newrelic.startSegment(name, recordSQL),
        captureError: (error) => newrelic.noticeError(error),
        addCustomAttribute: (key, value) => newrelic.addCustomAttribute(key, value),
        incrementMetric: (name, value) => newrelic.incrementMetric(name, value),
        recordMetric: (name, value) => newrelic.recordMetric(name, value),
        recordResponseTime: (name, responseTimeInMS) => {
          newrelic.recordMetric(`Custom/${name}`, responseTimeInMS);
        },
        getBrowserTimingHeader: () => newrelic.getBrowserTimingHeader(),
        isInitialized: true
      };
      
      Logger.info('New Relic APM initialized successfully');
    } 
    else if (apmProvider === 'datadog') {
      // Initialize Datadog
      const tracer = require('dd-trace').init();
      
      apm = {
        startTransaction: (name, type) => {
          const span = tracer.startSpan(name, { service: 'bell24h', resource: name });
          return { end: () => span.finish() };
        },
        endTransaction: () => {}, // No direct equivalent
        startSegment: (name, recordSQL) => {
          const span = tracer.startSpan(name);
          return { end: () => span.finish() };
        },
        captureError: (error) => {
          tracer.scope().active().setTag('error', error);
        },
        addCustomAttribute: (key, value) => {
          tracer.scope().active().setTag(key, value);
        },
        incrementMetric: (name, value = 1) => {
          // DataDog metrics are reported differently, this is a simplified version
          const StatsD = require('hot-shots');
          const dogstatsd = new StatsD();
          dogstatsd.increment(name, value);
        },
        recordMetric: (name, value) => {
          const StatsD = require('hot-shots');
          const dogstatsd = new StatsD();
          dogstatsd.gauge(name, value);
        },
        recordResponseTime: (name, responseTimeInMS) => {
          const StatsD = require('hot-shots');
          const dogstatsd = new StatsD();
          dogstatsd.timing(name, responseTimeInMS);
        },
        getBrowserTimingHeader: () => '', // No direct equivalent
        isInitialized: true
      };
      
      Logger.info('Datadog APM initialized successfully');
    }
    else if (apmProvider === 'sentry') {
      // Initialize Sentry
      const Sentry = require('@sentry/node');
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
      });
      
      apm = {
        startTransaction: (name, type) => {
          const transaction = Sentry.startTransaction({ name, op: type || 'custom' });
          Sentry.configureScope(scope => scope.setSpan(transaction));
          return { end: () => transaction.finish() };
        },
        endTransaction: () => {
          // Handled in the end() method of the transaction
        },
        startSegment: (name, recordSQL) => {
          const span = Sentry.getCurrentHub().getScope().getSpan()
            .startChild({ op: name });
          return { end: () => span.finish() };
        },
        captureError: (error) => Sentry.captureException(error),
        addCustomAttribute: (key, value) => Sentry.setTag(key, value),
        incrementMetric: (name, value = 1) => {
          // Sentry doesn't have direct metrics, but we can use tags
          const currentValue = parseInt(Sentry.getTag(name) || '0');
          Sentry.setTag(name, (currentValue + value).toString());
        },
        recordMetric: (name, value) => Sentry.setTag(name, value.toString()),
        recordResponseTime: (name, responseTimeInMS) => Sentry.setTag(`responseTime.${name}`, responseTimeInMS.toString()),
        getBrowserTimingHeader: () => '', // No direct equivalent
        isInitialized: true
      };
      
      Logger.info('Sentry APM initialized successfully');
    }
    else {
      Logger.warn(`Unknown APM provider: ${apmProvider}. Monitoring disabled.`);
    }
  } catch (error) {
    Logger.error('Failed to initialize APM:', error);
  }
}

// Export the monitoring interface
export const monitoring = apm;

// Initialize on module load if not in test environment
if (process.env.NODE_ENV !== 'test') {
  initializeMonitoring();
}
