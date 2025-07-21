
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

interface LogLevel {
  ERROR: number;
  WARN: number;
  INFO: number;
  DEBUG: number;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLogLevel = LOG_LEVELS[config.logging.level.toUpperCase() as keyof LogLevel] || LOG_LEVELS.INFO;

class Logger {
  private shouldLog(level: keyof LogLevel): boolean {
    return LOG_LEVELS[level] <= currentLogLevel;
  }

  private log(level: keyof LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    console.log(`${prefix} ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log('ERROR', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log('WARN', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log('INFO', message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log('DEBUG', message, ...args);
  }
}

export const logger = new Logger();

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  if (!config.logging.enableRequestLogging) {
    return next();
  }

  const start = Date.now();
  const { method, url, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    const message = `${method} ${url} ${statusCode} ${duration}ms - ${ip}`;
    
    if (statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  });

  next();
};
