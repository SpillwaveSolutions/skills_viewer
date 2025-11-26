/**
 * Configurable logging utility for the Skill Debugger application.
 * Supports log levels: DEBUG, INFO, WARN, ERROR
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.debug('Detailed debug info', data);
 *   logger.info('General info message');
 *   logger.warn('Warning message');
 *   logger.error('Error message', error);
 *
 * Configuration:
 *   Set LOG_LEVEL environment variable or call logger.setLevel('DEBUG')
 *   Levels (in order of verbosity): DEBUG > INFO > WARN > ERROR > NONE
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'NONE';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
};

// Default to INFO in production, DEBUG in development
const getDefaultLevel = (): LogLevel => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'development') {
    return 'DEBUG';
  }
  return 'INFO';
};

class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(prefix = '📋', defaultLevel?: LogLevel) {
    this.prefix = prefix;
    this.level = defaultLevel ?? getDefaultLevel();
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.level];
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.mmm
    const levelEmoji = {
      DEBUG: '🔍',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
      NONE: '',
    }[level];
    return `${this.prefix} [${timestamp}] ${levelEmoji} ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('DEBUG')) {
      console.log(this.formatMessage('DEBUG', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('INFO')) {
      console.log(this.formatMessage('INFO', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('ERROR')) {
      console.error(this.formatMessage('ERROR', message), ...args);
    }
  }

  /**
   * Create a child logger with a specific prefix for a module/component
   */
  child(prefix: string): Logger {
    const childLogger = new Logger(`${this.prefix}/${prefix}`, this.level);
    return childLogger;
  }
}

// Default application logger instance
export const logger = new Logger('🛠️');

// Pre-configured loggers for specific modules
export const diagramLogger = logger.child('Diagram');
export const backgroundLogger = logger.child('Background');
export const cacheLogger = logger.child('Cache');
export const analysisLogger = logger.child('Analysis');

export default logger;
