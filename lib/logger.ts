/**
 * Structured Logger for Bell24h.com
 * Production-ready logging with timestamps, namespaces, and log levels.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  namespace: string;
  message: string;
  data?: any;
}

function formatLog(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.namespace}] ${entry.message}`;
  return entry.data ? `${base} ${JSON.stringify(entry.data)}` : base;
}

function log(level: LogLevel, namespace: string, message: string, data?: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    namespace,
    message,
    data,
  };

  const formatted = formatLog(entry);

  switch (level) {
    case 'error': console.error(formatted); break;
    case 'warn':  console.warn(formatted);  break;
    case 'debug':
      if (process.env.NODE_ENV !== 'production') console.debug(formatted);
      break;
    default: console.log(formatted);
  }
}

/**
 * Create a namespaced logger instance
 */
export function createLogger(namespace: string) {
  return {
    info:  (message: string, data?: any) => log('info',  namespace, message, data),
    warn:  (message: string, data?: any) => log('warn',  namespace, message, data),
    error: (message: string, data?: any) => log('error', namespace, message, data),
    debug: (message: string, data?: any) => log('debug', namespace, message, data),
  };
}

// Default logger for quick use
export const logger = createLogger('bell24h');

// Pre-created loggers for key modules
export const authLogger   = createLogger('auth');
export const apiLogger    = createLogger('api');
export const dbLogger     = createLogger('db');
export const aiLogger     = createLogger('ai');
export const paymentLogger = createLogger('payment');
