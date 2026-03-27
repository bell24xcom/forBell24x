/**
 * Structured Logging Utility for Bell24h
 */

type LogLevel = 'info' | 'warn' | 'error' | 'security';

interface LogContext {
  userId?: string;
  requestId?: string;
  path?: string;
  [key: string]: any;
}

class Logger {
  private isProd = process.env.NODE_ENV === 'production';

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    
    // Sanitize context: remove sensitive keys
    const sanitizedContext = context ? { ...context } : {};
    const sensitiveKeys = ['password', 'token', 'otp', 'secret', 'apikey', 'auth'];
    
    Object.keys(sanitizedContext).forEach(key => {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(key))) {
        sanitizedContext[key] = '[REDACTED]';
      }
    });

    const payload = {
      timestamp,
      level,
      message,
      ...sanitizedContext
    };

    if (this.isProd) {
      // In production, we log as a single line JSON for log aggregators (ELK, Datadog, etc.)
      console.log(JSON.stringify(payload));
    } else {
      // In development, use colored output or more readable format
      const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : level === 'security' ? '\x1b[35m' : '\x1b[32m';
      console.log(`${color}[${level.toUpperCase()}]\x1b[0m ${message}`, context ? sanitizedContext : '');
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  security(message: string, context?: LogContext) {
    this.log('security', message, context);
  }
}

export const logger = new Logger();
export const authLogger = logger;
