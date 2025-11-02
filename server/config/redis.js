import Redis from 'ioredis';
import dotenv from 'dotenv';
import { logger } from '../middlewares/security.middleware.js';

dotenv.config();

const DEFAULT_REDIS_URL = 'redis://127.0.0.1:6379';

const baseOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true
};

export const createRedisClient = () => {
  const redisUrl = process.env.REDIS_URL || DEFAULT_REDIS_URL;
  const client = new Redis(redisUrl, baseOptions);

  client.on('error', (error) => {
    logger.error('Redis connection error', {
      message: error.message,
      stack: error.stack
    });
  });

  client.on('connect', () => {
    logger.info('Redis connected', { redisUrl });
  });

  return client;
};

export const getBullMqPrefix = () => process.env.BULLMQ_PREFIX || 'bulk-communications';

export default createRedisClient;
