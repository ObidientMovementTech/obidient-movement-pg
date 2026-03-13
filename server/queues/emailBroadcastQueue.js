import { Queue } from 'bullmq';
import dotenv from 'dotenv';
import { createRedisClient, getBullMqPrefix } from '../config/redis.js';
import { logger } from '../middlewares/security.middleware.js';

dotenv.config();

const QUEUE_NAME = 'email-broadcast';
const prefix = getBullMqPrefix();

const buildQueueOptions = () => {
  return {
    connection: createRedisClient(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 15000 // 15s backoff — generous for email rate limits
      },
      removeOnComplete: 500, // keep last 500 completed jobs
      removeOnFail: false
    },
    prefix
  };
};

const emailBroadcastQueue = new Queue(QUEUE_NAME, buildQueueOptions());

emailBroadcastQueue.waitUntilReady()
  .then(() => logger.info('Email broadcast queue ready'))
  .catch((error) => {
    logger.error('Failed to initialize email broadcast queue', {
      message: error.message,
      stack: error.stack
    });
  });

export default emailBroadcastQueue;
export { QUEUE_NAME };
