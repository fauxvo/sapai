type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getConfiguredLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL as LogLevel | undefined;
  if (envLevel && envLevel in LEVEL_PRIORITY) return envLevel;
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

function formatLine(
  level: LogLevel,
  module: string,
  message: string,
  data?: Record<string, unknown>,
): string {
  const ts = new Date().toISOString();
  const tag = level.toUpperCase().padEnd(5);
  const suffix = data ? ` ${JSON.stringify(data)}` : '';
  return `[${ts}] [${tag}] [${module}] ${message}${suffix}`;
}

export function createLogger(module: string): Logger {
  const minLevel = getConfiguredLevel();
  const minPriority = LEVEL_PRIORITY[minLevel];

  function shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= minPriority;
  }

  return {
    debug(message, data) {
      if (shouldLog('debug'))
        console.log(formatLine('debug', module, message, data));
    },
    info(message, data) {
      if (shouldLog('info'))
        console.log(formatLine('info', module, message, data));
    },
    warn(message, data) {
      if (shouldLog('warn'))
        console.warn(formatLine('warn', module, message, data));
    },
    error(message, data) {
      if (shouldLog('error'))
        console.error(formatLine('error', module, message, data));
    },
  };
}
