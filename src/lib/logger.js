/**
 * @description 
 * @author Muhamad Hazmi Alfarizqi
 */

/**
 * Standard Logger with Pretty Print for SIMPASAR
 */

const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bright: '\x1b[1m',
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
};

function formatTimestamp() {
  const now = new Date();
  return now.toISOString();
}

function formatArg(arg) {
  if (arg instanceof Error) {
    return `${arg.message}\n${arg.stack}`;
  }
  if (typeof arg === 'object' && arg !== null) {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

export class Logger {
  constructor(context = '') {
    this.context = context;
  }

  child(context) {
    const nextContext = this.context ? `${this.context}:${context}` : context;
    return new Logger(nextContext);
  }

  _log(level, ...args) {
    const timestamp = formatTimestamp();
    const color = COLORS[level] || COLORS.reset;
    const levelLabel = level.toUpperCase().padStart(5);
    const contextPrefix = this.context ? ` [${this.context}]` : '';

    const formattedArgs = args.map(formatArg).join(' ');
    const header = `${COLORS.dim}${timestamp}${COLORS.reset} ${color}${COLORS.bright}[${levelLabel}]${COLORS.reset}${COLORS.bright}${contextPrefix}${COLORS.reset}`;

    if (level === 'error') {
      console.error(`${header} ${formattedArgs}`);
    } else if (level === 'warn') {
      console.warn(`${header} ${formattedArgs}`);
    } else {
      console.log(`${header} ${formattedArgs}`);
    }
  }

  debug(...args) {
    this._log('debug', ...args);
  }

  info(...args) {
    this._log('info', ...args);
  }

  warn(...args) {
    this._log('warn', ...args);
  }

  error(...args) {
    this._log('error', ...args);
  }
}

export const logger = new Logger();
export default logger;
