import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { createClient } from 'redis';
import { logAuditEvent } from '../utils/auditLogger.js';

let sharedStore;
const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
  const redisClient = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    },
  });

  redisClient.on('error', (err) => {
    logAuditEvent('security.ratelimit.redis_error', { message: err?.message }, 'warn');
  });

  redisClient.on('ready', () => {
    logAuditEvent('security.ratelimit.redis_ready', {});
  });

  redisClient.connect().catch((err) => {
    logAuditEvent('security.ratelimit.redis_unavailable', { message: err?.message }, 'warn');
  });

  sharedStore = new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'ghumfir:ratelimit:',
  });
}

export const createRateLimiter = (options) => {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
    ...(sharedStore ? { store: sharedStore } : {}),
  });
};
