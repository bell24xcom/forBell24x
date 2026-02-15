import * as Sentry from '@sentry/node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { WinstonLogger } from './WinstonLogger';

export class MonitoringService {
  private static instance: MonitoringService;
  private logger: WinstonLogger;
  private meter: MeterProvider;
  private metrics: {
    requestDuration: any;
    errorCount: any;
    activeUsers: any;
    shippingRequests: any;
    rfqRequests: any;
  };

  private constructor() {
    // Initialize Sentry
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express(),
      ],
    });

    // Initialize Winston Logger
    this.logger = new WinstonLogger();

    // Initialize Prometheus Exporter
    const exporter = new PrometheusExporter({
      port: 9464,
      endpoint: '/metrics',
    });

    // Initialize Meter Provider
    this.meter = new MeterProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'bell24h',
      }),
    });

    // Register the exporter
    this.meter.addMetricReader(exporter);

    // Initialize metrics
    const meter = this.meter.getMeter('bell24h-metrics');
    this.metrics = {
      requestDuration: meter.createHistogram('request_duration_seconds', {
        description: 'Duration of HTTP requests in seconds',
      }),
      errorCount: meter.createCounter('error_count', {
        description: 'Count of errors by type',
      }),
      activeUsers: meter.createUpDownCounter('active_users', {
        description: 'Number of active users',
      }),
      shippingRequests: meter.createCounter('shipping_requests_total', {
        description: 'Total number of shipping requests',
      }),
      rfqRequests: meter.createCounter('rfq_requests_total', {
        description: 'Total number of RFQ requests',
      }),
    };
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Error Tracking Methods
  public captureException(error: Error, context?: any): void {
    Sentry.captureException(error, {
      extra: context,
    });
    this.logger.error('Exception captured', { error, context });
    this.metrics.errorCount.add(1, { type: error.name });
  }

  public captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    Sentry.captureMessage(message, level);
    this.logger.log(level, message);
  }

  // Performance Monitoring Methods
  public startRequestTimer(): () => void {
    const startTime = process.hrtime();
    return () => {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds + nanoseconds / 1e9;
      this.metrics.requestDuration.record(duration);
    };
  }

  public trackActiveUser(userId: string, isActive: boolean): void {
    this.metrics.activeUsers.add(isActive ? 1 : -1, { userId });
  }

  public trackShippingRequest(): void {
    this.metrics.shippingRequests.add(1);
  }

  public trackRFQRequest(): void {
    this.metrics.rfqRequests.add(1);
  }

  // Logging Methods
  public log(level: string, message: string, meta?: any): void {
    this.logger.log(level, message, meta);
  }

  public error(message: string, error?: Error, meta?: any): void {
    this.logger.error(message, { error, ...meta });
    if (error) {
      this.captureException(error, meta);
    }
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  // Health Check Methods
  public async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      database: boolean;
      redis: boolean;
      externalServices: {
        [key: string]: boolean;
      };
    };
  }> {
    try {
      // Check database connection
      const dbStatus = await this.checkDatabaseConnection();

      // Check Redis connection
      const redisStatus = await this.checkRedisConnection();

      // Check external services
      const externalServices = await this.checkExternalServices();

      const isHealthy = dbStatus && redisStatus && 
        Object.values(externalServices).every(status => status);

      return {
        status: isHealthy ? 'healthy' : 'degraded',
        details: {
          database: dbStatus,
          redis: redisStatus,
          externalServices,
        },
      };
    } catch (error) {
      this.captureException(error as Error);
      return {
        status: 'unhealthy',
        details: {
          database: false,
          redis: false,
          externalServices: {},
        },
      };
    }
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      // Implement database connection check
      return true;
    } catch (error) {
      this.captureException(error as Error);
      return false;
    }
  }

  private async checkRedisConnection(): Promise<boolean> {
    try {
      // Implement Redis connection check
      return true;
    } catch (error) {
      this.captureException(error as Error);
      return false;
    }
  }

  private async checkExternalServices(): Promise<{ [key: string]: boolean }> {
    try {
      // Implement external services health check
      return {
        shippingAPI: true,
        paymentGateway: true,
        emailService: true,
      };
    } catch (error) {
      this.captureException(error as Error);
      return {
        shippingAPI: false,
        paymentGateway: false,
        emailService: false,
      };
    }
  }
} 