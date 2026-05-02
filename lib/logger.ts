// lib/logger.ts
import fs from 'fs';
import path from 'path';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private logsDir = path.join(process.cwd(), 'logs');
  private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

  constructor() {
    // Ensure logs directory exists
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Get log level priority (for filtering)
   */
  private getLogLevelPriority(level: LogLevel): number {
    const priorities: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
    return priorities[level];
  }

  /**
   * Format log entry
   */
  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    
    let log = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (context) {
      log += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      log += `\nError: ${error.name}: ${error.message}`;
      if (error.stack) {
        log += `\nStack: ${error.stack}`;
      }
    }
    
    return log;
  }

  /**
   * Write to file
   */
  private writeToFile(filename: string, entry: LogEntry): void {
    try {
      const filepath = path.join(this.logsDir, filename);
      const log = this.formatLog(entry) + '\n' + '─'.repeat(80) + '\n';
      
      fs.appendFileSync(filepath, log);
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    // Check if this level should be logged
    if (this.getLogLevelPriority(level) > this.getLogLevelPriority(this.logLevel)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const entry: LogEntry = {
      timestamp,
      level,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };

    // Console output
    const logFn = console[level] || console.log;
    const formattedMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (context) {
      logFn(formattedMessage, context);
    } else if (error) {
      logFn(formattedMessage, error);
    } else {
      logFn(formattedMessage);
    }

    // Write to files
    if (level === 'error' || level === 'warn') {
      this.writeToFile('error.log', entry);
    }
    
    // Write all logs to main log
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile('app.log', entry);
    }
  }

  // Public methods
  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log('error', message, context, error);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  /**
   * Log with structured context
   */
  logWithContext(
    level: LogLevel,
    message: string,
    context: Record<string, any>
  ): void {
    this.log(level, message, context);
  }
}

// Export singleton instance
export const logger = new Logger();

export default logger;
