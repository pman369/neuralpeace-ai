/**
 * Structured Logging Utility for Supabase Edge Functions
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  requestId?: string;
  userId?: string;
}

export class Logger {
  private requestId: string;

  constructor(requestId?: string) {
    this.requestId = requestId || crypto.randomUUID();
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      requestId: this.requestId,
    };

    // In a production environment, you might send this to Logflare, Axiom, or similar.
    // For now, we output structured JSON to the console which Supabase captures.
    console.log(JSON.stringify(entry));
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context);
  }
}

export const logger = new Logger();
