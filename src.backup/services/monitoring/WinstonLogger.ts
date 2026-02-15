import winston from 'winston';
import 'winston-daily-rotate-file';

export class WinstonLogger {
  private logger: winston.Logger;

  constructor() {
    // Define log format
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    // Define log levels
    const levels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
    };

    // Create the logger
    this.logger = winston.createLogger({
      levels,
      format: logFormat,
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),

        // Daily rotate file transport for errors
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxFiles: '30d',
          maxSize: '20m',
        }),

        // Daily rotate file transport for all logs
        new winston.transports.DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '30d',
          maxSize: '20m',
        }),
      ],
    });

    // Add request logging transport in production
    if (process.env.NODE_ENV === 'production') {
      this.logger.add(
        new winston.transports.DailyRotateFile({
          filename: 'logs/requests-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'http',
          maxFiles: '7d',
          maxSize: '20m',
        })
      );
    }

    // Handle uncaught exceptions and rejections
    this.logger.exceptions.handle(
      new winston.transports.DailyRotateFile({
        filename: 'logs/exceptions-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '30d',
        maxSize: '20m',
      })
    );

    this.logger.rejections.handle(
      new winston.transports.DailyRotateFile({
        filename: 'logs/rejections-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '30d',
        maxSize: '20m',
      })
    );
  }

  public log(level: string, message: string, meta?: any): void {
    this.logger.log(level, message, meta);
  }

  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
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

  public http(message: string, meta?: any): void {
    this.logger.http(message, meta);
  }

  // Request logging middleware
  public requestLogger() {
    return (req: any, res: any, next: any) => {
      const start = process.hrtime();

      res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1e6;

        this.logger.http('HTTP Request', {
          method: req.method,
          url: req.url,
          status: res.statusCode,
          duration: `${duration.toFixed(2)}ms`,
          userAgent: req.get('user-agent'),
          ip: req.ip,
        });
      });

      next();
    };
  }
} 