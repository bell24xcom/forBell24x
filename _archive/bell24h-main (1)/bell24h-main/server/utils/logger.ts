type LogLevel = 'info' | 'warn' | 'error';

export class Logger {
  static info(message: string, ...args: any[]) {
    console.log(`[INFO]`, message, ...args);
  }

  static warn(message: string, ...args: any[]) {
    console.warn(`[WARN]`, message, ...args);
  }

  static error(message: string, ...args: any[]) {
    console.error(`[ERROR]`, message, ...args);
  }
}

// Export a logger instance for backward compatibility
export const logger = {
  info: Logger.info,
  warn: Logger.warn,
  error: Logger.error,
};

// Usage Example:
// Logger.info('User created', { userId: '123' });
