/**
 * Simple logger for client-side code
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private prefix: string = '[Bell24H]';

  constructor(namespace?: string) {
    if (namespace) {
      this.prefix = `[Bell24H:${namespace}]`;
    }
  }

  info(...args: any[]): void {
    this.log('info', ...args);
  }

  warn(...args: any[]): void {
    this.log('warn', ...args);
  }

  error(...args: any[]): void {
    this.log('error', ...args);
  }

  debug(...args: any[]): void {
    // Only log debug messages in development
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', ...args);
    }
  }

  private log(level: LogLevel, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const logMethod =
      level === 'debug' || level === 'info'
        ? console.log
        : level === 'warn'
        ? console.warn
        : console.error;

    logMethod(`${timestamp} ${this.prefix} [${level.toUpperCase()}]`, ...args);

    // You could add additional logging here, like sending to a monitoring service
  }
}

const logger = new Logger();
export default logger;
