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

// Resolve level lazily from process.env to avoid importing env config at module load
// (which would fail in test environments that don't set SAP_* vars).
// Note: cached after first access — runtime changes to LOG_LEVEL won't take effect.
let _resolvedLevel: LogLevel | null = null;

function getConfiguredLevel(): LogLevel {
  if (_resolvedLevel) return _resolvedLevel;
  const envLevel = process.env.LOG_LEVEL as LogLevel | undefined;
  if (envLevel && envLevel in LEVEL_PRIORITY) {
    _resolvedLevel = envLevel;
    return _resolvedLevel;
  }
  _resolvedLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
  return _resolvedLevel;
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
  function shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[getConfiguredLevel()];
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
