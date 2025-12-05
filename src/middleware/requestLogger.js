import morgan from 'morgan';
import logger from '../utils/logger.js';

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  if (!req._startAt || !res._startAt) return '-';
  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 + (res._startAt[1] - req._startAt[1]) * 1e-6;
  return ms.toFixed(2);
});

// Create custom morgan format
const morganFormat = ':method :url :status :response-time-ms ms - :res[content-length]';

export const requestLogger = morgan(morganFormat, {
  stream: logger.stream,
  skip: (req, res) => {
    // Skip health check logs in production
    return process.env.NODE_ENV === 'production' && req.url === '/health';
  }
});
