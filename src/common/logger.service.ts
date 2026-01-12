import { Injectable, LoggerService, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppLogger implements LoggerService, OnModuleInit {
  private readonly logDir = 'logs';

  onModuleInit() {
    // logs 디렉토리가 없으면 생성
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private logToFile(level: string, message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const logEntry = JSON.stringify({
      timestamp,
      level,
      context,
      message,
    });

    const combinedLogPath = path.join(this.logDir, 'combined.log');
    fs.appendFileSync(combinedLogPath, logEntry + '\n');

    if (level === 'error') {
      const errorLogPath = path.join(this.logDir, 'error.log');
      fs.appendFileSync(errorLogPath, logEntry + '\n');
    }
  }

  log(message: string, context?: string) {
    this.logToFile('info', message, context);
    console.log(`[${context}] ${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    this.logToFile('error', `${message}\n${trace}`, context);
    console.error(`[${context}] ${message}`);
  }

  warn(message: string, context?: string) {
    this.logToFile('warn', message, context);
    console.warn(`[${context}] ${message}`);
  }
}
